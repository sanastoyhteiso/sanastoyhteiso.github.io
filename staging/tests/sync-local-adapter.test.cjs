/* Staging only: existing app per-UID localStorage read adapter, no real data. */
'use strict';
const assert=require('assert');
const Adapter=require('../rs-sync-local-adapter.js');
const Journal=require('../rs-sync-journal.js');
const Core=require('../rs-sync-core.js');
let active='alice',reads=0,writes=0,racing=false;
const prefix='rs_family_v1_alice__';
const raw={
  [prefix+'rs_scores_v1']:JSON.stringify({T00001:{seen:1,correct:1,wrong:0,learned:true}}),
  [prefix+'rs_user_words_v1']:JSON.stringify([{id:'L123',fi:'hoito',ru:'уход'}]),
  [prefix+'rs_favorites_v1']:JSON.stringify({T00001:true}),
  ['rs_family_v1_bob__rs_scores_v1']:JSON.stringify({SECRET:{seen:999}})
};
const storage={
  getItem:k=>{reads++;if(racing&&reads===4)raw[prefix+'rs_scores_v1']=JSON.stringify({T00001:{seen:2,correct:2,wrong:0}});return raw[k]===undefined?null:raw[k];},
  setItem:()=>{writes++;throw Error('No writes allowed');}
};
const listeners={};
function target(){
  return {hidden:false,
    addEventListener:(k,fn)=>{listeners[k]=fn;},
    removeEventListener:(k,fn)=>{if(listeners[k]===fn)delete listeners[k];}};
}
const win=target(),doc=target();
const adapter=Adapter.create({uid:'alice',activeUid:()=>active,
  storage,storageKey:k=>'rs_family_v1_'+active+'__'+k,
  windowTarget:win,documentTarget:doc});
function run(){
  let s=adapter.getSnapshot();
  assert.equal(s.scores.T00001.correct,1);
  assert.equal(s.words[0].fi,'hoito');
  assert.equal(s.favorites.T00001,true);
  assert.equal(writes,0);
  s.words[0].fi='tampered';
  assert.equal(adapter.getSnapshot().words[0].fi,'hoito','read result must not alias storage');
  assert.equal(Journal.snapshot(adapter.getSnapshot()).words.L123.ru,'уход');
  active='bob';assert.throws(()=>adapter.getSnapshot(),/Active account changed/);
  active='alice';
  raw[prefix+'rs_user_words_v1']='{broken json';
  assert.throws(()=>adapter.getSnapshot(),/Corrupt local JSON/);
  raw[prefix+'rs_user_words_v1']=JSON.stringify([{id:'L123',fi:'hoito',ru:'уход'},{id:'L123',fi:'koti',ru:'дом'}]);
  assert.throws(()=>adapter.getSnapshot(),/duplicate user word/);
  raw[prefix+'rs_user_words_v1']=JSON.stringify([{id:'L123',fi:'hoito',ru:'уход'}]);
  reads=0;racing=true;
  assert.throws(()=>adapter.getSnapshot(),/changed while reading/);
  racing=false;
  raw[prefix+'rs_scores_v1']=JSON.stringify({T00001:{seen:1,correct:1,wrong:0,learned:true}});
  let seen=0,unsub=adapter.subscribe('rs:datachange',()=>seen++);
  listeners['rs:datachange']();assert.equal(seen,1);
  unsub();assert.equal(listeners['rs:datachange'],undefined);
  let focus=0,unsubFocus=adapter.subscribe('visible',()=>focus++);
  doc.hidden=true;listeners.visibilitychange();assert.equal(focus,0);
  doc.hidden=false;listeners.visibilitychange();assert.equal(focus,1);
  unsubFocus();
  // Duplicate cryptographic event IDs must never overwrite an older queued event.
  const db={},atomic={getItem:k=>db[k]||null,setItem:(k,v)=>{db[k]=v;}};
  const j=Journal.create({core:Core,storage:atomic,uid:'alice',
    device:'D_'+'a'.repeat(32),newId:()=>('E_'+'f'.repeat(32)),
    legacySyncDisabled:()=>true,now:()=>110000});
  const baseline={scores:{T00001:{seen:1,correct:1,wrong:0}},words:[],favorites:{}};
  j.activate(baseline,'VERIFIED_BASELINE_AND_LEGACY_SYNC_DISABLED');
  j.capture({scores:{T00001:{seen:2,correct:2,wrong:0}},words:[],favorites:{}});
  assert.throws(()=>j.capture({scores:{T00001:{seen:3,correct:3,wrong:0}},
    words:[],favorites:{}}),/Duplicate generated ID/);
  assert.equal(j.status().pending,1);
  assert.equal(writes,0);
  console.log('PASS: per-account read-only adapter, corrupt JSON and cross-tab race rejection, event ID uniqueness');
}
run();
