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
 function chooseGroups(words,reserved,g){
  var remaining=words.filter(function(t){return !reserved[t.id];});
  if(remaining.length<8)return null;
  for(var tries=0;tries<90;tries++){
   var shuffled=shuffle(remaining),match=g.buildMatchingFrom(shuffled.slice(0,4)),
       multi=g.buildMultiFrom(shuffled.slice(4,8));
   if(match&&multi)return {match:match,multi:multi};
  }
  return null;
 }
 function statementSignature(q){
  if(q.type==='translate')return 'TERM|'+q.from+'|'+normalized(q.item[q.from]);
  if(q.type==='truefalse')return 'TRUEFALSE|'+normalized(q.question.fi);
  var items=q.question.items||[];
  if(q.type==='matching')return 'MATCH|'+items.map(function(t){return normalized(t.fi);}).sort().join('|');
  return 'MULTI|'+items.map(function(t){return normalized(t.fi);}).sort().join('|');
 }
 function builtTopic(g,d,bank,topic,direction,globalReserved,globalLatin,wantLatin,seenSignatures){
  var words=g.validTerms(d,topic),tfs=g.build('truefalse',topic,d,bank,10).filter(function(q){
    return !!q.en;
  });
  // Hand-authored teacher-study facts first, then derived statements, no repeated source IDs.
  var hand=shuffle(tfs.filter(function(x){return x.id.indexOf('TF-DERIVED-')!==0;})),
      derived=shuffle(tfs.filter(function(x){return x.id.indexOf('TF-DERIVED-')===0;})),
      tfOptions=hand.concat(derived);
  for(var ti=0;ti<tfOptions.length;ti++){
   var tf=tfOptions[ti],sigTF='TRUEFALSE|'+normalized(tf.fi);
   if(seenSignatures[sigTF]||(tf.sourceId&&globalReserved[tf.sourceId]))continue;
   var base={};Object.keys(globalReserved).forEach(function(id){base[id]=true;});
   if(tf.sourceId)base[tf.sourceId]=true;
   var latinKinds=wantLatin?[true,false]:[false,true];
   for(var latinIndex=0;latinIndex<latinKinds.length;latinIndex++){
    var latin=latinKinds[latinIndex],
      candidates=translateCandidates(topic,direction,words,base,latin,globalLatin);
    for(var trIndex=0;trIndex<candidates.length;trIndex++){
     var tr=candidates[trIndex],key='TERM|'+tr.from+'|'+normalized(tr.item[tr.from]);
     if(seenSignatures[key])continue;
     var used={};Object.keys(base).forEach(function(id){used[id]=true;});
     used[tr.item.id]=true;
     var groups=chooseGroups(words,used,g);
     if(!groups)continue;
     var set=[tr,{id:'EX-TF-'+topic+'-'+tf.id,topic:topic,type:'truefalse',question:tf},
       {id:'EX-MATCH-'+topic+'-'+groups.match.id,topic:topic,type:'matching',question:groups.match},
       {id:'EX-MULTI-'+topic+'-'+groups.multi.id,topic:topic,type:'multiselect',question:groups.multi}];
     var localSeen={},valid=true;
     for(var u=0;u<set.length;u++){
      var sign=statementSignature(set[u]);
      if(localSeen[sign]||seenSignatures[sign]){valid=false;break;}
      localSeen[sign]=true;
     }
     if(!valid)continue;
     // Only commit reserved terms after building the entire four-part topic.
     if(tf.sourceId)globalReserved[tf.sourceId]=true;
     globalReserved[tr.item.id]=true;
     for(var m=0;m<4;m++){
      globalReserved[groups.match.items[m].id]=true;
      globalReserved[groups.multi.items[m].sourceId]=true;
     }
     if(latin)globalLatin[normalized(tr.item.la)]=true;
     Object.keys(localSeen).forEach(function(k){seenSignatures[k]=true;});
     return set;
    }
   }
  }
  return null;
 }
 function build(d,bank,direction){
  var g=w.RS_EXAM_ROUNDS,topics=d&&d.examTopics||[],out=[],seen={},usedTerms={},
      usedLatin={},signature={},latinCount=0;
  if(!g||topics.length!==10||!/^(fi-ru|ru-fi|fi-en|en-fi)$/.test(direction)||
     typeof g.buildMatchingFrom!=='function'||typeof g.buildMultiFrom!=='function')return [];
  var eligible=shuffle(topics.filter(function(t){
    var words=g.validTerms(d,t.id),target=direction.split('-')[1],n=0,unique={};
    for(var i=0;i<words.length;i++){
     if(words[i].la&&words[i][target]&&latinUnambiguous(words[i],words,target)&&
        !unique[normalized(words[i].la)]){unique[normalized(words[i].la)]=true;n++;}
    }
    return n>=4;
  }));
  var latinTopics={};
  for(var p=0;p<Math.min(5,eligible.length);p++)latinTopics[eligible[p].id]=true;
  for(var j=0;j<topics.length;j++){
   var topic=topics[j].id,
       selected=builtTopic(g,d,bank,topic,direction,usedTerms,usedLatin,!!latinTopics[topic],signature);
   if(!selected)return [];
   for(var k=0;k<selected.length;k++){
    var question=selected[k];
    if(seen[question.id])return [];
    seen[question.id]=true;out.push(question);
    if(question.latin)latinCount++;
   }
  }
  // Never silently offer fewer than the promised Latin questions: fail closed.
  if(out.length!==40||latinCount<Math.min(4,eligible.length))return [];
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
