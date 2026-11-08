'use strict';
const assert=require('assert'),fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('index.html','utf8'),app=fs.readFileSync('app.js','utf8');
const config=fs.readFileSync('config.js','utf8'),ipad=fs.readFileSync('ipad-selects.js','utf8');
const style=fs.readFileSync('ipad-selects.css','utf8');
assert.ok(config.includes('riveria-sanasto-community-test'));
assert.ok(!config.includes('sanastoyhteiso-v3-development'));
assert.ok(html.includes('ipad-selects.css?v=ipad12-readable-1'));
assert.ok(html.includes('ipad-selects.js?v=ipad12-readable-1'));
assert.ok(html.includes('family.js?v=3.0.0-rc1'));
assert.ok(html.includes('community.js?v=3.0.0-v3stats1'));
assert.ok(html.includes('app.js?v=latin-all-run164-v1'));
assert.ok(app.includes('var originalFi=String(answer).trim()===String(x.answer).trim()?'));
assert.ok(style.includes('font-size:19px')&&style.includes('min-height:52px'));
assert.ok(ipad.includes('rs-ipad-select-trigger')&&ipad.includes('select.dispatchEvent(event)'));
assert.ok(!html.includes('v3-classic/auth-pilot/study-v3.html'));
assert.ok(html.includes('v3-mediatri-guide.js'));
new vm.Script(fs.readFileSync('v3-mediatri-guide.js','utf8'));
assert.ok(!html.includes('TEST 3.0 / Тестовая копия'));
for(const file of ['app.js','ipad-selects.js'])new vm.Script(fs.readFileSync(file,'utf8'));
const sw=fs.readFileSync('sw.js','utf8');
assert.ok(sw.includes('v3-mediatri-guide.js'));
assert.ok(sw.includes('riveria-sanasto-community-v3.0.0-rc32'));
assert.ok(html.includes('v3-sync-diff.js?v=release-preview-2'));
assert.ok(sw.includes('v3-sync-diff.js?v=release-preview-2'));
assert.ok(html.includes('v3-sync-shadow.js?v=release-preview-3'));
assert.ok(sw.includes('v3-sync-shadow.js?v=release-preview-3'));
for(const name of ['v3-sync-core.js','v3-sync-shadow.js','v3-sync-engine.js',
 'v3-sync-pages.js','v3-sync-finds.js','v3-sync-sha256.js',
 'v3-sync-diff.js','v3-sync-release.js']){
 assert.ok(html.includes(name),'Missing unified script '+name);
 assert.ok(sw.includes(name),'Offline cache missing '+name);
 new vm.Script(fs.readFileSync(name,'utf8'));
}
const family=fs.readFileSync('family.js','utf8'),community=fs.readFileSync('community.js','utf8');
assert.ok(family.includes('getState:getState,putState:putState'));
assert.ok(community.includes('Legacy Drive cannot overwrite active V3'));
assert.ok(html.includes('firebase-firestore.js'));
assert.ok(html.includes('id="v3-release-bar"'));
assert.ok(!html.includes('sanastoyhteiso-v3-development'));
console.log('PASS: release unified UI, current Auth, shadow, old Drive protection and SW version');
