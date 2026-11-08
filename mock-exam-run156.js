/* RUN156 simulated Riveria exam, all client-side and ES5.
 * 40 questions: one per topic per mode; 40 shuffled pages; 32/40 points = 80%.
 * EXAM PRACTICE ONLY: not Moodle's official scoring system.
 * No cloud, localStorage, Firebase, accounts or learning score changes.
 */
(function(w){
 'use strict';
 function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),x=a[i];a[i]=a[j];a[j]=x;}return a;}
 function translateFor(x,topic,direction,terms,latin){
  var parts=direction.split('-'),from=parts[0],to=parts[1],others;
  if(latin){
   // One Latin case in both recall directions, selected automatically by topic.
   if(Number(topic.slice(-2))%4<2){to=from;from='la';}
   else{to='la';}
  }
  var right=x&&x[to];
  if(!x||!x[from]||!right)return null;
  var wrong=[],used={};used[String(right).toLocaleLowerCase().trim()]=true;
  others=shuffle(terms.filter(function(t){
   return t.id!==x.id&&(!latin||!t.la||
     t.la.toLocaleLowerCase().trim()!==x.la.toLocaleLowerCase().trim());
  }));
  for(var i=0;i<others.length&&wrong.length<3;i++){
   var z=others[i][to],key=z?String(z).toLocaleLowerCase().trim():'';
   if(key&&!used[key]){wrong.push(z);used[key]=true;}
  }
  if(wrong.length!==3)return null;
  return {id:(latin?'TR-LA-':'TR-')+topic+'-'+x.id,
   topic:topic,type:'translate',item:x,from:from,to:to,
   latin:!!latin,answer:right,options:shuffle([right].concat(wrong))};
 }
 function build(d,bank,direction){
  var g=w.RS_EXAM_ROUNDS,topics=d&&d.examTopics||[],out=[],seen={},usedTargets={};
  if(!g||topics.length!==10||!/^(fi-ru|ru-fi|fi-en|en-fi)$/.test(direction))return [];
  for(var i=0;i<topics.length;i++){
   var topic=topics[i].id,
     all=g.validTerms(d,topic),fresh=shuffle(all.filter(function(x){return !usedTargets[x.id];}));
   // Never repeat a target in another topic. The ten exam pools contain sufficient terms.
   if(fresh.length<10)return [];
   var lat=g.latinPool(fresh);
   if(lat.length<5)return [];
   var latinTerms=lat.slice(0,5),reserved={};
   for(var j=0;j<latinTerms.length;j++)reserved[latinTerms[j].id]=true;
   var standard=shuffle(fresh.filter(function(x){return !reserved[x.id];})).slice(0,5);
   if(standard.length!==5)return [];
   var even=i%2===0,tr,tf,multi,matching;
   if(even){
    tr=translateFor(latinTerms[0],topic,direction,all,true);
    var term=standard[0],wrong=shuffle(all.filter(function(x){return x.id!==term.id;}))[0],
      tfBase=g.claim(term,i%4===0,i%4===0?null:wrong,'EX-TF-'+topic+'-'+term.id);
    tfBase.topic=topic;tf={id:tfBase.id,topic:topic,type:'truefalse',question:tfBase};
    matching=g.latinMatching(latinTerms.slice(1),'EX-MATCH-LA-'+topic);
    multi=g.standardMultiple(standard.slice(1),'EX-MULTI-'+topic,topic);
   }else{
    tr=translateFor(standard[0],topic,direction,all,false);
    var lterm=latinTerms[0],lwrong=shuffle(all.filter(function(x){
      return x.id!==lterm.id&&x.fi!==lterm.fi;}))[0],
      latinTf=g.latinClaim(lterm,i%4===1,i%4===1?null:lwrong,
       'EX-TF-LA-'+topic+'-'+lterm.id,topic);
    if(!latinTf)return [];
    tf={id:latinTf.id,topic:topic,type:'truefalse',question:latinTf};
    matching=g.standardMatching(standard.slice(1),'EX-MATCH-'+topic);
    multi=g.latinMultiple(latinTerms.slice(1),'EX-MULTI-LA-'+topic,topic);
   }
   if(!tr||!tf||!matching||!multi)return [];
   var choices=[tr,tf,
    {id:matching.id,topic:topic,type:'matching',question:matching},
    {id:multi.id,topic:topic,type:'multiselect',question:multi}];
   for(var k=0;k<choices.length;k++){
    var question=choices[k];
    if(seen[question.id])return [];
    seen[question.id]=true;out.push(question);
   }
   for(j=0;j<latinTerms.length;j++)usedTargets[latinTerms[j].id]=true;
   for(j=0;j<standard.length;j++)usedTargets[standard[j].id]=true;
  }
  return out.length===40?shuffle(out):[];
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
    var matchKey=q.question.answerKey==='la'?'la':'fi';
    if(answer[i]===q.question.items[i][matchKey])good++;
    details.push({selected:answer[i],correct:q.question.items[i][matchKey],term:q.question.items[i]});
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
