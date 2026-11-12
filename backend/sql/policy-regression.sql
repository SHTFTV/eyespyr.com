-- LOCAL POSTGRESQL VALIDATED REVIEW DRAFT. Not hosted Supabase or production approval.
-- Requires schema.sql + policies.sql and Supabase auth/storage schemas.
-- Rollback-only metadata fixture: no uploaded bytes, invitations or email delivery.
begin;
insert into auth.users(id,email) values
 ('10000000-0000-4000-8000-000000000001','fixture-ownera@example.invalid'),
 ('10000000-0000-4000-8000-000000000002','fixture-ownerb@example.invalid');
insert into eyespyr_private.businesses(id,public_profile_id,approved_name) values
 ('20000000-0000-4000-8000-000000000001','fixture-a','Synthetic Business A'),
 ('20000000-0000-4000-8000-000000000002','fixture-b','Synthetic Business B');
insert into eyespyr_private.memberships(business_id,user_id,role) values
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','owner'),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','owner');
insert into eyespyr_private.access_sessions(session_id,user_id,expires_at) values
 ('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',now()+interval '1 hour');
insert into eyespyr_private.cases(id,business_id) values
 ('40000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001'),
 ('40000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated","session_id":"30000000-0000-4000-8000-000000000001"}',true);
do $$ begin
 if (select count(*) from eyespyr_private.cases)<>1 then raise exception 'Expected A only'; end if;
 if exists(select 1 from eyespyr_private.cases where id='40000000-0000-4000-8000-000000000002') then raise exception 'Cross-business read'; end if;
 begin
  update eyespyr_private.cases set state='submitted',version=version+1;
  raise exception 'Client mutation unexpectedly allowed';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
update eyespyr_private.access_sessions set revoked_at=now() where session_id='30000000-0000-4000-8000-000000000001';
set local role authenticated;
do $$ begin if exists(select 1 from eyespyr_private.cases) then raise exception 'Revoked session retained access'; end if; end $$;
reset role;
set local role anon;
do $$ begin
 begin
  perform 1 from eyespyr_private.cases;
  raise exception 'Anonymous access unexpectedly allowed';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
