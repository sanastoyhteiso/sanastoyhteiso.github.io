'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const mod=require('../admin/ops/grant-prod-admin-owner.cjs');
const owner={uid:'synthetic-uid',email:'owner@example.invalid',disabled:false,
  emailVerified:true,providerData:[{providerId:'google.com'}],
  customClaims:{teacher:true,nested:{enabled:true},admin:false}};
test('production project pinned and dry-run is only default',()=>{
  assert.equal(mod.PROJECT,'riveria-sanasto-community-test');
  assert.equal(mod.mode([]),'dry-run');
  assert.equal(mod.mode(['--dry-run']),'dry-run');
  assert.equal(mod.mode(['--apply']),'apply');
  assert.throws(()=>mod.mode(['--apply','--dry-run']));
  assert.throws(()=>mod.mode(['--force']));
});
test('claims preserve preexisting roles, no mutation',()=>{
  const old=structuredClone(owner.customClaims);
  const next=mod.preserveClaims(owner.customClaims);
  assert.equal(next.admin,true);
  assert.equal(next.teacher,true);
  assert.deepEqual(next.nested,{enabled:true});
  assert.deepEqual(owner.customClaims,old);
});
test('only verified enabled active Google identity eligible',()=>{
  assert.equal(mod.eligible(owner,owner.email),true);
  assert.equal(mod.eligible({...owner,emailVerified:false},owner.email),false);
  assert.equal(mod.eligible({...owner,disabled:true},owner.email),false);
  assert.equal(mod.eligible({...owner,providerData:[{providerId:'password'}]},owner.email),false);
  assert.equal(mod.eligible(owner,'other@example.invalid'),false);
});
test('prewrite re-read rejects changed identity and nested claims',()=>{
  assert.equal(mod.snapshotMatches(owner,structuredClone(owner),owner.email),true);
  assert.equal(mod.snapshotMatches(owner,{...owner,uid:'different'},owner.email),false);
  assert.equal(mod.snapshotMatches(owner,{...owner,customClaims:{...owner.customClaims,nested:{enabled:false}}},owner.email),false);
});
test('write API exists only inside interactive apply code path',()=>{
  const code=fs.readFileSync(require.resolve('../admin/ops/grant-prod-admin-owner.cjs'),'utf8');
  assert.ok(code.includes("if (runMode === 'apply' && !process.stdin.isTTY)"));
  assert.ok(code.indexOf("if (!(await promptConfirm()))") <
    code.indexOf("await auth.setCustomUserClaims("));
  assert.ok(code.indexOf("snapshotMatches(record, fresh, active)") <
    code.indexOf("await auth.setCustomUserClaims("));
  assert.ok(code.indexOf("savePrivateBackup(fresh)") <
    code.indexOf("await auth.setCustomUserClaims("));
  assert.ok(!code.includes('createUser('));
  assert.ok(!code.includes('deleteUser('));
});
