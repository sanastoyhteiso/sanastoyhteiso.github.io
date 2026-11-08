/* Riveria Sanasto v2.0.0 Community — intentionally ES5-style JavaScript for older Safari/iOS 12.
   Educational public content only. Progress and user additions live on this device.
   No server or Google API credentials are embedded here. */
(function () {
  'use strict';
  var D = window.RS_DATA || null;
  var root = document.getElementById('main-content');
  var state = {view:'cards', deck:[], cardIndex:0, flipped:false, filter:'all', direction:'auto', quizDirection:'auto', dictDirection:'all', cardsCount:20, cardsLatin:true, quiz:null, quizResult:null, quizMode:'translate', tfQuestion:null, tfResult:null, tfSeen:{}, tfCorrect:0, tfWrong:0, matchQuestion:null, matchResult:null, matchSeen:{}, multiQuestion:null, multiResult:null, multiSeen:{}, examRuns:{}, mockRun:null, mockDirection:'auto', mockSaveOk:true, mockAttemptId:null, mockCloudStatus:'unchecked', mockCloudBusy:false, mockCloudError:'', mockCloudConflict:null, mockCloudPending:false, mockCloudSerial:0,
    medMode:'guide', medDirection:'auto', scenario:0, scenarioRevealed:false, scenarioDraft:'', phraseQuery:'', headingQuery:'', dictQuery:'', dictFilter:'all', dictIncludePhrases:false, draft:'', draftFound:false,
    userWords:[], scores:{}, favorites:{}, persisted:true, extraSearch:false, sessionSeen:{}, reviewLearned:false, learnedQuery:''};
  function byId(id){return document.getElementById(id);}
  function safe(v){return String(v===undefined||v===null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function clean(v){return String(v||'').toLocaleLowerCase().replace(/ё/g,'е').replace(/[.,:;!?()\[\]{}«»"']/g,' ').replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'');}
  function value(k,f){try{var key=window.RS_FAMILY&&window.RS_FAMILY.storageKey(k);if(!key)return f;var x=window.localStorage.getItem(key);return x?JSON.parse(x):f;}catch(e){state.persisted=false;return f;}}
  function save(k,v){try{var key=window.RS_FAMILY&&window.RS_FAMILY.storageKey(k);if(!key)return false;window.localStorage.setItem(key,JSON.stringify(v));state.persisted=true;try{window.dispatchEvent(new Event('rs:datachange'));}catch(ignored){}return true;}catch(e){state.persisted=false;toast('Сохранение на устройстве недоступно. Сделайте резервную копию.');return false;}}
  function load(){state.userWords=value('rs_user_words_v1',[]);state.scores=value('rs_scores_v1',{});state.favorites=value('rs_favorites_v1',{});if(!Array.isArray(state.userWords))state.userWords=[];if(!state.scores||typeof state.scores!=='object')state.scores={};if(!state.favorites||typeof state.favorites!=='object')state.favorites={};}
  /* A draft is NEVER a saved find. Keep it local and scoped to the signed-in account.
     Cloud readbacks may rebuild #add-form when the tab becomes visible. */
  var addDraftMemory={key:null,value:null};
  function addDraftKey(){
    return window.RS_FAMILY&&typeof window.RS_FAMILY.storageKey==='function'?
      window.RS_FAMILY.storageKey('rs_v3_find_draft_v1'):null;
  }
  function readAddDraft(){
    var key=addDraftKey(),v=null;
    if(!key)return null;
    if(addDraftMemory.key===key&&addDraftMemory.value)return addDraftMemory.value;
    try{v=JSON.parse(window.localStorage.getItem(key)||'null');}catch(e){}
    if(!v||typeof v!=='object'||typeof v.fi!=='string'||typeof v.ru!=='string')return null;
    addDraftMemory={key:key,value:v};return v;
  }
  function isAddDraftField(el){
    return !!(el&&((el.form&&el.form.id==='add-form')||
      el.id==='v3-find-topic'||el.id==='v3-find-note'));
  }
  function saveAddDraft(){
    var key=addDraftKey(),form=byId('add-form');
    if(!key||!form)return;
    var topic=byId('v3-find-topic'),note=byId('v3-find-note');
    var v={fi:form.elements.fi.value.slice(0,180),ru:form.elements.ru.value.slice(0,400),
      cat:form.elements.cat.value,customCat:form.elements.customCat.value.slice(0,90),
      example:form.elements.example.value.slice(0,500),
      topic:topic?topic.value:'practice',note:note?note.value.slice(0,350):''};
    addDraftMemory={key:key,value:v};
    try{window.localStorage.setItem(key,JSON.stringify(v));}catch(e){}
  }
  function restoreAddDraft(){
    var v=readAddDraft(),form=byId('add-form');if(!v||!form)return;
    ['fi','ru','cat','customCat','example'].forEach(function(k){
      if(form.elements[k]&&typeof v[k]==='string')form.elements[k].value=v[k];
    });
    var topic=byId('v3-find-topic'),note=byId('v3-find-note');
    if(topic&&/^(practice|study|other)$/.test(v.topic||''))topic.value=v.topic;
    if(note&&typeof v.note==='string')note.value=v.note;
  }
  function clearAddDraft(savedFi,savedRu){
    var key=addDraftKey(),v=readAddDraft();
    if(!key||!v)return;
    // A late ACK must not destroy a newer, different draft.
    if(typeof savedFi==='string'&&
      (v.fi.trim()!==savedFi.trim()||v.ru.trim()!==(savedRu||'').trim()))return;
    try{window.localStorage.removeItem(key);}catch(e){}
    addDraftMemory={key:null,value:null};
  }
  window.RS_APP_FINDS_SAVED=function(fi,ru){
    clearAddDraft(fi,ru);
    if(state.view==='add')renderAdd();
    toast('Находка сохранена в V3.');
  };
  function toast(t){var e=byId('toast');e.textContent=t;e.className='toast show';window.setTimeout(function(){e.className='toast';},3400);}
  function setStatus(){var online=byId('online-status'),store=byId('storage-status');if(online){online.textContent=navigator.onLine?'● Интернет доступен':'● Без интернета';online.className='status'+(navigator.onLine?'':' offline');}if(store){store.textContent=state.persisted?'✓ Локальное сохранение':'! Сохранение недоступно';store.className='status muted';}}
  function sharedEnabled(){return !!(window.RS_FAMILY&&window.RS_FAMILY.sharedEnabled());}
  function allTerms(){return (sharedEnabled()?D.terms:[]).concat(state.userWords,window.RS_COMM?window.RS_COMM.subscribedTerms():[]);}
  function isLearned(id){var p=state.scores[id]||{};return typeof p.learned==='boolean'?p.learned:Number(p.correct||0)>0;}
  /* Language direction is a view preference, never a progress/identity key. */
  function language(){if(window.RS_I18N)return window.RS_I18N.getLanguage();try{if(localStorage.getItem('sanastoyhteiso_language_mode')==='manual')return localStorage.getItem('sanastoyhteiso_legal_language')||'ru';}catch(e){}return (navigator.language||'ru').slice(0,2);}
  function direction(which){if(which!=='auto')return which;return language()==='en'?'en-fi':language()==='ru'?'ru-fi':'fi-ru';}
  function pair(which){var p=direction(which).split('-');return {from:p[0],to:p[1]};}
  function word(x,field){var z=x&&x[field];return typeof z==='string'?z.trim():'';}
  function eligible(x,which){var p=pair(which);return !!(word(x,p.from)&&word(x,p.to));}
  function directionSelect(id,current,allowAll,allowLatin){var opts=[['auto','Автоматически (по языку сайта)'],['fi-ru','Финский → русский'],['ru-fi','Русский → финский'],['fi-en','Финский → английский'],['en-fi','Английский → финский']];
    if(allowAll)opts.unshift(['all','Все три языка (FI / RU / EN)']);
    if(allowLatin)opts=opts.concat([['la-fi','Латынь → финский'],['fi-la','Финский → латынь'],
      ['la-ru','Латынь → русский'],['ru-la','Русский → латынь'],
      ['la-en','Латынь → английский'],['en-la','Английский → латынь']]);
    var h='<select id="'+id+'" class="control">';for(var i=0;i<opts.length;i++)h+='<option value="'+opts[i][0]+'"'+(current===opts[i][0]?' selected':'')+'>'+safe(opts[i][1])+'</option>';return h+'</select>';
  }
  function medPair(){return pair(state.medDirection==='auto'&&language()==='ru'?'ru-fi':state.medDirection);}
  function englishWarning(which){var d=which==='all'?'fi-en':direction(which);return d.indexOf('en')<0?'':'<p class="notice">Английские переводы составлены автоматически и могут содержать ошибки. Особенно проверяйте медицинские термины.</p>';}
  function categoryName(x){var t=window.RS_I18N;return t?t.category(x.cat,x.catRu||x.cat):x.catRu||x.cat||'';}
  function isExamTopic(id){return /^EXAM(0[1-9]|10)$/.test(String(id||''));}
  function matchCat(x,id){return id==='all'||x.cat===id||(isExamTopic(id)&&Array.isArray(x.examTopics)&&x.examTopics.indexOf(id)>=0);}
  function examNote(x){
    if(!x||!x.examNoteFi&&!x.examNoteRu&&!x.la)return '';
    var h='<div class="exam-explain">';
    if(x.la)h+='<p><b>Latina:</b> <i>'+safe(x.la)+'</i></p>';
    if(x.examNoteFi)h+='<p><b>FI:</b> '+safe(x.examNoteFi)+'</p>';
    if(x.examNoteRu)h+='<p><b>RU:</b> '+safe(x.examNoteRu)+'</p>';
    return h+'</div>';
  }
  function directionNotice(which){if(allTerms().some(function(x){return eligible(x,which);}))return '';return '<div class="notice">Для выбранного направления пока нет переводов. Выбери другое направление.</div>';}
  function cardPool(mode){
    var base=allTerms().concat(sharedEnabled()?D.phrases:[]),out=[],p=pair(state.direction),
      latinDirection=p.from==='la'||p.to==='la';
    for(var i=0;i<base.length;i++){
      var x=base[i];if(!matchCat(x,state.filter))continue;
      if(state.extraSearch&&!state.favorites[x.id])continue;
      if(!eligible(x,state.direction))continue;
      if(mode==='review'?!isLearned(x.id):isLearned(x.id))continue;
      out.push(x);
      // Latin cards are an extra shuffled face, never a new cloud score/word ID.
      if(state.cardsLatin&&!latinDirection&&x.la&&Array.isArray(x.examTopics)&&x.examTopics.length){
        var latinCard={};
        for(var key in x)if(Object.prototype.hasOwnProperty.call(x,key))latinCard[key]=x[key];
        latinCard.id='LATIN-CARD-'+x.id;
        latinCard.latinOf=x.id;
        out.push(latinCard);
      }
    }
    return out;
  }
  function shuffle(arr){for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t;}return arr;}
  function ensureDeck(reset){if(reset||!state.deck.length){var items=cardPool(state.reviewLearned?'review':'study').filter(function(x){return !state.sessionSeen[x.id];});shuffle(items);state.deck=items.slice(0,Math.min(state.cardsCount,items.length));state.cardIndex=0;state.flipped=false;}}
  function numberLearned(){var n=0,valid={};allTerms().concat(sharedEnabled()?D.phrases:[]).forEach(function(x){valid[x.id]=1;});Object.keys(state.scores).forEach(function(k){if(valid[k]&&isLearned(k))n++;});return n;}
  function tabsHtml(active,opts,attr){var s='<div class="tabs">';for(var i=0;i<opts.length;i++){s+='<button class="btn '+(opts[i][0]===active?'primary':'white')+'" data-action="'+safe(attr)+'" data-value="'+safe(opts[i][0])+'">'+safe(opts[i][1])+'</button>';}return s+'</div>';}
  function optionsForCat(){var map={},list=[],i,x,all=allTerms();for(i=0;i<all.length;i++){x=all[i];if(x.cat==='Anatomia: Riveria koe')continue;if(!map[x.cat]){map[x.cat]=1;list.push([x.cat,x.catRu||x.cat]);}}list.sort(function(a,b){return a[1].localeCompare(b[1]);});return list;}
  function selectCats(current,id){
    var cats=optionsForCat(),s='<select id="'+id+'" class="control"><option value="all">Все темы</option>',exam=sharedEnabled()&&D.examTopics||[];
    if(exam.length){s+='<optgroup label="Riveria · Päästä varpaisiin (2014)">';
      for(var j=0;j<exam.length;j++){
        var t=exam[j];
        s+='<option value="'+safe(t.id)+'"'+(current===t.id?' selected':'')+'>'+safe(t.fi+' — '+t.ru+' (с. '+t.pages+')')+'</option>';
      }
      s+='</optgroup>';
    }
    s+='<optgroup label="Остальные словари">';
    for(var i=0;i<cats.length;i++)s+='<option value="'+safe(cats[i][0])+'"'+(current===cats[i][0]?' selected':'')+'>'+safe(cats[i][1])+'</option>';
    return s+'</optgroup></select>';
  }
  function metric(){return '<div class="stat-row"><div class="stat"><strong>'+allTerms().length+'</strong><small>терминов</small></div><div class="stat"><strong>'+(sharedEnabled()?D.phrases.length:0)+'</strong><small>общих фраз</small></div><div class="stat"><strong>'+(sharedEnabled()?D.mediatri.length:0)+'</strong><small>записей Mediatri</small></div><div class="stat"><strong>'+numberLearned()+'</strong><small>выучено</small></div></div>';}
  function basePage(title,subtitle){var x=byId('page-title');if(x)x.textContent=title;var y=byId('page-subtitle');if(y)y.textContent=subtitle;}
  function render(){setStatus();document.querySelectorAll('[data-view]').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-view')===state.view || (state.view==='add'||state.view==='backup')&&b.getAttribute('data-view')==='more');});if(state.view==='users'){basePage('Пользователи','Добровольно открытые показатели прогресса.');if(window.RS_COMM)window.RS_COMM.renderUsers(root);}else if(state.view==='libraries'){basePage('Библиотека','Подключай открытые тематические словари.');if(window.RS_COMM)window.RS_COMM.renderLibrary(root);}else if(state.view==='cards')renderCards();else if(state.view==='learned')renderLearned();else if(state.view==='practice')renderQuiz();else if(state.view==='exam')renderMockExam();else if(state.view==='dictionary')renderDict();else if(state.view==='mediatri')renderMediatri();else if(state.view==='add')renderAdd();else if(state.view==='backup')renderBackup();else renderMore();if(window.RS_V3_RELEASE)window.RS_V3_RELEASE.status();}
  function renderCards(){basePage(state.reviewLearned?'Повторение выученного':'Изучаем слова',state.reviewLearned?'Отдельное повторение по твоему выбору.':'Выученные слова не возвращаются в обычную колоду.');ensureDeck(false);var c=state.deck[state.cardIndex],i,catHtml='',cats=optionsForCat().slice(0,7);for(i=0;i<cats.length;i++){catHtml+='<button class="tag '+(state.filter===cats[i][0]?'chosen':'')+'" data-action="cat-quick" data-value="'+safe(cats[i][0])+'">'+safe(cats[i][1])+'</button>';}
  var s=metric()+englishWarning(state.direction)+'<div class="banner"><b>'+(state.reviewLearned?'Повторение выученных':'Новые слова без повторов')+'</b><p>'+(state.reviewLearned?'Здесь можно освежить выученное. Если слово забылось, нажми «Повторить», чтобы вернуть его в обычное обучение.':'После «Знаю» слово уходит в раздел «Выученные» и не повторяется в обычных карточках. Пропущенные слова вернутся в следующем подходе.')+'</p></div>';
  s+='<div class="panel"><div class="form-row"><label class="field"><span>Тема</span>'+selectCats(state.filter,'cards-cat')+'</label><label class="field"><span>Направление</span>'+directionSelect('cards-dir',state.direction,false,true)+'</label><label class="field"><span>Латинские карточки</span><label class="latin-card-toggle"><input id="cards-latin" type="checkbox"'+(state.cardsLatin?' checked':'')+'> Латынь вперемешку / Latina</label></label><label class="field"><span>Слова за подход</span><select id="cards-count" class="control"><option value="10"'+(state.cardsCount===10?' selected':'')+'>10</option><option value="20"'+(state.cardsCount===20?' selected':'')+'>20</option><option value="50"'+(state.cardsCount===50?' selected':'')+'>50</option></select></label></div><div class="btn-row"><button class="btn white" data-action="reshuffle">↻ Перемешать</button><button class="btn white" data-action="only-favorites">'+(state.extraSearch?'★ Только избранное':'☆ Только избранное')+'</button><button class="btn white" data-view="learned">✓ Выученные ('+numberLearned()+')</button>'+(state.reviewLearned?'<button class="btn primary" data-action="study-mode">К новым словам</button>':'')+'</div></div>';
  if(!c){s+='<div class="panel empty"><b>'+(state.reviewLearned?'Повторение завершено':'Подход завершён')+'</b><p>'+(state.reviewLearned?'Выученные слова просмотрены.':'Слова больше не идут по кругу. Если остались трудные или пропущенные, начни новый подход.')+'</p><div class="btn-row"><button class="btn primary" data-action="restart-study">Начать новый подход</button><button class="btn white" data-view="learned">Открыть выученные</button>'+(state.reviewLearned?'<button class="btn white" data-action="study-mode">К новым словам</button>':'')+'</div></div>';}else{
    var languages=pair(state.direction),front=c.latinOf?word(c,'la'):word(c,languages.from),back=c.latinOf?(word(c,'fi')+' — '+word(c,'ru')):word(c,languages.to),scoreId=c.latinOf||c.id,score=state.scores[scoreId]||{};
    s+='<div class="section-title"><h2>Карточка '+(state.cardIndex+1)+' / '+state.deck.length+'</h2><p>'+safe(categoryName(c))+' · '+(score.correct||0)+' верных</p></div><div class="flashcard"><div class="flash-top"><span>'+safe(c.id)+'</span><button class="star-btn" data-action="favorite" aria-label="В избранное">'+(state.favorites[scoreId]?'★':'☆')+'</button></div><div class="flash-term">'+safe(front)+'</div>';
    if(state.flipped){s+='<div class="flash-trans">'+safe(back)+'</div>';if(c.example)s+='<div class="flash-example">'+safe(c.example)+(c.exampleRu?' — '+safe(c.exampleRu):'')+'</div>';s+=examNote(c);}else{s+='<div class="flash-hidden">Вспомни перевод — затем открой ответ</div>';}
    s+='<div class="flash-actions">'+(state.flipped?'<button class="btn good" data-action="mark-good">✓ Знаю</button><button class="btn white" data-action="mark-hard">↻ Повторить</button>':'<button class="btn primary" data-action="flip">◉ Показать ответ</button>')+'<button class="btn white" data-action="next-card">Следующее →</button></div><p class="hint">«Знаю» перемещает слово в «Выученные»; «Следующее» пропускает до следующего подхода.</p></div>';
  }
  s+='<div class="section-title"><h2>Темы для практики</h2></div><div>'+catHtml+'</div>';
  root.innerHTML=s+directionNotice(state.direction);
  }
  function setLearned(id,yes){var p=state.scores[id]||{correct:0,wrong:0,seen:0};p.learned=!!yes;p.learnedUpdatedAt=Date.now();state.scores[id]=p;save('rs_scores_v1',state.scores);}
  function grade(id,ok){var p=state.scores[id]||{correct:0,wrong:0,seen:0};p.seen=(p.seen||0)+1;if(ok){p.correct=(p.correct||0)+1;p.learned=true;p.learnedUpdatedAt=Date.now();}else{p.wrong=(p.wrong||0)+1;if(state.reviewLearned){p.learned=false;p.learnedUpdatedAt=Date.now();}}p.last=Date.now();state.scores[id]=p;save('rs_scores_v1',state.scores);}
  function nextCard(){if(!state.deck.length)return;state.sessionSeen[state.deck[state.cardIndex].id]=true;if(state.cardIndex+1<state.deck.length){state.cardIndex++;}else{state.deck=[];ensureDeck(true);}state.flipped=false;renderCards();}
  function buildTranslateSeries(){
    var p=pair(state.quizDirection),latinDirection=p.from==='la'||p.to==='la';
    var all=allTerms().concat(sharedEnabled()?D.phrases:[]).filter(function(x){
      return x&&x.id&&matchCat(x,state.filter)&&eligible(x,state.quizDirection);
    });
    if(all.length<4)return [];
    var seen={},unique=[];
    for(var i=0;i<all.length;i++)if(!seen[all[i].id]){
      seen[all[i].id]=true;unique.push(all[i]);
    }
    if(unique.length<4)return [];
    var original=shuffle(unique.filter(function(x){return !isLearned(x.id);}))
      .concat(shuffle(unique.filter(function(x){return isLearned(x.id);})));
    var usedLatin={},latin=[];
    shuffle(unique.filter(function(x){return !!word(x,'la');})).forEach(function(x){
      var key=word(x,'la').toLocaleLowerCase();
      if(!usedLatin[key]){usedLatin[key]=true;latin.push(x);}
    });
    var questions=[],usedIds={},usedPrompt={};
    for(var n=0;n<10;n++){
      var needLatin=!latinDirection&&(n%3===0),sources=needLatin?latin:original;
      if(latinDirection)sources=original;
      var made=null;
      for(var k=0;k<sources.length;k++){
        var chosen=sources[k];if(usedIds[chosen.id])continue;
        var from=p.from,to=p.to,latinTask=latinDirection||needLatin;
        if(needLatin){
          if(n%2===0){from='la';to=p.from;}else{from=p.from;to='la';}
        }
        var front=word(chosen,from),right=word(chosen,to);
        if(!front||!right||usedPrompt[from+'|'+clean(front)])continue;
        var used={},wrong=[];
        used[clean(right)]=true;
        var others=shuffle(unique.filter(function(x){return x.id!==chosen.id&&
          (!latinTask||!x.la||x.la!==chosen.la);
        }));
        for(var j=0;j<others.length&&wrong.length<3;j++){
          var answer=word(others[j],to),key=clean(answer);
          if(key&&!used[key]){wrong.push(answer);used[key]=true;}
        }
        if(wrong.length!==3)continue;
        made={id:'FOUR-'+(latinTask?'LATIN-':'')+chosen.id,
          item:chosen,from:from,to:to,latin:!!latinTask,answer:right,
          options:shuffle([right].concat(wrong))};
        usedIds[chosen.id]=true;usedPrompt[from+'|'+clean(front)]=true;
        break;
      }
      if(!made&&needLatin){
        // A tiny topic may lack four distinct Latin distractors; fall back safely.
        var oldBudget=questions.length;
        for(var m=0;m<original.length;m++){
          var fallback=original[m];
          if(usedIds[fallback.id]||usedPrompt[p.from+'|'+clean(word(fallback,p.from))])continue;
          var correct=word(fallback,p.to),choices=[],keys={};
          keys[clean(correct)]=true;
          var pool=shuffle(unique.filter(function(x){return x.id!==fallback.id;}));
          for(var v0=0;v0<pool.length&&choices.length<3;v0++){
            var candidate=word(pool[v0],p.to),ck=clean(candidate);
            if(ck&&!keys[ck]){keys[ck]=true;choices.push(candidate);}
          }
          if(choices.length===3){
            made={id:'FOUR-'+fallback.id,item:fallback,from:p.from,to:p.to,
              answer:correct,options:shuffle([correct].concat(choices))};
            usedIds[fallback.id]=true;usedPrompt[p.from+'|'+clean(word(fallback,p.from))]=true;break;
          }
        }
      }
      if(made)questions.push(made);
      if(questions.length===unique.length)break;
    }
    return questions;
  }
  function examRun(mode){
    var key=state.filter+(mode==='translate'?'|'+state.quizDirection:'');
    var run=state.examRuns[mode];
    if(!run||run.key!==key){
      var plan=mode==='translate'?buildTranslateSeries():
        (window.RS_EXAM_ROUNDS?window.RS_EXAM_ROUNDS.build(mode,state.filter,D,
          window.RS_TRUE_FALSE&&window.RS_TRUE_FALSE.questions||[],10):[]);
      run={key:key,questions:plan,index:0,answered:0,correct:0,points:0,maxPoints:0,
        skipped:0,answeredIndex:{}};
      state.examRuns[mode]=run;
    }
    return run;
  }
  function examProgress(run){
    var total=run.questions.length;
    if(!total)return '';
    return '<div class="panel exam-run-progress"><b>Задание / Tehtävä: '+
      Math.min(run.index+1,total)+' / '+total+'</b>'+
      '<div class="exam-progress-track"><span style="width:'+
      Math.round(Math.min(run.index,total)*100/total)+'%"></span></div>'+
      '<span class="hint">Верных / Oikein: '+run.correct+' · Отвечено / Vastattu: '+run.answered+
      (run.skipped?' · Пропущено / Ohitettu: '+run.skipped:'')+'</span></div>';
  }
  function examSummary(run){
    if(!run.questions.length)return '<div class="panel">Недостаточно учебных данных в выбранной теме. Выбери другую экзаменационную тему.</div>';
    return '<div class="panel exam-run-done"><h2>Серия завершена / Harjoitus valmis!</h2>'+
      '<p><b>Результат / Tulos: '+run.correct+' / '+run.questions.length+'</b></p>'+
      '<p>Всего отвечено / Vastattu: '+run.answered+
      (run.skipped?' · Пропущено / Ohitettu: '+run.skipped:'')+'</p>'+
      (run.maxPoints?'<p>Правильных соответствий / Oikeita valintoja: '+run.points+
        ' / '+run.maxPoints+'</p>':'')+
      '<p class="hint">Эта серия не повторяла задания. Начни новую для дальнейшей практики.</p>'+
      '<button class="btn primary" data-action="exam-restart">Новая серия из 10 / Uusi 10 tehtävän sarja</button></div>';
  }
  function examMark(mode,passed,points,maxPoints){
    var run=examRun(mode);
    if(!run.questions.length||run.index>=run.questions.length||run.answeredIndex[run.index])return;
    run.answeredIndex[run.index]=true;run.answered++;
    if(passed)run.correct++;
    if(maxPoints){run.points+=points||0;run.maxPoints+=maxPoints;}
  }
  function examNext(mode){
    var run=examRun(mode);
    if(run.index>=run.questions.length)return;
    if(!run.answeredIndex[run.index])run.skipped++;
    run.index++;
    if(mode==='translate'){state.quiz=null;state.quizResult=null;}
    else if(mode==='truefalse'){state.tfQuestion=null;state.tfResult=null;}
    else if(mode==='matching'){state.matchQuestion=null;state.matchResult=null;}
    else if(mode==='multiselect'){state.multiQuestion=null;state.multiResult=null;}
    renderQuiz();
  }
  function examRestart(mode){
    delete state.examRuns[mode];
    if(mode==='translate'){state.quiz=null;state.quizResult=null;}
    else if(mode==='truefalse'){state.tfQuestion=null;state.tfResult=null;}
    else if(mode==='matching'){state.matchQuestion=null;state.matchResult=null;}
    else if(mode==='multiselect'){state.multiQuestion=null;state.multiResult=null;}
    renderQuiz();
  }
  function quizNew(){var run=examRun('translate');state.quiz=run.questions[run.index]||null;state.quizResult=null;}

  function examDisplayPair(){
    if(state.view==='exam'&&state.mockRun&&state.mockRun.answers.length)return pair(state.mockRun.direction);
    return pair(state.view==='exam'?state.mockDirection:state.quizDirection);
  }
  function bilingualQuestion(fi,ru,en){
    var p=examDisplayPair(),content={fi:fi||'',ru:ru||'',en:en||''};
    // Unsupported English wording is never silently invented from Russian or Finnish.
    var major=content[p.from]||content.fi||content.ru,
      minor=content[p.to]||content.ru||content.fi,
      primary=content[p.from]?p.from:(content.fi?'fi':'ru'),
      secondary=content[p.to]?p.to:(content.ru?'ru':'fi');
    return '<div class="exam-question-bilingual">'+
      '<div class="exam-question-main" lang="'+primary+'">'+safe(major)+'</div>'+
      '<div class="exam-question-secondary" lang="'+secondary+'">'+
      '<span class="exam-question-lang">'+secondary.toUpperCase()+'</span> '+safe(minor)+'</div></div>';
  }
  function bilingualFeedback(q){
    var corrected=q.correct===false,fi=corrected?(q.correctStatementFi||q.explanationFi):q.explanationFi,
      ru=corrected?(q.correctStatementRu||q.explanationRu):q.explanationRu,
      en=corrected?(q.correctStatementEn||''):(q.explanationEn||'');
    return '<div class="exam-explain exam-feedback-one"><p><b>'+
      (corrected?'Oikea väite / Правильное утверждение:':'Selitys / Объяснение')+'</b></p>'+
      (en&&examDisplayPair().from==='en'?'<p lang="en"><b>EN:</b> '+safe(en)+'</p>':'')+
      '<p lang="fi"><b>FI:</b> '+safe(fi)+'</p>'+
      '<p lang="ru"><b>RU:</b> '+safe(ru)+'</p></div>';
  }
  function truthValueLabel(value){
    return value?'Tosi · Верно · True':'Epätosi · Неверно · False';
  }
  function truthAnswerFeedback(selected,expected){
    var correct=selected===expected;
    return '<div class="answer exam-judgement '+(correct?'correct':'wrong')+'" role="status" aria-live="polite">'+
      '<p class="exam-judgement-title">'+(correct?'✓ Правильно! / Oikein!':'✕ Ошибка / Väärin!')+'</p>'+
      '<p><b>Твой выбор / Valitsit:</b> '+truthValueLabel(selected)+
      ' <b>'+(correct?'✓ верный выбор':'✕ ошибочный выбор')+'</b></p>'+
      '<p><b>Oikea vastaus / Правильный ответ:</b> '+truthValueLabel(expected)+'</p></div>';
  }
  function multipleAnswerFeedback(selected,expected){
    var correct=selected===expected;
    return '<div class="answer exam-judgement '+(correct?'correct':'wrong')+'">'+
      '<p class="exam-judgement-title">'+(correct?'✓ Правильно / Oikein':'✕ Ошибка / Väärin')+'</p>'+
      '<p><b>'+(selected?'Ты отметил утверждение / Valitsit väitteen':'Ты не отметил утверждение / Et valinnut väitettä')+'</b></p>'+
      '<p><b>Истинность / Väite on:</b> '+truthValueLabel(expected)+'</p></div>';
  }
  function quizModeTabs(){
    return '<div class="panel"><div class="form-row"><span class="hint">Тип теста / Testin tyyppi</span>'+
      '<button class="btn '+(state.quizMode==='translate'?'primary':'white')+'" data-action="quiz-mode" data-value="translate">4 варианта / 4 vaihtoehtoa</button>'+
      '<button class="btn '+(state.quizMode==='truefalse'?'primary':'white')+'" data-action="quiz-mode" data-value="truefalse">Верно / Неверно · Tosi / Epätosi</button>'+
      '<button class="btn '+(state.quizMode==='matching'?'primary':'white')+'" data-action="quiz-mode" data-value="matching">Сопоставление · Yhdistä parit</button>'+
      '<button class="btn '+(state.quizMode==='multiselect'?'primary':'white')+'" data-action="quiz-mode" data-value="multiselect">Несколько ответов · Monivalinta</button></div></div>';
  }
  function tfNew(){var run=examRun('truefalse');state.tfQuestion=run.questions[run.index]||null;state.tfResult=null;}
  function renderTrueFalse(){
    basePage('Проверь себя','Tosi vai epätosi? Прочитай утверждение по-фински.');
    var run=examRun('truefalse');
    if(!run.questions.length||run.index>=run.questions.length){
      root.innerHTML=quizModeTabs()+quizTopicPicker()+examSummary(run);return;
    }
    if(!state.tfQuestion)tfNew();
    var q=state.tfQuestion;
    var s=quizModeTabs()+examProgress(run)+'<div class="panel"><div class="form-row">'+
      '<label class="field"><span>Тема теста</span>'+examTopicSelect(state.filter,'quiz-cat')+'</label>'+
      '<label class="field"><span>Направление / Suunta</span>'+directionSelect('quiz-dir',state.quizDirection,false)+'</label>'+
      '<button class="btn white" data-action="tf-next">Другой вопрос ↻</button></div></div>';
    s+='<div class="panel"><p class="hint">Tosi vai epätosi? / Верно или неверно?</p>';
    if(!q){s+='<p>Для этой темы утверждений пока нет. Выбери экзаменационную тему.</p></div>';root.innerHTML=s;return;}
    s+=bilingualQuestion(q.fi,q.ru,q.en)+'<div class="mc-options">';
    var chosen=state.tfResult===null?null:(state.tfResult?q.correct:!q.correct);
    s+='<button class="btn '+(chosen===true?(state.tfResult?'quiz-picked-correct':'quiz-picked-wrong'):'white')+'" data-action="tf-choose" data-value="true" '+(state.tfResult!==null?'disabled':'')+'>Tosi · Верно'+(chosen===true?(state.tfResult?' ✓':' ✕'):'')+'</button>';
    s+='<button class="btn '+(chosen===false?(state.tfResult?'quiz-picked-correct':'quiz-picked-wrong'):'white')+'" data-action="tf-choose" data-value="false" '+(state.tfResult!==null?'disabled':'')+'>Epätosi · Неверно'+(chosen===false?(state.tfResult?' ✓':' ✕'):'')+'</button></div>';
    if(state.tfResult!==null){
      s+=truthAnswerFeedback(chosen,q.correct)+
        bilingualFeedback(q)+
        '<button class="btn primary" data-action="tf-next">'+(run.index===run.questions.length-1?'Результат / Tulos →':'Seuraava / Следующий →')+'</button>';
    }
    s+='</div><div class="panel"><span class="hint">Текущая сессия / Nykyinen harjoitus: '+
      '✓ '+run.correct+' · ✕ '+(run.answered-run.correct)+
      '. Этот тест не меняет статус «Выучено».</span></div>';
    root.innerHTML=s;
  }


  function examTopicSelect(current,id){
    var data=D.examTopics||[],s='<select class="control" id="'+id+'"><option value="all"'+
      (current==='all'?' selected':'')+'>Все десять тем / Kaikki 10 aihetta</option>';
    for(var i=0;i<data.length;i++){
      var t=data[i];
      s+='<option value="'+safe(t.id)+'"'+(current===t.id?' selected':'')+'>'+
        safe(t.fi+' — '+t.ru+' (с. '+t.pages+')')+'</option>';
    }
    return s+'</select>';
  }
  function quizTopicPicker(){
    return '<div class="panel"><div class="form-row"><label class="field"><span>Тема теста</span>'+
      examTopicSelect(state.filter,'quiz-cat')+'</label><label class="field"><span>Направление / Suunta</span>'+
      directionSelect('quiz-dir',state.quizDirection,false)+'</label></div></div>';
  }
  function matchNew(){var run=examRun('matching');state.matchQuestion=run.questions[run.index]||null;state.matchResult=null;}
  function matchAnswerLabel(fi,items,answerKey){
    if(answerKey==='la')return fi;
    var target=examDisplayPair().to;
    for(var j=0;j<items.length;j++){
      if(items[j].fi===fi)return word(items[j],target)||fi;
    }
    return fi;
  }
  function renderMatching(){
    basePage('Проверь себя','Yhdistä oikeat parit / Соедини правильные пары.');
    var run=examRun('matching');
    if(!run.questions.length||run.index>=run.questions.length){
      root.innerHTML=quizModeTabs()+quizTopicPicker()+examSummary(run);return;
    }
    if(!state.matchQuestion)matchNew();
    var q=state.matchQuestion,answerKey=q&&q.answerKey==='la'?'la':'fi';
    var s=quizModeTabs()+examProgress(run)+quizTopicPicker()+'<div class="panel"><p class="hint">'+(answerKey==='la'?'Latina: yhdistä selitys latinankieliseen termiin / Сопоставь латинские термины с определениями':'Yhdistä selitys ja termi / Подбери термин к определению.')+'</p>';
    if(!q){root.innerHTML=s+'<p>Выбери экзаменационную тему.</p></div>';return;}
    for(var i=0;i<q.items.length;i++){
      var item=q.items[i],chosen=state.matchResult&&state.matchResult.selected[i]||'';
      s+='<div class="form-row"><div class="field grow" id="match-label-'+i+'">'+bilingualQuestion(item.examNoteFi,item.examNoteRu,
        examDisplayPair().from==='en'?'Which Finnish medical term corresponds to the English term "'+safe(item.en)+'"?':'Choose the English term that matches this description.')+'</div>'+
        '<select class="control" aria-labelledby="match-label-'+i+'" id="match-'+i+'" data-match-index="'+i+'" '+(state.matchResult?'disabled':'')+'>'+
        '<option value="">— Valitse / Выбери —</option>';
      for(var k=0;k<q.options.length;k++){
        s+='<option value="'+safe(q.options[k])+'"'+(chosen===q.options[k]?' selected':'')+'>'+
          safe(matchAnswerLabel(q.options[k],q.items,answerKey))+'</option>';
      }
      s+='</select></div>';
      if(state.matchResult){
        s+='<div class="answer '+(chosen===item[answerKey]?'correct':'wrong')+'">'+
          (chosen===item[answerKey]?'✓ ':'✕ ')+'<b>Oikea pari / Правильная пара: '+safe(item[answerKey])+' — '+safe(item.fi)+' — '+safe(item.ru)+'</b></div>'+
          '';
      }
    }
    if(!state.matchResult)s+='<button class="btn primary" data-action="match-check">Tarkista / Проверить</button>';
    else s+='<div class="answer '+(state.matchResult.count===q.items.length?'correct':'wrong')+'">'+
      'Oikein / Правильно: '+state.matchResult.count+' / '+q.items.length+'</div>'+
      '<button class="btn primary" data-action="match-next">'+(run.index===run.questions.length-1?'Результат / Tulos →':'Seuraava / Следующий →')+'</button>';
    root.innerHTML=s+'</div>';
  }
  function multiNew(){var run=examRun('multiselect');state.multiQuestion=run.questions[run.index]||null;state.multiResult=null;}
  function renderMulti(){
    basePage('Проверь себя','Monivalinta / Отметь все верные утверждения.');
    var run=examRun('multiselect');
    if(!run.questions.length||run.index>=run.questions.length){
      root.innerHTML=quizModeTabs()+quizTopicPicker()+examSummary(run);return;
    }
    if(!state.multiQuestion)multiNew();
    var q=state.multiQuestion;
    var s=quizModeTabs()+examProgress(run)+quizTopicPicker()+'<div class="panel"><p class="hint">Valitse kaikki oikeat väitteet / Выбери ВСЕ верные утверждения.</p>';
    if(!q){root.innerHTML=s+'<p>Выбери экзаменационную тему.</p></div>';return;}
    for(var i=0;i<q.items.length;i++){
      var item=q.items[i],checked=state.multiResult&&state.multiResult.selected[i];
      s+='<label class="field exam-multi-choice"><input type="checkbox" data-multi-index="'+i+'" '+
        (checked?'checked ':'')+(state.multiResult?'disabled ':'')+'>'+bilingualQuestion(item.fi,item.ru,item.en)+'</label>';
      if(state.multiResult){
        s+=multipleAnswerFeedback(!!checked,item.correct);
        s+=bilingualFeedback(item);
      }
    }
    if(!state.multiResult)s+='<button class="btn primary" data-action="multi-check">Tarkista / Проверить</button>';
    else s+='<div class="answer '+(state.multiResult.correct?'correct':'wrong')+'">'+
      (state.multiResult.correct?'✓ Oikein / Все правильно':'✕ Ei aivan / Не все ответы правильные')+
      '</div><button class="btn primary" data-action="multi-next">'+(run.index===run.questions.length-1?'Результат / Tulos →':'Seuraava / Следующий →')+'</button>';
    root.innerHTML=s+'</div>';
  }


  /* RUN159. Local, account-scoped exam draft; does not change rs_scores_v1 or write to Firebase.
     Store exact shuffled pages so reopening never rerolls the remaining questions. */
  function mockStorageKey(){
    try{return window.RS_FAMILY&&typeof window.RS_FAMILY.storageKey==='function'?
      window.RS_FAMILY.storageKey('rs_mock_exam_progress_v1'):null;}catch(e){return null;}
  }
  function mockValidDraft(x){
    if(!x||x.schema!==1||!x.run||!Array.isArray(x.run.questions)||x.run.questions.length!==40||
      !Array.isArray(x.run.answers)||x.run.answers.length>40||
      typeof x.run.index!=='number'||Math.floor(x.run.index)!==x.run.index||
      x.run.index<0||x.run.index>40||!/^(fi-ru|ru-fi|fi-en|en-fi)$/.test(x.run.direction)||
      ['auto','fi-ru','ru-fi','fi-en','en-fi'].indexOf(x.choice)<0)return false;
    var a=x.run.answers,idx=x.run.index,seen={},types={},topics={},q,i;
    if(idx===40&&a.length!==40)return false;
    if(idx<40&&a.length!==idx&&a.length!==idx+1)return false;
    for(i=0;i<40;i++){
      q=x.run.questions[i];
      if(!q||typeof q.id!=='string'||seen[q.id]||!isExamTopic(q.topic)||
        ['translate','truefalse','matching','multiselect'].indexOf(q.type)<0)return false;
      seen[q.id]=true;types[q.type]=(types[q.type]||0)+1;topics[q.topic]=(topics[q.topic]||0)+1;
    }
    for(i=0;i<a.length;i++){
      if(!a[i]||typeof a[i].score!=='number'||!isFinite(a[i].score)||
        a[i].score<0||a[i].score>1||typeof a[i].perfect!=='boolean')return false;
    }
    for(i=0;i<10;i++){
      var topic='EXAM'+(i===9?'10':'0'+(i+1));
      if(topics[topic]!==4)return false;
    }
    return types.translate===10&&types.truefalse===10&&types.matching===10&&types.multiselect===10;
  }
  function mockReadDraft(){
    var key=mockStorageKey();
    if(!key){state.mockSaveOk=false;return null;}
    try{
      var raw=window.localStorage.getItem(key);
      if(!raw){state.mockSaveOk=true;return null;}
      var draft=JSON.parse(raw);
      state.mockSaveOk=true;
      return mockValidDraft(draft)?draft:null;
    }catch(e){state.mockSaveOk=false;return null;}
  }
  function mockSaveDraft(){
    var key=mockStorageKey();
    if(!key){state.mockSaveOk=false;return false;}
    try{
      window.localStorage.setItem(key,JSON.stringify({schema:1,choice:state.mockDirection,
        attemptId:state.mockAttemptId,run:state.mockRun}));
      state.mockSaveOk=true;return true;
    }catch(e){state.mockSaveOk=false;return false;}
  }
  function mockClearDraft(){
    var key=mockStorageKey();
    if(!key)return;
    try{window.localStorage.removeItem(key);state.mockSaveOk=true;}catch(e){state.mockSaveOk=false;}
  }
  var mockCloudTimer=null;
  function mockDraft(){
    return {schema:1,choice:state.mockDirection,attemptId:state.mockAttemptId,
      run:state.mockRun};
  }
  function mockArchiveCopy(draft){
    if(!draft||!draft.run||!draft.run.answers||!draft.run.answers.length)return;
    var k=null;
    try{
      k=window.RS_FAMILY&&window.RS_FAMILY.storageKey('rs_mock_exam_cloud_archive_v1');
      if(!k)return;
      var saved=JSON.parse(window.localStorage.getItem(k)||'[]');
      if(!Array.isArray(saved))saved=[];
      var old=JSON.stringify(draft),found=false;
      for(var i=0;i<saved.length;i++){if(JSON.stringify(saved[i])===old)found=true;}
      if(!found){saved.push(draft);if(saved.length>4)saved=saved.slice(-4);
        window.localStorage.setItem(k,JSON.stringify(saved));}
    }catch(e){/* No private user data is logged. Local current attempt remains intact. */}
  }
  function mockCloudMessage(){
    if(state.mockCloudStatus==='checking')return '<p class="exam-cloud-working">⏳ Сверяю облачную копию экзамена…</p>';
    if(state.mockCloudStatus==='synced')return state.mockSaveOk?
      '<p class="exam-autosave-ok exam-save-compact" role="status">✓ Экзамен сохраняется автоматически — на всех устройствах.</p>':
      '<p class="exam-autosave-warning" role="alert">⚠ Облако работает, но локальное сохранение недоступно.</p>';
    if(state.mockCloudStatus==='conflict')return '<div class="exam-autosave-warning" role="alert"><b>Найдены две разные попытки экзамена.</b>'+
      '<p>Ни одна не перезаписана. Сейчас сохранена твоя локальная попытка.</p>'+
      '<button type="button" class="btn white" data-action="mock-cloud-use-remote">Продолжить облачную попытку (локальная будет сохранена отдельно)</button>'+
      '<button type="button" class="btn white" data-action="mock-cloud-keep-local">Остаться на этой попытке без облачной записи</button></div>';
    if(state.mockCloudStatus==='error'||state.mockCloudStatus==='reset-failed')
      return '<div class="exam-autosave-warning" role="alert">⚠ Облачная синхронизация не подтверждена: '+
        safe(state.mockCloudError||'проверка недоступна')+(state.mockSaveOk?'. Экзамен сохранён только на этом устройстве.':'. Локальное сохранение также недоступно.')+
        '<button type="button" class="btn white" data-action="mock-cloud-retry">Повторить облачную проверку</button></div>';
    if(state.mockCloudStatus==='local-only')return '<p class="exam-autosave-warning" role="status">'+
      (state.mockSaveOk?'✓ Экзамен сохранён только на этом устройстве.':'⚠ Локальное сохранение недоступно.')+'</p>';
    return state.mockSaveOk?
      '<p class="exam-autosave-ok exam-save-compact" role="status">✓ Экзамен сохраняется на этом устройстве.</p>':
      '<p class="exam-autosave-warning" role="alert">⚠ Автосохранение недоступно — не закрывай страницу.</p>';
  }
  function mockCloudErrorText(err){
    var code=String(err&&err.code||'');
    if(code==='auth-required'||code==='verify-email')return 'нужен вход в подтверждённый Google-аккаунт';
    if(code==='permission-denied')return 'сервер не разрешил доступ к частному документу (Firestore Rules ещё не включены)';
    if(code==='offline'||code==='unavailable')return 'нет связи с облаком';
    if(code==='cloud-invalid')return 'облачная копия имеет неподдерживаемый формат';
    if(code==='snapshot-too-large')return 'размер экзамена превышает установленный лимит';
    return 'облачный сервер недоступен';
  }
  function mockCloudApply(result,originalDraft){
    if(!result||!result.kind)return;
    if(result.kind==='conflict'){
      state.mockCloudConflict=result;
      state.mockCloudStatus='conflict';
      return;
    }
    if(result.kind==='downloaded'){
      var now=mockDraft(),choice=window.RS_EXAM_CLOUD.choose(now,result.draft);
      if(choice.kind==='conflict'){
        state.mockCloudConflict={local:now,cloud:result.draft};
        state.mockCloudStatus='conflict';return;
      }
      if(choice.kind==='download'||choice.kind==='equal'){
        // Archive the old nonempty local attempt before replacing with a longer server copy.
        mockArchiveCopy(now);
        state.mockRun=result.draft.run;
        state.mockDirection=result.draft.choice;
        state.mockAttemptId=result.draft.attemptId||null;
        mockSaveDraft();
      }else if(choice.kind==='upload'){
        state.mockCloudPending=true;
      }
    }else if(result.kind==='uploaded'||result.kind==='reset'){
      if(state.mockRun===originalDraft.run){
        state.mockAttemptId=result.draft.attemptId;
        mockSaveDraft();
      }else state.mockCloudPending=true;
    }else if(result.kind==='synced'&&result.draft){
      state.mockAttemptId=result.draft.attemptId||state.mockAttemptId;
      mockSaveDraft();
    }
    state.mockCloudStatus='synced';
    state.mockCloudError='';
  }
  function mockCloudSync(force){
    if(!window.RS_EXAM_CLOUD||!state.mockRun||state.mockCloudBusy||
       state.mockCloudStatus==='conflict'||state.mockCloudStatus==='local-only'||
       state.mockCloudStatus==='reset-failed')return;
    var uid=window.RS_FAMILY&&window.RS_FAMILY.uid,serial=++state.mockCloudSerial;
    var draft=mockDraft();
    state.mockCloudPending=false;
    state.mockCloudBusy=true;
    state.mockCloudStatus='checking';
    window.RS_EXAM_CLOUD.sync(draft,mockValidDraft).then(function(result){
      if(serial!==state.mockCloudSerial||uid!==(window.RS_FAMILY&&window.RS_FAMILY.uid))return;
      mockCloudApply(result,draft);
    }).catch(function(err){
      if(serial!==state.mockCloudSerial)return;
      state.mockCloudStatus='error';
      state.mockCloudError=mockCloudErrorText(err);
    }).then(function(){
      if(serial!==state.mockCloudSerial)return;
      state.mockCloudBusy=false;
      if(state.view==='exam')renderMockExam();
      if(state.mockCloudPending&&state.mockCloudStatus==='synced'){
        state.mockCloudPending=false;
        mockCloudQueue();
      }
    });
  }
  function mockCloudQueue(){
    if(state.mockCloudStatus==='conflict'||state.mockCloudStatus==='local-only'||
      state.mockCloudStatus==='reset-failed')return;
    state.mockCloudPending=true;
    if(state.mockCloudBusy)return;
    if(mockCloudTimer)clearTimeout(mockCloudTimer);
    mockCloudTimer=setTimeout(function(){
      mockCloudTimer=null;
      if(state.mockCloudPending)mockCloudSync(false);
    },450);
  }
  function mockCloudRestart(){
    if(!window.RS_EXAM_CLOUD)return;
    var uid=window.RS_FAMILY&&window.RS_FAMILY.uid,serial=++state.mockCloudSerial;
    var draft=mockDraft();
    state.mockCloudBusy=true;state.mockCloudStatus='checking';
    window.RS_EXAM_CLOUD.reset(draft,mockValidDraft).then(function(result){
      if(serial!==state.mockCloudSerial||uid!==(window.RS_FAMILY&&window.RS_FAMILY.uid))return;
      mockCloudApply(result,draft);
    }).catch(function(err){
      if(serial!==state.mockCloudSerial)return;
      state.mockCloudStatus='reset-failed';
      state.mockCloudError=mockCloudErrorText(err);
    }).then(function(){
      if(serial!==state.mockCloudSerial)return;
      state.mockCloudBusy=false;if(state.view==='exam')renderMockExam();
    });
  }

  function mockInit(){
    if(state.mockRun)return state.mockRun;
    var stored=mockReadDraft();
    if(stored){
      state.mockDirection=stored.choice;
      state.mockRun=stored.run;
      state.mockAttemptId=stored.attemptId||null;
      return state.mockRun;
    }
    var dir=direction(state.mockDirection),bank=window.RS_TRUE_FALSE&&window.RS_TRUE_FALSE.questions||[],
      items=window.RS_MOCK_EXAM&&window.RS_MOCK_EXAM.build(D,bank,dir)||[];
    state.mockRun={questions:items,index:0,answers:[],direction:dir};
    if(items.length===40)mockSaveDraft();
    return state.mockRun;
  }
  function mockTypeLabel(type){
    if(type==='translate')return '4 варианта / 4 vaihtoehtoa';
    if(type==='truefalse')return 'Верно / Неверно · Tosi / Epätosi';
    if(type==='matching')return 'Сопоставление · Yhdistä parit';
    return 'Множественный выбор · Monivalinta';
  }
  function mockTopicLabel(id){
    var topics=D.examTopics||[];
    for(var i=0;i<topics.length;i++)if(topics[i].id===id)return topics[i].fi+' — '+topics[i].ru;
    return id;
  }
  function mockReviewTerm(fi,items){
    if(!fi)return '—';
    for(var i=0;i<items.length;i++){
      if(items[i].fi===fi||items[i].la===fi){
        return (items[i].la?'<b>LA:</b> '+safe(items[i].la)+' · ':'')+'<b>FI:</b> '+safe(items[i].fi)+' · <b>RU:</b> '+safe(items[i].ru)+
          (items[i].en?' · <b>EN:</b> '+safe(items[i].en):'');
      }
    }
    return safe(fi);
  }
  function mockErrorReview(run){
    var s='',count=0,p=pair(run.direction);
    for(var i=0;i<run.answers.length;i++){
      var result=run.answers[i],q=run.questions[i];
      if(!result||!q)continue;
      if(result.score<1)count++;
      var perfect=result.score===1,points=(Math.round(result.score*100)/100).toFixed(2).replace(/0+$/,'').replace(/\.$/,'').replace('.',',');
      var mark=perfect?'✓ Верно / Oikein':result.score>0?'◐ Частично / Osittain':'✕ Ошибка / Väärin';
      s+='<details class="exam-review '+(perfect?'exam-review-passed':'exam-review-missed')+'"><summary>Задание '+(i+1)+
        ' · '+mark+' · '+points+' / 1 балл · '+safe(mockTypeLabel(q.type))+
        ' · '+safe(mockTopicLabel(q.topic))+'</summary>'+
        '<div class="exam-review-original"><p class="exam-review-title">Исходное задание / Alkuperäinen tehtävä</p>';
      if(q.type==='translate'){
        s+='<p class="hint">Выбери один правильный перевод / Valitse yksi oikea käännös</p>'+
          '<p class="exam-review-term" lang="'+safe(q.from)+'">'+safe(word(q.item,q.from))+'</p>'+
          '<ol class="exam-review-options">';
        for(var t=0;t<q.options.length;t++){
          var option=q.options[t],picked=result.selected===option,correct=q.answer===option;
          s+='<li class="'+(picked&&!correct?'exam-review-wrong':correct?'exam-review-right':'')+'">'+
            safe(option)+(picked?' <b>← Твой выбор / Valitsit</b>':'')+
            (correct?' <b>✓ Правильный ответ / Oikea vastaus</b>':'')+'</li>';
        }
        s+='</ol><p><b>Твой ответ / Valitsit:</b> '+safe(result.selected||'—')+'</p>'+
          '<p><b>Правильный ответ / Oikea vastaus:</b> '+safe(q.answer)+'</p>'+
          (perfect?'':examNote(q.item));
      }else if(q.type==='truefalse'){
        s+='<p class="hint">Tosi vai epätosi? / Верно или неверно?</p>'+
          bilingualQuestion(q.question.fi,q.question.ru,q.question.en)+
          (perfect?
           '<p class="exam-review-right"><b>✓ Твой ответ / Valitsit: </b>'+truthValueLabel(result.selected)+
           ' · Верно / Oikein</p>':
           truthAnswerFeedback(result.selected,q.question.correct)+bilingualFeedback(q.question));
      }else if(q.type==='matching'){
        s+='<p class="hint">'+(q.question.answerKey==='la'?'Latina: yhdistä neljä termiä / Сопоставь четыре латинских термина':'Yhdistä oikeat parit / Сопоставь все четыре определения')+'</p>';
        for(var m=0;m<q.question.items.length;m++){
          var term=q.question.items[m],
            selected=result.selected&&result.selected[m]||'',
            correctField=q.question.answerKey==='la'?'la':'fi',
            match=selected===term[correctField];
          s+='<div class="exam-review-row '+(match?'exam-review-right':'exam-review-wrong')+'">'+
            '<p class="exam-review-row-heading">'+(match?'✓ Правильно / Oikein':'✕ Ошибка / Väärin')+
            ' · '+(m+1)+' / '+q.question.items.length+'</p>'+
            bilingualQuestion(term.examNoteFi,term.examNoteRu,
              p.from==='en'?'Which Finnish medical term corresponds to the English medical term "'+term.en+'"?':
              'Choose the English term for the Finnish description.')+
            '<p><b>Твой выбор / Valitsit:</b> '+mockReviewTerm(selected,q.question.items)+'</p>'+
            '<p><b>Правильная пара / Oikea pari:</b> '+mockReviewTerm(term[correctField],q.question.items)+'</p></div>';
        }
      }else if(q.type==='multiselect'){
        s+='<p class="hint">Valitse kaikki oikeat väitteet / Отметь все верные утверждения</p>';
        for(var k=0;k<q.question.items.length;k++){
          var item=q.question.items[k],
            checked=!!(result.selected&&result.selected[k]),
            rowCorrect=checked===item.correct;
          s+='<div class="exam-review-row '+(rowCorrect?'exam-review-right':'exam-review-wrong')+'">'+
            '<p class="exam-review-row-heading">'+(rowCorrect?'✓ Правильно / Oikein':'✕ Ошибка / Väärin')+
            ' · '+(k+1)+' / '+q.question.items.length+'</p>'+
            bilingualQuestion(item.fi,item.ru,item.en)+
            '<p><b>Твой выбор / Valitsit:</b> '+
              (checked?'Отметил / Valitsit':'Не отметил / Et valinnut')+'</p>'+
            '<p><b>Правильное действие / Oikea valinta:</b> '+
              (item.correct?'Отметить / Valitse':'Не отмечать / Älä valitse')+
              ' · '+truthValueLabel(item.correct)+'</p>'+
            (rowCorrect?'':bilingualFeedback(item))+'</div>';
        }
      }
      s+='</div></details>';
    }
    return '<div class="panel"><h2>Полный лист экзамена / Koko kokeen tarkistus (40)</h2>'+
      '<p class="hint">Все задания с баллами и ответами. Раскрой строку, чтобы увидеть исходный вопрос и свой выбор. Подробное объяснение — при ошибке.</p>'+
      '<p><b>Ошибочных и частично правильных / Virheitä:</b> '+count+' / 40</p>'+
      s+'</div>';
  }

  function renderMockExam(){
    basePage('Экзамен / Koe / Exam','40 перемешанных заданий из всех десяти тем. Порог сдачи 80% (32 из 40).');
    var run=mockInit(),n=run.questions.length,p=examDisplayPair();
    if(n!==40){root.innerHTML='<div class="panel">Не удалось подготовить 40 проверяемых вопросов. Учебные данные не изменены.</div>';return;}
    if(state.mockCloudStatus==='unchecked')mockCloudSync(true);
    if(state.mockCloudBusy&&state.mockCloudStatus==='checking'){
      root.innerHTML='<div class="panel"><h3>Проверяю облачную копию экзамена</h3>'+
        '<p>Сейчас твоя локальная попытка защищена от перезаписи. '+safe('Ожидание подтверждения облака.')+'</p></div>';
      return;
    }
    var s='<div class="panel"><div class="form-row"><label class="field"><span>Направление / Suunta / Direction</span>'+
      directionSelect('mock-dir',state.mockDirection,false)+'</label></div>'+
      '<p class="hint">Тренировочный экзамен, не официальная оценка Riveria. Один вопрос — максимум 1 балл. Ответы и правильные варианты показываются только в конце.</p>'+
      mockCloudMessage()+'</div>';
    if(run.index>=n){
      var report=window.RS_MOCK_EXAM.report(run);
      s+='<div class="panel exam-run-done"><h2>'+(report.passed?'✓ Сдано / Hyväksytty':'✕ Не сдано / Hylätty')+'</h2>'+
        '<div class="exam-mock-percent">'+report.percent+'%</div>'+
        '<p><b>'+report.points+' / 40 баллов</b> · Порог / Raja 32 / 40 (80%)</p>'+
        '<p>Ответов: '+report.count+' / 40 · Заданий с неполным баллом: '+report.wrong+'</p>'+
        '<p class="hint">Баллы за сопоставление начисляются по 0,25 за пару; за множественный выбор — с учётом неверно отмеченных вариантов.</p>'+
        '<p class="hint">Экзамен можно пройти снова. «Новый экзамен» заменит текущий разбор новой попыткой.</p>'+ 
        '<button class="btn primary" data-action="mock-restart">Новый экзамен / Uusi koe</button></div>'+
        mockErrorReview(run);
      root.innerHTML=s;return;
    }
    var q=run.questions[run.index],done=!!run.answers[run.index];
    s+='<div class="panel exam-run-progress"><b>Экзамен / Koe: '+(run.index+1)+' / 40</b>'+
      '<div class="exam-progress-track"><span style="width:'+Math.round(run.index*2.5)+'%"></span></div>'+
      '<span class="hint">'+safe(mockTypeLabel(q.type))+' · '+safe(mockTopicLabel(q.topic))+'</span></div>'+
      '<div class="panel">';
    if(q.type==='translate'){
      s+='<p class="hint">Выбери один правильный перевод / Valitse yksi oikea käännös</p>'+
        '<div class="flash-term" lang="'+p.from+'">'+safe(word(q.item,q.from))+'</div><div class="mc-options">';
      for(var t=0;t<q.options.length;t++){
        s+='<button class="btn white" data-action="mock-answer" data-value="'+t+'"'+(done?' disabled':'')+'>'+safe(q.options[t])+'</button>';
      }
      s+='</div>';
    }else if(q.type==='truefalse'){
      s+=bilingualQuestion(q.question.fi,q.question.ru,q.question.en)+'<div class="mc-options">'+
        '<button class="btn white" data-action="mock-answer" data-value="true"'+(done?' disabled':'')+'>Tosi · Верно · True</button>'+
        '<button class="btn white" data-action="mock-answer" data-value="false"'+(done?' disabled':'')+'>Epätosi · Неверно · False</button></div>';
    }else if(q.type==='matching'){
      s+='<p class="hint">Yhdistä oikeat parit / Сопоставь все четыре определения</p>';
      for(var a=0;a<q.question.items.length;a++){
        var term=q.question.items[a];
        s+='<div class="form-row"><div class="field grow" id="mock-match-label-'+a+'">'+
          bilingualQuestion(term.examNoteFi,term.examNoteRu,
          p.from==='en'?'Which Finnish term corresponds to the English medical term "'+term.en+'"?':'Choose the English term for the Finnish description.')+
          '</div><select class="control" id="mock-match-'+a+'" data-mock-match="'+a+'" aria-labelledby="mock-match-label-'+a+'"'+(done?' disabled':'')+'>'+
          '<option value="">— Valitse / Выбери —</option>';
        for(var z=0;z<q.question.options.length;z++){
          var fi=q.question.options[z],label=fi;
          if(q.question.answerKey!=='la')for(var w0=0;w0<q.question.items.length;w0++){
            if(q.question.items[w0].fi===fi)label=word(q.question.items[w0],p.to)||fi;
          }
          s+='<option value="'+safe(fi)+'"'+(done&&run.answers[run.index].selected[a]===fi?' selected':'')+'>'+safe(label)+'</option>';
        }
        s+='</select></div>';
      }
    }else if(q.type==='multiselect'){
      s+='<p class="hint">Valitse kaikki oikeat väitteet / Отметь все верные утверждения</p>';
      for(var u=0;u<q.question.items.length;u++){
        var cl=q.question.items[u];
        s+='<label class="field exam-multi-choice"><input type="checkbox" data-mock-multi="'+u+'"'+
          (done&&run.answers[run.index].selected[u]?' checked':'')+(done?' disabled':'')+'>'+
          bilingualQuestion(cl.fi,cl.ru,cl.en)+'</label>';
      }
    }
    if(!done){
      if(q.type==='matching'||q.type==='multiselect')s+='<button class="btn primary" data-action="mock-check">Подтвердить ответ / Vahvista vastaus</button>';
      s+='<p class="hint">Без пропуска. Верные ответы откроются после 40-го задания.</p>';
    }else{
      s+='<p class="answer correct">Ответ записан / Vastaus tallennettu. Правильность увидишь в итоговом разборе.</p>'+
        '<button class="btn primary" data-action="mock-next">'+
        (run.index===39?'Завершить экзамен / Päätä koe →':'Следующий / Seuraava →')+'</button>';
    }
    root.innerHTML=s+'</div>';
  }
  function mockSubmit(answer){
    var run=mockInit(),q=run.questions[run.index];
    if(!q||run.answers[run.index])return;
    var gradeResult=window.RS_MOCK_EXAM.evaluate(q,answer);
    if(!gradeResult)return;
    run.answers[run.index]=gradeResult;
    mockSaveDraft();
    mockCloudQueue();
    renderMockExam();
  }
  function mockValidateAndSubmit(){
    var run=mockInit(),q=run.questions[run.index],chosen=[],i,el;
    if(!q||run.answers[run.index])return;
    if(q.type==='matching'){
      for(i=0;i<q.question.items.length;i++){
        el=byId('mock-match-'+i);
        if(!el||!el.value){toast('Выбери соответствие для всех четырёх строк.');return;}
        chosen.push(el.value);
      }
    }else if(q.type==='multiselect'){
      for(i=0;i<q.question.items.length;i++){
        el=document.querySelector('[data-mock-multi="'+i+'"]');chosen.push(!!(el&&el.checked));
      }
      if(!chosen.some(function(x){return x;})){toast('Отметь хотя бы один ответ.');return;}
    }else return;
    mockSubmit(chosen);
  }

  function renderQuiz(){if(state.quizMode==='matching'){renderMatching();return;}if(state.quizMode==='multiselect'){renderMulti();return;}if(state.quizMode==='truefalse'){renderTrueFalse();return;}basePage('Проверь себя','Выбери правильный перевод. Каждый ответ сохраняется в статистике.');var run=examRun('translate');if(!run.questions.length||run.index>=run.questions.length){root.innerHTML=quizModeTabs()+examSummary(run);return;}if(!state.quiz)quizNew();var q=state.quiz;var s=quizModeTabs()+examProgress(run)+englishWarning(state.quizDirection)+'<div class="panel"><div class="form-row"><label class="field"><span>Тема теста</span>'+selectCats(state.filter,'quiz-cat')+'</label><label class="field"><span>Направление</span>'+directionSelect('quiz-dir',state.quizDirection,false,true)+'</label><button class="btn white" data-action="quiz-next">Другой вопрос ↻</button></div></div>';
    if(!q){s+='<div class="panel">Для теста нужно хотя бы четыре слова. Выбери другую тему.</div>';root.innerHTML=s;return;}
    s+='<div class="panel"><p class="hint">Выбери перевод:</p><div class="flash-term">'+safe(word(q.item,q.from))+'</div><div class="mc-options">';for(var i=0;i<q.options.length;i++){s+='<button class="btn '+(state.quizResult!==null&&q.options[i]===q.answer?'good':'white')+'" '+(state.quizResult!==null?'disabled':'')+' data-action="quiz-choose" data-value="'+i+'">'+safe(q.options[i])+'</button>';}
    s+='</div>';
    if(state.quizResult!==null)s+='<div class="answer '+(state.quizResult?'correct':'wrong')+'">'+(state.quizResult?'Верно! ':'Пока не так. ')+'<b>'+safe(word(q.item,q.from))+'</b> — '+safe(q.answer)+'</div>'+examNote(q.item)+'<button class="btn primary" data-action="quiz-next">'+(run.index===run.questions.length-1?'Результат / Tulos →':'Следующий вопрос →')+'</button>';
    s+='</div>';root.innerHTML=s;
  }
  function renderDict(){basePage('Словарь','Поиск по финским и русским словам. Экзаменационные темы — в общем списке.');var s=englishWarning(state.dictDirection)+'<div class="panel"><div class="form-row"><label class="field grow"><span>Поиск слова или перевода</span><input class="control" id="dict-search" type="search" placeholder="Например: turvotus, подгузник, одежда" value="'+safe(state.dictQuery)+'"></label><label class="field"><span>Тема</span>'+selectCats(state.dictFilter,'dict-cat')+'</label><label class="field"><span>Переводы</span>'+directionSelect('dict-dir',state.dictDirection,true)+'</label></div><label class="hint"><input type="checkbox" id="dict-phrases"'+(state.dictIncludePhrases?' checked':'')+'> Также показать фразы</label></div><div class="section-title"><h2>Результаты <span id="dict-count"></span></h2></div><div id="dict-results" class="dictionary-list"></div>';root.innerHTML=s;renderDictItems();}
  function renderDictItems(){var q=clean(state.dictQuery),pool=allTerms().concat(state.dictIncludePhrases&&sharedEnabled()?D.phrases.concat(D.mediatri):[]),out=[];for(var i=0;i<pool.length;i++){var x=pool[i];if(!matchCat(x,state.dictFilter))continue;if(q&&clean([x.fi,x.ru,x.en,x.cat,x.catRu,x.example,x.keywords,x.la].join(' ')).indexOf(q)<0)continue;if(state.dictDirection!=='all'&&!eligible(x,state.dictDirection))continue;out.push(x);}
    var el=byId('dict-results');if(!el)return;var count=byId('dict-count');count.textContent='('+out.length+')';if(!out.length){el.innerHTML='<div class="empty">Совпадений нет. Попробуй другое слово.</div>';return;}var s='';for(var j=0;j<Math.min(out.length,120);j++){var x=out[j];var v=state.dictDirection==='all'?'<b>FI: '+safe(x.fi)+'</b><p>RU: '+safe(x.ru)+'</p>'+(x.examTopics&&x.examTopics.length?'':(word(x,'en')?'<p>EN: '+safe(x.en)+'</p>':'')):('<b>'+safe(word(x,pair(state.dictDirection).from))+'</b><p>'+safe(word(x,pair(state.dictDirection).to))+'</p>');s+='<div class="dict-row"><div>'+v+examNote(x)+'<small>'+safe(categoryName(x))+'</small></div><button class="tiny-btn" data-action="copy-fi" data-value="'+safe(x.fi)+'">Копировать</button></div>';}if(out.length>120)s+='<div class="empty">Показаны первые 120. Уточни поиск, чтобы увидеть остальные.</div>';el.innerHTML=s;
  }
  function medTabs(){return tabsHtml(state.medMode,[['guide','Помощник записи'],['situations','Ситуации'],['phrases','Фразы'],['headings','Заголовки'],['draft','Подбор слов']],'med-mode');}
  function renderMediatri(){basePage('Тренировка Mediatri','Учимся писать короткие профессиональные записи без реальных данных пациентов.');var s=englishWarning(state.medDirection)+'<div class="banner warning"><b>Только учебный тренажёр</b><p>Не вводи имена, даты рождения, диагнозы или другие сведения настоящих жильцов. Образцы — не реальные записи и не инструкция по назначению лекарств.</p></div><div class="panel"><label class="field"><span>Направление</span>'+directionSelect('med-dir',state.medDirection,false)+'</label></div>'+medTabs();
    if(state.medMode==='guide'&&window.RS_MED_GUIDE)s+=window.RS_MED_GUIDE.guideView();
    else if(state.medMode==='situations')s+=medSituations();
    else if(state.medMode==='phrases')s+=medPhrases();
    else if(state.medMode==='headings')s+=medHeadings();else s+=medDraft();
    root.innerHTML=s;
    if(state.medMode==='guide'&&window.RS_MED_GUIDE)window.RS_MED_GUIDE.renderGuide();
    if(state.medMode==='phrases')renderPhraseItems();
    if(state.medMode==='headings')renderHeadingItems();
  }
  function medSituations(){var x=D.scenarios[state.scenario]||D.scenarios[0],p=medPair(),task=p.from==="en"?x.taskEn:p.from==="fi"?x.answer:x.task,answer=p.to==="en"?x.translationEn:p.to==="ru"?x.translation:x.answer;var s='<div class="panel"><div class="section-title"><h2>Ситуация '+(state.scenario+1)+' / '+D.scenarios.length+'</h2><p>'+safe(categoryName(x))+'</p></div><p class="hint">Задание: переведи или составь краткую запись на выбранном языке.</p><div class="answer">'+safe(task)+'</div><label class="field"><span>Твоя попытка (ничего не отправляется в интернет)</span><textarea id="scenario-input" class="control" placeholder="Asukas oli..." rows="4">'+safe(state.scenarioDraft)+'</textarea></label><div class="btn-row"><button class="btn primary" data-action="med-reveal">◉ '+(state.scenarioRevealed?'Скрыть образец':'Показать образец')+'</button><button class="btn white" data-action="med-next">Следующая ситуация →</button></div>';
    if(state.scenarioRevealed){
      // Suppress Finnish original only when it is the same as the sample.
      var originalFi=String(answer).trim()===String(x.answer).trim()?
        '':'\n\n<b>Оригинал FI:</b> '+safe(x.answer);
      s+='<div class="answer correct"><b>Возможный вариант ответа:</b>\n'+safe(answer)+originalFi+'</div><p class="hint"><b>Ключевые слова:</b> '+safe(x.keywords)+'</p><div class="btn-row"><button class="btn good" data-action="med-score" data-value="good">✓ Справился</button><button class="btn white" data-action="med-score" data-value="hard">↻ Нужно повторить</button></div>';
    }
    return s+'</div><div class="panel soft"><b>Как устроена профессиональная запись</b><p>Havainto → toiminta → vaikutus → jatko</p><p class="hint">Наблюдение → выполненное действие → результат → дальнейшее наблюдение. Указывай только то, что действительно произошло.</p></div>';
  }
  function medPhrases(){var s='<div class="panel"><label class="field"><span>Поиск профессиональной фразы</span><input class="control" id="med-phrase-search" placeholder="спокойный, душ, переодел, лекарство..." value="'+safe(state.phraseQuery)+'"></label><div class="hint" style="margin-top:9px">'+D.mediatri.length+' образца записи</div></div><div id="phrase-items" class="dictionary-list"></div>';return s;}
  function renderPhraseItems(){var q=clean(state.phraseQuery),items=D.mediatri,html='',shown=0;for(var i=0;i<items.length;i++){var x=items[i];if(q&&clean(x.ru+' '+x.en+' '+x.fi+' '+x.catRu+' '+x.keywords).indexOf(q)<0)continue;var p=medPair();html+='<div class="dict-row"><div><b>'+safe(word(x,p.from))+'</b><p>'+safe(word(x,p.to))+'</p><small>'+safe(categoryName(x))+'</small></div><button class="tiny-btn" data-action="copy-fi" data-value="'+safe(x.fi)+'">Копировать</button></div>';shown++;if(shown===60)break;}byId('phrase-items').innerHTML=html||'<div class="empty">Ничего не найдено</div>';}
  function medHeadings(){var s='<div class="panel"><p>Это учебный перечень заголовков, замеченных в программе. Часть пунктов является элементами интерфейса, а не названием медицинского раздела.</p><label class="field"><span>Поиск заголовка</span><input id="heading-search" class="control" value="'+safe(state.headingQuery)+'" placeholder="Например: Lääkitys, состояние"></label></div><div id="heading-items" class="dictionary-list"></div>';return s;}
  function renderHeadingItems(){var q=clean(state.headingQuery),ht='';for(var i=0;i<D.headings.length;i++){var x=D.headings[i];if(q&&clean(x.fi+' '+x.ru+' '+x.en+' '+x.kind).indexOf(q)<0)continue;var p=medPair();ht+='<div class="dict-row"><div><b>'+safe(word(x,p.from))+'</b><p>'+safe(word(x,p.to))+' · '+safe(x.kind)+'</p><small>'+safe(x.note)+'</small></div></div>';}byId('heading-items').innerHTML=ht||'<div class="empty">Нет совпадений</div>';}
  function medDraft(){return '<div class="panel"><h2>Подбор слов на русском или английском</h2><p class="hint">Напиши короткое учебное описание на русском или английском. Приложение найдёт похожие готовые фразы и важные слова из словаря. Это НЕ свободный автоматический перевод.</p><label class="field"><span>Учебное описание (без личных данных)</span><textarea class="control" id="draft-input" rows="4" placeholder="Утром помог одеться, сменил мокрый подгузник. Жилец был спокойным.">'+safe(state.draft)+'</textarea></label><div class="btn-row"><button class="btn primary" data-action="find-phrases">Найти финские выражения</button><button class="btn white" data-action="clear-draft">Очистить</button></div><div id="draft-results" class="draft-output"></div></div>';}
  function tokenize(s){var tokens=clean(s).split(/[^а-яёa-zäöå0-9]+/),out=[];for(var i=0;i<tokens.length;i++){if(tokens[i].length>3 && ['котор','после','этого','жильц','сегод','пацие','потом','очень','было','этой','чтобы','помощ'].indexOf(tokens[i].slice(0,5))<0)out.push(tokens[i].slice(0,Math.min(5,tokens[i].length)));}return out;}
  function scoreText(tokens,s){var text=clean(s),val=0;for(var i=0;i<tokens.length;i++){if(text.indexOf(tokens[i])>=0)val++;}return val;}
  function findPhrases(){var q=state.draft;var el=byId('draft-results');if(!q.trim()){el.innerHTML='<p class="hint">Сначала введи учебное описание.</p>';return;}var tk=tokenize(q),res=[],list=D.mediatri.concat(D.phrases);for(var i=0;i<list.length;i++){var z=list[i],sc=Math.max(scoreText(tk,z.ru),scoreText(tk,z.en||''));if(sc>0)res.push({score:sc,data:z});}res.sort(function(a,b){return b.score-a.score;});var seen={},t='<h3>Похожие профессиональные фразы</h3>',n=0;for(i=0;i<res.length&&n<7;i++){var x=res[i].data;if(seen[x.fi])continue;seen[x.fi]=1;t+='<div class="answer"><b>'+safe(x.fi)+'</b><div class="hint">'+safe(language()==='en'&&x.en?x.en:x.ru)+'</div><button class="tiny-btn" data-action="copy-fi" data-value="'+safe(x.fi)+'">Копировать</button></div>';n++;}if(!n)t+='<p class="hint">Подходящих фраз пока нет. Попробуй более простые слова.</p>';
    var keys=[],dict=D.keyterms.concat(D.terms);for(i=0;i<dict.length;i++){var row=dict[i],sco=Math.max(scoreText(tk,row.ru),scoreText(tk,row.en||''));if(sco>0)keys.push({score:sco,item:row});}keys.sort(function(a,b){return b.score-a.score;});var seenw={};t+='<h3>Слова-подсказки</h3>';n=0;for(i=0;i<keys.length&&n<18;i++){var k=keys[i].item;if(seenw[k.fi])continue;seenw[k.fi]=1;t+='<span class="word-chip" title="'+safe(k.ru)+'">'+safe(k.fi)+' — '+safe(language()==='en'&&k.en?k.en:k.ru)+'</span>';n++;}el.innerHTML=t+'<p class="notice">Сопоставление по словам, без ИИ и без сети. Проверяй, подходит ли выражение к реальному действию.</p>';
  }
  function renderAdd(){basePage('Добавить слово','Новые слова сохраняются только в твоём личном словаре.');root.innerHTML='<div class="banner warning"><b>Сохранение и облако</b><p>Новое слово доступно офлайн и синхронизируется только с твоим аккаунтом после восстановления интернета. Регулярно делай резервную копию. Не вводи данные настоящих пациентов.</p></div><div class="panel"><form id="add-form"><div class="two-col"><label class="field"><span>Финское слово *</span><input required maxlength="180" name="fi" class="control" placeholder="esim. inkohousut"></label><label class="field"><span>Русский перевод *</span><input required maxlength="400" name="ru" class="control" placeholder="впитывающие трусики"></label></div><div class="two-col"><label class="field"><span>Тема</span><select class="control" name="cat"><option value="Omat sanat">Мои слова</option><option value="Lääkitys">Лекарства</option><option value="Hoito">Уход</option><option value="Vointi">Состояние</option><option value="Pukeutuminen">Переодевание</option><option value="Aamutoimet">Утренний уход</option><option value="Iltatoimet">Вечерний уход</option><option value="custom">Своя тематика</option></select><input name="customCat" maxlength="90" class="control" placeholder="Например: Архитектура, Работа, Музыка" style="margin-top:8px"></label><label class="field"><span>Фраза по-фински (необязательно)</span><input maxlength="500" name="example" class="control" placeholder="Asukas oli rauhallinen."></label></div><p><button class="btn good" type="submit">＋ Сохранить слово</button></p></form></div><div class="section-title"><h2>Мои слова ('+state.userWords.length+')</h2></div><div class="dictionary-list" id="my-words">'+myWordsHtml()+'</div>';
    restoreAddDraft();
    if(window.RS_V3_RELEASE&&window.RS_V3_RELEASE.isActive())
      window.RS_V3_RELEASE.renderFinds(root);
    restoreAddDraft();
  }
  function myWordsHtml(){if(!state.userWords.length)return '<div class="empty">Пока нет добавленных слов.</div>';var t='';for(var i=state.userWords.length-1;i>=0;i--){var x=state.userWords[i];t+='<div class="dict-row"><div><b>'+safe(x.fi)+'</b><p>'+safe(x.ru)+'</p><small>'+safe(x.cat)+'</small></div><button class="tiny-btn" data-action="delete-word" data-value="'+safe(x.id)+'">Удалить</button></div>';}return t;}
  function renderBackup(){
    basePage('Мои данные и аккаунт','Личный словарь, синхронизация и резервные копии.');
    var account=window.RS_FAMILY?window.RS_FAMILY.email:'';
    var scope=sharedEnabled()?'all':'mine';
    root.innerHTML='<div class="panel"><h2>👤 Мой аккаунт</h2><p><b>'+safe(account)+'</b></p><p class="hint">Прогресс и добавленные слова этого аккаунта закрыты для других членов семьи. Синхронизация: <b id="family-cloud-state">'+safe(window.RS_FAMILY?window.RS_FAMILY.statusText():'ожидание')+'</b></p><div class="btn-row"><button type="button" class="btn good" data-action="family-sync">↻ Синхронизировать личную таблицу</button><button type="button" class="btn white" data-action="family-logout">Выйти из аккаунта</button></div></div>'+
    '<div class="panel"><h2>Мой словарь</h2><p>Личные аккаунты независимы. Можно изучать только собственные слова или дополнительно включить библиотеку Riveria.</p><label class="field"><span>Показывать слова</span><select class="control" id="family-scope"><option value="mine"'+(scope==='mine'?' selected':'')+'>Только мой личный словарь</option><option value="all"'+(scope==='all'?' selected':'')+'>Мой словарь + библиотека Riveria</option></select></label><p class="hint">Настройка сохраняется отдельно в твоём аккаунте.</p></div>'+
    '<div class="panel"><h2>Перенос из старой версии</h2><p>Если ты учил слова до появления семейных аккаунтов, перенеси их в СВОЙ аккаунт. Исходные данные останутся нетронутыми.</p><button type="button" class="btn white" data-action="family-migrate">↥ Перенести мои прежние результаты</button><p class="hint" id="family-migrate-state"></p></div>'+
    '<div class="panel"><h2>Резервная копия</h2><p>Создай копию личных слов, избранного и результатов повторений.</p><div class="btn-row"><button class="btn primary" data-action="export-json">↓ Скачать JSON</button><button class="btn white" data-action="export-tsv">↓ Мои слова в TSV</button></div><hr style="border:0;border-top:1px solid #e1ecf0;margin:23px 0"><label class="field"><span>Восстановить личную копию (.json)</span><input type="file" id="backup-file" accept=".json,application/json"></label><p class="notice">Импорт заменяет локальные данные только вошедшего пользователя. Сначала создай резервную копию.</p></div>'+
    ''+(window.RS_COMM?window.RS_COMM.dataPanel():'')+
    (window.RS_MONITOR_CLIENT?window.RS_MONITOR_CLIENT.panelHtml():'')+
    '<div class="panel soft"><b>Без интернета</b><p>Карточки и новые слова остаются доступными в ранее открытом браузере. Для входа на новом устройстве или после выхода из аккаунта требуется интернет. Автоматическая синхронизация выполняется только при подключении.</p></div>';
  }
  function renderLearned(){basePage('Выученные слова','Эти карточки не появляются в обычном обучении. Любое слово можно вернуть на изучение.');
    root.innerHTML=metric()+'<div class="panel"><div class="btn-row"><button class="btn primary" data-action="review-learned">↻ Повторить выученные</button><button class="btn white" data-view="cards">Вернуться к новым словам</button></div><label class="field"><span>Поиск среди выученных</span><input class="control" type="search" id="learned-search" value="'+safe(state.learnedQuery)+'" placeholder="Слово или перевод"></label></div><div class="section-title"><h2>Выученные <span id="learned-count"></span></h2></div><div class="dictionary-list" id="learned-results"></div>';
    renderLearnedItems();}
  function renderLearnedItems(){var list=allTerms().concat(sharedEnabled()?D.phrases:[]).filter(function(x){return isLearned(x.id);}),q=clean(state.learnedQuery);if(q)list=list.filter(function(x){return clean(x.fi+' '+x.ru+' '+x.en).indexOf(q)>=0;});list.sort(function(a,b){return a.fi.localeCompare(b.fi);});
    var count=byId('learned-count'),dest=byId('learned-results');if(count)count.textContent='('+list.length+')';if(!dest)return;
    if(!list.length){dest.innerHTML='<div class="panel empty">Здесь пока нет выученных слов. Нажимай «Знаю» на карточках, чтобы они сюда попадали.</div>';return;}
    var shown=list.slice(0,120);dest.innerHTML=shown.map(function(x){return '<div class="dict-row"><div><b>'+safe(word(x,pair(state.direction).from))+'</b><p>'+safe(word(x,pair(state.direction).to))+'</p><small>'+safe(categoryName(x))+'</small></div><button class="tiny-btn" data-action="return-to-study" data-value="'+safe(x.id)+'">Вернуть на изучение</button></div>';}).join('')+(list.length>shown.length?'<p class="hint">Показаны первые '+shown.length+' из '+list.length+'. Для остальных используй поиск.</p>':'');}
  function renderMore(){basePage('Дополнительно','Личные материалы и сообщество.');root.innerHTML='<div class="panel"><div class="btn-row"><button class="btn white" data-view="learned">✓ Выученные</button><button class="btn primary" data-view="add">＋ Добавить слово</button><button class="btn white" data-view="backup">⇄ Данные</button><button class="btn white" data-view="libraries">▤ Библиотека</button><button class="btn white" data-view="users">♙ Пользователи</button></div></div>';}
  function nav(v){if(v==='cards'&&state.view!=='cards'){state.reviewLearned=false;state.sessionSeen={};state.deck=[];}state.view=v==='more'?'more':v;render();window.scrollTo(0,0);}
  function saveCustom(form){
    if(window.RS_V3_RELEASE&&window.RS_V3_RELEASE.isActive()){
      window.RS_V3_RELEASE.formWord(form,byId('v3-find-topic')?byId('v3-find-topic').value:'other',byId('v3-find-note')?byId('v3-find-note').value:'').then(function(){
        clearAddDraft(form.elements.fi.value,form.elements.ru.value);
        renderAdd();toast('Слово добавлено в «Мои находки» без дубля.');
      },function(e){toast('V3: '+String(e.message||e));});
      return;
    }
    var fi=form.elements.fi.value.replace(/^\s+|\s+$/g,''),ru=form.elements.ru.value.replace(/^\s+|\s+$/g,'');if(!fi||!ru){toast('Нужно заполнить оба языка.');return;}var cat=form.elements.cat.value;if(cat==='custom')cat=form.elements.customCat.value.replace(/^\s+|\s+$/g,'')||'Мои слова';var p={id:'L'+Date.now()+Math.floor(Math.random()*1000),fi:fi,ru:ru,cat:cat,catRu:'Мои слова',example:form.elements.example.value,exampleRu:'',level:'B1',priority:1};p.updatedAt=Date.now();state.userWords.push(p);save('rs_user_words_v1',state.userWords);clearAddDraft(fi,ru);renderAdd();toast('Слово сохранено в личном словаре.');}
  function triggerDownload(text,name,mime){try{var blob=new Blob([text],{type:mime||'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();document.body.removeChild(a);window.setTimeout(function(){URL.revokeObjectURL(url);},10000);toast('Файл подготовлен. Проверь загрузки браузера.');}catch(e){toast('Не удалось сохранить файл. Попробуй другой браузер.');}}
  function exportJson(){var data={app:'Riveria Sanasto',version:1,created:new Date().toISOString(),userWords:state.userWords,scores:state.scores,favorites:state.favorites,favoriteMeta:value('rs_favorite_meta_v1',{}),deletedWords:value('rs_deleted_words_v1',{})};triggerDownload(JSON.stringify(data,null,2),'riveria-sanasto-backup.json','application/json;charset=utf-8');}
  function exportTsv(){var rows=[['ID','Suomi','Русский','Aihe / Тема FI','Тема RU','Тип','Esimerkki FI','Пример RU','Latin','Уровень*','Источник / происхождение','Приоритет','Статус','Повторений','Верных','Последнее повторение','Следующее повторение','Заметки']];state.userWords.forEach(function(x){rows.push([x.id,x.fi,x.ru,x.cat,x.catRu,'termi',x.example||'','','','B1','Riveria Sanasto офлайн',1,'Новый',0,0,'','','Добавлено в приложении. Сверить дубликаты перед импортом.']);});var txt=rows.map(function(row){return row.map(function(x){return String(x===undefined?'':x).replace(/[\t\r\n]+/g,' ');}).join('\t');}).join('\r\n');triggerDownload('\ufeff'+txt,'riveria-sanasto-my-words.tsv','text/tab-separated-values;charset=utf-8');}
  function restoreFile(file){if(!file)return;var reader=new FileReader();reader.onload=function(){try{var x=JSON.parse(reader.result);if(x.app!=='Riveria Sanasto'||!Array.isArray(x.userWords)||typeof x.scores!=='object'||typeof x.favorites!=='object')throw new Error('Invalid backup');if(!window.confirm('Заменить текущие локальные слова и результаты данными из резервной копии?'))return;state.userWords=x.userWords.slice(0,5000).filter(function(y){return y&&typeof y.fi==='string'&&typeof y.ru==='string'&&y.id;});state.scores=x.scores;state.favorites=x.favorites;save('rs_user_words_v1',state.userWords);save('rs_scores_v1',state.scores);save('rs_favorites_v1',state.favorites);save('rs_favorite_meta_v1',x.favoriteMeta||{});save('rs_deleted_words_v1',x.deletedWords||{});load();if(window.RS_FAMILY)window.RS_FAMILY.schedule();toast('Личная резервная копия восстановлена');renderBackup();}catch(e){toast('Файл не похож на резервную копию Riveria Sanasto.');}};reader.readAsText(file);}
  function copyText(s){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(s).then(function(){toast('Скопировано');},function(){fallbackCopy(s);});}else fallbackCopy(s);}
  function fallbackCopy(s){var e=document.createElement('textarea');e.value=s;e.style.position='fixed';e.style.left='-9999px';document.body.appendChild(e);e.select();var ok=false;try{ok=document.execCommand('copy');}catch(ex){}document.body.removeChild(e);toast(ok?'Скопировано':'Выдели и скопируй текст вручную');}
  document.addEventListener('click',function(e){var b=e.target.closest?e.target.closest('button'):null;if(!b)return;var v=b.getAttribute('data-view');if(v){nav(v);return;}var action=b.getAttribute('data-action'),choice=b.getAttribute('data-value');if(!action)return;
    if(action==='open-cloud-panel'){var trigger=byId('cloud-toggle');if(trigger)trigger.click();}
    else if(action==='flip'){state.flipped=true;renderCards();}
    else if(action==='next-card'){nextCard();}
    else if(action==='mark-good'||action==='mark-hard'){var c=state.deck[state.cardIndex];grade(c.latinOf||c.id,action==='mark-good');nextCard();}
    else if(action==='favorite'){var card=state.deck[state.cardIndex],id=card.latinOf||card.id;state.favorites[id]=!state.favorites[id];save('rs_favorites_v1',state.favorites);var fm=value('rs_favorite_meta_v1',{});fm[id]={starred:!!state.favorites[id],updatedAt:Date.now()};save('rs_favorite_meta_v1',fm);renderCards();}
    else if(action==='reshuffle'){state.sessionSeen={};ensureDeck(true);renderCards();}
    else if(action==='restart-study'){state.sessionSeen={};state.deck=[];ensureDeck(true);renderCards();}
    else if(action==='study-mode'){state.reviewLearned=false;state.sessionSeen={};state.deck=[];renderCards();}
    else if(action==='review-learned'){state.reviewLearned=true;state.sessionSeen={};state.filter='all';state.extraSearch=false;state.deck=[];state.view='cards';render();window.scrollTo(0,0);}
    else if(action==='return-to-study'){setLearned(choice,false);renderLearnedItems();toast('Слово возвращено на изучение.');}
    else if(action==='only-favorites'){state.extraSearch=!state.extraSearch;state.sessionSeen={};ensureDeck(true);renderCards();}
    else if(action==='cat-quick'){state.filter=choice;state.sessionSeen={};ensureDeck(true);renderCards();window.scrollTo(0,0);}
    else if(action==='mock-answer'){
      var run=mockInit(),q=run.questions[run.index];
      if(!q)return;
      if(q.type==='translate'){var idx=Number(choice);if(idx>=0&&idx<q.options.length)mockSubmit(q.options[idx]);}
      else if(q.type==='truefalse'&&(choice==='true'||choice==='false'))mockSubmit(choice==='true');
    }
    else if(action==='mock-check'){mockValidateAndSubmit();}
    else if(action==='mock-next'){var er=mockInit();if(er.answers[er.index]){er.index++;mockSaveDraft();mockCloudQueue();renderMockExam();}}
    else if(action==='mock-restart'){
      mockArchiveCopy(mockDraft());mockClearDraft();state.mockRun=null;state.mockAttemptId=null;
      state.mockCloudConflict=null;state.mockCloudStatus='starting-new';mockInit();mockCloudRestart();renderMockExam();
    }
    else if(action==='mock-cloud-retry'){
      if(state.mockCloudStatus==='reset-failed')mockCloudRestart();
      else {state.mockCloudStatus='unchecked';renderMockExam();}
    }
    else if(action==='mock-cloud-use-remote'){
      var conflict=state.mockCloudConflict;
      if(conflict&&conflict.cloud&&mockValidDraft(conflict.cloud)){
        mockArchiveCopy(mockDraft());
        state.mockRun=conflict.cloud.run;state.mockDirection=conflict.cloud.choice;
        state.mockAttemptId=conflict.cloud.attemptId||null;
        state.mockCloudConflict=null;state.mockCloudStatus='synced';mockSaveDraft();renderMockExam();
      }
    }
    else if(action==='mock-cloud-keep-local'){
      state.mockCloudConflict=null;state.mockCloudStatus='local-only';renderMockExam();
    }
    else if(action==='quiz-mode'){if(['translate','truefalse','matching','multiselect'].indexOf(choice)>=0){
      state.quizMode=choice;if(choice!=='translate'&&state.filter!=='all'&&!isExamTopic(state.filter))state.filter='all';state.tfQuestion=null;state.matchQuestion=null;state.multiQuestion=null;renderQuiz();}}
    else if(action==='exam-restart'){examRestart(state.quizMode);}
    else if(action==='match-next'){examNext('matching');}
    else if(action==='match-check'){if(!state.matchQuestion||state.matchResult)return;var mq=state.matchQuestion,chosen=[],correctCount=0;
      for(var mi=0;mi<mq.items.length;mi++){var sel=byId('match-'+mi),value=sel?sel.value:'';chosen.push(value);
        if(value===mq.items[mi][mq.answerKey==='la'?'la':'fi'])correctCount++;}
      state.matchResult={selected:chosen,count:correctCount};examMark('matching',correctCount===mq.items.length,correctCount,mq.items.length);renderMatching();}
    else if(action==='multi-next'){examNext('multiselect');}
    else if(action==='multi-check'){if(!state.multiQuestion||state.multiResult)return;var rows=state.multiQuestion.items,selected=[],allRight=true;
      for(var si=0;si<rows.length;si++){var el=document.querySelector('[data-multi-index="'+si+'"]'),checked=!!(el&&el.checked);
        selected.push(checked);if(checked!==rows[si].correct)allRight=false;}
      state.multiResult={selected:selected,correct:allRight};examMark('multiselect',allRight,selected.filter(function(x,i){return x===rows[i].correct;}).length,rows.length);renderMulti();}
    else if(action==='tf-next'){examNext('truefalse');}
    else if(action==='tf-choose'){if(state.quizMode!=='truefalse'||!state.tfQuestion||state.tfResult!==null)return;state.tfResult=(choice==='true')===state.tfQuestion.correct;examMark('truefalse',state.tfResult);renderTrueFalse();}
    else if(action==='quiz-next'){examNext('translate');}
    else if(action==='quiz-choose'){var q=state.quiz;if(state.quizResult!==null)return;var correct=q.options[Number(choice)]===q.answer;state.quizResult=correct;grade(q.item.id,correct);examMark('translate',correct);renderQuiz();}
    else if(action==='med-mode'){state.medMode=choice;state.draftFound=false;renderMediatri();if(choice==='phrases')renderPhraseItems();if(choice==='headings')renderHeadingItems();}
    else if(action==='med-next'){state.scenario=(state.scenario+1)%D.scenarios.length;state.scenarioRevealed=false;state.scenarioDraft='';renderMediatri();}
    else if(action==='med-reveal'){state.scenarioDraft=byId('scenario-input').value;state.scenarioRevealed=!state.scenarioRevealed;renderMediatri();}
    else if(action==='med-score'){grade(D.scenarios[state.scenario].id,choice==='good');state.scenario=(state.scenario+1)%D.scenarios.length;state.scenarioRevealed=false;state.scenarioDraft='';renderMediatri();}
    else if(action==='find-phrases'){state.draft=byId('draft-input').value;findPhrases();}
    else if(action==='clear-draft'){state.draft='';renderMediatri();}
    else if(action==='copy-fi'){copyText(choice);}
    else if(action==='delete-word'){
      if(window.RS_V3_RELEASE&&window.RS_V3_RELEASE.isActive()){
        toast('В V3 удаление пока отключено: требуется безопасная история версий.');
        return;
      }
      if(window.confirm('Удалить это слово из памяти этого устройства?')){state.userWords=state.userWords.filter(function(x){return x.id!==choice;});var gone=value('rs_deleted_words_v1',{});gone[choice]=Date.now();save('rs_deleted_words_v1',gone);save('rs_user_words_v1',state.userWords);renderAdd();}}
    else if(action==='family-sync'){if(window.RS_FAMILY)window.RS_FAMILY.sync();}
    else if(action==='family-logout'){if(window.RS_FAMILY)window.RS_FAMILY.logout();}
    else if(action==='family-migrate'){if(window.RS_FAMILY)window.RS_FAMILY.migrate();}
    else if(action==='export-json'){exportJson();}
    else if(action==='export-tsv'){exportTsv();}
  });
  document.addEventListener('change',function(e){if(isAddDraftField(e.target))saveAddDraft();var id=e.target.id;if(id==='cards-cat'){state.filter=e.target.value;state.sessionSeen={};ensureDeck(true);renderCards();}else if(id==='quiz-cat'){state.filter=e.target.value;if(state.quizMode==='truefalse'){state.tfQuestion=null;state.tfSeen={};}else if(state.quizMode==='matching'){state.matchQuestion=null;state.matchSeen={};}else if(state.quizMode==='multiselect'){state.multiQuestion=null;state.multiSeen={};}else quizNew();renderQuiz();}else if(id==='cards-dir'){state.direction=e.target.value;state.flipped=false;state.sessionSeen={};ensureDeck(true);renderCards();}else if(id==='mock-dir'){var er=mockInit();if(er.answers.length===0){mockClearDraft();state.mockDirection=e.target.value;state.mockRun=null;state.mockAttemptId=null;mockInit();mockCloudRestart();}else{toast('Направление фиксируется после первого ответа. Для изменения начни новый экзамен.');}renderMockExam();}else if(id==='quiz-dir'){state.quizDirection=e.target.value;if(state.quizMode==='translate'){delete state.examRuns.translate;quizNew();}renderQuiz();}else if(id==='dict-dir'){state.dictDirection=e.target.value;renderDict();}else if(id==='med-dir'){state.medDirection=e.target.value;renderMediatri();}else if(id==='cards-latin'){state.cardsLatin=e.target.checked;state.sessionSeen={};ensureDeck(true);renderCards();}else if(id==='cards-count'){state.cardsCount=Number(e.target.value);state.sessionSeen={};ensureDeck(true);renderCards();}else if(id==='dict-cat'){state.dictFilter=e.target.value;renderDictItems();}else if(id==='dict-phrases'){state.dictIncludePhrases=e.target.checked;renderDictItems();}else if(id==='backup-file'){restoreFile(e.target.files[0]);}else if(id==='family-scope'){if(window.RS_FAMILY)window.RS_FAMILY.setScope(e.target.value);}});
  document.addEventListener('input',function(e){if(isAddDraftField(e.target))saveAddDraft();var id=e.target.id;if(id==='learned-search'){state.learnedQuery=e.target.value;renderLearnedItems();}else if(id==='dict-search'){state.dictQuery=e.target.value;renderDictItems();}else if(id==='med-phrase-search'){state.phraseQuery=e.target.value;renderPhraseItems();}else if(id==='heading-search'){state.headingQuery=e.target.value;renderHeadingItems();}else if(id==='draft-input'){state.draft=e.target.value;}else if(id==='scenario-input'){state.scenarioDraft=e.target.value;}});
  document.addEventListener('submit',function(e){if(e.target.id==='add-form'){e.preventDefault();saveCustom(e.target);}});
  window.addEventListener('online',function(){setStatus();if(state.view==='exam'&&state.mockRun&&state.mockCloudStatus!=='conflict'){state.mockCloudStatus='unchecked';renderMockExam();}});window.addEventListener('offline',setStatus);
  window.addEventListener('error',function(e){var x=byId('storage-status');if(x)x.textContent='Ошибка интерфейса — сделай резервную копию';});
  if(!D||!D.terms||!D.scenarios){root.innerHTML='<div class="panel"><h2>Не удалось открыть базу</h2><p>Проверь, что файл data.js загружен рядом с приложением. Если интернет отключён, открой сайт онлайн один раз для установки офлайн-кэша.</p></div>';return;}
  window.RS_APP_LOCALE=function(){
    if(state.direction==='auto'){state.sessionSeen={};ensureDeck(true);}
    if(state.view==='practice'&&state.quizMode==='translate'&&state.quizDirection==='auto'){
      delete state.examRuns.translate;state.quiz=null;state.quizResult=null;
    }
    if(state.view==='exam'&&state.mockDirection==='auto'&&state.mockRun&&state.mockRun.answers.length===0){
      mockClearDraft();state.mockRun=null;
    }
    render();
  };
  window.RS_FAMILY_REFRESH=function(reset){
    load();
    // Background cloud readback updates progress, NOT the current learning session.
    // Resetting a shuffled deck here skips a visible card after Know/Repeat.
    // A real account switch still explicitly requests the full reset.
    if(reset){
      state.deck=[];state.sessionSeen={};state.quiz=null;state.examRuns={};state.mockRun=null;state.mockAttemptId=null;state.mockCloudSerial++;state.mockCloudStatus='unchecked';state.mockCloudConflict=null;state.mockCloudPending=false;state.mockCloudBusy=false;state.tfQuestion=null;state.matchQuestion=null;state.multiQuestion=null;state.cardIndex=0;state.flipped=false;
      state.view='cards';state.filter='all';state.extraSearch=false;
    }
    render();
  };
  load();setStatus();render();
  if(('serviceWorker' in navigator)&&(location.protocol==='https:'||location.hostname==='localhost')){
    window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js').then(function(reg){reg.update();},function(err){toast('Офлайн-кэш не установлен: '+err.message);});});
  }
})();
