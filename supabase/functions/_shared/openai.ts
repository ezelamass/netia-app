/** Secret canónico: OPENAI_API_KEY. `key_openai` queda solo como fallback del nombre viejo. */
export function getOpenAIKey(): string | null {
  return Deno.env.get("OPENAI_API_KEY") ?? Deno.env.get("key_openai") ?? null;
}

/** fetch con timeout; al vencer rechaza con un error de nombre "TimeoutError". */
export async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(ms) });
  } catch (e) {
    if (e instanceof DOMException && (e.name === "TimeoutError" || e.name === "AbortError")) {
      const err = new Error("timeout");
      err.name = "TimeoutError";
      throw err;
    }
    throw e;
  }
}
