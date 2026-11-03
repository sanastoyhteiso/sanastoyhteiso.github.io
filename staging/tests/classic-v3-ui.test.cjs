/* STAGING CLASSIC 3.0. Isolated synthetic regression of existing design,
 * mobile nav placement CSS, Mediatri guide, locale and admin mock.
 * JSDOM IS NOT a physical Safari / visual viewport rendering test.
 */
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const acorn=require('acorn');
const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'staging/classic');
const read=(name)=>fs.readFileSync(path.join(dir,name),'utf8');
const html=read('index.html'),css=read('style.css');
const main=fs.readFileSync(path.join(root,'index.html'),'utf8');
const mainCss=fs.readFileSync(path.join(root,'style.css'),'utf8');
assert.ok(html.includes('<div class="shell">')&&html.includes('class="mobile-nav"'));
assert.ok(html.includes('class="sidebar"')&&html.includes('id="main-content"'));
assert.ok(html.includes('connect-src &#39;none&#39;')||html.includes("connect-src 'none'"));
assert.ok(html.includes('noindex,nofollow'));

assert.ok(html.includes('href="../icon-192.png"'),'Classic favicon should use existing root icon');
['about.html','privacy.html','terms.html'].forEach(name=>{
  assert.ok(html.includes('href="'+name+'"'),'Classic footer must link to '+name);
  const doc=read(name);
  assert.ok(doc.includes('DEMO ONLY'),'Test information should be labeled demo');
  assert.ok(doc.includes("connect-src 'none'"),'Information pages must not contact real backend');
  assert.ok(doc.includes('Suomi')&&doc.includes('English')&&doc.includes('Русский'));
});

assert.ok(!html.includes('rs-ui-language'),'Do not show automatic language selector');
assert.ok(!html.includes('id="family-gate"'),'No real authentication in demo');
assert.ok(!html.includes('https://accounts.google.com'));
assert.ok(!html.includes('https://www.gstatic.com'));
assert.ok(html.includes('data-login-lang="fi"')&&html.includes('data-login-lang="en"')&&html.includes('data-login-lang="ru"'));
assert.ok(css.startsWith(mainCss),'Classic preview must preserve all production stylesheet rules');
assert.ok(/@media\(max-width:900px\)\{[\s\S]*Keep the bottom navigation anchored/.test(css));
assert.ok(/\.mobile-nav\{position:fixed!important;top:auto!important;bottom:0!important/.test(css));
assert.ok(/\.main-column\{padding-bottom:calc\(135px/.test(css));
assert.ok(css.includes('.flash-term{font-size:31px;line-height:1.22;'));
assert.ok(!/serviceWorker\.register\(/.test(read('app.js')));
const scripts=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(x=>x[1]);
assert.deepEqual(scripts,[
 'data-public.js','rs-admin-preview.js','rs-mediatri-guide.js',
 'rs-demo-offline.js','app.js','mobile-nav.js','i18n.js']);
scripts.forEach(name=>acorn.parse(read(name),{ecmaVersion:5}));
const d=new JSDOM(html,{url:'https://example.invalid/v3/classic/',runScripts:'outside-only'});
const w=d.window,doc=w.document;
w.scrollTo=function(){};
w.fetch=function(){throw Error('No browser network allowed in classic demo');};
w.XMLHttpRequest=function(){throw Error('Network disabled')};
scripts.forEach(name=>w.eval(read(name)+'\n//# sourceURL=staging/classic/'+name));
doc.dispatchEvent(new w.Event('DOMContentLoaded'));
function click(q){
 const node=doc.querySelector(q);
 assert.ok(node,'Missing clickable control: '+q);
 node.click();
}
function change(id,value){
 const node=doc.getElementById(id);
 assert.ok(node,'Missing control: '+id);
 node.value=value;node.dispatchEvent(new w.Event('change',{bubbles:true}));
}
(async function(){
 assert.equal(w.RS_DATA.terms.length,1296);
 assert.equal(w.RS_MED_GUIDE.stats().samples,183);
 assert.equal(w.RS_MED_GUIDE.stats().core>=18,true);
 assert.ok(doc.querySelector('#main-content .flashcard'),'Existing card layout missing');
 assert.equal(w.localStorage.length,0,'Do not access production data at initialization');
 click('[data-view="mediatri"]');
 assert.ok(doc.getElementById('rs-med-shift'),'Guide should be first tab');
 assert.ok(doc.getElementById('rs-med-heading'));
 assert.ok(doc.getElementById('rs-med-guide-results').textContent.trim().length>5);
 change('rs-med-heading','Fyys.toim.kyky');
 assert.ok(doc.getElementById('rs-med-guide-results').textContent.includes('rollaattor'),
   'Physical function should show real walking-aid phrases');
 change('rs-med-shift','night');
 assert.ok(doc.getElementById('rs-med-guide-results'));
 click('[data-action="med-mode"][data-value="phrases"]');
 assert.ok(doc.getElementById('rs-med-phrase-results'));
 assert.ok(doc.querySelectorAll('.rs-med-fold').length>2);
 change('rs-med-phrase-shift','morning');
 assert.ok(doc.getElementById('rs-med-phrase-results').textContent.length>40);
 click('[data-action="med-mode"][data-value="headings"]');
 assert.ok(doc.getElementById('main-content').textContent.includes('MMSE'));
 assert.ok(doc.getElementById('main-content').textContent.includes('BRADEN'));
 assert.ok(doc.getElementById('main-content').textContent.includes('Kognit.toim.kyky'));
 click('[data-action="med-mode"][data-value="situations"]');
 assert.ok(doc.getElementById('scenario-input'));
 click('[data-action="med-mode"][data-value="draft"]');
 assert.ok(doc.getElementById('draft-input'));
 click('[data-view="dictionary"]');
 assert.ok(doc.getElementById('dict-search'));
 click('[data-view="practice"]');
 assert.ok(doc.querySelector('#main-content .mc-options'));
 click('[data-view="cards"]');
 click('[data-action="flip"]');
 assert.ok(doc.querySelector('.flash-trans'));
 click('[data-action="mark-good"]');
 const keys=Object.keys(w.localStorage);
 assert.ok(keys.some(k=>k.startsWith('rs_v3_classic_synthetic_only__rs_scores_v1')));
 assert.ok(keys.every(k=>k.indexOf('rs_v3_classic_')===0),'No production account localStorage keys may be written');
 click('[data-view="backup"]');
 assert.ok(doc.getElementById('main-content').textContent.includes('Настройки сайта'));
 assert.ok(doc.getElementById('main-content').textContent.includes('Google Drive и Firestore'));
 changeLocale('fi');
 assert.equal(w.RS_I18N.getLanguage(),'fi');
 changeLocale('en');
 assert.equal(w.RS_I18N.getLanguage(),'en');
 changeLocale('ru');
 assert.equal(w.RS_I18N.getLanguage(),'ru');
 assert.ok(!Object.keys(w.localStorage).some(k=>k.indexOf('sanastoyhteiso_legal_language')>=0));
 console.log('PASS: classic UI preserves cards, FI/EN/RU, original nav, Mediatri guide/groups/scales, admin mock; data isolated');
 d.window.close();
})().catch(e=>{d.window.close();console.error(e);process.exit(1);});
function changeLocale(lang){
 click('[data-login-lang="'+lang+'"]');
}
