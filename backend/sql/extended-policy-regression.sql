-- Rollback-only synthetic PostgreSQL policy regression; no hosted service/data.
begin;
insert into auth.users(id,email) values
 ('10000000-0000-4000-8000-000000000001','owner@example.invalid'),
 ('10000000-0000-4000-8000-000000000002','reviewer@example.invalid');
insert into eyespyr_private.businesses(id,public_profile_id,approved_name) values
 ('20000000-0000-4000-8000-000000000001','fixture-a','Synthetic A'),
 ('20000000-0000-4000-8000-000000000002','fixture-b','Synthetic B');
insert into eyespyr_private.cases(id,business_id) values
 ('40000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001'),
 ('40000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001'),
 ('40000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000002');
insert into eyespyr_private.reviewer_assignments(business_id,case_id,user_id) values
 ('20000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002');
insert into eyespyr_private.access_sessions(session_id,user_id,expires_at) values
 ('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002',now()+interval '1 hour');
insert into eyespyr_private.evidence_versions(id,business_id,case_id,object_path,sha256,detected_type,bytes,issuer,reference,covered_scope,created_by) values
 ('50000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001/40000000-0000-4000-8000-000000000001/50000000-0000-4000-8000-000000000001',repeat('a',64),'application/pdf',20,'Synthetic issuer','fixture','fixture','10000000-0000-4000-8000-000000000001');
insert into eyespyr_private.evidence_processing(evidence_id) values('50000000-0000-4000-8000-000000000001');
insert into storage.objects(bucket_id,name) select 'eyespyr-evidence',object_path from eyespyr_private.evidence_versions;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000002","role":"service_role","session_id":"30000000-0000-4000-8000-000000000002"}',true);
do $$ begin
 if (select count(*) from eyespyr_private.cases)<>1 then raise exception 'Reviewer assignment escaped exact case';end if;
 if exists(select 1 from storage.objects) then raise exception 'Quarantined evidence was readable';end if;
 begin
  insert into storage.objects(bucket_id,name) values('eyespyr-evidence','forged');
  raise exception 'Browser storage write allowed';
 exception when insufficient_privilege then null;end;
end $$;
reset role;
update eyespyr_private.evidence_processing set storage_confirmed=true,scan_state='clean',scanner_version='synthetic-scanner',checked_at=now();
set local role authenticated;
do $$ begin if (select count(*) from storage.objects)<>1 then raise exception 'Clean assigned evidence not visible';end if;end $$;
reset role;
update eyespyr_private.reviewer_assignments set revoked_at=now();
set local role authenticated;
do $$ begin
 if exists(select 1 from eyespyr_private.cases) or exists(select 1 from storage.objects) then raise exception 'Revoked reviewer retained access';end if;
end $$;
reset role;
do $$ begin
 begin
  update eyespyr_private.evidence_versions set issuer='altered';
  raise exception 'Original metadata was mutable';
 exception when raise_exception then if SQLERRM not like 'Immutable record:%' then raise;end if;end;
 begin
  update eyespyr_private.cases set version=version+2,state='submitted';
  raise exception 'Invalid CAS/version was accepted';
 exception when raise_exception then if SQLERRM<>'Invalid case identity/version' then raise;end if;end;
 begin
  insert into eyespyr_private.findings(business_id,case_id,evidence_id,classification,note) values('20000000-0000-4000-8000-000000000002','40000000-0000-4000-8000-000000000003','50000000-0000-4000-8000-000000000001','not_checked','synthetic');
  raise exception 'Cross-business evidence reference accepted';
 exception when foreign_key_violation then null;end;
end $$;
rollback;
