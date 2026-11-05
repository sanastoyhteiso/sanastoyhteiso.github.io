'use strict';
// RUN-035 — synthetic offline-only integrity checks. No network, no API keys,
// no real student data and no Drive/Sheets writes; hash != authenticity.
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const crypto=require('node:crypto').webcrypto;
const codec=require('../v3-backup-codec.js');
const sha=require('../v3-sync-sha256.js');
const clone=x=>JSON.parse(JSON.stringify(x));
const uid='synthetic-owner',snapshotId='safe-snapshot-20261105',createdAt=1793000000000;
const word='W_'+'c'.repeat(32);
const state={
  scores:{T00001:{correct:1,wrong:0,seen:1,learned:true},P00055:{correct:0,wrong:1,seen:1}},
  words:{[word]:{id:word,fi:'peseytyminen',ru:'умывание',en:'washing'}},
  favorites:{T00001:true},finds:{T00001:{added:true,topic:'study',note:'harjoitus',updatedAt:createdAt}}
};
const options={uid,snapshotId,createdAt,state};
async function fail(rows,manifest,expectedUid=uid,expectedId=snapshotId,pattern=/Backup|Snapshot|Invalid|mismatch/){
  await assert.rejects(codec.readBack(rows,manifest,expectedUid,expectedId,sha,crypto),pattern);
}
async function run(){
  new vm.Script(fs.readFileSync('v3-backup-codec.js','utf8'));
  const original=clone(state);
  const packed=await codec.create(options,sha,crypto);
  assert.equal(packed.manifest.scope,'v3-shadow-state-only');
  assert.equal(packed.manifest.complete,false);
  assert.equal(packed.manifest.restoreTested,false);
  assert.equal(packed.manifest.writeMode,'PRIVATE_RAW_APPEND_ONLY');
  assert.equal(packed.manifest.rowCount,5);
  assert.equal(packed.manifest.sections.scores,2);
  assert.match(packed.manifest.sha256,/^[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(state),JSON.stringify(original));
  const result=await codec.readBack(packed.rows,packed.manifest,uid,snapshotId,sha,crypto);
  assert.equal(result.ok,true);
  assert.equal(result.verifiedOffline,true);
  assert.equal(result.liveSheetsVerified,false);
  assert.equal(result.canAutomaticallyRestore,false);
  assert.deepEqual(JSON.parse(JSON.stringify(result.state)),original);
  // Order-independent deterministic fingerprint (not authenticated signature).
  const again=await codec.create(options,sha,crypto);
  assert.equal(again.manifest.sha256,packed.manifest.sha256);
  await fail(packed.rows,packed.manifest,'other-owner',snapshotId,/wrong owner/);
  await fail(packed.rows,packed.manifest,uid,'different-snapshot',/wrong owner/);
  await fail(packed.rows.slice(0,-1),packed.manifest,uid,snapshotId,/incomplete/);
  const duplicate=clone(packed.rows);
  duplicate[2]=clone(duplicate[1]);
  await fail(duplicate,packed.manifest,uid,snapshotId,/Duplicate/);
  const corrupted=clone(packed.rows);
  corrupted[1][3]=JSON.stringify({correct:999,wrong:0,seen:999});
  await fail(corrupted,packed.manifest,uid,snapshotId,/SHA-256 mismatch/);
  const wrongSection=clone(packed.rows);
  wrongSection[1][1]='admin_users';
  await fail(wrongSection,packed.manifest);
  const formula=clone(packed.rows);
  formula[1][3]='=IMPORTXML("https://untrusted.example")';
  await fail(formula,packed.manifest,uid,snapshotId,/Invalid backup JSON/);
  const poisoned=clone(packed.rows);
  poisoned[1][2]='__proto__';
  await fail(poisoned,packed.manifest);
  await assert.rejects(codec.create({uid,snapshotId,createdAt,
    state:{scores:{},words:{},favorites:{}}},sha,crypto),/Incomplete V3/);
  await assert.rejects(codec.create({uid,snapshotId,createdAt,
    state:{scores:{'../bad':{}},words:{},favorites:{},finds:{}}},sha,crypto),/Invalid backup record key/);
  const badHash=clone(packed.manifest);
  badHash.sha256='a'.repeat(64);
  await fail(packed.rows,badHash,uid,snapshotId,/SHA-256 mismatch/);
  await assert.rejects(codec.create(options,sha,{}),/Secure SHA-256 required/);
  console.log('PASS RUN-035: synthetic private rows / SHA-256 / UID / Unicode / corruption / no automatic restore');
}
run().catch(err=>{console.error(err);process.exitCode=1;});
