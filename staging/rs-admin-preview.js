/* STAGING ONLY — NOT INCLUDED IN PRODUCTION INDEX.HTML.
 * Admin UI is read-only. A valid server-issued Firebase custom claim controls
 * its visibility; SERVER RULES must independently enforce every admin read.
 * This module never fetches users, emails, tokens or personal vocabulary.
 */
(function(root,factory){
 var api=factory();
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.RS_ADMIN_PREVIEW=api;
})(this,function(){
 'use strict';
 function esc(x){return String(x===undefined||x===null?'—':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
 function allowed(claims){return !!(claims&&claims.admin===true);}
 function sanitize(metrics){
   metrics=metrics||{};
   function num(n){var v=Number(metrics[n]);return isFinite(v)&&v>=0?String(Math.floor(v)):'—';}
   return {registered:num('registered'),active7d:num('active7d'),
     syncFailed24h:num('syncFailed24h'),pendingKnown:num('pendingKnown'),
     backupAt:metrics.backupAt?esc(metrics.backupAt):'—',
     catalogVersion:metrics.catalogVersion?esc(metrics.catalogVersion):'—'};
 }
 function render(claims,metrics){
   if(!allowed(claims))return '';
   var m=sanitize(metrics),cells=[
     ['Зарегистрированные пользователи',m.registered],
     ['Активные за 7 дней',m.active7d],
     ['Ошибки синхронизации за 24 часа',m.syncFailed24h],
     ['Ожидают синхронизации (известные серверу)',m.pendingKnown],
     ['Последняя проверенная резервная копия',m.backupAt],
     ['Версия общего словаря',m.catalogVersion]
   ],html='<section class="rs-admin" aria-label="Настройки сайта"><h2>Настройки сайта</h2>'+
      '<p>Сведения только для администратора. Административные права проверяются сервером.</p>'+
      '<div class="rs-admin-grid">';
   cells.forEach(function(c){html+='<div class="rs-admin-tile"><strong>'+esc(c[0])+'</strong><p>'+c[1]+'</p></div>';});
   return html+'</div><p>Безопасный режим: данные только для просмотра. Удаление аккаунтов и изменение прав здесь недоступны.</p></section>';
 }
 return {isAdmin:allowed,sanitize:sanitize,render:render};
});
