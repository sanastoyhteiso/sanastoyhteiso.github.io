/* iOS12 iPad styled selects: large options, dynamic rendering and native change contract.
 * JSDOM semantic regression, not a physical iPad or visual-screenshot test.
 */
'use strict';
const assert=require('assert'),fs=require('fs'),acorn=require('acorn');
const {JSDOM}=require('jsdom');
const src=fs.readFileSync('staging/classic/ipad-selects.js','utf8');
const css=fs.readFileSync('staging/classic/ipad-selects.css','utf8');
acorn.parse(src,{ecmaVersion:5});
assert.match(css,/font-size:19px/);
assert.match(css,/min-height:52px/);
assert.match(css,/z-index:10002/);
const dom=new JSDOM('<!doctype html><html><body>'+
 '<label for="topic">Тема</label><select id="topic" name="topic" class="control">'+
 '<option value="hoito">Hoito</option><option value="aamu">Aamutoimet</option></select>'+
 '<form id="form"><select name="category"><option value="practice">Практика</option>'+
 '<option value="study">Учёба</option></select></form>'+
 '</body></html>',{url:'https://example.invalid/test',runScripts:'outside-only'});
const w=dom.window,d=w.document;
Object.defineProperty(w.navigator,'userAgent',{configurable:true,value:'Mozilla/5.0 (iPad; CPU OS 12_5_7 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1'});
w.eval(src);
d.dispatchEvent(new w.Event('DOMContentLoaded'));
assert.equal(w.RS_IPAD_SELECTS.detect('Mozilla/5.0 (iPhone; CPU iPhone OS 12_5 like Mac OS X)'),false);
assert.equal(w.RS_IPAD_SELECTS.detect('Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)'),false);
assert.equal(w.RS_IPAD_SELECTS.detect('Mozilla/5.0 (iPad; CPU OS 12_5_7 like Mac OS X)'),true);
assert.equal(d.querySelectorAll('.rs-ipad-select-trigger').length,2);
const select=d.getElementById('topic'),button=select._rsIpadButton;
assert.equal(select.name,'topic');assert.equal(select.value,'hoito');
assert.equal(button.getAttribute('aria-expanded'),'false');
let changes=0;d.addEventListener('change',e=>{if(e.target===select)changes++;});
button.click();
assert.equal(button.getAttribute('aria-expanded'),'true');
const popup=d.querySelector('.rs-ipad-select-menu');
assert.ok(popup&&popup.textContent.includes('Aamutoimet'));
popup.querySelectorAll('button')[1].click();
assert.equal(select.value,'aamu');
assert.equal(changes,1,'Must dispatch ONE bubbling native change event');
assert.equal(button.getAttribute('aria-expanded'),'false');
assert.equal(button.textContent.includes('Aamutoimet'),true);
button.click();
d.querySelector('.rs-ipad-select-menu').querySelectorAll('button')[1].click();
assert.equal(changes,1,'Selecting same option does not duplicate a change event');
const form=d.getElementById('form');
assert.equal(form.elements.category.value,'practice','Existing form value not modified');
const dynamic=d.createElement('select');
dynamic.id='dynamic';
dynamic.innerHTML='<option value="fi">Suomi</option><option value="ru">Русский</option>';
d.body.appendChild(dynamic);
w.RS_IPAD_SELECTS.scan();
assert.ok(dynamic._rsIpadButton,'Dynamic select is enhanced after app rerender');
dynamic.value='ru';dynamic.dispatchEvent(new w.Event('change',{bubbles:true}));
assert.ok(dynamic._rsIpadButton.textContent.includes('Русский'));
const more=d.createElement('option');more.value='en';more.text='English';
dynamic.appendChild(more);w.RS_IPAD_SELECTS.scan();
dynamic._rsIpadButton.click();
assert.equal(d.querySelectorAll('.rs-ipad-select-menu .rs-ipad-choice').length,3);
d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',keyCode:27,bubbles:true}));
assert.equal(d.querySelectorAll('.rs-ipad-select-menu').length,0);
assert.equal(d.querySelectorAll('.rs-ipad-select-trigger').length,3,'No duplicate wrappers');
const newBrowser=new JSDOM('<html><body><select id="normal"><option>A</option></select></body></html>',{runScripts:'outside-only'});
Object.defineProperty(newBrowser.window.navigator,'userAgent',{value:'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',configurable:true});
newBrowser.window.eval(src);
newBrowser.window.document.dispatchEvent(new newBrowser.window.Event('DOMContentLoaded'));
assert.equal(newBrowser.window.document.querySelectorAll('.rs-ipad-select-trigger').length,0);
console.log('PASS: iOS12 iPad large native-compatible select replacement, dynamic selects, change events, keyboard and isolation');
