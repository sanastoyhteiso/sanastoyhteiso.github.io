/* Synthetic-only regression against prototype pollution and word ID collisions. */
'use strict';
const assert=require('assert');
const C=require('../rs-sync-core.js');
const id='E_'+'f'.repeat(32),device='D_'+'a'.repeat(32),now=1793700000000;
function test(){
  ['__proto__','constructor','prototype','T/123','T\u0000x'].forEach(target=>{
    assert.throws(()=>C.event(id,device,'answer',target,{correct:true},now),
      /Invalid progress event/);
  });
  assert.throws(()=>C.event(id,device,'word_upsert','my-word',
    {id:'different-id',fi:'sana',ru:'слово'},now),/Invalid progress event/);
  assert.throws(()=>C.event(id,device,'word_delete','my-word',
    {deleted:false},now),/Invalid progress event/);
  const evt=C.event(id,device,'word_upsert','my-word',{fi:'sana',ru:'слово'},now);
  const state=C.fold({scores:{},words:{},favorites:{}},[evt]);
  assert.equal(state.applied,1);
  assert.equal(state.state.words['my-word'].id,'my-word');
  assert.equal(state.state.words['my-word'].fi,'sana');
  assert.equal(Object.prototype.polluted,undefined);
  console.log('PASS: reserved key rejection, safe word IDs and deletion payloads');
}
test();
