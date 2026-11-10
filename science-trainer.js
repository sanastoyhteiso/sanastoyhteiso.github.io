/* RUN175 — independent, ES5-compatible oral-exam review. No accounts, network, Firebase or localStorage. */
(function(w,d){
'use strict';
var cards=w.RS_SCIENCE_CARDS||[],byId={},sections={physics:'Физика · Fysiikka',chemistry:'Химия · Kemia',organic:'Органическая химия · Orgaaninen kemia'};
var els={},session=null,visible=[],allExpanded=false;
function get(id){return d.getElementById(id);}
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function clean(v){return String(v||'').toLocaleLowerCase().replace(/ё/g,'е').replace(/[.,:;!?(){}\[\]«»"']/g,' ').replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'');}
function tags(x){
 if(x.page>0)return '<span class="marker">Конспект · стр. '+x.page+' / Muistiinpanot</span>';
 if(x.origin==='user')return '<span class="marker">Из списка вопросов / Kysymyslistalta</span>';
 return '<span class="marker">Дополнение / Lisäaihe</span>';
}
function match(x,scope,origin,query){
 if(scope!=='all'&&x.section!==scope)return false;
 if(origin==='notes'&&!(x.page>0))return false;
 if(origin==='added'&&x.page>0)return false;
 if(!query)return true;
 var hay=clean([x.fi,x.ru,x.shortFi,x.shortRu,x.moreFi,x.moreRu,x.formula,x.keywords].join(' '));
 var parts=query.split(' ');for(var i=0;i<parts.length;i++)if(parts[i]&&hay.indexOf(parts[i])<0)return false;
 return true;
}
function filtered(){
 var scope=els.scope.value,origin=els.origin.value,q=clean(els.query.value);
 return cards.filter(function(x){return match(x,scope,origin,q);});
}
function cardHtml(x){
 var body='<div class="card-body"><div class="langlabel">FI · LYHYT VASTAUS / КОРОТКИЙ ОТВЕТ НА ФИНСКОМ</div>'+
   '<p class="say" lang="fi">'+esc(x.shortFi)+'</p>'+
   '<div class="langlabel">RU · ПЕРЕВОД</div><p class="ruanswer" lang="ru">'+esc(x.shortRu)+'</p>'+
   (x.formula?'<div class="formula" aria-label="Формула">'+esc(x.formula)+'</div>':'')+
   '<details class="subdetails"><summary>Подробнее и пример / Lisätiedot ja esimerkki</summary>'+
   '<p lang="fi"><b>FI:</b> '+esc(x.moreFi)+'</p>'+
   '<p lang="ru"><b>RU:</b> '+esc(x.moreRu)+'</p></details>'+
   '<div class="meta">'+tags(x)+'</div></div>';
 return '<details class="science-card" data-card-id="'+esc(x.id)+'"><summary>'+
   '<span><span class="term" lang="fi">'+esc(x.fi)+'</span><span class="trans" lang="ru"> · '+esc(x.ru)+'</span></span>'+
   '<span class="caret" aria-hidden="true">›</span></summary>'+body+'</details>';
}
function renderGuide(){
 visible=filtered();
 var count=visible.length,html='';
 for(var i=0;i<count;i++)html+=cardHtml(visible[i]);
 els.list.innerHTML=html;
 els.count.textContent=count+' из '+cards.length+' тем / aihetta';
 els.empty.hidden=count>0;
 allExpanded=false;
 els.expand.textContent='Раскрыть все / Avaa kaikki';
}
function shuffle(items){
 var a=items.slice();
 for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}
 return a;
}
function showTrainTab(on){
 els.guide.hidden=on;els.train.hidden=!on;
 els.tabGuide.setAttribute('aria-selected',on?'false':'true');
 els.tabTrain.setAttribute('aria-selected',on?'true':'false');
 if(on&&!session)els.trainBox.innerHTML='<p>Нажми «Начать 10 вопросов». / Aloita harjoitus painamalla painiketta.</p>';
}
function start(items){
 if(!items||!items.length){session=null;els.trainBox.innerHTML='<p>Нет вопросов для выбранного фильтра. Измени параметры поиска. / Ei kysymyksiä valitulla rajauksella.</p>';els.retry.hidden=true;return;}
 session={items:shuffle(items).slice(0,10),index:0,known:0,missed:[],revealed:false,finished:false};
 els.retry.hidden=true;
 renderTrain();
}
function renderTrain(){
 if(!session)return;
 if(session.index>=session.items.length){finish();return;}
 var x=session.items[session.index],n=session.items.length;
 els.track.style.width=Math.round(session.index/n*100)+'%';
 els.trainBox.innerHTML='<div class="stats"><span>Вопрос / Kysymys <b>'+(session.index+1)+' / '+n+'</b></span><span>'+esc(sections[x.section])+'</span></div>'+
  '<h3 class="train-question" lang="fi">Selitä omin sanoin: '+esc(x.fi)+'</h3>'+
  '<p class="train-sub" lang="ru">Объясни своими словами: '+esc(x.ru)+'</p>'+
  '<div class="meta">'+tags(x)+'</div>'+
  '<div class="train-actions"><button type="button" class="primary" id="reveal">Показать ответ / Näytä vastaus</button></div>'+
  '<div id="reveal-answer" hidden class="train-answer"></div>';
 get('reveal').onclick=reveal;
}
function reveal(){
 if(!session||session.revealed)return;
 session.revealed=true;
 var x=session.items[session.index];
 var html='<div class="langlabel">FI · VASTAUS</div><p class="say" lang="fi">'+esc(x.shortFi)+'</p>'+
   '<div class="langlabel">RU · ПЕРЕВОД</div><p class="ruanswer" lang="ru">'+esc(x.shortRu)+'</p>'+
   (x.formula?'<div class="formula">'+esc(x.formula)+'</div>':'')+
   '<details class="subdetails"><summary>Подробнее / Lisätiedot</summary>'+
   '<p lang="fi">'+esc(x.moreFi)+'</p><p lang="ru">'+esc(x.moreRu)+'</p></details>'+
   '<div class="train-actions"><button type="button" class="primary" id="knew">Я ответил / Osasin</button>'+
   '<button type="button" id="missed">Нужно повторить / Kertaan</button></div>';
 get('reveal-answer').innerHTML=html;
 get('reveal-answer').hidden=false;
 get('reveal').disabled=true;
 get('knew').onclick=function(){mark(true);};
 get('missed').onclick=function(){mark(false);};
}
function mark(ok){
 if(!session||!session.revealed)return;
 if(ok)session.known++;else session.missed.push(session.items[session.index]);
 session.index++;session.revealed=false;renderTrain();
}
function finish(){
 session.finished=true;
 els.track.style.width='100%';
 var k=session.known,n=session.items.length;
 els.trainBox.innerHTML='<h3>Тренировка завершена / Harjoitus valmis</h3>'+
  '<p><b>'+k+' / '+n+'</b> — ответы, которые ты смог объяснить.</p>'+
  '<p>Тем для повторения: <b>'+session.missed.length+'</b>. Можно пройти трудные темы ещё раз.</p>';
 els.retry.hidden=session.missed.length===0;
}
function setup(){
 if(!cards.length)return;
 for(var i=0;i<cards.length;i++){
  if(byId[cards[i].id])throw new Error('Duplicate science term '+cards[i].id);
  byId[cards[i].id]=true;
 }
 els={
  scope:get('scope'),origin:get('origin'),query:get('query'),
  list:get('list'),count:get('count'),empty:get('empty'),expand:get('expand-all'),
  tabGuide:get('tab-guide'),tabTrain:get('tab-train'),guide:get('guide'),train:get('train'),
  trainBox:get('train-box'),track:get('track-fill'),retry:get('retry-missed')
 };
 els.scope.onchange=renderGuide;els.origin.onchange=renderGuide;els.query.oninput=renderGuide;
 var qs=d.querySelectorAll('[data-q]');
 for(var j=0;j<qs.length;j++)qs[j].onclick=function(){
  els.query.value=this.getAttribute('data-q');showTrainTab(false);renderGuide();els.query.focus();
 };
 els.tabGuide.onclick=function(){showTrainTab(false);};
 els.tabTrain.onclick=function(){showTrainTab(true);};
 els.expand.onclick=function(){
  allExpanded=!allExpanded;
  var all=els.list.querySelectorAll('.science-card');
  for(var k=0;k<all.length;k++)all[k].open=allExpanded;
  els.expand.textContent=allExpanded?'Свернуть все / Sulje kaikki':'Раскрыть все / Avaa kaikki';
 };
 get('start-train').onclick=function(){start(filtered());showTrainTab(true);};
 els.retry.onclick=function(){var retry=session?session.missed.slice():[];start(retry);};
 try{
  var m=w.location.search.match(/[?&]q=([^&]+)/);
  if(m)els.query.value=decodeURIComponent(m[1].replace(/\+/g,' ')).slice(0,100);
 }catch(e){}
 renderGuide();
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',setup);else setup();
})(window,document);
