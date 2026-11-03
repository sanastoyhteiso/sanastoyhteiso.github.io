/* STAGING / NOT DEPLOYED. Atomic per-user offline outbox + capture cursor.
 * Migration must be verified and legacy Google Drive sync disabled before
 * activate(). Otherwise remote Drive changes could be double-counted as answers.
 * Every checkpoint and pending queue is committed in one localStorage value.
 */
(function(root,factory){
 var api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.RS_SYNC_JOURNAL=api;
})(this,function(){
 'use strict';
 function copy(x){return JSON.parse(JSON.stringify(x));}
 function n(x){return Math.max(0,Math.floor(Number(x)||0));}
 function own(o,k){return Object.prototype.hasOwnProperty.call(o,k);}
 function keys(o){return Object.keys(o||{});}
 function snapshot(x){
   x=x||{};
   if(!x.scores||typeof x.scores!=='object'||!Array.isArray(x.words)||!x.favorites)
     throw Error('Incomplete progress snapshot');
   var words={};
   x.words.forEach(function(w){if(w&&w.id)words[w.id]=copy(w);});
   return {scores:copy(x.scores),words:words,favorites:copy(x.favorites)};
 }
 function create(opts){
   if(!opts||!opts.core||!opts.storage||!opts.uid||!opts.device||!opts.newId||
      typeof opts.newId!=='function'||typeof opts.legacySyncDisabled!=='function')
       throw Error('Missing migration-safe journal dependencies');
   var storage=opts.storage,uid=String(opts.uid),core=opts.core;
   var key='rs_sync_v3_atomic_'+uid;
   var device=String(opts.device),maxPending=opts.maxPending||5000;
   function read(){
     var data=storage.getItem(key);
     if(!data)return null;
     var o=JSON.parse(data);
     if(!o||o.v!==3||o.uid!==uid||!o.checkpoint||!Array.isArray(o.pending))
       throw Error('Corrupt journal; stop to avoid overwriting pending data');
     o.pending.forEach(function(x){if(!core.valid(x))throw Error('Invalid queued event, preserve original bytes');});
     return o;
   }
   function write(o){storage.setItem(key,JSON.stringify(o));return o;}
   function initialize(local){
     if(read())return {existing:true,phase:read().phase};
     // This read-only baseline is NOT a migration; nothing is uploaded.
     return {existing:false,phase:'migration_required',local:snapshot(local)};
   }
   function activate(baseline,approval){
     if(approval!=='VERIFIED_BASELINE_AND_LEGACY_SYNC_DISABLED'||
       opts.legacySyncDisabled()!==true)throw Error('Migration verification required');
     var old=read();
     if(old)throw Error('Journal exists; never replace capture cursor or pending events');
     var entry={v:3,uid:uid,device:device,phase:'live',checkpoint:snapshot(baseline),pending:[],acknowledgedAt:0};
     return write(entry);
   }
   function capture(next){
     var old=read();
     if(!old||old.phase!=='live'||opts.legacySyncDisabled()!==true)
       throw Error('Cloud migration not safely activated');
     var now=Number(opts.now?opts.now():Date.now());
     var latest=snapshot(next),base=old.checkpoint,events=[],ids={};
     function add(kind,target,data){
       var id=String(opts.newId());
       if(ids[id])throw Error('Duplicate generated ID');
       ids[id]=true;events.push(core.event(id,device,kind,target,data,now));
     }
     keys(base.scores).concat(keys(latest.scores)).filter(function(v,i,a){return a.indexOf(v)===i;}).forEach(function(term){
       var before=base.scores[term]||{},after=latest.scores[term]||{};
       var oldSeen=n(before.seen),newSeen=n(after.seen),dc=n(after.correct)-n(before.correct),
         dw=n(after.wrong)-n(before.wrong),ds=newSeen-oldSeen;
       if(ds<0||dc<0||dw<0||ds!==dc+dw)throw Error('Score divergence: manual review, do not overwrite checkpoint');
       var i;
       // One distinct event for each new answer: no max-counter merging.
       for(i=0;i<dc;i++)add('answer',term,{correct:true});
       for(i=0;i<dw;i++)add('answer',term,{correct:false,
         reviewLearned:before.learned===true&&after.learned===false});
       if(!dc&&!dw&&typeof after.learned==='boolean'&&after.learned!==before.learned)
         add('learned_set',term,{learned:after.learned});
     });
     keys(base.favorites).concat(keys(latest.favorites)).filter(function(v,i,a){return a.indexOf(v)===i;}).forEach(function(term){
       if(!!base.favorites[term]!==!!latest.favorites[term])
         add('favorite_set',term,{starred:!!latest.favorites[term]});
     });
     keys(base.words).concat(keys(latest.words)).filter(function(v,i,a){return a.indexOf(v)===i;}).forEach(function(word){
       var a=base.words[word],b=latest.words[word];
       if(a&&!b)add('word_delete',word,{deleted:true});
       else if(b&&JSON.stringify(a||null)!==JSON.stringify(b))
         add('word_upsert',word,b);
     });
     if(old.pending.length+events.length>maxPending)throw Error('Queue is full; preserve local data and export backup');
     var updated={v:3,uid:uid,device:device,phase:'live',checkpoint:latest,
       pending:old.pending.concat(events),acknowledgedAt:old.acknowledgedAt};
     write(updated); // Atomic snapshot cursor + new pending events.
     return {created:events.length,pending:updated.pending.length};
   }
   function peek(limit){
     var o=read();return o?o.pending.slice(0,Math.min(Math.max(1,limit||12),12)):[];
   }
   function acknowledge(ids){
     var o=read();if(!o)throw Error('No journal');
     var allowed={};o.pending.forEach(function(e){allowed[e.id]=true;});
     (ids||[]).forEach(function(x){if(!allowed[x])throw Error('Acknowledgment not in pending queue');});
     o.pending=core.nextQueue(o.pending,ids||[]);
     o.acknowledgedAt=Date.now();
     return write(o).pending.length;
   }
   function status(){var o=read();return o?{phase:o.phase,pending:o.pending.length,acknowledgedAt:o.acknowledgedAt}:
     {phase:'migration_required',pending:0,acknowledgedAt:0};}
   // READ ONLY. One consistent checkpoint/outbox snapshot for cloud reconciliation.
   // Keep private content in memory; never emit it in status or diagnostics.
   function inspect(){
     var o=read();
     return o?copy({uid:o.uid,phase:o.phase,checkpoint:o.checkpoint,
       pending:o.pending,acknowledgedAt:o.acknowledgedAt}):null;
   }
   return {initialize:initialize,activate:activate,capture:capture,peek:peek,
     acknowledge:acknowledge,status:status,inspect:inspect};
 }
 return {create:create,snapshot:snapshot};
});
