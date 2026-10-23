# EyeSpyR profile-to-review flow
Prepared October 23, 2026. This is the implementation contract; it is not evidence that the private vault or delivery system is running.

## Current release
Public profiles, the review journey, invitation example, reusable invitation generator, workflow transition rules and structured comparison helper are implemented. Private uploads, invitation delivery, authenticated reviewer access and stored review decisions remain disabled. No private files have been collected and no invitation has been sent for this flow.

## Business journey
1. Create and editorially check the public business profile. Preserve its real address and distinguish service areas. Record a named business recipient separately from any portfolio contact.
2. Queue one invitation per profile/version and confirmed recipient. Include its own public JPEG page card and profile link. Copy: “You’re a few steps from your Five Eyes review.” A result is never promised in exchange for uploads.
3. A private invitation has a single intended business and recipient, a hashed opaque token, expiry and revocation. Redeeming it requires an authenticated recipient who can represent the business. A public profile URL or business ID never authorises evidence access.
4. Ask for relevant documents in separate slots: registration/identity; insurance; qualifications; safety standing where relevant; proof of work. Allow “not applicable” with an explanation. Record issuer, reference, entity, scope, issue/effective/expiry dates and permission for any proposed public summary.
5. Upload originals to private storage only. Use random server-created object paths within the authorised business, size limits, verified PDF/JPEG/PNG content, hashes and quarantine. Scan before preview/OCR; do not execute embedded content. Reject unsupported or unsafe files. Keep originals immutable; replacement creates a new version.
6. Display a receipt only after object storage and database metadata both confirm success. Track failed uploads and remove orphaned objects. Never claim success from a selected filename.
7. Submit a versioned evidence set for review. Compare within the authorised business first. Names, dates, issuer references, scope and duplicate files create findings. OCR confidence and original source remain visible. Different issuer templates or identical standard wording are not proof of fraud.
8. Reviewers may compare patterns across records only within their authorised remit. Cross-business similarities generate minimal internal findings, never expose another company’s source documents to the business or the public.
9. Reviewer asks for clarification or checks the issuing source where appropriate. Record who checked which source, the date, scope and business response. Distinguish a text match, issuer-confirmed fact and unverified assertion.
10. A reviewer makes a reasoned decision. Five Eyes criteria must be agreed before any score is issued. An upload, automated comparison or payment cannot publish a score. Only approved, redacted summaries appear publicly; original documents and discrepancy notes stay private.
11. Expiry or material changes trigger another review. Preserve audit history, notify the business and provide correction/appeal and deletion/retention handling.

## Storage and access contract
Use a dedicated EyeSpyR Supabase project in the owner-confirmed organisation, preferred Canadian region. Do not repurpose LS Fencing or the public image project. Confirm any nonzero cost before provisioning.

Private bucket: `eyespyr-evidence`, public=false. Data model: businesses; verified business memberships; invitations; review cases; evidence objects/versions; structured claims; comparison findings; reviewer decisions; append-only audit events; invitation email outbox.

Deny anonymous access. Membership is granted only from a validated invitation; do not use user-editable metadata for roles. Business owners can read their own records and add evidence while collection is open; they cannot assign reviewer roles, overwrite originals, change findings or publish decisions. Reviewer and administrator permissions are server-controlled. Enforce row ownership and storage path access, not merely “authenticated” status. Recheck access for every private read and use short-lived signed previews. Service credentials remain server-only.

Raw documents, extracted text, signed URLs, invitation tokens and private notes never enter GitHub, public profiles, analytics, email attachments or browser local storage. Use audit trails for private reads, writes, comparisons and decisions. Agree retention and deletion periods before collecting live documents. Do not request unnecessary personal IDs, patient records or customer addresses.

## Invitation delivery
Use a verified EyeSpyR sender. Persist an outbox event and idempotency key before delivery; save the provider message ID and actual accepted/failed state. Reissuing revokes the old token. Reminder messages are case-specific and stop after submission, opt-out or revocation. Do not email certificates; email the page card and private access instructions only.

Full Flow recipient already in its public profile: info@fullflowhydraulics.com. Prepare its invitation first, send only after its private vault path works. New businesses require the correct recipient and verified public profile details.

## Launch gates
- Owner confirms the Supabase organisation and any quoted cost.
- Dedicated project, private bucket and reviewed access policies are deployed.
- Login, invitation expiry/revocation, membership and reviewer roles work.
- Business A cannot list, upload, preview or alter Business B’s records, even using guessed IDs/object paths.
- Anonymous and unauthorised callers cannot read evidence or reviewer records.
- Allowed files succeed; invalid/oversized/unsafe files are rejected or quarantined.
- Stored original hash and metadata match; successful receipt is backed by stored data.
- Comparison findings remain review suggestions and cannot publish ratings.
- Verified sender delivery, receiving inbox and reply path are tested.
- Public summaries exclude raw certificates and private data; correction, retention and revocation controls are tested.
