/* STAGING ONLY. Google Sheets snapshot planning; no API calls or overwrite.
 * Personal information must not be exported to an administrator without
 * applicable notice, proper access permissions, and a lawful purpose.
 */
(function(root,factory){
 var api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.RS_BACKUP_PLAN=api;
})(this,function(){
 'use strict';
 function copy(x){return JSON.parse(JSON.stringify(x));}
 function validName(x){return typeof x==='string' && /^[A-Za-z0-9_-]{2,110}$/.test(x);}
 function toRows(snapshot){
   if(!snapshot||!snapshot.uid||!snapshot.snapshotId||!snapshot.state)throw Error('Incomplete snapshot');
   var s=snapshot.state,rows=[['snapshot_id','uid','section','key','json_value']];
   ['scores','words','favorites','settings'].forEach(function(section){
     var source=s[section]||{};
     Object.keys(source).sort().forEach(function(id){
       rows.push([snapshot.snapshotId,snapshot.uid,section,id,JSON.stringify(source[id])]);
     });
   });
   return rows;
 }
 function fromRows(rows,expectedUid,expectedSnapshot){
   if(!Array.isArray(rows)||rows.length<1)throw Error('Missing backup');
   var state={scores:{},words:{},favorites:{},settings:{}},allowed={scores:1,words:1,favorites:1,settings:1};
   var seen={},n=0;
   for(var i=1;i<rows.length;i++){
     var r=rows[i];
     if(!r||r.length!==5||r[0]!==expectedSnapshot||r[1]!==expectedUid||!allowed[r[2]]||!validName(r[3]))throw Error('Corrupt row '+i);
     var key=r[2]+'\u0000'+r[3];if(seen[key])throw Error('Duplicate backup entry '+i);seen[key]=true;
     var value;try{value=JSON.parse(r[4]);}catch(e){throw Error('Invalid JSON at row '+i);}
     state[r[2]][r[3]]=value;n++;
   }
   return {uid:expectedUid,snapshotId:expectedSnapshot,state:state,records:n};
 }
 function planNewSnapshot(uid,snapshotId,state,date){
   if(!validName(uid)||!validName(snapshotId))throw Error('Invalid backup identity');
   if(!state||!state.scores||!state.words||!state.favorites)throw Error('Missing progress state');
   var payload={uid:uid,snapshotId:snapshotId,state:copy(state),createdAt:Number(date)};
   var rows=toRows(payload),readBack=fromRows(rows,uid,snapshotId);
   if(readBack.records!==rows.length-1)throw Error('Snapshot self-check failed');
   return {destination:'NEW_SNAPSHOT_ONLY',snapshotId:snapshotId,uid:uid,
       createdAt:Number(date),rows:rows,recordCount:readBack.records,
       status:'PREPARED_NOT_UPLOADED',verifiedForDryRun:true};
 }
 function partition(rows,maxRows){
   if(!Array.isArray(rows)||!maxRows||maxRows<1)throw Error('Invalid partition');
   var pages=[];for(var i=0;i<rows.length;i+=maxRows)pages.push(rows.slice(i,i+maxRows));return pages;
 }
 return {toRows:toRows,fromRows:fromRows,planNewSnapshot:planNewSnapshot,partition:partition};
});
