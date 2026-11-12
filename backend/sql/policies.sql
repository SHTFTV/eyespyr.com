-- LOCAL POSTGRESQL VALIDATED REVIEW DRAFT. Not hosted Supabase or production approval.
-- Do NOT expose eyespyr_private through PostgREST. Server routes must validate live session,
-- membership/assignment and CAS inside each transaction before service-role writes.
begin;
grant usage on schema eyespyr_private to authenticated;
grant select on eyespyr_private.access_sessions,eyespyr_private.memberships,eyespyr_private.reviewer_assignments,eyespyr_private.businesses,eyespyr_private.cases,eyespyr_private.evidence_versions,eyespyr_private.evidence_processing to authenticated;
-- Populated only after server validation of the actual hosted session; never browser claims alone.
-- Revoke this row before revoking hosted sessions. No client insert/update grants.
create policy own_live_access_session on eyespyr_private.access_sessions for select to authenticated using(user_id=(select auth.uid()) and revoked_at is null and expires_at>now());
create function eyespyr_private.live_actor() returns boolean language sql stable security invoker set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from eyespyr_private.access_sessions s where s.user_id=auth.uid() and s.session_id::text=(auth.jwt()->>'session_id') and s.revoked_at is null and s.expires_at>now())
$$;
revoke execute on function eyespyr_private.live_actor() from public,anon;
grant execute on function eyespyr_private.live_actor() to authenticated;
-- These base policies cannot recurse: each reads only its own actor ID.
create policy own_membership on eyespyr_private.memberships for select to authenticated using(eyespyr_private.live_actor() and user_id=(select auth.uid()) and revoked_at is null);
create policy own_assignment on eyespyr_private.reviewer_assignments for select to authenticated using(eyespyr_private.live_actor() and user_id=(select auth.uid()) and revoked_at is null);
create function eyespyr_private.can_read_business(b uuid) returns boolean language sql stable security invoker set search_path='' as $$
 select eyespyr_private.live_actor() and (exists(select 1 from eyespyr_private.memberships m where m.business_id=b and m.user_id=auth.uid() and m.revoked_at is null) or exists(select 1 from eyespyr_private.reviewer_assignments r where r.business_id=b and r.user_id=auth.uid() and r.revoked_at is null))
$$;
create function eyespyr_private.can_read_case(b uuid,c uuid) returns boolean language sql stable security invoker set search_path='' as $$
 select eyespyr_private.live_actor() and (exists(select 1 from eyespyr_private.memberships m where m.business_id=b and m.user_id=auth.uid() and m.revoked_at is null) or exists(select 1 from eyespyr_private.reviewer_assignments r where r.business_id=b and r.case_id=c and r.user_id=auth.uid() and r.revoked_at is null))
$$;
revoke execute on function eyespyr_private.can_read_business(uuid),eyespyr_private.can_read_case(uuid,uuid) from public,anon;
grant execute on function eyespyr_private.can_read_business(uuid),eyespyr_private.can_read_case(uuid,uuid) to authenticated;
create policy scoped_business on eyespyr_private.businesses for select to authenticated using(eyespyr_private.can_read_business(id));
create policy scoped_case on eyespyr_private.cases for select to authenticated using(eyespyr_private.can_read_case(business_id,id));
create policy scoped_evidence on eyespyr_private.evidence_versions for select to authenticated using(eyespyr_private.can_read_case(business_id,case_id));
create policy scoped_processing on eyespyr_private.evidence_processing for select to authenticated using(exists(select 1 from eyespyr_private.evidence_versions e where e.id=eyespyr_private.evidence_processing.evidence_id and eyespyr_private.can_read_case(e.business_id,e.case_id)));
-- No authenticated mutation policies; no client access to invitations, findings, decisions,
-- audit, or outbox. Private notes returned only through scoped/redacted server routes.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('eyespyr-evidence','eyespyr-evidence',false,10485760,array['application/pdf','image/jpeg','image/png']);
create policy eyespyr_clean_original_read on storage.objects for select to authenticated using(
 bucket_id='eyespyr-evidence' and exists(
  select 1 from eyespyr_private.evidence_versions e join eyespyr_private.evidence_processing p on p.evidence_id=e.id
  where e.object_path=storage.objects.name and p.storage_confirmed and p.scan_state='clean' and eyespyr_private.can_read_case(e.business_id,e.case_id)
 )
);
-- No INSERT/UPDATE/DELETE storage policy. Server-only ingest uses generated paths,
-- MIME/hash/size validation, upsert=false and compensating cleanup; never browser service keys.
-- Existing policies are absent in a dedicated new project, but MUST be audited before release:
-- permissive policies combine with OR and must not accidentally expose this bucket.
commit;
