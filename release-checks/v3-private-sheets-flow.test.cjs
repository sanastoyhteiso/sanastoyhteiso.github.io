'use strict';
// RUN-041: end-to-end fake adapter checks. No network, sheets, tokens,
// personal data, or live Firebase; never restore into Firestore.
const assert=require('node:assert/strict');
const {runBackup}=require('../backup-v3/private-sheets-flow.cjs');
const codec=require('../backup-v3/firestore-source-codec.cjs');
const uid='synthetic-owner';
const meta={project:codec.PROJECT,uid,snapshotId:'snap-20261105',readTime:'2026-11-05T10:10:00Z'};
const prefix='projects/'+meta.project+'/databases/(default)/documents/sync_v3/'+uid+'/';
const ev=(id)=>({name:prefix+'events/E_'+id.repeat(32),
  fields:{v:{integerValue:'3'},answer:{booleanValue:true},
    note:{stringValue:'=HYPERLINK("https://invalid.example") / Terve / Привет'}}});
const sourceEvents=[ev('a'),ev('b')];
const word={name:prefix+'words/W_'+'c'.repeat(32),fields:{fi:{stringValue:'hoito'},ru:{stringValue:'уход'}}};
const baseline={name:prefix+'state/baseline',fields:{revision:{integerValue:'1'}}};
function clone(x){return JSON.parse(JSON.stringify(x));}
function mock(options={}){
  const counts={list:0,get:0,create:0,write:0,read:0,finalize:0};
  let rows=[],storedManifest=null;
  const reader={
    async listDocuments(args){
      counts.list++;
      assert.equal(args.project,meta.project);
      assert.equal(args.uid,meta.uid);
      assert.equal(args.readTime,meta.readTime);
      if(options.rejectFirestore)throw Error('403 PERMISSION_DENIED');
      if(args.kind==='words')return {documents:[word],nextPageToken:''};
      if(args.kind!=='events')throw Error('Unknown kind');
      if(!args.pageToken&&Object.prototype.hasOwnProperty.call(options,'invalidCursor'))
        return {documents:[sourceEvents[0]],nextPageToken:options.invalidCursor};
      if(!args.pageToken)return {documents:[sourceEvents[0]],nextPageToken:'cursor1'};
      if(options.loopCursor)return {documents:[sourceEvents[1]],nextPageToken:'cursor1'};
      return {documents:[options.foreignUid?
        {...sourceEvents[1],name:sourceEvents[1].name.replace(uid,'another_owner')}:
        sourceEvents[1]],nextPageToken:''};
    },
    async getBaseline(args){
      counts.get++;assert.equal(args.readTime,meta.readTime);
      return baseline;
    }
  };
  const sheetId='new_private_sheet_20261105';
  const writer={
    async createNewPrivate(args){
      counts.create++;
      assert.equal(args.project,meta.project);
      assert.equal(args.onlyNew,true);
      assert.equal(args.publicAccess,false);
      if(options.rejectCreate)throw Error('Sheets permission 403');
      return {id:sheetId,createdNew:!options.notNew,private:!options.notPrivate};
    },
    async writeRowsRaw(id,start,batch){
      counts.write++;
      assert.equal(id,sheetId);
      assert.ok(start>0);
      rows.splice(start-1,batch.length,...clone(batch));
      return options.incorrectWriteReceipt?
        {updatedRows:0,valueInputOption:'USER_ENTERED'}:
        {updatedRows:batch.length,valueInputOption:'RAW'};
    },
    async readRows(id,count){
      counts.read++;assert.equal(id,sheetId);
      assert.equal(count,rows.length);
      const copy=clone(rows);
      if(options.truncateReadback)copy.pop();
      if(options.corruptReadback)copy[1][5]=copy[1][5].replace('revision','tampered');
      return copy;
    },
    async writeManifest(id,m){
      counts.finalize++;
      assert.equal(id,sheetId);
      assert.equal(m.complete,true);
      assert.equal(m.liveSheetsVerified,true);
      assert.equal(m.restoreTested,false);
      storedManifest=clone(m);
      return true;
    },
    async readManifest(id){
      assert.equal(id,sheetId);
      if(options.corruptManifest)return {...storedManifest,sha256:'0'.repeat(64)};
      return clone(storedManifest);
    }
  };
  return {reader,writer,counts};
}
const input=m=>({meta,reader:m.reader,writer:m.writer,
  explicitApproval:'CREATE PRIVATE TEST BACKUP',
  destination:'NEW_PRIVATE_GOOGLE_SHEET_ONLY'});
async function run(){
  const ok=mock();
  const result=await runBackup(input(ok));
  assert.equal(result.ok,true);
  assert.equal(result.providerReadBackVerified,true);
  assert.equal(result.actualFirestoreRestoreDone,false);
  assert.equal(result.documentCount,4);
  assert.equal(result.newPrivateSheetCreated,true);
  assert.match(result.sha256,/^[a-f0-9]{64}$/);
  assert.equal(ok.counts.get,1);assert.equal(ok.counts.list,3);
  assert.equal(ok.counts.create,1);assert.ok(ok.counts.write>=1);
  assert.equal(ok.counts.finalize,1);
  // Must reject before any service call, including auth/FireStore.
  const wrong=mock();
  await assert.rejects(runBackup({...input(wrong),meta:{...meta,project:'riveria-sanasto-community-test'}}),
    /Wrong backup project/);
  assert.deepEqual(wrong.counts,{list:0,get:0,create:0,write:0,read:0,finalize:0});
  const noApproval=mock();
  await assert.rejects(runBackup({...input(noApproval),explicitApproval:'NO'}),
    /owner approval/);
  assert.equal(noApproval.counts.list,0);
  const badReader=mock({rejectFirestore:true});
  await assert.rejects(runBackup(input(badReader)),/PERMISSION_DENIED/);
  assert.equal(badReader.counts.create,0);
  const looping=mock({loopCursor:true});
  await assert.rejects(runBackup(input(looping)),/repeating page cursor/);
  assert.equal(looping.counts.create,0);
  // The response must not silently treat an explicit malformed pagination
  // cursor as end-of-list; doing so could certify a truncated backup.
  for(const invalidCursor of [null,0,false,{},[]]){
    const bad=mock({invalidCursor});
    await assert.rejects(runBackup(input(bad)),/Invalid Firestore page cursor/,
      'Malformed explicit nextPageToken must fail closed: '+String(invalidCursor));
    assert.equal(bad.counts.create,0,'Cannot create a private backup from an incomplete listing');
    assert.equal(bad.counts.finalize,0,'Cannot mark a truncated backup complete');
  }
  const crossUid=mock({foreignUid:true});
  await assert.rejects(runBackup(input(crossUid)),/Unexpected Firestore source path/);
  assert.equal(crossUid.counts.create,0);
  const visibility=mock({notPrivate:true});
  await assert.rejects(runBackup(input(visibility)),/not confirmed/);
  assert.equal(visibility.counts.write,0);
  const prior=mock({notNew:true});
  await assert.rejects(runBackup(input(prior)),/not confirmed/);
  assert.equal(prior.counts.write,0);
  const denied=mock({rejectCreate:true});
  await assert.rejects(runBackup(input(denied)),/Sheets permission/);
  assert.equal(denied.counts.write,0);
  const badWrite=mock({incorrectWriteReceipt:true});
  await assert.rejects(runBackup(input(badWrite)),/RAW write not confirmed/);
  assert.equal(badWrite.counts.finalize,0);
  const missing=mock({truncateReadback:true});
  await assert.rejects(runBackup(input(missing)),/Missing backup rows/);
  assert.equal(missing.counts.finalize,0);
  const tamper=mock({corruptReadback:true});
  await assert.rejects(runBackup(input(tamper)),/SHA-256 mismatch/);
  assert.equal(tamper.counts.finalize,0);
  const badManifest=mock({corruptManifest:true});
  await assert.rejects(runBackup(input(badManifest)),/manifest read-back failed/);
  assert.equal(badManifest.counts.finalize,1);
  console.log('PASS RUN-041: paged Firestore read/new private RAW Sheets/readback/manifest via fake adapters; NO live cloud');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
