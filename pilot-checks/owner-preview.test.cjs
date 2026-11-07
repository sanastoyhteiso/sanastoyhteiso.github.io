'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const base=path.join(__dirname,'../v3-preview');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const html=read('index.html');
test('owner pilot gate has strict PROD project, origin, verified Google provider and admin claim',()=>{
  assert.match(html,/riveria-sanasto-community-test/);
  assert.match(html,/sanastoyhteiso\.github\.io/);
  assert.match(html,/providerId==='google\.com'/);
  assert.match(html,/t\.claims\.admin===true/);
  assert.match(html,/getIdTokenResult\(true\)/);
  assert.match(html,/<button id="pilot-start"[^>]*disabled/);
  assert.match(html,/!consent\.checked/);
});
test('whole V3 shell is held behind explicit owner click and second token check',()=>{
  const second=html.indexOf('authorized.getIdTokenResult(true)');
  const load=html.indexOf('d.write(candidate)');
  assert.ok(second>=0&&load>second);
  assert.match(html,/if\(!authorized\|\|!consent\.checked/);
  assert.match(html,/До проверки резервной копии/);
  assert.doesNotMatch(html,/AUTO_START_PILOT/);
});
test('copied release HTML embeds full UI and V3 modules, no demo-only script',()=>{
  const m=html.match(/var candidate=("(?:\\.|[^"\\])*");/);
  assert.ok(m,'release HTML literal missing');
  const candidate=JSON.parse(m[1]);
  for(const x of ['v3-sync-release.js','v3-sync-shadow.js','v3-mediatri-guide.js',
      'family.js','community.js','admin-entry.js','i18n.js','data.js'])
    assert.ok(candidate.includes(x),'missing '+x);
  assert.ok(candidate.includes('rs-lang-switch'));
});
test('all listed local pilot resources exist and no root asset is replaced',()=>{
  const files=['i18n.js','admin-entry.js','about.html','privacy.html','terms.html',
    'app.js','style.css','data.js','config.js','study-diagnostics.js','family.js',
    'community.js','mobile-nav.js','home-refresh.js','account-settings.js',
    'ipad-selects.js','ipad-selects.css','v3-mediatri-guide.js','v3-sync-core.js',
    'v3-sync-shadow.js','v3-sync-engine.js','v3-sync-pages.js',
    'v3-sync-finds.js','v3-sync-sha256.js','v3-sync-diff.js',
    'v3-sync-release.js','admin/index.html','admin/admin-page.js',
    'manifest.webmanifest','icon-192.png','icon-512.png','sw.js'];
  for(const x of files)assert.ok(fs.existsSync(path.join(base,x)),x);
});
test('pilot worker never deletes root cache and stays under its own scope',()=>{
  const sw=read('sw.js');
  assert.match(sw,/sanasto-v3-ownerpilot-20261107-1/);
  assert.match(sw,/k\.indexOf\('sanasto-v3-ownerpilot-'\)===0/);
  assert.doesNotMatch(sw,/k\.indexOf\('riveria-sanasto-community-'\)===0/);
  assert.doesNotMatch(sw,/navigator\.serviceWorker\.register\('\/sw\.js'\)/);
  const manifest=JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.scope,'./');
  assert.equal(manifest.start_url,'./index.html');
});
