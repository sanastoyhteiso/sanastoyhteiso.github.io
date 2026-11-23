'use strict';
/* Regression for the iOS 26+ WebKit bottom-fixed toolbar drift.
   Synthetic viewport: no user data, Firebase, internet, or physical-device claim. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const src=fs.readFileSync(path.resolve(__dirname,'../mobile-nav.js'),'utf8');
const html='<!doctype html><html><body><nav class="mobile-nav">'+
 '<button id="mobile-nav-prev">prev</button>'+
 '<div id="mobile-nav-scroll"><button class="mobile-item active" data-view="cards">Cards</button></div>'+
 '<button id="mobile-nav-next">next</button></nav></body></html>';
function wait(){return new Promise(function(resolve){setTimeout(resolve,70);});}
function setup(userAgent,visual){
 const dom=new JSDOM(html,{url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document,nav=d.querySelector('.mobile-nav');
 Object.defineProperty(w.navigator,'userAgent',{configurable:true,value:userAgent});
 Object.defineProperty(w,'innerWidth',{configurable:true,writable:true,value:390});
 Object.defineProperty(nav,'offsetHeight',{configurable:true,get:function(){return 64;}});
 if(visual){
  const vv=new w.EventTarget();
  vv.offsetTop=0;vv.height=640;
  Object.defineProperty(w,'visualViewport',{configurable:true,value:vv});
 }
 w.eval(src);
 d.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
 return {dom:dom,w:w,nav:nav,vv:w.visualViewport};
}
test('iPhone bottom navigation follows visual viewport when scrolling and resizing',async function(){
 const b=setup('Mozilla/5.0 (iPhone; CPU iPhone OS 27_2 like Mac OS X)',true);
 try{
  await wait();
  assert.equal(b.nav.style.bottom,'auto');
  assert.equal(b.nav.style.top,'576px');
  b.vv.offsetTop=20;b.vv.height=580;
  b.vv.dispatchEvent(new b.w.Event('scroll'));
  await wait();
  assert.equal(b.nav.style.top,'536px');
  b.w.innerWidth=1000;
  b.w.dispatchEvent(new b.w.Event('resize'));
  await wait();
  assert.equal(b.nav.style.top,'');
  assert.equal(b.nav.style.bottom,'');
 }finally{b.dom.window.close();}
});
test('Android keeps native fixed-bottom CSS unchanged',async function(){
 const b=setup('Mozilla/5.0 (Linux; Android 16; Pixel 9)',true);
 try{
  await wait();
  assert.equal(b.nav.style.top,'');
  assert.equal(b.nav.style.bottom,'');
 }finally{b.dom.window.close();}
});
test('old iPhone without visualViewport keeps CSS fallback',async function(){
 const b=setup('Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X)',false);
 try{
  await wait();
  assert.equal(b.nav.style.top,'');
  assert.equal(b.nav.style.bottom,'');
 }finally{b.dom.window.close();}
});
