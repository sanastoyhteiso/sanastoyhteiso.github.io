/* STAGING CLASSIC ONLY: no real Auth, Firestore, Google Drive, user accounts.
 * Only synthetic preview storage prefixed with rs_v3_classic_demo__ is used.
 */
(function(w){
 'use strict';
 var prefix='rs_v3_classic_demo__';
 w.RS_FIREBASE_CONFIG={};
 w.RS_FAMILY={
   uid:'demo-staging-account-not-real',
   email:'DEMO (no real sign-in)',
   storageKey:function(k){return prefix+k;},
   sharedEnabled:function(){return true;},
   statusText:function(){return 'DEMO — no cloud connection';},
   sync:function(){return Promise.reject(Error('Cloud sync disabled in demo'));},
   schedule:function(){},logout:function(){},
   migrate:function(){},setScope:function(){},
   getToken:function(){return Promise.reject(Error('Auth disabled in demo'));}
 };
 w.RS_COMM={
   subscribedTerms:function(){return [];},
   dataPanel:function(){
     var info='<div class="rs-demo-ribbon"><b>DEMO / ТОЛЬКО ДЕМОНСТРАЦИЯ</b> '+
       'Синхронизация и вход отключены. Данные настоящих пользователей не загружаются. '+
       'Сохраняй здесь только вымышленные учебные ответы. Не вводи информацию пациентов.</div>';
     var html=w.RS_ADMIN_PREVIEW&&w.RS_ADMIN_PREVIEW.render(
       {admin:true},{catalogVersion:'STAGING — no real metrics'},w.RS_I18N?
         w.RS_I18N.getLanguage():'ru')||'';
     return info+'<div class="panel"><h2>Настройки сайта — пример</h2>'+
       '<p>Административный доступ здесь имитирован. Серверная проверка прав '+
       'появится только после отдельного разрешённого теста.</p>'+html+'</div>';
   },
   renderUsers:function(node){node.innerHTML='<div class="panel"><h2>Пользователи</h2>'+
     '<p>Список пользователей недоступен в отдельной тестовой версии.</p></div>';},
   renderLibrary:function(node){node.innerHTML='<div class="panel"><h2>Библиотека</h2>'+
     '<p>Общий каталог доступен для упражнений, пользовательские библиотеки здесь отключены.</p></div>';}
 };
})(window);
