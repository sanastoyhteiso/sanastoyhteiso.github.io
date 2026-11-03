/* STAGING ONLY. Synthetic DOM smoke test for the UNMODIFIED published app.js.
 * No external resources, Firebase login, Google, Firestore or real personal data.
 * JSDOM is NOT a real Safari/iOS test. No content is written to GitHub Pages.
 */
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'../..');
const html='<!doctype html><html lang="ru"><head></head><body>'+
 '<header><h1 id="page-title"></h1><p id="page-subtitle"></p>'+
 '<span id="online-status"></span><span id="storage-status"></span></header>'+
 '<nav><button data-view="cards"></button><button data-view="practice"></button>'+
 '<button data-view="dictionary"></button><button data-view="mediatri"></button>'+
 '<button data-view="add"></button><button data-view="backup"></button>'+
 '<button data-view="learned"></button><button data-view="libraries"></button>'+
 '<button data-view="users"></button></nav>'+
 '<main id="main-content"></main><div id="toast"></div></body></html>';
const dom=new JSDOM(html,{url:'https://example.invalid/',runScripts:'outside-only'});
const w=dom.window,doc=w.document;
w.scrollTo=()=>{};
let account='syntheticA',events=0;
w.addEventListener('rs:datachange',()=>events++);
w.RS_FAMILY={
 get email(){return account+'@example.invalid';},
 storageKey:k=>'rs_family_v1_'+account+'__'+k,
 sharedEnabled:()=>true,statusText:()=> 'Тестовое подключение',
 sync:()=>Promise.resolve(true),schedule:()=>{},logout:()=>{},migrate:()=>{},
 setScope:()=>{}
};
w.RS_COMM={
 subscribedTerms:()=>[],dataPanel:()=>'<div class="panel">Личный Google Drive (тест)</div>',
 renderUsers:el=>{el.innerHTML='<div>Тестовый список пользователей</div>';},
 renderLibrary:el=>{el.innerHTML='<div>Тестовая библиотека</div>';}
};
w.RS_I18N={getLanguage:()=> 'ru',category:(category,ru)=>ru||category};
w.eval(fs.readFileSync(path.join(root,'data.js'),'utf8'));
w.eval(fs.readFileSync(path.join(root,'app.js'),'utf8'));
function click(selector){
 const el=doc.querySelector(selector);
 assert.ok(el,'Missing clickable control '+selector);
 el.click();
 return el;
}
function view(name){
 click('nav [data-view="'+name+'"]');
 assert.ok(doc.querySelector('#main-content').textContent.length>20,
  'Empty application module: '+name);
}
function run(){
 const main=doc.getElementById('main-content');
 assert.ok(main.textContent.includes('Карточка'),'Cards did not load');
 const id=doc.querySelector('.flash-top span').textContent.trim();
 click('[data-action="flip"]');
 assert.ok(main.querySelector('.flash-trans'),'Card answer does not open');
 click('[data-action="mark-good"]');
 const key='rs_family_v1_'+account+'__rs_scores_v1';
 const score=JSON.parse(w.localStorage.getItem(key))[id];
 assert.equal(score.correct,1);
 assert.equal(score.seen,1);
 assert.equal(score.learned,true);
 assert.ok(events>0,'Local answer save must emit change notification');
 view('learned');
 assert.ok(main.textContent.includes('Выученные'));
 view('practice');
 assert.ok(main.querySelector('.mc-options button'),'Quiz options missing');
 click('.mc-options button');
 assert.ok(main.textContent.includes('Верно!')||
   main.textContent.includes('Пока не так.'),'Quiz answer absent');
 view('dictionary');
 const search=doc.getElementById('dict-search');
 search.value='hoiva-avustaja';
 search.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.ok(main.querySelectorAll('.dict-row').length>=1,'Dictionary search failed');
 view('mediatri');
 assert.ok(main.textContent.includes('Ситуации'));
 click('[data-action="med-mode"][data-value="phrases"]');
 assert.ok(main.querySelector('.dict-row'),'Mediatri phrase list unavailable');
 click('[data-action="med-mode"][data-value="headings"]');
 assert.ok(main.querySelector('.dict-row'),'Mediatri headings missing');
 view('add');
 const form=doc.getElementById('add-form');
 form.elements.namedItem('fi').value='kuntoutus';
 form.elements.namedItem('ru').value='реабилитация';
 form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 const words=JSON.parse(w.localStorage.getItem('rs_family_v1_'+account+'__rs_user_words_v1'));
 assert.equal(words.length,1);
 assert.equal(words[0].fi,'kuntoutus');
 assert.ok(main.textContent.includes('kuntoutus'));
 view('backup');
 assert.ok(main.textContent.includes('Резервная копия'));
 assert.ok(main.textContent.includes('Личный Google Drive'));
 view('libraries');assert.ok(main.textContent.includes('Тестовая библиотека'));
 view('users');assert.ok(main.textContent.includes('Тестовый список пользователей'));
 // Switch account: the app must not mix personal scores or words.
 account='syntheticB';
 w.RS_FAMILY_REFRESH(true);
 assert.ok(!main.textContent.includes('kuntoutus'));
 view('learned');
 assert.ok(!main.textContent.includes(id+' — '));
 assert.equal(w.localStorage.getItem('rs_family_v1_'+account+'__rs_scores_v1'),null);
 account='syntheticA';
 w.RS_FAMILY_REFRESH(true);
 view('add');assert.ok(main.textContent.includes('kuntoutus'));
 assert.ok(w.localStorage.getItem(key),'Original account answer must survive account switch');
 assert.ok(!doc.getElementById('storage-status').textContent.includes('Ошибка'));
 console.log('PASS: real unmodified app.js runs synthetic DOM cards, quiz, dictionary, Mediatri, words, backup, library, users, account isolation');
 w.close();
}
try{run();}catch(e){w.close();throw e;}
