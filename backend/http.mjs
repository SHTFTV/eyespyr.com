import {authenticate,Fault,uuid} from './security.mjs';
const headers={'Cache-Control':'no-store, private','Content-Type':'application/json','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
export async function boundedBody(request,max=10485760){const reader=request.body?.getReader();if(!reader)return Buffer.alloc(0);const chunks=[];let length=0;try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>max){await reader.cancel();throw new Fault('body_too_large',413);}chunks.push(value);}return Buffer.concat(chunks);}finally{reader.releaseLock();}}
export function createHttp({service,auth,health}){
 return async request=>{
  const path=new URL(request.url).pathname;
  const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers});
  try{
   if(path==='/api/health/backend')return json(await health(),503);
   if(!path.startsWith('/api/private/'))return null;
   if(!service)throw new Fault('backend_not_connected',503);
   const actor=await authenticate(request,auth);
   if(path==='/api/private/invitations'&&request.method==='POST'){const input=JSON.parse((await boundedBody(request,8192)).toString());return json(await service.createInvitation(actor,input.businessId,input.recipient),201);}
   if(path==='/api/private/invitations/redeem'&&request.method==='POST'){const input=JSON.parse((await boundedBody(request,8192)).toString());return json(await service.redeemInvitation(actor,input.token));}
   if(path==='/api/private/cases'&&request.method==='POST'){const input=JSON.parse((await boundedBody(request,8192)).toString());return json(await service.createCase(actor,input.businessId),201);}
   const m=path.match(/^\/api\/private\/cases\/([^/]+)(?:\/(transition|evidence|findings|decision|retention)(?:\/([^/]+))?)?$/);if(!m)throw new Fault('not_found',404);uuid(m[1]);
   if(request.method==='GET'&&!m[2])return json(await service.readCase(actor,m[1]));
   if(request.method==='GET'&&m[2]==='retention')return json(await service.retentionCandidates(actor,m[1]));
   if(request.method==='GET'&&m[2]==='evidence'&&m[3]){const f=await service.preview(actor,m[1],m[3]);return new Response(f.bytes,{headers:{...headers,'Content-Type':f.type,'Content-Disposition':'attachment; filename="evidence"','Content-Security-Policy':"sandbox; default-src 'none'"}});}
   if(request.method!=='POST'||m[3])throw new Fault('method_not_allowed',405);
   if(m[2]==='evidence'){
    let metadata;try{metadata=JSON.parse(request.headers.get('x-evidence-metadata')??'{}');}catch{throw new Fault('invalid_metadata');}
    return json(await service.upload(actor,m[1],await boundedBody(request),{...metadata,contentType:request.headers.get('content-type')}),201);
   }
   const input=JSON.parse((await boundedBody(request,16384)).toString());
   if(m[2]==='transition')return json(await service.transition(actor,m[1],input.state,input.version));
   if(m[2]==='findings')return json(await service.finding(actor,m[1],input),201);
   if(m[2]==='decision')return json(await service.decision(actor,m[1],input),201);
   throw new Fault('not_found',404);
  }catch(e){if(e instanceof Fault)return json({error:e.code},e.status);if(e instanceof SyntaxError)return json({error:'invalid_json'},400);return json({error:'backend_unavailable'},503);}
 };
}
