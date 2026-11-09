import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {__test as api} from '../monitoring/worker/index.mjs';
class Database{
 constructor(){
  this.db=new DatabaseSync(':memory:');
  this.db.exec(readFileSync(new URL('../monitoring/worker/schema.sql',import.meta.url),'utf8'));
  this.db.exec(readFileSync(new URL('../monitoring/worker/schema-run169-migration.sql',import.meta.url),'utf8'));
 }
 prepare(sql){const db=this.db;function stmt(args){return {
  bind(...next){return stmt(next);},
  async first(){return db.prepare(sql).get(...args)||null;},
  async all(){return {results:db.prepare(sql).all(...args)};},
  async run(){return db.prepare(sql).run(...args);}
 }}return stmt([]);}
 close(){this.db.close();}
}
const admin={sub:'synthetic-owner-169',admin:true,verified:true,provider:'google.com'};
const env=()=>({
 DB:new Database(),HASH_KEY:'synthetic-hmac-never-live-169-aaaaaaaa',
 FIREBASE_PROJECT_ID:'riveria-sanasto-community-test',
 SUPERADMIN_UID:'synthetic-owner-169',ACTIVITY_ENABLED:'true'
});
test('superadmin requires explicit server allowlist, admin and Google login',()=>{
 const e=env();
 try{
  assert.equal(api.ownerAllowed(e,admin),true);
  assert.equal(api.ownerAllowed(e,{...admin,sub:'other'}),false);
  assert.equal(api.ownerAllowed(e,{...admin,admin:false}),false);
  assert.equal(api.ownerAllowed(e,{...admin,provider:'password'}),false);
  assert.equal(api.ownerAllowed({...e,SUPERADMIN_UID:undefined},admin),false);
 }finally{e.DB.close();}
});
test('opt-in event rejects extra fields and stores only HMAC actor identifier',async()=>{
 const e=env(),now=Date.parse('2026-11-08T20:30:00Z');
 try{
  assert.equal(api.validVisit({v:1,kind:'visit',consent:true}),true);
  assert.equal(api.validVisit({v:1,kind:'visit',consent:true,email:'x@example.invalid'}),false);
  assert.equal(api.validVisit({v:1,kind:'exam_finish',consent:true,answers:[1]}),false);
  const learner={...admin,sub:'synthetic-learner',admin:false};
  assert.equal((await api.markVisit(e.DB,e,learner,{kind:'visit'},now)).duplicate,false);
  assert.equal((await api.markVisit(e.DB,e,learner,{kind:'visit'},now+1000)).duplicate,true);
  await api.markVisit(e.DB,e,learner,{kind:'exam_start'},now);
  const raw=e.DB.db.prepare('SELECT * FROM activity_days').all();
  assert.equal(raw.length,2);
  assert.ok(!JSON.stringify(raw).includes('synthetic-learner'));
  assert.ok(!JSON.stringify(raw).includes('x@example.invalid'));
  assert.equal(api.dayInHelsinki(now),'2026-11-08');
  const view=await api.adminActivity(e.DB,e,admin,new URL('https://example.invalid/v1/admin/activity?days=30'),now+2000);
  assert.equal(view.coverage,'opt_in_only');
  assert.equal(view.rows.length,2);
  assert.equal(view.rows[0].userKey.length,64);
  assert.deepEqual(e.DB.db.prepare('SELECT kind FROM admin_audit').all().map(x=>x.kind),['activity_read']);
 }finally{e.DB.close();}
});
test('disabled intake fails closed; privileged directory requires owner role',async()=>{
 const e=env();e.ACTIVITY_ENABLED='false';
 try{
  await assert.rejects(api.markVisit(e.DB,e,admin,{kind:'visit'},Date.now()),/ACTIVITY_DISABLED/);
  await assert.rejects(api.listRegisteredUsers(e.DB,e,{...admin,sub:'other'},new URL('https://example.invalid/v1/admin/users?limit=50'),Date.now(),async()=>{throw Error('should not call');}),/ADMIN_DENIED/);
  assert.equal(e.DB.db.prepare('SELECT COUNT(*) AS n FROM activity_days').get().n,0);
 }finally{e.DB.close();}
});
test('browser scripts have no service-account secrets and require server readback',()=>{
 const html=readFileSync(new URL('../admin/index.html',import.meta.url),'utf8');
 const worker=readFileSync(new URL('../monitoring/worker/index.mjs',import.meta.url),'utf8');
 const adapter=readFileSync(new URL('../admin/superadmin-read.js',import.meta.url),'utf8');
 assert.ok(html.includes('superadmin-read.js?v=superadmin-run169-1'));
 assert.ok(adapter.includes('/v1/admin/users?limit=50'));
 assert.ok(adapter.includes('/v1/admin/activity?days=30'));
 assert.ok(!adapter.includes('private_key'));
 assert.ok(!adapter.includes('ADMIN_DIRECTORY_SERVICE_ACCOUNT_JSON'));
 assert.ok(worker.includes('adminAudit'));
});
