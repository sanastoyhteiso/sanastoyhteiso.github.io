'use strict';
/* RUN144: verify the owner-confirmed Worker origin is the ONLY telemetry endpoint.
 * Explicit consent remains off for each fresh device/account. Offline static
 * checks only; not an authenticated Cloudflare/Firebase end-to-end claim. */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const worker='https://sanastoyhteiso-v3-telemetry.velardream.workers.dev';
test('production client points to the verified Cloudflare Workers HTTPS origin only',()=>{
 const sandbox={window:{}};
 vm.runInNewContext(fs.readFileSync('config.js','utf8'),sandbox);
 assert.equal(sandbox.window.RS_FIREBASE_CONFIG.projectId,'riveria-sanasto-community-test');
 assert.equal(sandbox.window.RS_TELEMETRY_CONFIG.enabled,true);
 assert.equal(sandbox.window.RS_TELEMETRY_CONFIG.endpoint,worker);
 assert.equal(Object.keys(sandbox.window.RS_TELEMETRY_CONFIG).sort().join(','),'enabled,endpoint');
 assert.equal(worker.endsWith('/'),false);
 assert.ok(!fs.readFileSync('config.js','utf8').includes('HASH_KEY'));
});
test('both root and admin use the same fresh config and cache revision',()=>{
 const html=fs.readFileSync('index.html','utf8');
 const admin=fs.readFileSync('admin/index.html','utf8');
 const sw=fs.readFileSync('sw.js','utf8');
 for(const src of [html,admin])assert.ok(src.includes('config.js?v=monitor-live-1'));
 assert.ok(sw.includes('config.js?v=monitor-live-1'));
 assert.ok(sw.includes('riveria-sanasto-community-v3.0.0-rc26'));
 assert.ok(html.includes('monitoring-client.js?v=run145-e2e-1'));
 assert.ok(admin.includes('monitoring-admin.js?v=run143-pilot-1'));
 assert.ok(!html.includes(worker));
 assert.ok(!admin.includes(worker));
});
test('fresh devices opt OUT, secret stays server-side, and signed admin is required',()=>{
 const client=fs.readFileSync('monitoring-client.js','utf8');
 const workerCode=fs.readFileSync('monitoring/worker/index.mjs','utf8');
 const admin=fs.readFileSync('admin/monitoring-admin.js','utf8');
 assert.ok(client.includes("getItem(PREFIX+x)==='yes'"));
 assert.ok(client.includes("setItem(PREFIX+who,'yes')"));
 assert.ok(client.includes("user.getIdToken(false)"));
 assert.ok(!client.includes('HASH_KEY'));
 assert.ok(workerCode.includes('user.admin'));
 assert.ok(workerCode.includes('verifyFirebase'));
 assert.ok(admin.includes('getIdToken(false)'));
});
