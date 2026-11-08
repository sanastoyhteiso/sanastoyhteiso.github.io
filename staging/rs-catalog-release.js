/* STAGING ONLY: pure offline-safe vocabulary release checks.
 * Nothing here fetches, publishes, mutates local study progress, or writes databases.
 * The fast fingerprint is ONLY a change hint, not a cryptographic checksum.
 */
(function(root,factory){
 var api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.RS_CATALOG_UPDATE=api;
})(this,function(){
 'use strict';
 function uniqueTerms(terms){
   if(!Array.isArray(terms))throw Error('Terms must be an array');
   var ids={},names={},i,t,key;
   for(i=0;i<terms.length;i++){
     t=terms[i];
     if(!t||typeof t.id!=='string'||!/^T[0-9]{5,}$/.test(t.id)||
       typeof t.fi!=='string'||!t.fi.trim()||typeof t.ru!=='string'||!t.ru.trim()||
       typeof t.en!=='string'||!t.en.trim())throw Error('Invalid trilingual term at '+i);
     key=t.fi.toLocaleLowerCase().trim();
     if(ids[t.id]||names[key])throw Error('Duplicate ID or FI term: '+t.id);
     ids[t.id]=true;names[key]=true;
   }
   return true;
 }
 function checkRelease(previous,next){
   uniqueTerms(next);
   var old={},changes=[],added=[],removed=[],i,t;
   (previous||[]).forEach(function(x){old[x.id]=x;});
   for(i=0;i<next.length;i++){
     t=next[i];
     if(!old[t.id]){added.push(t.id);continue;}
     var before=old[t.id];
     if(t.fi!==before.fi||t.ru!==before.ru||t.en!==before.en)changes.push(t.id);
     delete old[t.id];
   }
   removed=Object.keys(old);
   return {safeToAutoPublish:removed.length===0&&changes.length===0,
     needsEditorialReview:changes.length>0||removed.length>0,
     added:added,edited:changes,removed:removed,count:next.length};
 }
 function checkDue(now,last,online,visible,minInterval){
   var ms=typeof minInterval==='number'&&minInterval>0?minInterval:60*60*1000;
   return online===true&&visible===true&&Number(now)-Number(last||0)>=ms;
 }
 function status(manifest,currentVersion){
   if(!manifest||typeof manifest.version!=='string'||typeof manifest.count!=='number')
     return {state:'error',message:'Invalid catalog manifest'};
   if(manifest.version===currentVersion)return {state:'current',message:'Catalog is current'};
   return {state:'update_available',message:'Catalog update is available'};
 }
 function manifest(version,terms,updatedAt){
   uniqueTerms(terms);
   return {schemaVersion:1,version:String(version),updatedAt:String(updatedAt),
     count:terms.length,filename:'data.js',sha256:null,
     sha256RequiredBeforePublishing:true};
 }
 return {uniqueTerms:uniqueTerms,checkRelease:checkRelease,checkDue:checkDue,
   status:status,manifest:manifest};
});
