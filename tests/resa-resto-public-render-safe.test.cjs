'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const html=fs.readFileSync(path.resolve(__dirname,'../resa-resto/index.html'),'utf8');
const from=html.indexOf('function renderPublicZones(');
const until=html.indexOf('async function load(){',from);
assert.ok(from>=0&&until>from,'safe render helpers must exist');
const helpers=html.slice(from,until);
function el(tag){
  const e={tag,children:[],textContent:'',value:'',disabled:false};
  Object.defineProperty(e,'innerHTML',{set(){throw new Error('Unexpected HTML parser use')}});
  e.replaceChildren=(...nodes)=>{e.children=nodes};
  e.appendChild=(v)=>e.children.push(v);
  e.append=(...nodes)=>e.children.push(...nodes);
  return e;
}
function harness(){
  const zone=el('select'),success=el('div');
  const ctx={document:{createElement:el},$:id=>({zone,success})[id]};
  vm.runInNewContext(helpers+'; this.safe={renderPublicZones,renderPublicConfirmation}',ctx,{timeout:1000});
  return {zone,success,...ctx.safe};
}
function contents(el){return el.children.map(v=>typeof v==='string'?v:v.textContent||'').join('');}
const hostile='<img src=x onerror=alert(1)>';

test('normal zones preserve labels and IDs',()=>{
  const h=harness();
  h.renderPublicZones([{zone_slug:'terrasse',zone_name:'Terrasse',max_covers:22}],false);
  assert.equal(h.zone.children.length,1);
  assert.equal(h.zone.children[0].value,'terrasse');
  assert.equal(h.zone.children[0].textContent,'Terrasse · 22 couverts max');
});
test('hostile zone fields remain text rather than markup',()=>{
  const h=harness();
  h.renderPublicZones([{zone_slug:'" onclick="alert(1)',zone_name:hostile,max_covers:10}],false);
  assert.equal(h.zone.children[0].value,'" onclick="alert(1)');
  assert.equal(h.zone.children[0].textContent,hostile+' · 10 couverts max');
});
test('no zones and RPC failure select a disabled empty option',()=>{
  for(const [data,error,label] of [[[],false,'Aucune zone'],[[],true,'Indisponible'],[null,false,'Aucune zone']]){
    const h=harness();
    h.renderPublicZones(data,error);
    assert.equal(h.zone.children.length,1);
    assert.equal(h.zone.children[0].disabled,true);
    assert.equal(h.zone.children[0].value,'');
    assert.equal(h.zone.children[0].textContent,label);
  }
});
test('confirmed booking preserves business details',()=>{
  const h=harness();
  h.renderPublicConfirmation({zone:'Jardin',tables:['T1','T2'],table_plan_enabled:true,no_show_grace_minutes:15,rotation_rule:'Libérer avant 21h'},{
    p_guests:2,p_booking_date:'2026-10-12',p_booking_time:'19:30'
  });
  const text=contents(h.success);
  assert.match(text,/Réservation confirmée/);
  assert.match(text,/2 personnes · 2026-10-12 · 19:30/);
  assert.match(text,/Jardin · tables T1 \+ T2/);
  assert.match(text,/15 minutes/);
  assert.match(text,/Libérer avant 21h/);
});
test('server-returned hostile booking fields stay plain text',()=>{
  const h=harness();
  h.renderPublicConfirmation({
    zone:hostile,tables:['<svg onload=alert(1)>'],
    table_plan_enabled:true,rotation_rule:'<iframe src=javascript:alert(1)>',no_show_grace_minutes:15
  },{p_guests:1,p_booking_date:'2026-10-12',p_booking_time:'12:00'});
  const text=contents(h.success);
  assert.match(text,/<img src=x onerror=alert\(1\)>/);
  assert.match(text,/<svg onload=alert\(1\)>/);
  assert.match(text,/<iframe src=javascript:alert\(1\)>/);
  assert.ok(h.success.children.every(x=>typeof x==='string'||['strong','br'].includes(x.tag)));
});
test('capacity mode remains visible with no assigned table',()=>{
  const h=harness();
  h.renderPublicConfirmation({zone:'Salle',table_plan_enabled:false},{p_guests:1,p_booking_date:'2026-10-12',p_booking_time:'12:00'});
  assert.match(contents(h.success),/réservation confirmée selon la capacité disponible/);
  assert.match(contents(h.success),/1 personne · 2026-10-12 · 12:00/);
});
test('public booking and availability RPC names remain unchanged',()=>{
  assert.match(html,/db\.rpc\('digiy_resa_resto_public_book_v1',payload\)/);
  assert.match(html,/db\.rpc\('digiy_resa_resto_public_availability_v1'/);
  assert.ok(!html.includes("$('success').innerHTML"));
  assert.ok(!html.includes('z.zone_slug}'));
  assert.ok(html.includes('CONFIRMER MA RÉSERVATION'));
});
