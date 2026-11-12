import {randomUUID} from 'node:crypto';
import {Fault,uuid,text,date,inspect,hash,transitionAllowed} from './security.mjs';
export function createService({pool,storage,retentionApproved=false}){
 const one=async(db,sql,args=[]) => (await db.query(sql,args)).rows[0];
 async function transaction(actor,fn){
  const db=await pool.connect();try{
   await db.query('begin');
   // Check the live hosted session on EVERY operation, including reads. No JWT role grants.
   const session=await one(db,'select id from auth.sessions where id=$1 and user_id=$2 and (not_after is null or not_after>now()) for share',[actor.sessionId,actor.id]);
   if(!session)throw new Fault('session_revoked',401);
   const access=await one(db,'select * from eyespyr_private.access_sessions where session_id=$1 and user_id=$2 and revoked_at is null and expires_at>now() for share',[actor.sessionId,actor.id]);
   if(!access)throw new Fault('access_not_granted',403);
   const value=await fn(db);await db.query('commit');return value;
  }catch(e){await db.query('rollback');throw e;}finally{db.release();}
 }
 async function audit(db,a,action,c){await db.query('insert into eyespyr_private.audit_events(business_id,case_id,actor_id,action,outcome) values($1,$2,$3,$4,$5)',[c.business_id,c.id,a.id,action,'succeeded']);}
 async function scoped(db,a,id,lock=false){
  const c=await one(db,'select * from eyespyr_private.cases where id=$1'+(lock?' for update':''),[uuid(id)]);if(!c)throw new Fault('not_found',404);
  const m=await one(db,'select role from eyespyr_private.memberships where business_id=$1 and user_id=$2 and revoked_at is null for share',[c.business_id,a.id]);
  const r=await one(db,'select user_id from eyespyr_private.reviewer_assignments where case_id=$1 and user_id=$2 and revoked_at is null for share',[c.id,a.id]);
  if(!m&&!r)throw new Fault('not_found',404);return {...c,owner:m?.role==='owner',reviewer:!!r};
 }
 return {
  async createInvitation(a,business,recipient){return transaction(a,async db=>{
   if(!await one(db,'select user_id from eyespyr_private.operators where user_id=$1 and revoked_at is null for share',[a.id]))throw new Fault('operator_required',403);
   uuid(business);const email=text(recipient,254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Fault('invalid_recipient');
   // Recipient identity is confirmed operationally; caller must never use a portfolio default.
   await db.query('select id from eyespyr_private.businesses where id=$1 for update',[business]);
   await db.query("update eyespyr_private.outbox set state='cancelled' where invitation_id in(select id from eyespyr_private.invitations where business_id=$1 and recipient_hash=$2 and revoked_at is null and redeemed_at is null) and state in ('pending','blocked','failed')",[business,hash(email)]);
   await db.query('update eyespyr_private.invitations set revoked_at=now() where business_id=$1 and recipient_hash=$2 and revoked_at is null and redeemed_at is null',[business,hash(email)]);
   const secret=randomUUID()+randomUUID(),id=randomUUID();
   await db.query("insert into eyespyr_private.invitations(id,business_id,recipient_hash,token_hash,expires_at) values($1,$2,$3,$4,now()+interval '7 days')",[id,business,hash(email),hash(secret)]);
   await db.query("insert into eyespyr_private.outbox(business_id,event_key,invitation_id,state) values($1,$2,$3,'blocked')",[business,'invitation:'+id,id]);
   await db.query("insert into eyespyr_private.audit_events(business_id,actor_id,action,outcome) values($1,$2,'create_invitation','delivery_blocked')",[business,a.id]);
   return {id,token:secret,delivery:'blocked',reason:'verified_sender_required'};
  });},
  async redeemInvitation(a,secret){return transaction(a,async db=>{
   const i=await one(db,'select * from eyespyr_private.invitations where token_hash=$1 and revoked_at is null and redeemed_at is null and expires_at>now() for update',[hash(text(secret,200))]);if(!i||hash((a.email??'').toLowerCase())!==i.recipient_hash)throw new Fault('invitation_unavailable',403);
   const old=await one(db,'select * from eyespyr_private.memberships where business_id=$1 and user_id=$2 for update',[i.business_id,a.id]);if(old?.revoked_at)throw new Fault('membership_revoked',403);
   await db.query("insert into eyespyr_private.memberships(business_id,user_id,role,granted_invitation_id) values($1,$2,'member',$3) on conflict(business_id,user_id) do nothing",[i.business_id,a.id,i.id]);
   await db.query('update eyespyr_private.invitations set redeemed_at=now(),redeemed_by=$1 where id=$2',[a.id,i.id]);
   await db.query("update eyespyr_private.outbox set state='cancelled' where invitation_id=$1 and state in ('pending','blocked','failed')",[i.id]);
   await db.query("insert into eyespyr_private.audit_events(business_id,actor_id,action,outcome) values($1,$2,'redeem_invitation','succeeded')",[i.business_id,a.id]);
   return {businessId:i.business_id,role:old?.role??'member'};
  });},
  async readCase(a,id){return transaction(a,async db=>{const c=await scoped(db,a,id);const records=await db.query('select e.id,e.issuer,e.reference,e.covered_scope,e.valid_from,e.expires_on,e.created_at,p.storage_confirmed,p.scan_state from eyespyr_private.evidence_versions e join eyespyr_private.evidence_processing p on p.evidence_id=e.id where e.case_id=$1 order by e.created_at',[c.id]);await audit(db,a,'read_case',c);return {case:c,evidence:records.rows};});},
  async createCase(a,business){return transaction(a,async db=>{
   const m=await one(db,"select role from eyespyr_private.memberships where business_id=$1 and user_id=$2 and revoked_at is null for share",[uuid(business),a.id]);if(m?.role!=='owner')throw new Fault('forbidden',403);
   const c=await one(db,'insert into eyespyr_private.cases(business_id) values($1) returning *',[business]);await audit(db,a,'create_case',c);return c;
  });},
  async transition(a,id,to,version){return transaction(a,async db=>{
   const c=await scoped(db,a,id,true);if(!Number.isInteger(version)||version!==c.version)throw new Fault('version_conflict',409);transitionAllowed(c.state,to,c.owner,c.reviewer);
   if(to==='submitted'){
    const count=await one(db,'select count(*)::int as n from eyespyr_private.evidence_versions e join eyespyr_private.evidence_processing p on p.evidence_id=e.id where e.case_id=$1 and p.storage_confirmed and p.scan_state=$2',[c.id,'clean']);
    if(!count.n)throw new Fault('clean_evidence_required',409);
   }
   if(to==='closed'&&!await one(db,'select id from eyespyr_private.decisions where case_id=$1 and case_version=$2',[id,version]))throw new Fault('human_decision_required',409);
   const updated=await one(db,"update eyespyr_private.cases set state=$1,version=version+1,closed_at=case when $1='closed' then now() else null end where id=$2 and version=$3 returning *",[to,id,version]);await audit(db,a,'transition_'+to,c);return updated;
  });},
  async finding(a,id,input){return transaction(a,async db=>{
   const c=await scoped(db,a,id,true);if(!c.reviewer||c.state!=='in_review')throw new Fault('assigned_reviewer_required',403);
   if(!['text_match','clarify','issuer_confirmed','not_checked'].includes(input.classification))throw new Fault('invalid_classification');
   const source=input.sourceReference?text(input.sourceReference,2000):null;
   if(input.classification==='issuer_confirmed'&&!source)throw new Fault('issuer_source_required');
   const e=await one(db,'select id from eyespyr_private.evidence_versions where id=$1 and case_id=$2',[uuid(input.evidenceId),id]);if(!e)throw new Fault('not_found',404);
   const f=await one(db,'insert into eyespyr_private.findings(business_id,case_id,evidence_id,classification,note,source_reference,checked_at,checked_by) values($1,$2,$3,$4,$5,$6,now(),$7) returning id',[c.business_id,id,e.id,input.classification,text(input.note,4000),source,a.id]);await audit(db,a,'record_finding',c);return f;
  });},
  async decision(a,id,input){return transaction(a,async db=>{
   const c=await scoped(db,a,id,true);if(!c.reviewer||c.state!=='decision_ready')throw new Fault('assigned_reviewer_required',403);
   if(input.version!==c.version)throw new Fault('version_conflict',409);
   const approved=await one(db,'select revision from eyespyr_private.approved_criteria where revision=$1 and revoked_at is null',[text(input.criteriaVersion,100)]);if(!approved)throw new Fault('approved_criteria_required',409);
   const decision=await one(db,'insert into eyespyr_private.decisions(business_id,case_id,case_version,reviewer_id,reason,criteria_version) values($1,$2,$3,$4,$5,$6) returning id',[c.business_id,id,c.version,a.id,text(input.reason,4000),approved.revision]);await audit(db,a,'record_private_decision',c);return {...decision,public:false};
  });},
  async upload(a,id,bytes,input){
   if(!retentionApproved)throw new Fault('retention_not_approved',503);
   const file=inspect(bytes,input.contentType),eid=randomUUID();
   const metadata={issuer:text(input.issuer),reference:text(input.reference),scope:text(input.scope,2000),from:date(input.validFrom),until:date(input.expiresOn)};
   if(metadata.from&&metadata.until&&metadata.until<metadata.from)throw new Fault('invalid_date_order');
   // Reserve a durable cleanup job BEFORE touching object storage. A terminated request leaves a recoverable job.
   const path=await transaction(a,async db=>{const c=await scoped(db,a,id,true);if(!c.owner||c.state!=='collecting')throw new Fault('collection_closed',403);const path=c.business_id+'/'+c.id+'/'+eid;await db.query("insert into eyespyr_private.jobs(kind,event_key,payload,available_at) values('orphan_cleanup',$1,$2,now()+interval '1 hour')",['upload:'+eid,JSON.stringify({path,evidenceId:eid})]);return path;});
   await storage.upload(path,bytes,file.type);
   const stored=await storage.download(path);if(hash(stored)!==file.sha256)throw new Fault('storage_integrity_failure',503);
   return transaction(a,async db=>{
    const c=await scoped(db,a,id,true);if(!c.owner||c.state!=='collecting')throw new Fault('collection_closed',409);
    if(input.supersedes&&!await one(db,'select id from eyespyr_private.evidence_versions where id=$1 and case_id=$2',[uuid(input.supersedes),id]))throw new Fault('outside_case');
    await db.query('insert into eyespyr_private.evidence_versions(id,business_id,case_id,supersedes_id,object_path,sha256,detected_type,bytes,issuer,reference,covered_scope,valid_from,expires_on,created_by) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)',[eid,c.business_id,c.id,input.supersedes??null,path,file.sha256,file.type,file.bytes,metadata.issuer,metadata.reference,metadata.scope,metadata.from,metadata.until,a.id]);
    await db.query('insert into eyespyr_private.evidence_processing(evidence_id,storage_confirmed) values($1,true)',[eid]);
    await db.query("update eyespyr_private.jobs set state='completed' where event_key=$1",['upload:'+eid]);
    await db.query("insert into eyespyr_private.jobs(kind,event_key,payload) values('scan',$1,$2)",['scan:'+eid,JSON.stringify({evidenceId:eid})]);
    await audit(db,a,'stored_quarantined_evidence',c);return {id:eid,storageConfirmed:true,scanState:'quarantined',sha256:file.sha256};
   });
  },
  async preview(a,id,eid){return transaction(a,async db=>{const c=await scoped(db,a,id);const e=await one(db,"select e.* from eyespyr_private.evidence_versions e join eyespyr_private.evidence_processing p on p.evidence_id=e.id where e.id=$1 and e.case_id=$2 and p.storage_confirmed and p.scan_state='clean'",[uuid(eid),id]);if(!e)throw new Fault('not_found',404);const bytes=await storage.download(e.object_path);if(hash(bytes)!==e.sha256)throw new Fault('storage_integrity_failure',503);await audit(db,a,'download_original',c);return {bytes,type:e.detected_type};});},
  async retentionCandidates(a,id){return transaction(a,async db=>{const c=await scoped(db,a,id);if(!c.owner)throw new Fault('owner_required',403);await audit(db,a,'retention_dry_run',c);return {deletionEnabled:false,eligible:c.state==='closed'&&!c.legal_hold&&Date.now()-new Date(c.closed_at).getTime()>90*86400000};});}
 };
}
