<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Frontend agent instructions

## Scope and architecture

- This package uses the Next.js App Router, React, strict TypeScript, and route/global CSS. Keep pages and layouts as Server Components by default; add `"use client"` only around code that needs browser state, effects, browser APIs, or client-only libraries.
- Before changing Next.js code, read the relevant version-matched guide under `node_modules/next/dist/docs/`. Pay particular attention to server/client boundaries, routing, data access, environment variables, authentication, accessibility, and the production checklist as the task requires.
- Treat App Router route parameters as promises: await them and prefer generated `PageProps`, `LayoutProps`, or `RouteContext` helpers after `next typegen` where applicable.
- Use `next/link` for internal routes. Reserve plain anchors for same-page fragments and external URLs.
- Prefer incremental changes to the existing large interactive components. Preserve assessment state, payload shape, persistence, and duplicate-submission behavior when extracting or refactoring UI.

## Project contracts and safety

- Keep typed backend access centralized in `src/lib/api/leads.ts`. When an endpoint or payload changes, reconcile it with backend schemas and routes in the same change.
- Encode path parameters, preserve structured error handling, and use abort signals for reads owned by React effects.
- `NEXT_PUBLIC_API_URL` is public and inlined into the client bundle at build time; changing it requires a rebuild. Never put database URLs, credentials, session secrets, or private tokens in a `NEXT_PUBLIC_` variable.
- Treat dashboard route guards and hidden controls as user experience only. Sensitive reads and mutations must also be authenticated and authorized by the backend.
- Do not present hard-coded demo actors as real identity. Staff identity and role must ultimately come from a trusted session.
- Preserve the domain language: estimates are indicative ranges, classifications are preliminary, customer answers may be unverified, and qualified personnel make safety and technical decisions.

## User experience

- Maintain semantic structure, useful headings, labeled controls, keyboard operation, visible focus, and appropriate live announcements for asynchronous errors and confirmations.
- Preserve responsive behavior and reduced-motion support. Verify customer flows and internal workflows at a mobile viewport as well as desktop when their UI changes.
- The anonymous estimator must create no personal lead until explicit contact opt-in. Assessment and estimator submissions must remain duplicate-safe and retain the permanent reference code on confirmation and refresh.
- Avoid storing additional personal data in `localStorage`. Browser-stored state must tolerate missing, malformed, and stale values.
- Use Philippine formatting where the product requires it: `en-PH`, PHP, and explicit `Asia/Manila` handling for customer-facing date and time behavior.

## Validation

- Run these commands from the repository root.
- Run `pnpm --filter frontend lint` and `pnpm --filter frontend typecheck` for frontend code changes.
- Run `pnpm --filter frontend build` for route, rendering, configuration, environment, dependency, or release-critical changes. The package intentionally uses webpack; do not change bundlers casually.
- Use `pnpm dev:frontend` for isolated UI work and root `pnpm dev` for API-backed flows.
- Browser-smoke the affected journey. For customer flows, cover validation, navigation, refresh persistence, opt-in, submission, reference display, and failure/retry. For dashboard work, cover loading, filtering, empty/error states, detail retrieval, permitted and denied mutations, refresh persistence, and print behavior when affected.
- No frontend automated-test script is currently configured. Do not describe lint, type-checking, builds, or manual browser checks as automated behavioral tests.
