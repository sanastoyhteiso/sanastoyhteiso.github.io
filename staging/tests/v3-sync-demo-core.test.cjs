/* Offline two-device demo event regression; never accesses Firebase. */
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const acorn=require('acorn');
const p=path.join(__dirname,'../auth-pilot/sync-demo-core.js');
acorn.parse(fs.readFileSync(p,'utf8'),{ecmaVersion:5});
const x=require('../auth-pilot/sync-demo-core.js');
function store(){
 const data={};
 return {getItem:k=>Object.prototype.hasOwnProperty.call(data,k)?data[k]:null,
  setItem:(k,v)=>{data[k]=v;},raw:data};
}
const uid='alice',other='bob',deviceA='D_'+'a'.repeat(32),deviceB='D_'+'b'.repeat(32);
const rng=n=>Array.from({length:16},()=>n);
const a=x.newEvent(uid,deviceA,'DEMO_CARD_A',true,1793740000001,rng(1));
const b=x.newEvent(uid,deviceB,'DEMO_CARD_A',false,1793740000002,rng(2));
const c=x.newEvent(uid,deviceB,'DEMO_CARD_C',true,1793740000003,rng(3));
assert.equal(a.id,'P_'+'01'.repeat(16));
assert.equal(x.valid(a,uid),true);
assert.equal(x.valid(a,other),false);
assert.throws(()=>x.newEvent(uid,deviceA,'T00012',true,1,rng(4)));
assert.throws(()=>x.newEvent(uid,deviceA,'DEMO_CARD_A',true,1,new Array(16).fill(300)));
assert.equal(x.valid({...a,email:'private@example.invalid'},uid),false);
const localA=store(),localB=store();
x.append(localA,uid,a);
x.append(localB,uid,b);
x.append(localB,uid,c);
assert.deepEqual(x.load(localB,uid).length,2);
assert.equal(x.load(localA,other).length,0);
assert.throws(()=>x.append(localA,other,a),/Wrong account/);
let cloud=[];
let first=x.fold(uid,cloud,x.load(localA,uid));
assert.deepEqual([first.seen,first.correct,first.wrong,first.pending],[1,1,0,1]);
cloud.push(a);
let reply=x.fold(uid,cloud,x.load(localA,uid));
assert.deepEqual([reply.seen,reply.correct,reply.wrong,reply.pending],[1,1,0,0],
 'server + unacknowledged local duplicate must never count twice');
x.ack(localA,uid,a.id);
assert.equal(x.load(localA,uid).length,0);
cloud.push(b,c);
x.ack(localB,uid,b.id);x.ack(localB,uid,c.id);
const aView=x.fold(uid,cloud,x.load(localA,uid));
const bView=x.fold(uid,cloud,x.load(localB,uid));
assert.deepEqual([aView.seen,aView.correct,aView.wrong],[3,2,1]);
assert.deepEqual([bView.seen,bView.correct,bView.wrong],[3,2,1]);
assert.deepEqual(aView.byCard.DEMO_CARD_A,{seen:2,correct:1,wrong:1});
assert.throws(()=>x.fold(other,cloud,[]),/Unsafe/);
assert.throws(()=>x.fold(uid,[a,{...a,correct:false}],[]),/collision/);
assert.throws(()=>x.append(localA,uid,a) || x.append(localA,uid,a),/Duplicate/);
localB.setItem('RS_V3_DEMO_PENDING_'+uid,'{broken json');
assert.throws(()=>x.load(localB,uid),/damaged/);
x.clear(localA,uid);
assert.equal(x.fold(uid,[],x.load(localA,uid)).seen,0);
console.log('PASS: synthetic two-device event merge, offline queue, exact idempotency, account isolation and ES5');
