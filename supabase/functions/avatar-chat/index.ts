import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { requireUser, jsonResponse, errorResponse } from "../_shared/auth.ts";
import { getOpenAIKey, fetchWithTimeout } from "../_shared/openai.ts";
import {
  AVATAR_IDS,
  RESPONSE_SCHEMA,
  buildHistory,
  buildReferenceMessage,
  buildSystemPrompt,
  parseModelOutput,
  type AvatarId,
  type DailyLogCtx,
  type UserCtx,
} from "../_shared/prompts.ts";

const MAX_MESSAGE_CHARS = 2000;
const HISTORY_ROWS = 40; // filas a traer; luego se juntan partes y quedan las últimas 12 rondas
const HISTORY_MESSAGES = 24;
const RATE_LIMIT_PER_HOUR = 30;
const OPENAI_TIMEOUT_MS = 20_000;
const EMBEDDING_TIMEOUT_MS = 8_000;
const RAG_MATCH_COUNT = 4;
const RAG_THRESHOLD = 0.3;
const RAG_MIN_CHARS = 12;
const CHAT_MODEL = Deno.env.get("OPENAI_CHAT_MODEL") ?? "gpt-4o-mini";

const AVATAR_RAG_TABLES: Record<AvatarId, string> = {
  TINO: "rag_tino",
  ZAHIA: "rag_zahia",
  ROMA: "rag_roma",
};

const GREETING = /^\s*(hola+|buenas?|buen[oa]s (dias|tardes|noches)|hey|ey|que tal|gracias|ok|dale|listo|chau)\W*$/i;

// deno-lint-ignore no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;
// deno-lint-ignore no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;

const MISSING_COLUMN = "42703";
const FK_VIOLATION = "23503";
const UNIQUE_VIOLATION = "23505";

async function getEmbedding(text: string, apiKey: string): Promise<number[]> {
  try {
    const res = await fetchWithTimeout("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
    }, EMBEDDING_TIMEOUT_MS);
    if (!res.ok) {
      console.error("Embedding error:", res.status, await res.text());
      return [];
    }
    const data = await res.json();
    return data.data?.[0]?.embedding ?? [];
  } catch (e) {
    console.error("Embedding failed:", (e as Error).message);
    return [];
  }
}

async function getRagChunks(db: Db, avatar: AvatarId, message: string, apiKey: string): Promise<string[]> {
  if (message.trim().length < RAG_MIN_CHARS || GREETING.test(message)) return [];
  const embedding = await getEmbedding(message, apiKey);
  if (!embedding.length) return [];
  const { data, error } = await db.rpc("match_rag_documents", {
    _table_name: AVATAR_RAG_TABLES[avatar],
    _query_embedding: JSON.stringify(embedding),
    _match_count: RAG_MATCH_COUNT,
    _match_threshold: RAG_THRESHOLD,
  });
  if (error) {
    console.error("RAG error:", error.message);
    return [];
  }
  return ((data ?? []) as Row[]).map((d) => String(d.content)).filter(Boolean);
}

const ROLE_PRIORITY = ["parent", "player", "coach", "club_admin", "admin"];

function ageFrom(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age--;
  return age >= 0 && age < 120 ? age : null;
}

async function getUserContext(db: Db, userId: string): Promise<UserCtx> {
  try {
    const [profile, roles, logs] = await Promise.all([
      db.from("profiles").select("full_name, date_of_birth, sport, club_name").eq("id", userId).maybeSingle(),
      db.from("user_roles").select("role").eq("user_id", userId),
      db.from("daily_logs")
        .select("log_date, sleep_hours, hydration_liters, energy_level, pain_level, pain_location, mood, trained, training_duration_min")
        .eq("user_id", userId)
        .order("log_date", { ascending: false })
        .limit(3),
    ]);
    const p = (profile.data ?? {}) as Row;
    const roleList = ((roles.data ?? []) as Row[]).map((r) => String(r.role));
    return {
      firstName: typeof p.full_name === "string" ? p.full_name.trim().split(/\s+/)[0] || null : null,
      age: ageFrom(p.date_of_birth),
      sport: p.sport ?? null,
      club: p.club_name ?? null,
      role: ROLE_PRIORITY.find((r) => roleList.includes(r)) ?? roleList[0] ?? null,
      logs: (logs.data ?? []) as DailyLogCtx[],
    };
  } catch (e) {
    console.error("User context failed:", (e as Error).message);
    return {};
  }
}

/** Últimas filas de la conversación (de la más nueva a la más vieja). Funciona aunque falte la columna client_message_id. */
async function getRecentRows(db: Db, conversationId: string): Promise<{ rows: Row[]; hasClientId: boolean }> {
  const q = (cols: string) =>
    db.from("ai_messages").select(cols).eq("conversation_id", conversationId)
      .order("created_at", { ascending: false }).limit(HISTORY_ROWS);
  let res = await q("id, role, content, created_at, client_message_id");
  let hasClientId = true;
  if (res.error?.code === MISSING_COLUMN) {
    hasClientId = false;
    res = await q("id, role, content, created_at");
  }
  if (res.error) console.error("History error:", res.error.message);
  return { rows: ((res.data ?? []) as Row[]), hasClientId };
}

async function getRecentUserCount(db: Db, userId: string): Promise<number> {
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count, error } = await db
    .from("ai_messages")
    .select("id, ai_conversations!inner(user_id)", { count: "exact", head: true })
    .eq("role", "user")
    .gte("created_at", since)
    .eq("ai_conversations.user_id", userId);
  if (error) {
    console.error("Rate limit query failed:", error.message);
    return 0;
  }
  return count ?? 0;
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const authedUser = await requireUser(req);
  if (!authedUser) return errorResponse(401, "unauthorized", "Unauthorized", cors);

  try {
    const body = await req.json().catch(() => null);
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const avatar = body?.avatar as AvatarId;
    const conversationId = body?.conversationId;
    const clientMessageId =
      typeof body?.clientMessageId === "string" && body.clientMessageId.length <= 100 ? body.clientMessageId : null;

    if (!message || message.length > MAX_MESSAGE_CHARS) {
      return errorResponse(400, "bad_request", `Invalid message (1-${MAX_MESSAGE_CHARS} chars)`, cors);
    }
    if (!AVATAR_IDS.includes(avatar) || typeof conversationId !== "string" || !conversationId) {
      return errorResponse(400, "bad_request", "Required: message, avatar (TINO/ZAHIA/ROMA), conversationId", cors);
    }

    const openaiKey = getOpenAIKey();
    if (!openaiKey) {
      console.error("OPENAI_API_KEY is not configured");
      return errorResponse(500, "config", "OpenAI key not configured", cors);
    }

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const userId = authedUser.id;

    // Todo lo que no depende entre sí, en paralelo.
    const [convo, recent, userCtx, ragChunks, recentUserCount] = await Promise.all([
      db.from("ai_conversations").select("user_id").eq("id", conversationId).maybeSingle(),
      getRecentRows(db, conversationId),
      getUserContext(db, userId),
      getRagChunks(db, avatar, message, openaiKey),
      getRecentUserCount(db, userId),
    ]);

    if (!convo.data) return errorResponse(409, "gone", "Conversation not found", cors);
    if (convo.data.user_id !== userId) return errorResponse(403, "forbidden", "Conversation not owned by user", cors);

    // Reintento: el mensaje del usuario ya se guardó en un intento anterior.
    const existingIdx = clientMessageId && recent.hasClientId
      ? recent.rows.findIndex((r) => r.client_message_id === clientMessageId)
      : -1;
    const existing = existingIdx >= 0 ? recent.rows[existingIdx] : null;
    if (existing) {
      const answered = recent.rows
        .slice(0, existingIdx) // filas más nuevas que el mensaje del usuario
        .filter((r) => r.role !== "user")
        .reverse();
      if (answered.length) {
        return jsonResponse({
          userMessage: { id: existing.id, created_at: existing.created_at },
          respuesta: answered.map((r) => ({ id: r.id, text: r.content, created_at: r.created_at })),
          derivar: null,
        }, 200, cors);
      }
    } else if (recentUserCount >= RATE_LIMIT_PER_HOUR) {
      return errorResponse(429, "rate_limited", "Too many messages", cors);
    }

    // Historial anterior al mensaje actual (de viejo a nuevo).
    const olderRows = (existing ? recent.rows.slice(existingIdx + 1) : recent.rows).slice().reverse();
    const isFirstMessage = olderRows.length === 0;
    const history = buildHistory(olderRows as { role: string; content: string }[]).slice(-HISTORY_MESSAGES);

    // Guardar el mensaje del usuario (una sola vez).
    let userMessage: { id: string; created_at: string };
    if (existing) {
      userMessage = { id: existing.id, created_at: existing.created_at };
    } else {
      const insertUser = (withClientId: boolean) =>
        db.from("ai_messages")
          .insert({
            conversation_id: conversationId,
            role: "user",
            content: message,
            ...(withClientId && clientMessageId ? { client_message_id: clientMessageId } : {}),
          })
          .select("id, created_at")
          .single();
      let res = await insertUser(true);
      if (res.error?.code === MISSING_COLUMN) res = await insertUser(false);
      if (res.error || !res.data) {
        const code = res.error?.code;
        console.error("Insert user message failed:", code, res.error?.message);
        if (code === FK_VIOLATION) return errorResponse(409, "gone", "Conversation deleted", cors);
        if (code === UNIQUE_VIOLATION) return errorResponse(409, "bad_request", "Duplicate message", cors);
        return errorResponse(500, "internal", "Could not save message", cors);
      }
      userMessage = { id: res.data.id, created_at: res.data.created_at };
    }

    // OpenAI
    const messages = [
      { role: "system", content: buildSystemPrompt(avatar, userCtx) },
      ...(ragChunks.length ? [{ role: "system", content: buildReferenceMessage(ragChunks) }] : []),
      ...history,
      { role: "user", content: message },
    ];

    let openaiRes: Response;
    try {
      openaiRes = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: CHAT_MODEL,
          messages,
          response_format: RESPONSE_SCHEMA,
          temperature: 0.6,
          max_tokens: 500,
        }),
      }, OPENAI_TIMEOUT_MS);
    } catch (e) {
      if ((e as Error).name === "TimeoutError") {
        console.error("OpenAI timeout");
        return errorResponse(504, "timeout", "AI model timed out", cors);
      }
      throw e;
    }

    if (!openaiRes.ok) {
      console.error("OpenAI error:", openaiRes.status, await openaiRes.text());
      return errorResponse(502, "upstream", "Error calling AI model", cors);
    }

    const completion = await openaiRes.json();
    const { respuesta, derivar } = parseModelOutput(completion.choices?.[0]?.message?.content ?? "", avatar);

    // Guardar las partes del agente de una vez, con created_at escalonado para que el orden sea estable.
    const base = Date.now();
    const insertRes = await db.from("ai_messages")
      .insert(respuesta.map((text, i) => ({
        conversation_id: conversationId,
        role: "assistant",
        content: text,
        created_at: new Date(base + i).toISOString(),
      })))
      .select("id, content, created_at");
    if (insertRes.error || !insertRes.data) {
      const code = insertRes.error?.code;
      console.error("Insert assistant messages failed:", code, insertRes.error?.message);
      if (code === FK_VIOLATION) return errorResponse(409, "gone", "Conversation deleted", cors);
      return errorResponse(500, "internal", "Could not save reply", cors);
    }
    const saved = (insertRes.data as Row[]).sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));

    await db.from("ai_conversations")
      .update({
        last_message_at: new Date().toISOString(),
        ...(isFirstMessage ? { title: message.slice(0, 50) } : {}),
      })
      .eq("id", conversationId);

    return jsonResponse({
      userMessage,
      respuesta: saved.map((r) => ({ id: r.id, text: r.content, created_at: r.created_at })),
      derivar,
    }, 200, cors);
  } catch (e) {
    console.error("avatar-chat error:", e);
    return errorResponse(500, "internal", "Internal error", cors);
  }
});
