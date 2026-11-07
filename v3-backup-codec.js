/* RUN-035 — isolated V3 shadow-state Sheets row codec.
 * Offline only: no Google, Drive, Sheets, Auth, Firebase, storage or network calls.
 * SHA-256 checks read-back integrity, NOT ownership/authenticity. No automatic restore.
 * Must use private Sheets + RAW append-only writes and a trusted backup operator.
 * Data here includes private learner content; never log/commit a real payload.
 * ES5/iOS12. Not loaded on production or TEST published pages.
 */
(function(root,factory){
 var api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.RS_V3_BACKUP_CODEC=api;
})(this,function(){
 'use strict';
 var SCOPE='v3-shadow-state-only',SECTIONS=['scores','words','favorites','finds'];
 var HEADER=['snapshot_id','section','record_key','json_value'];
 var MAX_ROWS=20000,MAX_CELL=35000;
 function own(x,k){return Object.prototype.hasOwnProperty.call(x,k);}
 function plain(x){return !!x&&Object.prototype.toString.call(x)==='[object Object]';}
 function ident(x){return typeof x==='string'&&/^[A-Za-z0-9_-]{2,128}$/.test(x)&&
   x!=='__proto__'&&x!=='constructor'&&x!=='prototype';}
 function key(x){return typeof x==='string'&&/^[A-Za-z0-9_-]{1,180}$/.test(x)&&
   x!=='__proto__'&&x!=='constructor'&&x!=='prototype';}
 function validate(x,level){
   if(level>24)throw Error('Backup nesting limit');
   if(x===null||typeof x==='string'||typeof x==='boolean')return;
   if(typeof x==='number'&&isFinite(x))return;
   if(Object.prototype.toString.call(x)==='[object Array]'){
     for(var i=0;i<x.length;i++)validate(x[i],level+1);
     return;
   }
   if(!plain(x))throw Error('Unserializable backup field');
   Object.keys(x).forEach(function(k){
     if(!key(k))throw Error('Unsafe backup property name');
     validate(x[k],level+1);
   });
 }
 function copyState(state){
   if(!plain(state))throw Error('Backup state missing');
   var result={},count=0;
   SECTIONS.forEach(function(section){
     if(!own(state,section)||!plain(state[section]))
       throw Error('Incomplete V3 shadow section');
     var part=Object.create(null);
     Object.keys(state[section]).sort().forEach(function(k){
       if(!key(k))throw Error('Invalid backup record key');
       validate(state[section][k],0);
       var value=JSON.stringify(state[section][k]);
       if(typeof value!=='string'||value.length>MAX_CELL)
         throw Error('Backup cell exceeds safe size');
       part[k]=JSON.parse(value);
       if(++count>MAX_ROWS)throw Error('Too many backup rows');
     });
     result[section]=part;
   });
   return result;
 }
 function makeRows(snapshotId,state){
   var rows=[HEADER.slice()];
   SECTIONS.forEach(function(section){
     Object.keys(state[section]).sort().forEach(function(k){
       rows.push([snapshotId,section,k,JSON.stringify(state[section][k])]);
     });
   });
   return rows;
 }
 function payload(uid,snapshotId,createdAt,state){
   return {v:1,scope:SCOPE,uid:uid,snapshotId:snapshotId,
     createdAt:createdAt,state:state};
 }
 function assertSha(sha,crypto){
   if(!sha||typeof sha.digest!=='function'||!crypto||
       !crypto.subtle||typeof crypto.subtle.digest!=='function')
     throw Error('Secure SHA-256 required');
 }
 function counts(state){
   var result={};
   SECTIONS.forEach(function(s){result[s]=Object.keys(state[s]).length;});
   return result;
 }
 function create(opts,sha,crypto){
   if(!opts||!ident(opts.uid)||!ident(opts.snapshotId)||
      typeof opts.createdAt!=='number'||!isFinite(opts.createdAt)||
      opts.createdAt<=0||Math.floor(opts.createdAt)!==opts.createdAt)
     return Promise.reject(Error('Invalid snapshot identity'));
   var state;
   try{assertSha(sha,crypto);state=copyState(opts.state);}
   catch(e){return Promise.reject(e);}
   var rows=makeRows(opts.snapshotId,state),data=payload(opts.uid,opts.snapshotId,opts.createdAt,state);
   return sha.digest(data,crypto).then(function(hash){
     if(!/^[a-f0-9]{64}$/.test(hash))throw Error('Invalid snapshot hash');
     return {manifest:{schemaVersion:1,scope:SCOPE,uid:opts.uid,
       snapshotId:opts.snapshotId,createdAt:opts.createdAt,
       sections:counts(state),rowCount:rows.length-1,sha256:hash,
       writeMode:'PRIVATE_RAW_APPEND_ONLY',complete:false,restoreTested:false},
       rows:rows};
   });
 }
 function readBack(rows,manifest,expectedUid,expectedSnapshot,sha,crypto){
   var state={},seen=Object.create(null),n=0;
   try{
     assertSha(sha,crypto);
     if(!manifest||manifest.schemaVersion!==1||manifest.scope!==SCOPE||
       !ident(expectedUid)||!ident(expectedSnapshot)||
       manifest.uid!==expectedUid||manifest.snapshotId!==expectedSnapshot||
       typeof manifest.createdAt!=='number'||!isFinite(manifest.createdAt)||
       Math.floor(manifest.createdAt)!==manifest.createdAt||manifest.createdAt<=0||
       !/^[a-f0-9]{64}$/.test(manifest.sha256||'')||
       !manifest.sections||!plain(manifest.sections)||
       typeof manifest.rowCount!=='number'||manifest.rowCount<0||
       manifest.rowCount>MAX_ROWS||Math.floor(manifest.rowCount)!==manifest.rowCount)
       throw Error('Snapshot manifest invalid or wrong owner');
     if(!Array.isArray(rows)||!Array.isArray(rows[0])||rows.length<1||
       rows[0].length!==HEADER.length||rows[0].join('|')!==HEADER.join('|')||
       rows.length-1!==manifest.rowCount)
       throw Error('Backup rows incomplete or header mismatch');
     SECTIONS.forEach(function(s){state[s]=Object.create(null);});
     for(var i=1;i<rows.length;i++){
       var row=rows[i];
       if(!Array.isArray(row)||row.length!==4||row[0]!==expectedSnapshot||
         SECTIONS.indexOf(row[1])<0||!key(row[2])||
         typeof row[3]!=='string'||row[3].length>MAX_CELL)
         throw Error('Invalid backup row');
       var record=row[1]+'\u0000'+row[2];
       if(own(seen,record))throw Error('Duplicate backup row');
       seen[record]=true;
       var value;
       try{value=JSON.parse(row[3]);}catch(e){throw Error('Invalid backup JSON');}
       validate(value,0);
       state[row[1]][row[2]]=value;
       if(++n>MAX_ROWS)throw Error('Backup row limit exceeded');
     }
     SECTIONS.forEach(function(s){
       if(typeof manifest.sections[s]!=='number'||
         Math.floor(manifest.sections[s])!==manifest.sections[s]||
         manifest.sections[s]<0||manifest.sections[s]!==Object.keys(state[s]).length)
         throw Error('Backup section count mismatch');
     });
   }catch(e){return Promise.reject(e);}
   return sha.digest(payload(expectedUid,expectedSnapshot,manifest.createdAt,state),crypto)
     .then(function(hash){
       if(hash!==manifest.sha256)throw Error('Backup SHA-256 mismatch');
       return {ok:true,readOnly:true,verifiedOffline:true,
         liveSheetsVerified:false,canAutomaticallyRestore:false,
         uid:expectedUid,snapshotId:expectedSnapshot,counts:counts(state),
         state:state};
     });
 }
 return {create:create,readBack:readBack,scope:SCOPE,header:HEADER.slice()};
});
