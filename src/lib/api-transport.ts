export class ApiRequestError extends Error {
  status: number;
  constructor(message:string,status:number){super(message);this.name='ApiRequestError';this.status=status;}
}
export function configuredBase(value:string|undefined, development=false):string {
 if(!value?.trim()) return '';
 try {const u=new URL(value);if(u.username||u.password||u.search||u.hash||u.pathname!=='/')return '';
 if(u.protocol==='https:' || (development && u.protocol==='http:' && ['127.0.0.1','localhost','[::1]'].includes(u.hostname)))return u.origin;
 }catch{} return '';
}
export function createCall(API_BASE:string, request:typeof fetch=fetch) { return async function call(path:string, init?:RequestInit):Promise<any> {
 if (!API_BASE) throw new Error('Evidence service is unavailable. Nothing was submitted or queued.');
 let res:Response;
 try { res=await request(API_BASE+path,{...init,signal:AbortSignal.timeout(10000)}); }
 catch { throw new Error('Evidence service could not be reached. Nothing was confirmed or queued.'); }
 if(!res.ok) throw new ApiRequestError(res.status===404?'This evidence record was not found.':'The service did not accept this request. Nothing was confirmed or queued.',res.status);
 try { return await res.json(); } catch { throw new Error('Invalid service response. Nothing was confirmed.'); }
}
}
export function ack(value:any,field:string) {
 if(!value || value.success!==true || typeof value[field]!=='string' || !value[field].trim() || value.demo===true) throw new Error('No saved request was confirmed. Nothing was queued.');
 return value;
}
