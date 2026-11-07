/* Staging only: read-only recovery audit against synthetic shadow records. */
'use strict';
const assert=require('assert');
const {IDBFactory}=require('fake-indexeddb');
const Core=require('../rs-sync-core.js');
const Shadow=require('../rs-sync-shadow-idb.js');
const Audit=require('../rs-sync-recovery-audit.js');
const idb=new IDBFactory();
const owner='alice',E=n=>'E_'+n.toString(16).padStart(32,'0');
let active=owner;
const shadow=Shadow.create({indexedDB:idb,core:Core,
  activeUid:()=>active,enableStagingWrites:true,now:()=>1793800000000});
const audit=Audit.create({shadow,normalizeSnapshot:Shadow.snapshot,
  core:Core,activeUid:()=>active});
function evt(n,correct){
  return Core.event(E(n),'D_'+'a'.repeat(32),'answer','T00001',
    {correct:!!correct},1793800000000+n);
}
async function alterForTest(mutator){
  const db=await new Promise((resolve,reject)=>{
    const req=idb.open('sanastoyhteiso_staging_shadow_v3',1);
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
  await new Promise((resolve,reject)=>{
    const tx=db.transaction('accounts','readwrite');
    const store=tx.objectStore('accounts'),req=store.get(owner);
    req.onsuccess=()=>{const row=req.result;mutator(row);store.put(row,owner);};
    tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||Error('Simulated transaction aborted'));
  });
  db.close();
}
async function run(){
  const seed={scores:{T00001:{seen:1,correct:1,wrong:0,learned:true}},
    words:{L1:{id:'L1',fi:'asuminen',ru:'проживание'}},
    favorites:{T00001:true}};
  await shadow.initialize(owner,seed,'VERIFIED_STAGING_SHADOW_ONLY');
  const first=await audit.audit(owner);
  assert.equal(first.ok,true);
  assert.equal(first.readOnly,true);
  assert.equal(first.canAutomaticallyRestore,false);
  assert.equal(first.current.seen,1);
  assert.equal(first.current.words,1);
  assert.equal(first.history.length,0);
  assert.ok(!JSON.stringify(first).includes('asuminen'));
  await shadow.appendLocal(owner,evt(1,true),0);
  await shadow.appendLocal(owner,evt(2,false),1);
  const before=await shadow.read(owner);
  const result=await audit.audit(owner);
  assert.equal(result.current.seen,3);
  assert.equal(result.current.correct,2);
  assert.equal(result.current.wrong,1);
  assert.equal(result.pending,2);
  assert.equal(result.history.length,2);
  assert.deepEqual(result.history.map(x=>x.revision),[0,1]);
  assert.equal(result.history[0].progress.seen,1);
  assert.equal(result.history[1].progress.seen,2);
  assert.equal(result.needsExternalBackup,true);
  assert.equal((await shadow.read(owner)).revision,before.revision);
  assert.equal((await shadow.read(owner)).pending.length,2);
  // Never read private data from an account which is no longer active.
  active='bob';
  await assert.rejects(()=>audit.audit(owner),/account changed/);
  active=owner;
  await alterForTest(record=>{record.history[0].revision=99;});
  await assert.rejects(()=>audit.audit(owner),/Invalid shadow recovery revision history/);
  await alterForTest(record=>{record.history[0].revision=0;
    record.history[1].pending[0].id='E_'+'g'.repeat(32);});
  await assert.rejects(()=>audit.audit(owner),/Corrupt or duplicate event/);
  await alterForTest(record=>{record.history[1].pending[0].id=E(1);});
  const after=await audit.audit(owner);
  assert.equal(after.ok,true);
  assert.equal(after.pending,2);
  assert.equal(after.canAutomaticallyRestore,false);
  console.log('PASS: read-only shadow recovery audit, corrupt history detection, no account leakage or restoration');
}
run().catch(e=>{console.error(e);process.exit(1);});
