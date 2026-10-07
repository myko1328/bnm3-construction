# BNM3 Construction

BNM3 Construction is a pnpm monorepo containing a Next.js frontend and a TypeScript API backed by Neon PostgreSQL.

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

## 4. Apply the database migration

The initial migration is already included in `backend/drizzle`. Apply it to your Neon database:

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

## Production build

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

When deploying the frontend separately, configure its deployment project root as `frontend`.

For the backend, create a separate Cloudflare Worker and configure its build root as `backend` and its deploy command as `pnpm deploy`. Before deploying, configure `DATABASE_URL` as an encrypted Worker secret and `CORS_ORIGIN` as a Worker variable containing the exact deployed frontend origin. The Worker name must match `bnm3-construction-be` from `backend/wrangler.jsonc`.

## Backend endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Confirm that the API process is running |
| `GET` | `/ready` | Confirm that the API can reach Neon |
| `POST` | `/api/v1/leads` | Create and preliminarily classify a lead |
| `GET` | `/api/v1/leads` | List leads, optionally filtered by status or source |
| `GET` | `/api/v1/leads/:id` | Retrieve a lead and its activity history |
| `PATCH` | `/api/v1/leads/:id/status` | Update a lead status and append an activity |

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
