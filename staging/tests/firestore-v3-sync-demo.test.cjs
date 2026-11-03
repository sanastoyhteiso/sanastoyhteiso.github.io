/* Emulator tests of a new, isolated, deletable synthetic cloud pilot.
 * This file never connects to a real Firebase project. No user data.
 */
'use strict';
const assert=require('assert'),fs=require('fs');
const {initializeTestEnvironment,assertSucceeds,assertFails}=
 require('@firebase/rules-unit-testing');
const {doc,collection,getDoc,getDocs,query,limit,setDoc,updateDoc,deleteDoc}=
 require('firebase/firestore');
const ID='demo-sanastoyhteiso-v3-development';
const RULES='staging/backend/firestore.v3-development-with-sync-demo.rules';
const eid=n=>'P_'+String(n).repeat(32);
const device='D_'+'a'.repeat(32);
const uid='alice';
const payload=(id=eid('a'),who=uid)=>({
  v:1,uid:who,id,device,kind:'answer',target:'DEMO_CARD_A',
  time:1793740000000,correct:true,demo:true
});
async function main(){
 assert(ID.indexOf('demo-')===0);
 const data=fs.readFileSync(RULES,'utf8');
 assert(data.includes('sanastoyhteiso-v3-development'));
 assert(data.includes('sync_demo_v3'));
 const env=await initializeTestEnvironment({
   projectId:ID,firestore:{host:'127.0.0.1',port:8080,rules:data}
 });
 let count=0;
 const ok=async(p,label)=>{await assertSucceeds(p);count++;console.log('ALLOW '+label)};
 const no=async(p,label)=>{await assertFails(p);count++;console.log('DENY '+label)};
 const alice=env.authenticatedContext('alice',{email_verified:true});
 const bob=env.authenticatedContext('bob',{email_verified:true});
 const unverified=env.authenticatedContext('notconfirmed',{email_verified:false});
 const guest=env.unauthenticatedContext();
 const target=(context,who,id=eid('a'))=>
   doc(context.firestore(),'sync_demo_v3',who,'events',id);
 const list=(context,who)=>collection(context.firestore(),'sync_demo_v3',who,'events');
 try{
  await ok(setDoc(target(alice,'alice'),payload()),'owner creates synthetic event');
  await ok(getDoc(target(alice,'alice')),'owner reads synthetic event');
  await ok(getDocs(query(list(alice,'alice'),limit(100))),'bounded owner query');
  await no(getDocs(list(alice,'alice')),'unbounded listing denied');
  await no(getDoc(target(bob,'alice')),'cross-user read denied');
  await no(getDocs(query(list(bob,'alice'),limit(100))),'cross-user query denied');
  await no(getDoc(target(guest,'alice')),'anonymous read denied');
  await no(setDoc(target(unverified,'notconfirmed'),payload(eid('b'),'notconfirmed')),
    'unverified account cannot write');
  await no(setDoc(target(bob,'alice',eid('c')),payload(eid('c'),'alice')),
    'foreign account cannot write');
  await no(setDoc(target(alice,'alice',eid('b')),{...payload(eid('b')),uid:'bob'}),
    'forged data UID rejected');
  await no(setDoc(target(alice,'alice',eid('b')),{...payload(eid('b')),email:'secret'}),
    'unknown/private field rejected');
  await no(setDoc(target(alice,'alice',eid('b')),{...payload(eid('b')),target:'T0001'}),
    'real course term IDs forbidden');
  await no(setDoc(target(alice,'alice',eid('b')),{...payload(eid('b')),demo:false}),
    'demo marker required');
  await no(setDoc(target(alice,'alice',eid('b')),{...payload(eid('b')),correct:'true'}),
    'answer must be boolean');
  await no(setDoc(target(alice,'alice',eid('b')),{...payload(eid('b')),device:'phone'}),
    'device ID format required');
  await no(setDoc(target(alice,'alice',eid('b')),{...payload(eid('b')),id:eid('d')}),
    'event data ID matches path');
  await no(setDoc(target(alice,'alice',eid('b')),{...payload(eid('b')),time:0}),
    'invalid time denied');
  await no(updateDoc(target(alice,'alice'),{correct:false}),
    'immutable synthetic answer cannot mutate');
  await no(setDoc(target(alice,'alice'),{...payload(),correct:false}),
    'repeat write cannot replace original answer');
  await no(deleteDoc(target(bob,'alice')),'other user cannot delete synthetic answer');
  await no(deleteDoc(target(unverified,'alice')),'unverified user cannot delete');
  await ok(deleteDoc(target(alice,'alice')),'owner can clean up ONLY demo answer');
  await ok(setDoc(target(alice,'alice',eid('b')),payload(eid('b'))),
    'same account may add another synthetic answer');
  await ok(deleteDoc(target(alice,'alice',eid('b'))),
    'owner may clear second demo answer');
  await no(setDoc(doc(alice.firestore(),'sync_v3','alice','state','baseline'),
    {v:3,uid:'alice'}),'real migration baseline remains blocked');
  await no(setDoc(doc(alice.firestore(),'arbitrary','secret'),{anything:true}),
    'unrelated collections still deny all');
  console.log('PASS '+count+' isolated sync demo rule cases, only '+ID);
 }finally{await env.cleanup();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
