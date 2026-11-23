# BNM3 Construction

BNM3 Construction is a pnpm monorepo containing a Next.js frontend and a TypeScript API backed by Neon PostgreSQL.

## Documentation

- [Feature catalog](docs/features/README.md) — implemented behavior, operational readiness, evidence, and known limitations
- [Implementation log](docs/implementation-log.md) — reverse-chronological record of material feature deliveries and status changes
- [Project blueprint](PROJECT_BLUEPRINT.md) — roadmap, milestone state, and product guardrails
- [Residential LPG funnel analysis](docs/residential-lpg-funnel-question-analysis.md) — approved proof-of-concept research direction
- [Residential LPG estimating specification](docs/residential-lpg-estimating-spec.md) — draft business and pricing rules, not approved production policy

## Project structure

```text
bnm3-construction/
├── frontend/    Next.js website, assessment, estimator, and dashboard
├── backend/     Express API, Cloudflare Worker entrypoint, Drizzle ORM, and lead qualification
├── docs/        Project documentation
└── package.json Workspace commands
```

## Prerequisites

Install the following before running the project:

- Node.js 20 or newer
- pnpm 11
- A Neon PostgreSQL project

The expected pnpm version is declared in the root `package.json`. If pnpm is unavailable, enable Corepack and install it:

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
```

## 1. Install dependencies

Run this command from the repository root:

```bash
pnpm install
```

Pnpm may keep shared packages in the root `node_modules` directory. This is expected in a workspace and all `node_modules` directories are ignored by Git.

## 2. Configure Neon

Create a Neon project and copy its pooled PostgreSQL connection string. The URL normally ends with `sslmode=require`.

Create the backend environment file in PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

For Bash, macOS, or Linux:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and replace the example value:

```env
DATABASE_URL=postgresql://user:password@your-neon-host/neondb?sslmode=require
PORT=4000
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Do not commit `backend/.env`. Only `.env.example` should be tracked.

### Development and production databases

Use a dedicated Neon development branch or development project for local work. Production deployment credentials should be configured only in the backend hosting environment and should point to a separate production branch or project. Never place the production connection string in a local committed file, the frontend environment, or any `NEXT_PUBLIC_` variable.

## 3. Configure the frontend

Create the frontend environment file:

```powershell
Copy-Item frontend/.env.example frontend/.env.local
```

For Bash, macOS, or Linux:

```bash
cp frontend/.env.example frontend/.env.local
```

The local configuration should contain:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 4. Apply database migrations

Generated migrations are included in `backend/drizzle`. Apply all pending migrations to your Neon database:

```bash
pnpm --filter backend db:migrate
```

When the database schema changes later, generate and apply another migration:

```bash
pnpm --filter backend db:generate
pnpm --filter backend db:migrate
```

You can inspect the database using Drizzle Studio:

```bash
pnpm --filter backend db:studio
```

## 5. Run the project

Start the frontend and backend together from the repository root:

```bash
pnpm dev
```

Local addresses:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Backend health check: `http://localhost:4000/health`
- Database readiness check: `http://localhost:4000/ready`

Stop the development servers with `Ctrl+C`.

### Run applications separately

Use two terminals if you prefer separate logs:

```bash
pnpm dev:frontend
```

```bash
pnpm dev:backend
```

## Available commands

Run these from the repository root:

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run the frontend and backend concurrently |
| `pnpm dev:frontend` | Run only the Next.js frontend |
| `pnpm dev:backend` | Run only the Express backend on Node.js |
| `pnpm build` | Build both applications for production |
| `pnpm lint` | Run frontend linting and backend TypeScript validation |
| `pnpm typecheck` | Type-check both applications |

Backend database commands:

| Command | Purpose |
| --- | --- |
| `pnpm --filter backend db:generate` | Generate a migration after a schema change |
| `pnpm --filter backend db:migrate` | Apply pending migrations to Neon |
| `pnpm --filter backend db:studio` | Open Drizzle Studio |

Cloudflare backend commands:

| Command | Purpose |
| --- | --- |
| `pnpm --filter backend dev:worker` | Run the Express API in the local Workers runtime |
| `pnpm --filter backend cf-typegen` | Regenerate Cloudflare runtime and binding types |
| `pnpm --filter backend deploy` | Deploy the backend Worker |

Cloudflare frontend commands:

| Command | Purpose |
| --- | --- |
| `pnpm --filter frontend dev:vinext` | Run the frontend through Vinext on port 3001 |
| `pnpm --filter frontend build:vinext` | Build the frontend for Cloudflare Workers |
| `pnpm --filter frontend start:vinext` | Preview the built frontend Worker locally |
| `pnpm --filter frontend deploy:vinext` | Build and deploy the frontend Worker after its Cloudflare target is verified |

## Production build

> **Current POC boundary:** Do not deploy this application for real customer or staff use yet. Staff records and mutations are unauthenticated, and **Wiring Milestone 7 — Authentication, permissions, and production hardening** is incomplete. The commands below document the build targets only; they are not production-readiness approval.

Build both applications:

```bash
pnpm build
```

Start the compiled backend:

```bash
pnpm --filter backend start
```

Start the production Next.js server after building:

```bash
pnpm --filter frontend start
```

The frontend has an additive Vinext target for Cloudflare Workers. Its existing Next.js development and production-build commands remain available. For a Git-connected Workers Build, use these settings:

| Setting | Value |
| --- | --- |
| Worker name | `bnm3-construction` |
| Root directory | `frontend` |
| Build variable | `SKIP_DEPENDENCY_INSTALL=true` |
| Build command | `pnpm install --filter frontend... --frozen-lockfile && pnpm run build:vinext` |
| Deploy command | `pnpm run deploy:vinext` |

The explicit filtered install is important in this monorepo: it avoids the automatic whole-workspace install that caused the earlier Cloudflare build to spend its timeout downloading dependencies for all workspace projects. Keep dependency and build-output caching enabled. The current configuration prerenders static routes into Worker assets and serves the parameterized lead-detail route through the Worker. It deliberately creates no KV cache or Cloudflare Images binding.

Do not connect this build to production traffic yet. Before any live deployment, verify the Cloudflare account and Worker target, configure `NEXT_PUBLIC_API_URL` at build time with the intended backend origin, and complete the authentication and production-hardening milestone.

For the backend, create a separate Cloudflare Worker and configure its build root as `backend` and its deploy command as `pnpm deploy`. Before deploying, configure `DATABASE_URL` as an encrypted Worker secret and `CORS_ORIGIN` as a Worker variable containing the exact deployed frontend origin. The Worker name must match `bnm3-construction-be` from `backend/wrangler.jsonc`.

## Backend endpoint summary

`POST /api/v1/leads` is the intended public intake endpoint. The remaining lead endpoints are staff operations, but authentication and trusted server-side role enforcement are not implemented yet; do not expose this proof of concept to real customer data or production traffic. The [feature catalog](docs/features/README.md) documents the current operational boundary.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Confirm that the API process is running |
| `GET` | `/ready` | Confirm that the API can reach Neon |
| `POST` | `/api/v1/leads` | Create and preliminarily classify a lead |
| Multiple | `/api/v1/leads` and `/api/v1/leads/:id/*` | Staff lead reads, call records, questions, qualification, status, and inspection workflows; see [`lead.routes.ts`](backend/src/modules/leads/lead.routes.ts) for the canonical route definitions |

## Troubleshooting

### Backend reports invalid environment configuration

Confirm that `backend/.env` exists and contains a valid `DATABASE_URL` beginning with `postgresql://`.

### `/health` works but `/ready` returns 503

The API is running, but it cannot reach Neon. Check the database URL, password, Neon project status, and network connection.

### Browser reports a CORS error

Set `CORS_ORIGIN` in `backend/.env` to the exact frontend origin. For local development, use `http://localhost:3000`.

### Dependencies appear missing

Run the installation command again from the repository root:

```bash
pnpm install
```

Automated lead classifications provide preliminary operational guidance only. Qualified personnel remain responsible for technical feasibility and LPG safety decisions.
