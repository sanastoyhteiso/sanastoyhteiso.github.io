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
  function val(x,depth,largeBaseline){
    depth=depth||0;
    // The snapshot contains hundreds of distinct scores, not a small event.
    var maxDepth=largeBaseline?12:8;
    if(depth>maxDepth)throw Error('Firestore value nesting exceeds safe limit');
    if(x===null)return {nullValue:null};
    if(str(x)){
      if(x.length>(largeBaseline?32000:8000))throw Error('Text exceeds safe limit');
      return {stringValue:x};
    }
    if(typeof x==='boolean')return {booleanValue:x};
    if(safeNumber(x))return {integerValue:String(x)};
    if(typeof x==='number'&&isFinite(x))return {doubleValue:x};
    if(Object.prototype.toString.call(x)==='[object Array]'){
      if(x.length>(largeBaseline?5000:100))throw Error('Array too large');
      return {arrayValue:{values:x.map(function(a){return val(a,depth+1,largeBaseline);})}};
    }
    if(x&&typeof x==='object'){
      var out={},keys=Object.keys(x);
      if(keys.length>(largeBaseline?5000:40))throw Error('Map has too many fields');
      keys.forEach(function(k){
        // Baseline may include user word IDs with hyphens. Firebase map keys
        // accept such UTF-8 names, while reserved __...__ names are excluded.
        if(!k||k.length>240||/^__.*__$/.test(k)||/[\u0000-\u001f\u007f]/.test(k))
          throw Error('Unsafe Firestore map key');
        out[k]=val(x[k],depth+1,largeBaseline);
      });
      return {mapValue:{fields:out}};
    }
    throw Error('Unsupported value in Firestore document');
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
       source:val('approved-local-JSON'),snapshot:val(migration.snapshot,0,true)}};
    if(JSON.stringify(obj).length>600000)throw Error('Migration baseline exceeds safe document size');
    return obj;
  }
  function decodeValue(v,depth){
    depth=depth||0;
    if(depth>12||!v||typeof v!=='object')throw Error('Invalid Firestore value');
    if(Object.prototype.hasOwnProperty.call(v,'stringValue'))return v.stringValue;
    if(Object.prototype.hasOwnProperty.call(v,'booleanValue'))return v.booleanValue;
    if(Object.prototype.hasOwnProperty.call(v,'nullValue'))return null;
    if(Object.prototype.hasOwnProperty.call(v,'integerValue')){
      var n=Number(v.integerValue);
      if(!safeNumber(n))throw Error('Firestore integer precision lost');
      return n;
    }
    if(Object.prototype.hasOwnProperty.call(v,'doubleValue')){
      var d=Number(v.doubleValue);
      if(!isFinite(d))throw Error('Non-finite Firestore double');
      return d;
    }
    if(Object.prototype.hasOwnProperty.call(v,'arrayValue'))
      return ((v.arrayValue||{}).values||[]).map(function(x){return decodeValue(x,depth+1);});
    if(Object.prototype.hasOwnProperty.call(v,'mapValue')){
      var obj={},fields=(v.mapValue||{}).fields||{};
      Object.keys(fields).forEach(function(k){obj[k]=decodeValue(fields[k],depth+1);});
      return obj;
    }
    throw Error('Unsupported Firestore value type');
  }
  function decodeDocument(d){
    if(!d||!d.fields)throw Error('Firestore document fields missing');
    var result={};
    Object.keys(d.fields).forEach(function(k){result[k]=decodeValue(d.fields[k],0);});
    return result;
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
    function listEvents(uid){
      if(!id(uid)||opts.activeUid()!==uid)return Promise.reject(Error('Account changed'));
      var url=base+encodeURIComponent(uid)+'/events',batchSize=100,maxPages=10;
      var out=[],seen={},token=null,page=0;
      function next(){
        if(page>=maxPages)throw Error('Too many event pages; do not apply partial sync');
        if(opts.activeUid()!==uid)throw Error('Account changed');
        page++;
        return Promise.resolve().then(function(){return opts.getToken();}).then(function(authToken){
          if(opts.activeUid()!==uid)throw Error('Account changed');
          if(!str(authToken)||!authToken)throw Error('Auth token unavailable');
          var q='?pageSize='+batchSize+(token?'&pageToken='+encodeURIComponent(token):'');
          return opts.request('GET',url+q,null,authToken);
        }).then(function(reply){
          if(!reply||reply.status!==200||!reply.body)throw Error('Firestore event listing rejected');
          var docs=reply.body.documents||[];
          if(!Array.isArray(docs)||docs.length>batchSize)throw Error('Invalid Firestore response page');
          docs.forEach(function(d){
            var x=decodeDocument(d);
            var name=String(d.name||'').split('/').pop();
            if(x.uid!==uid||x.id!==name||!/^E_[a-f0-9]{32}$/.test(x.id)||
               !/^D_[a-f0-9]{32}$/.test(x.device)||!x.kind||!x.data)
              throw Error('Cloud event identity invalid; cannot merge');
            if(seen[x.id]){
              if(seen[x.id]!==canonical(x))throw Error('Conflicting cloud event IDs');
            }else{
              seen[x.id]=canonical(x);out.push(x);
            }
          });
          token=reply.body.nextPageToken||null;
          if(token){
            if(typeof token!=='string'||page>=maxPages)
              throw Error('Event pagination limit; never apply partial snapshot');
            return next();
          }
          if(opts.activeUid()!==uid)throw Error('Account changed');
          return out;
        });
      }
      return next();
    }
    return {putEvents:putEvents,putOne:putOne,getBaseline:getBaseline,
      putBaseline:putBaseline,listEvents:listEvents,decodeDocument:decodeDocument};
  }
  return {create:create,record:record,baselineDocument:baselineDocument,
    sameRecord:sameRecord,decodeValue:decodeValue,decodeDocument:decodeDocument};
});
