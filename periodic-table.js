/* RUN177 – interactive IUPAC-style table of 118 recognised chemical elements.
 * Offline, ES5, iPhone/iPad Safari-compatible. No account or user data changes. */
(function(w,d){
'use strict';
var entries=w.RS_PERIODIC_ELEMENTS||[],byNumber={},current=1,section='table',family='all',overview='all',gridButtons=[],quiz=null;
var cats={
 nonmetal:['Epämetalli','Неметалл','Nonmetal','Элементы-неметаллы часто плохо проводят электричество. / Epämetallit johtavat usein sähköä huonosti.'],
 noble:['Jalokaasu','Благородный газ','Noble gas','Ryhmän 18 alkuaineet reagoivat yleensä heikosti. / Элементы группы 18 обычно химически малоактивны.'],
 alkali:['Alkalimetalli','Щелочной металл','Alkali metal','Ryhmän 1 metallit muodostavat usein +1-ioneja. / Металлы группы 1 часто образуют ионы +1.'],
 alkaline:['Maa-alkalimetalli','Щёлочноземельный металл','Alkaline earth metal','Ryhmän 2 metallit muodostavat usein +2-ioneja. / Металлы группы 2 часто образуют ионы +2.'],
 transition:['Siirtymämetalli','Переходный металл','Transition metal','Siirtymämetallit ovat pääosin ryhmissä 3–12. / Переходные металлы находятся преимущественно в группах 3–12.'],
 post:['Muu metalli','Другой металл','Post-transition metal','Nämä metallit sijaitsevat pääosin taulukon oikeanpuoleisessa metallialueessa. / Металлы правой части металлической области.'],
 metalloid:['Puolimetalli','Полуметалл','Metalloid','Puolimetallien ominaisuuksissa on sekä metallien että epämetallien piirteitä. / Обладают свойствами металлов и неметаллов.'],
 halogen:['Halogeeni','Галоген','Halogen','Ryhmän 17 alkuaineet ovat halogeeneja; moni reagoi helposti. / Элементы группы 17 — галогены, многие химически активны.'],
 lanthanide:['Lantanoidi','Лантаноид','Lanthanide','Lantanoidit kuuluvat jaksoon 6 ja ne esitetään usein alarivillä. / Лантаноиды относятся к 6-му периоду, вынесены вниз.'],
 actinide:['Aktinoidi','Актиноид','Actinide','Aktinoidit kuuluvat jaksoon 7; kaikki ovat radioaktiivisia. / Актиноиды относятся к 7-му периоду; все радиоактивны.'],
 unknown:['Epävarma luokitus','Классификация уточняется','Properties uncertain','Raskaimpien alkuaineiden ominaisuuksia ei aina tunneta kokeellisesti. / У самых тяжёлых элементов многие свойства изучены недостаточно.']
};
var metalClasses={alkali:1,alkaline:1,transition:1,post:1,lanthanide:1,actinide:1};
var nonmetalClasses={nonmetal:1,halogen:1,noble:1};
var overviewHelp={
 all:['Все 118 элементов. Выбери класс или цвет для подсветки.','Kaikki 118 alkuainetta. Valitse luokka tai väri korostaaksesi alkuaineita.'],
 metal:['Металлы: щелочные, щёлочноземельные, переходные, другие металлы, лантаноиды и актиноиды.','Metallit: alkali-, maa-alkali- ja siirtymämetallit, muut metallit, lantanoidit ja aktinoidit.'],
 nonmetal:['Неметаллы: обычные неметаллы, галогены и благородные газы. Водород тоже неметалл.','Epämetallit: muut epämetallit, halogeenit ja jalokaasut. Myös vety on epämetalli.'],
 metalloid:['Полуметаллы находятся примерно вдоль ступенчатой границы между металлами и неметаллами.','Puolimetallit sijaitsevat suunnilleen metallien ja epämetallien rajalla.'],
 gas:['Газы при комнатной температуре: это агрегатное состояние, не отдельная химическая группа.','Kaasut huoneenlämmössä: olomuoto, ei erillinen kemiallinen ryhmä.'],
 liquid:['Жидкие при комнатной температуре элементы: Hg (ртуть) и Br (бром).','Huoneenlämmössä nestemäiset alkuaineet: Hg (elohopea) ja Br (bromi).'],
 solid:['Твёрдые при комнатной температуре элементы. Неизвестные состояния тяжёлых элементов сюда не включены.','Huoneenlämmössä kiinteät alkuaineet. Raskaimpien alkuaineiden tuntemattomia olomuotoja ei arvata.']
};
var searchAliases={26:['ferrum','феррум'],79:['aurum','аурум'],29:['cuprum','купрум']};
var usages={
1:['Vetyä on vedessä H₂O ja tähdissä.','Водород входит в состав воды H₂O и распространён в звёздах.'],
2:['Heliumia käytetään esimerkiksi matalan lämpötilan jäähdytyksessä.','Гелий используют, например, в криогенном охлаждении.'],
3:['Litiumia käytetään monissa akuissa.','Литий применяется во многих аккумуляторах.'],
6:['Hiili on orgaanisten yhdisteiden perusta.','Углерод — основа органических соединений.'],
7:['Typpi muodostaa suuren osan Maan ilmakehästä.','Азот составляет большую часть атмосферы Земли.'],
8:['Happea tarvitaan hengityksessä ja monissa palamisreaktioissa.','Кислород необходим для дыхания и многих реакций горения.'],
9:['Fluoria esiintyy fluoria sisältävissä yhdisteissä, kuten fluoridisuoloissa.','Фтор входит в состав фторидов и многих соединений.'],
11:['Natriumia on esimerkiksi ruokasuolassa NaCl.','Натрий входит в состав поваренной соли NaCl.'],
12:['Magnesiumia on monissa seoksissa ja biologisissa yhdisteissä.','Магний встречается в сплавах и биологических соединениях.'],
13:['Alumiini on kevyt ja yleinen rakennemateriaali.','Алюминий — лёгкий распространённый конструкционный металл.'],
14:['Pii on puolijohde, jota käytetään elektroniikassa.','Кремний — полупроводник, используемый в электронике.'],
15:['Fosfori on tärkeä osa DNA:ta ja solujen energia-aineenvaihduntaa.','Фосфор входит в состав ДНК и соединений энергетического обмена клеток.'],
16:['Rikkiä esiintyy luonnossa ja monissa proteiineissa.','Сера встречается в природе и входит в состав многих белков.'],
17:['Klooria on ruokasuolan NaCl koostumuksessa kloridina.','Хлор входит в состав поваренной соли NaCl в виде хлорид-иона.'],
18:['Argonia käytetään suojakaasuna hitsauksessa.','Аргон используют как защитный газ при сварке.'],
19:['Kalium on tärkeä aine ihmiskehon solujen toiminnassa.','Калий важен для работы клеток организма.'],
20:['Kalsiumia on luissa ja hampaissa.','Кальций содержится в костях и зубах.'],
26:['Rauta on tärkeä teräksen raaka-aine ja hemoglobiinin osa.','Железо — основа сталей и компонент гемоглобина.'],
29:['Kupari johtaa hyvin sähköä ja sitä käytetään johdoissa.','Медь хорошо проводит ток и применяется в проводах.'],
30:['Sinkkiä käytetään esimerkiksi teräksen suojaamiseen korroosiolta.','Цинк используют, например, для защиты стали от коррозии.'],
35:['Bromi kuuluu halogeeneihin ja on huoneenlämmössä nestettä.','Бром относится к галогенам и при комнатной температуре жидкий.'],
47:['Hopea johtaa hyvin sähköä ja sitä käytetään myös koruissa.','Серебро хорошо проводит электричество и применяется в украшениях.'],
50:['Tinaa käytetään muun muassa metalliseoksissa.','Олово используется, в частности, в металлических сплавах.'],
53:['Jodi on kilpirauhashormonien osa.','Йод входит в состав гормонов щитовидной железы.'],
54:['Ksenon on jalokaasu, jota käytetään erikoisvalaisimissa.','Ксенон — благородный газ, применяется в специальных лампах.'],
56:['Bariumia esiintyy monissa mineraaleissa.','Барий встречается в составе различных минералов.'],
74:['Volframilla on korkea sulamispiste.','У вольфрама высокая температура плавления.'],
79:['Kulta kestää korroosiota ja sitä käytetään koruissa sekä elektroniikassa.','Золото устойчиво к коррозии и применяется в украшениях и электронике.'],
80:['Elohopea on huoneenlämmössä nestemäinen metalli. Se on myrkyllinen.','Ртуть — жидкий металл при комнатной температуре, токсична.'],
82:['Lyijy on raskas ja myrkyllinen metalli.','Свинец — тяжёлый токсичный металл.'],
92:['Uraani on radioaktiivinen alkuaine, jota käytetään ydinenergian tuotannossa.','Уран — радиоактивный элемент, применяется в ядерной энергетике.']
};
var els={};
function el(id){return d.getElementById(id);}
function esc(x){return String(x===null||typeof x==='undefined'?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function norm(x){return String(x||'').toLocaleLowerCase().replace(/ё/g,'е').replace(/^\s+|\s+$/g,'');}
function descGroup(e){
 if(e.c==='lanthanide')return ['Lantanoidisarja on jaksossa 6, f-lohko. Ryhmän 3 sijoitustavoissa on eri käytäntöjä.','Ряд лантаноидов — 6-й период, f-блок. В разных таблицах расположение элементов 3-й группы может различаться.'];
 if(e.c==='actinide')return ['Aktinoidisarja on jaksossa 7, f-lohko. Kaikki aktinoidit ovat radioaktiivisia.','Ряд актиноидов — 7-й период, f-блок. Все актиноиды радиоактивны.'];
 if(e.n===1)return ['Vety on ryhmän 1 yläpuolella, mutta se on epämetalli eikä alkalimetalli.','Водород расположен над 1-й группой, но является неметаллом, а не щелочным металлом.'];
 if(e.g===1)return ['Ryhmän 1 alkalimetallit muodostavat yleensä yhden positiivisen ionin (+1).','Щелочные металлы 1-й группы обычно образуют ионы заряда +1.'];
 if(e.g===2)return ['Ryhmän 2 maa-alkalimetallit muodostavat usein +2-ioneja.','Щёлочноземельные металлы 2-й группы часто образуют ионы +2.'];
 if(e.g===17)return ['Ryhmä 17 on halogeenien ryhmä.','17-я группа — галогены.'];
 if(e.g===18)return ['Ryhmä 18 on jalokaasujen ryhmä.','18-я группа — благородные газы.'];
 if(e.g>=3&&e.g<=12)return ['Alkuaine sijaitsee keskiosan ryhmässä '+e.g+', jossa on siirtymämetalleja.','Элемент находится в '+e.g+'-й группе центральной части таблицы, где расположены переходные металлы.'];
 return ['Alkuaine on ryhmässä '+e.g+'. Saman ryhmän alkuaineilla on usein samankaltaisia ominaisuuksia.','Элемент находится в группе '+e.g+'. У элементов одной группы часто сходные свойства.'];
}
function stateName(e){
 if(!e.st)return ['Ei luotettavasti määritelty','Не установлено'];
 if(e.st==='gas')return ['Kaasu','Газ'];
 if(e.st==='liquid')return ['Neste','Жидкость'];
 return ['Kiinteä','Твёрдое'];
}
function mkButtons(){
 var g=els.grid,html='';
 for(var n=1;n<=18;n++)html+='<div class="group-number" style="grid-column:'+(n+1)+';grid-row:1" title="Ryhmä '+n+'">'+n+'</div>';
 for(var p=1;p<=7;p++)html+='<div class="period-number" style="grid-column:1;grid-row:'+(p+1)+'" title="Jakso '+p+'">'+p+'</div>';
 html+='<div class="period-number" style="grid-column:1;grid-row:10">Ln</div><div class="period-number" style="grid-column:1;grid-row:11">An</div>';
 html+='<div class="series-label" style="grid-column:3/19;grid-row:9">Lantanoidit / Лантаноиды · Aktinoidit / Актиноиды</div>';
 html+='<button type="button" class="placeholder" data-n="57" style="grid-column:4;grid-row:7" title="Lantanoidit 57–71"><b>57–71</b>Ln</button>';
 html+='<button type="button" class="placeholder" data-n="89" style="grid-column:4;grid-row:8" title="Aktinoidit 89–103"><b>89–103</b>An</button>';
 for(var i=0;i<entries.length;i++){
  var e=entries[i],row=e.row<=7?e.row+1:e.row+2,cls='category-'+e.c;
  html+='<button type="button" class="element '+cls+'" data-n="'+e.n+'" style="grid-column:'+(e.col+1)+';grid-row:'+row+'" title="'+esc(e.fi+' / '+e.ru)+'" aria-label="'+esc(e.n+' '+e.s+' '+e.fi+' '+e.ru)+'">'+
    '<span class="z">'+e.n+'</span><span class="symbol">'+esc(e.s)+'</span><span class="tinyname">'+esc(e.fi)+'</span></button>';
 }
 g.innerHTML=html;
 var nodes=g.querySelectorAll('[data-n]');
 for(var j=0;j<nodes.length;j++)nodes[j].onclick=function(){open(Number(this.getAttribute('data-n')),true);};
 gridButtons=g.querySelectorAll('.element');
}
function buildOptions(){
 var opt='';
 for(var g=1;g<=18;g++)opt+='<option value="'+g+'">'+g+'</option>';
 opt+='<option value="lanthanide">Лантаноиды · Lantanoidit</option><option value="actinide">Актиноиды · Aktinoidit</option>';
 els.group.insertAdjacentHTML('beforeend',opt);
 var periods='';for(var i=1;i<=7;i++)periods+='<option value="'+i+'">'+i+'</option>';
 els.period.insertAdjacentHTML('beforeend',periods);
 var order=['alkali','alkaline','transition','post','metalloid','nonmetal','halogen','noble','lanthanide','actinide','unknown'],legend='<button type="button" data-family="all" aria-pressed="true">Все / Kaikki</button>';
 for(var j=0;j<order.length;j++){var k=order[j],n=cats[k];legend+='<button type="button" class="category-'+k+'" data-family="'+k+'" aria-pressed="false"><span class="dot"></span>'+esc(n[1])+' / '+esc(n[0])+'</button>';}
 els.legend.innerHTML=legend;
 var btns=els.legend.querySelectorAll('[data-family]');
 for(var x=0;x<btns.length;x++)btns[x].onclick=function(){
  family=this.getAttribute('data-family');overview='all';els.search.value='';els.group.value='all';els.period.value='all';refresh(true);
 };
}
function overviewMatch(e){
 if(overview==='all')return true;
 if(overview==='metal')return !!metalClasses[e.c];
 if(overview==='nonmetal')return !!nonmetalClasses[e.c];
 if(overview==='metalloid')return e.c==='metalloid';
 if(overview==='gas'||overview==='liquid'||overview==='solid')return e.st===overview;
 return false;
}
function filterEntries(includeSearch){
 var g=els.group.value,p=els.period.value,q=includeSearch?norm(els.search.value):'';
 var base=entries.filter(function(e){
  if(family!=='all'&&e.c!==family)return false;
  if(!overviewMatch(e))return false;
  if(g!=='all'&&(g==='lanthanide'||g==='actinide'?e.c!==g:String(e.g)!==g))return false;
  if(p!=='all'&&String(e.p)!==p)return false;
  return true;
 });
 if(!q)return base;
 var exact=base.filter(function(e){
  var aliases=searchAliases[e.n]||[];
  return String(e.n)===q||norm(e.s)===q||norm(e.fi)===q||norm(e.ru)===q||norm(e.en)===q||
    aliases.some(function(a){return norm(a)===q;});
 });
 if(exact.length)return exact;
 return base.filter(function(e){
  var aliases=searchAliases[e.n]||[];
  return norm(e.fi).indexOf(q)>=0||norm(e.ru).indexOf(q)>=0||norm(e.en).indexOf(q)>=0||norm(e.s).indexOf(q)>=0||String(e.n).indexOf(q)>=0||
    aliases.some(function(a){return norm(a).indexOf(q)>=0;});
 });
}
function refresh(selectFirst){
 var found=filterEntries(true),picked={};
 for(var i=0;i<found.length;i++)picked[found[i].n]=1;
 for(var j=0;j<gridButtons.length;j++){
  var b=gridButtons[j],n=Number(b.getAttribute('data-n'));
  b.classList.toggle('dimmed',!picked[n]);b.classList.toggle('matching',!!picked[n]&&found.length<entries.length);b.classList.toggle('selected',n===current&&!!picked[n]);
  b.setAttribute('aria-pressed',n===current&&!!picked[n]?'true':'false');
 }
 var legendBtns=els.legend.querySelectorAll('[data-family]');
 for(var k=0;k<legendBtns.length;k++)legendBtns[k].setAttribute('aria-pressed',legendBtns[k].getAttribute('data-family')===family?'true':'false');
 var broadBtns=el('overview').querySelectorAll('[data-overview]');
 for(var k2=0;k2<broadBtns.length;k2++)broadBtns[k2].setAttribute('aria-pressed',broadBtns[k2].getAttribute('data-overview')===overview?'true':'false');
 var messages=overviewHelp[overview]||overviewHelp.all;
 el('overview-help').textContent=messages[0]+' / '+messages[1];
 el('family-help').textContent=family==='all'?
 'Каждый цвет — отдельная категория. Нажми на цвет, чтобы выделить её элементы. / Jokainen väri on oma alkuaineluokkansa. Valitse väri korostaaksesi sen alkuaineet.':
 cats[family][1]+' / '+cats[family][0]+': '+cats[family][3];
 els.count.textContent=found.length+' из 118 элементов / '+found.length+' / 118 alkuainetta';
 var list='';
 for(var z=0;z<found.length;z++){
  var e=found[z];
  list+='<button type="button" class="list-tile category-'+e.c+'" data-n="'+e.n+'" aria-label="'+esc(e.s+' '+e.fi+' '+e.ru)+'"><b>'+esc(e.s)+'</b><span>'+e.n+' · '+esc(e.fi)+'<br>'+esc(e.ru)+'</span></button>';
 }
 els.list.innerHTML=list||'<p>Ничего не найдено / Ei hakutuloksia.</p>';
 var buttons=els.list.querySelectorAll('[data-n]');
 for(var m=0;m<buttons.length;m++)buttons[m].onclick=function(){open(Number(this.getAttribute('data-n')),true);};
 if(found.length&&(selectFirst||!picked[current]))open(found[0].n,false);
 if(found.length&&els.search.value.trim())centerInTable(found[0].n);
 if(!found.length){els.detail.innerHTML='<h2>Нет элементов / Ei hakutuloksia</h2><p>Измени фильтр или очисти поиск.</p>';}
}
function centerInTable(n){
 var container=el('table-scroll'),button=els.grid.querySelector('.element[data-n="'+n+'"]');
 if(!container||!button)return;
 var left=button.offsetLeft-(container.clientWidth-button.offsetWidth)/2;
 if(isFinite(left))container.scrollLeft=Math.max(0,left);
}
function open(n,scroll){
 var e=byNumber[n];if(!e)return;
 current=n;
 var classData=cats[e.c],state=stateName(e),g=descGroup(e),use=usages[n]||null,sh=e.sh?e.sh.join(' · '):null;
 var mass=e.m===null?'—':String(e.m).replace('.',','),conf=e.ec?e.ec.replace(/^\*/, ''):null,pred=!!(e.ec&&e.ec.charAt(0)==='*');
 els.detail.innerHTML='<div class="detail-head"><div class="hero-symbol category-'+e.c+'">'+esc(e.s)+'</div>'+
   '<div><div class="eyebrow">Z = '+e.n+' · '+esc(classData[0])+' / '+esc(classData[1])+'</div>'+
   '<div class="detail-name">'+esc(e.fi)+'</div><div class="detail-ru">'+esc(e.ru)+'</div><div class="detail-en">'+esc(e.en)+'</div></div></div>'+
   '<div class="statgrid">'+stat('Järjestysluku / Номер Z',e.n)+stat('Ryhmä / Группа',e.g===null?'f-блок / f-lohko':e.g)+
   stat('Jakso / Период',e.p)+stat('Atomimassa (u) / Атомная масса',mass)+
   stat('Olomuoto / Состояние',state[0]+' / '+state[1])+stat('Elektronikuoret / Электронные оболочки',sh||'—')+'</div>'+
   '<div class="lesson"><div class="lang">FI · LYHYT SELITYS</div><p><b>'+esc(e.fi)+'</b> on alkuaine, jonka merkki on <b>'+esc(e.s)+'</b> ja järjestysluku <b>'+e.n+'</b>. Ytimessä on '+e.n+' protonia; sähköisesti neutraalissa atomissa on '+e.n+' elektronia. Se kuuluu luokkaan '+esc(classData[0].toLocaleLowerCase())+'. '+esc(g[0])+'</p>'+
   '<div class="lang">RU · ПЕРЕВОД</div><p><b>'+esc(e.ru)+'</b> — химический элемент с символом <b>'+esc(e.s)+'</b> и порядковым номером <b>'+e.n+'</b>. В ядре '+e.n+' протонов; в нейтральном атоме '+e.n+' электронов. Класс: '+esc(classData[1].toLocaleLowerCase())+'. '+esc(g[1])+'</p></div>'+
   (conf?'<p><b>Elektronikonfiguraatio / Электронная конфигурация:</b> <code>'+esc(conf)+'</code>'+(pred?' <span class="muted">(laskennallinen / расчётная)</span>':'')+'</p>':'')+
   (use?'<div class="lesson"><div class="lang">FI · ESIMERKKI</div><p>'+esc(use[0])+'</p><div class="lang">RU · ПРИМЕР</div><p>'+esc(use[1])+'</p></div>':'')+
   (e.n>=104?'<p class="note">Для сверхтяжёлых элементов часть свойств пока предполагается. / Raskaimpien alkuaineiden ominaisuudet ovat osin ennusteita.</p>':'')+
   '<div class="actions"><a href="https://pubchem.ncbi.nlm.nih.gov/element/'+encodeURIComponent(e.en)+'" target="_blank" rel="noopener noreferrer">Подробнее в PubChem / Lisää PubChemissä →</a></div>';
 for(var i=0;i<gridButtons.length;i++)gridButtons[i].classList.toggle('selected',Number(gridButtons[i].getAttribute('data-n'))===n);
 if(scroll&&section!=='quiz'){
  centerInTable(n);
  if(w.innerWidth<800&&typeof els.detail.scrollIntoView==='function')els.detail.scrollIntoView();
 }
}
function stat(label,value){return '<div class="stat"><div class="stat-label">'+esc(label)+'</div><div class="stat-value">'+esc(value)+'</div></div>';}
function setTab(which){
 section=which;
 for(var i=0;i<3;i++){var key=['table','list','quiz'][i];el('tab-'+key).setAttribute('aria-selected',key===which?'true':'false');}
 el('table-view').hidden=which!=='table';
 el('list-view').hidden=which!=='list';
 el('quiz').hidden=which!=='quiz';
 els.detail.hidden=which==='quiz';
}
function choose(items){var a=items.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function startQuiz(){
 var pool=filterEntries(false);
 if(!pool.length){els.quizContent.innerHTML='<p>Нет элементов для выбранной группы или периода. / Ei alkuaineita.</p>';return;}
 quiz={items:choose(pool).slice(0,Math.min(10,pool.length)),idx:0,correct:0,seen:false,mode:el('quiz-direction').value};renderQuiz();
}
function renderQuiz(){
 if(!quiz)return;
 if(quiz.idx>=quiz.items.length){
  els.quizProgress.style.width='100%';
  els.quizContent.innerHTML='<h3>Тренировка завершена / Harjoitus valmis</h3><p><b>'+quiz.correct+' / '+quiz.items.length+'</b> — правильных ответов. Можно начать заново.</p>';
  return;
 }
 var e=quiz.items[quiz.idx],q=quiz.mode==='name-to-symbol'?'<b>'+esc(e.fi)+'</b> · '+esc(e.ru):'<b>'+esc(e.s)+'</b>';
 els.quizProgress.style.width=Math.round(quiz.idx/quiz.items.length*100)+'%';
 els.quizContent.innerHTML='<div class="muted">Вопрос / Kysymys '+(quiz.idx+1)+' / '+quiz.items.length+'</div>'+
   '<div class="quizq">'+q+'</div><p>'+(quiz.mode==='name-to-symbol'?'Какой химический символ? / Mikä on alkuaineen merkki?':'Назови элемент на финском или русском / Nimeä alkuaine suomeksi tai venäjäksi')+'</p>'+
   '<div class="quizanswer"><input id="quiz-response" type="text" autocomplete="off" spellcheck="false" placeholder="Ответ / Vastaus"><button type="button" class="primary" id="quiz-check">Проверить / Tarkista</button></div>'+
   '<div id="quiz-feedback" aria-live="polite"></div>';
 el('quiz-check').onclick=checkQuiz;
 el('quiz-response').onkeydown=function(ev){if(ev.key==='Enter'||ev.keyCode===13)checkQuiz();};
}
function checkQuiz(){
 if(!quiz||quiz.seen)return;
 var e=quiz.items[quiz.idx],raw=el('quiz-response').value.trim();if(!raw){el('quiz-response').focus();return;}
 var correct=quiz.mode==='name-to-symbol'?norm(raw)===norm(e.s):
 [e.fi,e.ru,e.en].some(function(v){return norm(raw)===norm(v);});
 if(correct)quiz.correct++;
 quiz.seen=true;el('quiz-response').disabled=true;el('quiz-check').disabled=true;
 el('quiz-feedback').innerHTML='<div class="quiz-feedback"><b>'+(correct?'✓ Oikein / Верно':'✕ Tarkista / Проверь')+'</b>'+
 '<p>'+e.n+' · <b>'+esc(e.s)+'</b> — '+esc(e.fi)+' · '+esc(e.ru)+'</p>'+
 '<p>'+esc(cats[e.c][0])+' / '+esc(cats[e.c][1])+' · Jakso / Период '+e.p+'</p>'+
 '<button type="button" class="primary" id="quiz-next">Следующий / Seuraava</button></div>';
 el('quiz-next').onclick=function(){quiz.idx++;quiz.seen=false;renderQuiz();};
}
function init(){
 if(entries.length!==118){el('periodic-grid').textContent='Ошибка данных: необходимо 118 элементов.';return;}
 for(var i=0;i<entries.length;i++){
  var e=entries[i];if(byNumber[e.n])throw Error('duplicate element '+e.n);byNumber[e.n]=e;
 }
 els={grid:el('periodic-grid'),legend:el('legend'),search:el('element-search'),group:el('group-filter'),period:el('period-filter'),count:el('count'),list:el('list-results'),detail:el('detail'),quizContent:el('quiz-content'),quizProgress:el('quiz-progress')};
 mkButtons();buildOptions();
 var broadBtns=el('overview').querySelectorAll('[data-overview]');
 for(var j=0;j<broadBtns.length;j++)broadBtns[j].onclick=function(){
  overview=this.getAttribute('data-overview');
  family='all';els.group.value='all';els.period.value='all';els.search.value='';
  refresh(true);
 };
 el('find-fe').onclick=function(){
  overview='all';family='all';els.group.value='all';els.period.value='all';
  els.search.value='Fe';setTab('table');refresh(true);centerInTable(26);
  var gridArea=el('table-view');
  if(gridArea&&typeof gridArea.scrollIntoView==='function')gridArea.scrollIntoView();
 };
 el('tab-table').onclick=function(){setTab('table');};
 el('tab-list').onclick=function(){setTab('list');};
 el('tab-quiz').onclick=function(){setTab('quiz');};
 els.search.oninput=function(){refresh(true);};
 els.group.onchange=function(){refresh(true);};
 els.period.onchange=function(){refresh(true);};
 el('clear').onclick=function(){els.search.value='';els.group.value='all';els.period.value='all';family='all';overview='all';refresh(true);};
 el('quiz-start').onclick=startQuiz;
 try{var p=w.location.search.match(/[?&](?:z|element)=(\d{1,3})/);if(p&&byNumber[Number(p[1])])current=Number(p[1]);}catch(err){}
 refresh(false);open(current,false);
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init);else init();
})(window,document);
