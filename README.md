# NETIA

Software de gestión para clubes y asociaciones deportivas. Lo compra el club y lo usan las familias y los chicos: socios, categorías, cuotas, aptos médicos, asistencia, comunicación e informes, con asistentes de IA (TINO, ZAHIA y ROMA), semáforo de riesgo y gamificación para los deportistas. Toda la interfaz está en español rioplatense.

- `/` landing general · `/clubes` landing para clubes · `/demo` demo completa que corre en el navegador, sin cuentas ni backend.
- Los módulos de club (cuotas, categorías, asistencia, partidos, comunicación) muestran datos de ejemplo hasta que existan sus tablas en la base.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS + shadcn/ui · React Router · TanStack Query · React Hook Form + Zod · Supabase (Postgres, Auth, Edge Functions) · Vercel.

## Empezar

Requisitos: Node 20 o superior y npm.

```sh
npm install
cp .env.example .env   # completar con los datos de tu proyecto de Supabase
npm run dev
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | ESLint |
| `npm run lint:ui` | Criterio visual (bordes de acento, tamaños de texto y colores prohibidos) |

## Estructura

```
src/
  components/   piezas reutilizables por dominio (ui/ = shadcn)
  pages/        pantallas por ruta (admin/, club/, parent/)
  contexts/     autenticación y onboarding
  hooks/        acceso a datos y lógica de cada módulo
  demo/         motor de la demo (dataset, store, selectors)
  integrations/supabase/   cliente y tipos
supabase/
  migrations/   esquema y políticas de seguridad (RLS)
  functions/    Edge Functions: chat con IA, voz, carga de documentos, administración
scripts/        chequeos de presupuesto, criterio visual y capturas
docs/           guía de despliegue
```

Sistema de diseño documentado en la ruta `/sistema-de-diseno`.

## Despliegue

Ver [docs/despliegue.md](docs/despliegue.md): variables de entorno, migraciones, Edge Functions y secrets.
