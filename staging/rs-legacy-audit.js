/* STAGING ONLY: read-only reconciliation of legacy Google Sheets event rows.
 * Never writes to Google Sheets, Firestore, localStorage, or public GitHub.
 * Use private row data only in user-controlled audit sessions.
 */
(function(root,factory){
 var api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.RS_LEGACY_AUDIT=api;
})(this,function(){
 'use strict';
 function n(v){return Math.max(0,Math.floor(Number(v)||0));}
 function audit(rows){
   if(!Array.isArray(rows))throw Error('Expected legacy Events rows');
   var ids={},records=[],errors=[],seen={};
   rows.forEach(function(row,i){
     if(!row||row.length<6){errors.push('Invalid row '+(i+2));return;}
     var ev={id:String(row[0]||''),time:Number(row[1]),device:String(row[2]||''),
       kind:String(row[3]||''),target:String(row[4]||''),data:null};
     if(!ev.id||!ev.kind||!ev.target||!isFinite(ev.time)||ev.time<=0){
       errors.push('Invalid event envelope at row '+(i+2));return;
     }
     try{ev.data=JSON.parse(row[5]);}catch(e){errors.push('Invalid JSON at row '+(i+2));return;}
     if(ids[ev.id]){errors.push('Duplicate event ID at row '+(i+2));return;}
     ids[ev.id]=true;records.push(ev);
   });
   records.sort(function(a,b){return a.time-b.time||(a.id<b.id?-1:a.id>b.id?1:0);});
   var stats={},scope={value:'mine',updatedAt:0},kindCounts={};
   records.forEach(function(e){
     kindCounts[e.kind]=(kindCounts[e.kind]||0)+1;
     if(e.kind==='score'){
       var old=stats[e.target]||{correct:0,wrong:0,seen:0,last:0};
       old.correct=Math.max(old.correct,n(e.data&&e.data.correct));
       old.wrong=Math.max(old.wrong,n(e.data&&e.data.wrong));
       old.seen=Math.max(old.seen,n(e.data&&e.data.seen));
       old.last=Math.max(old.last,n(e.data&&e.data.last));
       stats[e.target]=old;
       if(old.seen<old.correct+old.wrong)
         errors.push('Counter mismatch at a score event');
     }else if(e.kind==='scope'){
       if(e.time>=n(scope.updatedAt)&&e.data&&['mine','all'].indexOf(e.data.value)!==-1)
         scope={value:e.data.value,updatedAt:e.time};
     }else errors.push('Unrecognized legacy event kind '+e.kind);
   });
   var aggregate={seen:0,correct:0,wrong:0,learned:0};
   Object.keys(stats).forEach(function(k){
     var x=stats[k];aggregate.seen+=x.seen;aggregate.correct+=x.correct;aggregate.wrong+=x.wrong;
     if(x.correct>0)aggregate.learned++;
   });
   return {ok:errors.length===0,errors:errors,events:records.length,kinds:kindCounts,
     distinctTerms:Object.keys(stats).length,totals:aggregate,scope:scope,
     // Private original data intentionally not returned. The actual migration
     // imports locally from a separate owner-approved JSON backup.
     revisionRange:records.length?{first:records[0].time,last:records[records.length-1].time}:null};
 }
 function compareLocal(local,cloud){
   if(!local||!cloud||!cloud.ok||!local.scores)return {ready:false,reason:'Incomplete source'};
   var localScore=local.scores||{},diffs=0,cloudTotals=cloud.totals||{};
   var totals={seen:0,correct:0,wrong:0,learned:0};
   Object.keys(localScore).forEach(function(k){
     var x=localScore[k]||{};totals.seen+=n(x.seen);totals.correct+=n(x.correct);totals.wrong+=n(x.wrong);
     if(x.learned===true||typeof x.learned!=='boolean'&&n(x.correct)>0)totals.learned++;
   });
   ['seen','correct','wrong','learned'].forEach(function(k){if(totals[k]!==cloudTotals[k])diffs++;});
   return {ready:diffs===0,mismatches:diffs,localTotals:totals,cloudTotals:cloudTotals,
     message:diffs?'Manual review required; never overwrite one side':'Aggregate counters agree; verify individual IDs before migration'};
 }
 return {audit:audit,compareLocal:compareLocal};
});
