# Reporte maestro — Mejoras NETIA Futuro Brillante

Consolida 4 auditorías hechas en paralelo sobre el código (sin tocar la app ni la DB):

| # | Informe | Foco |
|---|---------|------|
| 01 | [Fluidez](./01-fluidez.md) | Performance percibida, carga, 3D, data fetching |
| 02 | [Nuevas features](./02-nuevas-features.md) | Gaps por rol, features a medio hacer, propuestas |
| 03 | [UI/UX](./03-ui-ux.md) | Design system, mobile, accesibilidad, onboarding, gamificación |
| 04 | [Optimización general](./04-optimizacion-general.md) | Seguridad, backend, costos IA, calidad de código, DX |

---

## Diagnóstico en una línea

La base de producto es buena (roles, avatares, gamificación, tablas ya modeladas), pero **hoy no es seguro poner menores en la app**, carga todo de golpe (~3 MB JS + ~9 MB de PNG en el chat) y varias pantallas muestran datos falsos o vacíos.

---

## 🔴 Fase 0 — Bloqueantes (antes de sumar usuarios reales) · ~2-3 días

Los tres combinados permiten que cualquiera con una cuenta lea datos de salud de menores.

1. **Escalada a admin en el registro.** `handle_new_user` toma el rol de `raw_user_meta_data` que manda el cliente (`supabase/migrations/20260308171437_…sql:222`). → Migración: autoregistro solo `player`/`parent`; los demás roles los asigna un admin. **Revisar en prod si ya hay admins/coaches inesperados.** *(verificado)*
2. **Vinculación padre↔menor sin verificación.** Alcanza con el email del chico; `find_profile_by_email` es ejecutable sin sesión; las políticas RLS ignoran `consent_given`. → Invitación con código/aprobación del menor o del club + RLS que exija vínculo aprobado.
3. **Edge functions de IA abiertas.** `avatar-chat` y `whisper-transcribe` aceptan llamadas anónimas (gasto libre de la key de OpenAI) y `avatar-chat` sin token se saltea el chequeo de dueño de la conversación. → Validar JWT siempre, sacar `user_id` del token, rate limit por usuario y límite de largo de mensaje/audio.
4. **Consentimiento parental no se persiste.** El paso "Familia" del onboarding lo pide pero no se guarda. Para una app de menores es requisito legal (Ley 25.326 AR).

## 🟠 Fase 1 — Quick wins de alto impacto · ~1 semana

| Qué | Por qué | Informe |
|-----|---------|---------|
| `React.lazy` en las ~30 rutas de `App.tsx` | Three/recharts/admin salen del bundle inicial; `/login` deja de bajar 3 MB | 01, 04 |
| Avatares PNG 3 MB → WebP 256/512 px | Chat baja de ~9 MB a ~100 KB | 01 |
| Historial del chat: últimos 20, no primeros (`avatar-chat/index.ts:295`, `ascending: true` + `limit 20`) | Bug: en charlas largas el avatar pierde el contexto reciente *(verificado)* | 04 |
| No `await` al guardar mensaje + `Promise.all` en la edge function | Respuesta del avatar notablemente más rápida | 01 |
| `AuthContext`: `useMemo` en `value` + queries en paralelo | Evita re-render de toda la app en cada refresh de token | 01 |
| Layout route con `<Outlet/>` | Header/NotificationBell no se remontan ni re-suscriben Realtime en cada click | 01 |
| Dark mode persistente (aplicar tema al boot, no solo en `/settings`) | Hoy se pierde al recargar | 03 |
| Sacar datos falsos: widget de vela en todos los deportes, badge "3" fijo, radar inventado, export que no exporta | Destruye confianza del usuario | 02, 03 |
| Copy: voseo consistente, roles traducidos, niveles en español, "+100" vs "1400+" | Pulido barato y visible | 03 |
| "¿Olvidaste tu contraseña?", Términos/Privacidad (los PDF ya están en `public/`) | Básicos faltantes | 02, 03 |
| Fix scroll horizontal landing mobile, `100dvh` en chat, safe-area en nav | Mobile es el uso principal | 03 |

## 🟡 Fase 2 — Fluidez y base técnica · 2-3 semanas

- **Migrar hooks a React Query** (hoy solo 1 archivo lo usa; `daily_logs` se pide 3 veces en el Dashboard). Claves compartidas + `staleTime` = navegación instantánea.
- **Dashboard 3D:** 4 Canvas WebGL simultáneos con sombras y `dpr` 2. → Un solo Canvas o imagen estática en widgets chicos, montar solo en viewport. Es el mayor consumo de batería en celulares.
- **Streaming SSE** en el chat de avatares.
- **Reorganizar Dashboard en 3 niveles:** "Tu día" (una acción) → "Tu progreso" (próximo logro) → detalle colapsable.
- **Onboarding de 8 pasos/~80 campos → 4 pasos**, empezando por el avatar; el resto se completa después como misiones con XP. El tutor autoriza por su lado.
- **Gamificación que se sienta:** celebración al ganar XP/subir nivel, "próxima insignia" siempre visible.
- **Calidad:** `strict: true` (solo 7 errores), limpiar 156 `any`, borrar ~27 componentes sin uso y ~12 deps, un solo lockfile, CI con lint + typecheck + build.
- **Accesibilidad:** `aria-label` en ~38 botones de ícono, `aria-live` en el chat, contraste del login, textos ≥12px.

## 🟢 Fase 3 — Features que mueven la aguja · 1-2 meses

Orden recomendado (todas se apoyan en tablas/funciones que ya existen):

1. **Avatares con memoria del atleta** (esfuerzo S). `avatar-chat` hoy no lee `daily_logs`, `diagnostic_history` ni el plan. Inyectarlos en el contexto convierte un chatbot genérico en un coach personal. Mayor impacto por hora invertida de todo el reporte.
2. **PWA + push.** Notificaciones y preferencias hoy viven solo en el navegador; sin la app abierta no hay recordatorios y las rachas mueren. → Preferencias a `profiles.preferences`, trigger en `notifications` → push, reglas a cron en servidor.
3. **Semáforo de riesgo del plantel para el coach** (dolor, sueño, carga aguda/crónica, apto médico). Diferencial claro para vender a clubes.
4. **Plan de entrenamiento por IA + constructor del coach.** `training_plans` y `training_plan_sessions` existen pero nada los genera; por eso "Próximamente" en todo deporte que no sea tenis. → Edge function `generate-training-plan` desde el diagnóstico, ajuste diario según el registro.
5. **Resumen semanal para padres** por email (Resend) y después WhatsApp. Hoy el padre ve 4 datos sueltos. Es el canal de retención y de venta (quien paga es el padre).

Después, validando demanda: registro diario por voz (reusa `whisper-transcribe`), retos entre amigos, rankings por club, análisis de video, wearables, marketplace de clubes.

---

## Cómo usar esto

- **Esta semana:** Fase 0 completa. No es opcional si hay menores reales en la base.
- **Siguiente sprint:** Fase 1 entera en una PR por bloque (perf, datos falsos, copy/mobile).
- **Palanca de negocio:** Fase 3 #1 (memoria) + #5 (resumen a padres) son las dos que se pueden mostrar en una demo a clubes y padres en menos de 2 semanas.
- Cada informe tiene `archivo:línea` por hallazgo para pasarlo directo a tareas o a `/feature-a-pr`.

> Nota: no se levantó la app logueada; los hallazgos salen del código, del build y de capturas de landing/login (`img/`). Tamaños de bundle medidos con `vite build` (JS único de 2,95 MB).
