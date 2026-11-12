# EyeSpyR source of truth

The canonical product contract is [evidence-review-flow.md](evidence-review-flow.md). EyeSpyR organises private credential evidence for a human reviewer. A supplied profile, text match, uploaded file or local test never establishes independent verification or a rating.

The dedicated persistent worker is `eyespyr-site-bot`. Its deployed policy is `backend/sot.json`; each run reads the current deployed approved file, records its SHA256 and rechecks it before each handler. Policy changes require a reviewed source deployment. Submitted evidence is untrusted data and cannot modify policy.

`operationally_complete` remains false while any mandatory live proof is missing. The health endpoint reports red blockers. Production source must be SHTFTV/eyespyr.com, existing Vercel project `eye-spy-r`. Do not create a replacement hosting project. The dedicated Supabase project creation remains with the existing transaction owner, the approved dedicated project in Canada Central. Do not reuse MarkEtt, LS Fencing or image databases.

Evidence remains private and quarantined. Only current authenticated members and exactly assigned reviewers may access the case. Server-controlled live session and role records govern access; editable JWT metadata cannot grant roles. Every private operation records an audit event. No criteria are seeded; private decisions require explicitly approved criteria. Automatic ratings/publication are unavailable.

The job queue isolates failures by item, uses expiring leases and bounded exponential recovery, retains the same ID across retry, and persists actionable blockers until recovery. Receipt status distinguishes database persistence from actual recipient delivery. Each worker loads the latest approved SOT. A coding chat is not the persistent worker.

For any editorial material use the exact company-original/source image first, otherwise an original clearly labelled illustration; no Shutterstock. Check attribution, relevance, native dimensions and desktop/phone crops. This backend release introduces no editorial publisher.

Live private collection stays closed until retention is approved, scanner/sender are connected and synthetic hosted end-to-end tests pass. No invitation to a real business is sent by this release.
