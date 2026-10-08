# 09 — Aplicar en producción (migraciones, deploys, limpieza)

**Proyecto Supabase:** `doeqebxhzctlhizcphkq` · **Repo/rama:** `ezelamass/netia-futuro-brillante`, rama `claude/netia-polish-hs6dsm` (PR #3).
**Estado (2026-10-08):** nada de esto está aplicado. Ezequiel autorizó explícitamente aplicarlo en producción (2026-10-08). Hacerlo en este orden y verificar cada paso antes de seguir.
**Restricciones:** el `CLAUDE.md` del repo prohíbe el conector MCP de Supabase y manda `npx supabase …`. En la sesión anterior la CLI (`db push`, `db query`) se colgó sin conectarse y el sistema de permisos bloqueó el SQL directo; la sesión nueva debe probar primero la CLI con `SUPABASE_ACCESS_TOKEN` del entorno (y `SUPABASE_DB_PASSWORD` si hace falta). Si no se puede, parar y avisar a Ezequiel: el plan B es que pegue los archivos en el SQL Editor.

## Estado verificado de producción (2026-10-08, solo lectura)
- Roles: 28 `player`, 2 `parent`, 1 `coach`, 1 `club_admin`, 2 `admin`. Coach, club_admin y un admin son cuentas `demo-*@netia.app`; el otro admin es `admin@gmail.com` (confirmar con Ezequiel si es suyo, no tocar).
- 5 cuentas `demo-*@netia.app` (jugador, admin, entrenador, padre, club-admin). `demo-jugador` tiene 13 `daily_logs` de ejemplo.
- No existen `public.family_link_codes` ni `public.leads`.
- Última migración registrada: `20260502021559`. La migración local `20260502021600` (seed de `demo-padre`) se eliminó del repo y NO debe aplicarse.

## Pasos (en orden)
### 0. Antes de empezar
1. `git checkout claude/netia-polish-hs6dsm && git pull` (o desde `main` si la PR #3 ya se mergeó).
2. Revisar que `family_links` no tenga filas con `consent_given = false` que dependan de la política vieja: `select parent_id, child_id, consent_given from public.family_links;` Las 2 familias existentes perderán visibilidad de datos del hijo si no dieron consentimiento; es el comportamiento buscado, avisar a Ezequiel con el resultado.

### 1. Migración de seguridad
Archivo: `supabase/migrations/20261008120000_security_roles_family_consent.sql`
Aplica: `handle_new_user` solo permite `player`/`parent`; revoca `find_profile_by_email`; crea `family_link_codes` y las RPC `create_family_link_code`, `redeem_family_link_code`, `give_family_consent`, `revoke_family_consent`; `consented_child_ids()`; reescribe las políticas de lectura de padres exigiendo consentimiento.
Verificar:
- `select to_regclass('public.family_link_codes');` no es null.
- `select proname from pg_proc where proname in ('create_family_link_code','redeem_family_link_code','give_family_consent','revoke_family_consent','consented_child_ids');` devuelve 5 filas.
- `select has_function_privilege('anon','public.find_profile_by_email(text)','execute');` es `false`.
- `select policyname from pg_policies where tablename='family_links';` ya no incluye "Parents can manage own family links".
- Registrada en el historial de migraciones.

### 2. Migración de leads
Archivo: `supabase/migrations/20261008130000_leads.sql`
Verificar: `public.leads` existe con RLS activo (`select relrowsecurity from pg_class where oid='public.leads'::regclass;` = true), 2 políticas (insert anónimo, select solo admin). Prueba: insertar un lead con la clave anon (debe funcionar) y leer con la clave anon (debe devolver 0 filas); borrar el lead de prueba.

### 3. Edge Functions (después de las migraciones)
Cambiadas: `avatar-chat`, `whisper-transcribe` (usan `supabase/functions/_shared/auth.ts`: exigen JWT, `avatar-chat` limita a 2000 caracteres y verifica propiedad de la conversación, `whisper-transcribe` limita a 5 MB).
Comandos: `npx supabase functions deploy avatar-chat --project-ref doeqebxhzctlhizcphkq` y `... whisper-transcribe ...`. `admin-manage-user` y `avatar-rag-upload` no cambiaron.
Verificar: llamada sin `Authorization` a cada función → 401; con JWT de un usuario real y un mensaje corto → 200 (avatar-chat); `npx supabase functions list` muestra las versiones nuevas.

### 4. Limpieza de cuentas demo (irreversible)
Las cuentas `demo-*@netia.app` tenían contraseña pública en el bundle viejo. Ya no se usan (la demo nueva corre 100% en el navegador). Autorizado por Ezequiel ("aplicar todo en producción").
1. Reconfirmar: `select email from auth.users where email like 'demo-%@netia.app';` deben ser solo las 5 esperadas.
2. Borrar con la API de administración de Supabase Auth o `delete from auth.users where email like 'demo-%@netia.app';` (en cascada se borran perfil, roles, logs). No tocar `admin@gmail.com`.
Verificar: la consulta anterior devuelve 0 filas; `select role, count(*) from public.user_roles group by role;` queda con 28 players, 2 parents y 1 admin (`admin@gmail.com`), sin coach ni club_admin demo.

### 5. Cierre
1. Probar en el preview de Vercel: registro nuevo (rol player y parent), `/demo` sin llamadas a `supabase.co`, envío de un lead desde `/clubes` o la demo.
2. Informar a Ezequiel el resultado de cada verificación y comentar en la PR #3.
3. No hay que hacer `db push` de nada más: no hay otras migraciones pendientes.
