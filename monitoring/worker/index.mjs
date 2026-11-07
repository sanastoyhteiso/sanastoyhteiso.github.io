/*
 * Sanastoyhteisö V3 — trusted technical diagnostics, Cloudflare Workers + D1.
 * Run 143. NOT deployed by GitHub Pages. Requires owner-controlled Worker+D1.
 * NO Firestore direct telemetry writes, study answers, emails, UIDs, URLs,
 * token logging, raw stacktraces or patient information in any database row.
 */
const PROJECT='riveria-sanasto-community-test';
const ORIGIN='https://sanastoyhteiso.github.io';
const JWKS_URL='https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const MAX_BODY=768, MAX_PER_HOUR=24, MAX_PER_DAY=1000, HISTORY_MS=7*86400000;
const ALLOWED=new Set([
 'APP_RENDER_FAILED','SYNC_UPLOAD_FAILED','SYNC_DOWNLOAD_FAILED',
 'SYNC_QUEUE_STUCK','INDEXEDDB_UNAVAILABLE','CACHE_MISMATCH',
 'OFFLINE_REPLAY_FAILED','FIRESTORE_PERMISSION_DENIED',
 'AUTH_REFRESH_FAILED','AUTH_PERMISSION_DENIED',
 'STORAGE_QUOTA_EXCEEDED','BACKUP_VERIFY_FAILED'
]);
const BROWSERS=new Set(['ios-safari','safari','chrome','firefox','edge','other']);
let keyCache=null, keyExpire=0;
function fail(status,code){
 return new Response(JSON.stringify({ok:false,error:code}),{
   status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':ORIGIN,'Vary':'Origin'}
 });
}
function answer(data,status=200){
 return new Response(JSON.stringify(data),{status,headers:{
  'Content-Type':'application/json','Cache-Control':'no-store',
  'Access-Control-Allow-Origin':ORIGIN,'Vary':'Origin',
  'X-Content-Type-Options':'nosniff'
 }});
}
function decoded(segment){
 if(typeof segment!=='string'||segment.length>8192||!/^[A-Za-z0-9_-]+$/.test(segment))
   throw Error('BAD_TOKEN');
 const raw=atob(segment.replace(/-/g,'+').replace(/_/g,'/')+
   '='.repeat((4-segment.length%4)%4));
 return Uint8Array.from(raw,c=>c.charCodeAt(0));
}
function parseSegment(segment){
 const result=JSON.parse(new TextDecoder().decode(decoded(segment)));
 if(!result||typeof result!=='object'||Array.isArray(result))throw Error('BAD_TOKEN');
 return result;
}
async function keys(now=Date.now(),httpFetch=fetch){
 if(keyCache&&now<keyExpire)return keyCache;
 const res=await httpFetch(JWKS_URL);
 if(!res.ok)throw Error('JWKS_UNAVAILABLE');
 const obj=await res.json();
 if(!obj||!Array.isArray(obj.keys)||obj.keys.length<1||obj.keys.length>20)throw Error('BAD_JWKS');
 const pairs=new Map();
 for(const k of obj.keys){
   if(k.kty==='RSA'&&k.use==='sig'&&k.alg==='RS256'&&
      typeof k.kid==='string'&&/^[A-Za-z0-9_-]{4,128}$/.test(k.kid)&&
      typeof k.n==='string'&&typeof k.e==='string')pairs.set(k.kid,k);
 }
 if(!pairs.size)throw Error('BAD_JWKS');
 const cache=(res.headers.get('Cache-Control')||'').match(/max-age=(\d+)/);
 const lifetime=Math.min(3600000,Math.max(30000,Number(cache&&cache[1]||300)*1000));
 keyCache=pairs;keyExpire=now+lifetime;return pairs;
}
async function verifyFirebase(jwt,now=Date.now(),httpFetch=fetch){
 if(typeof jwt!=='string'||jwt.length>5500)throw Error('BAD_TOKEN');
 const parts=jwt.split('.');
 if(parts.length!==3)throw Error('BAD_TOKEN');
 const header=parseSegment(parts[0]),claim=parseSegment(parts[1]);
 if(header.alg!=='RS256'||typeof header.kid!=='string'||
    header.kid.length>128||header.typ&&header.typ!=='JWT')throw Error('BAD_HEADER');
 const sec=Math.floor(now/1000);
 if(claim.aud!==PROJECT||claim.iss!=='https://securetoken.google.com/'+PROJECT||
    typeof claim.sub!=='string'||!/^[-A-Za-z0-9_:]{1,128}$/.test(claim.sub)||
    !Number.isInteger(claim.exp)||claim.exp<=sec||
    !Number.isInteger(claim.iat)||claim.iat>sec||claim.iat<sec-3700||
    !Number.isInteger(claim.auth_time)||claim.auth_time>sec||claim.auth_time<=0||
    claim.email_verified!==true)throw Error('BAD_CLAIM');
 const publicKey=(await keys(now,httpFetch)).get(header.kid);
 if(!publicKey)throw Error('KEY_NOT_FOUND');
 const key=await crypto.subtle.importKey('jwk',publicKey,
   {name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 const verified=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,
   decoded(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));
 if(!verified)throw Error('BAD_SIGNATURE');
 return {sub:claim.sub,admin:claim.admin===true,verified:true};
}
async function hmacHex(secret,message){
 if(typeof secret!=='string'||secret.length<32)throw Error('SERVER_NOT_CONFIGURED');
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),
   {name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signed=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(message));
 return Array.from(new Uint8Array(signed),x=>x.toString(16).padStart(2,'0')).join('');
}
function validEvent(x){
 if(!x||typeof x!=='object'||Array.isArray(x))return false;
 const names=Object.keys(x).sort().join('|');
 return names==='browser|code|id|release|v'&&x.v===1&&
   typeof x.id==='string'&&/^E_[a-f0-9]{32}$/.test(x.id)&&
   ALLOWED.has(x.code)&&BROWSERS.has(x.browser)&&
   typeof x.release==='string'&&/^[A-Za-z0-9_.-]{3,40}$/.test(x.release);
}
async function ident(req,now,httpFetch){
 const authorization=req.headers.get('Authorization')||'';
 if(!/^Bearer [A-Za-z0-9_.-]{90,5500}$/.test(authorization))throw Error('NO_BEARER');
 return verifyFirebase(authorization.slice(7),now,httpFetch);
}
async function record(db,env,user,event,now){
 const owner=await hmacHex(env.HASH_KEY,'owner:'+user.sub+':'+Math.floor(now/3600000));
 const id=await hmacHex(env.HASH_KEY,'event:'+user.sub+':'+event.id);
 const duplicate=await db.prepare('SELECT id FROM telemetry_events WHERE id=?').bind(id).first();
 if(duplicate)return {ok:true,duplicate:true};
 const midnight=Math.floor(now/86400000)*86400000;
 const globalCount=await db.prepare('SELECT COUNT(*) AS n FROM telemetry_events WHERE received_ms>=?').bind(midnight).first();
 if((globalCount&&globalCount.n||0)>=MAX_PER_DAY)throw Error('GLOBAL_LIMIT');
 const quota=await db.prepare(
  'INSERT INTO telemetry_quota(actor_key,used,updated_ms) VALUES(?,1,?) '+
  'ON CONFLICT(actor_key) DO UPDATE SET used=used+1,updated_ms=excluded.updated_ms '+
  'WHERE used < ? RETURNING used').bind(owner,now,MAX_PER_HOUR).first();
 if(!quota)throw Error('ACTOR_LIMIT');
 const write=await db.prepare(
  'INSERT INTO telemetry_events(id,code,release,browser,received_ms) VALUES(?,?,?,?,?) '+
  'ON CONFLICT(id) DO NOTHING RETURNING id'
 ).bind(id,event.code,event.release,event.browser,now).first();
 if(!write)return {ok:true,duplicate:true};
 return {ok:true,duplicate:false};
}
async function summary(db,now){
 const start=now-86400000;
 const total=await db.prepare('SELECT COUNT(*) AS n FROM telemetry_events WHERE received_ms>=?').bind(start).first();
 const groups=await db.prepare(
  'SELECT code,COUNT(*) AS count FROM telemetry_events WHERE received_ms>=? '+
  'GROUP BY code ORDER BY count DESC LIMIT 30').bind(start).all();
 const browsers=await db.prepare(
  'SELECT browser,COUNT(*) AS count FROM telemetry_events WHERE received_ms>=? '+
  'GROUP BY browser ORDER BY count DESC LIMIT 10').bind(start).all();
 const latest=await db.prepare('SELECT MAX(received_ms) AS last_at FROM telemetry_events').first();
 const scheduled=await db.prepare('SELECT value_ms FROM telemetry_heartbeat WHERE name=?').bind('cron').first();
 return {
  backendConnected:true,monitoringActive:true,
  monitoringCoverageVerified:false,siteStatus:'unknown',
  updatedAt:new Date(now).toISOString(),
  ingestionHeartbeatAt:latest&&latest.last_at?new Date(latest.last_at).toISOString():null,
  aggregationHeartbeatAt:scheduled&&scheduled.value_ms?new Date(scheduled.value_ms).toISOString():null,
  errors24h:total&&total.n||0,
  errorGroups:(groups.results||[]).map(x=>({code:x.code,count:x.count})),
  browserGroups:(browsers.results||[]).map(x=>({browser:x.browser,count:x.count})),
  serverDataOnly:true,releaseVersion:'v3-monitor-pilot',
  note:'Authenticated reports only; coverage and no-error status unverified'
 };
}
function configured(env){
 return env&&env.FIREBASE_PROJECT_ID===PROJECT&&env.DB&&typeof env.HASH_KEY==='string'&&env.HASH_KEY.length>=32;
}
export const __test={validEvent,verifyFirebase,hmacHex,record,summary,configured};
export default {
 async fetch(request,env){
  const now=Date.now();
  if(!configured(env))return fail(503,'BACKEND_NOT_CONFIGURED');
  if(request.headers.get('Origin')!==ORIGIN)return fail(403,'ORIGIN_DENIED');
  const url=new URL(request.url);
  if(url.search||!['/v1/events','/v1/summary'].includes(url.pathname))return fail(404,'NOT_FOUND');
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{
    'Access-Control-Allow-Origin':ORIGIN,
    'Access-Control-Allow-Methods':'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers':'Authorization, Content-Type',
    'Access-Control-Max-Age':'600','Vary':'Origin'
  }});
  if((url.pathname==='/v1/events'&&request.method!=='POST')||
     (url.pathname==='/v1/summary'&&request.method!=='GET'))return fail(405,'METHOD_DENIED');
  let user;
  try{user=await ident(request,now,fetch);}
  catch(_ignore){return fail(401,'AUTH_DENIED');}
  try{
   if(url.pathname==='/v1/summary'){
    if(!user.admin)return fail(403,'ADMIN_REQUIRED');
    return answer(await summary(env.DB,now));
   }
   if((request.headers.get('Content-Type')||'').split(';')[0].toLowerCase()!=='application/json')
     return fail(415,'CONTENT_TYPE');
   if(Number(request.headers.get('Content-Length')||0)>MAX_BODY)return fail(413,'TOO_LARGE');
   const raw=await request.text();
   if(raw.length>MAX_BODY)return fail(413,'TOO_LARGE');
   let event;
   try{event=JSON.parse(raw);}catch(_ignore){return fail(400,'INVALID_JSON');}
   if(!validEvent(event))return fail(400,'INVALID_EVENT');
   const result=await record(env.DB,env,user,event,now);
   return answer(result,result.duplicate?200:201);
  }catch(error){
   if(error.message==='ACTOR_LIMIT'||error.message==='GLOBAL_LIMIT')return fail(429,'RATE_LIMIT');
   return fail(503,'BACKEND_UNAVAILABLE');
  }
 },
 async scheduled(_controller,env){
  if(!configured(env))throw Error('BACKEND_NOT_CONFIGURED');
  const now=Date.now();
  // Independent D1 roundtrip heartbeat. Does NOT prove that any browser sent events.
  await env.DB.prepare('INSERT INTO telemetry_heartbeat(name,value_ms) VALUES(?,?) '+
    'ON CONFLICT(name) DO UPDATE SET value_ms=excluded.value_ms').bind('cron',now).run();
  const verified=await env.DB.prepare('SELECT value_ms FROM telemetry_heartbeat WHERE name=?').bind('cron').first();
  if(!verified||verified.value_ms!==now)throw Error('CRON_READBACK_FAILED');
  await env.DB.prepare('DELETE FROM telemetry_events WHERE received_ms<?').bind(now-HISTORY_MS).run();
  await env.DB.prepare('DELETE FROM telemetry_quota WHERE updated_ms<?').bind(now-2*86400000).run();
 }
};
