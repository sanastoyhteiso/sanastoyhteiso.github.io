'use strict';
/**
 * RUN137. Source-informed legacy score snapshot SHAPE PREVIEW only.
 * Historic score is a cumulative per-target state, never a V3 answer event.
 * Synthetic fixtures ONLY. NO real records, migration or external I/O.
 */
const SCOPE='OFFLINE_SYNTHETIC_LEGACY_SCORE_BASELINE_PREVIEW_ONLY';
const MAX_ROWS=10000;
const KEYS=new Set(['correct','wrong','seen','last','learned','learnedUpdatedAt']);
function fake(value,prefix){
  return typeof value==='string'&&value.startsWith(prefix)&&
    /^[a-z0-9_]{4,72}$/.test(value.slice(prefix.length));
}
function safeInt(x){return Number.isSafeInteger(x)&&x>=0;}
function checkRow(row){
  if(!row||Object.getPrototypeOf(row)!==Object.prototype||
     !fake(row.eventId,'synthetic_event_')||
     !fake(row.targetId,'synthetic_target_')||
     row.kind!=='score'||!safeInt(row.eventTime)||
     !row.counters||Object.getPrototypeOf(row.counters)!==Object.prototype)
    throw Error('INVALID_SYNTHETIC_SCORE');
  const c=row.counters,keys=Object.keys(c);
  if(keys.length<4||keys.some(k=>!KEYS.has(k))||
     ['correct','wrong','seen','last'].some(k=>!Object.prototype.hasOwnProperty.call(c,k))||
     !safeInt(c.correct)||!safeInt(c.wrong)||!safeInt(c.seen)||!safeInt(c.last)||
     c.correct+c.wrong!==c.seen||
     !Number.isSafeInteger(c.correct+c.wrong)||
     (Object.prototype.hasOwnProperty.call(c,'learned')&&typeof c.learned!=='boolean')||
     (Object.prototype.hasOwnProperty.call(c,'learnedUpdatedAt')&&
        !safeInt(c.learnedUpdatedAt)))
    throw Error('INVALID_SYNTHETIC_COUNTERS');
  return {id:row.eventId,target:row.targetId,counters:c,
    hasLearned:Object.prototype.hasOwnProperty.call(c,'learned')};
}
function preview(input){
  if(!input||input.scope!==SCOPE||
     !fake(input.syntheticOwner,'synthetic_owner_')||
     !Array.isArray(input.rows)||input.rows.length<1||
     input.rows.length>MAX_ROWS)throw Error('SYNTHETIC_FIXTURE_REQUIRED');
  const ids=new Set(),groups=new Map();
  for(const raw of input.rows){
    const row=checkRow(raw);
    if(ids.has(row.id))throw Error('DUPLICATE_SYNTHETIC_EVENT');
    ids.add(row.id);
    const c=row.counters,prev=groups.get(row.target)||{
      correct:0,wrong:0,seen:0,last:0,
      learnedKnown:false,learned:null,ambiguous:false
    };
    prev.correct=Math.max(prev.correct,c.correct);
    prev.wrong=Math.max(prev.wrong,c.wrong);
    prev.seen=Math.max(prev.seen,c.seen);
    prev.last=Math.max(prev.last,c.last);
    if(!row.hasLearned)prev.ambiguous=true;
    else if(prev.learnedKnown && prev.learned!==c.learned)prev.ambiguous=true;
    else {prev.learnedKnown=true;prev.learned=c.learned;}
    groups.set(row.target,prev);
  }
  let ambiguous=0;
  for(const state of groups.values()){
    if(state.correct+state.wrong!==state.seen)
      throw Error('COUNTER_MERGE_CONFLICT');
    if(state.ambiguous||!state.learnedKnown)ambiguous++;
  }
  return Object.freeze({
    mode:SCOPE,
    classification:ambiguous?'LEARNED_STATE_UNPROVEN':'SYNTHETIC_COUNTER_SHAPE_ONLY',
    inspectedSyntheticEvents:input.rows.length,
    inspectedSyntheticTargets:groups.size,
    ambiguousLearnedTargets:ambiguous,
    syntheticCandidateCount:groups.size-ambiguous,
    // No user document, target ID, raw score, or cloud event is ever emitted.
    baselineDocuments:Object.freeze([]),
    v3Events:Object.freeze([]),
    automaticMigrationAllowed:false,
    sourceIntegrityVerified:false,
    realBackupReadbackVerified:false,
    realFirestoreRestoreVerified:false,
    cloudWritesPerformed:false,
    productionReady:false
  });
}
module.exports={SCOPE,preview};
