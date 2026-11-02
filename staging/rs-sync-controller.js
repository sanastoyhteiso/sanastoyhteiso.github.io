/* STAGING ONLY / NO PROD AUTO-START.
 * Explicitly activated integration between an atomic per-UID event journal
 * and authorized Firestore transport. Does not write without a verified migration,
 * authenticated owner, and legacy Drive sync having been disabled.
 */
(function(root,factory){
 var api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.RS_SYNC_CONTROLLER=api;
})(this,function(){
 'use strict';
 function create(opts){
   if(!opts||!opts.journal||!opts.transport||!opts.uid||!opts.activeUid||
      !opts.legacySyncDisabled||!opts.getSnapshot||!opts.subscribe)
     throw Error('Missing safe sync controller dependencies');
   var started=false,busy=false,scheduled=null,unsub=[],failures=0,lastError='';
   var delay=opts.delay||function(fn,ms){return setTimeout(fn,ms);};
   var clear=opts.clear||function(t){clearTimeout(t);};
   var online=opts.online||function(){return true;};
   var visible=opts.visible||function(){return true;};
   var onStatus=opts.onStatus||function(){};
   function ready(){
     return started&&opts.activeUid()===opts.uid&&
       opts.legacySyncDisabled()===true&&online()===true&&visible()===true;
   }
   function status(){
     var s=opts.journal.status();return {phase:s.phase,pending:s.pending,
       lastAcknowledgedAt:s.acknowledgedAt,online:online(),busy:busy,
       enabled:ready(),failures:failures,lastError:lastError};
   }
   function emit(){try{onStatus(status());}catch(e){}}
   function schedule(ms){
     if(!ready()||busy||scheduled!==null||!opts.journal.status().pending)return;
     scheduled=delay(function(){scheduled=null;flush();},ms);
   }
   function flush(){
     if(!ready()||busy)return Promise.resolve(false);
     var pending=opts.journal.peek(12);
     if(!pending.length){emit();return Promise.resolve(true);}
     busy=true;emit();
     return Promise.resolve().then(function(){return opts.transport.putEvents(opts.uid,pending);}).then(function(ack){
       if(!Array.isArray(ack)||ack.length===0)throw Error('No confirmed server acknowledgments');
       if(opts.activeUid()!==opts.uid)throw Error('Account changed during sync');
       opts.journal.acknowledge(ack);
       failures=0;lastError='';return true;
     }).catch(function(e){failures=Math.min(failures+1,12);
       lastError=e&&e.message||'Sync temporarily unavailable';return false;
     }).then(function(success){
       busy=false;emit();
       if(opts.journal.status().pending){
         var wait=success?15000:Math.min(900000,5000*Math.pow(2,Math.min(failures,7)));
         schedule(wait);
       }
       return success;
     });
   }
   function capture(){
     if(!started||opts.activeUid()!==opts.uid)return false;
     try{
       var result=opts.journal.capture(opts.getSnapshot());
       if(result.created>0){lastError='';schedule(20000);}
       emit();return result;
     }catch(e){lastError=e&&e.message||'Local capture failed';emit();return false;}
   }
   function start(){
     if(started)return status();
     if(opts.activeUid()!==opts.uid||opts.legacySyncDisabled()!==true||
       opts.journal.status().phase!=='live')
       throw Error('Verified migration and disabled legacy sync required');
     started=true;
     unsub.push(opts.subscribe('rs:datachange',capture));
     unsub.push(opts.subscribe('online',function(){schedule(500);emit();}));
     unsub.push(opts.subscribe('visible',function(){schedule(500);emit();}));
     emit();schedule(800);
     return status();
   }
   function stop(){
     started=false;if(scheduled!==null){clear(scheduled);scheduled=null;}
     unsub.forEach(function(fn){if(typeof fn==='function')fn();});unsub=[];
     emit();
   }
   return {start:start,stop:stop,flush:flush,capture:capture,status:status};
 }
 return {create:create};
});
