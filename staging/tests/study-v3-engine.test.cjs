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
    assert.equal(owner,uid);assert.equal(limit,500);
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
 await b.record('favorite_set','T00003',true);
 await b.record('learned_set','T00002',true);
 await b.upload();
 await a.refresh();
 state=await a.view();
 assert.equal(state.state.favorites.T00003,true);
 assert.equal(state.state.scores.T00002.learned,true);
 assert.equal(state.state.scores.T00001.correct,1,'cross-device refresh no double count');
 // With one old event missing, monotonic shadow protection rejects cloud replacement.
 forgedMissing=true;
 await assert.rejects(()=>a.refresh(),/would lose local answer counters/);
 assert.equal((await a.view()).state.scores.T00001.correct,1);
 forgedMissing=false;
 await a.refresh();
 assert.equal((await a.view()).state.scores.T00001.correct,1);
 // Repeat account opening must not reset previously stored scores.
 assert.equal((await b.start()).state.scores.T00001.correct,1);
 active='intruder';
 await assert.rejects(()=>a.record('answer','T00004',true),/account changed/);
 await assert.rejects(()=>b.refresh(),/account changed/);
 active=uid;
 assert.throws(()=>a.makeEvent('answer','PRIVATE_WORD',true,1),/target/);
 assert.throws(()=>engine.create({stagingOnly:false}),/dependencies/);
 console.log('PASS: isolated real-term V3, two devices, offline durable queue, exact cloud ID, learned/favorite, loss gate and account isolation');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
