'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {check}=require('../scripts/resto-v34-pilot-preflight.cjs');

const slug='synthetic-pilot-only';
const fakeMenu=()=>({
  restaurantSlug:slug,restaurantName:'Synthetic local restaurant',
  enabled:true,ownerApproved:true,currency:'XOF',timezone:'Africa/Dakar',
  whatsapp:'+221770000000',phone:null,preparationMinutes:20,
  pickupWindows:[{weekdays:[1,2,3,4,5,6,7],from:'11:30',to:'14:00'}],
  items:[{id:'test-dish',name:'Synthetic meal only',priceMinor:2000,available:true}]
});
const fakeAttestation=()=>({
  restaurantSlug:slug,ownerApprovedMenu:true,
  ownerApprovedContact:true,ownerApprovedPickupHours:true,
  ownerOptInTakeaway:true,verifiedOn:'2026-10-09',
  evidenceReference:'SYNTHETIC_TEST_EVIDENCE',operatorReview:'synthetic_ops',
  publicationAuthorized:false
});
const when=new Date('2026-10-09T10:00:00Z');
test('offline preflight recognizes complete fake pilot yet never authorizes publication',()=>{
  const x=check(fakeMenu(),fakeAttestation(),slug,when);
  assert.equal(x.ready,true);
  assert.equal(x.status,'VALID_FOR_MANUAL_REVIEW_ONLY');
  assert.equal(x.publishesNothing,true);
  assert.ok(x.availableSlotCount>0);
  assert.doesNotMatch(JSON.stringify(x),/770000000|2000|Synthetic meal|SYNTHETIC_TEST_EVIDENCE/);
});
test('preflight fails closed without real proprietor attestation or mismatched site',()=>{
  const menu=fakeMenu(),auth=fakeAttestation();
  assert.equal(check(menu,null,slug,when).ready,false);
  assert.equal(check(menu,auth,'another-restaurant',when).ready,false);
  for(const key of ['ownerApprovedMenu','ownerApprovedContact','ownerApprovedPickupHours','ownerOptInTakeaway']){
    const x={...auth,[key]:false};
    assert.equal(check(menu,x,slug,when).ready,false,key);
  }
});
test('GO publication cannot be declared in an offline preflight',()=>{
  const x={...fakeAttestation(),publicationAuthorized:true};
  const r=check(fakeMenu(),x,slug,when);
  assert.equal(r.ready,false);assert.match(r.reason,/separate GO/);
});
test('invalid approval evidence or date is rejected, never guessed',()=>{
  for(const changes of [
    {verifiedOn:'2099-01-01'}, {verifiedOn:'10/09/2026'},
    {evidenceReference:''},{operatorReview:''},{restaurantSlug:'other-restaurant'}
  ]){
    assert.equal(check(fakeMenu(),{...fakeAttestation(),...changes},slug,when).ready,false);
  }
});
test('fake draft cannot bypass opt-in or schedule validation',()=>{
  for(const changes of [
    {ownerApproved:false},{enabled:false},{whatsapp:'javascript:bad'},{items:[]},
    {pickupWindows:[{weekdays:[1],from:'22:00',to:'01:00'}]},
    {pickupWindows:[{weekdays:[1,2,3,4,5,6,7],from:'00:00',to:'00:00'}]}
  ]){
    const r=check({...fakeMenu(),...changes},fakeAttestation(),slug,when);
    assert.equal(r.ready,false,JSON.stringify(changes));
  }
});
test('CLI runs with local fake JSON only, returns no menu, phone or consent evidence',()=>{
  const folder=fs.mkdtempSync(path.join(os.tmpdir(),'digiy-v34-preflight-'));
  try{
    const m=path.join(folder,'synthetic-menu.json'),a=path.join(folder,'synthetic-approval.json');
    fs.writeFileSync(m,JSON.stringify(fakeMenu()));
    fs.writeFileSync(a,JSON.stringify(fakeAttestation()));
    const script=path.resolve(__dirname,'../scripts/resto-v34-pilot-preflight.cjs');
    const result=spawnSync(process.execPath,[script,'--draft',m,'--attestation',a,'--site',slug],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
    assert.match(result.stdout,/VALID_FOR_MANUAL_REVIEW_ONLY/);
    assert.doesNotMatch(result.stdout,/770000000|2000|Synthetic meal|SYNTHETIC_TEST_EVIDENCE/);
    const denied=spawnSync(process.execPath,[script,'--draft',m,'--site',slug],{encoding:'utf8'});
    assert.notEqual(denied.status,0);
    assert.match(denied.stderr,/PREFLIGHT_BLOCKED/);
  }finally{fs.rmSync(folder,{recursive:true,force:true})}
});
