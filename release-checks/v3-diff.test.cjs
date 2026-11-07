'use strict';
const a=require('assert'),vm=require('vm'),fs=require('fs');
const diff=require('../v3-sync-diff.js');
new vm.Script(fs.readFileSync('v3-sync-diff.js','utf8'));
const empty={scores:{},words:{},favorites:{}};
const s1={scores:{T00001:{correct:1,wrong:0,seen:1,learned:true}},words:{},favorites:{}};
let ev=diff.changes(empty,s1);a.equal(ev.unsafe.length,0);
a.equal(ev.events.length,1);a.deepEqual(ev.events[0],{
 kind:'answer',target:'T00001',value:{correct:true,reviewLearned:false}});
const s2={scores:{T00001:{correct:1,wrong:1,seen:2,learned:true}},words:{},favorites:{}};
ev=diff.changes(s1,s2);a.equal(ev.events.length,1);
a.deepEqual(ev.events[0].value,{correct:false,reviewLearned:false});
const s3={scores:{T00001:{correct:1,wrong:1,seen:2,learned:false}},words:{},favorites:{}};
ev=diff.changes(s2,s3);a.deepEqual(ev.events,[{kind:'learned_set',target:'T00001',value:false}]);
const phrase={scores:{H00001:{seen:1,correct:1,wrong:0,learned:true},
 M00014:{seen:1,correct:0,wrong:1,learned:false}},words:{},favorites:{}};
ev=diff.changes(empty,phrase);a.equal(ev.events.length,2);
const id='W_'+'a'.repeat(32);
const personal={scores:{},favorites:{T00003:true},words:{[id]:{id,fi:'peseytyminen',ru:'умывание'}}};
ev=diff.changes(empty,personal);
a.equal(ev.events.filter(e=>e.kind==='word_upsert').length,1);
a.equal(ev.events.filter(e=>e.kind==='favorite_set').length,1);
ev=diff.changes(personal,personal);a.equal(ev.events.length,0);
ev=diff.changes(personal,{scores:{},favorites:{T00003:true},
 words:{[id]:{id,fi:'peseytyminen',ru:'отличается'}}});
a.deepEqual(ev.unsafe,['conflicting-word:'+id]);
ev=diff.changes(s2,s1);a.ok(ev.unsafe.length,'Counter rollback blocked');
const wrong={scores:{T00001:{seen:2,correct:1,wrong:0,learned:true}},words:{},favorites:{}};
a.ok(diff.changes(s1,wrong).unsafe.length,'Incomplete answer counter blocked');
a.equal(diff.target('L112233'),false);
a.equal(diff.target('H00001'),true);
a.equal(diff.target('P00055'),true);
ev=diff.changes(empty,{scores:{P00055:{seen:1,correct:1,wrong:0,learned:true}},
  words:{},favorites:{}});
a.equal(ev.events[0].target,'P00055');
let recovery=diff.recover(s2,s1);
a.equal(recovery.unsafe.length,0);
a.equal(recovery.events.length,0,'Newer cloud scores must not block another device');
recovery=diff.recover(s1,s2);
a.equal(recovery.events.length,1,'Recover a locally completed answer missing from cloud shadow');
a.equal(recovery.events[0].value.correct,false);


// RUN-073 / NEW-011: previously persisted local entities must never
// silently vanish from a V3 sync snapshot (not an authorized tombstone).
const oldWordId='W_'+'d'.repeat(32);
const full={scores:{T00001:{seen:1,correct:1,wrong:0,learned:true}},
 favorites:{M00012:true},words:{[oldWordId]:{id:oldWordId,fi:'hoito',ru:'уход'}}};
const clone=v=>JSON.parse(JSON.stringify(v));
const noScore=clone(full);delete noScore.scores.T00001;
a.ok(diff.changes(full,noScore).unsafe.includes('missing-score:T00001'));
const noWord=clone(full);delete noWord.words[oldWordId];
a.ok(diff.changes(full,noWord).unsafe.includes('missing-word:'+oldWordId));
const removedWord=clone(full);removedWord.words[oldWordId]={id:oldWordId,deleted:true};
a.ok(diff.changes(full,removedWord).unsafe.includes('missing-word:'+oldWordId));
const noFavorite=clone(full);delete noFavorite.favorites.M00012;
a.ok(diff.changes(full,noFavorite).unsafe.includes('missing-favorite:M00012'));
const unstar=clone(full);unstar.favorites.M00012=false;
a.deepEqual(diff.changes(full,unstar).unsafe,[]);
a.deepEqual(diff.changes(full,unstar).events,
 [{kind:'favorite_set',target:'M00012',value:false}]);
a.deepEqual(diff.changes(full,clone(full)),{events:[],unsafe:[]});
const newCard=clone(full);newCard.scores.P00055={seen:1,correct:1,wrong:0,learned:true};
a.equal(diff.changes(full,newCard).unsafe.length,0);

console.log('PASS: UI→V3 answer, review, favorites, personal words and Mediatri diff, fail-closed');
