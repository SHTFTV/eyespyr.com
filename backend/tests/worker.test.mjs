import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {setup} from './setup.mjs';import {runWorker} from '../worker.mjs';
const loadSot=()=>readFile(new URL('../sot.json',import.meta.url),'utf8');
test('durable failed+healthy isolation, retry same job, latest SOT, persistent alert receipt',async()=>{
 const {db,pool}=await setup();try{
 await db.query("insert into eyespyr_private.jobs(event_key,kind,payload) values('failed','scan','{}'),('healthy','health','{}')");
 const handlers={scan:async()=>{throw Error('SECRET evidence must never be logged');},health:async()=>{}};
 let result=await runWorker({pool,loadSot,handlers,alert:async()=>{throw Error('offline');}});
 assert.equal(result.results.length,2);assert.ok(result.results.some(x=>x.state==='retry'));assert.ok(result.results.some(x=>x.state==='completed'));
 const failed=(await db.query("select * from eyespyr_private.jobs where event_key='failed'")).rows[0];assert.equal(failed.attempts,1);assert.equal(failed.last_error,'operation_failed');
 assert.equal((await db.query('select alert_receipt from eyespyr_private.blockers')).rows[0].alert_receipt,null);
 await db.query("update eyespyr_private.jobs set available_at=now()-interval '1 second' where event_key='failed'");
 result=await runWorker({pool,loadSot,handlers:{...handlers,scan:async()=>{}},alert:async()=> 'synthetic-alert-receipt'});
 assert.equal(result.results[0].id,failed.id);assert.equal(result.results[0].state,'completed');
 const row=(await db.query("select * from eyespyr_private.jobs where id=$1",[failed.id])).rows[0];assert.equal(row.attempts,2);assert.ok(row.sot_hash);
 assert.ok((await db.query('select resolved_at from eyespyr_private.blockers')).rows[0].resolved_at);
 }finally{await db.close();}
});
test('policy revision change prevents handler side effects; expired final lease becomes blocked',async()=>{
 const {db,pool}=await setup();try{
 await db.query("insert into eyespyr_private.jobs(event_key,kind) values('changed','health')");let count=0,effects=0;
 const sot=await loadSot();await runWorker({pool,loadSot:async()=>++count===1?sot:sot+' ',handlers:{health:async()=>effects++}});assert.equal(effects,0);
 await db.query("insert into eyespyr_private.jobs(event_key,kind,state,attempts,max_attempts,lease_until) values('crashed','health','running',5,5,now()-interval '1 minute')");
 await runWorker({pool,loadSot,handlers:{}});assert.equal((await db.query("select state from eyespyr_private.jobs where event_key='crashed'")).rows[0].state,'blocked');
 }finally{await db.close();}
});
