/* Staging only. Minimal HTTP adapter for Firebase REST.
 * The Firebase Auth ID token is passed in memory from getIdToken().
 * Never stores, logs, or exports the token.
 */
(function(root,factory){
 var api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.RS_SYNC_HTTP=api;
})(this,function(){
 'use strict';
 function create(opts){
   opts=opts||{};
   var factory=opts.xhr||function(){return new XMLHttpRequest();};
   return function(method,url,body,token){
     if(['GET','POST','PATCH'].indexOf(method)===-1||!/^https:\/\/firestore\.googleapis\.com\/v1\//.test(url)||
        typeof token!=='string'||!token)return Promise.reject(Error('Invalid Firestore HTTP request'));
     return new Promise(function(resolve,reject){
       var x=factory();
       try{
         x.open(method,url,true);x.timeout=opts.timeout||20000;
         x.setRequestHeader('Authorization','Bearer '+token);
         x.setRequestHeader('Accept','application/json');
         if(body!==null&&body!==undefined)x.setRequestHeader('Content-Type','application/json');
       }catch(e){reject(Error('Could not initialize Firestore HTTP request'));return;}
       x.onload=function(){
         var result=null;
         try{result=JSON.parse(x.responseText||'{}');}catch(e){}
         resolve({status:x.status,body:result});
       };
       x.onerror=function(){reject(Error('Firestore network error'));};
       x.ontimeout=function(){reject(Error('Firestore request timeout'));};
       x.onabort=function(){reject(Error('Firestore request aborted'));};
       try{x.send(body==null?null:JSON.stringify(body));}
       catch(e){reject(Error('Firestore network request failed'));}
     });
   };
 }
 return {create:create};
});
