/* Pure offline safety check. No network, Firebase SDK or real account. */
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),acorn=require('acorn');
const source=fs.readFileSync(path.join(__dirname,'../backend/v3-staging-project-guard.js'),'utf8');
acorn.parse(source,{ecmaVersion:5});
const guard=require('../backend/v3-staging-project-guard.js');
const goodId='sanastoyhteiso-v3-development';
const valid=()=>({
 site:{origin:'https://velardream-ctrl.github.io',
       pathname:'/riveria-sanasto-community-test/v3-classic/'},
 expectedProjectId:goodId,
 productionProjectId:'riveria-sanasto-community-test',
 firebase:{projectId:goodId,authDomain:goodId+'.firebaseapp.com',
   apiKey:'AIza'+'0'.repeat(35)}
});
assert.equal(guard.validate(valid()).isolated,true);
function rejected(change){
 const v=valid();change(v);
 assert.throws(()=>guard.validate(v),/Firebase|project|test|staging|allowed|existing|dedicated|exact|origin|path/i);
}
rejected(v=>v.firebase.projectId='riveria-sanasto-community-test');
rejected(v=>{v.firebase.projectId='riveria-sanasto-community-test';v.expectedProjectId=v.firebase.projectId});
rejected(v=>v.site.origin='https://sanastoyhteiso.github.io');
rejected(v=>v.site.pathname='/riveria-sanasto-community-test/');
rejected(v=>v.site.pathname='/riveria-sanasto-community-test/v3/');
rejected(v=>v.site.pathname='/another-repo/v3-classic/');
rejected(v=>v.firebase.authDomain='riveria-sanasto-community-test.firebaseapp.com');
rejected(v=>v.expectedProjectId='sanastoyhteiso-v3-different');
rejected(v=>v.firebase.apiKey='not-a-key');
rejected(v=>{v.productionProjectId=goodId;});
rejected(v=>{v.firebase.projectId='any-random-project';v.expectedProjectId='any-random-project';v.firebase.authDomain='any-random-project.firebaseapp.com';});
const live=fs.readFileSync(path.join(__dirname,'../../config.js'),'utf8');
const match=live.match(/projectId:\s*["']([^"']+)["']/);
assert.ok(match,'Published Firebase configuration should have an identifiable project ID');
assert.ok(guard.liveProjectIds.includes(match[1]),'Safety guard must deny the actual published Firebase project');
console.log('PASS: v3 staging guard denies published Firebase ID, wrong origin, unsafe configuration');
