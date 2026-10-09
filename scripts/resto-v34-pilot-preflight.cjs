#!/usr/bin/env node
'use strict';
/*
 * DIGIY RESTO V34 — strictly offline pilot preflight.
 * It validates a restaurant-supplied draft and a SEPARATE operator attestation.
 * IT DOES NOT verify legal consent, create a catalog entry, send requests,
 * modify GitHub, publish files, contact Supabase or authorize a launch.
 */
const fs=require('node:fs');
const path=require('node:path');
const {validate,localClock,addDays,pickupSlots}=require('../resa-resto/takeaway-core.js');
const slugRx=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function validDate(s){
  if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
  const d=new Date(s+'T12:00:00Z');
  return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s;
}
function check(draft,attestation,expectedSlug,now=new Date()){
  const fail=reason=>({ready:false,reason});
  if(typeof expectedSlug!=='string'||expectedSlug.length>72||!slugRx.test(expectedSlug))
    return fail('Invalid restaurant slug');
  const parsed=validate(draft,expectedSlug);
  if(!parsed.ok)return fail('Menu/configuration invalid: '+parsed.reason);
  if(!attestation||typeof attestation!=='object'||Array.isArray(attestation))
    return fail('Missing separate proprietor attestation');
  // Boolean checkboxes and references are reminders of HUMAN verification, never cryptographic proof.
  if(attestation.restaurantSlug!==expectedSlug||attestation.ownerApprovedMenu!==true
    ||attestation.ownerApprovedContact!==true||attestation.ownerApprovedPickupHours!==true
    ||attestation.ownerOptInTakeaway!==true)
      return fail('Required owner approvals absent or mismatched');
  if(!validDate(attestation.verifiedOn)||attestation.verifiedOn>new Date().toISOString().slice(0,10))
    return fail('Invalid or future verification date');
  if(typeof attestation.evidenceReference!=='string'
    ||!/^[a-zA-Z0-9][a-zA-Z0-9_-]{5,79}$/.test(attestation.evidenceReference))
    return fail('Missing private consent evidence reference');
  if(typeof attestation.operatorReview!=='string'
    ||!/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,59}$/.test(attestation.operatorReview))
    return fail('Missing human reviewer identifier');
  if(attestation.publicationAuthorized!==false)
    return fail('This preflight requires publicationAuthorized=false; separate GO comes later');
  let slots=0;
  try{
    const today=localClock(parsed.data.timezone,now).day;
    for(let i=0;i<=14;i++){
      const date=addDays(today,i);
      slots+=pickupSlots(parsed.data,date,now).length;
    }
  }catch(_){return fail('Unable to compute local pickup hours')}
  if(slots===0)return fail('No upcoming pickup slots in 15-day window');
  // Do NOT output contacts, menu contents, price lists or consent evidence.
  return {ready:true,status:'VALID_FOR_MANUAL_REVIEW_ONLY',restaurantSlug:expectedSlug,
    currency:parsed.data.currency,pickupDaysChecked:15,availableSlotCount:slots,
    publishesNothing:true};
}
function main(args){
  const opts={};
  for(let i=0;i<args.length;i+=2){
    if(!['--draft','--attestation','--site'].includes(args[i])||!args[i+1])
      throw Error('Usage: node scripts/resto-v34-pilot-preflight.cjs --draft PATH --attestation PATH --site SLUG');
    opts[args[i]]=args[i+1];
  }
  if(!opts['--draft']||!opts['--attestation']||!opts['--site'])
    throw Error('All three arguments are required');
  const read=(file)=>{
    const full=path.resolve(file);
    if(!fs.statSync(full).isFile()||fs.statSync(full).size>262144)
      throw Error('Draft/attestation must be a small local JSON file');
    return JSON.parse(fs.readFileSync(full,'utf8'));
  };
  const result=check(read(opts['--draft']),read(opts['--attestation']),opts['--site']);
  if(!result.ready)throw Error(result.reason);
  process.stdout.write(JSON.stringify(result)+'\n');
}
if(require.main===module){
  try{main(process.argv.slice(2))}
  catch(e){process.stderr.write('RESTO_V34_PREFLIGHT_BLOCKED: '+e.message+'\n');process.exitCode=1}
}
module.exports={check,main};
