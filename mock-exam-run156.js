/* RUN156 simulated Riveria exam, all client-side and ES5.
 * 40 questions: one per topic per mode; 40 shuffled pages; 32/40 points = 80%.
 * EXAM PRACTICE ONLY: not Moodle's official scoring system.
 * No cloud, localStorage, Firebase, accounts or learning score changes.
 */
(function(w){
 'use strict';
 function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),x=a[i];a[i]=a[j];a[j]=x;}return a;}
 /* RUN164: exactly 10 topics x 4 test modes, disjoint source terms across
    question types. Latin comes only from existing reviewed glossary la fields.
    Five of ten translations are Latin -> selected target language, with an
    unambiguous answer and three distinct distractors. */
 function normalized(s){return String(s||'').toLocaleLowerCase().replace(/^\s+|\s+$/g,'').replace(/\s+/g,' ');}
 function latinUnambiguous(term,terms,target){
  var la=normalized(term.la),answer=normalized(term[target]);
  if(!la||!answer)return false;
  for(var i=0;i<terms.length;i++){
   var other=terms[i];
   if(other.id!==term.id&&normalized(other.la)===la&&normalized(other[target])!==answer)return false;
  }
  return true;
 }
 function translateCandidates(topic,direction,terms,reserved,useLatin,usedLatin){
  var d=direction.split('-'),from=useLatin?'la':d[0],to=d[1];
  var items=shuffle(terms.filter(function(t){
   return !reserved[t.id]&&t[from]&&t[to]&&
     (!useLatin||(latinUnambiguous(t,terms,to)&&!usedLatin[normalized(t.la)]));
  }));
  var out=[];
  for(var i=0;i<items.length;i++){
   var x=items[i],right=x[to],used={},wrong=[],others=shuffle(terms.filter(function(t){
     return t.id!==x.id&&t[to]&&(!useLatin||!!t.la);
   }));
   used[normalized(right)]=true;
   for(var j=0;j<others.length&&wrong.length<3;j++){
    var option=others[j][to],key=normalized(option);
    if(!used[key]){used[key]=true;wrong.push(option);}
   }
   if(wrong.length!==3)continue;
   out.push({id:(useLatin?'LAT-':'TR-')+topic+'-'+x.id,topic:topic,type:'translate',
     item:x,from:from,to:to,answer:right,options:shuffle([right].concat(wrong)),
     latin:!!useLatin});
  }
  return out;
 }
 function statementSignature(q){
  if(q.type==='translate')return 'TERM|'+q.from+'|'+normalized(q.item[q.from]);
  if(q.type==='truefalse')return 'TRUEFALSE|'+normalized(q.question.fi);
  if(q.type==='matching')return 'MATCH|'+q.question.items.map(function(t){
   return normalized(t.fi);
  }).sort().join('|');
  return 'MULTI|'+q.question.items.map(function(t){return normalized(t.fi);}).sort().join('|');
 }
 // A topic's 10 distinct target terms are allocated BEFORE making any questions.
 // Five Latin targets and five different standard targets yield two Latin modes
 // and two standard modes per topic, so the full 40 has 5 Latin of EACH format.
 function builtTopic(g,d,bank,topic,direction,globalReserved,globalLatin,wantLatin,seenSignatures){
  var words=g.validTerms(d,topic);
  var fresh=shuffle(words.filter(function(t){
    return !globalReserved[t.id]&&t.examTopics&&t.examTopics[0]===topic;
  }));
  if(fresh.length<10)return null;
  var targetLanguage=direction.split('-')[1],tries=0;
  for(tries=0;tries<55;tries++){
   var allLatin=g.latinPool(fresh).filter(function(x){
     return latinUnambiguous(x,words,targetLanguage);
   });
   var unusedLatin=shuffle(allLatin.filter(function(x){return !globalLatin[normalized(x.la)];}));
   // Prefer a Latin spelling never previously quizzed in this same 40-page exam.
   var chosenLatin=unusedLatin.length>=5?unusedLatin.slice(0,5):shuffle(allLatin).slice(0,5);
   if(chosenLatin.length<5)return null;
   var reserved={},i;
   for(i=0;i<5;i++)reserved[chosenLatin[i].id]=true;
   var standard=shuffle(fresh.filter(function(x){return !reserved[x.id];})).slice(0,5);
   if(standard.length!==5)return null;
   var targetTr=wantLatin?chosenLatin[0]:standard[0],trReserved={};
   for(i=0;i<words.length;i++){
    if(words[i].id!==targetTr.id)trReserved[words[i].id]=true;
   }
   var trList=translateCandidates(topic,direction,words,trReserved,wantLatin,globalLatin);
   if(!trList.length)continue;
   var tr=trList[0],targetTF=wantLatin?standard[0]:chosenLatin[0],
     truth=Math.random()<.5,other=null;
   if(!truth){
    var wrong=shuffle(words.filter(function(x){
     return x.id!==targetTF.id&&x.fi!==targetTF.fi&&x.ru!==targetTF.ru;
    }));
    other=wrong[0];if(!other)continue;
   }
   var statement=wantLatin?
     g.claim(targetTF,truth,other,'EX-TF-R165-'+topic+'-'+targetTF.id):
     g.latinClaim(targetTF,truth,other,'EX-TF-LA-R165-'+topic+'-'+targetTF.id,topic);
   if(!statement)continue;
   statement.topic=topic;
   var matchItems=wantLatin?chosenLatin.slice(1):standard.slice(1),
       multiItems=wantLatin?standard.slice(1):chosenLatin.slice(1),
       matching=g.buildMatchingFrom(matchItems,wantLatin),
       multi=g.buildMultiFrom(multiItems,!wantLatin);
   if(!matching||!multi)continue;
   var set=[tr,
    {id:'EX-'+statement.id,topic:topic,type:'truefalse',latin:!wantLatin,question:statement},
    {id:'EX-MATCH-R165-'+topic+'-'+matching.id,topic:topic,type:'matching',latin:!!wantLatin,question:matching},
    {id:'EX-MULTI-R165-'+topic+'-'+multi.id,topic:topic,type:'multiselect',latin:!wantLatin,question:multi}];
   var local={},collision=false;
   for(i=0;i<set.length;i++){
    var signature=statementSignature(set[i]);
    if(local[signature]||seenSignatures[signature]){collision=true;break;}
    local[signature]=true;
   }
   if(collision)continue;
   for(i=0;i<5;i++){
    globalReserved[chosenLatin[i].id]=true;
    globalReserved[standard[i].id]=true;
    globalLatin[normalized(chosenLatin[i].la)]=true;
   }
   Object.keys(local).forEach(function(k){seenSignatures[k]=true;});
   return set;
  }
  return null;
 }
 function build(d,bank,direction){
  var g=w.RS_EXAM_ROUNDS,topics=d&&d.examTopics||[],out=[],seen={},usedTerms={},
   usedLatin={},signatures={},latinCount=0;
  if(!g||topics.length!==10||!/^(fi-ru|ru-fi|fi-en|en-fi)$/.test(direction)||
     typeof g.buildMatchingFrom!=='function'||typeof g.buildMultiFrom!=='function'||
     typeof g.latinPool!=='function'||typeof g.latinClaim!=='function'||
     typeof g.claim!=='function')return [];
  var latinTopics={};
  var eligible=shuffle(topics.filter(function(t){
   var pool=g.validTerms(d,t.id).filter(function(x){
    return x.examTopics&&x.examTopics[0]===t.id;
   }),lang=direction.split('-')[1],n=0,used={};
   for(var i=0;i<pool.length;i++){
    var x=pool[i],key=normalized(x.la);
    if(key&&x[lang]&&!used[key]&&latinUnambiguous(x,pool,lang)){
     used[key]=true;n++;
    }
   }
   return n>=5;
  }));
  if(eligible.length!==10)return [];
  for(var p=0;p<5;p++)latinTopics[eligible[p].id]=true;
  for(var j=0;j<topics.length;j++){
   var topic=topics[j].id;
   var selected=builtTopic(g,d,bank,topic,direction,usedTerms,usedLatin,
     !!latinTopics[topic],signatures);
   if(!selected)return [];
   for(var k=0;k<selected.length;k++){
    var question=selected[k];
    if(seen[question.id])return [];
    seen[question.id]=true;out.push(question);
    if(question.latin)latinCount++;
   }
  }
  if(out.length!==40||latinCount!==20)return [];
  return shuffle(out);
 }
 function evaluate(q,answer){
  var n=0,i,details=[],good=0,wrong=0;
  if(q.type==='translate'){
   good=answer===q.answer?1:0;
   return {score:good,perfect:good===1,correct:[q.answer],selected:answer};
  }
  if(q.type==='truefalse'){
   good=answer===q.question.correct?1:0;
   return {score:good,perfect:good===1,correct:[q.question.correct],selected:answer};
  }
  if(q.type==='matching'){
   if(!answer||answer.length!==q.question.items.length)return null;
   for(i=0;i<q.question.items.length;i++){
    var key=q.question.answerKey==='la'?'la':'fi';
    if(answer[i]===q.question.items[i][key])good++;
    details.push({selected:answer[i],correct:q.question.items[i][key],term:q.question.items[i]});
   }
   return {score:good/q.question.items.length,perfect:good===q.question.items.length,details:details,selected:answer};
  }
  if(q.type==='multiselect'){
   if(!answer||answer.length!==q.question.items.length)return null;
   for(i=0;i<q.question.items.length;i++){
    var row=q.question.items[i];
    if(row.correct){n++;if(answer[i])good++;}
    else if(answer[i])wrong++;
    details.push({selected:!!answer[i],correct:!!row.correct,term:row});
   }
   var score=Math.max(0,(good-wrong)/n);
   return {score:score,perfect:score===1,details:details,selected:answer};
  }
  return null;
 }
 function report(run){
  var answers=run.answers||[],points=0;
  for(var i=0;i<answers.length;i++)if(answers[i])points+=answers[i].score;
  var percentage=Math.round(points/40*1000)/10;
  return {points:Math.round(points*100)/100,percent:percentage,passed:points>=32,
    count:answers.length,wrong:answers.filter(function(a){return a&&a.score<1;}).length};
 }
 w.RS_MOCK_EXAM={build:build,evaluate:evaluate,report:report};
})(window);
