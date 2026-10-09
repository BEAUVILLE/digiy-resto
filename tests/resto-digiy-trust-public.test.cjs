'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const js=read('assets/digiy-trust-resto.js');
const css=read('assets/digiy-trust-resto.css');
const spec=read('docs/RESTO_DIGIY_TRUST_HERITAGE_V1.md');
function load(){
 const win={}; const doc={readyState:'loading',addEventListener(){}};
 vm.runInNewContext(js,{window:win,document:doc},{timeout:1500});
 return win.DIGIYTrustResto;
}
test('source JS est valide, aucun appel réseau ni envoi de note',()=>{
 assert.doesNotThrow(()=>new vm.Script(js));
 assert.doesNotMatch(js,/fetch\s*\(|\.rpc\s*\(|XMLHttpRequest|new\s+WebSocket|localStorage|sessionStorage|service_role/i);
 assert.doesNotMatch(js,/submitReview|insertReview|\.insert\(/);
});
test('deux fiches et RÉSA RESTO exposent le bloc sans changer les réservations',()=>{
 for(const f of ['fiche-le-malraux.html','fiche-lentre2.html','resa-resto/index.html']){
  const s=read(f);
  assert.match(s,/data-digiy-trust-resto/,'no trust panel: '+f);
  assert.match(s,/Pas encore d’évaluation vérifiée/,'false review state: '+f);
  assert.match(s,/digiy-trust-resto\.css/);
  assert.match(s,/digiy-trust-resto\.js/);
  assert.doesNotMatch(s,/aggregateRating|"ratingValue"|data-verified-rating=\d/);
  assert.doesNotMatch(s,/DIGIYTrustResto\.render\([^)]*,\s*\{/);
 }
 const resto=read('resa-resto/index.html');
 assert.match(resto,/digiy_resa_resto_public_book_v1/);
 assert.match(resto,/digiy_resa_resto_public_availability_v1/);
 assert.ok(resto.indexOf('id="book"')<resto.indexOf('data-digiy-trust-resto'), 'trust panel should not interrupt booking');
});
test('moyennes générales et rapport qualité-prix sont deux champs distincts',()=>{
 const w=load();
 const aggregate={
  status:'verified_public_aggregate',
  review_count:3,
  overall_stars:4.7,
  value_for_money_stars:3.2,
  criteria:{food_quality:{stars:4.9,count:3},welcome:{stars:4.5,count:2},unverified:{stars:5,count:3}}
 };
 const res=w.interpretPublicAggregate(aggregate);
 assert.equal(res.verified,true);
 assert.equal(res.overall,'4.7');
 assert.equal(res.valueForMoney,'3.2');
 assert.notEqual(res.overall,res.valueForMoney);
 assert.equal(res.count,3);
 assert.equal(res.criteria.length,2);
 assert.ok(res.criteria.every(c=>c.key!=='value_for_money'));
 assert.match(spec,/rapport qualité-prix séparé/i);
 assert.match(spec,/pas le restaurant le moins cher/);
});
test('pas d avis vérifié donne un état vide, jamais zéro ou cinq étoiles',()=>{
 const w=load();
 const invalid=[null,undefined,{}, {status:'unverified',review_count:4,overall_stars:5,value_for_money_stars:5},
  {status:'verified_public_aggregate',review_count:0,overall_stars:5,value_for_money_stars:5},
  {status:'verified_public_aggregate',review_count:1,overall_stars:0,value_for_money_stars:4},
  {status:'verified_public_aggregate',review_count:1,overall_stars:4,value_for_money_stars:6}
 ];
 for(const v of invalid){
  const s=w.interpretPublicAggregate(v);
  assert.equal(s.verified,false);
  assert.equal(s.overall,null);
  assert.equal(s.valueForMoney,null);
 }
});
test('composant DOM n expose que les agrégats, détail par clic et états accessibles',()=>{
 const w=load();
 class Elem{
  constructor(tag){this.tag=tag;this.className='';this.textContent='';this.attrs={};this.children=[];}
  setAttribute(k,v){this.attrs[k]=v;}
  append(...arr){this.children.push(...arr)}
  replaceChildren(...arr){this.children=arr}
  flat(){return [this.textContent,...this.children.map(c=>c.flat())].join(' ')}
 }
 const sandboxWin={}, doc={readyState:'loading',addEventListener(){},createElement(tag){return new Elem(tag)}};
 vm.runInNewContext(js,{window:sandboxWin,document:doc},{timeout:1500});
 const root=new Elem('section');
 sandboxWin.DIGIYTrustResto.render(root,null);
 assert.match(root.flat(),/Pas encore d’évaluation vérifiée/);
 assert.doesNotMatch(root.flat(),/0 \/ 5|5 \/ 5/);
 sandboxWin.DIGIYTrustResto.render(root,{status:'verified_public_aggregate',review_count:2,overall_stars:4.5,value_for_money_stars:3.5,criteria:{quality:{stars:5,count:2}}});
 const txt=root.flat();
 assert.match(txt,/Note générale.*4\.5 \/ 5/);
 assert.match(txt,/Rapport qualité-prix.*3\.5 \/ 5/);
 assert.ok(root.children.some(x=>x.tag==='details'),'clickable detail missing');
 assert.doesNotMatch(txt,/Téléphone|customer_phone|customer_name/);
});
test('RESTO reste indépendant; la documentation refuse toute fausse attestation',()=>{
 assert.match(spec,/confirm.*ne suffisent pas/i);
 assert.match(spec,/0 % commission/);
 assert.match(spec,/aucune RPC d'évaluation/i);
 assert.match(spec,/MULTI RÉSA/);
 assert.match(spec,/aucun appel réseau TRUST/i);
 assert.match(css,/@media\(max-width:440px\)/);
 assert.match(css,/digiy-trust-stat--value/);
});
