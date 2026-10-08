import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { getOpenAIKey } from "../_shared/openai.ts";

type AvatarId = "TINO" | "ZAHIA" | "ROMA";

const VALID_AVATARS: AvatarId[] = ["TINO", "ZAHIA", "ROMA"];
const RAG_TABLES: Record<AvatarId, string> = {
  TINO: "rag_tino",
  ZAHIA: "rag_zahia",
  ROMA: "rag_roma",
};

function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let chunk = text.slice(start, end);

    // Try to break at sentence boundary
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf(".");
      const lastNewline = chunk.lastIndexOf("\n");
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > chunkSize * 0.5) {
        chunk = chunk.slice(0, breakPoint + 1);
      }
    }

    chunks.push(chunk.trim());
    start += chunk.length - overlap;
    if (start <= 0 && chunks.length > 0) break; // safety
  }
  return chunks.filter((c) => c.length > 20);
}

async function getEmbeddings(texts: string[], apiKey: string): Promise<number[][]> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: texts }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding error: ${err}`);
  }
  const data = await res.json();
  return data.data.map((d: any) => d.embedding);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user is admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Check admin role using service client
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: hasAdminRole } = await serviceClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!hasAdminRole) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { avatar, content, filename, action } = await req.json();

    if (!VALID_AVATARS.includes(avatar)) {
      return new Response(
        JSON.stringify({ error: "Invalid avatar. Must be TINO, ZAHIA, or ROMA" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const tableName = RAG_TABLES[avatar as AvatarId];

    // List documents
    if (action === "list") {
      const { data: docs, error } = await serviceClient
        .from(tableName)
        .select("id, metadata, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ documents: docs }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Delete document chunks
    if (action === "delete") {
      const deleteFilename = filename;
      const { error } = await serviceClient
        .from(tableName)
        .delete()
        .eq("metadata->>source", deleteFilename);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Upload: chunk + embed + insert
    const OPENAI_KEY = getOpenAIKey();
    if (!OPENAI_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "OpenAI key not configured", code: "config" }),
        { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }
    if (!content || !filename) {
      return new Response(
        JSON.stringify({ error: "content and filename are required" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const chunks = chunkText(content);
    if (chunks.length === 0) {
      return new Response(
        JSON.stringify({ error: "No meaningful content to process" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Process in batches of 20
    const batchSize = 20;
    let totalInserted = 0;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const embeddings = await getEmbeddings(batch, OPENAI_KEY);

      const rows = batch.map((text, idx) => ({
        content: text,
        metadata: { source: filename, chunk_index: i + idx },
        embedding: JSON.stringify(embeddings[idx]),
      }));

      const { error } = await serviceClient.from(tableName).insert(rows);
      if (error) throw error;
      totalInserted += rows.length;
    }

    return new Response(
      JSON.stringify({
        success: true,
        chunks: totalInserted,
        avatar,
        filename,
      }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("avatar-rag-upload error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
