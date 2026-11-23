/* Opisana future navigation planner. Admin-only, local browser draft, no publishing.
 * Server-side permission enforcement will be required before any live edits.
 * No secrets and no writes to Firebase or GitHub. ES5 for old WebKit.
 */
(function(w,d){
'use strict';
var cfg=w.RS_FIREBASE_CONFIG||{},auth=null,session=0,owner=null,language='ru',draft=[];
var groups=['learning','library','community','system'];
var ids=['cards','practice','exam','dictionary','mediatri','add','libraries','users','backup'];
var groupFor={cards:'learning',practice:'learning',exam:'learning',dictionary:'library',mediatri:'learning',add:'library',libraries:'library',users:'community',backup:'system'};
var strings={
 ru:{back:'← Администрирование',title:'Конструктор структуры сайта',sub:'Подготовка административного управления для будущей Opisana.',check:'Проверяю права владельца…',
  denied:'У этого Google-аккаунта нет подтверждённых прав администратора. Доступ запрещён.',
  login:'Войди через Google на учебной странице с аккаунта владельца и повтори попытку.',
  error:'Не удалось безопасно проверить права. Попробуй снова после входа на основном сайте.',
  warning:'РЕЖИМ ЧЕРНОВИКА. Перемещение, группировка и включение пунктов сохраняются только в этом браузере администратора. Рабочее меню, курсы и доступ учащихся не изменяются.',
  heading:'Пункты существующего меню',actions:'Управление черновиком',export:'Скачать JSON-проект',reset:'Вернуть исходный порядок',
  future:'Позже настройки будут сохраняться на защищённом сервере с историей изменений, предварительным просмотром и откатом. Права учеников и преподавателей будут проверяться сервером.',
  footer:'Никаких записей в Firebase и изменений публичного сайта.',ok:'Черновик сохранён на этом устройстве.',storage:'Не удалось сохранить черновик: хранилище браузера недоступно.',
  resetDone:'Исходный порядок восстановлен.',exported:'JSON-проект структуры подготовлен.',up:'Вверх',down:'Вниз',visible:'Показывать',group:'Группа',
  learning:'Обучение',library:'Материалы',community:'Сообщество',system:'Система',
  cards:'Карточки',practice:'Тесты',exam:'Экзамен',dictionary:'Словарь',mediatri:'Mediatri',add:'Новое слово',libraries:'Библиотека',users:'Пользователи',backup:'Данные'},
 fi:{back:'← Ylläpito',title:'Sivuston rakennesuunnittelija',sub:'Opisanan tulevan hallinnan valmistelu.',check:'Ylläpito-oikeuksia tarkistetaan…',
  denied:'Tällä Google-tilillä ei ole vahvistettuja ylläpito-oikeuksia.',
  login:'Kirjaudu omistajan Google-tilillä opiskelusivulla ja yritä uudelleen.',
  error:'Oikeuksia ei voitu varmistaa. Kirjaudu uudelleen pääsivulla.',
  warning:'LUONNOSTILA. Järjestys, ryhmät ja näkyvyys tallennetaan vain tämän ylläpitäjän selaimeen. Julkinen valikko ja oppilaiden käyttöoikeudet eivät muutu.',
  heading:'Nykyisen valikon osiot',actions:'Luonnoksen hallinta',export:'Lataa JSON-luonnos',reset:'Palauta alkuperäinen järjestys',
  future:'Myöhemmin asetukset tallennetaan suojatulle palvelimelle versionhallinnan ja palautuksen kanssa. Opettajien ja oppilaiden oikeudet tarkistetaan palvelimella.',
  footer:'Ei Firebase-kirjoituksia tai muutoksia julkiseen sivustoon.',ok:'Luonnos tallennettu tälle laitteelle.',storage:'Luonnosta ei voitu tallentaa selaimeen.',
  resetDone:'Alkuperäinen järjestys palautettu.',exported:'Rakenteen JSON-luonnos ladattu.',up:'Ylös',down:'Alas',visible:'Näytä',group:'Ryhmä',
  learning:'Oppiminen',library:'Aineistot',community:'Yhteisö',system:'Järjestelmä',
  cards:'Muistikortit',practice:'Testit',exam:'Koe',dictionary:'Sanasto',mediatri:'Mediatri',add:'Uusi sana',libraries:'Kirjasto',users:'Käyttäjät',backup:'Tiedot'},
 en:{back:'← Administration',title:'Site structure planner',sub:'Preparing administration for future Opisana.',check:'Checking owner permissions…',
  denied:'This Google account does not have verified administrator permissions.',
  login:'Sign in on the learning site with the owner account, then try again.',
  error:'Could not safely verify permissions. Sign in again on the main site.',
  warning:'DRAFT MODE. Menu order, groups and visibility are saved only in this admin browser. The live menu, courses and student permissions are unchanged.',
  heading:'Existing menu sections',actions:'Manage draft',export:'Download JSON draft',reset:'Restore original order',
  future:'Later settings will be stored on a protected server with version history, preview and rollback. Teacher and student rights will be enforced by the server.',
  footer:'No Firebase writes or public site changes.',ok:'Draft saved on this device.',storage:'Could not save draft in browser storage.',
  resetDone:'Original order restored.',exported:'Structure JSON draft exported.',up:'Move up',down:'Move down',visible:'Visible',group:'Group',
  learning:'Learning',library:'Materials',community:'Community',system:'System',
  cards:'Flashcards',practice:'Tests',exam:'Exam',dictionary:'Dictionary',mediatri:'Mediatri',add:'New word',libraries:'Library',users:'Users',backup:'Data'}
};
function el(x){return d.getElementById(x);}
function t(x){return (strings[language]||strings.ru)[x]||x;}
function set(x,v){var e=el(x);if(e)e.textContent=v;}
function key(){return owner&&/^[A-Za-z0-9_-]{1,128}$/.test(owner.uid)?'rs_opisana_admin_layout_draft_v1_'+owner.uid:null;}
function original(){return ids.map(function(id){return {id:id,group:groupFor[id],visible:true};});}
function sane(items){
 if(!Array.isArray(items)||items.length!==ids.length)return false;
 var seen={};
 for(var i=0;i<items.length;i++){var x=items[i];if(!x||ids.indexOf(x.id)<0||
  groups.indexOf(x.group)<0||typeof x.visible!=='boolean'||seen[x.id])return false;seen[x.id]=true;}
 return true;
}
function load(){
 draft=original();var k=key();if(!k)return;
 try{var saved=JSON.parse(w.localStorage.getItem(k)||'null');
 if(sane(saved))draft=saved.map(function(x){return {id:x.id,group:x.group,visible:x.visible};});}catch(ignore){}
}
function store(){
 var k=key();if(!k)return;
 try{w.localStorage.setItem(k,JSON.stringify(draft));set('result',t('ok'));}
 catch(ignore){set('result',t('storage'));}
}
function clear(){
 owner=null;draft=[];
 el('admin-area').hidden=true;el('status').hidden=false;
 var r=el('layout-rows');while(r.firstChild)r.removeChild(r.firstChild);
 set('result','');
}
function element(tag,cls,content){
 var n=d.createElement(tag);if(cls)n.className=cls;
 if(content!==undefined)n.textContent=content;return n;
}
function button(text,aria,disabled,fn){
 var b=element('button','',text);b.type='button';b.disabled=!!disabled;b.setAttribute('aria-label',aria);b.addEventListener('click',fn);return b;
}
function line(item,index){
 var row=element('div','section-row');row.setAttribute('data-section-id',item.id);
 var name=element('div');name.appendChild(element('strong','',t(item.id)));
 name.appendChild(element('small','','ID: '+item.id));row.appendChild(name);
 var group=element('div'),label=element('label','sr-only',t('group')+' — '+t(item.id));
 var select=element('select');select.setAttribute('aria-label',t('group')+' — '+t(item.id));
 groups.forEach(function(g){var o=element('option','',t(g));o.value=g;o.selected=item.group===g;select.appendChild(o);});
 select.addEventListener('change',function(){item.group=select.value;store();});group.appendChild(label);group.appendChild(select);row.appendChild(group);
 var check=element('label','check'),input=element('input');input.type='checkbox';input.checked=item.visible;
 input.setAttribute('aria-label',t('visible')+' — '+t(item.id));
 input.addEventListener('change',function(){item.visible=input.checked;store();});
 check.appendChild(input);check.appendChild(element('span','',t('visible')));row.appendChild(check);
 var move=element('div','move');
 move.appendChild(button('↑',t('up')+' — '+t(item.id),index===0,function(){swap(index,-1);}));
 move.appendChild(button('↓',t('down')+' — '+t(item.id),index===draft.length-1,function(){swap(index,1);}));
 row.appendChild(move);return row;
}
function swap(index,delta){var other=index+delta;if(other<0||other>=draft.length)return;
 var v=draft[index];draft[index]=draft[other];draft[other]=v;store();render();}
function render(){
 if(!owner)return;
 var map={'back':'back','title':'title','subtitle':'sub','warning':'warning','heading':'heading',
  'actions-title':'actions','export-btn':'export','reset-btn':'reset','future':'future','footer-note':'footer'};
 Object.keys(map).forEach(function(id){set(id,t(map[id]));});
 d.documentElement.lang=language;
 var b=d.querySelectorAll('[data-lang]');for(var i=0;i<b.length;i++)b[i].setAttribute('aria-pressed',b[i].getAttribute('data-lang')===language?'true':'false');
 var root=el('layout-rows');while(root.firstChild)root.removeChild(root.firstChild);
 draft.forEach(function(item,index){root.appendChild(line(item,index));});
}
function download(){
 if(!owner)return;
 var obj={format:'opisana-navigation-draft',schema:1,environment:'draft-only',sections:draft};
 var blob=new Blob([JSON.stringify(obj,null,2)+'\n'],{type:'application/json'});
 var url=w.URL.createObjectURL(blob),a=d.createElement('a');
 a.href=url;a.download='opisana-menu-draft.json';d.body.appendChild(a);a.click();d.body.removeChild(a);
 w.setTimeout(function(){w.URL.revokeObjectURL(url);},1000);set('result',t('exported'));
}
function onToken(user){
 var ticket=++session;clear();
 if(!user){set('status',t('login'));return;}
 if(user.emailVerified!==true||user.isAnonymous===true||auth.currentUser!==user){set('status',t('denied'));return;}
 try{user.getIdTokenResult(true).then(function(result){
  if(ticket!==session||!auth||auth.currentUser!==user)return;
  if(!result||!result.claims||result.claims.admin!==true){set('status',t('denied'));return;}
  owner=user;load();el('admin-area').hidden=false;el('status').hidden=true;render();
 },function(){if(ticket===session)set('status',t('error'));});
 }catch(ignore){if(ticket===session)set('status',t('error'));}
}
function boot(){
 language=(w.navigator.language||'ru').slice(0,2).toLowerCase();if(!strings[language])language='ru';
 var b=d.querySelectorAll('[data-lang]');for(var i=0;i<b.length;i++)b[i].addEventListener('click',function(){
  language=this.getAttribute('data-lang');if(owner)render();else{
   set('back',t('back'));set('title',t('title'));set('subtitle',t('sub'));set('footer-note',t('footer'));
   set('status',t('check'));}});
 el('export-btn').addEventListener('click',download);
 el('reset-btn').addEventListener('click',function(){if(!owner)return;draft=original();store();render();set('result',t('resetDone'));});
 set('back',t('back'));set('title',t('title'));set('subtitle',t('sub'));set('status',t('check'));
 if(!cfg||cfg.projectId!=='riveria-sanasto-community-test'||
  cfg.authDomain!=='riveria-sanasto-community-test.firebaseapp.com'||
  typeof cfg.apiKey!=='string'||!cfg.apiKey||!w.firebase||!w.firebase.apps||typeof w.firebase.auth!=='function'){
  set('status',t('error'));return;
 }
 try{
  var app=w.firebase.apps.length?w.firebase.app():w.firebase.initializeApp(cfg);
  if(!app||!app.options||app.options.projectId!==cfg.projectId||app.options.authDomain!==cfg.authDomain||app.options.apiKey!==cfg.apiKey){
    set('status',t('error'));return;
  }
  auth=w.firebase.auth();auth.onIdTokenChanged(onToken,function(){++session;clear();set('status',t('error'));});
 }catch(ignore){set('status',t('error'));}
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot);else boot();
})(window,document);
