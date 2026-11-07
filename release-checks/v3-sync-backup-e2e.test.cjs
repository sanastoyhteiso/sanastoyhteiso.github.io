'use strict';
/*
 * RUN-138: synthetic-only chain: two REAL V3 client engines and IndexedDB
 * shadows -> in-memory fake Firestore transport -> private RAW Sheets adapter
 * -> readback SHA-256 -> fresh isolated in-memory restore.
 *
 * No credentials, Google APIs, Firebase network, real user data, migration,
 * cloud writes, restored production records or deployment. This CANNOT prove
 * real Cloud sync, private Drive permissions or live Firestore recovery.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const {IDBFactory}=require('fake-indexeddb');
const core=require('../v3-sync-core.js');
const engine=require('../v3-sync-engine.js');
const shadowApi=require('../v3-sync-shadow.js');
const codec=require('../backup-v3/firestore-source-codec.cjs');
const {runBackup}=require('../backup-v3/private-sheets-flow.cjs');
const isolated=require('../backup-v3/isolated-restore-proof.cjs');
const UID='synthetic_owner_138';
const TARGET='T12345';
const META={project:codec.PROJECT,uid:UID,
  snapshotId:'test_sync_backup_138',readTime:'2026-11-07T12:24:00Z'};
const PREFIX='projects/'+META.project+'/databases/(default)/documents/sync_v3/'+UID+'/';
const clone=x=>JSON.parse(JSON.stringify(x));

function fakeServer(){
  const owners=new Map();
  return {
    all(uid){return [...(owners.get(uid)||new Map()).values()].map(clone);},
    async list(uid){return this.all(uid);},
    async put(uid,record){
      if(record.v!==3||record.uid!==uid||uid!==UID)
        throw Error('Synthetic owner mismatch');
      if(!owners.has(uid))owners.set(uid,new Map());
      const bucket=owners.get(uid);
      if(bucket.has(record.id))
        assert.deepEqual(bucket.get(record.id),record,'idempotent cloud replay');
      else bucket.set(record.id,clone(record));
    }
  };
}

function simulatedDevice(deviceNo,server){
  const db=new IDBFactory();
  const shadow=shadowApi.create({enableStagingWrites:true,indexedDB:db,
    core,activeUid:()=>UID,now:()=>1793000000000});
  let seq=0,clock=1793000000000;
  const client=engine.create({stagingOnly:true,uid:UID,core,shadow,
    device:'D_'+deviceNo.toString(16).padStart(32,'0'),
    remote:{list:(uid,cap)=>{
      assert.equal(uid,UID);assert.ok(cap>=2);return server.list(uid);
    },put:(uid,event)=>server.put(uid,event)},
    activeUid:()=>UID,online:()=>true,
    random:()=>((deviceNo*10000)+ ++seq).toString(16).padStart(32,'0'),
    now:()=>++clock});
  return {client,shadow};
}

// Freeze remote snapshot *before* taking backup. Deliberately excludes locally
// pending answers; after ack the next snapshot must include them instead.
function fakeFirestoreSnapshot(records){
  const docs=records.map(e=>({
    name:PREFIX+'events/'+e.id,
    fields:{v:{integerValue:'3'},
      rawEvent:{stringValue:JSON.stringify(e)}}
  })).sort((a,b)=>a.name.localeCompare(b.name));
  return {
    async listDocuments({project,uid,readTime,kind,pageToken}){
      assert.equal(project,META.project);assert.equal(uid,UID);
      assert.equal(readTime,META.readTime);
      if(kind==='words')return {documents:[],nextPageToken:''};
      assert.equal(kind,'events');
      const start=pageToken?Number(pageToken.slice(1)):0;
      assert.ok(Number.isInteger(start)&&start>=0);
      const batch=docs.slice(start,start+1);
      const next=start+batch.length;
      return {documents:clone(batch),nextPageToken:next<docs.length?'p'+next:''};
    },
    async getBaseline({project,uid,readTime}){
      assert.equal(project,META.project);assert.equal(uid,UID);
      assert.equal(readTime,META.readTime);return null;
    }
  };
}

function fakePrivateSheet(){
  let rows=[],manifest=null,creates=0;
  const id='new_private_synthetic_sheet_138';
  return {
    get rows(){return clone(rows);},
    get manifest(){return clone(manifest);},
    get creates(){return creates;},
    async createNewPrivate(x){
      assert.equal(x.onlyNew,true);assert.equal(x.publicAccess,false);
      assert.equal(x.project,META.project);creates++;
      return {id,createdNew:true,private:true};
    },
    async writeRowsRaw(sheetId,start,batch){
      assert.equal(sheetId,id);assert.ok(start>=1);
      rows.splice(start-1,batch.length,...clone(batch));
      return {updatedRows:batch.length,valueInputOption:'RAW'};
    },
    async readRows(sheetId,count){
      assert.equal(sheetId,id);assert.equal(count,rows.length);
      return clone(rows);
    },
    async writeManifest(sheetId,value){
      assert.equal(sheetId,id);assert.equal(value.restoreTested,false);
      manifest=clone(value);return true;
    },
    async readManifest(sheetId){
      assert.equal(sheetId,id);return clone(manifest);
    }
  };
}

test('two-device cloud events -> private Sheet readback -> isolated restore preserves manual unlearned',async()=>{
  const server=fakeServer();
  const a=simulatedDevice(1,server),b=simulatedDevice(2,server);
  await a.client.start();await b.client.start();
  await a.client.record('answer',TARGET,true);
  await a.client.upload();
  await b.client.refresh();
  assert.equal((await b.client.view()).state.scores[TARGET].correct,1);
  await b.client.record('learned_set',TARGET,false);
  await b.client.upload();
  await a.client.refresh();
  assert.equal((await a.client.view()).state.scores[TARGET].learned,false,
    'manually cleared learned flag survives a cloud roundtrip');
  // A third event is local-only: a remote snapshot MUST NOT falsely include it.
  await a.client.record('favorite_set',TARGET,true);
  assert.equal((await a.client.view()).pending.length,1);
  assert.equal(server.all(UID).length,2);

  const sheet=fakePrivateSheet();
  const result=await runBackup({meta:META,
    reader:fakeFirestoreSnapshot(server.all(UID)),writer:sheet,
    explicitApproval:'CREATE PRIVATE TEST BACKUP',
    destination:'NEW_PRIVATE_GOOGLE_SHEET_ONLY'});
  assert.equal(result.ok,true);
  assert.equal(result.documentCount,2);
  assert.equal(sheet.creates,1);
  const verified=codec.verify(sheet.rows,sheet.manifest,META);
  assert.deepEqual(verified.counts,{baseline:0,events:2,words:0});
  const replay=verified.source.events.map(d=>JSON.parse(d.fields.rawEvent.stringValue));
  const state=core.fold({},replay);
  assert.equal(state.invalid,0);
  assert.equal(state.applied,2);
  assert.equal(state.state.scores[TARGET].correct,1);
  assert.equal(state.state.scores[TARGET].learned,false);
  assert.equal(state.state.favorites[TARGET],undefined);

  const proof=isolated.prove({scope:isolated.MARKER,expected:META,
    rows:sheet.rows,manifest:sheet.manifest});
  assert.equal(proof.offlineInMemoryRestoreVerified,true);
  assert.equal(proof.liveGoogleSheetsReadbackVerified,false);
  assert.equal(proof.realFirestoreRestoreVerified,false);
  assert.equal(proof.productionReady,false);

  // Later upload must NOT rewrite an already created immutable snapshot.
  const snapshotHash=sheet.manifest.sha256;
  await a.client.upload();
  await b.client.refresh();
  assert.equal((await b.client.view()).state.favorites[TARGET],true);
  assert.equal(server.all(UID).length,3);
  assert.equal(sheet.manifest.sha256,snapshotHash);
  assert.equal(codec.verify(sheet.rows,sheet.manifest,META).counts.events,2);
  const tampered=sheet.rows;
  tampered[1][5]=tampered[1][5].replace('rawEvent','forgedEvent');
  assert.throws(()=>codec.verify(tampered,sheet.manifest,META),/SHA-256 mismatch|Noncanonical|Missing/i);
});

test('owner mix-up aborts before creating synthetic Sheets copy',async()=>{
  const foreign=fakeServer();
  const sheet=fakePrivateSheet();
  const incorrect={...META,uid:'synthetic_other_138'};
  await assert.rejects(runBackup({meta:incorrect,reader:fakeFirestoreSnapshot(foreign.all(UID)),
    writer:sheet,explicitApproval:'CREATE PRIVATE TEST BACKUP',
    destination:'NEW_PRIVATE_GOOGLE_SHEET_ONLY'}),/actual|strict|equal|mismatch|synthetic|owner/i);
  assert.equal(sheet.creates,0);
});
