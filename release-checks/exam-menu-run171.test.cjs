'use strict';
// RUN171 — protected copy-only change in Riveria anatomy topic menus.
// Tests the exact visible labels plus preserved exam topic metadata.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const app=fs.readFileSync('app.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const source=fs.readFileSync('riveria-anatomy-exam.js','utf8');

test('cards Riveria group is clearly anatomy and physiology exam, no 2014 book name',()=>{
  assert.ok(app.includes('<optgroup label="Riveria · Экзамен: анатомия и физиология">'));
  assert.ok(!app.includes('<optgroup label="Riveria · Päästä varpaisiin (2014)">'));
  assert.equal((app.match(/safe\(t\.fi\+' — '\+t\.ru\)/g)||[]).length,2,'both cards and test selectors');
  assert.equal((app.match(/safe\(t\.fi\+' — '\+t\.ru\+' \(с\. '\+t\.pages\+'\)'\)/g)||[]).length,0,'pages absent from menu labels');
});
test('ten exam topic names, IDs and original page metadata are preserved for the future',()=>{
  const context={window:{RS_DATA:{terms:[],phrases:[],mediatri:[]}}};
  vm.runInNewContext(source,context);
  const topics=context.window.RS_DATA.examTopics;
  assert.equal(topics.length,10);
  assert.deepEqual(Array.from(topics, x=>x.id),Array.from({length:10},(_,i)=>'EXAM'+String(i+1).padStart(2,'0')));
  for(const x of topics){
    assert.ok(x.fi&&x.ru,'FI/RU names unchanged');
    assert.ok(typeof x.pages==='string'&&/\d/.test(x.pages),'page metadata retained for historical reference');
  }
});
test('HTML and offline cache use only the updated application script rev',()=>{
  assert.ok(html.includes('app.js?v=exam-menu-run171-1'));
  assert.ok(sw.includes('app.js?v=exam-menu-run171-1'));
  assert.ok(sw.includes("riveria-sanasto-community-v3.0.0-rc37"));
  assert.ok(!html.includes('app.js?v=exam-preserve-run167-1'));
  assert.ok(!sw.includes('app.js?v=exam-preserve-run167-1'));
  assert.ok(html.includes('riveria-anatomy-exam.js?v=moodle-run170-1'));
  assert.ok(sw.includes('riveria-anatomy-exam.js?v=moodle-run170-1'));
});
test('existing exam modes and learned-scores storage remain in place',()=>{
  for(const name of ['function renderCards(', 'function examTopicSelect(', 'function renderMockExam(', 'function mockInit(', 'function renderDict(', "save('rs_scores_v1',state.scores)"]){
    assert.ok(app.includes(name),'unexpected missing existing feature: '+name);
  }
});
