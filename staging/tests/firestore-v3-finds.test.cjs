/* V3 developer rules - owner-only My Finds, real public ref, no other project.
 * Synthetic Firebase emulator; never writes any real user/account/database.
 */
'use strict';
const assert=require('assert'),fs=require('fs');
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,updateDoc,deleteDoc}=require('firebase/firestore');
const RULE='staging/backend/firestore.v3-development-with-finds.rules';
const id=n=>'E_'+n.repeat(32),device='D_'+'a'.repeat(32);
const make=(who='alice',eid=id('a'),target='T00001',
 data={list:'finds',added:true,topic:'practice',note:'New term'})=>
 ({v:3,uid:who,id:eid,device,kind:'collection_set',target,time:1793800000000,data});
async function run(){
 const ruleText=fs.readFileSync(RULE,'utf8');
 assert.ok(ruleText.includes('sanastoyhteiso-v3-development'));
 assert.ok(ruleText.includes('collection_set'));
 const env=await initializeTestEnvironment({
  projectId:'demo-sanastoyhteiso-v3-development',
  firestore:{host:'127.0.0.1',port:8080,rules:ruleText}
 });
 let count=0;
 const ok=async(p,msg)=>{await assertSucceeds(p);console.log('ALLOW '+msg);count++};
 const no=async(p,msg)=>{await assertFails(p);console.log('DENY '+msg);count++};
 const alice=env.authenticatedContext('alice',{email_verified:true});
 const bob=env.authenticatedContext('bob',{email_verified:true});
 const invalid=env.authenticatedContext('unverified',{email_verified:false});
 const guest=env.unauthenticatedContext();
 const ref=(c,uid,eid=id('a'))=>doc(c.firestore(),'sync_v3',uid,'events',eid);
 try{
   await ok(setDoc(ref(alice,'alice'),make()),'owner saves an existing public term');
   await ok(getDoc(ref(alice,'alice')),'owner can read saved selection');
   await no(getDoc(ref(bob,'alice')),'other user cannot read');
   await no(getDoc(ref(guest,'alice')),'anonymous cannot read');
   await no(setDoc(ref(bob,'alice',id('b')),make('alice',id('b'))),'cross user cannot write');
   await no(setDoc(ref(invalid,'unverified',id('b')),make('unverified',id('b'))),'unverified cannot write');
   await ok(setDoc(ref(alice,'alice',id('b')),make('alice',id('b'),'W_'+'9'.repeat(32),
    {list:'finds',added:true,topic:'study',note:''})),
    'owner may add personal word reference');
   await ok(setDoc(ref(alice,'alice',id('c')),make('alice',id('c'),'T00001',
    {list:'finds',added:false,topic:'practice',note:''})),
    'unselect is a tombstone event');
   await no(setDoc(ref(alice,'alice',id('d')),make('alice',id('d'),'T00001',
    {list:'finds',added:true,topic:'work',note:''})),'unknown topic denied');
   await no(setDoc(ref(alice,'alice',id('e')),make('alice',id('e'),'T00001',
    {list:'private',added:true,topic:'study',note:''})),'unapproved collection denied');
   await no(setDoc(ref(alice,'alice',id('f')),make('alice',id('f'),'T00001',
    {list:'finds',added:true,topic:'study',note:'x'.repeat(351)})),'long note denied');
   await no(setDoc(ref(alice,'alice',id('1')),make('alice',id('1'),'PRIVATE_ID',
    {list:'finds',added:true,topic:'study',note:''})),'arbitrary target denied');
   await no(setDoc(ref(alice,'alice',id('2')),make('alice',id('2'),'T00001',
    {list:'finds',added:'true',topic:'study',note:''})),'not boolean denied');
   await no(setDoc(ref(alice,'alice',id('3')),make('alice',id('3'),'T00001',
    {list:'finds',added:true,topic:'study',note:'',email:'x@y.com'})),'extra sensitive field denied');
   await no(updateDoc(ref(alice,'alice'),{time:1}),'immutable event cannot change');
   await no(deleteDoc(ref(alice,'alice')),'immutable event cannot be deleted');
   await no(setDoc(ref(alice,'alice'),make()),'cannot replay write over existing event');
   await no(setDoc(doc(alice.firestore(),'sync_v3','alice','state','baseline'),
    {v:3,uid:'alice'}),'baseline import remains blocked');
   console.log('PASS '+count+' owner-only My Finds emulator cases');
 }finally{await env.cleanup();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
