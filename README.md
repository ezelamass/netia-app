# NETIA Futuro Brillante

Plataforma de gestión para clubes y asociaciones deportivas: socios, cuotas, aptos médicos, asistencia y comunicación con las familias.

## Desarrollo local

Requisitos: Node.js y npm ([instalación con nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
# 1. Clonar el repositorio
git clone <URL_DEL_REPO>

# 2. Entrar a la carpeta
cd netia-futuro-brillante

# 3. Instalar dependencias
npm i

# 4. Levantar el servidor de desarrollo
npm run dev
```

Variables de entorno necesarias (en `.env`): `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Scripts

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run preview` | Previsualiza el build |

## Stack

- Vite, TypeScript, React 18
- Tailwind CSS + shadcn/ui
- Supabase (Postgres, Auth, Edge Functions)
- TanStack React Query, React Router, React Hook Form + Zod

## Deploy

Deploy en Vercel (configuración SPA en `vercel.json`). Las variables de entorno se cargan en el dashboard de Vercel.
