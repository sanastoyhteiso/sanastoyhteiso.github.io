import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker,{__test as probe} from '../monitoring/worker/index.mjs';

const PROJECT='riveria-sanasto-community-test',ORIGIN='https://sanastoyhteiso.github.io';
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const jwk={...publicKey.export({format:'jwk'}),kid:'synthetic-kid-001',
 use:'sig',alg:'RS256',key_ops:['verify']};
const fetchKeys=async()=>new Response(JSON.stringify({keys:[jwk]}),{
 status:200,headers:{'Content-Type':'application/json','Cache-Control':'public,max-age=600'}});
const realFetch=globalThis.fetch;
function token({uid='synthetic-143',admin=false,wrongProject=false,verified=true,expired=false}={}){
 const sec=Math.floor(Date.now()/1000);
 const header={alg:'RS256',typ:'JWT',kid:jwk.kid};
 const claims={aud:wrongProject?'different-project':PROJECT,
  iss:'https://securetoken.google.com/'+PROJECT,
  sub:uid,exp:expired?sec-1:sec+300,iat:sec-1,
  auth_time:sec-50,email_verified:verified,admin};
 const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
 const input=encode(header)+'.'+encode(claims);
 return input+'.'+sign('RSA-SHA256',Buffer.from(input),privateKey).toString('base64url');
}
class D1Mock{
 constructor(){
  this.sqlite=new DatabaseSync(':memory:');
  this.sqlite.exec(readFileSync(new URL('../monitoring/worker/schema.sql',import.meta.url),'utf8'));
 }
 prepare(sql){
  const d=this.sqlite;
  return {bind(...args){
   return {
    async first(){return d.prepare(sql).get(...args)||null;},
    async all(){return {results:d.prepare(sql).all(...args)};},
    async run(){const r=d.prepare(sql).run(...args);return {success:true,meta:{changes:r.changes}};}
   };
  }};
 }
 close(){this.sqlite.close();}
}
function env(){return {FIREBASE_PROJECT_ID:PROJECT,HASH_KEY:'unit-test-hmac-key-never-used-in-production-143',DB:new D1Mock()};}
function payload(id='E_'+ 'a'.repeat(32)){
 return {v:1,id,code:'SYNC_UPLOAD_FAILED',browser:'ios-safari',release:'v3.0.0-rc10'};
}
function request(jwt,path='/v1/events',obj=payload(),method='POST',origin=ORIGIN){
 return new Request('https://synthetic-worker.workers.dev'+path,{
  method,headers:{Origin:origin,Authorization:'Bearer '+jwt, 'Content-Type':'application/json'},
  body:method==='POST'?JSON.stringify(obj):undefined});
}
async function call(req,e){
 // Stub ONLY Google's public JWK fetch. No external network.
 globalThis.fetch=fetchKeys;
 try{return await worker.fetch(req,e);}
 finally{globalThis.fetch=realFetch;}
}
test('strict Firebase RS256 JWT checks, no unchecked admin boolean',async()=>{
 const good=token({admin:true}),claims=await probe.verifyFirebase(good,Date.now(),fetchKeys);
 assert.equal(claims.admin,true);
 await assert.rejects(probe.verifyFirebase(token({wrongProject:true}),Date.now(),fetchKeys));
 await assert.rejects(probe.verifyFirebase(token({verified:false}),Date.now(),fetchKeys));
 await assert.rejects(probe.verifyFirebase(token({expired:true}),Date.now(),fetchKeys));
 const bad=good.replace(/\.[^.]+$/,'.'+Buffer.from('bad-signature').toString('base64url'));
 await assert.rejects(probe.verifyFirebase(bad,Date.now(),fetchKeys));
});
test('reject foreign Origin/unknown fields/plaintext and unauthenticated request',async()=>{
 const e=env(),u=token();
 try{
  assert.equal((await call(request(u,'/v1/events',payload(),'POST','https://evil.invalid'),e)).status,403);
  assert.equal((await call(request(u,'/v1/events',{...payload(),email:'secret@example.invalid'}),e)).status,400);
  assert.equal((await call(request(u,'/v1/events',{...payload(),code:'ANSWER_WRONG'}),e)).status,400);
  assert.equal((await call(request(u,'/v1/events',{...payload(),url:'https://private.invalid'}),e)).status,400);
  assert.equal((await call(request('not.a.valid.token'),e)).status,401);
  assert.equal((await call(request(u,'/v1/events',payload(),'GET'),e)).status,405);
  const n=await e.DB.prepare('SELECT COUNT(*) AS n FROM telemetry_events').first();
  assert.equal(n.n,0);
 }finally{e.DB.close();}
});
test('durable event receipt is idempotent; admin can view aggregates, ordinary user denied',async()=>{
 const e=env(),jwt=token(),admin=token({admin:true});
 try{
  const first=await call(request(jwt),e);
  assert.equal(first.status,201);
  assert.deepEqual(await first.json(),{ok:true,duplicate:false});
  const duplicate=await call(request(jwt),e);
  assert.equal(duplicate.status,200);
  assert.equal((await duplicate.json()).duplicate,true);
  assert.equal((await call(request(jwt,'/v1/summary',null,'GET'),e)).status,403);
  const result=await call(request(admin,'/v1/summary',null,'GET'),e);
  assert.equal(result.status,200);
  const data=await result.json();
  assert.equal(data.errors24h,1);
  assert.deepEqual(data.errorGroups,[{code:'SYNC_UPLOAD_FAILED',count:1}]);
  assert.equal(data.backendConnected,true);
  assert.equal(data.monitoringCoverageVerified,false);
  assert.equal(data.siteStatus,'unknown');
  const sql=e.DB.sqlite.prepare('SELECT * FROM telemetry_events').all();
  assert.equal(sql.length,1);
  assert.deepEqual(Object.keys(sql[0]),['id','code','release','browser','received_ms']);
  assert.ok(!JSON.stringify(sql).includes('synthetic-143'));
 }finally{e.DB.close();}
});
test('server-side actor hourly quota rejects flooding; no extra rows',async()=>{
 const e=env(),u=token();
 try{
  for(let n=0;n<24;n++){
   const event={...payload(),id:'E_'+n.toString(16).padStart(32,'0')};
   assert.equal((await call(request(u,'/v1/events',event),e)).status,201);
  }
  const last={...payload(),id:'E_'+'f'.repeat(32)};
  assert.equal((await call(request(u,'/v1/events',last),e)).status,429);
  const count=await e.DB.prepare('SELECT COUNT(*) AS n FROM telemetry_events').first();
  assert.equal(count.n,24);
 }finally{e.DB.close();}
});
test('scheduled heartbeat is independent of browser ingestion; expires old events',async()=>{
 const e=env();
 try{
  await worker.scheduled({cron:'*/5 * * * *'},e);
  const hb=await e.DB.prepare('SELECT value_ms FROM telemetry_heartbeat WHERE name=?').bind('cron').first();
  assert.ok(hb.value_ms>0);
  const result=await probe.summary(e.DB,Date.now());
  assert.equal(result.errors24h,0);
  assert.equal(result.ingestionHeartbeatAt,null);
  assert.equal(result.monitoringCoverageVerified,false);
  assert.ok(result.aggregationHeartbeatAt);
 }finally{e.DB.close();}
});
