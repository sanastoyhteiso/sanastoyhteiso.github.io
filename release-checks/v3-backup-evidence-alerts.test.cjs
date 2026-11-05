'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const codec=require('../backup-v3/firestore-source-codec.cjs');
const {inspect,MAX_TEST_DOCS,MAX_TEST_SHEET_ROWS}=require('../backup-v3/backup-evidence-gate.cjs');
const alert=require('../backup-v3/backup-alert-dedup.cjs');
const PROJECT=codec.PROJECT;
const cfg={project:PROJECT,uid:'synthetic_owner_12',snapshotId:'synthetic_snapshot_12',
  readTime:'2026-11-05T09:00:00Z',sheetId:'PRIVATE_SHEET_01234567890'};
const nowUtc='2026-11-05T11:00:00Z';
const base='projects/'+PROJECT+'/databases/(default)/documents/sync_v3/'+cfg.uid+'/';
const source={...cfg,baseline:{name:base+'state/baseline',fields:{text:{stringValue:'terve / здоровье'}}},
  events:[{name:base+'events/E_'+'a'.repeat(32),fields:{answer:{stringValue:'=IMPORTXML("secret")'}}}],
  words:[{name:base+'words/W_'+'b'.repeat(32),fields:{word:{stringValue:'arkaluontoinen'}}}]};
const packed=codec.pack(source);
const goodManifest={...packed.manifest,complete:true,liveSheetsVerified:true,
  copiedTo:'PRIVATE_NEW_TEST_SHEET'};
function copy(o){return JSON.parse(JSON.stringify(o));}
function sandbox(modify={}){
  const state={calls:[],file:{id:cfg.sheetId,mimeType:'application/vnd.google-apps.spreadsheet',
    createdTime:'2026-11-05T09:00:00Z'},permissions:[{type:'user',role:'owner'}],
    manifest:copy(goodManifest),rows:copy(packed.rows),
    attempt:{snapshotId:cfg.snapshotId,outcome:'SUCCESS',finishedAt:'2026-11-05T09:01:00Z'},
    error:null};
  Object.assign(state,modify);
  const provider={
    async getFileMetadata(id){state.calls.push('metadata');if(state.error)throw state.error;return state.file;},
    async getPermissions(id){state.calls.push('permissions');return state.permissions;},
    async readManifest(id){state.calls.push('manifest');return state.manifest;},
    async readRows(id,count){state.calls.push('rows');assert.equal(count,packed.rows.length);return state.rows;},
    async readAttempt(id){state.calls.push('attempt');return state.attempt;}
  };
  return {state,provider};
}
async function inspectWith(x,config=cfg){return inspect({config,provider:x.provider,nowUtc});}
test('read-only TEST mock provider passes full codec SHA, owner-only, attempt proof',async()=>{
  const x=sandbox();const y=await inspectWith(x);
  assert.equal(y.verified,true);assert.equal(y.backupStatus,'OK');
  assert.equal(y.restoreStatus,'NO_DATA');assert.equal(y.operationallyProven,false);
  assert.deepEqual(x.state.calls,['metadata','permissions','manifest','rows','attempt']);
});
test('wrong source project stops before any provider call',async()=>{
  const x=sandbox();const y=await inspectWith(x,{...cfg,project:'riveria-sanasto-community-test'});
  assert.equal(y.verified,false);assert.equal(y.reasonCode,'INVALID_PRIVATE_CONFIG');
  assert.equal(x.state.calls.length,0);
});
test('missing provider and broken configuration cannot claim verified',async()=>{
  const x=sandbox();const y=await inspect({config:cfg,provider:null,nowUtc});
  assert.equal(y.backupStatus,'NO_DATA');
  assert.equal((await inspectWith(x,{...cfg,sheetId:'x'})).verified,false);
  assert.equal(x.state.calls.length,0);
});
test('nonspreadsheet or mismatched metadata fails before reading data',async()=>{
  for(const file of [{...sandbox().state.file,id:'wrong_identifier'},
    {...sandbox().state.file,mimeType:'text/plain'}]){
    const x=sandbox({file});const y=await inspectWith(x);
    assert.equal(y.reasonCode,'INVALID_PROVIDER_FILE_METADATA');
    assert.equal(x.state.calls.includes('rows'),false);
  }
});
test('public, domain, unknown or multiple permissions fail-closed',async()=>{
  for(const p of [[{type:'anyone',role:'reader'}],[{type:'domain',role:'reader'}],
    [{type:'user',role:'owner'},{type:'user',role:'reader'}],[]]){
    const x=sandbox({permissions:p});const y=await inspectWith(x);
    assert.equal(y.reasonCode,'PRIVATE_PERMISSION_UNVERIFIED');
    assert.equal(x.state.calls.includes('manifest'),false);
  }
});
test('manifest lacks provider verification or belongs to wrong owner',async()=>{
  for(const changes of [{complete:false},{liveSheetsVerified:false},
    {uid:'some_other_user'},{snapshotId:'other_snapshot'},
    {writeMode:'OVERWRITE_EXISTING'},{copiedTo:'PUBLIC_SHEET'},
    {documentCount:MAX_TEST_DOCS+1},{rowCount:MAX_TEST_SHEET_ROWS}]){
    const x=sandbox({manifest:{...goodManifest,...changes}});
    assert.equal((await inspectWith(x)).reasonCode,'PRIVATE_MANIFEST_INVALID');
    assert.equal(x.state.calls.includes('rows'),false);
  }
});
test('partial provider readback is never OK',async()=>{
  const x=sandbox({rows:copy(packed.rows).slice(0,-1)});
  assert.equal((await inspectWith(x)).reasonCode,'PRIVATE_ROWS_INTEGRITY_FAILED');
});
test('tampered personal word, but same manifest hash, is rejected',async()=>{
  const rows=copy(packed.rows);rows[rows.length-1][5]=rows[rows.length-1][5].replace('arkaluontoinen','wrong personal');
  const x=sandbox({rows});
  assert.equal((await inspectWith(x)).reasonCode,'PRIVATE_ROWS_INTEGRITY_FAILED');
});
test('invalid manifest SHA and wrong readTime are rejected',async()=>{
  for(const changes of [{sha256:'0'.repeat(64)},{readTime:'2026-11-04T09:00:00Z'}]){
    const x=sandbox({manifest:{...goodManifest,...changes}});
    assert.equal((await inspectWith(x)).verified,false);
  }
});
test('no trusted completed attempt never produces OK',async()=>{
  const x=sandbox({attempt:null});const y=await inspectWith(x);
  assert.equal(y.reasonCode,'ATTEMPT_EVIDENCE_MISSING');
  assert.equal(y.backupStatus,'NO_DATA');
});
test('403 and 500 are sanitized and no provider response body leaks',async()=>{
  for(const [status,expected] of [[403,'PROVIDER_ACCESS_DENIED'],[500,'PROVIDER_READ_FAILED']]){
    const x=sandbox({error:{httpStatus:status,message:'private@example.com private uid token'}});
    const y=await inspectWith(x);assert.equal(y.reasonCode,expected);
    assert.equal(JSON.stringify(y).includes('private@example.com'),false);
  }
});
test('no private UID/file IDs/words/hash or error payload in public output',async()=>{
  const x=sandbox();const y=await inspectWith(x);
  const t=JSON.stringify(y);
  for(const s of [cfg.uid,cfg.sheetId,'terve','arkaluontoinen',goodManifest.sha256])
    assert.equal(t.includes(s),false);
});
test('health evaluator prevents stale backup appearing OK after readback',async()=>{
  const x=sandbox();const y=await inspect({config:cfg,provider:x.provider,
    nowUtc:'2026-11-07T20:00:00Z'});
  assert.equal(y.verified,false);assert.equal(y.backupStatus,'PROBLEM');
  assert.equal(y.reasonCode,'BACKUP_STALE');
});
function problem(codes=['BACKUP_STALE']){
  return {project:PROJECT,backupStatus:'PROBLEM',restoreStatus:'NO_DATA',
    alertCodes:codes};
}
function healthy(){return {project:PROJECT,backupStatus:'OK',restoreStatus:'NO_DATA',
  alertCodes:[]};}
test('first real problem proposes an alert without delivering it',()=>{
  const p=alert.plan({health:problem(),previous:null,nowUtc});
  assert.equal(p.action,'SEND');assert.equal(p.kind,'PROBLEM');
  assert.equal(p.deliveryPerformed,false);assert.equal(p.productionReady,false);
});
test('delivery must be acknowledged before dedup state advances',()=>{
  const p=alert.plan({health:problem(),previous:null,nowUtc});
  assert.equal(alert.acknowledge(p,null,nowUtc,false).acknowledged,false);
  const ack=alert.acknowledge(p,null,nowUtc,true);
  assert.equal(ack.acknowledged,true);
  const later=alert.plan({health:problem(),previous:ack.state,
    nowUtc:'2026-11-05T12:00:00Z'});
  assert.equal(later.action,'SUPPRESS');
  assert.equal(later.reasonCode,'DUPLICATE_ALERT');
});
test('unknown health never clears problem or creates recovery',()=>{
  const p=alert.plan({health:problem(),previous:null,nowUtc});
  const ack=alert.acknowledge(p,null,nowUtc,true);
  const q=alert.plan({health:{project:PROJECT,backupStatus:'NO_DATA',
    restoreStatus:'NO_DATA',alertCodes:[]},previous:ack.state,
    nowUtc:'2026-11-05T12:00:00Z'});
  assert.equal(q.action,'NONE');
  assert.equal(q.reasonCode,'NOT_CONFIRMED_RECOVERY');
});
test('new trusted problem reason bypasses suppression',()=>{
  const p=alert.plan({health:problem(),previous:null,nowUtc});
  const ack=alert.acknowledge(p,null,nowUtc,true);
  const q=alert.plan({health:problem(['LATEST_ATTEMPT_FAILED']),previous:ack.state,
    nowUtc:'2026-11-05T12:00:00Z'});
  assert.equal(q.action,'SEND');
  assert.notEqual(q.idempotencyKey,p.idempotencyKey);
});
test('the same problem may re-alert after the 24 hour interval',()=>{
  const p=alert.plan({health:problem(),previous:null,nowUtc});
  const ack=alert.acknowledge(p,null,nowUtc,true);
  assert.equal(alert.plan({health:problem(),previous:ack.state,
    nowUtc:'2026-11-06T11:00:00Z'}).action,'SEND');
});
test('recovery only after verified healthy status and previous open problem',()=>{
  const p=alert.plan({health:problem(),previous:null,nowUtc});
  const ack=alert.acknowledge(p,null,nowUtc,true);
  const recovered=alert.plan({health:healthy(),previous:ack.state,
    nowUtc:'2026-11-05T12:00:00Z'});
  assert.equal(recovered.kind,'RECOVERY');
  const ackRecover=alert.acknowledge(recovered,ack.state,'2026-11-05T12:00:00Z',true);
  assert.equal(ackRecover.state.incidentOpen,false);
  assert.equal(alert.plan({health:healthy(),previous:ackRecover.state,
    nowUtc:'2026-11-05T13:00:00Z'}).action,'NONE');
});
test('unknown/unapproved alert codes and wrong project do not generate payload',()=>{
  const attacker=alert.plan({health:problem(['UID_PRIVATE_ACCOUNT_EMAIL']),previous:null,nowUtc});
  assert.equal(attacker.action,'NONE');
  assert.equal(JSON.stringify(attacker).includes('PRIVATE_ACCOUNT'),false);
  const wrong=alert.plan({health:{...problem(),project:'riveria-sanasto-community-test'},
    previous:null,nowUtc});
  assert.equal(wrong.action,'NONE');
});
