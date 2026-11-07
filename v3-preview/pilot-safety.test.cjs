'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=n=>fs.readFileSync(path.join(__dirname,n),'utf8');
test('pilot contains approved local UI and is not the root application',()=>{
 const h=read('index.html');
 for(const v of ['v3-mediatri-guide.js','app.js','family.js','community.js','i18n.js','pilot-access.js'])
   assert.ok(h.includes('src="'+v+'?'),v+' missing');
 assert.match(h,/RS_V3_PILOT_READ_ONLY=true/);
 assert.match(h,/rs-v3-pilot-locked/);
 assert.match(h,/noindex,nofollow,noarchive/);
 assert.doesNotMatch(h,/src="v3-sync-release.js/);
 assert.doesNotMatch(h,/src="home-refresh.js/);
 assert.doesNotMatch(h,/src="account-settings.js/);
});
test('local learning results are not written to shared legacy namespace',()=>{
 const f=read('family.js');
 assert.match(f,/KEY='rs_v3_pilot_auth_v1', PREFIX='rs_v3_pilot_family_v1_'/);
 assert.doesNotMatch(f,/KEY='rs_family_auth_v1', PREFIX='rs_family_v1_'/);
 assert.match(f,/function migrate\(\)\{if\(window.RS_V3_PILOT_READ_ONLY\)/);
});
test('Cloud and Google Drive writes disabled, read-only pilot allows local practice',()=>{
 const f=read('family.js'),c=read('community.js');
 assert.match(f,/function schedule\(\)\{if\(window.RS_V3_PILOT_READ_ONLY\)return;/);
 assert.match(f,/function sync\(\)\{if\(window.RS_V3_PILOT_READ_ONLY\)return Promise\.resolve\(false\)/);
 assert.match(c,/function call\(method,url,body,token\)\{if\(window.RS_V3_PILOT_READ_ONLY&&method!=='GET'\)/);
 assert.match(c,/function connectDrive\(\)\{if\(window.RS_V3_PILOT_READ_ONLY\)/);
 assert.match(c,/function sync\(\)\{if\(window.RS_V3_PILOT_READ_ONLY\)return Promise\.resolve\(false\)/);
 assert.match(c,/function onLocalChange\(\)\{if\(window.RS_V3_PILOT_READ_ONLY\)return;/);
});
test('owner gate validates strict admin claim but is not server-side security',()=>{
 const code=read('pilot-access.js');
 assert.match(code,/claims\.admin===true/);
 assert.match(code,/getIdTokenResult\(true\)/);
 assert.match(code,/not a server-side security boundary/);
 assert.doesNotMatch(code,/setCustomUserClaims|\.set\(|\.delete\(/);
});
test('pilot worker never modifies or evicts the production root cache',()=>{
 const sw=read('sw.js');
 assert.doesNotMatch(sw,/caches\.|fetch\(|addEventListener\(['"]fetch|CACHE_NAME/);
 const manifest=JSON.parse(read('manifest.webmanifest'));
 assert.equal(manifest.scope,'./');
 assert.equal(manifest.start_url,'./index.html');
});
