/* Isolated v3 development Cloud Firestore security rules emulator tests.
 * All users, records and services are SYNTHETIC.
 * Project ID MUST begin with demo-; no production Firebase access.
 */
'use strict';
const fs=require('fs'),assert=require('assert');
const {initializeTestEnvironment,assertFails,assertSucceeds}=
 require('@firebase/rules-unit-testing');
const {doc,collection,getDoc,getDocs,query,where,
  setDoc,updateDoc,deleteDoc}=require('firebase/firestore');

const RULES='staging/backend/firestore.v3-development.rules';
const ID='demo-sanastoyhteiso-v3-development';
const NOW=1793740000000;
const eid='E_'+'a'.repeat(32);
const device='D_'+'b'.repeat(32);
const libraryId='lib_demoanatomy123';
const otherLibrary='lib_privatetest123';
const missingLibrary='lib_missingtest123';
const profile=(alias)=>({alias,publicStats:false,learned:0,updatedAt:NOW});
const library=(uid,visibility='private')=>({
 ownerUid:uid,title:'Anatomia harjoitus',category:'Anatomia',
 visibility,revision:1,wordCount:1,updatedAt:NOW
});
const term=()=>({fi:'munuaiskeränen',ru:'почечное тельце',en:'renal corpuscle',cat:'Anatomia'});
const event=(uid)=>({v:3,uid,id:eid,device,
  kind:'answer',target:'T001',time:NOW,data:{correct:true}});
const subscription=(id)=>({libraryId:id,revision:1,addedAt:NOW,enabled:true});
async function main(){
 assert(ID.startsWith('demo-'),'Never point emulator suite at real Firebase');
 assert(fs.existsSync(RULES),'Staging v3 rules fixture missing');
 const data=fs.readFileSync(RULES,'utf8');
 assert(data.includes('riveria-sanasto-community-test') &&
   data.includes('sanastoyhteiso-v3-development'),
   'Rules must explicitly document the two independent Firebase projects');
 const testEnv=await initializeTestEnvironment({
   projectId:ID,firestore:{host:'127.0.0.1',port:8080,rules:data}
 });
 const alice=testEnv.authenticatedContext('alice',{email_verified:true});
 const bob=testEnv.authenticatedContext('bob',{email_verified:true});
 const guest=testEnv.unauthenticatedContext();
 const unchecked=testEnv.authenticatedContext('unchecked',{email_verified:false});
 const admin=testEnv.authenticatedContext('admin',{email_verified:true,admin:true});
 const user=(ctx,uid)=>doc(ctx.firestore(),'users',uid);
 const settings=(ctx,uid)=>doc(ctx.firestore(),'settings',uid);
 const events=(ctx,uid,id=eid)=>doc(ctx.firestore(),'sync_v3',uid,'events',id);
 const base=(ctx,uid)=>doc(ctx.firestore(),'sync_v3',uid,'state','baseline');
 const book=(ctx,id)=>doc(ctx.firestore(),'libraries_v3',id);
 const word=(ctx,id,wordId='term_1')=>doc(ctx.firestore(),'libraries_v3',id,'terms',wordId);
 const sub=(ctx,uid,id=libraryId)=>doc(ctx.firestore(),'library_subscriptions_v3',uid,'items',id);
 let total=0;
 async function ok(p,why){await assertSucceeds(p);total++;console.log('ALLOW '+why)}
 async function no(p,why){await assertFails(p);total++;console.log('DENY '+why)}
 try{
  // Seed only fake data under elevated rules, no live Firebase connection.
  await testEnv.withSecurityRulesDisabled(async ctx=>{
    await setDoc(user(ctx,'admin'),profile('Super Admin'));
    await setDoc(base(ctx,'alice'),{v:3,uid:'alice',migrationId:'synthetic'});
    await setDoc(doc(ctx.firestore(),'site_admin','summary'),{users:7});
    await setDoc(book(ctx,otherLibrary),library('bob','private'));
    await setDoc(word(ctx,otherLibrary),term());
  });

  // Existing and new profiles are private even if publicStats=true.
  await ok(setDoc(user(alice,'alice'),profile('Alice')),'first verified account private profile');
  await ok(getDoc(user(alice,'alice')),'owner reads profile');
  await no(getDoc(user(bob,'alice')),'other account cannot read private profile');
  await no(getDoc(user(guest,'alice')),'anonymous cannot read private profile');
  await no(getDocs(collection(alice.firestore(),'users')),'profile listing remains disabled');
  await no(setDoc(user(unchecked,'unchecked'),profile('Bad User')),'unverified cannot register profile');
  await no(setDoc(user(bob,'alice'),profile('Bob takeover')),'UID impersonation denied');
  await no(setDoc(user(bob,'bob'),{...profile('Bob'),email:'bob@example.invalid'}),'unknown field forbidden');
  await no(setDoc(user(bob,'bob'),{...profile('bob@example.invalid')}),'email address cannot be alias');
  await no(setDoc(user(bob,'bob'),{...profile('Bob'),publicStats:true}),'profile is private by default');
  await ok(setDoc(user(bob,'bob'),profile('Bob')),'Bob owns independent profile');
  await ok(updateDoc(user(alice,'alice'),{alias:'Alice Student',learned:12,updatedAt:NOW+1}),
    'owner changes nickname and own learning count');
  await no(updateDoc(user(bob,'alice'),{learned:500,updatedAt:NOW+2}),'other account cannot inflate progress');
  await no(deleteDoc(user(alice,'alice')),'no accidental profile deletion');
  await ok(updateDoc(user(alice,'alice'),{publicStats:true,updatedAt:NOW+2}),
    'explicit consent flag may be saved');
  await no(getDoc(user(bob,'alice')),'visibility flag alone does not expose profile prematurely');
  await no(updateDoc(user(alice,'alice'),{updatedAt:NOW-1}),'cannot roll back profile modification time');

  await ok(setDoc(settings(alice,'alice'),{scope:'all',subscriptions:'{}',updatedAt:NOW}),
    'personal settings owned');
  await no(getDoc(settings(bob,'alice')),'foreign settings private');
  await no(deleteDoc(settings(alice,'alice')),'settings cannot be deleted');
  await no(setDoc(settings(alice,'alice'),{scope:'all',subscriptions:'{}',updatedAt:NOW,
    firebaseToken:'secret'}),'extra sensitive setting rejected');

  await ok(setDoc(events(alice,'alice'),event('alice')),'owner appends learning event');
  await ok(getDoc(events(alice,'alice')),'owner reads own event');
  await ok(getDocs(collection(alice.firestore(),'sync_v3','alice','events')),
    'owner reads own event list');
  await no(getDoc(events(bob,'alice')),'other account cannot inspect event');
  await no(getDocs(collection(bob.firestore(),'sync_v3','alice','events')),
    'other account cannot inspect event list');
  await no(setDoc(events(unchecked,'unchecked'),{...event('unchecked')}),
    'unverified user cannot create learning events');
  await no(setDoc(events(bob,'alice','E_'+'c'.repeat(32)),{
    ...event('alice'),id:'E_'+'c'.repeat(32)}),'UID-spoofed event forbidden');
  await no(updateDoc(events(alice,'alice'),{time:NOW+1}),'existing event immutable');
  await no(deleteDoc(events(alice,'alice')),'history cannot be deleted');
  await no(setDoc(events(alice,'alice','E_'+'d'.repeat(32)),{
    ...event('alice'),id:'E_'+'d'.repeat(32),data:{correct:'yes'}}),
    'bad answer payload forbidden');
  await no(setDoc(events(alice,'alice','E_'+'e'.repeat(32)),{
    ...event('alice'),id:'E_'+'e'.repeat(32),email:'secret'}),
    'private extra metadata forbidden');

  await ok(getDoc(base(alice,'alice')),'owner may inspect existing migration baseline');
  await no(getDoc(base(bob,'alice')),'foreign migration baseline private');
  await no(setDoc(base(bob,'bob'),{v:3,uid:'bob',migrationId:'unauthorized'}),
    'new baseline imports disabled pending backup');
  await no(deleteDoc(base(alice,'alice')),'existing migration baseline immutable');

  // Private collections: only the owner sees terms. Publishing is explicit.
  await ok(setDoc(book(alice,libraryId),library('alice')),
    'owner creates private library');
  await no(getDoc(book(bob,libraryId)),'private library not exposed');
  await no(getDoc(book(guest,libraryId)),'anonymous cannot read library');
  await ok(getDoc(book(alice,libraryId)),'owner reads private metadata');
  await no(setDoc(book(bob,'lib_badowner1234'),library('alice')),
    'cannot forge a private library owned by somebody else');
  await no(setDoc(book(alice,'lib_wrongfields1234'),{
    ...library('alice'),email:'alice@example.invalid'}),
    'library metadata cannot leak email');
  await ok(setDoc(word(alice,libraryId),term()),'owner adds word while private');
  await no(getDoc(word(bob,libraryId)),'private words stay private');
  await no(setDoc(word(bob,libraryId,'term_2'),term()),'other account cannot add words');
  await no(setDoc(word(alice,libraryId,'term_2'),{...term(),scores:{seen:100}}),
    'sharing cannot include study scores');
  await no(setDoc(word(alice,libraryId,'term_2'),{...term(),email:'user@example.invalid'}),
    'sharing cannot include private email');
  await no(deleteDoc(word(alice,libraryId)),'private terms cannot be accidentally deleted');

  await ok(updateDoc(book(alice,libraryId),{visibility:'public',updatedAt:NOW+1}),
    'owner explicitly publishes a library');
  await ok(getDoc(book(bob,libraryId)),'other account can read public metadata');
  await ok(getDoc(word(bob,libraryId)),'other account can read public words');
  await no(getDoc(word(guest,libraryId)),'anonymous still cannot read public words');
  await ok(getDocs(query(collection(bob.firestore(),'libraries_v3'),where('visibility','==','public'))),
    'catalog query must explicitly filter by public');
  await no(getDocs(collection(bob.firestore(),'libraries_v3')),
    'unfiltered public-private library query forbidden');
  await no(updateDoc(book(alice,libraryId),{title:'Changed after publishing',updatedAt:NOW+2}),
    'published release metadata frozen');
  await no(updateDoc(word(alice,libraryId),{fi:'changed'}),
    'published word immutable');
  await no(deleteDoc(book(alice,libraryId)),'published libraries cannot disappear silently');

  await ok(setDoc(sub(bob,'bob'),subscription(libraryId)),
    'Bob voluntarily subscribes to public library');
  await ok(getDoc(sub(bob,'bob')),'Bob reads own subscription');
  await no(getDoc(sub(alice,'bob')),'Alice cannot read Bob subscription');
  await no(setDoc(sub(alice,'bob'),subscription(libraryId)),
    'Alice cannot subscribe on Bob behalf');
  await no(setDoc(sub(bob,'bob',missingLibrary),subscription(missingLibrary)),
    'cannot subscribe to nonexistent collection');
  await no(setDoc(sub(bob,'bob',otherLibrary),subscription(otherLibrary)),
    'cannot subscribe to private collection');
  await ok(updateDoc(sub(bob,'bob'),{enabled:false}),
    'owner can opt out without deleting learning history');
  await no(deleteDoc(sub(bob,'bob')),'subscriptions not hard-deleted in pilot');

  await ok(getDoc(doc(admin.firestore(),'site_admin','summary')),
    'server-claim verified admin reads aggregate summary only');
  await no(getDoc(doc(alice.firestore(),'site_admin','summary')),
    'normal user blocked from admin stats');
  await no(setDoc(doc(admin.firestore(),'site_admin','summary'),{users:999}),
    'even admin cannot modify statistics from browser');
  await no(getDoc(doc(admin.firestore(),'arbitrary','credentials')),
    'all other collections denied');

  console.log('PASS '+total+' v3-development emulator security cases using only '+ID);
 }finally{await testEnv.cleanup();}
}
main().catch(err=>{console.error(err);process.exitCode=1;});
