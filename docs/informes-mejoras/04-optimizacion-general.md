# 04 · Optimización general (código, seguridad, backend, costos, DX)

Fecha: 2026-09-25 · Alcance: repo local (sin tocar la DB remota). Verificado con `npm ci`, `eslint`, `tsc` y `vite build`.

## Resumen ejecutivo

La app compila y tiene RLS habilitado en las 36 tablas, pero hay **tres agujeros de seguridad críticos** que, combinados, dejan leer datos de salud y bienestar de menores a cualquiera con una cuenta:

1. **Escalada de privilegios en el registro**: el trigger `handle_new_user` toma el rol de `raw_user_meta_data`, que controla el cliente. Cualquiera puede registrarse como `admin` con una llamada a `signUp`.
2. **Vinculación padre-hijo sin verificación**: un usuario con rol `parent` puede vincularse a cualquier menor sabiendo su email, y las políticas RLS le dan acceso a su perfil, a sus registros diarios y a sus aptos médicos. `consent_given` existe en la tabla, pero ninguna política lo usa.
3. **Edge functions de IA sin autenticación**: `avatar-chat` y `whisper-transcribe` aceptan llamadas anónimas, así que cualquiera puede gastar la API key de OpenAI. Además, `avatar-chat` sin token se salta el chequeo de dueño y carga el historial de cualquier `conversationId`.

En segundo plano: TypeScript con `strict: false` (activar strict hoy solo da 7 errores), 170 errores de ESLint (156 son `any`), sin tests, sin CI de calidad, bundle único de 2,95 MB sin code splitting, React Query casi sin uso y tres lockfiles.

## Tabla priorizada

| # | Hallazgo | Sev. | Esf. | Ubicación |
|---|----------|------|------|-----------|
| 1 | El rol se toma de metadata del cliente al registrarse (escalada a admin) | Crítica | S | `supabase/migrations/20260308171437_…sql:222`, `src/contexts/AuthContext.tsx:129-135` |
| 2 | Un padre se vincula a cualquier menor sin verificación; RLS ignora `consent_given` | Crítica | M | `…20260308171437_…sql:346-348, 297-302, 389-393`; `src/hooks/useFamilyLinks.ts:71-78` |
| 3 | `avatar-chat` sin autenticación; sin token se salta el chequeo de dueño e inyecta el historial ajeno en el prompt | Crítica | S | `supabase/functions/avatar-chat/index.ts:264-293` |
| 4 | `whisper-transcribe` sin autenticación ni límite de tamaño | Alta | S | `supabase/functions/whisper-transcribe/index.ts:10-30` |
| 5 | Sin rate limiting ni tope de uso por usuario en IA (chat, embeddings, Whisper) | Alta | M | `avatar-chat/index.ts:242-352` |
| 6 | `find_profile_by_email` es SECURITY DEFINER y ejecutable por cualquiera (permite enumerar emails de menores) | Alta | S | `…20260309052414_…sql:1-14` |
| 7 | Un `club_admin` gestiona inscripciones de **cualquier** club (sin filtro por club) | Alta | S | `…20260308171437_…sql:334-339` |
| 8 | `player_stats` UPDATE propio sin restricción: se puede editar el XP, el nivel y la racha desde la consola | Media | S | `…20260308171437_…sql:415-417` |
| 9 | El historial toma los **primeros** 20 mensajes, no los últimos | Media | S | `avatar-chat/index.ts:295-300` |
| 10 | Los errores internos (`e.message`) se devuelven al cliente | Media | S | `avatar-chat:391`, `whisper:59`, `admin-manage-user:189` |
| 11 | Credenciales demo (`netiademo`) en una migración que corre en producción | Media | S | `…20260502021600_…sql:~55`, `…20260413240000_seed_demo_accounts.sql` |
| 12 | `.env` versionado (aunque figura en `.gitignore`) | Baja | S | `.env` (commit 8efceae) |
| 13 | TS `strict:false`, `strictNullChecks:false`, `noImplicitAny:false` | Media | S | `tsconfig.json`, `tsconfig.app.json:22` |
| 14 | ESLint: 170 errores y 18 warnings en 58 archivos | Media | M | ver detalle |
| 15 | Sin tests y sin CI de lint, typecheck o build (solo un keep-alive) | Alta | M | `.github/workflows/` |
| 16 | Bundle único de 2,95 MB (Three.js incluido); 0 rutas con `lazy()` | Alta | M | `src/App.tsx`, `vite.config.ts` |
| 17 | React Query instalado pero usado en 1 archivo; los hooks hacen fetch manual con `useEffect` | Media | L | `src/hooks/*` |
| 18 | Código muerto: 9 componentes y páginas sin uso, 19 componentes `ui/` sin uso, ~14 dependencias solo para esos | Baja | S | ver detalle |
| 19 | Tres lockfiles (`bun.lock`, `bun.lockb`, `package-lock.json`) | Baja | S | raíz |
| 20 | Consentimiento parental solo en el estado de React: `termsAccepted` y `dataAuthorization` no se persisten con fecha y versión | Alta | M | `src/contexts/OnboardingContext.tsx:90`, `src/pages/Onboarding.tsx:111-147` |
| 21 | CORS: un origen no permitido recibe el origen de producción (correcto), pero las URLs de preview de Vercel quedan bloqueadas | Baja | S | `supabase/functions/_shared/cors.ts:1-10` |
| 22 | Versiones de Deno/std y supabase-js heterogéneas (`@2`, `@2.49.1`, `std@0.168.0`, `deno.land/x/xhr`) | Baja | S | `supabase/functions/*/index.ts:1-2` |

## Detalle y propuesta

### 1. Escalada de privilegios al registrarse (Crítica)
`handle_new_user` inserta `COALESCE((raw_user_meta_data->>'role')::app_role,'player')`. El frontend manda `role` en `signUp`, y cualquiera puede mandar `role: 'admin'` con la publishable key.
**Propuesta:** crear una migración nueva que redefina la función con una lista blanca: solo `player` o `parent` desde el autoregistro, y cualquier otro valor pasa a `player`. Los roles `coach`, `club_admin` y `admin` los asigna solo `admin-manage-user`, que usa service role. Auditar `user_roles` en producción buscando admins inesperados.

### 2. Vinculación padre-hijo y consentimiento (Crítica)
`family_links` INSERT solo chequea `parent_id = auth.uid()`. Con `find_profile_by_email`, cualquier cuenta `parent` (y por el punto 1, cualquiera puede serlo) se vincula a un menor y lee su perfil, sus `daily_logs` (dolor, sueño) y sus `medical_clearances`.
**Propuesta:** hacer el vínculo en dos pasos. El padre crea la solicitud (`status='pending'`) y el menor o un admin la confirma, o se usa un código de invitación generado desde la cuenta del hijo. Todas las políticas "Parents can view…" deben exigir `consent_given = true`. Registrar `consent_date` e IP en la tabla.

### 3 y 4. Edge functions sin autenticación (Crítica / Alta)
`verify_jwt=false` en las 4 funciones. `admin-manage-user` y `avatar-rag-upload` validan el JWT con `getClaims` y chequean `has_role('admin')`, y eso está bien. `avatar-chat` y `whisper-transcribe`, en cambio, no exigen token.
**Propuesta:** en ambas, devolver 401 si no hay un `Bearer` válido (`getClaims`). En `avatar-chat`, si llega un `conversationId`, exigir siempre que `user_id === requestingUserId` (hoy el chequeo solo corre si hay token, en las líneas 280-293). Otra opción es pasar a `verify_jwt=true` en `config.toml` para esas dos. En Whisper, rechazar audios de más de ~5 MB o ~60 s.

### 5. Costos de IA (Alta)
El modelo es `gpt-4o-mini` con `max_tokens: 1024` y `temperature: 0.7`, una elección barata y razonable. Pero cada mensaje hace 1 llamada de embeddings más 1 de chat, y el system prompt (~1,5k tokens) más 5 fragmentos de RAG (~5×250 tokens) más 20 mensajes de historial se reenvían en cada turno. No hay límite de largo de `message`, rate limit ni tope diario.
**Propuesta:**
- Truncar `message` a 1.000 caracteres y `max_tokens` a ~400, porque el formato pide mensajes cortos.
- Agregar una tabla `ai_usage(user_id, day, requests, tokens)` y cortar a N mensajes por día por menor. Registrar `completion.usage`.
- Ordenar los prompts para aprovechar el prompt caching automático de OpenAI: primero el system prompt estático y el RAG al final (hoy el RAG va pegado al system prompt y cambia en cada turno, lo que rompe el caché del prefijo).
- Saltear RAG en mensajes triviales (menos de 15 caracteres, saludos). El umbral de 0.5 en el edge contra 0.7 por defecto en el RPC es inconsistente: unificarlo.

### 6. `find_profile_by_email` (Alta)
Es SECURITY DEFINER sin `REVOKE`, así que por defecto la ejecuta `PUBLIC`, incluido `anon`. Permite confirmar si un email está registrado y obtener el nombre completo de un menor.
**Propuesta:** `REVOKE EXECUTE … FROM anon, public; GRANT … TO authenticated;`, exigir el rol `parent` dentro de la función y devolver solo el `id`. Revisar también `match_rag_documents` y `get_users_in_same_clubs` con el mismo criterio.

### 7. `club_admin` sin alcance de club (Alta)
La política `FOR ALL` de `enrollments` solo chequea el rol. Un club_admin puede inscribir a cualquier usuario en su club y con eso ganar visibilidad de coach sobre ese menor.
**Propuesta:** agregar `club_id IN (SELECT public.get_user_club_ids(auth.uid()))` y definir `WITH CHECK` explícito.

### 8. Gamificación manipulable (Media)
El UPDATE de `player_stats` permite `xp = 999999`.
**Propuesta:** quitar la política de UPDATE para el usuario y mover el cálculo de XP, rachas y badges a funciones SECURITY DEFINER o triggers sobre `daily_logs`.

### 9. Bug del historial (Media)
`.order('created_at', {ascending:true}).limit(20)` devuelve los primeros 20 mensajes: en una conversación larga el modelo nunca ve el contexto reciente.
**Propuesta:** usar `ascending:false`, `limit(10)` y después `.reverse()`. Eso además baja el costo.

### 10. Filtrado de errores (Media)
Devolver `e.message` expone detalles internos de Supabase o OpenAI.
**Propuesta:** loguear con `console.error` y responder con un mensaje genérico en español y un `requestId`.

### 11 y 12. Credenciales demo y `.env` (Media / Baja)
Las migraciones crean usuarios demo con la contraseña `netiademo` en cualquier entorno donde se hace `db push`. El `.env` versionado solo tiene la URL y la publishable key (son públicas por diseño), pero es mala práctica.
**Propuesta:** mover los seeds demo a `supabase/seed.sql` o a `scripts/seed-demo-users.ts` (ya existe), y hacer `git rm --cached .env`.

### 13 y 14. Tipado y lint (Media)
- `tsc --noEmit -p tsconfig.app.json` da 0 errores con la config actual y **solo 7 con `--strict`**: activar strict es un quick win.
- ESLint da 170 errores: 156 son `no-explicit-any`, 13 `react-refresh/only-export-components`, 10 `no-useless-escape` y 5 `react-hooks/exhaustive-deps` (estos 5 son bugs potenciales de datos desactualizados; revisarlos primero).

**Propuesta:** activar `strict: true` y corregir los 7 errores. Reemplazar los `any` usando los tipos `Tables<'x'>` de `integrations/supabase/types.ts`, que están al día: incluyen las 36 tablas y las RPC de las migraciones.

### 15. Tests y CI (Alta)
No hay ningún test ni workflow de calidad.
**Propuesta:** crear un workflow `ci.yml` en los PR que corra `npm ci`, `lint`, `tsc` y `build`. Sumar Vitest con tests para `src/lib` (lógica de recomendaciones y niveles de XP) y tests de RLS con `supabase test db` (pgTAP) para los puntos 1, 2, 6 y 7: es donde un error cuesta más.

### 16. Bundle (Alta)
El build produce un único `index-*.js` de **2,95 MB** minificado (Vite ya avisa por el límite de 500 kB). Three.js, drei y fiber (`src/components/avatars/*`), Recharts y framer-motion se cargan en el login.
**Propuesta:** usar `React.lazy` por ruta (admin, club, parent, chat), aislar las escenas 3D con `lazy` y `Suspense`, y agregar `build.rollupOptions.output.manualChunks` para `three`, `recharts` y `radix`. El objetivo es un bundle inicial por debajo de 400 kB.

### 17. Data fetching (Media)
26 hooks usan `useEffect` y solo 1 archivo usa `useQuery`: no hay caché ni deduplicación, se refetchea en cada montaje y el manejo de loading y error es inconsistente. Además hay 22 `select('*')`.
**Propuesta:** migrar gradualmente a React Query, empezando por `useProfile` y `useDashboardData`, y seleccionar solo las columnas necesarias.

### 18. Código muerto (Baja)
- **Sin importar:** `src/pages/Index.tsx`, `src/components/dashboard/{ActivityCard,QuickActionBar,ActivityChart,MetricCard,HeroCard,SkillCard,WelcomeCard,ProgressCard}.tsx`.
- **`ui/` sin uso:** alert, aspect-ratio, breadcrumb, carousel, chart, collapsible, command, context-menu, drawer, hover-card, input-otp, loading-spinner, menubar, message-dock, navigation-menu, pagination, resizable, toggle-group.
- **Dependencias que solo usan esos componentes:** `input-otp`, `cmdk`, `vaul`, `embla-carousel-react`, `react-resizable-panels`, `@radix-ui/react-{menubar,navigation-menu,context-menu,hover-card,aspect-ratio,collapsible,toggle-group}`.

**Propuesta:** borrar todo eso (tree-shaking ya los excluye del bundle, así que la ganancia es en mantenimiento e instalación). Verificarlo con `npx knip`.

### 19. Lockfiles (Baja)
Conviven `bun.lock`, `bun.lockb` y `package-lock.json`. Vercel elige el gestor según el lockfile, lo que puede dar builds no reproducibles.
**Propuesta:** quedarse con npm, que es lo que usan CLAUDE.md y CI: borrar ambos `bun.*`. Renombrar también `name: "vite_react_shadcn_ts"` en `package.json`.

### 20. Datos de menores y privacidad (Alta)
El onboarding pide `termsAccepted`, `dataAuthorization`, `tutorName` y `tutorEmail`, pero solo los valida en la UI y no se persiste una constancia auditable. Para menores de 13 a 16 años (Ley 25.326 en Argentina, GDPR art. 8 y COPPA si hay usuarios de EE. UU.), hace falta un consentimiento verificable del tutor.
**Propuesta:**
- Crear la tabla `consents(user_id, tutor_email, version_terminos, accepted_at, ip, method)`.
- Confirmar el consentimiento por email al tutor antes de habilitar el chat de IA.
- Definir retención y borrado de `ai_messages` (hoy es indefinida) y avisar en la UI que las conversaciones se envían a OpenAI.
- Agregar moderación de entrada con `omni-moderation-latest` (gratis) antes de ROMA, el avatar de salud mental, para detectar crisis y escalar al tutor en lugar de depender solo del prompt.

### 21 y 22. CORS y dependencias de Deno (Baja)
Agregar un patrón para `*.vercel.app` del proyecto, o leer los orígenes permitidos desde una variable de entorno. Unificar en `jsr:@supabase/supabase-js@2` y `Deno.serve` (ya lo usan dos funciones), y quitar `deno.land/x/xhr`, que no hace falta.

## Quick wins (menos de 1 h cada uno)

1. Migración: lista blanca de roles en `handle_new_user` (#1).
2. `avatar-chat` y `whisper-transcribe`: exigir el JWT y el chequeo de dueño de la conversación siempre (#3, #4).
3. `REVOKE EXECUTE` de `find_profile_by_email` a `anon` (#6) y filtro por club en `enrollments` (#7).
4. Arreglar el orden del historial (últimos 10) y bajar `max_tokens` a 400 (#9, #5).
5. Truncar `message` a 1.000 caracteres y el audio a 5 MB.
6. Activar `strict: true` en tsconfig (7 errores).
7. Workflow de CI con lint, typecheck y build.
8. Borrar `bun.lock`/`bun.lockb`, `git rm --cached .env` y los componentes y dependencias muertos.
9. `React.lazy` en las rutas de admin, club y parent y en las escenas 3D.
10. Respuestas de error genéricas en las edge functions.
