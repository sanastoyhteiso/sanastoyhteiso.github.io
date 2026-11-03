/* Admin preview security and FI/RU/EN rendering; no Firebase access. */
'use strict';
const assert=require('assert');
const Admin=require('../rs-admin-preview.js');
const metrics={registered:18,active7d:7,syncFailed24h:2,pendingKnown:1,
  backupAt:'2026-11-03',catalogVersion:'FI-RU-EN v3'};
function run(){
  assert.equal(Admin.isAdmin({admin:true}),true);
  assert.equal(Admin.isAdmin({admin:'true'}),false);
  assert.equal(Admin.render(null,metrics,'en'),'');
  assert.equal(Admin.render({admin:false},metrics,'ru'),'');
  assert.equal(Admin.render({admin:1},metrics,'fi'),'');
  const ru=Admin.render({admin:true},metrics,'ru');
  const fi=Admin.render({admin:true},metrics,'fi');
  const en=Admin.render({admin:true},metrics,'en');
  assert.ok(ru.includes('Зарегистрированные пользователи'));
  assert.ok(fi.includes('Rekisteröityneet käyttäjät'));
  assert.ok(en.includes('Registered users'));
  assert.ok(fi.includes('Yhteisen sanaston versio'));
  assert.ok(en.includes('Read-only safety mode'));
  assert.ok(ru.includes('2026-11-03'));
  assert.ok(!en.includes('email'),'No user lists or emails');
  const out=Admin.render({admin:true},
    {registered:null,active7d:undefined,backupAt:'<img src=x onerror=alert(1)>',
      catalogVersion:'<script>alert(1)</script>'},'en');
  assert.ok(out.includes('—'));
  assert.ok(!out.includes('<script>'));
  assert.ok(!out.includes('<img'));
  assert.ok(out.includes('&lt;script&gt;'));
  assert.equal((out.match(/rs-admin-tile/g)||[]).length,6);
  assert.equal(Admin.render({admin:true},metrics,'unknown').includes('Настройки сайта'),true);
  console.log('PASS: FI/RU/EN read-only admin preview, strict claim and XSS escaping');
}
run();
