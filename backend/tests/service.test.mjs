import test from 'node:test';import assert from 'node:assert/strict';
import {setup,seed,ids} from './setup.mjs';import {createService} from '../service.mjs';
test('real PostgreSQL service isolation, storage receipt, quarantine, CAS, review and revocation',async()=>{
 const {db,pool}=await setup();try{
 await seed(db);const objects=new Map();const storage={upload:async(p,b)=>objects.set(p,b),download:async p=>objects.get(p)};
 const service=createService({pool,storage,retentionApproved:true}),a={id:ids.a,sessionId:ids.sa},b={id:ids.b,sessionId:ids.sb},r={id:ids.reviewer,sessionId:ids.sr};
 const c=await service.createCase(a,ids.ba);await assert.rejects(service.readCase(b,c.id),/not_found/);await assert.rejects(service.createCase(b,ids.ba),/forbidden/);
 const receipt=await service.upload(a,c.id,Buffer.from('%PDF-SYNTHETIC-NO-PRIVATE-DATA'),{contentType:'application/pdf',issuer:'Fixture issuer',reference:'SYNTHETIC',scope:'Test only'});
 assert.equal(receipt.storageConfirmed,true);assert.equal(receipt.scanState,'quarantined');
 await assert.rejects(service.preview(a,c.id,receipt.id),/not_found/);await assert.rejects(service.transition(a,c.id,'submitted',1),/clean_evidence_required/);
 // Synthetic scanner state; no claim of actual malware scanning.
 await db.query("update eyespyr_private.evidence_processing set scan_state='clean',scanner_version='synthetic-fixture',checked_at=now() where evidence_id=$1",[receipt.id]);
 assert.equal((await service.preview(a,c.id,receipt.id)).bytes.toString(),'%PDF-SYNTHETIC-NO-PRIVATE-DATA');
 await service.transition(a,c.id,'submitted',1);await assert.rejects(service.transition(a,c.id,'in_review',2),/forbidden/);
 await db.query('insert into eyespyr_private.reviewer_assignments(business_id,case_id,user_id) values($1,$2,$3)',[ids.ba,c.id,ids.reviewer]);
 await service.transition(r,c.id,'in_review',2);await assert.rejects(service.transition(r,c.id,'decision_ready',2),/version_conflict/);
 await assert.rejects(service.finding(r,c.id,{evidenceId:receipt.id,classification:'issuer_confirmed',note:'Fixture'}),/issuer_source_required/);
 await service.finding(r,c.id,{evidenceId:receipt.id,classification:'not_checked',note:'Synthetic record only'});
 await service.transition(r,c.id,'decision_ready',3);await assert.rejects(service.decision(r,c.id,{version:4,criteriaVersion:'unapproved',reason:'fixture'}),/approved_criteria_required/);
 await assert.rejects(service.transition(r,c.id,'published',4),/invalid_transition/);await assert.rejects(service.transition(r,c.id,'closed',4),/human_decision_required/);
 await db.query('delete from auth.sessions where id=$1',[ids.sa]);await assert.rejects(service.readCase(a,c.id),/session_revoked/);
 const audits=await db.query('select count(*)::int as n from eyespyr_private.audit_events');assert.ok(audits.rows[0].n>=7);
 }finally{await db.close();}
});
test('actual prior PostgreSQL RLS regressions still pass',async()=>{const {db}=await setup();try{const {readFile}=await import('node:fs/promises');for(const f of ['policy-regression.sql','extended-policy-regression.sql'])await db.exec(await readFile(new URL('../sql/'+f,import.meta.url),'utf8'));}finally{await db.close();}});
test('invitations hash tokens, bind recipient, revoke reissue and redeem once',async()=>{
 const {db,pool}=await setup();try{await seed(db);const service=createService({pool}),a={id:ids.a,sessionId:ids.sa,email:'fixture-a@example.invalid'},b={id:ids.b,sessionId:ids.sb,email:'fixture-b@example.invalid'};
 await assert.rejects(service.createInvitation(a,ids.ba,b.email),/operator_required/);
 await db.query('insert into eyespyr_private.operators(user_id) values($1)',[ids.a]);
 const old=await service.createInvitation(a,ids.ba,b.email),current=await service.createInvitation(a,ids.ba,b.email);
 await assert.rejects(service.redeemInvitation(b,old.token),/invitation_unavailable/);await assert.rejects(service.redeemInvitation(a,current.token),/invitation_unavailable/);
 assert.equal((await service.redeemInvitation(b,current.token)).role,'member');await assert.rejects(service.redeemInvitation(b,current.token),/invitation_unavailable/);
 const rows=(await db.query('select token_hash from eyespyr_private.invitations')).rows;assert.ok(rows.every(r=>r.token_hash.length===64&&r.token_hash!==current.token));
 }finally{await db.close();}
});
test('partial storage failure leaves durable cleanup; audit failure rolls back mutation',async()=>{
 const {db,pool}=await setup();try{await seed(db);const a={id:ids.a,sessionId:ids.sa};const service=createService({pool,retentionApproved:true,storage:{upload:async()=>{},download:async()=>Buffer.from('wrong bytes')}});const c=await service.createCase(a,ids.ba);
 await assert.rejects(service.upload(a,c.id,Buffer.from('%PDF-SYNTHETIC'),{contentType:'application/pdf',issuer:'Fixture',reference:'Fixture',scope:'Fixture'}),/storage_integrity_failure/);
 assert.equal((await db.query('select count(*)::int as n from eyespyr_private.evidence_versions')).rows[0].n,0);assert.equal((await db.query("select state from eyespyr_private.jobs where kind='orphan_cleanup'")).rows[0].state,'pending');
 await db.exec("create function eyespyr_private.fail_audit() returns trigger language plpgsql as $$begin raise exception 'synthetic audit failure';end$$;create trigger injected_audit_failure before insert on eyespyr_private.audit_events for each row execute function eyespyr_private.fail_audit();");
 await assert.rejects(service.createCase(a,ids.ba),/synthetic audit failure/);assert.equal((await db.query('select count(*)::int as n from eyespyr_private.cases')).rows[0].n,1);
 }finally{await db.close();}
});
