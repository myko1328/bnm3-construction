# Frontend Cloudflare Workers migration with Vinext

## Goal and observable outcome

Prepare the existing `frontend` Next.js application for repeatable Cloudflare Workers builds with Vinext, without removing the existing Next.js development/build path. An operator can run a compatibility scan, build the Vinext Worker locally, preview it in the Workers runtime, and use a frontend-only deployment command that does not install or build the backend workspace.

## Scope and non-goals

This user-requested deployment slice belongs to **Wiring Milestone 7 — Authentication, permissions, and production hardening**. It includes frontend compatibility analysis, Vinext/Cloudflare build configuration, filtered workspace commands, documentation, and local validation. It does not deploy to a live Cloudflare account, change DNS, create secrets, migrate Neon, expose unauthenticated staff routes to production traffic, or merge the separate backend Worker into the frontend Worker.

## Current behavior and evidence

`frontend/package.json` builds with `next build --webpack`; `frontend/next.config.ts` has no deployment adapter; and the repository has no frontend Worker configuration. The failed Cloudflare Pages log ran `pnpm install --frozen-lockfile` for all three workspace projects and timed out during dependency download. `README.md` already says the frontend deployment root is `frontend`, while the backend has a separate `backend/wrangler.jsonc` and Worker deployment command.

## Interfaces and ownership

The frontend continues to call the backend through the existing public API base URL contract. No request, response, identity, database, or persistence contract changes are planned. The primary agent owns `frontend/package.json`, generated Vinext/Vite/Cloudflare configuration, the root workspace scripts if required, lockfile updates, deployment documentation, this plan, and final validation. Existing unrelated working-tree changes remain untouched.

## Implementation stages

1. Run the official Vinext compatibility scanner and record any unsupported APIs or configuration.
2. Run the non-destructive Vinext Cloudflare initializer in `frontend`, inspect every generated change, and keep the original Next.js scripts available.
3. Add deterministic frontend-only install/build/deploy commands suitable for Workers Builds and document the separate frontend/backend deployment boundaries.
4. Run lint, type-check, the existing Next.js production build, the Vinext Worker build, and a local Worker preview smoke test.

## Security, data, and recovery

No credentials or production identifiers will be committed. Local builds use no real customer data and must not run database migrations. A live Cloudflare deployment, secrets, custom domains, CORS changes, and production Neon configuration require separate target verification. Recovery is to remove the additive Vinext/Vite/Cloudflare files and dependency/script changes; the original Next.js build remains available during migration.

## Validation and acceptance

- `pnpm --filter frontend lint`
- `pnpm --filter frontend typecheck`
- `pnpm --filter frontend build`
- the generated Vinext compatibility check command
- the generated Vinext build command
- local Workers preview: public landing page and `/tools/bill-of-materials` return successful responses; an unavailable backend produces the existing safe frontend error state rather than leaking data
- `git diff --check`

## Progress

- [x] 2026-11-24T00:00:00+08:00 — Confirmed the failed Pages job timed out during an unfiltered whole-workspace dependency installation.
- [x] 2026-11-24T00:15:00+08:00 — Vinext compatibility scan reported 100% support across the App Router, nine pages, `next/image`, `next/link`, and Tailwind CSS.
- [x] 2026-11-24T00:15:00+08:00 — Initialized the additive Cloudflare target with static-asset caching, no data cache, and no Cloudflare Images binding; inspected the generated package scripts and configuration.
- [x] 2026-11-24T00:30:00+08:00 — Passed frontend and repository lint/type-check/build checks, the Vinext build, and local Worker HTTP smoke checks for `/`, `/tools/bill-of-materials`, and the dynamic lead-detail route.
- [x] 2026-11-24T00:30:00+08:00 — Documented Workers Builds settings, the separate frontend/backend Worker boundary, and remaining production blockers.

## Decisions and discoveries

- 2026-11-24: Use Cloudflare Workers with Vinext rather than Cloudflare Pages static export because the application includes a dynamic lead-detail route and Cloudflare recommends Vinext for full Next.js applications.
- 2026-11-24: Preserve the current Next.js toolchain alongside Vinext until compatibility and runtime checks pass.
- 2026-11-24: Keep the frontend and backend as separate Workers; this migration does not broaden backend exposure or authorize production traffic.
- 2026-11-24: Use the local Worker name `bnm3-construction-frontend` so generated configuration cannot be confused with the existing `bnm3-construction-be` backend Worker.
- 2026-11-24: Set `SKIP_DEPENDENCY_INSTALL=true` in Workers Builds and perform `pnpm install --filter frontend... --frozen-lockfile` in the build command. This directly avoids the automatic whole-workspace install observed in the timed-out build while retaining the shared lockfile.
- 2026-11-24: Use static-assets caching with full-route prerendering for this POC baseline; it creates no external cache resource and leaves the parameterized lead-detail route dynamic.
- 2026-11-24: Ignore `.cloudflare/**` and `.vinext/**` in ESLint. Generated Worker bundles otherwise caused lint to traverse minified build output and appear stalled.

## Outcomes and remaining risks

The additive frontend Worker target is locally complete. Vinext reported 100% compatibility; the Worker build produced eight static routes and one dynamic route; all three smoke-test routes returned HTTP 200 in the local Workers runtime; and the existing Next.js build remains healthy. No Cloudflare account, Worker, secret, domain, CORS value, or database was changed. The application is still a proof of concept with unauthenticated staff surfaces, so this establishes deployment mechanics only, not production readiness. Before a live deployment, verify the exact Cloudflare account/Worker target, build-time backend URL, backend CORS origin, and the remaining **Wiring Milestone 7 — Authentication, permissions, and production hardening** controls.
