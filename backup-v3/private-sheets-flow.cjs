'use strict';
/* RUN-041 trusted backup orchestration interface, NO Google client included.
 * Inject authenticated Firestore read-only and private Sheets adapters.
 * NEVER overwrites existing Sheets, NEVER writes Firestore, NEVER restores.
 * Owner-approved TEST-only workflow. Mock CI is NOT a live backup.
 */
const codec=require('./firestore-source-codec.cjs');
const PAGE_LIMIT=250,MAX_DOCS=20000,BATCH=20;
function validToken(token){return typeof token==='string'&&token.length>0&&token.length<=5000;}
function assertAdapter(source,sink){
  if(!source||typeof source.listDocuments!=='function'||typeof source.getBaseline!=='function')
    throw Error('Firestore read-only adapter missing');
  for(const k of ['createNewPrivate','writeRowsRaw','readRows','writeManifest','readManifest'])
    if(!sink||typeof sink[k]!=='function')throw Error('Private Sheets adapter missing '+k);
}
async function pages(adapter,kind,meta){
  const out=[],seen=new Set();
  let cursor='',pageCount=0;
  while(true){
    if(++pageCount>PAGE_LIMIT)throw Error('Firestore pagination safety limit');
    const page=await adapter.listDocuments({project:meta.project,uid:meta.uid,
      readTime:meta.readTime,kind,pageToken:cursor});
    if(!page||!Array.isArray(page.documents))throw Error('Firestore listing incomplete');
    for(const d of page.documents){
      out.push(d);
      if(out.length>MAX_DOCS)throw Error('Firestore documents safety limit');
    }
    // A missing cursor means EOF; an explicit null/false/0 is malformed,
    // NOT EOF. Never certify an incomplete Firestore backup as complete.
    const next=page.nextPageToken===undefined?'':page.nextPageToken;
    if(typeof next!=='string'||(next&&!validToken(next)))
      throw Error('Invalid Firestore page cursor');
    if(!next)break;
    if(seen.has(next)||next===cursor)throw Error('Firestore repeating page cursor');
    seen.add(next);cursor=next;
  }
  return out;
}
async function readSource(adapter,meta){
  codec.identity(meta);
  const events=await pages(adapter,'events',meta);
  const words=await pages(adapter,'words',meta);
  // Adapter MUST throw on permission/auth/transport errors. Only actual
  // Firestore NOT_FOUND is a valid signal for an absent baseline.
  const baseline=await adapter.getBaseline({project:meta.project,uid:meta.uid,
    readTime:meta.readTime});
  if(baseline!==null&&(typeof baseline!=='object'||Array.isArray(baseline)))
    throw Error('Invalid baseline API result');
  return {...meta,events,words,baseline};
}
async function runBackup(opts){
  if(!opts||!opts.meta)throw Error('Missing backup configuration');
  const meta=opts.meta;
  codec.identity(meta); // before touching any adapter
  if(opts.explicitApproval!=='CREATE PRIVATE TEST BACKUP'||
     opts.destination!=='NEW_PRIVATE_GOOGLE_SHEET_ONLY')
    throw Error('Missing independent owner approval for private TEST backup');
  const reader=opts.reader,writer=opts.writer;
  assertAdapter(reader,writer);
  // These steps are all READ-ONLY before any Sheet is created.
  const source=await readSource(reader,meta);
  const planned=codec.pack(source);
  codec.verify(planned.rows,planned.manifest,meta);
  // Trust boundary: NEW document only; no known Sheet ID accepted here.
  const destination=await writer.createNewPrivate({
    project:meta.project,snapshotId:meta.snapshotId,
    rowCount:planned.manifest.rowCount+1,
    onlyNew:true,publicAccess:false
  });
  if(!destination||destination.createdNew!==true||destination.private!==true||
     typeof destination.id!=='string'||!/^[A-Za-z0-9_-]{10,200}$/.test(destination.id))
    throw Error('New private Sheet not confirmed; do not write');
  for(let start=0;start<planned.rows.length;start+=BATCH){
    const chunk=planned.rows.slice(start,start+BATCH);
    const result=await writer.writeRowsRaw(destination.id,start+1,chunk);
    if(!result||result.updatedRows!==chunk.length||result.valueInputOption!=='RAW')
      throw Error('Sheets RAW write not confirmed');
  }
  const reread=await writer.readRows(destination.id,planned.rows.length);
  const verified=codec.verify(reread,planned.manifest,meta);
  if(!verified.ok)throw Error('Sheets read-back integrity failed');
  // Manifest is written only after a full provider read-back; an
  // incomplete or corrupted copy remains private and UNVERIFIED.
  const committed={...planned.manifest,
    complete:true,liveSheetsVerified:true,restoreTested:false,
    copiedTo:'PRIVATE_NEW_TEST_SHEET'};
  const writeResult=await writer.writeManifest(destination.id,committed);
  if(writeResult!==true)throw Error('Private backup manifest not committed');
  const stored=await writer.readManifest(destination.id);
  if(!stored||JSON.stringify(stored)!==JSON.stringify(committed))
    throw Error('Private backup manifest read-back failed');
  return {ok:true,providerReadBackVerified:true,actualFirestoreRestoreDone:false,
    newPrivateSheetCreated:true,documentCount:committed.documentCount,
    rowCount:committed.rowCount,sha256:committed.sha256,
    // Sheet ID remains private in caller memory; never print it to CI.
    privateSheetId:destination.id};
}
module.exports={runBackup,readSource,PAGE_LIMIT};
