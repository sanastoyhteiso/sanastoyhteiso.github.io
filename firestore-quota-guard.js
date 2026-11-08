/* RUN168 — Firestore REST 429 circuit breaker. ES5 / Safari iOS 12.
   The browser stores only project-wide cooldown timestamps, never UID/answers/tokens. */
(function(w){
 'use strict';
 var conf=w.RS_FIREBASE_CONFIG||{},project=String(conf.projectId||'');
 var KEY='rs_firestore_quota_pause_v1_'+project;
 var MAX=2*60*60*1000, BASE=15*60*1000, DAY=24*60*60*1000;
 function now(){return Date.now();}
 function read(){
   try{
     var raw=w.localStorage.getItem(KEY),v=raw?JSON.parse(raw):null,t=now();
     if(!v||v.v!==1||typeof v.until!=='number'||typeof v.last!=='number'||
        !isFinite(v.until)||!isFinite(v.last)||v.last<0||v.last>t+60000||
        v.until<t-DAY||v.until>t+DAY)return {v:1,until:0,last:0,count:0};
     return {v:1,until:v.until,last:v.last,count:Math.max(0,Math.min(4,Number(v.count)||0))};
   }catch(e){return {v:1,until:0,last:0,count:0};}
 }
 function write(v){try{w.localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}}
 function minutes(){return Math.max(0,Math.ceil((read().until-now())/60000));}
 function allowed(){return minutes()===0;}
 function message(){
   var m=minutes();
   return m?'Лимит Firestore временно исчерпан. Повторные обращения приостановлены примерно на '+m+' мин. Данные устройства сохранены.':
     'Лимит Firestore временно исчерпан. Попробуй позже; данные устройства сохранены.';
 }
 function error(){var e=new Error(message());e.code='firestore-quota-limited';return e;}
 function isQuota(status,payload){
   var info=payload&&payload.error||{};
   return Number(status)===429||info.status==='RESOURCE_EXHAUSTED';
 }
 function mark(status,payload){
   if(!isQuota(status,payload))return false;
   var current=read(),t=now(),count=t-current.last<DAY?Math.min(4,current.count+1):1;
   var backoff=Math.min(MAX,BASE*Math.pow(2,count-1));
   write({v:1,until:Math.max(current.until,t+backoff),last:t,count:count});
   return true;
 }
 w.RS_FIRESTORE_QUOTA_GUARD={allowed:allowed,minutes:minutes,message:message,error:error,mark:mark,isQuota:isQuota};
})(window);
