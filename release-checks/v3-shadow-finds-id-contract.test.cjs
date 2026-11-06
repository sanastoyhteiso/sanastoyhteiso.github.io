'use strict';
/* RUN-078 / NEW-012: release shadow must retain all V3 public term classes.
 * Pure in-memory validation of REAL release v3-sync-shadow.js, no IndexedDB,
 * network, Firebase, existing users, or deployment. The TEST draft already
 * supports TMPH; missing parity here would silently block M/P/H finds.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const shadow=require('../v3-sync-shadow.js');
function view(id){
  return {scores:{},words:{},favorites:{},finds:{
    [id]:{added:true,topic:'practice',note:'synthetic',updatedAt:1}
  }};
}
test('release shadow preserves T/M/P/H published-class My Finds',()=>{
  for(const id of ['T00001','M00001','P00055','H00001',
    'T1234567','M1234567','P1234567','H1234567']){
    const result=shadow.snapshot(view(id));
    assert.equal(result.finds[id].added,true,'Missing or rejected '+id);
    assert.equal(Object.keys(result.finds).length,1);
  }
});
test('release shadow accepts private W words in finds',()=>{
  const id='W_'+'a'.repeat(32);
  const result=shadow.snapshot(view(id));
  assert.equal(result.finds[id].topic,'practice');
});
test('release shadow rejects forged or unsupported IDs and malformed entry',()=>{
  for(const id of ['L00001','S00001','M0001','P012','H00001234',
    'T/../../admin','W_1234','__proto__/admin']){
    assert.throws(()=>shadow.snapshot(view(id)),/Invalid personal find/,
      'Invalid ID accepted: '+id);
  }
  const invalid=view('M00001');
  invalid.finds.M00001.note='x'.repeat(351);
  assert.throws(()=>shadow.snapshot(invalid),/Invalid personal find/);
});
test('shadow snapshot remains immutable and does not invent extra records',()=>{
  const data=view('P00055');
  const copy=shadow.snapshot(data);
  copy.finds.P00055.note='changed local copy';
  assert.equal(data.finds.P00055.note,'synthetic');
  assert.equal(Object.keys(data.scores).length,0);
});
