# Informe 01 — Fluidez y performance percibida

Fecha: 2026-09-25 · Alcance: frontend (`src/`) y la edge function `avatar-chat`. No se modificó código.
No se corrió `npm run build` porque no hay `node_modules`. Los tamaños de bundle que aparecen abajo son estimaciones hechas a partir de las dependencias.

## Resumen ejecutivo

- **Todo va en un solo bundle.** `App.tsx` importa las 30 páginas en forma estática. Un chico que abre `/login` en el celular descarga three.js, R3F/drei, recharts, el panel admin y el de club (estimado: más de 1.5 MB de JS minificado).
- **El Dashboard monta 4 `<Canvas>` WebGL a la vez**, cada uno con `shadows`, `dpr` hasta 2 y un loop `useFrame` a 60 fps. Es el mayor costo de CPU, GPU y batería de la app, y justo en la pantalla más visitada.
- **React Query está instalado pero sin usar.** Solo 1 archivo lo usa. Los otros ~25 hooks cargan datos con `useEffect` y `useState`: no hay caché ni deduplicación, y cada navegación vuelve a pedir todo. `daily_logs` se pide 3 veces en el Dashboard y `player_stats` 2 veces.
- **Cada página monta su propio `AppLayout`.** Al navegar se desmontan y se vuelven a montar Sidebar, Header y `NotificationBell`, y con eso se re-suscribe Realtime y se vuelven a pedir los logs de 60 días y el calendario.
- **El chat IA se siente lento.** No hay streaming: primero espera el guardado del mensaje del usuario y después la edge function hace 5 awaits en serie antes de llamar a OpenAI. Los PNG de avatares pesan 3 MB cada uno (1732–1824 px) y se usan como íconos.

## Hallazgos priorizados

| # | Hallazgo | Impacto | Esfuerzo | Ubicación |
|---|----------|---------|----------|-----------|
| 1 | Sin code-splitting de rutas | Alto | S | `src/App.tsx:12-52` |
| 2 | 4 Canvas WebGL simultáneos en el Dashboard | Alto | M | `src/components/avatars/AvatarScene.tsx:22-26`, `src/pages/Dashboard.tsx:58-110` |
| 3 | PNG de avatares de 3 MB (x3) usados como miniaturas | Alto | S | `src/assets/*-avatar.png`, `src/pages/Chat.tsx:8-10`, `src/components/ui/empty-state.tsx:5-7` |
| 4 | Fetch manual en lugar de React Query: sin caché ni dedupe | Alto | L | `src/hooks/*` (solo 1 archivo usa `useQuery`), `src/App.tsx:54` |
| 5 | `AppLayout` dentro de cada página: el shell se remonta al navegar | Alto | M | `src/layouts/AppLayout.tsx:15`, `src/pages/*.tsx` |
| 6 | Chat sin streaming y con waterfall cliente → edge | Alto | M | `src/pages/Chat.tsx:233-252`, `supabase/functions/avatar-chat/index.ts:271-339` |
| 7 | Queries duplicadas en el Dashboard (`daily_logs` x3, `player_stats` x2) | Medio | M | `src/hooks/useDashboardData.ts:49`, `src/hooks/useDailyLog.ts:59`, `src/hooks/useGamification.ts:26`, `src/hooks/useNotificationGenerator.ts:317-318` |
| 8 | `AuthContext`: value sin memo, rebuild en cada refresh de token y roles/perfil en serie | Medio | S | `src/contexts/AuthContext.tsx:57-73, 100-117, 153-161` |
| 9 | Spinner a pantalla completa en `RouteGuard` mientras carga el auth | Medio | S | `src/components/RouteGuard.tsx:18-27` |
| 10 | Sin chunking manual de vendors en Vite | Medio | S | `vite.config.ts` |
| 11 | Pocos skeletons (5 de 22 páginas) | Medio | M | `src/pages/*` |
| 12 | Sin optimistic updates (el chat es la excepción) | Medio | M | `src/hooks/useDailyLog.ts:95-142`, `src/hooks/useNotifications.ts:101-118` |
| 13 | `PageTransition` con `exit` que nunca corre y `y:20` en cada montaje | Bajo | S | `src/layouts/PageTransition.tsx:10-14` |
| 14 | `OnboardingContext` value sin memo | Bajo | S | `src/contexts/OnboardingContext.tsx:239-242` |

---

### 1. Sin code-splitting de rutas — Alto / S
**Problema.** Las 30 páginas se importan de forma estática (`App.tsx:12-52`). Por eso three (~600 KB), drei, R3F, recharts (~400 KB) y el código de admin y club terminan en el chunk inicial. Esto golpea sobre todo en celulares de gama media, que son el público objetivo.
**Propuesta.** Dejar eager solo Landing, Login y Register, y pasar el resto a `lazy`. Usar un fallback liviano.
```tsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Chat = lazy(() => import('./pages/Chat'));
// ...
<Suspense fallback={<PageSkeleton />}><Routes>…</Routes></Suspense>
```
Sumar un prefetch en hover/focus de los links del Sidebar (`onMouseEnter={() => import('@/pages/Chat')}`) para que la navegación siga siendo instantánea.

### 2. Cuatro Canvas WebGL en el Dashboard — Alto / M
**Problema.** `ProgressWidget`, `HealthWidget`, `TechniqueWidget` y `PhysicalTrainingWidget` renderizan cada uno un `<AvatarScene>`. Son 4 contextos WebGL con `shadows`, `antialias`, `dpr={[1,2]}` y un `useFrame` corriendo siempre, aunque el widget esté fuera de pantalla o la pestaña esté en segundo plano. En celulares esto trae jank al scrollear, calentamiento y consumo de batería. Además, el Canvas aparece de golpe (`Suspense fallback={null}`).
**Propuesta (en orden de costo):**
1. Configuración más barata: `dpr={[1,1.5]}`, sacar `shadows`/`castShadow` (el fondo es alpha y no hay superficie que reciba la sombra) y `frameloop="demand"` más un `invalidate()` dentro de la animación, o pausar cuando no está visible.
2. Montar el Canvas solo cuando es visible, con `IntersectionObserver`, y mostrar mientras tanto el PNG/WebP estático del avatar como placeholder.
3. Lo ideal: **un único Canvas** para toda la página, usando `<View>` de drei para los 4 viewports, o reemplazar los widgets chicos por imagen/Lottie y dejar el 3D solo en el Hero.
4. Respetar `prefers-reduced-motion`: sin loop y con imagen estática.
```tsx
<Canvas dpr={[1, 1.5]} frameloop={visible ? 'always' : 'never'} gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}>
```

### 3. PNG de avatares de 3 MB — Alto / S
**Problema.** `tino/roma/zahia-avatar.png` pesan ~3 MB cada uno (1732–1824 px, RGB sin compresión) y se muestran como avatares de 32–96 px en el chat, en empty-state, en error-state, en el perfil y en preferencias. Abrir el Chat descarga ~9 MB de imágenes.
**Propuesta.** Exportarlos en WebP/AVIF a 256 px y 512 px (~15–40 KB cada uno), usar `srcSet`, `loading="lazy"` y `decoding="async"`, y declarar `width`/`height` para evitar CLS. Opcional: `vite-imagetools` para generarlos en el build. Ahorro estimado: más del 99% del peso de estas imágenes.

### 4. React Query sin usar — Alto / L
**Problema.** `QueryClient` está creado con los defaults (`App.tsx:54`), pero los hooks (`useDailyLog`, `useGamification`, `useCalendarEvents`, `useLeaderboard`, `useDashboardData`, etc.) hacen `useEffect` → `supabase.from()` → `setState`. En consecuencia:
- volver a una pantalla muestra el spinner otra vez (no hay stale-while-revalidate);
- dos componentes que usan el mismo hook duplican el request;
- no hay retry, ni invalidación después de una mutación, ni cancelación.

**Propuesta.** Migrar de a poco, empezando por los hooks del Dashboard y del Header. Definir defaults globales:
```ts
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, gcTime: 10 * 60_000, refetchOnWindowFocus: false, retry: 1 } },
});
// useDailyLog
useQuery({ queryKey: ['daily_logs', user?.id, 60], queryFn: fetchLogs, enabled: !!user });
```
Usar claves compartidas (`['player_stats', uid]`, `['daily_logs', uid]`) para que los widgets compartan la caché.

### 5. `AppLayout` por página — Alto / M
**Problema.** Cada página hace `<AppLayout>…</AppLayout>`. Al cambiar de ruta React desmonta el layout entero: Sidebar, Header y `NotificationBell`. Eso vuelve a ejecutar `useNotifications` (fetch más un canal Realtime nuevo, `useNotifications.ts:63`) y `useNotificationGenerator`, que a su vez vuelve a pedir `daily_logs` de 60 días y `calendar_events`. El resultado es un parpadeo del shell y 3–4 requests en cada click del menú.
**Propuesta.** Usar un layout route con `<Outlet/>` y sacar `AppLayout` de las páginas:
```tsx
<Route element={<RouteGuard><AppLayout><Outlet/></AppLayout></RouteGuard>}>
  <Route path="/dashboard" element={<Dashboard/>} />
  …
</Route>
```
Poner la `PageTransition` dentro del layout, con `key={location.pathname}`.

### 6. Chat IA: sin streaming y con waterfall — Alto / M
**Problema.**
- Cliente: `await saveMessage(convoId,'user',…)` bloquea antes de invocar la función (`Chat.tsx:233`). Además, en el primer mensaje se hace `createNewConversation` y después se guarda, todo en serie.
- Edge: `getUser` → dueño de la conversación → historial → embedding → RPC RAG → OpenAI, 6 awaits en serie (`index.ts:271-339`). El historial y el embedding no dependen entre sí.
- La respuesta llega completa, y encima se reparte con `setTimeout(i*450)`. El usuario mira un "escribiendo…" durante 3–8 s.

**Propuesta.**
1. Lanzar `saveMessage` del usuario sin await (fire-and-forget con manejo de error) o dejar que lo guarde la edge function.
2. En la edge, paralelizar: `const [msgs, embedding] = await Promise.all([historyQuery, getEmbedding(...)])`. Lo mismo con el chequeo de dueño y el historial.
3. Hacer streaming: `stream: true` hacia OpenAI, devolver `text/event-stream` y leerlo en el cliente con `fetch` + `res.body.getReader()` (`functions.invoke` no hace streaming). El primer token aparece en ~500 ms. Si hace falta mantener el formato `respuesta: string[]`, se puede cortar por un separador dentro del stream.

### 7. Queries duplicadas en el Dashboard — Medio / M
**Problema.** En una sola carga del Dashboard:
- `daily_logs`: `useDashboardData` (latest más weekly), `TodayCard` → `useDailyLog` (60 días) y `NotificationBell` → `useNotificationGenerator` → `useDailyLog` (60 días otra vez);
- `player_stats`: `useDashboardData` y `GamificationWidget` → `useGamification`;
- `badges` se pide completo en cada montaje, aunque es un catálogo estático.

**Propuesta.** Se resuelve solo con el punto 4 si se usan claves compartidas. Mientras tanto, se puede subir `useDailyLog` a un provider. Para `badges`, usar `staleTime: Infinity`.

### 8. AuthContext — Medio / S
**Problema.**
- `onAuthStateChange` también dispara en `TOKEN_REFRESHED` y al volver el foco a la pestaña. Cada vez llama a `buildUser` (2 queries) y hace `setUser` con un objeto nuevo, lo que re-renderiza todos los consumidores de `useAuth` (RouteGuard, Header, Sidebar y todas las páginas).
- `user_roles` y `profiles` se consultan en serie (`AuthContext.tsx:57-73`).
- El `value` y las funciones (`login`, `logout`, `hasRole`) se recrean en cada render.

**Propuesta.**
```ts
if (event === 'TOKEN_REFRESHED' && user?.id === session?.user.id) return; // no rebuild
const [rolesRes, profileRes] = await Promise.all([rolesQ, profileQ]);
const value = useMemo(() => ({ user, isLoading, login, register, logout, isAuthenticated: !!user, hasRole }), [user, isLoading]);
```
Con `useCallback` en `hasRole`, `login` y `logout`.

### 9. Spinner bloqueante en RouteGuard — Medio / S
**Problema.** Mientras `isLoading` está activo se muestra un spinner a pantalla completa con "Cargando...", en cada carga en frío de cualquier ruta protegida. Como `buildUser` hace 2 queries en serie, el spinner dura ~300–800 ms.
**Propuesta.** Aplicar el `Promise.all` del punto 8. Además, mostrar el shell (`AppLayout` con skeleton) en lugar del spinner. Opcional: cachear `role`/`name` en `localStorage` para renderizar optimista y validar en segundo plano.

### 10. Chunking de vendors — Medio / S
**Problema.** No hay `build.rollupOptions.output.manualChunks`. Un cambio en cualquier página invalida la caché de todo el vendor.
**Propuesta.**
```ts
build: { rollupOptions: { output: { manualChunks: {
  three: ['three', '@react-three/fiber', '@react-three/drei'],
  charts: ['recharts'], motion: ['framer-motion'],
  supabase: ['@supabase/supabase-js'], react: ['react', 'react-dom', 'react-router-dom'],
}}}}
```
Correr `npx vite-bundle-visualizer` una vez que esté `node_modules` para validar.

### 11. Cobertura de skeletons — Medio / M
**Problema.** Existen `src/components/skeletons/*` (Card, Calendar, Chat, List, TodayCard, Widget), pero solo 5 de 22 páginas los usan. El resto muestra un spinner o un contenido vacío que "salta" cuando llegan los datos (CLS).
**Propuesta.** Crear un `PageSkeleton` genérico para el fallback de `Suspense` (punto 1) y sumar skeletons en Leaderboard, Achievements, Training, Calendar, Classroom y las páginas de club, siempre con la misma altura que el contenido final.

### 12. Optimistic updates — Medio / M
**Problema.** Registrar el log diario, marcar notificaciones como leídas o borrarlas esperan la respuesta de la red antes de actualizar la UI (o hacen refetch). El chat es el único que agrega el mensaje optimista.
**Propuesta.** Con React Query, usar `useMutation` con `onMutate` (hacer `setQueryData` y guardar un snapshot), `onError` (rollback) y `onSettled` (invalidate). Prioridad: `markAsRead`/`markAllAsRead`, el guardado del log diario (TodayCard) y el XP/racha que se ve en GamificationWidget.

### 13. PageTransition — Bajo / S
**Problema.** El `exit` nunca corre porque no hay `AnimatePresence`, y cada página arranca desplazada 20 px con opacidad 0 durante 300 ms, un retraso que se siente como lentitud. Además hay 102 archivos con `framer-motion` y muchas animaciones de entrada escalonadas por ítem (por ejemplo en `Leaderboard.tsx:49-52`).
**Propuesta.** Bajar a `duration: 0.15` con `y: 8`, o solo opacidad. Importar `LazyMotion` + `domAnimation` y usar `m.div` para reducir ~30 KB. Respetar `useReducedMotion()`.

### 14. OnboardingContext — Bajo / S
**Problema.** El `value` es un objeto literal nuevo en cada render, y `updateData`/`completeOnboarding` no están memoizados. El impacto es acotado porque el provider solo envuelve `/onboarding`.
**Propuesta.** Usar `useMemo` en el value y `useCallback` en los setters.

---

## Quick wins (<1 día)

1. **Lazy routes** en `App.tsx` con `Suspense` y un `PageSkeleton` (punto 1): unas 2 h. Es el mayor impacto en la carga inicial.
2. **Recomprimir los 3 avatares** a WebP 256/512 px y actualizar los imports (punto 3): unas 1–2 h. Ahorra ~9 MB.
3. **Abaratar AvatarScene**: `dpr [1,1.5]`, sin `shadows`, `antialias:false`, `frameloop` controlado por visibilidad (punto 2, pasos 1 y 2): unas 3 h.
4. **Defaults del QueryClient** (`staleTime 60s`, `refetchOnWindowFocus:false`), aunque se migren pocos hooks: 15 min.
5. **AuthContext**: `Promise.all` para roles y perfil, ignorar `TOKEN_REFRESHED` y `useMemo` en el value (punto 8): unas 1 h.
6. **Chat**: quitar el `await` de `saveMessage` del usuario y paralelizar historial + embedding en la edge function (punto 6, pasos 1 y 2): unas 1–2 h, sin tocar el contrato.
7. **`manualChunks`** en `vite.config.ts` (punto 10): 20 min.
8. **PageTransition** más corta (0.15 s, `y: 8`) (punto 13): 5 min.
