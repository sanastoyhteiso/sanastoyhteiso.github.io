/* Sanastoyhteisö technical backend read adapter.
 * Admin page already requires the verified Firebase admin claim. The Worker
 * independently verifies the Firebase JWT signature and admin=true.
 * Fail closed; no raw errors or student records from backend.
 * When backend is not configured, do NOT fabricate success, counts, or OK.
 */
(function(w){
 'use strict';
 function endpoint(){
   var c=w.RS_TELEMETRY_CONFIG||{},cfg=w.RS_FIREBASE_CONFIG||{};
   return c.enabled===true&&cfg.projectId==='riveria-sanasto-community-test'&&
     typeof c.endpoint==='string'&&
     /^https:\/\/[a-z0-9.-]+(?::443)?$/.test(c.endpoint)&&
     c.endpoint.indexOf('..')===-1&&
     (w.location||{}).hostname==='sanastoyhteiso.github.io'?c.endpoint:null;
 }
 function validNumber(n){return typeof n==='number'&&isFinite(n)&&n>=0&&n%1===0;}
 function parse(x){
   if(!x||x.backendConnected!==true||x.serverDataOnly!==true||
     x.monitoringActive!==true||x.monitoringCoverageVerified!==false||
     typeof x.updatedAt!=='string'||!Array.isArray(x.errorGroups)||
     !Array.isArray(x.browserGroups)||!validNumber(x.errors24h)||
     x.errorGroups.length>30||x.browserGroups.length>10||
     x.errorGroups.some(function(a){return !a||typeof a.code!=='string'||
       !/^[A-Z0-9_]{4,50}$/.test(a.code)||!validNumber(a.count);})||
     x.browserGroups.some(function(a){return !a||typeof a.browser!=='string'||
       !/^[a-z-]{3,20}$/.test(a.browser)||!validNumber(a.count);}))
     throw Error('Invalid telemetry response');
   var time=Date.parse(x.updatedAt),now=Date.now();
   if(!isFinite(time)||time>now+60000||now-time>15*60000)
     throw Error('Stale monitoring');
   return x;
 }
 function read(user){
   var base=endpoint();
   if(!base||!user||user.emailVerified!==true||typeof user.getIdToken!=='function'||
      typeof w.fetch!=='function')return Promise.reject(Error('Not configured'));
   return user.getIdToken(false).then(function(token){
     return w.fetch(base+'/v1/summary',{method:'GET',mode:'cors',
       cache:'no-store',credentials:'omit',headers:{Authorization:'Bearer '+token}});
   }).then(function(response){
     if(!response.ok)throw Error('Monitor unreachable');
     return response.json();
   }).then(parse);
 }
 w.RS_MONITOR_ADMIN={configured:function(){return !!endpoint();},read:read};
})(window);
