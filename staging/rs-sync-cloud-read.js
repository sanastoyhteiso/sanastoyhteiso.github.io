/* STAGING ONLY: READ-ONLY reconciliation from Firestore baseline and events.
 * Works across multiple devices. Nothing is saved to localStorage or Firestore.
 * Caller must separately approve/apply results after testing migration.
 */
(function(root,factory){
 var api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.RS_SYNC_CLOUD_READ=api;
})(this,function(){
 'use strict';
 function canonical(x){
   if(x===null||typeof x!=='object')return JSON.stringify(x);
   if(Object.prototype.toString.call(x)==='[object Array]')
     return '['+x.map(canonical).join(',')+']';
   return '{'+Object.keys(x).sort().map(function(k){return JSON.stringify(k)+':'+canonical(x[k]);}).join(',')+'}';
 }
 function validMap(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
 function create(opts){
   if(!opts||!opts.core||!opts.transport||typeof opts.transport.getBaseline!=='function'||
     typeof opts.transport.listEvents!=='function'||typeof opts.activeUid!=='function'||
     typeof opts.verifyHash!=='function')throw Error('Cloud reader dependencies missing');
   var core=opts.core,tr=opts.transport;
   function load(uid,localPending){
     if(!uid||uid!==opts.activeUid())return Promise.reject(Error('Account changed'));
     if(localPending&&!Array.isArray(localPending))return Promise.reject(Error('Invalid local pending queue'));
     return Promise.resolve().then(function(){return tr.getBaseline(uid);}).then(function(document){
       if(uid!==opts.activeUid())throw Error('Account changed');
       if(!document)throw Error('Verified migration baseline is missing; never overwrite local data');
       var base=tr.decodeDocument?tr.decodeDocument(document):
         (opts.decodeDocument?opts.decodeDocument(document):null);
       if(!base||base.v!==3||base.uid!==uid||
          !/^[a-f0-9]{64}$/.test(base.sha256||'')||
          !validMap(base.snapshot)||!validMap(base.snapshot.scores)||
          !validMap(base.snapshot.words)||!validMap(base.snapshot.favorites))
         throw Error('Invalid imported cloud baseline; do not merge');
       return Promise.resolve().then(function(){return opts.verifyHash(base.snapshot);}).then(function(actualHash){
         if(actualHash!==base.sha256)throw Error('Cloud baseline checksum mismatch');
         if(uid!==opts.activeUid())throw Error('Account changed');
         return tr.listEvents(uid).then(function(remote){return {base:base.snapshot,remote:remote};});
       });
     }).then(function(x){
       if(uid!==opts.activeUid())throw Error('Account changed');
       if(!Array.isArray(x.remote))throw Error('Cloud events unavailable');
       var seen={},unique=[];
       function accept(e){
         if(!core.valid(e))throw Error('Malformed event; refuse partial merge');
         var stable=canonical(e);
         if(Object.prototype.hasOwnProperty.call(seen,e.id)){
           if(seen[e.id]!==stable)throw Error('Same event ID has conflicting contents');
           return;
         }
         seen[e.id]=stable;unique.push(e);
       }
       x.remote.forEach(accept);
       (localPending||[]).forEach(accept);
       var folded=core.fold(x.base,unique);
       if(folded.invalid||folded.duplicates||folded.applied!==unique.length)
         throw Error('Cloud fold incomplete; preserve original local data');
       return {ok:true,state:folded.state,cloudEvents:x.remote.length,
         localPending:(localPending||[]).length,uniqueEvents:unique.length,
         applied:folded.applied,readyToApply:false,
         message:'Read-only preview. Application to this device requires an explicit migration gate.'};
     });
   }
   return {load:load};
 }
 return {create:create};
});
