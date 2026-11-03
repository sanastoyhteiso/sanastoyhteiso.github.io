/* Mock tests: verified baseline, paginated remote events, two-device merge.
 * No production Firestore, no user data, no network.
 */
'use strict';
const assert=require('assert');
const crypto=require('crypto').webcrypto;
const C=require('../rs-sync-core.js');
const T=require('../rs-firestore-transport.js');
const S=require('../rs-sha256.js');
const R=require('../rs-sync-cloud-read.js');
const uid='alice',device1='D_'+'a'.repeat(32),device2='D_'+'b'.repeat(32);
const eid=n=>'E_'+n.toString(16).padStart(32,'0');
const scores={},words={},favorites={};
for(let i=0;i<236;i++){
  const k='T'+String(i+1).padStart(5,'0');
  scores[k]={correct:i<138?1:0,wrong:1,seen:i<138?2:1,learned:i<138};
  if(i<70)favorites[k]=true;
}
for(let i=0;i<150;i++){
  const k='custom-word-'+i;
  words[k]={id:k,fi:'Sana '+i,ru:'слово '+i};
}
const baseline={scores,words,favorites};
const wrapEvent=e=>Object.assign({name:'projects/demo/databases/(default)/documents/sync_v3/alice/events/'+e.id},T.record(uid,e));
const events=[];
for(let n=1;n<=101;n++)events.push(C.event(eid(n),n%2?device1:device2,
  'answer','T00001',{correct:n%2===0},1793650000000+n));
const pending=C.event(eid(102),device2,'answer','T00001',{correct:true},1793650000200);
async function run(){
  const sha=await S.digest(baseline,crypto);
  const doc=T.baselineDocument(uid,{migrationId:'M_test',createdAt:1793650000000,sha256:sha,snapshot:baseline});
  assert.equal(Object.keys(doc.fields.snapshot.mapValue.fields.scores.mapValue.fields).length,236);
  assert.equal(Object.keys(doc.fields.snapshot.mapValue.fields.words.mapValue.fields).length,150);
  let active=uid,requests=[],mode='normal',token='test-token';
  const adapter=async(method,url,body,authorization)=>{
    assert.equal(method,'GET');assert.equal(body,null);assert.equal(authorization,token);
    assert.equal(active,uid);
    requests.push(url);
    if(url.indexOf('/state/baseline')>-1){
      if(mode==='noBaseline')return{status:404};
      return{status:200,body:mode==='badHash'?{
        fields:Object.assign({},doc.fields,{sha256:{stringValue:'0'.repeat(64)}})
      }:doc};
    }
    assert.ok(url.indexOf('/events?pageSize=100')>-1);
    if(mode==='network')throw Error('Offline');
    if(url.indexOf('pageToken=next')>-1){
      if(mode==='switchUser')active='bob';
      return{status:200,body:{documents:events.slice(100).map(wrapEvent)}};
    }
    return{status:200,body:{documents:events.slice(0,100).map(wrapEvent),nextPageToken:'next'}};
  };
  const t=T.create({projectId:'demo-project',getToken:async()=>token,activeUid:()=>active,request:adapter});
  const reader=R.create({transport:t,decodeDocument:T.decodeDocument,core:C,
    activeUid:()=>active,verifyHash:s=>S.digest(s,crypto)});
  let result=await reader.load(uid,[pending]);
  assert.equal(result.ok,true);assert.equal(result.readyToApply,false);
  assert.equal(result.cloudEvents,101);assert.equal(result.localPending,1);
  assert.equal(result.uniqueEvents,102);assert.equal(result.state.scores.T00001.seen,104);
  assert.equal(result.state.scores.T00001.correct,53);
  assert.equal(result.state.scores.T00001.wrong,51);
  assert.equal(Object.keys(result.state.scores).length,236);
  assert.equal(Object.keys(result.state.words).length,150);
  assert.equal(Object.keys(result.state.favorites).length,70);
  assert.equal(requests.filter(x=>x.indexOf('/events?')>-1).length,2);
  result=await reader.load(uid,[events[0]]);
  assert.equal(result.uniqueEvents,101); // same event from local queue not double-counted
  assert.equal(result.state.scores.T00001.seen,103);
  await assert.rejects(()=>reader.load(uid,[{...events[0],data:{correct:!events[0].data.correct}}]),/conflicting/);
  mode='noBaseline';await assert.rejects(()=>reader.load(uid),/baseline is missing/);
  mode='badHash';await assert.rejects(()=>reader.load(uid),/checksum mismatch/);
  mode='normal';await assert.rejects(()=>reader.load('bob'),/Account changed/);
  mode='switchUser';await assert.rejects(()=>reader.load(uid),/Account changed/);active=uid;
  mode='network';await assert.rejects(()=>reader.load(uid),/Offline/);
  console.log('PASS: 236 baseline scores, 150 user words, 101 paginated events, second-device reconciliation');
}
run().catch(e=>{console.error(e);process.exit(1);});
