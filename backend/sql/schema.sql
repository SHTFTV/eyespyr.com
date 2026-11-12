-- LOCAL POSTGRESQL VALIDATED REVIEW DRAFT. Not hosted Supabase or production approval.
-- Dedicated EyeSpyR project only. No existing portfolio project may be reused.
begin;
create schema eyespyr_private;
revoke all on schema eyespyr_private from public, anon, authenticated;
create table eyespyr_private.businesses (
 id uuid primary key default gen_random_uuid(), public_profile_id text unique not null,
 approved_name text not null, created_at timestamptz not null default now()
);
create table eyespyr_private.access_sessions (
 session_id uuid primary key, user_id uuid not null references auth.users(id), expires_at timestamptz not null, revoked_at timestamptz
);
create table eyespyr_private.memberships (
 business_id uuid not null references eyespyr_private.businesses(id), user_id uuid not null references auth.users(id),
 role text not null check(role in ('owner','member')), revoked_at timestamptz,
 primary key(business_id,user_id)
);
create table eyespyr_private.cases (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references eyespyr_private.businesses(id),
 state text not null default 'collecting' check(state in ('collecting','submitted','in_review','needs_information','decision_ready','closed')),
 version integer not null default 1 check(version>0), closed_at timestamptz, legal_hold boolean not null default false,
 created_at timestamptz not null default now(), unique(business_id,id),
 check((state='closed')=(closed_at is not null))
);
create table eyespyr_private.reviewer_assignments (
 business_id uuid not null, case_id uuid not null, user_id uuid not null references auth.users(id), revoked_at timestamptz,
 primary key(case_id,user_id), foreign key(business_id,case_id) references eyespyr_private.cases(business_id,id)
);
create table eyespyr_private.invitations (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references eyespyr_private.businesses(id),
 recipient_hash text not null check(recipient_hash ~ '^[a-f0-9]{64}$'), token_hash text not null unique check(token_hash ~ '^[a-f0-9]{64}$'),
 expires_at timestamptz not null, revoked_at timestamptz, redeemed_at timestamptz, redeemed_by uuid references auth.users(id),
 created_at timestamptz not null default now(), unique(business_id,id), check(expires_at>created_at), check((redeemed_at is null)=(redeemed_by is null))
);
create unique index one_open_invitation_per_recipient on eyespyr_private.invitations(business_id,recipient_hash) where revoked_at is null and redeemed_at is null;
-- Reissue must revoke the previous row and cancel its outbox within the same transaction.
alter table eyespyr_private.memberships add column granted_invitation_id uuid;
alter table eyespyr_private.memberships add constraint invitation_membership_business_fk foreign key(business_id,granted_invitation_id) references eyespyr_private.invitations(business_id,id);
create table eyespyr_private.evidence_versions (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, case_id uuid not null,
 supersedes_id uuid, object_path text not null unique, sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'),
 detected_type text not null check(detected_type in ('application/pdf','image/jpeg','image/png')),
 bytes bigint not null check(bytes between 1 and 10485760), issuer text not null, reference text not null, covered_scope text not null,
 valid_from date, expires_on date, created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
 unique(business_id,case_id,id), foreign key(business_id,case_id) references eyespyr_private.cases(business_id,id),
 foreign key(business_id,case_id,supersedes_id) references eyespyr_private.evidence_versions(business_id,case_id,id),
 check(object_path=business_id::text||'/'||case_id::text||'/'||id::text), check(expires_on is null or valid_from is null or expires_on>=valid_from)
);
-- Separate mutable processing state from immutable originals/metadata.
create table eyespyr_private.evidence_processing (
 evidence_id uuid primary key references eyespyr_private.evidence_versions(id),
 storage_confirmed boolean not null default false, scan_state text not null default 'quarantined' check(scan_state in ('quarantined','clean','rejected')),
 scanner_version text, checked_at timestamptz,
 check(scan_state<>'clean' or (scanner_version is not null and checked_at is not null and storage_confirmed))
);
create table eyespyr_private.findings (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, case_id uuid not null,
 evidence_id uuid not null, classification text not null check(classification in ('text_match','clarify','issuer_confirmed','not_checked')),
 note text not null, source_reference text, checked_at timestamptz, checked_by uuid references auth.users(id),
 foreign key(business_id,case_id,evidence_id) references eyespyr_private.evidence_versions(business_id,case_id,id)
);
create table eyespyr_private.decisions (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, case_id uuid not null,
 case_version integer not null check(case_version>0), reviewer_id uuid not null references auth.users(id),
 reason text not null check(length(trim(reason))>0), criteria_version text not null,
 created_at timestamptz not null default now(), foreign key(business_id,case_id) references eyespyr_private.cases(business_id,id),
 unique(case_id,case_version)
);
-- No scores/automatic publication column or public view in this minimal draft.
create table eyespyr_private.audit_events (
 id uuid primary key default gen_random_uuid(), business_id uuid references eyespyr_private.businesses(id), case_id uuid,
 actor_id uuid references auth.users(id), action text not null, outcome text not null, created_at timestamptz not null default now(),
 foreign key(business_id,case_id) references eyespyr_private.cases(business_id,id)
);
create table eyespyr_private.outbox (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references eyespyr_private.businesses(id),
 event_key text not null unique, invitation_id uuid not null,
 state text not null default 'pending' check(state in ('pending','blocked','accepted','failed','cancelled')),
 provider_id text, attempts integer not null default 0 check(attempts>=0), created_at timestamptz not null default now(),
 foreign key(business_id,invitation_id) references eyespyr_private.invitations(business_id,id),
 check(state<>'accepted' or provider_id is not null)
);
create function eyespyr_private.immutable_record() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Immutable record: create a new version; retention deletion requires separately reviewed maintenance'; end $$;
create trigger immutable_evidence before update or delete on eyespyr_private.evidence_versions for each row execute function eyespyr_private.immutable_record();
create trigger immutable_decisions before update or delete on eyespyr_private.decisions for each row execute function eyespyr_private.immutable_record();
create trigger immutable_audit before update or delete on eyespyr_private.audit_events for each row execute function eyespyr_private.immutable_record();
create function eyespyr_private.guard_case_version() returns trigger language plpgsql set search_path='' as $$
begin
 if new.id<>old.id or new.business_id<>old.business_id or new.created_at<>old.created_at or new.version<>old.version+1 then raise exception 'Invalid case identity/version'; end if;
 if new.state=old.state and new.legal_hold is distinct from old.legal_hold and new.closed_at is not distinct from old.closed_at then return new; end if;
 if new.legal_hold is distinct from old.legal_hold then raise exception 'Separate legal-hold changes from case transitions'; end if;
 if not ((old.state='collecting' and new.state='submitted') or (old.state='submitted' and new.state='in_review') or (old.state='in_review' and new.state in ('needs_information','decision_ready')) or (old.state='needs_information' and new.state in ('collecting','in_review')) or (old.state='decision_ready' and new.state in ('in_review','closed'))) then raise exception 'Invalid state transition'; end if;
 return new;
end $$;
create trigger case_transition before update on eyespyr_private.cases for each row execute function eyespyr_private.guard_case_version();
-- RLS enabled even though schema is not exposed. All direct client writes remain denied.
do $$ declare t text; begin foreach t in array array['businesses','access_sessions','memberships','cases','reviewer_assignments','invitations','evidence_versions','evidence_processing','findings','decisions','audit_events','outbox'] loop
 execute format('alter table eyespyr_private.%I enable row level security',t);
 execute format('alter table eyespyr_private.%I force row level security',t);
end loop; end $$;
revoke all on all tables in schema eyespyr_private from public, anon, authenticated;
revoke execute on all functions in schema eyespyr_private from public, anon, authenticated;
grant usage on schema eyespyr_private to service_role;
grant all on all tables in schema eyespyr_private to service_role;
commit;
