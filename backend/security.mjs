import {createHash} from 'node:crypto';
export class Fault extends Error { constructor(code,status=400){super(code);this.code=code;this.status=status;} }
export const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export function uuid(value){if(typeof value!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value))throw new Fault('invalid_id');return value;}
export function text(value,max=500){if(typeof value!=='string'||!value.trim()||value.length>max)throw new Fault('invalid_text');return value.trim();}
export function date(value){if(value==null||value==='')return null;if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T00:00:00Z'))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)throw new Fault('invalid_date');return value;}
export function inspect(bytes,declared){
 if(!Buffer.isBuffer(bytes)||!bytes.length||bytes.length>10485760)throw new Fault('invalid_file_size',413);
 const type=bytes.subarray(0,5).toString()==='%PDF-'?'application/pdf':bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':null;
 if(!type||declared!==type)throw new Fault('unsupported_file',415);
 // Magic bytes classify; they do not prove a safe file. Every original stays quarantined.
 return {type,bytes:bytes.length,sha256:hash(bytes)};
}
export const edges={collecting:['submitted'],submitted:['in_review'],in_review:['needs_information','decision_ready'],needs_information:['collecting','in_review'],decision_ready:['in_review','closed'],closed:[]};
export function transitionAllowed(from,to,owner,reviewer){if(!edges[from]?.includes(to))throw new Fault('invalid_transition',409);if(from==='collecting'? !owner:!reviewer)throw new Fault('forbidden',403);}
export async function authenticate(request,{url,key,fetcher=fetch,now=()=>Date.now()}){
 const token=request.headers.get('authorization')?.match(/^Bearer ([A-Za-z0-9_.-]+)$/)?.[1];
 if(!token||token.length>8192)throw new Fault('unauthenticated',401);
 // GET /user verifies signature server-side. Decoded claims are trusted only after this succeeds.
 const response=await fetcher(url+'/auth/v1/user',{headers:{apikey:key,Authorization:'Bearer '+token},signal:AbortSignal.timeout(8000),redirect:'error'});
 if(!response.ok)throw new Fault(response.status>=500?'auth_unavailable':'unauthenticated',response.status>=500?503:401);
 const user=await response.json();let claims;try{claims=JSON.parse(Buffer.from(token.split('.')[1],'base64url'));}catch{throw new Fault('unauthenticated',401);}
 if(user.is_anonymous||!user.email_confirmed_at||claims.sub!==user.id||claims.iss!==url+'/auth/v1'||claims.role!=='authenticated'||!Number.isFinite(claims.exp)||claims.exp*1000<=now()||!(Array.isArray(claims.aud)?claims.aud:[claims.aud]).includes('authenticated'))throw new Fault('unauthenticated',401);
 return {id:uuid(user.id),sessionId:uuid(claims.session_id),email:user.email,expires:new Date(claims.exp*1000).toISOString()};
}
