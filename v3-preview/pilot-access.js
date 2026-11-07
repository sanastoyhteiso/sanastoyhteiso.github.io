/* Read-only owner pilot. A static-site UI gate is not a server-side security boundary.
 * Firebase Security Rules remain the authority; no claims/tokens/private fields logged.
 * ES5 for Safari 12.
 */
(function(w,d){
 'use strict';
 var auth=null,serial=0;
 function note(message){var x=d.getElementById('pilot-status');if(x)x.textContent=message;}
 function lock(message){
   if(d.documentElement.className.indexOf('rs-v3-pilot-locked')<0)
     d.documentElement.className+=' rs-v3-pilot-locked';
   note(message);
 }
 function unlock(){
   d.documentElement.className=d.documentElement.className.replace(/(?:^|\s)rs-v3-pilot-locked(?=\s|$)/g,' ');
   note('Администратор подтверждён. Карточки и тесты работают локально; облачные изменения отключены.');
 }
 function init(){
   var f=w.firebase,c=w.RS_FIREBASE_CONFIG||{};
   if(!f||typeof f.auth!=='function'||!f.apps||!c.apiKey||
     c.projectId!=='riveria-sanasto-community-test'||
     c.authDomain!=='riveria-sanasto-community-test.firebaseapp.com'||
     w.location.hostname!=='sanastoyhteiso.github.io'||
     w.location.pathname.indexOf('/v3-preview/')!==0){
     lock('Доступ закрыт: неподходящая среда.');return;
   }
   try{
     if(!f.apps.length)f.initializeApp(c);
     auth=f.auth();
     auth.onIdTokenChanged(function(u){
       var id=++serial;
       if(!u){lock('Войди через Google для проверки доступа владельца.');return;}
       if(u.emailVerified!==true||u.isAnonymous===true){lock('Требуется подтверждённый Google-администратор.');return;}
       u.getIdTokenResult(true).then(function(result){
         if(id!==serial||auth.currentUser!==u)return;
         if(result&&result.claims&&result.claims.admin===true)unlock();
         else lock('Этот аккаунт не администратор. Продолжай обучение на основной версии сайта.');
       },function(){if(id===serial)lock('Ошибка проверки прав. Обнови страницу или войди ещё раз.');});
     },function(){lock('Ошибка проверки Firebase Authentication.');});
   }catch(ignore){lock('Firebase-вход пока недоступен.');}
 }
 if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init);else init();
})(window,document);
