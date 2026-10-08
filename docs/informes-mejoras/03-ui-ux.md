# 03 — Auditoría UI/UX

> Fecha: 2026-09-25 · Alcance: revisión del código de `src/` + capturas de landing y login (mobile 390px / desktop 1440px) en `img/`. No se modificó código.

## Resumen ejecutivo

La base es sólida: shadcn/ui con tokens HSL, onboarding que varía según el rol, skeletons en dashboard y chat, y voseo en casi todo el texto. Los problemas más serios son de **coherencia y de producto**, no de estética:

1. **El dashboard del jugador no tiene un orden claro y muestra datos falsos o en cero.** Son 9 bloques del mismo peso. Un widget de *navegación a vela* se muestra a todos los deportes con valores en `0`, y el badge "3" del chat está fijo en el código.
2. **El modo oscuro está roto.** El tema se aplica solo cuando se monta `/settings`. Al recargar la página se pierde. Además hay 467 clases de paleta Tailwind fijas y 118 hex sueltos que no responden a `.dark`.
3. **En mobile faltan secciones clave.** La barra inferior tiene 5 ítems y deja afuera *Ranking* y *Aula*. La landing tiene scroll horizontal (404px de ancho contra un viewport de 390px).
4. **El onboarding del jugador es largo para un chico de 8 a 12 años:** 8 pasos, unos 80 campos, errores que solo aparecen en toast y el avatar recién al final.
5. **La gamificación existe pero no celebra.** No hay "próximo logro", mientras carga el widget devuelve `null` y los niveles se muestran con los nombres internos en inglés (`bronze/silver/...`).
6. **Accesibilidad básica incompleta:** botones de ícono sin `aria-label`, un `Card` clickeable sin teclado, el chat sin `aria-live`, contraste blanco sobre naranja y texto de 10px.

## Hallazgos priorizados

| # | Hallazgo | Impacto | Esfuerzo | Ubicación |
|---|----------|---------|----------|-----------|
| 1 | El tema claro/oscuro solo se aplica cuando se monta `useSettings`. Si recargás cualquier otra página vuelve a claro. `sonner` usa `next-themes` sin provider | Alto | S | `src/hooks/useSettings.ts:23-42`, `src/main.tsx:1-5`, `src/components/ui/sonner.tsx` |
| 2 | El fondo global usa `via-purple-50/30 to-blue-50/30` fijo, así que en modo oscuro aparece un velo claro | Alto | S | `src/layouts/AppLayout.tsx:22` |
| 3 | `.dark` no redefine `--netia-bg-*`, `--success/warning/danger` ni `--sidebar-*` | Medio | S | `src/index.css:84-117` |
| 4 | 467 clases de paleta fija (`bg-blue-500`, `text-gray-600`...) y 118 hex sueltos. Los que más tienen: `message-dock.tsx` (20), `PrizeCard.tsx` (12), `HealthMetricsPanel.tsx` (12), `MetricCard.tsx` (11 hex), `ActivityCard.tsx` (10 hex) | Medio | M | ver grep en el apéndice |
| 5 | Widget de **navegación a vela** fijo en el dashboard de todos los deportes, con todos los valores en `0` ("Horas navegadas", "Dirección del viento") | Alto | S | `src/pages/Dashboard.tsx:81-88`, `src/components/dashboard/SailingCalendarWidget.tsx:45-72` |
| 6 | Métricas mostradas como `0` porque no hay datos (`reactionTime={0}`, `maxSpeed={0}`, `attendance total: 7`). Para el chico parece que "no hizo nada" | Alto | S | `src/pages/Dashboard.tsx:103-110` |
| 7 | El badge "3" de Chat IA está fijo en el código (en mobile encima tiene `animate-pulse`) | Medio | S | `src/components/navigation/MobileNav.tsx:16`, `src/components/dashboard/Sidebar.tsx:30` |
| 8 | En mobile no hay acceso a **Ranking** ni **Aula**: la bottom nav tiene 5 ítems y no hay menú "Más" | Alto | S | `src/components/navigation/MobileNav.tsx:12-18` |
| 9 | La landing en mobile desborda en horizontal: `scrollWidth` da 404 contra 390 | Medio | S | `src/components/landing/*` (medido con Playwright) |
| 10 | El H1 de la landing en desktop tiene las líneas encimadas (`leading-tight` con íconos inline a 46px) y usa el color fijo `#363636` | Medio | S | `src/components/landing/HeroSection.tsx:26` |
| 11 | La landing se contradice: "+100 alumnos" arriba y "1400+ Alumnos" en las stats. "Saber mas" va sin tilde. El hero tiene 3 CTAs que compiten entre sí | Medio | S | `HeroSection.tsx:22,62`, `StatsSection.tsx:6` |
| 12 | Login: la clase `glass-card` no está definida en ningún CSS. Texto blanco y errores `text-red-300` sobre un degradé que termina en naranja (#FF6F3C con blanco da ~2.8:1 y no cumple AA). No hay "¿Olvidaste tu contraseña?" | Alto | S | `src/pages/Login.tsx:65,82,102,164` |
| 13 | Mezcla de tuteo y voseo: "¿No tienes cuenta? Regístrate", "Intenta nuevamente" frente a "Completá", "Elegí" | Bajo | S | `Login.tsx:226-228`, `Chat.tsx:259` |
| 14 | El rol se muestra crudo en inglés (`player`, `club_admin`) en el header y el sidebar. Otros textos en inglés: "Dashboard" (admin), "Coaches", "Toggle Sidebar", "Next" | Medio | S | `Header.tsx:74`, `Sidebar.tsx:56`, `MobileNav.tsx:35`, `club/Communication.tsx:30`, `ui/sidebar.tsx:237,252`, `ui/pagination.tsx:59` |
| 15 | El onboarding del jugador tiene **8 pasos** y unos 80 controles (PersonalData 20, Físico 26, Objetivos 10). Los errores aparecen solo en toast, sin marcar el campo con problema | Alto | M | `src/pages/Onboarding.tsx:37-46,100-114` |
| 16 | El paso "Familia" le pide email del tutor y aceptar términos **al chico**. Eso lo tendría que hacer el adulto (en un flujo aparte o por invitación) | Alto | M | `Onboarding.tsx:111`, `steps/FamilyStep.tsx` |
| 17 | Elegir avatar es el **último** paso cuando es lo más atractivo. Conviene ponerlo primero para que el avatar guíe el resto del onboarding | Medio | S | `Onboarding.tsx:45` |
| 18 | `GamificationWidget` devuelve `null` mientras carga (hay salto de layout). El `Card` tiene `onClick` pero no es navegable con teclado | Medio | S | `src/components/dashboard/GamificationWidget.tsx:22,30` |
| 19 | Los nombres de nivel en UI salen de claves en inglés (`bronze/silver/gold/elite`). Falta "próximo logro" y cuánto XP falta en lenguaje de chico | Medio | S | `src/components/gamification/LevelBadge.tsx:19-29`, `XPProgressBar.tsx:44` |
| 20 | Chat: las sugerencias del estado vacío general son no-op (`onSuggestionClick={() => {}}`). La altura usa `100vh`, que en iOS falla con la barra del navegador. No hay `aria-live` para las respuestas | Medio | S | `src/pages/Chat.tsx:278,301` |
| 21 | Chat: el input queda deshabilitado mientras el avatar responde, así que no se puede ir escribiendo. El error es un toast genérico sin botón de reintento | Bajo | S | `Chat.tsx:259,342` |
| 22 | Unos 38 `Button size="icon"` sin `aria-label` en la misma línea (hay que verificar los multilínea) | Medio | S | `grep 'size="icon"'` |
| 23 | 44 usos de `text-[10px]`/`text-[9px]`, sobre todo en training y calendar. Es ilegible para público infantil | Medio | S | `training/SessionDetail.tsx`, `WeekView.tsx`, `LessonRow.tsx` |
| 24 | La bottom nav no respeta `safe-area-inset-bottom`, así que en iPhone queda debajo del home indicator | Medio | S | `MobileNav.tsx:53` |
| 25 | Casi no se usa `prefers-reduced-motion` (3 usos) a pesar de que hay mucho Framer Motion, `animate-float` infinito y avatares 3D | Bajo | S | `src/index.css:156`, `layouts/PageTransition.tsx` |
| 26 | Faltan estados de error en las páginas: solo `Chat` y `Settings` manejan `error`. `EmptyState` se usa en 3 lugares y `ErrorState` en 1 | Medio | M | `src/pages/*.tsx` |
| 27 | Las animaciones `fade-in` y `slide-up` están declaradas en `animation`, pero sus `keyframes` no existen (no hacen nada) | Bajo | S | `tailwind.config.ts:109-110` |
| 28 | Todas las rutas se importan de forma sincrónica (Three.js, admin y club en el bundle inicial), lo que hace más lenta la primera pintura en mobile | Medio | S | `src/App.tsx:11-52` |

## Propuestas por pantalla clave

### Dashboard del jugador (`src/pages/Dashboard.tsx`)
Hoy el orden es TodayCard, AvatarMessage, inscripción a club, Gamificación + Progreso, Salud + Vela, Técnica + Físico y Evolución: 9 bloques con el mismo peso visual.

Propuesta de 3 niveles:
1. **Arriba, "Tu día":** saludo con el avatar elegido, **una sola acción principal** ("Registrá cómo te sentís hoy", o "Arrancá tu entrenamiento" si el registro ya está hecho), y la racha grande con llama animada.
2. **Al medio, "Tu progreso":** barra de XP y nivel, **próximo logro** ("Te faltan 2 días para *Racha de 7*"), y 3 métricas clave con sparkline. Si no hay datos, mostrar un estado vacío que invite a hacer algo, no un `0`.
3. **Abajo, colapsable, "Detalle":** salud, técnica, físico y evolución.
- `SailingCalendarWidget` solo se muestra si `sport === 'vela'`. Los widgets por deporte tienen que salir de un registro de deportes.
- "Unirme a club" y la lista de inscripciones pasan a Perfil, o a un banner que se puede cerrar si no tiene club.
- Sacar la card de "Progreso" duplicada: `GamificationWidget` y `ProgressWidget` usan el mismo concepto.

### Onboarding (`src/pages/Onboarding.tsx`)
- **Reducir de 8 a 4 pasos para el chico:** (1) Elegí tu avatar, (2) Vos: nombre, fecha, deporte y nivel, (3) Tu meta, (4) Invitá a tu mamá, papá o tutor. Nutrición, físico, mental y calendario pasan a **misiones progresivas** en la app, cada una con XP ("Completá tu perfil físico: +50 XP").
- Validar en línea: marcar el campo en rojo con un mensaje debajo, llevar el scroll y el foco al primer error, y deshabilitar "Siguiente" con una pista de qué falta.
- Mostrar "Te falta 1 minuto" o "Paso 2 de 4 · ~30 s" para bajar la ansiedad.
- Los términos y el email del tutor van en un flujo **del adulto**: magic link al email del tutor, con la cuenta del chico "pendiente de autorización". Cumple mejor con la protección de datos de menores.
- En mobile, el `ProgressBar` usa `currentStep/totalSteps` y en desktop `(currentStep-1)/(totalSteps-1)`: unificar el cálculo.

### Chat con avatares (`src/pages/Chat.tsx`)
- Si no hay avatar elegido, que las sugerencias preseleccionen al avatar adecuado y envíen el mensaje, en vez de ser no-op.
- Usar `h-[100dvh]` y sacar el doble padding (`pb-24` más la bottom nav) que achica el área útil en mobile.
- Mostrar el mic de `AIInput` como botón grande en mobile, porque para chicos de 8 a 10 años hablar es más fácil que escribir. Agregar `aria-label="Grabar mensaje"`.
- En el error, dejar una burbuja inline "No pude responder. Reintentar" en lugar del toast.
- Poner `role="log" aria-live="polite"` en el contenedor de mensajes.
- Microinteracción: cambiar de avatar cambia el color de acento del chat (`--avatar-tino/zahia/roma`). Ya existen los tokens.

### Gamificación (`src/components/gamification/*`, `pages/Achievements.tsx`)
Para un chico de 10 años hoy es "una barra y unos íconos". Falta:
- **Nombres de nivel en español y con identidad:** Bronce, Plata, Oro, Élite, o mejor "Novato, Promesa, Crack, Leyenda".
- **Celebración al ganar XP o insignia:** hoy el confetti solo existe en `OnboardingResult`, `Leaderboard` y `DailyLogSheet`. Hace falta un toast animado "+20 XP" y un modal de level-up con el avatar festejando, usando `useHaptic` en mobile.
- **Siguiente meta visible**, con una insignia bloqueada en silueta y su progreso ("3/7 días").
- **Racha protegida:** un "comodín" semanal para que no se pierda todo por un día. Es clave para no frustrar a los más chicos.
- Skeleton en vez de `return null` mientras carga.

### Navegación (`MobileNav.tsx`, `Sidebar.tsx`, `Header.tsx`)
- Bottom nav: Inicio, Entrenar, Chat (en el centro, destacado con el color del avatar), Logros y **Más**. Más abre un sheet con Calendario, Ranking, Aula, Perfil y Configuración.
- Agregar `pb-[env(safe-area-inset-bottom)]` a la nav y `aria-current` al ítem activo. La etiqueta de texto del ítem activo tiene que ir en negrita, no solo con cambio de color.
- En el header, traducir el rol con un mapa (`player` → "Deportista", `club_admin` → "Admin. de club").

### Landing y Login
- Corregir el overflow horizontal en mobile: buscar el elemento con `w-[...]` o una imagen sin `max-w-full`.
- Hero con **1 CTA principal** ("Probar Demo") y uno secundario ("Inscribite"). Sacar "Saber mas" o convertirlo en un link.
- Unificar la cifra de alumnos y la marca: "Netia" en naranja en el nav, "NETIA" en el login y logo naranja con el primario en azul.
- Login: definir `.glass-card`, oscurecer el degradé o poner la card sobre un fondo sólido para llegar a AA, agregar "¿Olvidaste tu contraseña?", pasar el texto a voseo ("¿No tenés cuenta? Registrate") y agregar un botón "Mostrar contraseña".

## Quick wins (menos de 1 día en total)

1. Llamar `applyTheme()` al iniciar la app en `main.tsx`, leyendo el `localStorage` de settings (arregla el #1).
2. `AppLayout.tsx:22` → `bg-background` más `dark:` variants, o un token `--app-gradient`.
3. Sacar el `badge: 3` fijo, o calcularlo desde los mensajes no leídos.
4. Mostrar `SailingCalendarWidget` solo para vela, y cambiar los `0` por "—" o un estado vacío con CTA.
5. Agregar "Más" a la bottom nav con Ranking y Aula, y el safe-area.
6. Mapa de roles a español en Header y Sidebar. Traducir "Toggle Sidebar" y "Next".
7. Login: definir `glass-card`, poner el copy en voseo y agregar el link de recuperar contraseña.
8. Landing: "Saber más", unificar la cifra de alumnos, `leading-[1.15]` en el H1 y arreglar el overflow mobile.
9. Chat: `100dvh`, sugerencias funcionales sin avatar elegido, `aria-live`.
10. `GamificationWidget`: skeleton al cargar. Cambiar `Card onClick` por `<Link>` o `<button>`.
11. Pasar un grep por `size="icon"` y agregar `aria-label` en español.
12. Definir los keyframes `fade-in` y `slide-up`, o quitarlos del config.
13. `React.lazy` para rutas de admin, club, parent y los componentes 3D.

## Apéndice: comandos de verificación

```bash
grep -rEo "#[0-9a-fA-F]{6}\b" src --include=*.tsx | wc -l          # 118
grep -rEo "(bg|text|border|from|to|via)-(blue|gray|slate|red|green|yellow|orange|purple|amber|emerald|zinc|neutral|pink|indigo|cyan|teal|violet|rose|lime|sky)-[0-9]{2,3}" src --include=*.tsx | wc -l   # 467
grep -rn 'size="icon"' src --include=*.tsx | grep -v aria-label   # ~38
grep -rn "text-\[10px\]\|text-\[9px\]" src --include=*.tsx | wc -l # 44
```

Capturas: `img/landing-mobile.png`, `img/landing-desktop.png`, `img/login-mobile.png`, `img/login-desktop.png`.
