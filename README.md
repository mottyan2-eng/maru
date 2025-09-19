# Maru PoC Monorepo

Proof-of-concept childcare operations platform built with a pnpm/Turborepo monorepo. The project contains a Next.js web client, a NestJS API, and a shared Prisma/PostgreSQL data layer that can be deployed entirely on free-tier services (Vercel Hobby, Render Free, Supabase Free).

## Project structure

```
.
├── apps
│   ├── api        # NestJS API (Render Free)
│   └── web        # Next.js App Router frontend (Vercel Hobby)
├── packages
│   └── db         # Prisma schema & client (Supabase)
└── turbo.json     # Turborepo pipeline
```

## Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database (local or Supabase) for running migrations

## Environment variables

Copy `.env.example` to `.env` and adjust the values for your environment.

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/maru?schema=public
PORT=3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

Each package also provides its own `.env.example` for clarity (for example `packages/db/.env.example`).

## Local development

```bash
pnpm install
cp .env.example .env
pnpm dlx prisma migrate dev --schema packages/db/prisma/schema.prisma --name init
pnpm dev
```

The `dev` script boots both the API (`http://localhost:3001`) and the web app (`http://localhost:3000`) in parallel.

### API documentation

The NestJS service exposes OpenAPI docs at `http://localhost:3001/docs`. Authentication and authorization is stubbed via the `x-demo-role` header (`ADMIN`, `STAFF`, or `VIEWER`).

## Production deployment (free tier friendly)

1. **Supabase (database)**
   - Create a new Supabase project on the free tier.
   - Copy the project `DATABASE_URL` and store it securely.
   - Run Prisma migrations (locally or via CI) using the Supabase connection string.
2. **Render Free (API)**
   - Create a new Web Service connected to this repository under `apps/api`.
   - Use the build command `pnpm install && pnpm turbo run build --filter=@maru/api`.
   - Set the start command to `pnpm --filter @maru/api start:prod`.
   - Configure environment variables: `DATABASE_URL` (Supabase URL) and `PORT=3001`.
   - Disable automatic health checks to avoid unintended wake-ups (Render Free instances sleep when idle).
3. **Vercel Hobby (web)**
   - Import the project pointing to `apps/web`.
   - Configure `NEXT_PUBLIC_API_BASE_URL` with the Render URL (e.g. `https://maru-api.onrender.com`).
   - Use Vercel defaults for build (`pnpm install && pnpm turbo run build --filter=@maru/web`).
4. **Operational considerations**
   - Render Free dynos will sleep after inactivity; the frontend includes lightweight retry logic for 429/503 responses.
   - Supabase Free projects can be paused after inactivity—wake the project before running migrations or deployments.
   - Vercel Hobby imposes function execution and bandwidth limits; avoid large uploads and keep API responses small.

## Available scripts

At the root:

- `pnpm dev` – run API and web concurrently via Turborepo
- `pnpm build` – build all workspaces
- `pnpm lint` – type-check workspaces (tsc-based)

Within `apps/api`:

- `pnpm --filter @maru/api start:dev` – NestJS development server with hot reload
- `pnpm --filter @maru/api start:prod` – start the compiled API (use on Render)

Within `apps/web`:

- `pnpm --filter @maru/web dev` – Next.js dev server
- `pnpm --filter @maru/web build` – Production build
- `pnpm --filter @maru/web start` – Serve the production build

Within `packages/db`:

- `pnpm --filter @maru/db prisma:generate` – generate Prisma client

## Future roadmap

- Replace the temporary `x-demo-role` header guard with Google SSO
- Add monthly CSV exports for attendance and billing reconciliation
- Extend audit logging for all mutating operations
- Generate PDF summaries for compliance reporting

## Continuous integration

GitHub Actions runs `pnpm turbo run lint` and `pnpm turbo run build` on pull requests. Database connectivity is not required for these checks.
