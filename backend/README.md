# EyeSpyR private backend

This implements private HTTP handlers and PostgreSQL operations, alongside the existing public preparation site. Production completeness is false. The public site keeps its design; `/api/health/backend` returns HTTP503 and explicit blockers until mandatory runtime proof exists.

## API

All private routes require a Bearer access token. The server verifies it with the dedicated Supabase Auth `/user`, checks issuer/audience/expiry and then validates both the live `auth.sessions` record and server-controlled `access_sessions` on every transaction. Pre-provision only verified operator/member/reviewer identities. Never grant roles using user metadata. Anonymous signup and public collection stay closed.

- POST `/api/private/cases` with businessId: owner creates a case.
- GET `/api/private/cases/:id`: scoped metadata and evidence processing state.
- POST `/api/private/cases/:id/evidence`: raw PDF/JPEG/PNG bytes, Content-Type and `x-evidence-metadata` JSON (issuer, reference, scope, optional validFrom/expiresOn/supersedes). Hard10MiB streamed limit. Production intake is disabled pending retention approval. Magic bytes only classify content; all originals remain quarantined.
- GET `/api/private/cases/:id/evidence/:evidenceId`: clean originals only, authenticated download, no-store, sandbox and attachment headers. Original bytes are hash checked. No reusable signed URL is returned.
- POST `/api/private/cases/:id/transition`: state/version; optimistic concurrency and assigned reviewer roles enforced.
- POST `/api/private/cases/:id/findings`: evidenceId/classification/note/sourceReference. Issuer confirmation requires an attributed source and current assigned human reviewer. No external issuer API is invented.
- POST `/api/private/cases/:id/decision`: version/criteriaVersion/reason. Requires an explicitly approved criteria record and reviewer. Private only; no public score.
- POST `/api/private/invitations`: operator only, businessId/recipient; hashed token, seven-day expiry, revokes prior invitation and outbox. Returns an opaque token only over authenticated no-store response; no raw token in database/logs. Delivery remains blocked until sender verification. Do not put tokens in URL query strings or browser storage.
- POST `/api/private/invitations/redeem`: token in body; authenticated confirmed recipient, no role escalation, single redemption.
- GET `/api/private/cases/:id/retention`: owner-only dry run. No destructive retention executor enabled.

Private handlers return redacted error codes; provider exceptions, documents and tokens must never be logged. Raw originals/notes/tokens never belong in GitHub, analytics, email attachments or localStorage.

## Dedicated worker

`backend/worker.mjs` claims durable jobs using atomic UPDATE and SKIP LOCKED. It records worker identity, run ID and policy hash; leases last two minutes. Five attempts use30s exponential backoff capped at1h. A crashed final lease becomes blocked. Healthy work proceeds in the same run as a failed item. Recovery resolves its blocker; failed alert delivery remains durable without claiming an independent receipt.

GET `/api/internal/site-bot` requires exact Bearer CRON_SECRET, minimum32characters. Runtime handlers are health checks, orphan cleanup and scan dependency failure. No scanner is configured, so no live file can become clean. The owner-alert transport is deliberately unconnected, with a persistent red blocker. Do not infer notification delivery from an event-store receipt. No cron schedule is activated in this package until the dedicated provider and runtime prerequisites are verified.

## Deployment and migrations

Use the existing EyeSpyR Vercel project. Its verified current source baseline was ddaafa4a689cc879d6c0231c3f6f1dd034c1328e. Recheck head before release. Keep server credentials only in the project’s production environment: EYESPYR_DATABASE_URL (restricted TLS connection), EYESPYR_SUPABASE_URL, EYESPYR_PUBLISHABLE_KEY, EYESPYR_STORAGE_SECRET, CRON_SECRET. Do not pull or print secret values.

Apply the already CLI-generated private-evidence migration from the prior backend package, then worker SQL through a newly CLI-generated migration. This package's `sql/schema.sql`, `sql/policies.sql`, `sql/worker.sql` are source SQL, not fabricated migration history. They run under PostgreSQL tests but are not deployed. Inspect actual hosted tables/policies/advisors before applying. Keep eyespyr_private unexposed to PostgREST and audit all existing storage policies because permissive policies combine with OR. Browser roles have no writes. Prefer a dedicated narrowly granted database login; runtime needs SELECT auth.sessions, existing private grants and no ability to disable triggers/RLS or mutate auth users. Do not use a superuser connection in application runtime.

Production readiness requires: hosted schema/advisors; actual A/B/anonymous/role/revoked-session tests; private stored bytes and hash; clean/unsafe/quarantine scanner tests; authenticated preview tests; partial-upload recovery; exact sender/inbox/reply proof; approved retention; deployed SOT load proof; native scheduler run with durable receipt; independent actionable owner alert receipt; desktop/phone checks. Synthetic tests do not satisfy hosted proof.

## Tests

`npm run test:backend` runs PGlite PostgreSQL with synthetic platform catalogs and object storage/auth mocks. It exercises actual service SQL, RLS rollback regressions, invitation recipient/expiry/reissue boundaries, state/CAS checks, quarantine, durable queue recovery, policy change denial and persistent alerts. It does not prove hosted Supabase, real malware scanning or email delivery. Use only clearly labelled synthetic fixtures for hosted acceptance; no real private documents or reputational output.
