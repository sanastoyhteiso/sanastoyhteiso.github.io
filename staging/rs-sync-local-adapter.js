/* STAGING ONLY. A read-only adapter for the EXISTING per-UID local keys.
 * Does not write localStorage, dispatch rs:datachange, enable sync or call Firebase.
 * It must be explicitly wired after migration verification in an isolated pilot.
 */
(function(root,factory){
 var api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.RS_SYNC_LOCAL_ADAPTER=api;
})(this,function(){
 'use strict';
 function plain(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
 function clone(x){return JSON.parse(JSON.stringify(x));}
 function create(opts){
   if(!opts||!opts.uid||typeof opts.activeUid!=='function'||
      !opts.storage||typeof opts.storage.getItem!=='function'||
      typeof opts.storageKey!=='function')
     throw Error('Missing read-only local adapter dependencies');
   function assertUid(){
     if(opts.activeUid()!==opts.uid)throw Error('Active account changed; stop local audit');
   }
   function key(base){
     // Matches family.js. Require the current UID-specific key, never legacy
     // global keys or another user's personal storage.
     var expected='rs_family_v1_'+opts.uid+'__'+base;
     if(opts.storageKey(base)!==expected)
       throw Error('Local account storage key mismatch');
     return expected;
   }
   function getSnapshot(){
     assertUid();
     var names=['rs_scores_v1','rs_user_words_v1','rs_favorites_v1'];
     var values=[],confirm=[],i;
     for(i=0;i<names.length;i++)values.push(opts.storage.getItem(key(names[i])));
     assertUid();
     // Second read catches most cross-tab write races; the controller also
     // fingerprints the normalized snapshot before/after the network request.
     for(i=0;i<names.length;i++)confirm.push(opts.storage.getItem(key(names[i])));
     assertUid();
     for(i=0;i<names.length;i++)
       if(values[i]!==confirm[i])throw Error('Local data changed while reading');
     function decode(i,empty){
       if(values[i]===null)return empty;
       try{return JSON.parse(values[i]);}
       catch(e){throw Error('Corrupt local JSON; preserve original data');}
     }
     var scores=decode(0,{}),words=decode(1,[]),favorites=decode(2,{});
     if(!plain(scores)||!Array.isArray(words)||!plain(favorites))
       throw Error('Invalid local progress schema');
     var seen={};
     words.forEach(function(w){
       if(!plain(w)||typeof w.id!=='string'||!w.id||
          typeof w.fi!=='string'||!w.fi||
          typeof w.ru!=='string'||!w.ru||seen[w.id])
         throw Error('Invalid or duplicate user word; do not merge');
       seen[w.id]=true;
     });
     Object.keys(scores).forEach(function(id){
       if(!plain(scores[id]))throw Error('Invalid local score; do not merge');
     });
     return clone({scores:scores,words:words,favorites:favorites});
   }
   function subscribe(event,listener){
     var win=opts.windowTarget,doc=opts.documentTarget;
     var target=event==='visible'?doc:win;
     var name=event==='visible'?'visibilitychange':event;
     if(!target||typeof target.addEventListener!=='function'||
        typeof target.removeEventListener!=='function')
       throw Error('Missing event target for '+event);
     var fn=event==='visible'?function(){if(!doc.hidden)listener();}:listener;
     target.addEventListener(name,fn);
     return function(){target.removeEventListener(name,fn);};
   }
   return {getSnapshot:getSnapshot,subscribe:subscribe};
 }
 return {create:create};
});
