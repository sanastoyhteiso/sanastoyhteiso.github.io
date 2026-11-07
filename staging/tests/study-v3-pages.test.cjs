/* Exact boundary, missing and duplicated page regression. No real Firebase. */
'use strict';
const assert=require('assert'),fs=require('fs'),acorn=require('acorn');
const pages=require('../auth-pilot/study-v3-pages.js');
acorn.parse(fs.readFileSync('staging/auth-pilot/study-v3-pages.js','utf8'),{ecmaVersion:5});
const make=i=>({id:'E_'+i.toString(16).padStart(32,'0'),v:3,uid:'test',
  device:'D_'+'a'.repeat(32),kind:'answer',target:'T00001',time:1793800000000+i,
  data:{correct:true}});
async function collect(n){
 let calls=0,active=true;
 const docs=Array.from({length:n},(_,i)=>make(i+1));
 const client=pages.create({active:()=>active,fetchPage:async(cursor,limit)=>{
   calls++;
   assert.equal(limit,100);
   const offset=cursor==null?0:cursor;
   return {items:docs.slice(offset,offset+limit),cursor:Math.min(offset+limit,n)};
 }});
 const result=await client.list();
 assert.equal(result.length,n);return calls;
}
(async()=>{
 assert.equal(await collect(0),1);
 assert.equal(await collect(99),1);
 assert.equal(await collect(100),2,'full final page must be followed by empty fetch');
 assert.equal(await collect(101),2);
 assert.equal(await collect(500),6);
 assert.equal(await collect(512),6);
 assert.equal(await collect(1201),13);
 await assert.rejects(
   pages.create({active:()=>true,fetchPage:async()=>({items:[make(1),make(1)],cursor:2})}).list(),
   /Duplicate/);
 await assert.rejects(
   pages.create({active:()=>true,fetchPage:async()=>({items:[make(1)],cursor:null})}).list(),
   /Missing page cursor/);
 await assert.rejects(
   pages.create({active:()=>true,fetchPage:async()=>({items:Array.from({length:101},(_,i)=>make(i+1)),cursor:1})}).list(),
   /oversized/);
 let changed=true;
 await assert.rejects(pages.create({active:()=>changed,fetchPage:async()=>{
   changed=false;return {items:[make(1)],cursor:1};
 }}).list(),/account changed/);
 let repeated=Object.freeze({});
 await assert.rejects(pages.create({active:()=>true,fetchPage:async()=>({
   items:Array.from({length:100},(_,i)=>make(i+1)),cursor:repeated
 })}).list(),/Non-advancing/);
 let counter=0;
 await assert.rejects(pages.create({active:()=>true,fetchPage:async(c,limit)=>{
   const x=counter++;return {items:Array.from({length:limit},(_,i)=>make(x*limit+i+1)),cursor:x+1};
 }}).list(),/above safe cap/);
 assert.throws(()=>pages.create({active:()=>true,fetchPage:()=>{},pageSize:500}),/tested bounds/);
 console.log('PASS: V3 Firestore history safe ES5 pagination to 1201+, 100/500 limits, cursor and fail-closed tests');
})().catch(e=>{console.error(e);process.exitCode=1;});
