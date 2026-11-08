// Body Dashboard's OAuth-only broker. Records/photos go directly to Drive, never through this Worker.
const PROD_ORIGIN = 'https://9r5wwng7nj-netizen.github.io';
const PROD_REDIRECT = PROD_ORIGIN + '/body-dashboard-/index.html';
const TOKEN = 'https://oauth2.googleapis.com/token';
const REVOKE = 'https://oauth2.googleapis.com/revoke';
const headers = origin => ({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
const reply = (origin, value, status = 200) => new Response(JSON.stringify(value), {status, headers:headers(origin)});
export async function handle(request, env, fetchGoogle = fetch) {
  const origin = request.headers.get('Origin');
  if (origin !== PROD_ORIGIN) return new Response('Forbidden', {status:403,headers:{'Cache-Control':'no-store'}});
  const path = new URL(request.url).pathname;
  if (!['/google/ready','/google/token','/google/refresh','/google/revoke'].includes(path)) return reply(origin,{error:'not_found'},404);
  if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:{...headers(origin),'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600'}});
  const ready = !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
  if (path === '/google/ready' && request.method === 'GET') return reply(origin,{ready,clientId:ready?env.GOOGLE_CLIENT_ID:''});
  if (request.method !== 'POST') return reply(origin,{error:'method_not_allowed'},405);
  if (!ready) return reply(origin,{error:'not_set_up'},503);
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return reply(origin,{error:'invalid_request'},400);
  let body;try {const reader=request.body?.getReader();if(!reader)return reply(origin,{error:'invalid_request'},400);const decoder=new TextDecoder();let total=0,text='';for(;;){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>8192){await reader.cancel();return reply(origin,{error:'too_large'},413);}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();body=JSON.parse(text);}catch{return reply(origin,{error:'invalid_request'},400);}
  const text=v=>typeof v==='string'&&v.length>0&&v.length<4096;
  const form = {client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET};
  let endpoint=TOKEN;
  if(path==='/google/token'&&text(body?.code)&&/^[A-Za-z0-9._~-]{43,128}$/.test(body.verifier||'')&&body.redirect_uri===PROD_REDIRECT)Object.assign(form,{grant_type:'authorization_code',code:body.code,code_verifier:body.verifier,redirect_uri:PROD_REDIRECT});
  else if(path==='/google/refresh'&&text(body?.refresh_token))Object.assign(form,{grant_type:'refresh_token',refresh_token:body.refresh_token});
  else if(path==='/google/revoke'&&text(body?.token)){endpoint=REVOKE;Object.keys(form).forEach(k=>delete form[k]);form.token=body.token;}
  else return reply(origin,{error:'invalid_request'},400);
  try {
    const response=await fetchGoogle(endpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(form),signal:AbortSignal.timeout(15000)});
    if(endpoint===REVOKE)return reply(origin,{revoked:response.ok},response.ok?200:400);
    const data=await response.json();
    if(!response.ok)return reply(origin,{error:data.error==='invalid_grant'?'invalid_grant':'google_auth_failed'},400);
    if(!text(data.access_token))return reply(origin,{error:'invalid_token_response'},502);
    return reply(origin,Object.fromEntries(['access_token','refresh_token','expires_in','scope','token_type'].filter(k=>data[k]!=null).map(k=>[k,data[k]])));
  }catch{return reply(origin,{error:'google_unavailable'},502);}
}
export default {fetch(request,env){return handle(request,env);}};
