/* Staging only. Never loaded by production index.html.
 * Firebase Firestore REST transport for per-UID immutable v3 events.
 * Uses current user's Firebase Auth ID token. Does NOT use Google Drive OAuth.
 * Only POSTs to sync_v3; no admin operations or public document reads.
 */
(function(root,factory){
  var api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.RS_FIRESTORE_TRANSPORT=api;
})(this,function(){
  'use strict';
  function id(v){return typeof v==='string'&&/^[a-zA-Z0-9_-]{1,180}$/.test(v);}
  function str(s){return typeof s==='string';}
  function safeNumber(x){return typeof x==='number'&&isFinite(x)&&Math.floor(x)===x&&Math.abs(x)<=9007199254740991;}
  function val(x,depth){
    depth=depth||0;if(depth>8)throw Error('Nested event data too deep');
    if(x===null)return {nullValue:null};
    if(str(x)){if(x.length>8000)throw Error('Event text exceeds limit');return {stringValue:x};}
    if(typeof x==='boolean')return {booleanValue:x};
    if(safeNumber(x))return {integerValue:String(x)};
    if(typeof x==='number'&&isFinite(x))return {doubleValue:x};
    if(Object.prototype.toString.call(x)==='[object Array]'){
      if(x.length>100)throw Error('Event array too large');
      return {arrayValue:{values:x.map(function(a){return val(a,depth+1);})}};
    }
    if(x&&typeof x==='object'){
      var out={},keys=Object.keys(x);
      if(keys.length>40)throw Error('Event has too many fields');
      keys.forEach(function(k){
        if(!/^[A-Za-z_][A-Za-z0-9_]{0,90}$/.test(k))throw Error('Invalid event field');
        out[k]=val(x[k],depth+1);
      });
      return {mapValue:{fields:out}};
    }
    throw Error('Unsupported event data');
  }
  function record(uid,e){
    if(!id(uid)||!e||!/^E_[a-f0-9]{32}$/.test(e.id)||!/^D_[a-f0-9]{32}$/.test(e.device)||!id(e.target)||
       !/^(answer|learned_set|favorite_set|word_upsert|word_delete)$/.test(e.kind)||
       !safeNumber(e.time))throw Error('Invalid event envelope');
    var fields={v:val(3),uid:val(uid),id:val(e.id),device:val(e.device),
      kind:val(e.kind),target:val(e.target),time:val(e.time),data:val(e.data)};
    var doc={fields:fields};
    if(JSON.stringify(doc).length>15000)throw Error('Event exceeds size limit');
    return doc;
  }
  function canonical(x){
    if(x===null||typeof x!=='object')return JSON.stringify(x);
    if(Object.prototype.toString.call(x)==='[object Array]')
      return '['+x.map(canonical).join(',')+']';
    return '{'+Object.keys(x).sort().map(function(k){return JSON.stringify(k)+':'+canonical(x[k]);}).join(',')+'}';
  }
  function sameRecord(want,actual){
    if(!actual||!actual.fields)return false;
    return canonical(want.fields)===canonical(actual.fields);
  }
  function baselineDocument(uid,migration){
    if(!id(uid)||!migration||!id(migration.migrationId)||
       !safeNumber(migration.createdAt)||!migration.snapshot||
       !migration.snapshot.scores||!migration.snapshot.words||!migration.snapshot.favorites||
       typeof migration.sha256!=='string'||!/^[a-f0-9]{64}$/.test(migration.sha256))
       throw Error('Invalid verified migration baseline');
    var obj={fields:{v:val(3),uid:val(uid),migrationId:val(migration.migrationId),
       importedAt:val(migration.createdAt),sha256:val(migration.sha256),
       source:val('approved-local-JSON'),snapshot:val(migration.snapshot)}};
    if(JSON.stringify(obj).length>600000)throw Error('Migration baseline exceeds safe document size');
    return obj;
  }
  function create(opts){
    if(!opts||!id(opts.projectId)||typeof opts.getToken!=='function'||
       typeof opts.request!=='function'||typeof opts.activeUid!=='function')
       throw Error('Missing secure transport dependencies');
    var base='https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(opts.projectId)+
      '/databases/(default)/documents/sync_v3/';
    function putOne(uid,e){
      if(!id(uid)||opts.activeUid()!==uid)return Promise.reject(Error('Account changed'));
      var want=record(uid,e);
      var url=base+encodeURIComponent(uid)+'/events';
      return Promise.resolve().then(function(){return opts.getToken();}).then(function(token){
        if(opts.activeUid()!==uid)throw Error('Account changed');
        if(!str(token)||!token)throw Error('Auth token unavailable');
        return opts.request('POST',url+'?documentId='+encodeURIComponent(e.id),want,token);
      }).then(function(reply){
        if(reply&&reply.status>=200&&reply.status<300)return e.id;
        if(!reply||![409,412].includes(reply.status))throw Error('Firestore write rejected: '+(reply&&reply.status||'network'));
        // A retry may find a prior commit. NEVER ACK mere ID collision.
        return Promise.resolve().then(function(){return opts.getToken();}).then(function(token){
          if(opts.activeUid()!==uid)throw Error('Account changed');
          return opts.request('GET',url+'/'+encodeURIComponent(e.id),null,token);
        }).then(function(existing){
          if(existing&&existing.status===200&&sameRecord(want,existing.body))return e.id;
          throw Error('Event ID exists but content differs');
        });
      });
    }
    function putEvents(uid,events){
      if(!id(uid)||opts.activeUid()!==uid||!Array.isArray(events)||events.length>12)
        return Promise.reject(Error('Invalid event batch'));
      var ack=[],failures=0;
      return events.reduce(function(p,e){
        return p.then(function(){
          return putOne(uid,e).then(function(id){ack.push(id);},function(){failures++;});
        });
      },Promise.resolve()).then(function(){
        // Partial commits return only acknowledged IDs; caller must retry the rest.
        if(!ack.length&&failures)throw Error('No Firestore acknowledgments');
        return ack;
      });
    }
    function getBaseline(uid){
      if(!id(uid)||opts.activeUid()!==uid)return Promise.reject(Error('Account changed'));
      var url=base+encodeURIComponent(uid)+'/state/baseline';
      return Promise.resolve().then(function(){return opts.getToken();}).then(function(token){
        if(opts.activeUid()!==uid)throw Error('Account changed');
        return opts.request('GET',url,null,token);
      }).then(function(reply){
        if(reply&&reply.status===200)return reply.body;
        if(reply&&reply.status===404)return null;
        throw Error('Could not read migration baseline');
      });
    }
    function putBaseline(uid,migration,approval){
      if(approval!=='VERIFIED_PERSONAL_JSON_AND_SHEET')
        return Promise.reject(Error('Migration not approved'));
      if(!id(uid)||opts.activeUid()!==uid)
        return Promise.reject(Error('Account changed'));
      var wanted=baselineDocument(uid,migration),url=base+encodeURIComponent(uid)+'/state/baseline';
      return Promise.resolve().then(function(){return opts.getToken();}).then(function(token){
        if(opts.activeUid()!==uid)throw Error('Account changed');
        return opts.request('PATCH',url+'?currentDocument.exists=false',wanted,token);
      }).then(function(reply){
        if(reply&&reply.status>=200&&reply.status<300)return {saved:true,alreadyExisted:false};
        if(!reply||[409,412].indexOf(reply.status)<0)throw Error('Baseline write rejected');
        return getBaseline(uid).then(function(actual){
          if(!sameRecord(wanted,actual))throw Error('Existing migration baseline differs; never overwrite');
          return {saved:true,alreadyExisted:true};
        });
      });
    }
    return {putEvents:putEvents,putOne:putOne,getBaseline:getBaseline,putBaseline:putBaseline};
  }
  return {create:create,record:record,baselineDocument:baselineDocument,sameRecord:sameRecord};
});
