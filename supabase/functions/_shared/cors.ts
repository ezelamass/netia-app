const BASE_ORIGINS = [
  "https://netia-futuro-brillante.vercel.app",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
];

// Previews de Vercel del proyecto, atados al equipo de Vercel (cualquiera puede registrar un proyecto
// con un nombre parecido, así que el slug del equipo es lo que lo hace propio):
// netia-futuro-brillante-<hash>-<equipo>.vercel.app y netia-futuro-brillante-git-<rama>-<equipo>.vercel.app
const PREVIEW_ORIGIN = /^https:\/\/netia-futuro-brillante-[a-z0-9-]+-(ezelamass|elamasprojects)-projects\.vercel\.app$/;

function extraOrigins(): string[] {
  return (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allowed = BASE_ORIGINS.includes(origin) || extraOrigins().includes(origin) || PREVIEW_ORIGIN.test(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : BASE_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    Vary: "Origin",
  };
}
