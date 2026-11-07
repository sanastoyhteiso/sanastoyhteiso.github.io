'use strict';
/*
 * RUN-141 / NEW-019 regression: actual production app.js + jsdom.
 * Only synthetic public dictionary, in-memory/localStorage fake account,
 * no Firebase, network, real users, cloud writes or deployment.
 * A background Family.putState()/RS_FAMILY_REFRESH(false) MUST NOT advance
 * any card or discard the visible quiz feedback.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');

function browser(){
  const html='<!doctype html><html lang="ru"><body>'+
    '<h1 id="page-title"></h1><p id="page-subtitle"></p>'+
    '<div id="online-status"></div><div id="storage-status"></div>'+
    '<button data-view="practice">Tests</button><button data-view="cards">Cards</button>'+
    '<div id="main-content"></div><div id="toast"></div></body></html>';
  const dom=new JSDOM(html,{url:'https://sanastoyhteiso.github.io/',
    runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window, d=w.document;
  // Deterministic data/shuffling, but no real Riveria user data.
  w.Math.random=()=>0.36;
  w.scrollTo=()=>{};
  w.RS_DATA={
    terms:Array.from({length:18},(_,i)=>({
      id:'T'+String(i+1).padStart(5,'0'),
      fi:'sana'+(i+1),ru:'слово'+(i+1),en:'word'+(i+1),
      cat:'Test',catRu:'Тест'
    })),
    phrases:[],mediatri:[],scenarios:[]
  };
  const uid='synthetic-card-owner';
  const key=k=>'synthetic_'+uid+'_'+k;
  const read=(k,f)=>JSON.parse(w.localStorage.getItem(key(k))||JSON.stringify(f));
  const write=(k,v)=>w.localStorage.setItem(key(k),JSON.stringify(v));
  w.RS_FAMILY={
    uid,storageKey:key,sharedEnabled:()=>true,statusText:()=> 'Synthetic connected',
    getState:()=>({scores:read('rs_scores_v1',{}),words:{},favorites:{},scope:{value:'all',updatedAt:1}}),
    putState:x=>{
      write('rs_scores_v1',x.scores||{});
      if(typeof w.RS_FAMILY_REFRESH==='function')w.RS_FAMILY_REFRESH(false);
      return true;
    }
  };
  w.RS_COMM={subscribedTerms:()=>[],renderUsers:()=>{},renderLibrary:()=>{}};
  w.eval(fs.readFileSync('app.js','utf8')+'\n//# sourceURL=app.js');
  return {dom,w,d,read};
}
function currentId(d){
  const element=d.querySelector('.flash-top > span');
  assert.ok(element,'Expected visible study card');
  return element.textContent;
}
function action(d,name){
  const button=d.querySelector('[data-action="'+name+'"]');
  assert.ok(button,'Missing button: '+name);
  button.click();
}
function cloudReadback(w){
  // Mimics the REAL family.js putState -> RS_FAMILY_REFRESH(false) path.
  const scores=w.RS_FAMILY.getState().scores;
  w.RS_FAMILY.putState({scores});
}
test('Know moves exactly ONE card; cloud readback never jumps to another word',()=>{
  const b=browser();
  try{
    const first=currentId(b.d);
    action(b.d,'flip');
    action(b.d,'mark-good');
    const next=currentId(b.d);
    assert.notEqual(next,first,'Know must advance exactly one card');
    assert.equal(b.read('rs_scores_v1',{})[first].learned,true);
    cloudReadback(b.w);
    assert.equal(currentId(b.d),next,'cloud confirmation must NOT reroll the deck');
    action(b.d,'flip');
    assert.ok(b.d.querySelector('.flash-trans'),'same card can still be flipped');
    cloudReadback(b.w);
    assert.equal(currentId(b.d),next);
    assert.ok(b.d.querySelector('.flash-trans'),'cloud readback must not hide revealed answer');
  }finally{b.dom.window.close();}
});
test('Repeat also advances exactly ONE card; score persists after cloud readback',()=>{
  const b=browser();
  try{
    const first=currentId(b.d);
    action(b.d,'flip');
    action(b.d,'mark-hard');
    const next=currentId(b.d);
    assert.notEqual(next,first);
    assert.equal(b.read('rs_scores_v1',{})[first].wrong,1);
    cloudReadback(b.w);
    assert.equal(currentId(b.d),next);
    assert.equal(b.read('rs_scores_v1',{})[first].wrong,1);
    action(b.d,'flip');
    action(b.d,'mark-hard');
    const third=currentId(b.d);
    assert.notEqual(third,next);
    cloudReadback(b.w);
    assert.equal(currentId(b.d),third);
  }finally{b.dom.window.close();}
});
test('background cloud refresh does not discard answered quiz feedback',()=>{
  const b=browser();
  try{
    b.d.querySelector('[data-view="practice"]').click();
    const answer=b.d.querySelector('[data-action="quiz-choose"]');
    assert.ok(answer,'quiz is available on synthetic dictionary');
    answer.click();
    const before=b.d.querySelector('.answer');
    assert.ok(before,'answer feedback must be visible');
    const content=before.textContent;
    cloudReadback(b.w);
    const after=b.d.querySelector('.answer');
    assert.ok(after,'cloud confirmation must preserve quiz answer');
    assert.equal(after.textContent,content);
  }finally{b.dom.window.close();}
});
test('explicit account change with reset=true still starts a fresh session',()=>{
  const b=browser();
  try{
    action(b.d,'flip');
    action(b.d,'mark-good');
    const old=currentId(b.d);
    b.w.RS_FAMILY_REFRESH(true);
    assert.match(b.d.getElementById('page-title').textContent,/Изучаем слова/);
    assert.ok(b.d.querySelector('[data-action="flip"]'));
    assert.ok(currentId(b.d));
    assert.equal(b.d.querySelector('.flash-trans'),null,
      'full reset must not leave the previous answer exposed');
    // Old UID data is not read under a new UID by this test.
    assert.ok(old);
  }finally{b.dom.window.close();}
});
