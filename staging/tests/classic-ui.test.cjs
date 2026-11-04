/* STAGING CLASSIC v3 UI smoke. JSDOM is not real iOS Safari.
 * No real account, Firebase, Google Drive, personal progress, or network.
 */
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const base=path.resolve(__dirname,'../..'),dir=path.join(base,'staging/classic');
const get=p=>fs.readFileSync(path.join(dir,p),'utf8');
const html=get('index.html'),style=get('style.css');
const scripts=Array.from(html.matchAll(/<script src="([^"]+)"><\/script>/g)).map(m=>m[1]);
assert.deepStrictEqual(scripts,['data-public.js','rs-admin-preview.js',
 'rs-mediatri-guide.js','rs-library-model.js','rs-library-demo.js',
 'rs-demo-offline.js','app.js','mobile-nav.js','i18n.js',
 'ipad-selects.js?v=ipad12-readable-1']);
assert.ok(html.includes("connect-src 'none'"));
assert.ok(!html.includes('family-locked')&&!html.includes('id="family-gate"'));
assert.ok(!/firebase|google\.com\/gsi|https:\/\/www\.gstatic\.com/i.test(html));
assert.ok(!html.includes('id="rs-ui-language"'),'Auto language dropdown must be gone');
assert.ok(['fi','en','ru'].every(lang=>html.includes('data-login-lang="'+lang+'"')));
assert.ok(style.indexOf('position:fixed!important;top:auto!important;bottom:0!important')>=0,
 'Bottom navigation should stay fixed to viewport');
assert.ok(style.indexOf('env(safe-area-inset-bottom')>=0,'Safe-area padding missing');
assert.ok(style.indexOf('padding-bottom:calc(135px')>=0,'Body content must clear bottom nav');
assert.strictEqual(get('data-public.js'),fs.readFileSync(path.join(base,'data.js'),'utf8'),
 'Public catalog copy must match production published FI/RU/EN terms');
assert.ok(!get('app.js').includes('serviceWorker.register'),'No SW registration in demo');
assert.ok(!get('i18n.js').includes("var KEY='sanastoyhteiso_legal_language'"));
assert.ok(!get('i18n.js').includes("var MODE_KEY='sanastoyhteiso_language_mode'"));
const dom=new JSDOM(html,{url:'https://test.example.invalid/v3-classic/',
 runScripts:'outside-only'});
const w=dom.window,doc=w.document;
w.scrollTo=()=>{};
w.fetch=()=>{throw Error('No network allowed');};
w.XMLHttpRequest=function(){throw Error('No XHR allowed');};
const scriptData=scripts.map(name=>get(name.split('?')[0]));
scriptData.forEach((source,i)=>w.eval(source+'\n//# sourceURL='+scripts[i]));
doc.dispatchEvent(new w.Event('DOMContentLoaded'));
function click(selector){const el=doc.querySelector(selector);assert.ok(el,'Missing '+selector);el.click();return el;}
function view(name){click('.mobile-nav [data-view="'+name+'"]');assert.ok(doc.getElementById('main-content').textContent.length>15);}
async function run(){
 await new Promise(r=>setTimeout(r,10));
 assert.ok(doc.querySelector('.flashcard'),'Preserved cards view missing');
 assert.equal(w.RS_DATA.terms.length,1296);
 assert.equal(w.RS_MED_GUIDE.stats().samples,183);
 assert.equal(w.RS_MED_GUIDE.groups.length,5,'Five Mediatri heading groups from screenshots');
 assert.equal(w.RS_MED_GUIDE.stats().instruments>30,true);
 assert.equal(w.localStorage.length,0,'No real or dummy writes on initial load');
 view('mediatri');
 assert.ok(doc.getElementById('main-content').textContent.includes('Помощник записи'));
 assert.ok(doc.getElementById('rs-med-shift'),'Missing shift dropdown');
 assert.ok(doc.getElementById('rs-med-heading'),'Missing heading dropdown');
 assert.ok(doc.getElementById('rs-med-guide-results').textContent.length>60);
 const heading=doc.getElementById('rs-med-heading');
 heading.value='Fyys.toim.kyky';heading.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.ok(doc.getElementById('rs-med-guide-results').textContent.includes('rollaattor'));
 const shift=doc.getElementById('rs-med-shift');
 shift.value='night';shift.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.equal(shift.value,'night');
 click('[data-action="med-mode"][data-value="phrases"]');
 assert.ok(doc.querySelectorAll('.rs-med-fold').length>10,'Phrases must be grouped rather than one long list');
 assert.ok(w.RS_DATA.mediatri.some(x=>x.cat==='Aamutoimet'));
 assert.ok(doc.getElementById('rs-med-phrase-results').textContent.length>1000,
  'Original categorized morning-care phrases must remain available after localization');
 click('[data-action="med-mode"][data-value="headings"]');
 assert.ok(doc.getElementById('main-content').textContent.includes('MNA'));
 assert.ok(doc.getElementById('main-content').textContent.includes('BRADEN'));
 assert.ok(doc.getElementById('main-content').textContent.includes('Vuorohoito')===false,
   'Current reference lists heading labels, not redundant group entries');
 click('[data-action="med-mode"][data-value="situations"]');
 assert.ok(doc.getElementById('main-content').textContent.includes('Ситуация'));
 click('[data-action="med-mode"][data-value="draft"]');
 assert.ok(doc.getElementById('draft-input'),'Old word selection must remain available');
 click('[data-action="med-mode"][data-value="guide"]');
 assert.ok(doc.getElementById('rs-med-heading'));
 click('[data-login-lang="fi"]');
 await new Promise(r=>setTimeout(r,10));
 assert.equal(w.RS_I18N.getLanguage(),'fi');
 assert.equal(doc.querySelector('[data-login-lang="fi"]').getAttribute('aria-pressed'),'true');
 click('[data-login-lang="en"]');
 await new Promise(r=>setTimeout(r,10));
 assert.equal(w.RS_I18N.getLanguage(),'en');
 assert.equal(doc.querySelector('[data-login-lang="en"]').getAttribute('aria-pressed'),'true');
 click('[data-login-lang="ru"]');
 await new Promise(r=>setTimeout(r,10));
 assert.equal(w.RS_I18N.getLanguage(),'ru');
 view('backup');
 assert.ok(doc.querySelector('.rs-admin-grid'),'Admin preview must appear inside existing Data view');
 assert.ok(doc.getElementById('main-content').textContent.includes('вымышлены'));
 assert.ok(!doc.querySelector('#backup-file'),'No real backup file import in isolated demo');
 view('cards');
 const id=doc.querySelector('.flash-top span').textContent.trim();
 click('[data-action="flip"]');click('[data-action="mark-good"]');
 const keys=Object.keys(w.localStorage);
 assert.ok(keys.every(k=>/^rs_v3_classic_/.test(k)),
  'Never use production account or preference localStorage keys: '+keys.join(','));
 const progress=JSON.parse(w.localStorage.getItem('rs_v3_classic_synthetic_only__rs_scores_v1'));
 assert.equal(progress[id].correct,1);
 assert.equal(progress[id].seen,1);
 console.log('PASS: original classic design, 1296-term public catalog, FI/EN/RU, Mediatri guide, 5 source groups, bottom mobile nav, fake admin and synthetic progress');
 w.close();
}
run().catch(e=>{w.close();console.error(e);process.exit(1);});
