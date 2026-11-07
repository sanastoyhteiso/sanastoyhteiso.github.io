/* STAGING ONLY / NO PROD AUTO-START.
 * An opt-in offline event upload controller and guarded READ-ONLY remote preview.
 * Never applies cloud data to the app or writes unless migration was verified.
 * Remote preview uses the atomic journal checkpoint and refuses stale/racing data.
 */
(function(root,factory){
 var api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.RS_SYNC_CONTROLLER=api;
})(this,function(){
 'use strict';
 function canonical(x){
   if(x===null||typeof x!=='object')return JSON.stringify(x);
   if(Object.prototype.toString.call(x)==='[object Array]')
     return '['+x.map(canonical).join(',')+']';
   return '{'+Object.keys(x).sort().map(function(k){
     return JSON.stringify(k)+':'+canonical(x[k]);
   }).join(',')+'}';
 }
 function create(opts){
   if(!opts||!opts.journal||!opts.transport||!opts.uid||!opts.activeUid||
      !opts.legacySyncDisabled||!opts.getSnapshot||!opts.subscribe)
     throw Error('Missing safe sync controller dependencies');
   if(opts.cloudReader&&(
      typeof opts.cloudReader.load!=='function'||
      typeof opts.journal.inspect!=='function'||
      typeof opts.normalizeSnapshot!=='function'))
     throw Error('Remote preview needs atomic journal inspect and snapshot normalizer');
   var started=false,busy=false,scheduled=null,remoteScheduled=null,checkingRemote=false;
   var failures=0,lastError='',generation=0,remoteAttemptAt=0,remoteCheckedAt=0;
   var remoteEvents=0,remoteReview=false,remoteError='';
   var delay=opts.delay||function(fn,ms){return setTimeout(fn,ms);};
   var clear=opts.clear||function(t){clearTimeout(t);};
   var now=opts.now||function(){return Date.now();};
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
       enabled:ready(),failures:failures,lastError:lastError,
       remote:{available:!!opts.cloudReader,checking:checkingRemote,
         lastCheckedAt:remoteCheckedAt,events:remoteEvents,
         needsReview:remoteReview,lastError:remoteError,
         autoPreview:opts.autoCheckRemote===true}};
   }
   function emit(){try{onStatus(status());}catch(e){}}
   function schedule(ms){
     if(!ready()||busy||scheduled!==null||!opts.journal.status().pending)return;
     scheduled=delay(function(){scheduled=null;flush();},ms);
   }
   function scheduleRemote(ms){
     if(!opts.cloudReader||opts.autoCheckRemote!==true||!ready()||
        checkingRemote||remoteScheduled!==null||busy)return;
     // This is a quota-safe visibility/online trigger, NOT background polling.
     if(remoteAttemptAt&&now()-remoteAttemptAt<60000)return;
     remoteScheduled=delay(function(){remoteScheduled=null;checkRemote();},ms);
   }
   function flush(){
     if(!ready()||busy)return Promise.resolve(false);
     var pending=opts.journal.peek(12);
     if(!pending.length){emit();return Promise.resolve(true);}
     busy=true;emit();
     return Promise.resolve().then(function(){return opts.transport.putEvents(opts.uid,pending);}).then(function(ack){
       if(!Array.isArray(ack)||ack.length===0)throw Error('No confirmed server acknowledgments');
       if(!ready())throw Error('Account or session changed during sync');
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
       if(success)scheduleRemote(3000);
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
   function checkRemote(){
     // Opt-in, read-only. Never calls save(), localStorage.setItem() or putEvents().
     if(!opts.cloudReader||!ready()||busy||checkingRemote)
       return Promise.resolve({ok:false,skipped:true,readyToApply:false});
     var before,journalFingerprint,localFingerprint,run=generation;
     try{
       before=opts.journal.inspect();
       if(!before||before.uid!==opts.uid||before.phase!=='live')
         throw Error('Verified local journal missing');
       journalFingerprint=canonical(before);
       localFingerprint=canonical(opts.normalizeSnapshot(opts.getSnapshot()));
       if(localFingerprint!==canonical(before.checkpoint))
         throw Error('Local changes not yet captured; preview blocked');
     }catch(e){
       remoteError='Local journal is not ready for remote preview';
       emit();
       return Promise.resolve({ok:false,readyToApply:false,error:remoteError});
     }
     checkingRemote=true;remoteError='';remoteAttemptAt=now();emit();
     return Promise.resolve().then(function(){
       return opts.cloudReader.load(opts.uid,before.pending);
     }).then(function(preview){
       if(!preview||preview.ok!==true||preview.readyToApply!==false)
         throw Error('Remote preview must be read-only');
       if(!ready()||generation!==run)throw Error('Session changed during cloud read');
       if(canonical(opts.journal.inspect())!==journalFingerprint||
          canonical(opts.normalizeSnapshot(opts.getSnapshot()))!==localFingerprint)
         throw Error('Local data changed during cloud read; discard stale result');
       remoteCheckedAt=now();
       remoteEvents=preview.cloudEvents;
       remoteReview=canonical(preview.state)!==canonical(before.checkpoint);
       return {ok:true,readyToApply:false,needsReview:remoteReview,
         cloudEvents:preview.cloudEvents,localPending:preview.localPending,
         previewState:preview.state};
     }).catch(function(){
       remoteError='Remote preview discarded; local progress is unchanged';
       return {ok:false,readyToApply:false,error:remoteError};
     }).then(function(result){
       checkingRemote=false;emit();return result;
     });
   }
   function start(){
     if(started)return status();
     if(opts.activeUid()!==opts.uid||opts.legacySyncDisabled()!==true||
       opts.journal.status().phase!=='live')
       throw Error('Verified migration and disabled legacy sync required');
     started=true;generation++;
     unsub.push(opts.subscribe('rs:datachange',capture));
     unsub.push(opts.subscribe('online',function(){schedule(500);scheduleRemote(1000);emit();}));
     unsub.push(opts.subscribe('visible',function(){schedule(500);scheduleRemote(1000);emit();}));
     emit();schedule(800);scheduleRemote(1500);
     return status();
   }
   var unsub=[];
   function stop(){
     started=false;generation++;
     if(scheduled!==null){clear(scheduled);scheduled=null;}
     if(remoteScheduled!==null){clear(remoteScheduled);remoteScheduled=null;}
     unsub.forEach(function(fn){if(typeof fn==='function')fn();});unsub=[];
     remoteReview=false;remoteEvents=0;remoteError='';
     emit();
   }
   return {start:start,stop:stop,flush:flush,capture:capture,
     checkRemote:checkRemote,status:status};
 }
 return {create:create};
});
