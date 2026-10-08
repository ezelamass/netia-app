# 02 — Nuevas features para NETIA Futuro Brillante

> Fecha: 2026-09-25 · Alcance: análisis de `src/App.tsx`, páginas por rol, hooks, 15 migraciones y 4 edge functions. Sin cambios de código.
> Nota: la carpeta `recursos/` mencionada en CLAUDE.md **no existe en el repo**; la visión se infirió del código, del seed de demo y de CLAUDE.md.

## Resumen ejecutivo

- **La base de datos está más avanzada que la UI.** Existen `training_plans`, `training_plan_sessions`, `coach_notes`, `session_attendance`, `prizes` y RLS para que el coach gestione planes (`"Coaches can manage plans for their club players"`), pero **no hay ninguna pantalla ni edge function que cree planes**. Hoy el plan solo existe si se sembró a mano (el empty state de `Training.tsx` dice "Próximamente disponible para {deporte}" para todo lo que no sea tenis).
- **Los avatares no conocen al atleta.** `avatar-chat` arma el prompt con system prompt + RAG + historial, pero **no lee `daily_logs`, `diagnostic_history`, `player_stats` ni el plan**. Es la palanca de valor más barata del producto: la IA pasa de genérica a personal.
- **El padre y el club son "vistas de lectura" delgadas.** `ParentChild.tsx` muestra 4 números (racha, total de registros, último ánimo, último sueño). El coach registra carga y publica anuncios, pero no puede armar planes, ver alertas de riesgo ni exportar (el botón de export es un `toast` falso).
- **Las notificaciones son solo in-app y dependen de que la app esté abierta.** `useNotificationGenerator` corre en el cliente cada 5 min con estado en `localStorage`. No hay PWA, push, email ni WhatsApp.
- **Recomendación:** antes de inventar features nuevas, cerrar el ciclo núcleo **registro diario → IA con contexto → plan adaptativo → coach/padre informados**. Las 5 prioridades de abajo usan casi todo lo que ya existe.

---

## 1. Completar lo que ya existe

| # | Qué está incompleto | Dónde | Qué falta |
|---|---|---|---|
| 1 | Generación de planes de entrenamiento | `src/hooks/useTrainingPlan.ts` (solo lee), `src/pages/Training.tsx:60-95` (empty state "Próximamente") | Nadie inserta en `training_plans`/`training_plan_sessions`. Falta UI del coach para crearlos y/o generación por IA. Solo tenis tiene contenido. |
| 2 | Avatares sin contexto del atleta | `supabase/functions/avatar-chat/index.ts:277-335` | Inyectar en el system prompt: últimos 7 `daily_logs`, `diagnostic_history`, sesión de hoy del plan, edad/deporte del perfil. |
| 3 | Radar diagnóstico con fallback a mock | `src/components/training/DiagnosticRadar.tsx:26` | Si no hay diagnóstico real muestra puntajes inventados. Mostrar un estado vacío con CTA a `/diagnostic`. |
| 4 | Export de reportes falso | `src/pages/club/Reports.tsx:41`, `src/pages/admin/Analytics.tsx:43` | Solo tiran `toast.success('Exportando...')`. Implementar CSV (cliente) y PDF (edge function o `window.print` con CSS de impresión). |
| 5 | Settings de cuenta | `src/pages/Settings.tsx:163,168` | "Email de la cuenta" y "Cerrar sesión en todos los dispositivos" son `toast('próximamente')`. Ambos son una línea con `supabase.auth.updateUser` / `signOut({ scope: 'global' })`. |
| 6 | Legales | `src/pages/Settings.tsx:362-372` | Términos y Privacidad dicen "Próximamente" pero **los PDFs ya están en `public/`** (`TERMINOS_Y_CONDICIONES.pdf`, `Politica_de_Privacidad_NETIA.pdf`). Enlazarlos. |
| 7 | Preferencias de usuario solo en el navegador | `src/hooks/useSettings.ts:50-84` | Se guardan en `localStorage`: se pierden al cambiar de dispositivo y el backend no puede respetarlas (necesario para push/email). Migrar a una columna `profiles.preferences jsonb`. |
| 8 | Notificaciones generadas en el cliente | `src/hooks/useNotificationGenerator.ts` (estado en `localStorage`) | Solo se generan si el chico abre la app; pueden duplicarse entre dispositivos. Pasar las reglas a un cron (`pg_cron` + edge function). |
| 9 | Mock de notificaciones muerto | `src/types/notification.ts:141` (`MOCK_NOTIFICATIONS`) | No se usa en ningún lado. Borrarlo. |
| 10 | Configuración general del admin | `src/pages/admin/Settings.tsx:124` | "Configuración general próximamente...". Candidatos: umbrales de XP/niveles, reglas de alertas, feature flags por club. |
| 11 | Deportes en onboarding | `src/components/onboarding/steps/PersonalDataStep.tsx:163` | Deportes marcados "próximamente". Depende del punto 1 (planes por deporte). |
| 12 | Coach notes y asistencia sin superficie para padre/jugador | `useRoster.ts` (`coach_notes`), `useTrainingSessions.ts` (`session_attendance`) | Se cargan pero solo las ve el club. Exponer al padre la asistencia y (opcionalmente) las notas marcadas como "compartibles". |

---

## 2. Gaps por rol

- **Jugador:** no puede ver ni pedir su plan si no es de tenis; la IA no sabe cómo durmió ni qué entrena hoy; no hay retos sociales (el leaderboard es global, con `prizes`); no hay recordatorios fuera de la app.
- **Padre:** no hay tendencia (solo el último valor), ni alertas de dolor/sueño, ni resumen semanal, ni asistencia a entrenamientos, ni canal con el coach. No hay control parental de privacidad (qué ve el club, qué ve el ranking).
- **Coach / club_admin:** no puede crear planes (aunque la RLS lo permite); no hay "semáforo" de riesgo del plantel (dolor alto + carga alta + sueño bajo); no puede exportar; los anuncios no llegan por push/email; no hay calendario del club vinculado a `calendar_events`.
- **Admin:** configuración general vacía; no hay métricas de uso de la IA (costo por avatar, conversaciones por usuario) ni moderación de chats de menores.

---

## 3. Nuevas features

| # | Feature | Rol beneficiado | Valor de negocio | Esfuerzo | Dependencias técnicas |
|---|---|---|---|---|---|
| 1 | **Avatares con memoria del atleta** (contexto de logs, diagnóstico y plan en el prompt) | Jugador | Diferencial principal del producto; más retención del chat | S | `avatar-chat`, `daily_logs`, `diagnostic_history`, `training_plan_sessions` |
| 2 | **Plan adaptativo por IA** (genera el ciclo desde el diagnóstico y ajusta la sesión del día según el check-in) | Jugador, Coach | Desbloquea todos los deportes sin contenido manual; es la promesa central | L | Nueva edge function `generate-training-plan`, `training_plans`, `diagnostic_history`, `daily_logs` |
| 3 | **Constructor de planes para el coach** (plantillas, asignar a uno o varios jugadores, editar la IA) | Coach, club_admin | Convierte al club en cliente pagador; usa RLS que ya existe | M | `training_plans` (RLS del coach ya creada), `useRoster` |
| 4 | **Semáforo de riesgo del plantel** (dolor ≥ 5, sueño < 7 h, sobrecarga de ACWR con RPE × minutos) | Coach, Padre | Prevención de lesiones; argumento de venta B2B y de seguridad para familias | M | `daily_logs.pain_level`, `session_attendance.rpe`, `training_sessions.rpe_group`, vista SQL o RPC |
| 5 | **Resumen semanal para padres por email/WhatsApp** | Padre | Involucra al que paga; sin necesidad de abrir la app | M | Edge function con cron, `family_links`, Resend (email) / WhatsApp Cloud API, `profiles.preferences` |
| 6 | **PWA + push web** (instalable, recordatorio de check-in, anuncios del club) | Todos | Retención diaria; la racha depende de acordarse | M | `vite-plugin-pwa`, tabla `push_subscriptions`, VAPID, edge function `send-push` |
| 7 | **Check-in de bienestar por voz** ("¿cómo dormiste?" → ZAHIA extrae sueño/ánimo/dolor y llena `daily_logs`) | Jugador (8-12 años especialmente) | Menos fricción que un formulario para chicos | S-M | `whisper-transcribe` (ya existe), `avatar-chat` con salida estructurada (JSON), `useDailyLog` |
| 8 | **Retos entre amigos / del equipo** (ej.: "7 días hidratado", "3 entrenamientos esta semana") | Jugador, Coach | Viralidad dentro del club; alimenta XP y badges | M | Tablas `challenges` y `challenge_participants`, `useGamification`, `player_badges` |
| 9 | **Rankings por club y categoría** (en vez de solo el global) | Jugador, Coach | Competencia más justa y motivadora | S | `useLeaderboard` + filtro por `enrollments`/categoría, `prizes` por club |
| 10 | **Tendencias para el padre** (gráficos de 4 semanas de sueño, ánimo, dolor, asistencia) | Padre | Justifica la suscripción familiar | S | Recharts (ya instalado), `daily_logs`, `session_attendance`, RLS por `family_links` |
| 11 | **Análisis de video de técnica** (el jugador sube 15 s, la IA devuelve 3 correcciones vía TINO) | Jugador, Coach | Feature "wow" para marketing; muy alineada al avatar de entrenamiento | L | Supabase Storage, modelo de visión (frames muestreados), nueva edge function, moderación de menores |
| 12 | **Modo offline del check-in diario** | Jugador | Canchas y clubes con mala señal | M | Service worker (feature 6), cola en IndexedDB, sincronización con `daily_logs` |
| 13 | **Integración con wearables** (Google Fit / Apple Health: sueño y pasos) | Jugador (13-16 años) | Datos más confiables sin tipear | L | OAuth por proveedor, edge function de sincronización; Apple requiere app nativa. Postergar |
| 14 | **Marketplace / directorio de clubes** (búsqueda por deporte y zona, solicitud de inscripción) | Padre, club_admin | Adquisición B2B2C: los clubes traen jugadores | L | `clubs`, `enrollments`, `useEnrollment` (ya existe el flujo de inscripción), página pública |
| 15 | **Canal padre ↔ coach** (mensajes 1:1 con registro y moderación) | Padre, Coach | Reemplaza grupos de WhatsApp informales; trazabilidad para el club | M | Tabla `messages`, Supabase Realtime, reglas de protección de menores |
| 16 | **Panel de costos y moderación de la IA** (tokens por avatar, alertas de palabras de riesgo en chats de menores) | Admin | Control de costos y cumplimiento (menores de edad) | M | `ai_messages`, log de uso en `avatar-chat`, `useAnalytics` |

---

## 4. Top 5 recomendadas

### 4.1 Avatares con memoria del atleta (S)

- **Qué:** TINO, ZAHIA y ROMA responden sabiendo edad, deporte, sueño, energía y dolor de los últimos 7 días, puntajes del diagnóstico y la sesión de hoy.
- **Por qué:** es el diferencial prometido ("entrenamiento con IA") y hoy no pasa. Es el mayor salto de valor por hora de trabajo.
- **Cómo:**
  - En `supabase/functions/avatar-chat/index.ts`, antes de armar `systemPrompt` (línea ~330), consultar con el `user_id` autenticado `profiles` (edad, deporte), `daily_logs` (últimos 7), `diagnostic_history` (último por eje) y `training_plan_sessions` (hoy).
  - Serializar un bloque corto `PERFIL DEL ATLETA` (menos de 400 tokens) y agregarlo al prompt. Filtrar por avatar: ZAHIA recibe sueño e hidratación, TINO recibe plan y dolor, ROMA recibe ánimo y energía.
  - Regla de seguridad en el prompt: si `pain_level ≥ 7`, derivar a un adulto o profesional y no prescribir ejercicio.
  - Nota: la función tiene `verify_jwt = false`; tomar el `user_id` del JWT validado, nunca del body.

### 4.2 Plan adaptativo por IA + constructor para el coach (L, en 2 fases)

- **Qué:** fase A: edge function que genera un ciclo de 4 semanas desde el diagnóstico, el deporte y la categoría. Fase B: cada mañana ajusta la sesión del día según el check-in (sueño bajo o dolor → baja intensidad o descanso). El coach puede ver, editar y asignar.
- **Por qué:** elimina el "Próximamente disponible para {deporte}" de `Training.tsx` y abre todos los deportes del onboarding sin cargar contenido a mano.
- **Cómo:**
  - Nueva edge function `generate-training-plan`: input `user_id`; lee `diagnostic_history` y `profiles`; llama al LLM con salida JSON validada (estructura = `DaySession`/`ExerciseBlock` de `useTrainingPlan.ts`); inserta en `training_plans` + `training_plan_sessions` con `coach_id` nulo o el del coach.
  - Disparo: al terminar `/diagnostic` (en `useDiagnostic`) y desde un botón "Generar plan" en el empty state de `Training.tsx`.
  - Ajuste diario: función `adapt-today-session` invocada al guardar el log en `useDailyLog`; reescribe `target_rpe`/`exercises` de la sesión de hoy y guarda el motivo (columna nueva `adaptation_note`).
  - Coach: nueva vista `/club/plans` que reutiliza componentes de `components/training/` en modo edición; la RLS ya lo permite.
  - Opcional: usar los RAG de TINO (`rag_tino`) como fuente de ejercicios aprobados, para que la IA no invente.

### 4.3 Semáforo de riesgo del plantel (M)

- **Qué:** en `ClubDashboard` y `TrainingLoad`, cada jugador aparece en verde, amarillo o rojo según dolor, sueño, relación de carga aguda/crónica (ACWR con RPE × minutos) y habilitación médica vencida. El padre ve el mismo indicador para su hijo.
- **Por qué:** es el argumento de venta al club (prevención de lesiones) y de confianza para la familia. Los datos ya se cargan.
- **Cómo:**
  - Vista o RPC SQL `get_player_risk(club_id)` que combine `daily_logs` (dolor y sueño de los últimos 3 días), `session_attendance.rpe` × duración de `training_sessions` (7 contra 28 días) y `medical_clearances` (vencimiento). Proteger con `get_users_in_same_clubs` (ya existe en `20260413200000_add_club_helper_functions.sql`).
  - Hook `usePlayerRisk` + badge en `components/club/roster`.
  - Generar notificación al coach (tabla `notifications`) cuando un jugador pasa a rojo.

### 4.4 PWA + push + preferencias en el servidor (M)

- **Qué:** app instalable; push para el recordatorio del check-in (con la racha en juego), anuncios del club, jugador en rojo (coach) y resumen listo (padre).
- **Por qué:** la gamificación por rachas no funciona sin recordatorios. Hoy las notificaciones solo existen con la app abierta.
- **Cómo:**
  - `vite-plugin-pwa` (manifest con `logo.png`; `vercel.json` ya tiene el ruteo SPA).
  - Tabla `push_subscriptions (user_id, endpoint, keys, created_at)`; mover `useSettings` a `profiles.preferences jsonb` para respetar horarios y opt-outs.
  - Edge function `send-push` (web-push con VAPID) + trigger `AFTER INSERT` en `notifications` que la invoque, así todo lo que ya inserta en `notifications` (incluido `useClubAnnouncements`) sale también por push.
  - Mover las reglas de `useNotificationGenerator.ts` a un cron diario (`pg_cron` → edge function) para que corran aunque nadie abra la app.
  - Para menores: push solo con consentimiento del padre (flag en `family_links`).

### 4.5 Resumen semanal para padres (email, luego WhatsApp) + tendencias (M)

- **Qué:** cada domingo el padre recibe: días registrados, promedio de sueño y ánimo, alertas de dolor, asistencia, badges ganados y una frase de ROMA/ZAHIA generada por IA. En la app, `ParentChild` suma gráficos de 4 semanas.
- **Por qué:** el padre es quien paga y hoy ve 4 números sueltos. Un resumen fuera de la app es el mayor motor de retención B2C.
- **Cómo:**
  - Edge function `weekly-parent-digest` con cron semanal: por cada `family_links` activo, agrega `daily_logs`, `session_attendance`, `player_badges` y `player_stats`; genera 2 líneas con `gpt-4o-mini` (ya usado en `avatar-chat`); envía con Resend (email en español es-AR).
  - WhatsApp Cloud API como segundo canal (requiere plantilla aprobada por Meta y opt-in explícito).
  - Frontend: `ParentChild.tsx` + nuevo hook `useChildTrends` con Recharts; tabla `digest_log` para no enviar duplicados y mostrar el historial.
  - Revisar la RLS: el padre debe poder leer `daily_logs` y `session_attendance` del hijo vía `family_links`.

---

## 5. Orden sugerido

1. **Semana 1 (quick wins):** puntos 5, 6 y 9 de la sección 1, el export CSV y el radar sin mock. Luego la feature 4.1 (avatares con memoria).
2. **Semanas 2-3:** feature 4.4 (PWA/push + preferencias en el servidor) y feature 4.3 (semáforo de riesgo).
3. **Semanas 3-5:** feature 4.2 (plan IA, fase A y después la B) y el constructor del coach.
4. **Semana 5-6:** feature 4.5 (resumen para padres), rankings por club y retos.
5. **Después, validando demanda:** check-in por voz, análisis de video, marketplace de clubes, wearables.
