/* Lääkelaskin educational-only calculation engine. ES5, offline, no external requests. */
(function(root){
'use strict';
function finite(n){return typeof n==='number'&&isFinite(n);}
function number(v){
  if(typeof v==='number')return finite(v)?v:NaN;
  var s=String(v==null?'':v).replace(/\s/g,'').replace(',','.');
  if(!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return NaN;
  var n=Number(s);return finite(n)?n:NaN;
}
function fmt(n){
  if(!finite(n))return '—';
  if(Math.abs(n)<1e-12)return '0';
  return String(Number(n.toPrecision(11))).replace('.',',');
}
function required(v,label,allowZero){
  var n=number(v);
  if(!finite(n)||(allowZero?n<0:n<=0))throw new Error('Введите положительное число: '+label);
  return n;
}
var FACTORS={
 'kg':['mass',1000000],'g':['mass',1000],'mg':['mass',1],'mcg':['mass',.001],
 'l':['volume',1000],'dl':['volume',100],'cl':['volume',10],'ml':['volume',1],'ul':['volume',.001],
 'h':['time',60],'min':['time',1],'s':['time',1/60],'IU':['IU',1]
};
function unit(u){return u==='µg'||u==='μg'?'mcg':u==='µl'||u==='μl'?'ul':u;}
function convert(value,from,to){
  var n=number(value),a=FACTORS[unit(from)],b=FACTORS[unit(to)];
  if(!finite(n))throw new Error('Введите число');
  if(!a||!b||a[0]!==b[0])throw new Error('Несовместимые единицы. Массу в объём переводят только через концентрацию.');
  return n*a[1]/b[1];
}
function expression(src){
  var s=String(src||'').replace(/\s/g,'').replace(/,/g,'.').replace(/[×х]/g,'*').replace(/[÷:]/g,'/').replace(/[−–]/g,'-'),i=0;
  if(!s||s.length>180)throw new Error('Введите выражение');
  function skip(){return s.charAt(i);}
  function atom(){
    var sign=1;
    while(skip()==='+'||skip()==='-'){if(skip()==='-')sign=-sign;i++;}
    if(skip()==='('){i++;var v=sum();if(skip()!==')')throw new Error('Проверьте скобки');i++;return sign*v;}
    var sub=s.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
    if(!sub)throw new Error('Проверьте выражение');
    i+=sub[0].length;return sign*Number(sub[0]);
  }
  function product(){
    var v=atom();
    while(skip()==='*'||skip()==='/'){
      var op=s.charAt(i++),b=atom();
      if(op==='/'&&b===0)throw new Error('Деление на ноль');
      v=op==='*'?v*b:v/b;
    }
    return v;
  }
  function sum(){
    var v=product();
    while(skip()==='+'||skip()==='-'){var op=s.charAt(i++),b=product();v=op==='+'?v+b:v-b;}
    return v;
  }
  var ans=sum();
  if(i!==s.length||!finite(ans))throw new Error('Проверьте выражение');
  return ans;
}
function solve(kind,p){
  p=p||{};
  function n(key,label){return required(p[key],label||key);}
  function optional(key){return p[key]==null||String(p[key]).trim()===''?null:n(key);}
  function dose(v,from,to){return convert(v,from||'mg',to||'mg');}
  var a,b,c,d,detail='',value,unitName='',extra=null;
  if(kind==='tablet'){
    a=n('dose','Назначенная доза');b=n('strength','Содержание в таблетке');
    value=dose(a,p.doseUnit,p.strengthUnit)/b;unitName='таблетки';
    detail=fmt(dose(a,p.doseUnit,p.strengthUnit))+' '+(p.strengthUnit||'mg')+' ÷ '+fmt(b)+' '+(p.strengthUnit||'mg')+'/табл.';
  }else if(kind==='liquid'){
    a=n('dose','Назначенная доза');b=n('strength','Концентрация');
    value=dose(a,p.doseUnit,p.strengthUnit)/b;unitName='мл';
    detail=fmt(dose(a,p.doseUnit,p.strengthUnit))+' '+(p.strengthUnit||'mg')+' ÷ '+fmt(b)+' '+(p.strengthUnit||'mg')+'/мл';
  }else if(kind==='amount'){
    a=n('volume','Объём');b=n('strength','Концентрация');
    value=a*b;unitName=p.strengthUnit||'mg';
    detail=fmt(a)+' мл × '+fmt(b)+' '+unitName+'/мл';
  }else if(kind==='weight'){
    a=n('rate','Доза на кг');b=n('weight','Масса тела');c=n('doses','Число приёмов');
    value=a*b/c;unitName=p.doseUnit||'mg';
    detail=fmt(a)+' '+unitName+'/кг × '+fmt(b)+' кг ÷ '+fmt(c)+' приём(а)';
    d=optional('strength');
    if(d!==null){extra={value:dose(value,unitName,p.strengthUnit)/d,unit:'мл',label:'Объём на приём'};
      detail+='; '+fmt(dose(value,unitName,p.strengthUnit))+' '+(p.strengthUnit||'mg')+' ÷ '+fmt(d)+' '+(p.strengthUnit||'mg')+'/мл';}
  }else if(kind==='infusion'){
    a=n('volume','Объём');b=n('time','Время');
    value=a/b;unitName='мл/ч';detail=fmt(a)+' мл ÷ '+fmt(b)+' ч';
  }else if(kind==='drops'){
    a=n('volume','Объём');b=n('factor','Капель в мл');c=n('time','Время в минутах');
    value=a*b/c;unitName='капель/мин';detail=fmt(a)+' мл × '+fmt(b)+' капель/мл ÷ '+fmt(c)+' мин';
  }else if(kind==='dropVolume'){
    a=n('rate','Капель/мин');b=n('time','Время в минутах');c=n('factor','Капель в мл');
    value=a*b/c;unitName='мл';detail=fmt(a)+' капель/мин × '+fmt(b)+' мин ÷ '+fmt(c)+' капель/мл';
  }else if(kind==='stock'){
    a=n('total','Количество таблеток');b=n('each','Таблеток за приём');c=n('times','Приёмов в сутки');
    value=a/(b*c);unitName='суток';detail=fmt(a)+' табл. ÷ ('+fmt(b)+' табл. × '+fmt(c)+' раз/сут)';
  }else if(kind==='mix'){
    a=n('strength','Исходная концентрация');b=n('volume','Добавленный объём');c=n('final','Конечный объём');
    value=a*b/c;unitName=(p.strengthUnit||'mg')+'/мл';
    detail=fmt(a)+' '+unitName+' × '+fmt(b)+' мл ÷ '+fmt(c)+' мл';
    d=optional('speed');
    if(d!==null){extra={value:value*d,unit:(p.strengthUnit||'mg')+'/ч',label:'Количество вещества в час'};
      detail+='; '+fmt(value)+' '+unitName+' × '+fmt(d)+' мл/ч';}
  }else if(kind==='percent'){
    a=n('percent','Процент раствора');value=a*10;unitName='мг/мл';
    detail=fmt(a)+' % (масса/объём) = '+fmt(a)+' г/100 мл = '+fmt(value)+' мг/мл';
  }else throw new Error('Неизвестная формула');
  if(!finite(value)||value<0||(extra&&!finite(extra.value)))throw new Error('Проверьте исходные значения');
  return {value:value,unit:unitName,detail:detail,extra:extra};
}
root.RS_MED_CALC={number:number,fmt:fmt,convert:convert,expression:expression,solve:solve,units:FACTORS};
})(typeof window==='undefined'?this:window);
