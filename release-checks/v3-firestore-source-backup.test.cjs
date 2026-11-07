'use strict';
// RUN-040. Synthetic-only immutable Firestore source backup/restore dry-run.
// NO Google API, actual UID, tokens, external I/O or production access.
const assert=require('node:assert/strict');
const backup=require('../backup-v3/firestore-source-codec.cjs');
const PROJECT=backup.PROJECT,uid='synthetic_owner_only';
const snapshotId='test_snapshot_20261105';
const readTime='2026-11-05T10:00:00Z';
const BASE='projects/'+PROJECT+'/databases/(default)/documents/sync_v3/'+uid+'/';
const ev=(hex,fields)=>({name:BASE+'events/E_'+hex.repeat(32),fields});
const word=(hex,fields)=>({name:BASE+'words/W_'+hex.repeat(32),fields});
const meta={project:PROJECT,uid,snapshotId,readTime};
const baseline={name:BASE+'state/baseline',
  fields:{v:{integerValue:'3'},comment:{stringValue:'Проверка / Hoiva / English'}}};
const event1=ev('a',{uid:{stringValue:uid},kind:{stringValue:'answer'},
  comment:{stringValue:'=IMPORTXML("https://invalid.example","//a")'},
  answer:{mapValue:{fields:{correct:{booleanValue:true}}}}});
const event2=ev('b',{uid:{stringValue:uid},kind:{stringValue:'word_upsert'},
  userText:{stringValue:'🌲'.repeat(11000)+' карелия / Care'}}); // multi-chunk
const personal=word('c',{fi:{stringValue:'terve'},ru:{stringValue:'здоровый'},en:{stringValue:'healthy'}});
const source={...meta,baseline,events:[event2,event1],words:[personal]};
function copy(x){return JSON.parse(JSON.stringify(x));}
function mustFail(fn,pattern){assert.throws(fn,pattern);}
const packed=backup.pack(source);
assert.equal(packed.manifest.scope,backup.SCOPE);
assert.equal(packed.manifest.uid,uid);
assert.equal(packed.manifest.complete,false);
assert.equal(packed.manifest.liveSheetsVerified,false);
assert.equal(packed.manifest.restoreTested,false);
assert.equal(packed.manifest.writeMode,'NEW_PRIVATE_SHEET_RAW_ONLY');
assert.equal(packed.manifest.documentCount,4);
assert.deepEqual(packed.manifest.sections,{baseline:1,events:2,words:1});
assert.ok(packed.manifest.rowCount>packed.manifest.documentCount,'large event must be chunked');
assert.match(packed.manifest.sha256,/^[a-f0-9]{64}$/);
const restored=backup.verify(packed.rows,packed.manifest,meta);
assert.equal(restored.ok,true);
assert.equal(restored.offlineVerified,true);
assert.equal(restored.liveSheetsVerified,false);
assert.equal(restored.canAutomaticallyRestore,false);
assert.equal(restored.source.events.length,2);
assert.equal(restored.source.events[1].fields.userText.stringValue,event2.fields.userText.stringValue);
assert.equal(restored.source.events[0].fields.comment.stringValue,event1.fields.comment.stringValue);
assert.equal(packed.rows[0].length,6);
const shuffled=backup.pack({...source,events:[event1,event2]});
assert.equal(shuffled.manifest.sha256,packed.manifest.sha256,'input order cannot change hash');
mustFail(()=>backup.pack({...source,project:'riveria-sanasto-community-test'}),/Wrong backup project/);
mustFail(()=>backup.verify(packed.rows,packed.manifest,{...meta,uid:'another_user'}),/wrong owner/i);
mustFail(()=>backup.verify(packed.rows,packed.manifest,{...meta,snapshotId:'another_snapshot'}),/wrong owner/i);
mustFail(()=>backup.pack({...source,events:[event1,event1]}),/Duplicate Firestore document/);
mustFail(()=>backup.pack({...source,events:[{...event1,name:BASE+'events/../../credentials'}]}),/Unexpected Firestore source path/);
mustFail(()=>backup.pack({...source,words:[{...personal,name:BASE+'words/E_'+'c'.repeat(32)}]}),/Unexpected Firestore source path/);
mustFail(()=>backup.pack({...source,baseline:undefined,events:undefined}),/Incomplete personal Firestore source/);
mustFail(()=>backup.verify(packed.rows.slice(0,-1),packed.manifest,meta),/Missing backup rows/);
const damaged=copy(packed.rows);
damaged[1][5]=damaged[1][5].replace('Проверка','ПОДМЕНА');
mustFail(()=>backup.verify(damaged,packed.manifest,meta),/SHA-256 mismatch/);
const repeated=copy(packed.rows);
repeated[repeated.length-1]=copy(repeated[1]);
mustFail(()=>backup.verify(repeated,packed.manifest,meta),/Missing|Duplicate|corrupt|invalid|Malformed|order/i);
const wrongKind=copy(packed.rows);
wrongKind[1][1]='users';
mustFail(()=>backup.verify(wrongKind,packed.manifest,meta),/Malformed/);
const cutChunk=copy(packed.rows);
cutChunk[2][3]='99';
mustFail(()=>backup.verify(cutChunk,packed.manifest,meta),/Missing, reordered/);
const badHash=copy(packed.manifest);
badHash.sha256='0'.repeat(64);
mustFail(()=>backup.verify(packed.rows,badHash,meta),/SHA-256 mismatch/);
const baselineMissing=backup.pack({...source,baseline:null,events:[],words:[]});
assert.equal(baselineMissing.manifest.sections.baseline,0);
assert.equal(backup.verify(baselineMissing.rows,baselineMissing.manifest,meta).source.baseline,null);
assert.equal(backup.verify(baselineMissing.rows,baselineMissing.manifest,meta).source.events.length,0);
const attacks=copy(source);
attacks.events=[ev('d',JSON.parse('{"__proto__":{"stringValue":"unsafe"}}'))];
mustFail(()=>backup.pack(attacks),/Unsafe Firestore JSON key/);
console.log('PASS RUN-040: full Firestore event+baseline+word snapshot/chunks/Unicode/identity/tamper; no cloud backup or restore');
