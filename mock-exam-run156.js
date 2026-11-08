/* RUN156 simulated Riveria exam, all client-side and ES5.
 * 40 questions: one per topic per mode; 40 shuffled pages; 32/40 points = 80%.
 * EXAM PRACTICE ONLY: not Moodle's official scoring system.
 * No cloud, localStorage, Firebase, accounts or learning score changes.
 */
(function(w){
 'use strict';
 function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),x=a[i];a[i]=a[j];a[j]=x;}return a;}
 function translate(d,topic,direction,terms){
  var parts=direction.split('-'),from=parts[0],to=parts[1],
    words=shuffle(terms.filter(function(t){return t[from]&&t[to];}));
  for(var i=0;i<words.length;i++){
   var x=words[i],others=shuffle(words.filter(function(t){return t.id!==x.id;})),used={},
       right=x[to],wrong=[];used[right]=true;
   for(var j=0;j<others.length&&wrong.length<3;j++){
    var z=others[j][to];
    if(z&&!used[z]){used[z]=true;wrong.push(z);}
   }
   if(wrong.length===3)return {id:'TR-'+topic+'-'+x.id,topic:topic,type:'translate',
     item:x,from:from,to:to,answer:right,options:shuffle([right].concat(wrong))};
  }
  return null;
 }
 function build(d,bank,direction){
  var g=w.RS_EXAM_ROUNDS,topics=d&&d.examTopics||[],out=[],seen={};
  if(!g||topics.length!==10||!/^(fi-ru|ru-fi|fi-en|en-fi)$/.test(direction))return [];
  for(var i=0;i<topics.length;i++){
   var topic=topics[i].id,words=g.validTerms(d,topic),tr=translate(d,topic,direction,words);
   var tfs=g.build('truefalse',topic,d,bank,10).filter(function(q){return !!q.en;});
   // Prefer original hand-authored explanations for each topic when present.
   var handwritten=tfs.filter(function(q){return q.id.indexOf('TF-DERIVED-')!==0;});
   var tf=shuffle(handwritten.length?handwritten:tfs)[0];
   var match=g.build('matching',topic,d,bank,10)[0],multi=g.build('multiselect',topic,d,bank,10)[0];
   if(!tr||!tf||!match||!multi)return [];
   var choices=[tr,{id:'EX-TF-'+topic+'-'+tf.id,topic:topic,type:'truefalse',question:tf},
     {id:'EX-MATCH-'+topic+'-'+match.id,topic:topic,type:'matching',question:match},
     {id:'EX-MULTI-'+topic+'-'+multi.id,topic:topic,type:'multiselect',question:multi}];
   for(var k=0;k<choices.length;k++){var question=choices[k];if(seen[question.id])return [];seen[question.id]=true;out.push(question);}
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
    if(answer[i]===q.question.items[i].fi)good++;
    details.push({selected:answer[i],correct:q.question.items[i].fi,term:q.question.items[i]});
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
