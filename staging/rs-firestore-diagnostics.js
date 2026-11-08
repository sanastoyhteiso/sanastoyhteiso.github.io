/* Sanastoyhteisö Firestore READ-ONLY staging diagnostics.
 * Absolutely no POST/PATCH/DELETE, new documents, or localStorage writes.
 * Never displays/logs Firebase ID tokens or private response bodies.
 * Not loaded by the production site. ES5 syntax for older Safari.
 */
(function(root,factory){
  var api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.RS_FIRESTORE_DIAGNOSTICS=api;
})(this,function(){
  'use strict';
  function validId(x){return typeof x==='string'&&/^[A-Za-z0-9_-]{1,180}$/.test(x);}
  function create(opts){
    if(!opts||!validId(opts.projectId)||typeof opts.activeUid!=='function'||
       typeof opts.getToken!=='function'||typeof opts.request!=='function')
      throw Error('Missing read-only Firebase diagnostic dependencies');
    var base='https://firestore.googleapis.com/v1/projects/'+
      encodeURIComponent(opts.projectId)+'/databases/(default)/documents/';
    function run(){
      var uid=opts.activeUid();
      if(!validId(uid))return Promise.resolve({ok:false,stage:'auth',message:'Firebase login required'});
      // A reserved, synthetic UID is used. No real other user's UID/data is requested.
      var stranger='rs_diag_other_user_000000000';
      if(stranger===uid)stranger='rs_diag_other_user_111111111';
      var checks=[
        {name:'existing_settings',path:'settings/'+uid},
        {name:'owner_baseline',path:'sync_v3/'+uid+'/state/baseline'},
        {name:'other_account_baseline',path:'sync_v3/'+stranger+'/state/baseline'}
      ],results=[],token,stopped=false;
      return Promise.resolve().then(function(){return opts.getToken();}).then(function(t){
        if(opts.activeUid()!==uid)throw Error('Account changed');
        if(typeof t!=='string'||!t)throw Error('Firebase ID token unavailable');
        token=t;
        return checks.reduce(function(p,c){
          return p.then(function(){
            if(stopped)return null;
            if(opts.activeUid()!==uid)throw Error('Account changed');
            // Fixed GET; injected adapter must reject all other methods.
            return opts.request('GET',base+c.path,null,token).then(function(reply){
              var status=reply&&reply.status;
              var allowed=c.name==='other_account_baseline'?status===403:
                (status===200||status===404);
              var outcome={
                name:c.name,status:typeof status==='number'?status:0,pass:allowed,
                note:c.name==='other_account_baseline'?
                  (status===403?'Другой UID не может читать личный документ':
                   'Нужно проверить запрет чужого UID'):
                  (status===200?'Владелец имеет доступ; документ существует':
                   status===404?'Доступ разрешён; документ пока отсутствует':
                   'Правило или авторизация требуют проверки')
              };
              results.push(outcome);
              if(!allowed)stopped=true;
              // Important: never return reply.body, even on failure.
              return null;
            });
          });
        },Promise.resolve());
      }).then(function(){
        var ok=results.length===checks.length&&results.every(function(x){return x.pass;});
        return {ok:ok,stage:ok?'done':'rules',checks:results,
          message:ok?'Проверки чтения пройдены':'Некоторые проверки не прошли; запись запрещена'};
      }).catch(function(e){
        var msg=e&&e.message||'Network or authentication error';
        if(msg.indexOf('Account changed')!==-1)msg='Account changed';
        else if(msg.indexOf('token')!==-1||msg.indexOf('Token')!==-1)
          msg='Firebase authentication is unavailable';
        else msg='Connection could not be verified';
        return {ok:false,stage:'error',checks:results,message:msg};
      });
    }
    return {run:run};
  }
  return {create:create};
});
