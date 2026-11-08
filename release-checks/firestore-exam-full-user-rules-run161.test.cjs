'use strict';
/* RUN161 full rules regression: exact user-provided live rules + ONLY private mock-exam match.
 * Works with emulated test-only Firebase; never touches production.
 */
const fs=require('node:fs'),assert=require('node:assert/strict');
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,collection,getDoc,getDocs,setDoc,updateDoc,deleteDoc}=require('firebase/firestore');
const original=fs.readFileSync('release-checks/firestore-user-supplied-run161-original.rules','utf8');
const candidate=fs.readFileSync('release-checks/firestore-user-supplied-run161-candidate.rules','utf8');
const path=ctx=>(name,id)=>doc(ctx.firestore(),name,id);
async function run(){
 const pos=candidate.indexOf('    match /mock_exam_progress_v1/{uid} {');
 const end=candidate.indexOf('\n    match /{document=**}',pos);
 assert.ok(pos>0&&end>pos,'expected private exam block before deny-all');
 const restored=candidate.slice(0,pos)+candidate.slice(end+1);
 assert.equal(restored,original,'all user-supplied original rules must remain byte-for-byte');
 assert.equal((candidate.match(/match \/mock_exam_progress_v1\/\{uid\}/g)||[]).length,1);
 const env=await initializeTestEnvironment({projectId:'demo-sanastoyhteiso-production',
  firestore:{host:'127.0.0.1',port:8080,rules:candidate}});
 try{
  const alice=env.authenticatedContext('alice',{email_verified:true});
  const bob=env.authenticatedContext('bob',{email_verified:true});
  const anon=env.unauthenticatedContext();
  const notVerified=env.authenticatedContext('alice',{email_verified:false});
  const admin=env.authenticatedContext('admin',{email_verified:true,admin:true,
    firebase:{sign_in_provider:'google.com'}});
  const own=doc(alice.firestore(),'mock_exam_progress_v1','alice');
  const record={schema:1,ownerUid:'alice',attemptId:'A_abc123_def456',
    updatedAt:1794000000000,answersCount:14,position:14,
    snapshot:JSON.stringify({schema:1,choice:'fi-ru',run:{answers:Array(14).fill({score:1}),index:14}})};
  await assertSucceeds(setDoc(own,record));
  assert.equal((await assertSucceeds(getDoc(own))).data().answersCount,14);
  await assertSucceeds(updateDoc(own,{position:15,updatedAt:1794000000001}));
  await assertFails(getDoc(doc(bob.firestore(),'mock_exam_progress_v1','alice')));
  await assertFails(getDoc(doc(anon.firestore(),'mock_exam_progress_v1','alice')));
  await assertFails(getDoc(doc(notVerified.firestore(),'mock_exam_progress_v1','alice')));
  await assertFails(setDoc(doc(notVerified.firestore(),'mock_exam_progress_v1','alice'),record));
  await assertFails(setDoc(doc(bob.firestore(),'mock_exam_progress_v1','alice'),record));
  await assertFails(getDocs(collection(alice.firestore(),'mock_exam_progress_v1')));
  await assertFails(deleteDoc(own));
  for(const [field,value] of [['ownerUid','bob'],['schema',2],['attemptId','bad id'],
   ['position',41],['answersCount',-1],['snapshot','x'.repeat(300001)]]){
    await assertFails(setDoc(own,Object.assign({},record,{[field]:value})));
  }
  await assertFails(setDoc(own,Object.assign({},record,{newField:1})));

  // Regression: existing public/private profile behavior unchanged from supplied rules.
  const profile={alias:'Alice Study',publicStats:false,learned:14,updatedAt:1794000000000};
  await assertSucceeds(setDoc(doc(alice.firestore(),'users','alice'),profile));
  await assertSucceeds(getDoc(doc(alice.firestore(),'users','alice')));
  await assertFails(getDoc(doc(bob.firestore(),'users','alice')));
  await assertFails(setDoc(doc(bob.firestore(),'users','alice'),profile));
  await assertSucceeds(updateDoc(doc(alice.firestore(),'users','alice'),{publicStats:true}));
  await assertSucceeds(getDoc(doc(bob.firestore(),'users','alice')));

  // Existing user settings preserve exact UID restrictions.
  await assertSucceeds(setDoc(doc(alice.firestore(),'settings','alice'),
   {scope:'all',subscriptions:'[]',updatedAt:1794000000000}));
  await assertFails(getDoc(doc(bob.firestore(),'settings','alice')));
  await assertFails(setDoc(doc(bob.firestore(),'settings','alice'),
   {scope:'all',subscriptions:'[]',updatedAt:1794000000000}));

  // Existing append-only V3 events remain unchanged.
  const eventId='E_'+'2'.repeat(32);
  const event={v:3,uid:'alice',id:eventId,device:'D_'+'b'.repeat(32),
    kind:'answer',target:'T00001',time:1794000000000,data:{correct:true}};
  const evDoc=doc(alice.firestore(),'sync_v3','alice','events',eventId);
  await assertSucceeds(setDoc(evDoc,event));
  await assertSucceeds(getDoc(evDoc));
  await assertFails(updateDoc(evDoc,{time:1794000000001}));
  await assertFails(deleteDoc(evDoc));
  await assertFails(setDoc(doc(bob.firestore(),'sync_v3','alice','events','E_'+'3'.repeat(32)),
    Object.assign({},event,{id:'E_'+'3'.repeat(32)})));

  // Existing read-only admin metrics stay protected.
  await assertSucceeds(getDoc(doc(admin.firestore(),'admin_metrics','current')));
  await assertFails(getDoc(doc(alice.firestore(),'admin_metrics','current')));
  await assertFails(setDoc(doc(admin.firestore(),'admin_metrics','current'),{value:1}));
  await assertFails(setDoc(doc(anon.firestore(),'mock_exam_progress_v1','alice'),record));
  console.log('PASS RUN161: full user-supplied rules + private exam path, original byte-for-byte preserved');
 }finally{await env.cleanup();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
