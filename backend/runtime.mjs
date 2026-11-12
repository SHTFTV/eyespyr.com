import sotRaw from './sot.json?raw';
import {createHttp} from './http.mjs';
import {createService} from './service.mjs';
import {createStorage} from './storage.mjs';
import {runWorker} from './worker.mjs';
import {timingSafeEqual} from 'node:crypto';
let handler;
let workerPool,workerStorage;
export async function handleBackend(request){
 const path=new URL(request.url).pathname;
 if(!path.match(/^\/api\/(private\/|health\/backend$|internal\/site-bot$)/))return null;
 if(path==='/api/internal/site-bot'){
  const expected=process.env.CRON_SECRET,actual=request.headers.get('authorization')?.slice(7)??'';
  if(!expected||expected.length<32||actual.length!==expected.length||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return Response.json({error:'unauthenticated'},{status:401,headers:{'Cache-Control':'no-store'}});
 }
 if(!handler){
  const env=process.env;let pool,service;
  if(env.EYESPYR_DATABASE_URL&&env.EYESPYR_SUPABASE_URL&&env.EYESPYR_STORAGE_SECRET){
   const {Pool}=await import('pg');pool=new Pool({connectionString:env.EYESPYR_DATABASE_URL,max:3,ssl:{rejectUnauthorized:true},connectionTimeoutMillis:8000,statement_timeout:15000});
   workerPool=pool;workerStorage=createStorage({url:env.EYESPYR_SUPABASE_URL,key:env.EYESPYR_STORAGE_SECRET});
   service=createService({pool,storage:workerStorage,retentionApproved:false});
  }
  handler=createHttp({service,auth:{url:env.EYESPYR_SUPABASE_URL,key:env.EYESPYR_PUBLISHABLE_KEY},health:async()=>({domain:'eyespyr.com',operationally_complete:false,status:'red',databaseConfigured:!!pool,blockers:['hosted-runtime-proof-missing','retention-not-approved','scanner-not-connected','invitation-delivery-unverified','scheduled-worker-unverified','owner-alert-unverified']})});
 }
 if(path==='/api/internal/site-bot'){
  if(!workerPool)return Response.json({workerId:'eyespyr-site-bot',operationally_complete:false,error:'database_not_connected'},{status:503,headers:{'Cache-Control':'no-store'}});
  try{
   await workerPool.query("insert into eyespyr_private.jobs(event_key,kind) values($1,'health') on conflict(event_key) do nothing",['health:'+Math.floor(Date.now()/900000)]);
   const result=await runWorker({pool:workerPool,loadSot:async()=>sotRaw,handlers:{
    health:async()=>{await workerPool.query('select 1');for(const [code,action] of [['scanner-not-connected','Connect and verify the approved scanner before preview.'],['invitation-delivery-unverified','Verify EyeSpyR sender and synthetic receiving inbox.'],['retention-not-approved','Confirm retention periods before live collection.'],['owner-alert-unverified','Connect the existing owner alert transport and save its receipt.']])await workerPool.query('insert into eyespyr_private.blockers(code,next_action) values($1,$2) on conflict(code) do update set last_seen=now()',[code,action]);},
    scan:async()=>{throw Error('scanner_not_connected');},
    orphan_cleanup:async payload=>{const row=await workerPool.query('select id from eyespyr_private.evidence_versions where id=$1',[payload.evidenceId]);if(!row.rows.length)await workerStorage.remove(payload.path);}
   }});
   return Response.json(result,{headers:{'Cache-Control':'no-store'}});
  }catch{return Response.json({error:'worker_unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}
 }
 return handler(request);
}
