/*
 * Sanastoyhteisö V3 technical diagnostics opt-in transport, Safari iOS12 ES5.
 * OFF by default: requires external owner-controlled trusted backend and each
 * user's explicit per-device consent. Sends only fixed technical code, coarse
 * browser category, release and random event ID; no raw errors, URL, UID, email,
 * study answers, stacks, custom text or patient information.
 * Firebase ID token is only sent to HTTPS backend in Authorization header.
 */
(function(w,d){
 'use strict';
 var PROJECT='riveria-sanasto-community-test',QUEUE='rs_mon_queue_v1',
   PREFIX='rs_mon_consent_v1_',RELEASE='v3.0.0-rc10';
 var busy=false,nextAttempt=0,testId=null,testSent=false;
 function testMessage(message){
   var node=d.getElementById('rs-monitor-test-status');
   if(node)node.textContent=message;
 }
 function testControls(){
   var button=d.getElementById('rs-monitor-test-send');
   if(button)button.disabled=!enabled()||testSent;
   var note=d.getElementById('rs-monitor-consent-status');
   if(note&&config())note.textContent=enabled()?
      'Диагностика включена для этого аккаунта и устройства.':
      'Диагностика отключена до моего согласия.';
 }
 function config(){
   var c=w.RS_TELEMETRY_CONFIG||{},fc=w.RS_FIREBASE_CONFIG||{};
   return fc.projectId===PROJECT&&c.enabled===true&&typeof c.endpoint==='string'&&
     /^https:\/\/[a-z0-9.-]+(?::443)?$/.test(c.endpoint)&&
     c.endpoint.indexOf('..')===-1&&
     (w.location||{}).hostname==='sanastoyhteiso.github.io'?c:null;
 }
 function uid(){
   var f=w.RS_FAMILY,auth=w.firebase&&w.firebase.auth&&w.firebase.auth();
   var user=auth&&auth.currentUser;
   if(!f||!f.uid||!user||user.uid!==f.uid||user.emailVerified!==true)return null;
   return f.uid;
 }
 function enabled(){var x=uid();if(!x||!config())return false;
   try{return w.localStorage.getItem(PREFIX+x)==='yes';}catch(ignore){return false;}
 }
 function read(){
   try{var x=JSON.parse(w.sessionStorage.getItem(QUEUE)||'[]');if(!Array.isArray(x))return [];
     return x.filter(function(v){return v&&v.v===1&&typeof v.id==='string'&&
       /^E_[a-f0-9]{32}$/.test(v.id)&&typeof v.at==='number'&&
       Date.now()-v.at<86400000&&v.at<=Date.now()+300000&&
       /^[-A-Z0-9_]{5,60}$/.test(v.code);}).slice(-10);
   }catch(ignore){return [];}
 }
 function write(items){try{w.sessionStorage.setItem(QUEUE,JSON.stringify(items.slice(-10)));return true;}catch(ignore){return false;}}
 function browser(){
   var u=(w.navigator&&w.navigator.userAgent)||'';
   if(/iPhone|iPad|iPod/.test(u))return 'ios-safari';
   if(/Edg\//.test(u))return 'edge';
   if(/Firefox\//.test(u))return 'firefox';
   if(/Chrome\//.test(u))return 'chrome';
   if(/Safari\//.test(u))return 'safari';return 'other';
 }
 function newId(){
   if(!w.crypto||!w.crypto.getRandomValues)return null;
   var bytes=new Uint8Array(16);w.crypto.getRandomValues(bytes);
   return 'E_'+Array.prototype.map.call(bytes,function(b){return ('0'+b.toString(16)).slice(-2);}).join('');
 }
 function queueCode(code,isTest){
   // No event leaves the device unless this user explicitly enabled it.
   if(!enabled()||(isTest===true&&testSent))return false; // explicit consent; one test per page
   var allow={APP_RENDER_FAILED:1,SYNC_UPLOAD_FAILED:1,SYNC_DOWNLOAD_FAILED:1,
     SYNC_QUEUE_STUCK:1,INDEXEDDB_UNAVAILABLE:1,CACHE_MISMATCH:1,
     OFFLINE_REPLAY_FAILED:1,FIRESTORE_PERMISSION_DENIED:1,
     AUTH_REFRESH_FAILED:1,AUTH_PERMISSION_DENIED:1,
     STORAGE_QUOTA_EXCEEDED:1,BACKUP_VERIFY_FAILED:1};
   if(!Object.prototype.hasOwnProperty.call(allow,code))return false;
   var id=newId();if(!id)return false;
   var items=read();items.push({v:1,id:id,code:code,at:Date.now()});
   if(!write(items))return false;
   if(isTest===true){testSent=true;testId=id;}
   flush();return true;
 }
 function flush(){
   var cfg=config();
   if(!cfg||!enabled()||busy||w.navigator.onLine===false||
     !w.fetch||Date.now()<nextAttempt)return;
   var items=read();if(!items.length)return;
   var who=uid();if(!who)return;
   var user=w.firebase.auth().currentUser;
   var event=items[0];busy=true;
   function done(){busy=false;}
   user.getIdToken(false).then(function(token){
     if(!enabled()||uid()!==who)throw Error('SESSION_CHANGED');
     return w.fetch(cfg.endpoint+'/v1/events',{
       method:'POST',mode:'cors',cache:'no-store',credentials:'omit',
       headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},
       body:JSON.stringify({v:1,id:event.id,code:event.code,release:RELEASE,browser:browser()})
     });
   }).then(function(response){
     if(!enabled()||uid()!==who){done();return;}
     if(response.status===200||response.status===201){
       var current=read().filter(function(x){return x.id!==event.id;});
       write(current);
       if(event.id===testId){
         testMessage('Тестовый сигнал ПОДТВЕРЖДЁН сервером (HTTP '+response.status+
           '). Это проверочное событие, а не настоящая ошибка. Обновите сводку в админке.');
         testId=null;
       }
       done();if(current.length)flush();
     }else{
       // No false ACK; quota errors are retried at the next network/focus cycle.
       if(event.id===testId)testMessage('Тестовый сигнал пока НЕ принят (HTTP '+response.status+
         '). Проверьте подключение и права, не повторяйте нажатие.');
       nextAttempt=Date.now()+60000;done();
     }
   }).catch(function(){
     // Never re-throw diagnostics failures or interrupt studying.
     if(event.id===testId)testMessage('Нет подтверждения получения тестового сигнала. '+
       'Он остался в локальной очереди для повторной попытки.');
     nextAttempt=Date.now()+60000;done();
   });
 }
 function panelHtml(){
   var available=!!config(),yes=enabled();
   return '<div class="panel"><h2>Техническая диагностика сайта</h2>'+
     '<p>При согласии отправляются только технические коды ошибок и категория браузера. Учебные ответы, слова, UID, email, текст ошибки и ссылки не отправляются. Отправка не влияет на обучение.</p>'+
     '<p><label><input type="checkbox" id="rs-monitor-consent" '+
       (yes?'checked ':'')+(available?'':'disabled ')+
       '> Разрешить отправку технических сбоев с этого устройства</label></p>'+
     '<p><button type="button" id="rs-monitor-test-send" '+
        (!yes||testSent?'disabled ':'')+
        '>Отправить один тестовый сигнал</button></p>'+
     '<p class="hint" id="rs-monitor-test-status">Только по вашему нажатию: '+
       'проверочный код CACHE_MISMATCH будет учтён как 1 техническое событие за 24 часа, '+
       'но не означает настоящую неисправность.</p>'+
     '<p class="hint" id="rs-monitor-consent-status">'+(available?
       (yes?'Диагностика включена для этого аккаунта и устройства.':'Диагностика отключена до моего согласия.'):
       'Серверный мониторинг пока не подключён.')+'</p></div>';
 }
 function consent(next){
   var who=uid(),cfg=config();
   if(!who||!cfg)return false;
   try{
     if(next)w.localStorage.setItem(PREFIX+who,'yes');
     else{w.localStorage.removeItem(PREFIX+who);write([]);testId=null;testSent=false;}
   }catch(ignore){return false;}
   if(next)flush();testControls();return true;
 }
 d.addEventListener('change',function(e){
   if(!e.target||e.target.id!=='rs-monitor-consent')return;
   if(!consent(e.target.checked))e.target.checked=false;
   testControls();
 });
 d.addEventListener('click',function(e){
   if(!e.target||e.target.id!=='rs-monitor-test-send')return;
   if(!enabled()||testSent)return;
   if(queueCode('CACHE_MISMATCH',true)){
     testMessage('Тестовый сигнал поставлен в очередь. Ожидается подтверждение сервера. '+
       'Не отправляйте повторный тест.');
     testControls();
   }else testMessage('Не удалось поставить тест в очередь; данные не отправлены.');
 });
 w.addEventListener('online',flush);
 w.addEventListener('focus',flush);
 w.RS_MONITOR_CLIENT={queueCode:queueCode,flush:flush,panelHtml:panelHtml,
   isEnabled:enabled,isConfigured:function(){return !!config();},setConsent:consent};
})(window,document);
