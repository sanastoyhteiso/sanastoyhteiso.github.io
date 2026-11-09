'use strict';
/* RUN170. Owner supplied completed Moodle review screenshots; only independent FI/RU/EN explanations and medical Latin mappings, no learner answers/accounts or quiz screenshots. */
const fs=require('node:fs'),vm=require('node:vm'),test=require('node:test'),assert=require('node:assert/strict');
function load(){
 const w={},context={window:w};
 vm.runInNewContext(fs.readFileSync('data.js','utf8'),context);
 const base=w.RS_DATA.terms.map(x=>({id:x.id,fi:x.fi,ru:x.ru}));
 vm.runInNewContext(fs.readFileSync('riveria-anatomy-exam.js','utf8'),context);
 return {base,terms:w.RS_DATA.terms,topics:w.RS_DATA.examTopics};
}
const expected=[
 ['mahalaukku','gaster'],['haima','pancreas'],['maksa','hepar'],
 ['ohutsuoli','intestinum tenue'],['ruoansulatus','digestio'],
 ['vatsa','abdomen'],['sappirakko','vesica biliaris'],
 ['iho','cutis'],['verinahka','dermis'],['ihonalaiskudos','subcutis'],
 ['orvaskesi','epidermis'],['valtimo','arteria'],['laskimo','vena'],
 ['sepelvaltimo','arteria coronaria']
];
const newNames=[
 'sähköinen impulssi','virtsajohdin','nukkalisäke','ravinnon imeytyminen',
 'rustokudos','hermokudos','hermotukisolu','hengitystiheys',
 'oikea pääkeuhkoputki','ilmatiehyet','keuhkopussinontelo','pikkulaskimo',
 'verensokerin nousu','verensokerin lasku',
 'ranneluut','sormien luut','jalkapöydänluut','nilkanluut',
 'kämmenenluut','alaleuanluu','kallokopan luut','luukalvo',
 'luuhohka','nivelontelo','nivelpussi','aivokurkiainen','aivokammiot',
 'luiden soluväliaine'
];
const enriched=[
 ['verihiutale','thrombocytus'],['punasolu','erythrocytus'],
 ['valkosolu','leucocytus'],['hiussuoni','vas capillare'],
 ['keskushermosto','systema nervosum centrale'],['virtsarakko','vesica urinaria'],
 ['luuydin','medulla ossium'],['nivelside','ligamentum'],
 ['nivelrusto','cartilago articularis'],['selkäydin','medulla spinalis'],
 ['keuhkorakkula','alveolus pulmonis']
];
test('all 11 yellow Moodle Latin matches exist on original IDs and 3 languages',()=>{
 const {base,terms}=load(),byFi=new Map(terms.map(x=>[x.fi.toLocaleLowerCase('fi').trim(),x]));
 for(const [fi,la] of expected){
  const w=byFi.get(fi);assert.ok(w,'missing '+fi);
  assert.equal(w.la.toLowerCase(),la);
  assert.ok(w.id&&w.ru&&w.fi&&w.en&&w.examNoteFi&&w.examNoteRu,fi);
  const sameBase=base.find(x=>x.fi===fi);
  if(sameBase)assert.equal(w.id,sameBase.id,'do not duplicate original IDs: '+fi);
 }
 assert.match(byFi.get('ruoansulatus').examNoteFi,/ruuansulatus/);
 assert.match(byFi.get('sepelvaltimo').examNoteFi,/arteriae coronariae/);
 assert.match(byFi.get('sepelvaltimo').examNoteRu,/arteriae coronariae/);
 assert.equal(terms.filter(x=>x.fi==='ruuansulatus').length,0,'spelling variant is not a new anatomy structure');
 assert.equal(terms.filter(x=>x.fi==='olkavarrenluu').length,0,'humerus synonym is not an extra structure');
 assert.match(byFi.get('olkaluu').examNoteRu,/olkavarrenluu/);
});
test('28 genuinely new Moodle terms use consecutive non-colliding IDs, FI RU EN, helpful notes and same 10 topics',()=>{
 const {base,terms,topics}=load();
 assert.equal(base.length,1296);
 assert.equal(terms.length,1485);
 assert.equal(new Set(terms.map(x=>x.id)).size,terms.length);
 assert.equal(new Set(terms.map(x=>x.fi.toLocaleLowerCase('fi').trim())).size,terms.length);
 const byId=new Map(terms.map(x=>[x.id,x]));
 for(let i=0;i<28;i++){
  const id='T'+String(90316+i),w=byId.get(id);
  assert.ok(w,'missing '+id);
  assert.equal(w.fi,newNames[i]);
  assert.ok(w.fi&&w.ru&&w.en&&w.examNoteFi&&w.examNoteRu,'missing FI/RU/EN or explanation '+id);
  assert.ok(w.examNoteFi.length>=65&&w.examNoteRu.length>=65,'must explain the concept: '+id);
  assert.ok(w.examTopics.length>0);
  for(const topic of w.examTopics)assert.match(topic,/^EXAM(0[1-9]|10)$/);
 }
 assert.equal(topics.length,10);
});
test('11 existing anatomy entries gain precise Latin without new progress IDs or a 4th language',()=>{
 const {terms,base}=load(),byFi=new Map(terms.map(x=>[x.fi,x]));
 for(const [fi,la] of enriched){
  const w=byFi.get(fi);
  assert.ok(w,'missing '+fi);
  assert.equal(w.la.toLowerCase(),la);
  assert.ok(w.examNoteFi.length>=15&&w.examNoteRu.length>=15,fi);
  const prior=base.find(x=>x.fi===fi);
  if(prior)assert.equal(w.id,prior.id,'do not replace original ID for '+fi);
 }
 assert.equal(terms.some(x=>x.examTopics&&x.examTopics.includes('EXAM11')),false);
});
test('new words are linked to correct old exam topics without changing remaining anatomy groups',()=>{
 const {terms}=load(),byFi=new Map(terms.map(x=>[x.fi,x]));
 const belong=[
  ['virtsajohdin','EXAM08'],['nukkalisäke','EXAM07'],['rustokudos','EXAM03'],
  ['luukalvo','EXAM03'],['nivelpussi','EXAM03'],['aivokurkiainen','EXAM10'],
  ['aivokammiot','EXAM10'],['pikkulaskimo','EXAM05'],['hengitystiheys','EXAM06']
 ];
 for(const [fi,topic] of belong)assert.ok(byFi.get(fi).examTopics.includes(topic),fi);
 const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
 assert.ok(html.includes('riveria-anatomy-exam.js?v=moodle-run170-1'));
 assert.ok(sw.includes('riveria-anatomy-exam.js?v=moodle-run170-1'));
 assert.ok(sw.includes('riveria-sanasto-community-v3.0.0-rc36'));
});
