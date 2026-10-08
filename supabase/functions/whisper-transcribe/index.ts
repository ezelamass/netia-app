import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { requireUser, errorResponse, jsonResponse } from "../_shared/auth.ts";
import { getOpenAIKey, fetchWithTimeout } from "../_shared/openai.ts";

const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
const TRANSCRIBE_TIMEOUT_MS = 25_000;
const AUDIO_EXTENSIONS = ["webm", "mp4", "m4a", "ogg", "wav", "mp3", "mpega"];
const MODELS = ["gpt-4o-mini-transcribe", "whisper-1"];

/** Whisper detecta el formato por la extensión: usamos la real si es una conocida. */
function audioFilename(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return AUDIO_EXTENSIONS.includes(ext) ? `audio.${ext}` : "audio.webm";
}

async function transcribe(file: File, model: string, apiKey: string): Promise<Response> {
  const form = new FormData();
  form.append("file", file, audioFilename(file));
  form.append("model", model);
  form.append("language", "es");
  return await fetchWithTimeout("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  }, TRANSCRIBE_TIMEOUT_MS);
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const authedUser = await requireUser(req);
  if (!authedUser) return errorResponse(401, "unauthorized", "Unauthorized", cors);

  try {
    const openaiKey = getOpenAIKey();
    if (!openaiKey) {
      console.error("OPENAI_API_KEY is not configured");
      return errorResponse(500, "config", "OpenAI key not configured", cors);
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio");
    if (!audioFile || !(audioFile instanceof File)) {
      return errorResponse(400, "bad_request", "No audio file provided", cors);
    }
    if (audioFile.size > MAX_AUDIO_BYTES) {
      return errorResponse(413, "bad_request", "Audio too large (max 5MB)", cors);
    }

    let response: Response | null = null;
    for (const model of MODELS) {
      try {
        response = await transcribe(audioFile, model, openaiKey);
      } catch (e) {
        if ((e as Error).name === "TimeoutError") return errorResponse(504, "timeout", "Transcription timed out", cors);
        throw e;
      }
      if (response.ok) break;
      const errorText = await response.text();
      console.error(`Transcription error (${model}):`, response.status, errorText);
      // Solo se prueba el modelo de respaldo si el primero no existe o no está habilitado.
      if (![400, 403, 404].includes(response.status)) break;
    }

    if (!response?.ok) return errorResponse(502, "upstream", "Transcription failed", cors);

    const result = await response.json();
    return jsonResponse({ text: result.text ?? "" }, 200, cors);
  } catch (error) {
    console.error("whisper-transcribe error:", error);
    return errorResponse(500, "internal", "Internal error", cors);
  }
});
