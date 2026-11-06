'use strict';
/*
 * RUN-070 / NEW-009. Mandatory RELEASE-CANDIDATE block for the existing
 * v3-sync-release.js refresh() bug. This tests real draft source inside an
 * isolated memory-only VM: no Firebase, network, user data, keys, deploy.
 * These assertions MUST run; a known-red result means NO-GO for release.
 * Do not disable or skip the test to make CI green. FIX SOURCE only through
 * a permitted, separately reviewed editor and rerun all three invariants.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(
  path.resolve(__dirname,'../v3-sync-release.js'),'utf8');
const marker='w.RS_V3_RELEASE={';
const verify=test; // Mandatory on every release PR; never skip known unsafe cloud acknowledgements.
function fixture(params){
  assert.ok(source.includes(marker),'real V3 source entrypoint changed');
  const owner='synthetic-owner-1';
  let writes=0;
  const state={scores:{},words:{},favorites:{},scope:{value:'all',updatedAt:1}};
  const w={
    RS_FAMILY:{
      uid:owner,
      getState(){return state;},
      putState(){writes++;return !params.storageFull;}
    },
    RS_V3_DIFF:{project(value){return value;}}
  };
  const d={
    readyState:'loading',
    addEventListener(){},
    getElementById(){return null;}
  };
  // Add a test hook IN MEMORY only. The GitHub V3 source is never edited.
  // It simply initializes the closure's synthetic, already-consenting
  // session; no boot(), remote(), Firebase or browser APIs are invoked.
  const hook="w.__V3_TEST_ONLY__={setEngine:function(e,owner){"+
    "uid=owner;ready=true;engine=e;row={pending:[],state:{}};"+
    "auth={currentUser:{uid:owner,emailVerified:true}};},"+
    "tip:function(){return tip;},pendingJobs:function(){return queued;}};\n";
  vm.runInNewContext(source.replace(marker,hook+marker),
    {window:w,document:d},{filename:'v3-sync-release.js',timeout:2000});
  const engine={
    upload(){
      if(params.uploadError)return Promise.reject(new Error('simulated offline'));
      return Promise.resolve({pending:[]});
    },
    refresh(){
      return Promise.resolve({
        pending:params.pending||[],
        state:params.malformedRemote?null:{scores:{syntheticCard:1},words:{},favorites:{}}
      });
    }
  };
  w.__V3_TEST_ONLY__.setEngine(engine,owner);
  return {
    release:w.RS_V3_RELEASE,
    tip:()=>w.__V3_TEST_ONLY__.tip(),
    writes:()=>writes
  };
}
verify('cloud success MUST NOT be reported when outgoing upload fails',async()=>{
  const f=fixture({uploadError:true});
  assert.equal(await f.release.refresh(),false,
    'A successful server READ does not mean pending local WRITES were uploaded');
  assert.doesNotMatch(f.tip(),/Данные V3 сверены с облаком/);
});
verify('pending IndexedDB events MUST prevent a cloud-saved confirmation',async()=>{
  const f=fixture({pending:[{id:'synthetic-pending-event'}]});
  assert.equal(await f.release.refresh(),false,
    'Locally pending events must remain visible and not be called cloud-saved');
});
verify('successful refresh MUST apply new state after orderly queue cleanup',async()=>{
  const f=fixture({});
  assert.equal(await f.release.refresh(),true);
  assert.equal(f.writes(),1,
    'The cloud snapshot was not applied while queued counter was nonzero');
});


verify('storage write refusal MUST NOT be reported as successful cloud reconciliation',async()=>{
  const f=fixture({storageFull:true});
  assert.equal(await f.release.refresh(),false,
    'Local storage full: cloud history may exist, but student UI was not updated');
  assert.doesNotMatch(f.tip(),/Данные V3 сверены с облаком/);
});
verify('malformed cloud state MUST fail closed without acknowledging sync',async()=>{
  const f=fixture({malformedRemote:true});
  assert.equal(await f.release.refresh(),false,
    'Malformed server snapshot must not be represented as synchronized');
  assert.doesNotMatch(f.tip(),/Данные V3 сверены с облаком/);
});
