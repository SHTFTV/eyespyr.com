import {Fault} from './security.mjs';
export function createStorage({url,key,fetcher=fetch}){
 const base=url+'/storage/v1/object/eyespyr-evidence/';
 async function request(path,options={}){if(!/^[a-f0-9-]+\/[a-f0-9-]+\/[a-f0-9-]+$/i.test(path))throw new Fault('invalid_storage_path');const r=await fetcher(base+path,{...options,redirect:'error',signal:AbortSignal.timeout(15000),headers:{apikey:key,Authorization:'Bearer '+key,...options.headers}});if(!r.ok)throw new Fault('storage_unavailable',503);return r;}
 return {upload:async(path,bytes,type)=>{await request(path,{method:'POST',headers:{'Content-Type':type,'x-upsert':'false'},body:bytes});},download:async path=>Buffer.from(await(await request(path)).arrayBuffer()),remove:async path=>{await request(path,{method:'DELETE'});}};
}
