# Dashboard agent instructions

## Internal access and identity

- Treat every route below this directory as an internal staff surface containing sensitive customer and operational data. Do not expose dashboard content through public navigation, metadata, caching, static generation, logs, analytics payloads, or new browser storage.
- Require authenticated staff context before requesting or rendering protected records. Handle unauthenticated, forbidden, not-found, and service-failure responses as distinct states; never fall back to an empty dashboard or leak previously loaded record data.
- Derive the displayed staff name, role, and mutation actor from the trusted session. Do not send hard-coded, user-editable, or client-inferred actor identity as proof of authority.
- Use role-aware controls to explain what the signed-in user may do, but keep the backend authoritative. Disabled or hidden controls are not permission enforcement.

## Staff workflow and auditability

- Preserve the distinction between customer-provided unverified answers, automated preliminary classification, personnel-reviewed decisions, and qualified technical approval. Never present a score, estimate, checklist, or completed call as technical feasibility approval or a formal quotation.
- Keep workflow transitions and role capabilities synchronized with the backend contract. Do not invent a client-only transition or treat client-side transition constants as the source of truth.
- Require an explicit reason or supporting note for consequential decisions such as qualification overrides, status changes, inspection requests, cancellations, completion, and finalization.
- For each mutation, show pending, success, validation, forbidden, and failure feedback; prevent accidental duplicates; then reconcile with canonical server state and activity history. Do not announce success before persistence is confirmed.
- Preserve backend-provided actor, role, timestamp, reason, and decision context needed to reconstruct meaningful actions. Never silently rewrite finalized records or historical activity.

## Persistence and recovery

- Treat backend API state as canonical across browsers and sessions. Refresh the lead, call record, inspection request, and activity history after successful workflow changes.
- Do not add sensitive customer details, notes, answers, or staff identity to persistent browser storage. Any temporary draft recovery must be scoped to the authenticated staff account, cleared after successful persistence, finalization, or sign-out, and must never override newer server state.
- Distinguish unsaved, saving, saved-to-server, locally recovered, finalized, and locked states. Warn before an action would discard unsaved work.

## Interaction and print behavior

- Keep filters, selectable records, accordions, checklists, dialogs, and workflow controls keyboard-operable with visible focus, programmatic labels, and non-color status cues. Announce asynchronous errors and confirmations according to severity.
- When filtering or refreshing the inbox, keep the visible selection consistent with the displayed results. Do not show a hidden or stale lead as though it matched the active filters.
- Render print output only from the record fetched through the authenticated API. Label draft versus finalized output, include the lead reference and record timestamp, hide navigation and controls, and preserve relevant submission, verification, qualification, inspection, call-summary, and activity context.
- Verify print output in A4 preview with long text, page breaks, expanded and collapsed sections, and missing optional data. Treat printed or downloaded records as sensitive copies.
