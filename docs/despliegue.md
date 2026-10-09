# Despliegue

## 1. Supabase

1. Crear (o usar) un proyecto de Supabase.
2. Vincular la CLI y aplicar el esquema:
   ```sh
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```
   Las migraciones de `supabase/migrations/` crean tablas, funciones y políticas RLS. Revisarlas antes de aplicarlas sobre una base con datos.
3. Cargar los secrets de las Edge Functions:
   ```sh
   npx supabase secrets set OPENAI_API_KEY=<clave>
   # opcionales
   npx supabase secrets set ALLOWED_ORIGINS=https://tu-dominio.com
   npx supabase secrets set OPENAI_CHAT_MODEL=gpt-4o-mini
   ```
4. Desplegar las funciones:
   ```sh
   npx supabase functions deploy avatar-chat
   npx supabase functions deploy whisper-transcribe
   npx supabase functions deploy avatar-rag-upload
   npx supabase functions deploy admin-manage-user
   ```
5. Cargar los documentos de conocimiento de cada asistente desde el panel de administración (Ajustes). La clave de OpenAI necesita acceso a `gpt-4o-mini`, `text-embedding-3-small` y `gpt-4o-mini-transcribe` (o `whisper-1`).

Los roles `coach` y `club_admin` no se eligen al registrarse: se asignan desde administración.

## 2. Frontend (Vercel)

1. Importar el repositorio en Vercel (el ruteo SPA ya está en `vercel.json`).
2. Definir `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` y `VITE_SUPABASE_PROJECT_ID`.
3. Completar `src/config/contact.ts` (WhatsApp, email y agenda) para el formulario de contacto de las landings.
4. Si se usa un dominio propio, agregarlo a `ALLOWED_ORIGINS` en Supabase. Los previews de Vercel se permiten por el slug del equipo en `PREVIEW_ORIGIN` (`supabase/functions/_shared/cors.ts`): cambiarlo por el del equipo que despliega.

## 3. Chequeos antes de publicar

- `npm run build` y `npm run lint:ui` pasan.
- En `/demo` no hay pedidos a `supabase.co`.
- Registro nuevo como jugador y como familia, y un mensaje a cada asistente.
- Confirmar los teléfonos de crisis del protocolo de los asistentes (`supabase/functions/_shared/prompts.ts`) para el país donde se use.
- Opcional: `.github/workflows/supabase-keepalive.yml` evita que un proyecto gratuito se pause; necesita los secrets `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en GitHub.
