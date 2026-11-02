/* STAGING ONLY. Explicitly started offline queue; never loaded in production.
 * Requires injected trusted transport (putEvents(uid, list) -> acked event IDs).
 * No storage is removed until a confirmed server ACK. No Firebase secrets.
 */
(function(root,factory){
 var api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.RS_SYNC_QUEUE=api;
})(this,function(){
 'use strict';
 function create(opts){
   if(!opts||!opts.core||!opts.storage||!opts.transport||!opts.uid)
     throw Error('Missing required queue dependencies');
   var core=opts.core,storage=opts.storage,uid=String(opts.uid);
   var key='rs_sync_v3_pending_'+uid,started=false,busy=false,timer=null;
   var online=opts.online||function(){return true;};
   var visible=opts.visible||function(){return true;};
   var activeUid=opts.activeUid||function(){return uid;};
   var delay=opts.delay||function(fn,ms){return setTimeout(fn,ms);};
   var clear=opts.clear||function(id){clearTimeout(id);};
   var subscribe=opts.subscribe||function(){return function(){};};
   var unsub=[],failures=0,lastAck=0,maxItems=opts.maxItems||5000;
   function read(){
     var raw=storage.getItem(key);if(!raw)return [];
     var list=JSON.parse(raw);
     if(!Array.isArray(list))throw Error('Invalid saved event queue');
     for(var i=0;i<list.length;i++)if(!core.valid(list[i]))throw Error('Corrupt pending event; do not overwrite storage');
     return list;
   }
   function write(list){
     storage.setItem(key,JSON.stringify(list)); // throws on quota failure
     return list;
   }
   function ready(){return online()===true&&visible()===true&&activeUid()===uid;}
   function schedule(ms){
     if(!started||timer!==null||!read().length)return;
     timer=delay(function(){timer=null;flush();},ms===undefined?20000:ms);
   }
   function enqueue(evt){
     if(!core.valid(evt))throw Error('Invalid event');
     var q=read();
     if(q.length>=maxItems)throw Error('Queue limit: export local backup, do not drop events');
     var merged=core.mergeQueues(q,[evt]);
     write(merged);if(ready())schedule(20000);
     return merged.length;
   }
   function flush(){
     if(busy||!ready())return Promise.resolve(false);
     var q=read();if(!q.length)return Promise.resolve(true);
     var subset=q.slice(0,Math.min(12,opts.batchSize||12)),ids={};
     subset.forEach(function(e){ids[e.id]=true;});busy=true;
     return Promise.resolve().then(function(){return opts.transport.putEvents(uid,subset);}).then(function(acked){
       if(!Array.isArray(acked)||acked.length===0)throw Error('Missing server acknowledgment');
       var accepted=[];
       acked.forEach(function(id){if(ids[id])accepted.push(id);});
       if(!accepted.length)throw Error('No confirmed event IDs');
       write(core.nextQueue(read(),accepted)); // preserve events queued during HTTP
       failures=0;lastAck=Date.now();return true;
     }).catch(function(){
       failures=Math.min(failures+1,12);
       return false; // keep pending events until an explicit ACK
     }).then(function(ok){
       busy=false;
       if(started&&read().length&&ready()){
         var wait=ok?15000:Math.min(900000,5000*Math.pow(2,Math.min(failures,7)));
         schedule(wait);
       }
       return ok;
     });
   }
   function status(){return {pending:read().length,busy:busy,online:online(),lastAcknowledgedAt:lastAck,failures:failures};}
   function start(){
     if(started)return;started=true;
     unsub.push(subscribe('online',function(){schedule(500);}));
     unsub.push(subscribe('visible',function(){schedule(500);}));
     schedule(2000);
   }
   function stop(){
     started=false;if(timer!==null){clear(timer);timer=null;}
     unsub.forEach(function(fn){if(typeof fn==='function')fn();});unsub=[];
   }
   return {start:start,stop:stop,enqueue:enqueue,flush:flush,status:status};
 }
 return {create:create};
});
