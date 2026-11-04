/* Synthetic Firestore rules tests. No real project credentials or data. */
'use strict';
const fs=require('fs'),assert=require('assert');
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,getDoc,setDoc,deleteDoc,updateDoc,collection,query,orderBy,limit,getDocs}=require('firebase/firestore');
const path='release-checks/firestore-v3-prod-emulator.rules';
const E=c=>'E_'+c.repeat(32),D='D_'+'a'.repeat(32);
function event(uid,id,kind,target,data){
 return {v:3,uid,id,device:D,kind,target,time:1793800000123,data};
}
async function run(){
 const rules=fs.readFileSync(path,'utf8');
 const env=await initializeTestEnvironment({
   projectId:'demo-sanastoyhteiso-production',
   firestore:{host:'127.0.0.1',port:8080,rules}
 });
 const alice=env.authenticatedContext('alice',{email_verified:true});
 const bob=env.authenticatedContext('bob',{email_verified:true});
 const unverified=env.authenticatedContext('unverified',{email_verified:false});
 const anon=env.unauthenticatedContext();
 const ref=(ctx,uid,id)=>doc(ctx.firestore(),'sync_v3',uid,'events',id);
 try{
   await assertSucceeds(setDoc(ref(alice,'alice',E('a')),event('alice',E('a'),'answer','T00001',{correct:true})));
   await assertSucceeds(setDoc(ref(alice,'alice',E('b')),event('alice',E('b'),'answer','H00001',{correct:false,reviewLearned:false})));
   await assertSucceeds(setDoc(ref(alice,'alice',E('9')),event('alice',E('9'),'answer','P00055',{correct:true})));
   await assertSucceeds(setDoc(ref(alice,'alice',E('c')),event('alice',E('c'),'answer','M00012',{correct:true})));
   const wordId='W_'+'c'.repeat(32);
   await assertSucceeds(setDoc(ref(alice,'alice',E('d')),event('alice',E('d'),'word_upsert',wordId,{
      id:wordId,fi:'testisana',ru:'тестовое слово',en:'test word',
      cat:'Omat sanat',catRu:'Мои слова',updatedAt:1793800000123
   })));
   await assertSucceeds(setDoc(ref(alice,'alice',E('e')),event('alice',E('e'),'collection_set','T00001',{
     list:'finds',added:true,topic:'practice',note:'safe test note'
   })));
   await assertSucceeds(getDoc(ref(alice,'alice',E('a'))));
   await assertSucceeds(getDocs(query(collection(alice.firestore(),'sync_v3','alice','events'),
     orderBy('__name__'),limit(100))));
   await assertFails(getDoc(ref(bob,'alice',E('a'))));
   await assertFails(getDoc(ref(anon,'alice',E('a'))));
   await assertFails(setDoc(ref(bob,'alice',E('f')),event('alice',E('f'),'answer','T00002',{correct:true})));
   await assertFails(setDoc(ref(unverified,'unverified',E('f')),event('unverified',E('f'),'answer','T00002',{correct:true})));
   await assertFails(setDoc(ref(alice,'alice',E('f')),event('alice',E('f'),'collection_set','T00001',{
     list:'finds',added:true,topic:'practice',note:'x'.repeat(351)
   })));
   await assertFails(setDoc(ref(alice,'alice',E('1')),event('alice',E('1'),'answer','SECRET',{correct:true})));
   await assertFails(setDoc(ref(alice,'alice',E('2')),event('alice',E('2'),'word_upsert','T00001',{
     id:'T00001',fi:'f',ru:'r',en:'',cat:'X',catRu:'X',updatedAt:1793800000123
   })));
   await assertFails(updateDoc(ref(alice,'alice',E('a')),{time:1793800000999}));
   await assertFails(deleteDoc(ref(alice,'alice',E('a'))));
   await assertFails(setDoc(doc(alice.firestore(),'sync_v3','alice','state','baseline'),
     {uid:'alice',v:3}));
   await assertFails(setDoc(doc(alice.firestore(),'users','alice'),{alias:'test'}));
   console.log('PASS: V3 production additive block owner-only, FI/H/M, personal words, findings and immutable events');
 }finally{await env.cleanup();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
