/* RUN169 — opt-in daily presence and basic section statistics.
 * Off by default, per user+device. No answers, grades, words, URLs, IP or email
 * in the event body. Backend derives pseudonym from verified Firebase ID token.
 * Disabled if Cloudflare Worker is not configured. ES5 for Safari iOS 12.
 */
(function(w,d){
 'use strict';
 var PREFIX='rs_activity_consent_v1_',SENT='rs_activity_sent_v1_';
 var pending=false,attempted={},lastAccount='',waitingDelete=false,deleteBusy=false,deleteRetryAt=0;
 var labels={
  ru:{title:'Журнал посещений',info:'По желанию можно сообщать администратору о посещении сайта и открытии учебных разделов. Администратор может сопоставить эти события с твоим аккаунтом. Ответы, оценки и содержание словарей не отправляются. Хранение — до 30 дней. Согласие отдельно от диагностики ошибок.',
    check:'Разрешаю учёт моих посещений и учебных разделов',on:'Участие включено на этом устройстве.',off:'Участие выключено.',delete:'Отправлен запрос на удаление моей истории посещений.',pending:'Удаление истории ожидает соединения.'},
  fi:{title:'Käyntitilasto',info:'Voit vapaaehtoisesti ilmoittaa käynneistä ja opiskeluosioista ylläpitäjälle. Ylläpitäjä voi yhdistää tapahtumat käyttäjätiliisi. Vastauksia, arvosanoja tai sanastojen sisältöä ei lähetetä. Säilytys enintään 30 päivää. Erillinen suostumus.',
    check:'Sallin käyntieni ja opiskeluosioiden tilastoinnin',on:'Seuranta on käytössä tällä laitteella.',off:'Seuranta on pois käytöstä.',delete:'Käyntihistorian poistopyyntö lähetetty.',pending:'Poisto odottaa verkkoyhteyttä.'},
  en:{title:'Visit activity',info:'Optionally share site visits and section openings with the administrator. They may link events to your account. No answers, grades or vocabulary content are sent. Retention up to 30 days. This choice is separate from technical diagnostics.',
    check:'I agree to share visit and section activity',on:'Enabled on this device.',off:'Disabled.',delete:'My visit history removal request was sent.',pending:'Deletion is waiting for an internet connection.'}
 };
 function language(){
   var x=w.RS_I18N&&w.RS_I18N.getLanguage&&w.RS_I18N.getLanguage();
   return labels[x]?x:'ru';
 }
 function t(){return labels[language()];}
 function user(){
   var f=w.RS_FAMILY,auth=w.firebase&&w.firebase.auth&&w.firebase.auth(),v=auth&&auth.currentUser;
   return f&&f.uid&&v&&f.uid===v.uid&&v.emailVerified===true&&
     typeof v.getIdToken==='function'?v:null;
 }
 function config(){
   var x=w.RS_TELEMETRY_CONFIG||{},firebase=w.RS_FIREBASE_CONFIG||{};
   if(firebase.projectId!=='riveria-sanasto-community-test'||x.enabled!==true||
     typeof x.endpoint!=='string'||!/^https:\/\/[a-z0-9.-]+(?::443)?$/.test(x.endpoint)||
     (w.location||{}).hostname!=='sanastoyhteiso.github.io')return null;
   return x.endpoint;
 }
 function key(kind){var x=user();return x?PREFIX+x.uid+(kind||''):null;}
 function enabled(){
   var k=key('');if(!k||!config())return false;
   try{return w.localStorage.getItem(k)==='yes';}catch(e){return false;}
 }
 function note(message){
   var x=d.getElementById('rs-activity-status');
   if(x)x.textContent=message;
 }
 function today(){return String(Math.floor(Date.now()/86400000));}
 function eventsSent(){
   var k=key('_'+SENT);
   try{return k?JSON.parse(w.localStorage.getItem(k)||'{}'):{};}catch(e){return {};}
 }
 function acknowledge(kind){
   var k=key('_'+SENT);if(!k)return;
   try{var a=eventsSent();a[kind]=today();w.localStorage.setItem(k,JSON.stringify(a));}catch(e){}
 }
 function request(method,payload){
   var who=user(),endpoint=config();
   if(!who||!endpoint||!w.fetch||w.navigator.onLine===false)return Promise.reject(Error('NOT_AVAILABLE'));
   return who.getIdToken(false).then(function(token){
     if(user()!==who)throw Error('SESSION_CHANGED');
     return w.fetch(endpoint+'/v1/activity',{
       method:method,cache:'no-store',credentials:'omit',mode:'cors',
       headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
       body:method==='POST'?JSON.stringify(payload):undefined
     });
   }).then(function(res){
     if(user()!==who)throw Error('SESSION_CHANGED');
     if(!res.ok)throw Error('ACTIVITY_NOT_ACCEPTED');
     return true;
   });
 }
 function removeHistory(){
   var k=key('_pending-delete');if(!k)return Promise.resolve(false);
   try{w.localStorage.setItem(k,'yes');}catch(e){}
   if(deleteBusy||Date.now()<deleteRetryAt)return Promise.resolve(false);
   deleteBusy=true;
   return request('DELETE',null).then(function(){
     deleteBusy=false;deleteRetryAt=0;
     if(k===key('_pending-delete')){
       try{w.localStorage.removeItem(k);w.localStorage.removeItem(key('_'+SENT));}catch(e){}
       waitingDelete=false;note(t().delete);
       if(enabled())record('visit');
     }
     return true;
   },function(){
     deleteBusy=false;deleteRetryAt=Date.now()+60000;
     waitingDelete=true;note(t().pending);return false;
   });
 }
 function flushDelete(){
   var k=key('_pending-delete');if(!k)return;
   try{if(w.localStorage.getItem(k)==='yes')removeHistory();}catch(e){}
 }
 function record(kind){
   if(!/^(visit|cards|tests|exam_start|exam_finish)$/.test(kind)||!enabled())return false;
   var x=user();if(!x)return false;
   try{
     if(w.localStorage.getItem(key('_pending-delete'))==='yes'){
       flushDelete();return false; // delete the previous history before recording a new opted-in event
     }
   }catch(e){return false;}
   if(attempted[x.uid+'_'+kind]===today()||eventsSent()[kind]===today()||pending)return false;
   attempted[x.uid+'_'+kind]=today();pending=true;
   request('POST',{v:1,kind:kind,consent:true}).then(function(){
     pending=false;if(user()===x&&enabled())acknowledge(kind);
   },function(){pending=false;});
   return true;
 }
 function html(){
   var x=t();return '<div class="panel"><h2>'+x.title+'</h2>'+
     '<p class="hint">'+x.info+'</p>'+
     '<label class="field"><span><input type="checkbox" id="rs-activity-consent"'+
     (enabled()?' checked':'')+'> '+x.check+'</span></label>'+
     '<p class="hint" id="rs-activity-status">'+(enabled()?x.on:x.off)+'</p></div>';
 }
 function consent(value){
   var k=key('');if(!k)return;
   try{if(value)w.localStorage.setItem(k,'yes');else w.localStorage.removeItem(k);}catch(e){return;}
   if(value){note(t().on);record('visit');}
   else{note(t().off);removeHistory();}
 }
 d.addEventListener('change',function(e){
   if(e.target&&e.target.id==='rs-activity-consent')consent(e.target.checked);
 });
 w.addEventListener('online',function(){flushDelete();});
 w.addEventListener('focus',function(){
   var x=user();if(x&&x.uid!==lastAccount){lastAccount=x.uid;attempted={};}
   flushDelete();record('visit');
 });
 w.RS_ACTIVITY_CLIENT={panelHtml:html,record:record,enabled:enabled,deleteOwnVisits:removeHistory};
})(window,document);
