/* RUN169: read-only authenticated admin directory/activity adapter.
   Browser never enumerates other users via Firestore, stores email or handles IAM secrets.
   The trusted Worker must independently enforce admin=true AND SUPERADMIN_UID. ES5/iOS12. */
(function(w){
 'use strict';
 var cfg=w.RS_FIREBASE_CONFIG||{},tele=w.RS_TELEMETRY_CONFIG||{};
 function endpoint(){
   return cfg.projectId==='riveria-sanasto-community-test'&&
     tele&&tele.enabled===true&&
     typeof tele.endpoint==='string'&&
     /^https:\/\/[a-z0-9.-]+(?::443)?$/.test(tele.endpoint)&&
     (w.location||{}).hostname==='sanastoyhteiso.github.io'?tele.endpoint:null;
 }
 function checkUser(user){
   return !!(user&&user.emailVerified===true&&typeof user.getIdToken==='function'&&
     w.firebase&&w.firebase.auth&&w.firebase.auth().currentUser===user);
 }
 function request(user,path){
   var url=endpoint();
   if(!url||!checkUser(user)||!w.fetch)return Promise.reject(Error('NOT_CONFIGURED'));
   return user.getIdToken(false).then(function(token){
     if(!checkUser(user))throw Error('SESSION_CHANGED');
     return w.fetch(url+path,{method:'GET',cache:'no-store',credentials:'omit',mode:'cors',
       headers:{'Authorization':'Bearer '+token}});
   }).then(function(response){
     if(!checkUser(user))throw Error('SESSION_CHANGED');
     if(!response.ok){
       if(response.status===401||response.status===403)throw Error('ACCESS_DENIED');
       if(response.status===404||response.status===501||response.status===503)throw Error('NOT_CONFIGURED');
       throw Error('SERVICE_UNAVAILABLE');
     }
     return response.json();
   }).then(function(v){if(!checkUser(user))throw Error('SESSION_CHANGED');return v;});
 }
 function validDate(s){return s===null||(typeof s==='string'&&s.length<=35&&isFinite(Date.parse(s)));}
 function userRow(x){
   return x&&typeof x.email==='string'&&x.email.length<=254&&(x.email===''||x.email.indexOf('@')>0)&&
     typeof x.displayName==='string'&&x.displayName.length<=100&&
     typeof x.userKey==='string'&&/^[a-f0-9]{64}$/.test(x.userKey)&&
     typeof x.emailVerified==='boolean'&&typeof x.disabled==='boolean'&&
     validDate(x.createdAt)&&validDate(x.lastSignInAt);
 }
 function activityRow(x){
   return x&&typeof x.userKey==='string'&&/^[a-f0-9]{64}$/.test(x.userKey)&&
     typeof x.kind==='string'&&/^(visit|cards|tests|exam_start|exam_finish)$/.test(x.kind)&&
     typeof x.count==='number'&&isFinite(x.count)&&x.count>=1&&x.count<=31&&
     validDate(x.firstAt)&&validDate(x.lastAt);
 }
 function users(user,page){
   if(page!==undefined&&page!==null&&(!/^[A-Za-z0-9._~+\/=-]{1,1024}$/.test(page)))return Promise.reject(Error('BAD_PAGE'));
   var path='/v1/admin/users?limit=50'+(page?'&page='+encodeURIComponent(page):'');
   return request(user,path).then(function(v){
     if(!v||v.schema!==1||!Array.isArray(v.users)||v.users.length>50||
        v.users.some(function(x){return !userRow(x);})||
        !(v.nextPage===null||typeof v.nextPage==='string'&&/^[A-Za-z0-9._~+\/=-]{1,1024}$/.test(v.nextPage)))
       throw Error('INVALID_SERVER_RESPONSE');
     return {users:v.users,nextPage:v.nextPage};
   });
 }
 function activity(user){
   return request(user,'/v1/admin/activity?days=30').then(function(v){
     if(!v||v.schema!==1||v.coverage!=='opt_in_only'||!Array.isArray(v.rows)||
       v.rows.length>500||v.rows.some(function(x){return !activityRow(x);})||
       !validDate(v.updatedAt))throw Error('INVALID_SERVER_RESPONSE');
     return {rows:v.rows,updatedAt:v.updatedAt,coverage:v.coverage};
   });
 }
 w.RS_SUPERADMIN_READ={configured:function(){return !!endpoint();},users:users,activity:activity};
})(window);
