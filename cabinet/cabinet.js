/* Opisana student cabinet: read-only, verified Google account, owner-scoped local data.
 * Never reads another account, never writes student progress, never reports missing V3
 * IndexedDB / cloud data as zero. ES5-compatible for older Safari.
 */
(function(w,d){
'use strict';
var cfg=w.RS_FIREBASE_CONFIG||{},auth=null,session=0,activeUser=null,language='ru';
var words={
 ru:{back:'← К занятиям',title:'Личный кабинет учащегося',sub:'Твои занятия и прогресс — только в твоём аккаунте.',
  project:'Sanastoyhteisö 3.0 · будущая Opisana',check:'Проверка Google-входа…',
  login:'Войди через Google на главном сайте, затем открой кабинет снова.',
  unverified:'Для личного кабинета необходимо подтвердить email.',error:'Не удалось проверить вход. Открой основной сайт и повтори вход.',
  profile:'Мой профиль',progress:'Учебная активность на этом устройстве',
  hasData:'Найдены записи прежней системы на этом устройстве. Это не полный облачный прогресс.',
  noData:'Записи прежней системы здесь не найдены. Это не значит, что у тебя нет прогресса в V3 или облаке.',
  tasks:'Задания от преподавателя',tasksNote:'Модуль учебных групп и заданий готовится. Назначения пока не подключены.',
  start:'Продолжить занятия',scope:'В первой версии показаны только сохранённые на этом устройстве данные прежней системы. Прогресс V3 из IndexedDB и полная облачная история будут подключены отдельно: отсутствующие здесь показатели нельзя считать нулями.',
  foot:'Личные учебные данные не открываются другим учащимся. Кабинет пока не меняет и не удаляет результаты.',
  terms:'Слова с историей ответов',attempts:'Ответы на задания',right:'Правильные ответы',wrong:'Ошибки',personal:'Личные слова',saved:'Избранные слова'},
 fi:{back:'← Opiskeluun',title:'Opiskelijan oma sivu',sub:'Omat opinnot ja edistyminen vain omalla tililläsi.',
  project:'Sanastoyhteisö 3.0 · tuleva Opisana',check:'Google-kirjautumista tarkistetaan…',
  login:'Kirjaudu ensin Google-tilillä etusivulla ja avaa tämä sivu uudelleen.',
  unverified:'Vahvista sähköpostiosoitteesi käyttääksesi omaa sivua.',error:'Kirjautumista ei voitu varmistaa. Kirjaudu uudelleen etusivulla.',
  profile:'Oma profiili',progress:'Opiskelun toiminta tällä laitteella',
  hasData:'Tältä laitteelta löytyi vanhan järjestelmän tietoja. Tämä ei ole täydellinen pilviedistyminen.',
  noData:'Vanhan järjestelmän tietoja ei löytynyt. V3- tai pilvitietoja voi silti olla.',
  tasks:'Opettajan tehtävät',tasksNote:'Opetusryhmät ja tehtävät ovat kehitteillä. Tehtäviä ei ole vielä yhdistetty.',
  start:'Jatka opiskelua',scope:'Ensimmäinen versio näyttää vain tämän laitteen vanhan järjestelmän tallenteet. V3:n IndexedDB-tiedot ja koko pilvihistoria lisätään myöhemmin. Puuttuva tieto ei tarkoita nollaa.',
  foot:'Muut opiskelijat eivät näe yksityisiä opiskelutietojasi. Tämä sivu ei muokkaa tai poista tuloksia.',
  terms:'Sanat, joista vastauksia',attempts:'Vastauksia yhteensä',right:'Oikeita vastauksia',wrong:'Vääriä vastauksia',personal:'Omat sanat',saved:'Suosikkisanat'},
 en:{back:'← Back to learning',title:'Student dashboard',sub:'Your learning and progress stay within your own account.',
  project:'Sanastoyhteisö 3.0 · future Opisana',check:'Checking Google sign-in…',
  login:'Sign in with Google on the main site, then reopen this dashboard.',
  unverified:'Verify your email before opening your dashboard.',error:'Could not verify sign-in. Sign in again on the main site.',
  profile:'My profile',progress:'Learning activity on this device',
  hasData:'Older-system records were found on this device. This is not your complete cloud progress.',
  noData:'No older-system records were found here. You may still have progress in V3 or the cloud.',
  tasks:'Teacher assignments',tasksNote:'Learning groups and assignments are being developed. Assignments are not yet connected.',
  start:'Continue learning',scope:'This initial version shows only older-system records saved on this device. V3 IndexedDB and full cloud history will be connected separately; missing figures are not zero.',
  foot:'Other students cannot view your private learning data. This dashboard does not alter or delete results.',
  terms:'Words with answers',attempts:'Answers submitted',right:'Correct answers',wrong:'Incorrect answers',personal:'Personal words',saved:'Saved words'}
};
function el(id){return d.getElementById(id);}function tr(key){return (words[language]||words.ru)[key];}
function set(id,val){var e=el(id);if(e)e.textContent=val;}
function state(msg,show){set('auth-status',msg);el('auth-status').hidden=show;el('cabinet').hidden=!show;}
function clear(){set('profile-name','');set('profile-email','');var m=el('progress-metrics');while(m.firstChild)m.removeChild(m.firstChild);el('progress-caption').textContent='';el('cabinet').hidden=true;el('auth-status').hidden=false;}
function verifiedConfig(){
 return !!(cfg.projectId==='riveria-sanasto-community-test'&&
  cfg.authDomain==='riveria-sanasto-community-test.firebaseapp.com'&&
  typeof cfg.apiKey==='string'&&cfg.apiKey&&w.firebase&&w.firebase.apps&&
  typeof w.firebase.auth==='function');
}
function record(uid,suffix){
 if(!/^[A-Za-z0-9_-]{1,128}$/.test(uid))return null;
 try{var raw=w.localStorage.getItem('rs_family_v1_'+uid+'__'+suffix);
  return raw===null?null:JSON.parse(raw);}catch(ignore){return null;}
}
function metric(target,label,value){
 var box=d.createElement('div');box.className='metric';
 var strong=d.createElement('strong');strong.textContent=String(value);
 var text=d.createElement('span');text.textContent=label;box.appendChild(strong);box.appendChild(text);target.appendChild(box);
}
function safeCount(n){n=Number(n);return isFinite(n)&&n>=0&&n<=1e9?Math.floor(n):0;}
function summarize(uid){
 var scores=record(uid,'rs_scores_v1'),personal=record(uid,'rs_user_words_v1'),favs=record(uid,'rs_favorites_v1');
 var found=!!(scores&&typeof scores==='object'&&Object.keys(scores).length)||
  !!(Array.isArray(personal)&&personal.length)||
  !!(favs&&typeof favs==='object'&&Object.keys(favs).length);
 if(!found)return null;
 var out={terms:0,attempts:0,right:0,wrong:0,personal:0,saved:0};
 if(scores&&typeof scores==='object'&&!Array.isArray(scores)){
  Object.keys(scores).forEach(function(id){
   var sc=scores[id];if(!sc||typeof sc!=='object')return;
   out.terms++;
   out.attempts+=safeCount(sc.seen);
   out.right+=safeCount(sc.correct);
   out.wrong+=safeCount(sc.wrong);
  });
 }
 if(Array.isArray(personal))out.personal=personal.filter(function(x){return x&&x.deleted!==true;}).length;
 if(favs&&typeof favs==='object'&&!Array.isArray(favs))Object.keys(favs).forEach(function(x){if(favs[x]===true)out.saved++;});
 return out;
}
function showStats(user){
 clear();
 set('profile-name',user.displayName||tr('profile'));
 set('profile-email',user.email||'');
 var data=summarize(user.uid);
 set('progress-caption',data?tr('hasData'):tr('noData'));
 if(data){
  var target=el('progress-metrics');
  ['terms','attempts','right','wrong','personal','saved'].forEach(function(key){metric(target,tr(key),data[key]);});
 }
 state('',true);
}
function paint(){
 var map={ 'back-to-school':'back','title':'title','subtitle':'sub','project-label':'project',
  'profile-title':'profile','progress-title':'progress','assignments-title':'tasks',
  'assignments-note':'tasksNote','start-button':'start','scope-note':'scope','footer-text':'foot'};
 Object.keys(map).forEach(function(id){set(id,tr(map[id]));});
 d.documentElement.lang=language;
 var buttons=d.querySelectorAll('[data-lang]');
 for(var i=0;i<buttons.length;i++)buttons[i].setAttribute('aria-pressed',buttons[i].getAttribute('data-lang')===language?'true':'false');
 if(activeUser&&auth&&auth.currentUser===activeUser&&activeUser.emailVerified===true)showStats(activeUser);
 else if(!el('cabinet').hidden)clear();
}
function onToken(user){
 var ticket=++session;activeUser=null;clear();
 if(!user){state(tr('login'),false);return;}
 if(user.isAnonymous===true||user.emailVerified!==true){state(tr('unverified'),false);return;}
 if(!auth||auth.currentUser!==user){state(tr('error'),false);return;}
 try{
  user.getIdTokenResult().then(function(result){
   if(ticket!==session||auth.currentUser!==user)return;
   if(!result||!result.claims||result.claims.user_id&&result.claims.user_id!==user.uid){state(tr('error'),false);return;}
   activeUser=user;showStats(user);
  },function(){if(ticket===session)state(tr('error'),false);});
 }catch(ignore){if(ticket===session)state(tr('error'),false);}
}
function boot(){
 language=(w.navigator.language||'ru').slice(0,2).toLowerCase();if(!words[language])language='ru';
 var buttons=d.querySelectorAll('[data-lang]');for(var i=0;i<buttons.length;i++){
  buttons[i].addEventListener('click',function(){language=this.getAttribute('data-lang');paint();});
 }
 paint();state(tr('check'),false);
 if(!verifiedConfig()){state(tr('error'),false);return;}
 try{
  var app=w.firebase.apps.length?w.firebase.app():w.firebase.initializeApp(cfg);
  if(!app||!app.options||app.options.projectId!==cfg.projectId||app.options.apiKey!==cfg.apiKey||
    app.options.authDomain!==cfg.authDomain){state(tr('error'),false);return;}
  auth=w.firebase.auth();auth.onIdTokenChanged(onToken,function(){++session;activeUser=null;clear();state(tr('error'),false);});
 }catch(ignore){state(tr('error'),false);}
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot);else boot();
})(window,document);
