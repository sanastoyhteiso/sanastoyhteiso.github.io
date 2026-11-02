/* Unit tests for read-only diagnostic; no Google/Firebase network or credentials. */
'use strict';
const assert=require('assert');
const Diag=require('../rs-firestore-diagnostics.js');
const projectId='demo-sanastoyhteiso';
async function run(){
  let uid='owner',methods=[],urls=[],count=0;
  const make=(replyFn,getToken)=>Diag.create({
    projectId,activeUid:()=>uid,getToken:getToken||async()=>'synthetic-id-token',
    request:async(method,url,body,token)=>{
      methods.push(method);urls.push(url);count++;
      assert.strictEqual(method,'GET');
      assert.strictEqual(body,null);
      assert.strictEqual(token,'synthetic-id-token');
      assert.ok(url.startsWith('https://firestore.googleapis.com/v1/projects/demo-sanastoyhteiso/'));
      return{status:replyFn(url,count),body:{private:'MUST NEVER LEAK'}};
    }
  });
  let a=await make((url,n)=>[200,404,403][n-1]).run();
  assert.equal(a.ok,true);assert.equal(a.stage,'done');assert.equal(a.checks.length,3);
  assert.equal(a.checks[1].status,404);
  assert.deepEqual(methods,['GET','GET','GET']);
  assert.equal(/MUST NEVER LEAK|synthetic-id-token/.test(JSON.stringify(a)),false);
  methods=[];urls=[];count=0;
  a=await make((url,n)=>[200,403,403][n-1]).run();
  assert.equal(a.ok,false);assert.equal(a.stage,'rules');
  assert.equal(a.checks.length,2);assert.equal(count,2); // fail closed
  methods=[];urls=[];count=0;
  a=await make((url,n)=>[200,404,404][n-1]).run();
  assert.equal(a.ok,false);assert.equal(a.checks[2].pass,false);
  methods=[];urls=[];count=0;
  a=await make((url,n)=>[200,200,403][n-1]).run();
  assert.equal(a.ok,true);assert.equal(a.checks[1].note.indexOf('существует')>=0,true);
  methods=[];urls=[];count=0;
  uid='';
  a=await make(()=>200).run();
  assert.equal(a.ok,false);assert.equal(a.stage,'auth');assert.equal(count,0);
  uid='owner';
  a=await make(()=>200,async()=>{uid='changed';return 'synthetic-id-token';}).run();
  assert.equal(a.ok,false);assert.equal(a.message,'Account changed');assert.equal(count,0);
  uid='owner';
  a=await make(()=>200,async()=>{throw Error('token invalid');}).run();
  assert.equal(a.ok,false);assert.equal(a.message,'Firebase authentication is unavailable');
  assert.equal(count,0);
  assert.ok(urls.every(x=>!x.includes('personal-email')));
  console.log('PASS: read-only checks, missing baseline, strangers, failed auth, no token leakage');
}
run().catch(e=>{console.error(e);process.exit(1);});
