'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');

const source=fs.readFileSync('about.html','utf8');
const dom=new JSDOM(source);
const page=dom.window.document;
const words={
 en:['Getting started: turn on dictionaries','Only my words','My words + Riveria library','Data','Show words','Find dictionaries','Connect','Refresh subscriptions'],
 fi:['Aloittaminen: sanastojen käyttöönotto','Vain omat sanat','Omat sanat + Riveria-kirjasto','Tiedot','Näytä sanat','Etsi sanastoja','Liitä','Päivitä tilaukset'],
 ru:['С чего начать: как включить словари','Только мой личный словарь','Мой словарь + библиотека Riveria','Данные','Показывать слова','Найти словари','Подключить','Обновить подписки']
};
test('each FI/EN/RU about-language panel has usable first-login instructions and exact existing UI labels',()=>{
 const panels=page.querySelectorAll('main.page > section[data-language]');
 assert.equal(panels.length,3);
 for(const language of ['fi','en','ru']){
   const section=page.querySelector('section[data-language="'+language+'"]');
   assert.ok(section,language);
   const guide=section.querySelector('#getting-started-'+language);
   assert.ok(guide,language+' guide missing');
   assert.equal(section.querySelectorAll('ol > li').length,4,language+' guide must give four steps');
   const body=section.textContent;
   for(const phrase of words[language])assert.ok(body.includes(phrase),language+' guide missing: '+phrase);
   assert.ok(section.querySelector('a[href="index.html"]'),'return to app must work: '+language);
 }
});
test('guide separates built-in Riveria library from optional shared dictionaries and Drive, without changing user scope',()=>{
 for(const lang of ['ru','en','fi']){
   const text=page.querySelector('section[data-language="'+lang+'"]').textContent;
   assert.match(text,/(Riveria|Риверия)/);
   assert.match(text,/Google Drive/);
 }
 const family=fs.readFileSync('family.js','utf8');
 const app=fs.readFileSync('app.js','utf8');
 assert.ok(family.includes("scope:{value:'mine',updatedAt:0}"),'scope defaults remain user-controlled');
 assert.ok(app.includes("id=\"family-scope\""),'existing settings must remain in real app');
 assert.ok(app.includes("value=\"all\""),'Riveria option remains user-controlled');
 const html=fs.readFileSync('index.html','utf8');
 assert.ok(html.includes('<a href="about.html">О проекте</a>'),'existing bottom About link remains intact');
});
test('offline/browser-compatible multilingual About page keeps existing language controls',()=>{
 assert.equal(page.querySelectorAll('[data-choose]').length,3);
 assert.equal(page.querySelectorAll('[data-rs-term-count]').length,3);
 assert.ok(source.includes("sanastoyhteiso_language_mode"),'follow same site language preference');
 assert.ok(!/onclick\s*=/.test(source),'no new inline event handlers');
 assert.ok(!/fetch\(|XMLHttpRequest|firebase\.initializeApp/.test(source),'guide must not make network calls or access accounts');
});
