/* RUN155: offline exam practice from existing, teacher-reviewed FI/RU glossary notes.
 * Educational true/false from a term and its definition: false pairs use a DISTINCT term's definition.
 * No claims to quote a textbook; no accounts, Firebase, storage or network. Safari 12 / ES5.
 */
(function(w){
 'use strict';
 function shuffled(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),v=a[i];a[i]=a[j];a[j]=v;}return a;}
 function validTerms(d,topic){
  var terms=d&&d.terms||[],seen={},out=[];
  for(var i=0;i<terms.length;i++){
   var x=terms[i];
   if(!x||!x.id||!x.fi||!x.ru||!x.examNoteFi||!x.examNoteRu||!x.examTopics||!x.examTopics.length)continue;
   if(topic!=='all'&&x.examTopics.indexOf(topic)<0)continue;
   var k=x.fi.toLocaleLowerCase();
   if(seen[k])continue;seen[k]=true;out.push(x);
  }
  return out;
 }
 function distinct(a,b){
  return a&&b&&a.id!==b.id&&a.fi.toLocaleLowerCase()!==b.fi.toLocaleLowerCase()&&
    a.ru.toLocaleLowerCase()!==b.ru.toLocaleLowerCase();
 }
 function otherFor(x,list,seed){
  for(var j=0;j<list.length;j++){
   var c=list[(seed+j)%list.length];
   if(distinct(x,c)&&x.examNoteFi!==c.examNoteFi)return c;
  }
  return null;
 }
 function claim(x,correct,y,id){
  // Only use facts literally already present in source FI/RU notes. Mismatched meanings are labeled false.
  var cleanFi='Suomenkielinen termi "'+x.fi+'" vastaa käsitettä "'+x.fi+'".';
  var cleanRu='Финский термин «'+x.fi+'» соответствует понятию «'+x.ru+'».';
  var cleanEn='The Finnish medical term "'+x.fi+'" corresponds to "'+x.en+'".';
  var wrongFi=y?'Suomenkielinen termi "'+x.fi+'" vastaa käsitettä "'+y.fi+'".':cleanFi;
  var wrongRu=y?'Финский термин «'+x.fi+'» соответствует понятию «'+y.ru+'».':cleanRu;
  var wrongEn=y?'The Finnish medical term "'+x.fi+'" corresponds to "'+y.en+'".':cleanEn;
  return {
   id:id,topic:x.examTopics[0],fi:correct?cleanFi:wrongFi,ru:correct?cleanRu:wrongRu,
   en:correct?cleanEn:wrongEn,correct:!!correct,explanationFi:x.examNoteFi,explanationRu:x.examNoteRu,
   correctStatementFi:cleanFi,correctStatementRu:cleanRu,correctStatementEn:cleanEn,sourceFi:x.fi,sourceId:x.id
  };
 }

 function latinEligible(x){return !!(x&&x.la&&x.fi&&x.ru&&x.examNoteFi&&x.examNoteRu);}
 function latinPool(pool){
  var used={},list=[];
  shuffled(pool.filter(latinEligible)).forEach(function(x){
   var key=x.la.toLocaleLowerCase().trim();
   if(key&&!used[key]){used[key]=true;list.push(x);}
  });
  return list;
 }
 function latinClaim(x,correct,y,id,topic){
  if(!latinEligible(x)||(!correct&&(!y||!distinct(x,y))))return null;
  var description=correct?x:y;
  return {
   id:id,topic:topic||x.examTopics[0],
   fi:'Latinankielinen termi "'+x.la+'" tarkoittaa "'+description.fi+'".',
   ru:'Латинский термин «'+x.la+'» означает «'+description.ru+'».',
   en:'The Latin term "'+x.la+'" means "'+description.en+'".',
   correct:!!correct,
   explanationFi:x.examNoteFi,explanationRu:x.examNoteRu,
   correctStatementFi:'Latinankielinen termi "'+x.la+'" tarkoittaa "'+x.fi+'".',
   correctStatementRu:'Латинский термин «'+x.la+'» означает «'+x.ru+'».',
   correctStatementEn:'The Latin term "'+x.la+'" means "'+x.en+'".',
   sourceFi:x.fi,sourceId:x.id,latin:true
  };
 }
 function latinMatching(items,id){
  if(!items||items.length!==4||latinPool(items).length!==4)return null;
  return {id:id,items:items,answerKey:'la',
   options:shuffled(items.map(function(x){return x.la;}))};
 }
 function latinMultiple(items,id,topic){
  if(!items||items.length!==4||latinPool(items).length!==4)return null;
  var claims=[];
  for(var i=0;i<4;i++){
   var yes=i<2,x=items[i],y=yes?null:otherFor(x,items,i+1);
   var statement=latinClaim(x,yes,y,'MULTI-LA-'+id+'-'+x.id+'-'+(yes?'T':'F'),topic);
   if(!statement)return null;
   claims.push(statement);
  }
  return {id:id,items:shuffled(claims),latin:true};
 }
 function standardMatching(items,id){
  if(!items||items.length!==4)return null;
  return {id:id,items:items,answerKey:'fi',
   options:shuffled(items.map(function(x){return x.fi;}))};
 }
 function standardMultiple(items,id,topic){
  if(!items||items.length!==4)return null;
  var claims=[];
  for(var i=0;i<4;i++){
   var yes=i<2,x=items[i],y=yes?null:otherFor(x,items,i+1);
   if(!yes&&!y)return null;
   var row=claim(x,yes,y,'MULTI-STD-'+id+'-'+x.id+'-'+(yes?'T':'F'));
   row.topic=topic;
   claims.push(row);
  }
  return {id:id,items:shuffled(claims)};
 }

 function grouped(pool,count,mode){
  var data=shuffled(pool),latin=latinPool(pool),n=data.length,
    groups=[],used={},i;
  if(n<4)return [];
  for(i=0;i<count;i++){
   var useLatin=(i%3===0&&latin.length>=4);
   var source=useLatin?latin:data,items=[],fingerprint='',tries=0;
   if(source.length<4)return groups;
   var start=(i*4)%source.length;
   do{
    items=[];for(var k=0;k<4;k++)items.push(source[(start+k)%source.length]);
    fingerprint=items.map(function(x){return x.id;}).sort().join('|');
    if(!used[fingerprint])break;
    start=(start+1)%source.length;tries++;
   }while(tries<source.length);
   if(used[fingerprint])break;
   used[fingerprint]=true;
   var id=(mode==='matching'?'MATCH-':'MULTI-')+i+'-'+fingerprint,
     group=mode==='matching'?
       (useLatin?latinMatching(items,id):standardMatching(items,id)):
       (useLatin?latinMultiple(items,id,items[0].examTopics[0]):
         standardMultiple(items,id,items[0].examTopics[0]));
   if(group)groups.push(group);
  }
  return groups;
 }
 function trueFalse(pool,source,count){
  var originals=shuffled((source||[]).filter(function(q){
   return q&&q.id&&q.fi&&q.ru&&typeof q.correct==='boolean';
  }));
  var result=[],used={};
  // Include original hand-written facts and use the remaining items in the chosen topic.
  for(var k=0;k<originals.length&&result.length<Math.min(3,count);k++){
   var q=originals[k];if(used[q.id])continue;
   used[q.id]=true;result.push(q);
  }
  var data=latinPool(pool).concat(shuffled(pool.filter(function(x){return !latinEligible(x);}))),need=count-result.length,correction=0;
  for(var i=0;i<data.length&&need>0;i++){
   var x=data[i];
   // Alternating true and false, with the correct original FI/RU definition always stored.
   var correct=correction%2===1;
   var y=correct?null:otherFor(x,data,i+Math.max(1,Math.floor(data.length/2)));
   if(!correct&&!y)continue;
   var latinNow=latinEligible(x)&&correction<3;
   var item=latinNow?latinClaim(x,correct,y,'TF-LA-'+x.id+'-'+(correct?'T':'F'),x.examTopics[0]):
     claim(x,correct,y,'TF-DERIVED-'+x.id+'-'+(correct?'T':'F'));
   if(!item)continue;
   if(!used[item.id]){result.push(item);used[item.id]=true;need--;correction++;}
  }
  return shuffled(result).slice(0,count);
 }
 function build(mode,topic,d,handwritten,count){
  count=count||10;var pool=validTerms(d,topic);
  if(mode==='matching'||mode==='multiselect')return grouped(pool,count,mode);
  if(mode==='truefalse')return trueFalse(pool,(handwritten||[]).filter(function(q){
   return topic==='all'||q.topic===topic;
  }),count);
  return [];
 }
 w.RS_EXAM_ROUNDS={build:build,validTerms:validTerms,latinPool:latinPool,
  latinClaim:latinClaim,claim:claim,standardMatching:standardMatching,
  standardMultiple:standardMultiple,latinMatching:latinMatching,latinMultiple:latinMultiple};
})(window);
