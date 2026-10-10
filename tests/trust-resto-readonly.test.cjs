'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'assets/digiy-trust-resto.js'),'utf8');
const fiche1=fs.readFileSync(path.join(root,'fiche-lentre2.html'),'utf8');
const fiche2=fs.readFileSync(path.join(root,'fiche-le-malraux.html'),'utf8');
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.textContent='';this.attributes={};}
 replaceChildren(...nodes){this.children=nodes}
 append(...nodes){this.children.push(...nodes)}
 setAttribute(key,value){this.attributes[key]=value}
}
function setup(){
 const w={},d={readyState:'loading',
  addEventListener(){},
  createElement:tag=>new Element(tag)};
 vm.runInNewContext(source,{window:w,document:d,Number,Math,Set},{timeout:2000});
 return {api:w.DIGIYTrustResto,Element};
}
function walk(el){
 const out=[el.textContent||''];
 for(const c of el.children||[])out.push(walk(c));
 return out.join(' ');
}
test('RESTO fiches already carry read-only DIGIY TRUST, with zero public submission',()=>{
 for(const f of [fiche1,fiche2]){
  assert.match(f,/data-digiy-trust-resto/);
  assert.match(f,/digiy-trust-resto\.js/);
  assert.match(f,/digiy-trust-resto\.css/);
 }
 assert.doesNotMatch(source,/(?:\.insert\s*\(|\.update\s*\(|\.delete\s*\(|service_role|submit_review|fetch\s*\(|digiy_resa_resto_owner_set_booking_status_v1)/);
 assert.doesNotMatch(source,/innerHTML\s*=/);
});
test('no star average displayed without server-published attested aggregate',()=>{
 const {api,Element}=setup();
 for(const bad of [
  null,{},{status:'verified',review_count:7,overall_stars:5,value_for_money_stars:5},
  {status:'verified_public_aggregate',review_count:0,overall_stars:5,value_for_money_stars:5},
  {status:'verified_public_aggregate',review_count:-1,overall_stars:5,value_for_money_stars:5},
  {status:'verified_public_aggregate',review_count:1.5,overall_stars:5,value_for_money_stars:5},
  {status:'verified_public_aggregate',review_count:1,overall_stars:0,value_for_money_stars:3},
  {status:'verified_public_aggregate',review_count:1,overall_stars:4,value_for_money_stars:6},
  {status:'verified_public_aggregate',review_count:1,overall_stars:4}
 ]){
  const target=new Element('section');const state=api.render(target,bad);
  assert.equal(state.verified,false);
  assert.match(walk(target),/Pas encore d’évaluation vérifiée/);
  assert.doesNotMatch(walk(target),/Note générale.*\/ 5/);
 }
});
test('value for money is separate from overall rating and visible only on verified aggregates',()=>{
 const {api,Element}=setup();
 const aggregate={
  status:'verified_public_aggregate',review_count:5,
  overall_stars:4.4,value_for_money_stars:3.6,
  criteria:{
   food_quality:{stars:4.8,count:5},
   quality:{stars:4.1,count:5},
   welcome:{stars:4,count:5},
   reliability:{stars:3.4,count:5},
   availability:{stars:5,count:6},
   made_up_category:{stars:5,count:5}
  }
 };
 const target=new Element('section'),result=api.render(target,aggregate),out=walk(target);
 assert.equal(result.verified,true);assert.equal(result.count,5);
 assert.equal(result.overall,'4.4');assert.equal(result.valueForMoney,'3.6');
 assert.match(out,/Rapport qualité-prix/);
 assert.match(out,/Valeur reçue, pas prix le plus bas/);
 assert.match(out,/Qualité des plats.*4\.8/);
 assert.doesNotMatch(out,/made_up_category/);
 assert.doesNotMatch(out,/Disponibilité.*5\.0/);
 assert.ok(target.children.some(c=>c.tag==='details'),'criteria breakdown must open on click');
});
test('client identifiers, owner status, fake evidence and arbitrary fields never enable a star score',()=>{
 const {api}=setup();
 for(const info of [
  {booking_status:'completed'},
  {booking_status:'confirmed',client_claimed:true},
  {booking_status:'arrived',owner_verified:true},
  {customer_phone:'221771234567'},
  {review_count:99,overall_stars:5,value_for_money_stars:5},
  {status:'verified_public_aggregate',review_count:5,overall_stars:'5',value_for_money_stars:5}
 ]){
  assert.equal(api.interpretPublicAggregate(info).verified,false);
 }
});
