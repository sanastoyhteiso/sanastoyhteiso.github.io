/* Emulator-only tests. PROJECT ID MUST start with demo-.
 * Reads local staging rule fixture; no real Firebase calls or user data. */
'use strict';
const fs=require('fs');
const assert=require('assert');
const {initializeTestEnvironment,assertFails,assertSucceeds}=require('@firebase/rules-unit-testing');
const {doc,collection,getDoc,getDocs,query,where,setDoc,updateDoc,deleteDoc}=require('firebase/firestore');
const RULES='staging/firestore.rules.combined.test';
const id='E_'+'a'.repeat(32),device='D_'+'b'.repeat(32),now=1793650000000;
const event=(uid,kind='answer',data={correct:true})=>({
  v:3,uid,id,device,kind,target:'T00001',time:now,data
});
const baseline=(uid)=>({
  v:3,uid,migrationId:'M_test',importedAt:now,sha256:'f'.repeat(64),
  source:'approved-local-JSON',snapshot:{scores:{},words:{},favorites:{}}
});
const user=(name,publicStats)=>({alias:name,publicStats,learned:138,updatedAt:now});
const settings={scope:'all',subscriptions:'{}',updatedAt:now};
const library=(uid,visibility)=>({
  ownerUid:uid,ownerName:'Test user',title:'Study materials',
  category:'Test',count:1,sheetId:'123456789012345678901234567890',visibility,updatedAt:now
});
async function run(){
  assert(fs.existsSync(RULES),'Rules fixture missing');
  const projectId='demo-sanastoyhteiso';
  assert(projectId.indexOf('demo-')===0,'Never connect to production');
  const env=await initializeTestEnvironment({
    projectId,firestore:{host:'127.0.0.1',port:8080,rules:fs.readFileSync(RULES,'utf8')}
  });
  const alice=env.authenticatedContext('alice',{email_verified:true});
  const bob=env.authenticatedContext('bob',{email_verified:true});
  const unverified=env.authenticatedContext('newUser',{email_verified:false});
  const admin=env.authenticatedContext('adminUser',{admin:true,email_verified:true});
  const anonymous=env.unauthenticatedContext();
  let checked=0;
  async function allow(p,label){await assertSucceeds(p);checked++;console.log('ALLOW '+label);}
  async function deny(p,label){await assertFails(p);checked++;console.log('DENY '+label);}
  const at=(ctx,col,key)=>doc(ctx.firestore(),col,key);
  const evPath=(ctx,uid,key=id)=>doc(ctx.firestore(),'sync_v3',uid,'events',key);
  const basePath=(ctx,uid)=>doc(ctx.firestore(),'sync_v3',uid,'state','baseline');
  try{
    await env.withSecurityRulesDisabled(async(ctx)=>{
      await setDoc(at(ctx,'settings','alice'),settings);
      await setDoc(at(ctx,'users','alice'),user('Alice',true));
      await setDoc(at(ctx,'users','private'),user('Private',false));
      await setDoc(at(ctx,'libraries','alice_public1'),library('alice','public'));
      await setDoc(at(ctx,'libraries','alice_private1'),library('alice','private'));
      await setDoc(at(ctx,'site_admin','summary'),{registered:4,active7d:1});
    });

    await deny(getDoc(at(anonymous,'settings','alice')),'guest cannot read settings');
    await allow(getDoc(at(alice,'settings','alice')),'owner reads settings');
    await deny(getDoc(at(bob,'settings','alice')),'other account cannot read settings');
    await deny(getDocs(collection(alice.firestore(),'settings')),'settings cannot be listed');
    await allow(setDoc(at(alice,'settings','alice'),settings),'owner updates settings');
    await deny(setDoc(at(bob,'settings','alice'),settings),'stranger cannot write settings');
    await deny(setDoc(at(unverified,'settings','newUser'),settings),'unverified cannot create settings');

    await allow(getDoc(at(alice,'users','alice')),'owner reads profile');
    await allow(getDoc(at(bob,'users','alice')),'signed-in reads opt-in public profile');
    await deny(getDoc(at(anonymous,'users','alice')),'guest cannot read public profile');
    await deny(getDoc(at(bob,'users','private')),'private profile stays private');
    await allow(getDocs(query(collection(bob.firestore(),'users'),where('publicStats','==',true))),'public user query is filtered');
    await deny(getDocs(collection(bob.firestore(),'users')),'unfiltered users query denied');

    await allow(getDoc(at(bob,'libraries','alice_public1')),'public library read');
    await deny(getDoc(at(bob,'libraries','alice_private1')),'private library read denied');
    await allow(getDoc(at(alice,'libraries','alice_private1')),'private library owner reads');
    await deny(getDoc(at(anonymous,'libraries','alice_public1')),'guest cannot read library');

    await deny(getDoc(evPath(anonymous,'alice')),'guest cannot read events');
    await allow(setDoc(evPath(alice,'alice'),event('alice')),'owner creates event');
    await allow(getDoc(evPath(alice,'alice')),'owner reads event');
    await deny(getDoc(evPath(bob,'alice')),'other account cannot read event');
    await deny(setDoc(evPath(bob,'alice', 'E_'+'c'.repeat(32)),{...event('alice'),id:'E_'+'c'.repeat(32)}),'other account cannot create event');
    await deny(updateDoc(evPath(alice,'alice'),{time:now+1}),'event immutable');
    await deny(deleteDoc(evPath(alice,'alice')),'cannot delete event');
    await deny(setDoc(evPath(alice,'alice','bad-id'),{...event('alice'),id:'bad-id'}),'invalid event ID denied');
    await deny(setDoc(evPath(alice,'alice','E_'+'d'.repeat(32)),{...event('alice'),id:'E_'+'d'.repeat(32),data:{correct:'notboolean'}}),'invalid answer payload denied');

    await allow(setDoc(basePath(alice,'alice'),baseline('alice')),'owner imports one baseline');
    await allow(getDoc(basePath(alice,'alice')),'owner reads baseline');
    await deny(getDoc(basePath(bob,'alice')),'other account cannot read baseline');
    await deny(getDoc(basePath(anonymous,'alice')),'guest cannot read baseline');
    await deny(updateDoc(basePath(alice,'alice'),{importedAt:now+1}),'baseline immutable');
    await deny(deleteDoc(basePath(alice,'alice')),'baseline never deleted');
    await deny(setDoc(basePath(alice,'alice'),baseline('alice')),'baseline cannot be overwritten');
    await deny(setDoc(basePath(bob,'bob'),{...baseline('bob'),sha256:'bad'}),'invalid baseline hash rejected');

    await allow(getDoc(at(admin,'site_admin','summary')),'claim admin sees aggregate metrics');
    await deny(getDoc(at(alice,'site_admin','summary')),'regular user cannot see admin metrics');
    await deny(setDoc(at(admin,'site_admin','summary'),{registered:999}),'even admin cannot change metrics from browser');
    await deny(getDoc(at(alice,'secret','unknown')),'unknown collections denied');

    console.log('PASS: '+checked+' emulator permission tests, no production access');
  }finally{await env.cleanup();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
