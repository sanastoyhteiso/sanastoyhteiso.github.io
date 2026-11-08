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
 function grouped(pool,count,mode){
  var data=shuffled(pool),n=data.length,groups=[],used={},i;
  if(n<4)return [];
  for(i=0;i<count;i++){
   var start=(i*4)%n,items=[],fingerprint='',tries=0;
   do{
    items=[];for(var k=0;k<4;k++)items.push(data[(start+k)%n]);
    fingerprint=items.map(function(x){return x.id;}).sort().join('|');
    if(!used[fingerprint])break;
    start=(start+1)%n;tries++;
   }while(tries<n);
   if(used[fingerprint])break;
   used[fingerprint]=true;
   if(mode==='matching'){
    groups.push({id:'MATCH-'+i+'-'+fingerprint,items:items,options:shuffled(items.map(function(x){return x.fi;}))});
   }else{
    var quiz=[];
    // Two factual statements and two incorrect term/definition associations per group.
    for(var t=0;t<4;t++){
     var correct=t<2,x=items[t],y=!correct?otherFor(x,items,t+1):null;
     if(!correct&&!y)return groups;
     quiz.push(claim(x,correct,y,'MULTI-'+i+'-'+x.id+'-'+(correct?'T':'F')));
    }
    groups.push({id:'MULTI-'+i+'-'+fingerprint,items:shuffled(quiz)});
   }
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
  var data=shuffled(pool),need=count-result.length,correction=0;
  for(var i=0;i<data.length&&need>0;i++){
   var x=data[i];
   // Alternating true and false, with the correct original FI/RU definition always stored.
   var correct=correction%2===1;
   var y=correct?null:otherFor(x,data,i+Math.max(1,Math.floor(data.length/2)));
   if(!correct&&!y)continue;
   var item=claim(x,correct,y,'TF-DERIVED-'+x.id+'-'+(correct?'T':'F'));
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
 /* RUN164: build disjoint matching/multiple-choice groups from explicitly selected
    distinct source terms. The existing 10-question practice generator remains unchanged. */
 function buildMatchingFrom(items){
  if(!Array.isArray(items)||items.length!==4)return null;
  var seen={},list=items.slice(),parts=[];
  for(var i=0;i<4;i++){
   if(!list[i]||!list[i].id||!list[i].fi||seen[list[i].fi])return null;
   seen[list[i].fi]=true;parts.push(list[i].id);
  }
  return {id:'MATCH-R164-'+parts.sort().join('|'),items:list,
    options:shuffled(list.map(function(x){return x.fi;}))};
 }
 function buildMultiFrom(items){
  if(!Array.isArray(items)||items.length!==4)return null;
  var list=shuffled(items),out=[],seen={};
  for(var i=0;i<list.length;i++){
   if(!list[i]||!list[i].id||!list[i].fi||!list[i].ru||seen[list[i].fi])return null;
   seen[list[i].fi]=true;
  }
  for(var j=0;j<4;j++){
   var correct=j<2,x=list[j],other=correct?null:otherFor(x,list,j+1);
   if(!correct&&!other)return null;
   out.push(claim(x,correct,other,'MULTI-R164-'+x.id+'-'+(correct?'T':'F')));
  }
  return {id:'MULTI-R164-'+list.map(function(x){return x.id;}).sort().join('|'),
    items:shuffled(out)};
 }
  w.RS_EXAM_ROUNDS={build:build,validTerms:validTerms,buildMatchingFrom:buildMatchingFrom,buildMultiFrom:buildMultiFrom};
})(window);
