'use strict';
/* RUN-129 regression: only synthetic backup data, no Firestore/Google I/O. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const codec=require('../backup-v3/firestore-source-codec.cjs');
const restore=require('../backup-v3/isolated-restore-proof.cjs');
const project=codec.PROJECT,uid='synthetic_offline_owner',snapshotId='test_roundtrip_129';
const readTime='2026-11-07T10:00:00Z';
const meta={project,uid,snapshotId,readTime};
const prefix='projects/'+project+'/databases/(default)/documents/sync_v3/'+uid+'/';
const event=(i,fields)=>({name:prefix+'events/E_'+i.repeat(32),fields});
const word=(i,fields)=>({name:prefix+'words/W_'+i.repeat(32),fields});
const state={...meta,
  baseline:{name:prefix+'state/baseline',fields:{v:{integerValue:'3'},
    checked:{stringValue:'Проверка / Hoiva / English'}}},
  events:[
    event('a',{type:{stringValue:'answer'},correct:{booleanValue:true}}),
    event('b',{safeUserText:{stringValue:'🌲'.repeat(11000)+' карелия / care'},
      spreadsheetFormulaAsText:{stringValue:'=IMPORTXML("https://invalid.example","//a")'}})],
  words:[word('c',{fi:{stringValue:'terve'},ru:{stringValue:'здоровый'},en:{stringValue:'healthy'}})]};
const clone=x=>JSON.parse(JSON.stringify(x));
function fixture(){const packed=codec.pack(state);return {...packed,expected:clone(meta),scope:restore.MARKER};}
test('full synthetic snapshot is reconstructed into a fresh isolated Map with content-accurate readback',()=>{
  const opts=fixture(),original=clone(opts);
  assert.ok(opts.manifest.rowCount>opts.manifest.documentCount,'large Unicode document is chunked');
  const status=restore.prove(opts);
  assert.equal(status.ok,true);
  assert.equal(status.verificationScope,'OFFLINE_SYNTHETIC_IN_MEMORY_ONLY');
  assert.equal(status.documentCount,4);
  assert.deepEqual(status.counts,{baseline:1,events:2,words:1});
  assert.equal(status.offlineCodecVerified,true);
  assert.equal(status.offlineInMemoryRestoreVerified,true);
  assert.equal(status.liveGoogleSheetsReadbackVerified,false);
  assert.equal(status.realFirestoreRestoreVerified,false);
  assert.equal(status.actualFirestoreRestoreDone,false);
  assert.equal(status.productionReady,false);
  assert.deepEqual(opts,original,'source must remain unchanged');
  assert.equal(typeof status.uid,'undefined','PII-free summary');
  assert.equal(typeof status.privateSheetId,'undefined','no private sheet ID');
});
test('nothing runs without explicit synthetic scope and exact TEST project/identity',()=>{
  const x=fixture();
  assert.throws(()=>restore.prove({...x,scope:'CLOUD_RESTORE'}),/SYNTHETIC_RESTORE_APPROVAL_REQUIRED/);
  assert.throws(()=>restore.prove({...x,expected:{...meta,project:'riveria-sanasto-community-test'}}),/SYNTHETIC_RESTORE_ONLY/);
  assert.throws(()=>restore.prove({...x,expected:{...meta,uid:'owner-real-uid'}}),/SYNTHETIC_RESTORE_ONLY/);
  assert.throws(()=>restore.prove({...x,expected:{...meta,uid:'synthetic_another'}}),/wrong owner/i);
  assert.throws(()=>restore.prove({...x,expected:{...meta,snapshotId:'test_wrong_snapshot'}}),/wrong owner/i);
});
test('forged and incomplete backups cannot be restored, even synthetically',()=>{
  const x=fixture();
  assert.throws(()=>restore.prove({...x,rows:x.rows.slice(0,-1)}),/Missing backup rows/);
  const corrupt=clone(x.rows);corrupt[1][5]=corrupt[1][5].replace('Проверка','Подмена');
  assert.throws(()=>restore.prove({...x,rows:corrupt}),/SHA-256 mismatch/);
  const duplicated=clone(x.rows);duplicated[duplicated.length-1]=clone(duplicated[1]);
  assert.throws(()=>restore.prove({...x,rows:duplicated}),/Missing|Duplicate|corrupt|Malformed|order/i);
  const wrong=clone(x.manifest);wrong.sha256='f'.repeat(64);
  assert.throws(()=>restore.prove({...x,manifest:wrong}),/SHA-256 mismatch/);
  const injected=clone(x.rows);
  const payload=JSON.stringify({name:prefix+'events/../../users/secret',fields:{}});
  injected[1][5]=payload;
  assert.throws(()=>restore.prove({...x,rows:injected}),/Unexpected|Missing|corrupt|SHA-256/i);
});
test('roundtrip supports an empty and valid explicit snapshot, but does not certify live backups',()=>{
  const x=codec.pack({...meta,events:[],words:[],baseline:null});
  const p=restore.prove({...x,expected:meta,scope:restore.MARKER});
  assert.equal(p.documentCount,0);
  assert.deepEqual(p.counts,{baseline:0,events:0,words:0});
  assert.equal(p.productionReady,false);
  assert.equal(p.realFirestoreRestoreVerified,false);
});
test('the runner has no API modules, network requests, external adapters or cloud writes',()=>{
  const source=fs.readFileSync(path.join(__dirname,'../backup-v3/isolated-restore-proof.cjs'),'utf8');
  for(const pattern of [
    /require\(['"]firebase/,/require\(['"]@google/,/require\(['"]googleapis/,
    /require\(['"]https?['"]\)/, /fetch\s*\(/,
    /firestore\s*\(\s*\)/, /writeBatch\s*\(/, /updateDoc\s*\(/, /deleteDoc\s*\(/,
    /execFileSync\s*\(/, /setCustomUserClaims\s*\(/
  ]) assert.equal(pattern.test(source),false,'Cloud API forbidden: '+pattern);
  assert.match(source,/new Map\(\)/);
  assert.match(source,/SYNTHETIC_RESTORE_ONLY/);
});
