/* RUN161 – private exam cloud sync prototype, not enabled in production until
 * OWNER APPROVES published Firestore Rules for mock_exam_progress_v1/{uid}.
 * Firebase 8 compat SDK, authenticated, per-UID, transaction-based.
 * Do not access legacy learning scores, account profiles or sync_v3.
 * ES5 / Safari 12.
 */
(function(w){
 'use strict';
 var COL='mock_exam_progress_v1', MAX_SNAPSHOT=300000, MAX_AGE=1000*60*60*24*365;
 function fail(code){var e=new Error(code);e.code=code;return e;}
 function clone(x){return JSON.parse(JSON.stringify(x));}
 function id(){
  return 'A_'+Date.now().toString(16)+'_'+Math.floor(Math.random()*0x7fffffff).toString(16);
 }
 function count(x){return x&&x.run&&x.run.answers?x.run.answers.length:0;}
 function index(x){return x&&x.run&&typeof x.run.index==='number'?x.run.index:0;}
 function sameOrder(a,b){
  if(!a||!b||!a.run||!b.run)return false;
  if(a.run.direction!==b.run.direction||a.run.questions.length!==40||b.run.questions.length!==40)return false;
  for(var i=0;i<40;i++){
   if(a.run.questions[i].id!==b.run.questions[i].id)return false;
  }
  return true;
 }
 function commonPrefix(a,b){
  var aa=a.run.answers,bb=b.run.answers,n=Math.min(aa.length,bb.length);
  for(var j=0;j<n;j++){
   if(JSON.stringify(aa[j])!==JSON.stringify(bb[j]))return false;
  }
  return true;
 }
 function choose(local,cloud){
  if(!local&&!cloud)return {kind:'empty'};
  if(local&&!cloud)return {kind:'upload',draft:local};
  if(!local&&cloud)return {kind:'download',draft:cloud};
  var l=count(local),c=count(cloud);
  // Empty local on a newly opened second device MUST NOT erase a progressed cloud exam.
  if(l===0&&c>0)return {kind:'download',draft:cloud};
  if(c===0&&l>0)return {kind:'upload',draft:local};
  if(!sameOrder(local,cloud)||!commonPrefix(local,cloud)){
   if(l===0&&c===0)return {kind:'download',draft:cloud};
   return {kind:'conflict',local:local,cloud:cloud};
  }
  if(l>c)return {kind:'upload',draft:local};
  if(c>l)return {kind:'download',draft:cloud};
  if(index(local)>index(cloud))return {kind:'upload',draft:local};
  if(index(cloud)>index(local))return {kind:'download',draft:cloud};
  return {kind:'equal',draft:cloud};
 }
 function validBase(d){
  return !!(d&&d.schema===1&&d.run&&d.run.questions&&d.run.questions.length===40&&
   d.run.answers&&d.run.answers.length<=40&&
   typeof d.run.index==='number'&&d.run.index>=0&&d.run.index<=40&&
   /^(fi-ru|ru-fi|fi-en|en-fi)$/.test(d.run.direction));
 }
 function ensureId(d){
  var x=clone(d);
  if(!x.attemptId||!/^A_[a-f0-9]+_[a-f0-9]+$/.test(x.attemptId))x.attemptId=id();
  return x;
 }
 function currentAuth(){
  var uid=w.RS_FAMILY&&w.RS_FAMILY.uid;
  if(!uid||!w.firebase||!w.firebase.auth||!w.firebase.firestore)throw fail('auth-required');
  var user=w.firebase.auth().currentUser;
  if(!user||user.uid!==uid)throw fail('auth-required');
  if(!user.emailVerified)throw fail('verify-email');
  if(w.navigator&&w.navigator.onLine===false)throw fail('offline');
  return {uid:uid,db:w.firebase.firestore()};
 }
 function cloudDocument(raw,valid){
  if(!raw||raw.schema!==1||typeof raw.snapshot!=='string'||raw.snapshot.length>MAX_SNAPSHOT)throw fail('cloud-invalid');
  var data;try{data=JSON.parse(raw.snapshot);}catch(e){throw fail('cloud-invalid');}
  if(!valid(data)||!validBase(data))throw fail('cloud-invalid');
  return data;
 }
 function serialize(draft,uid){
  var json=JSON.stringify(draft);
  if(json.length>MAX_SNAPSHOT)throw fail('snapshot-too-large');
  return {schema:1,ownerUid:uid,attemptId:draft.attemptId,updatedAt:Date.now(),
   answersCount:count(draft),position:index(draft),snapshot:json};
 }
 // The Firestore transaction is the sole cloud writer. It reads current server state
 // before any write; conflicting changed answer sequences are never auto-overwritten.
 function sync(local,validator){
  if(typeof validator!=='function')return Promise.reject(fail('validator-required'));
  var ctx;try{ctx=currentAuth();}catch(e){return Promise.reject(e);}
  if(local&&(!validator(local)||!validBase(local)))return Promise.reject(fail('local-invalid'));
  var candidate=local?ensureId(local):null,doc=ctx.db.collection(COL).doc(ctx.uid);
  return ctx.db.runTransaction(function(tx){
   return tx.get(doc).then(function(snapshot){
    var cloud=null;
    if(snapshot.exists)cloud=cloudDocument(snapshot.data(),validator);
    // With a new legacy local draft, assign stable attempt ID before first upload.
    var decision=choose(candidate,cloud);
    if(decision.kind==='upload'){
     var ready=ensureId(decision.draft);
     tx.set(doc,serialize(ready,ctx.uid));
     return {kind:'uploaded',draft:ready};
    }
    if(decision.kind==='download'||decision.kind==='equal')return {kind:decision.kind==='equal'?'synced':'downloaded',draft:decision.draft};
    if(decision.kind==='conflict')return {kind:'conflict',cloud:cloud,local:candidate};
    if(decision.kind==='empty')return {kind:'empty'};
    throw fail('sync-unexpected');
   });
  }).then(function(result){
   // Do not apply another account's transaction response after switching Firebase user.
   if(!w.RS_FAMILY||ctx.uid!==w.RS_FAMILY.uid)throw fail('account-changed');
   return result;
  });
 }
 w.RS_EXAM_CLOUD={choose:choose,sync:sync,validBase:validBase,ensureId:ensureId,
  collection:COL,count:count};
})(window);
