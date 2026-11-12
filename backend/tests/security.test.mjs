import test from 'node:test';import assert from 'node:assert/strict';
import {date,inspect,authenticate,transitionAllowed} from '../security.mjs';
import {boundedBody,createHttp} from '../http.mjs';
test('calendar, file validation and human-only transitions',()=>{
 assert.equal(date('2024-02-29'),'2024-02-29');for(const d of ['2026-02-29','2026-13-02','nonsense'])assert.throws(()=>date(d));
 assert.throws(()=>inspect(Buffer.from('HTML'),'application/pdf'));assert.throws(()=>inspect(Buffer.alloc(10485761),'image/png'));
 assert.equal(inspect(Buffer.from('%PDF-synthetic'),'application/pdf').type,'application/pdf');
 assert.throws(()=>transitionAllowed('decision_ready','published',true,true));assert.throws(()=>transitionAllowed('submitted','in_review',true,false));
});
test('auth verifies provider before trusting claims; ignores editable metadata roles',async()=>{
 const id='10000000-0000-4000-8000-000000000001',sid='30000000-0000-4000-8000-000000000001',url='https://synthetic.supabase.co';
 const claims={sub:id,session_id:sid,exp:9999999999,iss:url+'/auth/v1',aud:'authenticated',role:'authenticated',user_metadata:{admin:true}};
 const req=v=>new Request('https://www.eyespyr.com/api/private/cases',{headers:{authorization:'Bearer e30.'+Buffer.from(JSON.stringify(v)).toString('base64url')+'.signature'}});
 const fetcher=async()=>Response.json({id,email:'fixture@example.invalid',email_confirmed_at:'2026-11-11'});
 assert.equal((await authenticate(req(claims),{url,key:'synthetic',fetcher})).id,id);
 await assert.rejects(authenticate(req(claims),{url,key:'synthetic',fetcher:async()=>new Response('',{status:401})}));
 await assert.rejects(authenticate(req({...claims,exp:1}),{url,key:'synthetic',fetcher}));
 await assert.rejects(authenticate(req({...claims,iss:'https://wrong.invalid'}),{url,key:'synthetic',fetcher}));
});
test('HTTP fails closed and streams body limit without leaking secrets',async()=>{
 const handler=createHttp({service:null,health:async()=>({operationally_complete:false})});
 const r=await handler(new Request('https://www.eyespyr.com/api/private/cases'));assert.equal(r.status,503);assert.match(r.headers.get('cache-control'),/no-store/);
 await assert.rejects(boundedBody(new Request('https://example.invalid',{method:'POST',body:'12345'}),4));
});
