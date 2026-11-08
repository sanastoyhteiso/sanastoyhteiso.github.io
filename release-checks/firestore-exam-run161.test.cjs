'use strict';
/* RUN161: isolated emulator contracts for owner-only exam document.
 * Synthetic project demo-sanastoyhteiso-production. No real Firebase credentials.
 * This is NOT evidence of real deployed production rules.
 */
const fs=require('node:fs'),assert=require('node:assert/strict');
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,collection,getDoc,getDocs,setDoc,updateDoc,deleteDoc}=require('firebase/firestore');
async function test(){
 const base=fs.readFileSync('release-checks/firestore-v3-prod-emulator.rules','utf8');
 const extra=fs.readFileSync('release-checks/firestore-exam-sync-run161-review-only.rules.txt','utf8');
 const needle=' match /{document=**} { allow read, write: if false; }';
 assert.ok(base.includes(needle));
 // This synthetic fixture adds only the new path before deny-all, preserving old V3 contract.
 const rules=base.replace(needle,()=>extra+'\n'+needle);
 const env=await initializeTestEnvironment({projectId:'demo-sanastoyhteiso-production',
  firestore:{host:'127.0.0.1',port:8080,rules}});
 try{
  const alice=env.authenticatedContext('alice',{email_verified:true});
  const bob=env.authenticatedContext('bob',{email_verified:true});
  const notVerified=env.authenticatedContext('alice',{email_verified:false});
  const anon=env.unauthenticatedContext();
  const path=(ctx,uid)=>doc(ctx.firestore(),'mock_exam_progress_v1',uid);
  const own=path(alice,'alice'),str=JSON.stringify({schema:1,choice:'fi-ru',run:{index:14}});
  const record={schema:1,ownerUid:'alice',attemptId:'A_123abc_789def',
   updatedAt:1794000000000,answersCount:14,position:14,snapshot:str};
  await assertSucceeds(setDoc(own,record));
  const docRead=await assertSucceeds(getDoc(own));
  assert.equal(docRead.data().answersCount,14);
  await assertSucceeds(updateDoc(own,{answersCount:15,position:15,updatedAt:1794000000001}));
  await assertFails(getDoc(path(bob,'alice')));
  await assertFails(setDoc(path(bob,'alice'),record));
  await assertFails(getDoc(path(notVerified,'alice')));
  await assertFails(setDoc(path(notVerified,'alice'),record));
  await assertFails(getDoc(path(anon,'alice')));
  await assertFails(setDoc(path(anon,'alice'),record));
  await assertFails(getDocs(collection(alice.firestore(),'mock_exam_progress_v1')));
  await assertFails(deleteDoc(own));
  await assertFails(setDoc(own,Object.assign({},record,{ownerUid:'bob'})));
  await assertFails(setDoc(own,Object.assign({},record,{schema:2})));
  await assertFails(setDoc(own,Object.assign({},record,{attemptId:'unsafe id'})));
  await assertFails(setDoc(own,Object.assign({},record,{position:41})));
  await assertFails(setDoc(own,Object.assign({},record,{answersCount:-1})));
  await assertFails(setDoc(own,Object.assign({},record,{snapshot:'x'.repeat(300001)})));
  await assertFails(setDoc(own,Object.assign({},record,{extra:'unexpected'})));
  await assertFails(setDoc(doc(alice.firestore(),'users','alice'),{alias:'exam-leak'}));
  await assertFails(setDoc(doc(alice.firestore(),'mock_exam_progress_v1','bob'),record));
  const bobOwn=Object.assign({},record,{ownerUid:'bob',attemptId:'A_fedc_ba12'});
  await assertSucceeds(setDoc(path(bob,'bob'),bobOwn));
  assert.equal((await assertSucceeds(getDoc(path(bob,'bob')))).data().ownerUid,'bob');
  // Old immutable sync_v3 owner events still permitted by preexisting fixture.
  const ev={v:3,uid:'alice',id:'E_'+'0'.repeat(32),device:'D_'+'b'.repeat(32),
   kind:'answer',target:'T00001',time:1794000000000,data:{correct:true}};
  await assertSucceeds(setDoc(doc(alice.firestore(),'sync_v3','alice','events',ev.id),ev));
  console.log('PASS RUN161 private exam security: owner-only get/write, no list/delete, deny others, V3 intact');
 }finally{await env.cleanup();}
}
test().catch(err=>{console.error(err);process.exitCode=1;});
