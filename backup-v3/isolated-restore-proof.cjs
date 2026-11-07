'use strict';
/*
 * RUN-129. Pure offline/synthetic restore acceptance on raw Firestore REST
 * source documents. This file has no Cloud/Firestore/Sheets/network adapters
 * and cannot write to any database. An in-memory Map is a test store ONLY.
 * Never claim that any Google Sheet or real Firestore restore was verified.
 */
const crypto=require('node:crypto');
const codec=require('./firestore-source-codec.cjs');
const MARKER='OFFLINE_SYNTHETIC_IN_MEMORY_ONLY';
const OWNER=/^synthetic_[A-Za-z0-9_-]{3,64}$/;
const SNAPSHOT=/^test_[A-Za-z0-9_-]{4,64}$/;
function copy(v){return JSON.parse(JSON.stringify(v));}
function preflight(opts){
  if(!opts||typeof opts!=='object'||opts.scope!==MARKER||!opts.expected)
    throw Error('SYNTHETIC_RESTORE_APPROVAL_REQUIRED');
  const m=opts.expected;
  if(m.project!==codec.PROJECT||!OWNER.test(m.uid||'')||
     !SNAPSHOT.test(m.snapshotId||''))
    throw Error('SYNTHETIC_RESTORE_ONLY');
  codec.identity(m);
  if(!Array.isArray(opts.rows)||!opts.manifest)
    throw Error('SYNTHETIC_RESTORE_INPUT_MISSING');
}
function kindOf(name,uid){
  const prefix='projects/'+codec.PROJECT+'/databases/(default)/documents/sync_v3/'+uid+'/';
  if(name===prefix+'state/baseline')return 'baseline';
  if(new RegExp('^'+prefix+'events/E_[a-f0-9]{32}$').test(name))return 'event';
  if(new RegExp('^'+prefix+'words/W_[a-f0-9]{32}$').test(name))return 'word';
  throw Error('SYNTHETIC_RESTORE_PATH_INVALID');
}
function prove(opts){
  preflight(opts);
  const expected=opts.expected;
  // Verify ALL rows, owner, path, chunks, count and SHA before any Map action.
  const verified=codec.verify(opts.rows,opts.manifest,expected);
  if(verified.ok!==true||verified.offlineVerified!==true)
    throw Error('SYNTHETIC_RESTORE_SOURCE_UNVERIFIED');
  const original=verified.source;
  const restoredMap=new Map();
  const input=[];
  if(original.baseline)input.push(original.baseline);
  input.push(...original.events,...original.words);
  for(const doc of input){
    const kind=kindOf(doc.name,expected.uid);
    if(restoredMap.has(doc.name))throw Error('SYNTHETIC_RESTORE_DUPLICATE');
    restoredMap.set(doc.name,{kind,document:copy(doc)});
  }
  // Read back every document from the *fresh* isolated Map and repack.
  const seen=[...restoredMap.values()];
  const restored={...expected,
    baseline:(seen.find(x=>x.kind==='baseline')||{}).document||null,
    events:seen.filter(x=>x.kind==='event').map(x=>x.document),
    words:seen.filter(x=>x.kind==='word').map(x=>x.document)};
  const roundtrip=codec.pack(restored);
  if(roundtrip.manifest.sha256!==opts.manifest.sha256||
     roundtrip.manifest.documentCount!==opts.manifest.documentCount||
     roundtrip.manifest.rowCount!==opts.manifest.rowCount||
     JSON.stringify(roundtrip.manifest.sections)!==JSON.stringify(opts.manifest.sections))
    throw Error('SYNTHETIC_RESTORE_READBACK_MISMATCH');
  // Final codec validation of completely independent re-encoded rows.
  const reread=codec.verify(roundtrip.rows,roundtrip.manifest,expected);
  if(!reread.ok||reread.sha256!==opts.manifest.sha256)
    throw Error('SYNTHETIC_RESTORE_FINAL_VERIFICATION_FAILED');
  return Object.freeze({
    ok:true,
    verificationScope:MARKER,
    documentCount:seen.length,
    counts:Object.freeze(copy(reread.counts)),
    contentSha256:crypto.createHash('sha256').update(opts.manifest.sha256,'utf8').digest('hex'),
    offlineCodecVerified:true,
    offlineInMemoryRestoreVerified:true,
    liveGoogleSheetsReadbackVerified:false,
    realFirestoreRestoreVerified:false,
    actualFirestoreRestoreDone:false,
    productionReady:false
  });
}
module.exports={prove,MARKER};
