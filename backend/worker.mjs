import {randomUUID} from 'node:crypto';
import {hash} from './security.mjs';
export const workerId='eyespyr-site-bot';
export async function runWorker({pool,loadSot,handlers,alert,limit=10}){
 const raw=await loadSot(),sot=JSON.parse(raw),sotHash=hash(raw);
 if(sot.domain!=='eyespyr.com'||sot.workerId!==workerId||sot.status!=='approved'||sot.automaticPublicDecisions!==false)throw Error('invalid_sot');
 const run=randomUUID();await pool.query('insert into eyespyr_private.worker_runs(id,worker_id,sot_hash,state) values($1,$2,$3,$4)',[run,workerId,sotHash,'running']);
 const results=[];
 for(let n=0;n<Math.min(limit,25);n++){
  const token=randomUUID();
  const {rows}=await pool.query(`update eyespyr_private.jobs set state='running',attempts=attempts+1,lease_until=now()+interval '2 minutes',lease_token=$1,sot_hash=$2 where id=(select id from eyespyr_private.jobs where (state='pending' and available_at<=now() or state='running' and lease_until<now()) and attempts<max_attempts order by available_at,created_at for update skip locked limit 1) returning *`,[token,sotHash]);
  if(!rows.length)break;const job=rows[0];
  try{
   // Recheck the current policy before EVERY external-effect handler, not only at startup.
   if(hash(await loadSot())!==sotHash)throw Error('sot_changed');
   if(!handlers[job.kind])throw Error('handler_unavailable');
   await handlers[job.kind](job.payload,sot);
   const completed=await pool.query("update eyespyr_private.jobs set state='completed',completed_at=now(),lease_until=null,lease_token=null where id=$1 and lease_token=$2 and lease_until>now() returning id",[job.id,token]);
   if(!completed.rows.length)throw Error('lease_lost');
   await pool.query("update eyespyr_private.blockers set resolved_at=now() where code=$1",['job:'+job.id]);
   results.push({id:job.id,state:'completed'});
  }catch{
   // Never persist exception text: providers may include tokens or private evidence in messages.
   const terminal=job.attempts>=job.max_attempts,delay=Math.min(3600,30*2**(job.attempts-1));
   await pool.query("update eyespyr_private.jobs set state=$1,last_error='operation_failed',available_at=now()+$2*interval '1 second',lease_until=null,lease_token=null where id=$3 and lease_token=$4",[terminal?'blocked':'pending',delay,job.id,token]);
   await pool.query("insert into eyespyr_private.blockers(code,next_action) values($1,$2) on conflict(code) do update set last_seen=now(),resolved_at=null",['job:'+job.id,'Inspect private EyeSpyR job '+job.id+'; repair dependency and resume the same job.']);
   results.push({id:job.id,state:terminal?'blocked':'retry'});
  }
 }
 // A process killed on its last attempt must not strand a running job forever.
 await pool.query("update eyespyr_private.jobs set state='blocked',last_error='lease_expired',lease_until=null,lease_token=null where state='running' and lease_until<now() and attempts>=max_attempts");
 await pool.query("insert into eyespyr_private.blockers(code,next_action) select 'job:'||id::text,'Inspect exhausted EyeSpyR job '||id::text from eyespyr_private.jobs where state='blocked' on conflict(code) do update set last_seen=now(),resolved_at=null");
 const pending=await pool.query('select code,next_action from eyespyr_private.blockers where resolved_at is null and alert_receipt is null order by first_seen limit 10');
 for(const b of pending.rows){
  await pool.query('update eyespyr_private.blockers set alert_attempts=alert_attempts+1 where code=$1',[b.code]);
  try{const receipt=await alert?.({workerId,code:b.code,severity:'red',nextAction:b.next_action});if(typeof receipt==='string'&&receipt.length)await pool.query('update eyespyr_private.blockers set alert_receipt=$1 where code=$2',[receipt,b.code]);}catch{/* Persistent unresolved blocker remains for the next heartbeat. */}
 }
 await pool.query("update eyespyr_private.worker_runs set state=$1,finished_at=now() where id=$2",[results.some(r=>r.state!=='completed')?'blocked':'completed',run]);
 return {workerId,run,sotHash,results};
}
