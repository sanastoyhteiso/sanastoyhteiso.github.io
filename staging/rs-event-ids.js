/* Staging only. Cryptographically unpredictable IDs for per-user events.
 * iOS 12 / older Safari compatible: no modern JS syntax.
 */
(function(root,factory){
 var api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.RS_EVENT_IDS=api;
})(this,function(){
 'use strict';
 function create(opts){
   opts=opts||{};
   var crypto=opts.crypto;
   if(!crypto||typeof crypto.getRandomValues!=='function')throw Error('Secure random IDs unavailable on this device');
   function next(){
     var bytes=new Uint8Array(16);
     crypto.getRandomValues(bytes);
     var out='E_';
     for(var i=0;i<bytes.length;i++)out+=('0'+bytes[i].toString(16)).slice(-2);
     return out;
   }
   function device(){return 'D_'+next().slice(2);}
   return {next:next,device:device};
 }
 return {create:create};
});
