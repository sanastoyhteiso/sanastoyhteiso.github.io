/* V3 real-term fresh-start engine: two simulated devices + server; no internet.
 * All IDs, users and answers here are synthetic; original live data untouched.
 */
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),acorn=require('acorn');
const {IDBFactory}=require('fake-indexeddb');
const engine=require('../auth-pilot/study-v3-engine.js');
const core=require('../rs-sync-core.js');
const shadowMod=require('../rs-sync-shadow-idb.js');
acorn.parse(fs.readFileSync(path.join(__dirname,'../auth-pilot/study-v3-engine.js'),'utf8'),{ecmaVersion:5});
const uid='test_owner',events={},random=n=>n.toString(16).padStart(32,'0');
let nextId=0,connected=true,forgedMissing=false;
function remote(){
 return {
  list:async(owner,limit)=>{
    assert.equal(owner,uid);assert.equal(limit,10000);
    if(!connected)throw Error('offline');
    const xs=Object.values(events);
    return forgedMissing?xs.filter(x=>x.target!=='T00001'):xs;
  },
  put:async(owner,e)=>{
    assert.equal(owner,uid);
    if(!connected)throw Error('offline');
    assert.equal(e.v,3);assert.equal(e.uid,uid);
    if(events[e.id]&&JSON.stringify(events[e.id])!==JSON.stringify(e))
      throw Error('Cloud id collision');
    events[e.id]=e;
  }
 };
}
let active=uid;
function build(idb,device){
 const shadow=shadowMod.create({
  indexedDB:idb,core:core,activeUid:()=>active,
  enableStagingWrites:true,now:()=>1793800000000
 });
 return engine.create({stagingOnly:true,uid,core,shadow,remote:remote(),
  activeUid:()=>active,online:()=>connected,device:'D_'+device.repeat(32),now:()=>1793800000000+(++nextId),
  random:()=>random(nextId)});
}
async function run(){
 const iA=new IDBFactory(),iB=new IDBFactory();
 const a=build(iA,'a'),b=build(iB,'b');
 const first=await a.start();assert.equal(first.state.scores.T00001,undefined);
 await a.record('answer','T00001',true);
 let state=await a.view();
 assert.equal(state.pending.length,1);assert.equal(state.state.scores.T00001.correct,1);
 // Offline: answer exists atomically in IndexedDB, not in cloud.
 connected=false;
 await a.record('answer','T00002',false);
 assert.equal((await a.view()).pending.length,2);
 // Relaunching the same verified device offline reads the same IndexedDB.
 const relaunched=build(iA,'a');
 const reopened=await relaunched.start();
 assert.equal(reopened.state.scores.T00002.wrong,1);
 assert.equal(reopened.pending.length,2);
 await assert.rejects(()=>build(new IDBFactory(),'c').start(),/First study start requires online/);
 await assert.rejects(()=>a.upload(),/offline/);
 assert.equal((await a.view()).pending.length,2);
 connected=true;
 await a.upload();
 assert.equal((await a.view()).pending.length,0);
 assert.equal(Object.keys(events).length,2);
 const bReady=await b.start();
 assert.equal(bReady.state.scores.T00001.correct,1);
 assert.equal(bReady.state.scores.T00002.wrong,1);
 // Owner-only personal term: must be durable locally, synchronized across
 // devices, and usable as an answer target without any legacy Google Drive.
 const wordId='W_'+'9'.repeat(32);
 await b.record('word_upsert',wordId,{fi:'testihoiva',ru:'тестовый уход',en:'test care'});
 assert.equal((await b.view()).state.words[wordId].fi,'testihoiva');
 await b.record('collection_set','T00001',
   {list:'finds',added:true,topic:'practice',note:'Heard during a shift'});
 assert.equal((await b.view()).state.finds.T00001.added,true);
 await b.record('favorite_set','T00003',true);
 await b.record('learned_set','T00002',true);
 await b.upload();
 await a.refresh();
 state=await a.view();
 assert.equal(state.state.words[wordId].ru,'тестовый уход');
 assert.equal(state.state.finds.T00001.topic,'practice');
 assert.equal(state.state.finds.T00001.note,'Heard during a shift');
 assert.equal(state.state.favorites.T00003,true);
 // Repeating a personal word from another device never creates a new card.
 await a.record('word_upsert',wordId,{fi:'testihoiva',ru:'тестовый уход',en:'test care'});
 assert.equal(Object.keys((await a.view()).state.words).length,1);
 await assert.rejects(
   ()=>a.record('word_upsert',wordId,{fi:'testihoiva',ru:'другой перевод',en:'test care'}),
   /Conflicting definitions/);
 assert.equal((await a.view()).state.words[wordId].ru,'тестовый уход');
 await a.record('answer',wordId,true);
 await a.upload();
 await b.refresh();
 assert.equal((await b.view()).state.scores[wordId].correct,1);
 // An unselect event keeps a tombstone for cloud completeness checks.
 await a.record('collection_set','T00001',
   {list:'finds',added:false,topic:'practice',note:''});
 await a.upload();await b.refresh();
 assert.equal((await b.view()).state.finds.T00001.added,false);
 assert.equal(engine.isWord(wordId),true);
 assert.equal(engine.isWord('T00001'),false);
 assert.throws(()=>a.makeEvent('collection_set','T00001',
   {list:'finds',added:true,topic:'private',note:''},1),/Invalid/);
 assert.throws(()=>a.makeEvent('collection_set','T00001',
   {list:'finds',added:true,topic:'study',note:'x'.repeat(351)},1),/Invalid/);
 assert.throws(()=>a.makeEvent('word_upsert',wordId,{fi:'',ru:'нет'},1),/Invalid/);
 assert.throws(()=>a.makeEvent('word_upsert','W_bad',{fi:'test',ru:'test'},1),/target/);
 assert.equal(state.state.scores.T00002.learned,true);
 assert.equal(state.state.scores.T00001.correct,1,'cross-device refresh no double count');
 // With one old event missing, monotonic shadow protection rejects cloud replacement.
 forgedMissing=true;
 await assert.rejects(()=>a.refresh(),/would lose local answer counters/);
 assert.equal((await a.view()).state.scores.T00001.correct,1);
 forgedMissing=false;
 await a.refresh();
 assert.equal((await a.view()).state.scores.T00001.correct,1);
 // Large history regression: >500 immutable real-term answer events must
 // be reconstructed without discarding the original history.
 for(let i=0;i<610;i++){
   const id='E_'+(100+i).toString(16).padStart(32,'0');
   events[id]={v:3,uid,id,device:'D_'+'a'.repeat(32),
     kind:'answer',target:'T00005',time:1793900000000+i,
     data:{correct:true}};
 }
 const highVolume=await b.refresh();
 assert.equal(highVolume.state.scores.T00005.seen,610,
  'History after 500 answers must be intact');
 assert.equal(highVolume.state.scores.T00001.correct,1);
 // Repeat account opening must not reset previously stored scores.
 assert.equal((await b.start()).state.scores.T00001.correct,1);
 active='intruder';
 await assert.rejects(()=>a.record('answer','T00004',true),/account changed/);
 await assert.rejects(()=>b.refresh(),/account changed/);
 active=uid;
 assert.throws(()=>a.makeEvent('answer','PRIVATE_WORD',true,1),/target/);
 assert.throws(()=>engine.create({stagingOnly:false}),/dependencies/);
 const event=a.makeEvent('answer','T00009',false,1793900000000);
 assert.deepEqual(event.data,{correct:false,reviewLearned:true},
   'Needs review must clear learned status, not only count a wrong answer');
 assert.equal(engine.sameEvent(
   {...event,data:{reviewLearned:true,correct:false}},event),true,
   'Field reordering in Firestore does not create a false event collision');
 assert.equal(engine.sameEvent(
   {...event,data:{reviewLearned:false,correct:false}},event),false);
 console.log('PASS: isolated real-term V3, two devices, offline durable queue, exact cloud ID, learned/favorite, loss gate and account isolation');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
