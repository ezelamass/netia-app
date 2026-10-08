// Correr con: deno test supabase/functions/_shared/prompts_test.ts
import { assert, assertEquals, assertFalse } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  BASE_RULES,
  FALLBACK_REPLY,
  buildHistory,
  buildSystemPrompt,
  buildUserContext,
  parseModelOutput,
} from "./prompts.ts";

Deno.test("los prompts usan voseo y no tuteo", () => {
  for (const a of ["TINO", "ZAHIA", "ROMA"] as const) {
    const p = buildSystemPrompt(a, {});
    assertFalse(/\b(eres|tienes|puedes)\b/i.test(p));
    assert(p.includes("voseo"));
  }
  assert(BASE_RULES.includes("102"));
});

Deno.test("contexto del usuario: omite lo que falta y avisa del dolor", () => {
  assertEquals(buildUserContext({}), "");
  const ctx = buildUserContext({ firstName: "Juan", age: 12, sport: "fútbol", logs: [] });
  assert(ctx.includes("Nombre: Juan · Edad: 12 · Deporte: fútbol"));
  assertFalse(ctx.includes("Club"));
  assertFalse(ctx.includes("Últimos días"));
});

Deno.test("parseModelOutput nunca devuelve el texto crudo", () => {
  assertEquals(parseModelOutput("esto no es json", "TINO"), { respuesta: [FALLBACK_REPLY], derivar: null });
  const ok = parseModelOutput(JSON.stringify({ respuesta: ["**Dale**", "  ", "# Listo"], derivar: "ROMA" }), "TINO");
  assertEquals(ok, { respuesta: ["Dale", "Listo"], derivar: "ROMA" });
});

Deno.test("derivar al mismo agente se descarta", () => {
  const r = parseModelOutput(JSON.stringify({ respuesta: ["Hola"], derivar: "TINO" }), "TINO");
  assertEquals(r.derivar, null);
});

Deno.test("buildHistory junta partes consecutivas y trunca", () => {
  const h = buildHistory([
    { role: "user", content: "hola" },
    { role: "assistant", content: "uno" },
    { role: "assistant", content: "dos" },
    { role: "user", content: "x".repeat(2000) },
  ]);
  assertEquals(h.length, 3);
  assertEquals(h[1].content, "uno\n\ndos");
  assertEquals(h[2].content.length, 1000);
});
