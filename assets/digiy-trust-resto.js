/* DIGIY TRUST RESTO — verified read-only public aggregate presentation.
 * No booking writes, no private review data, no public rating submission.
 * RESTO retains its independent tables/services/capacity reservation engine.
 * No rating is rendered unless a trusted server aggregate is deliberately supplied.
 */
(function(root){
 'use strict';
 const CRITERIA=Object.freeze([
  ['quality','Qualité de la prestation'],
  ['food_quality','Qualité des plats'],
  ['reliability','Ponctualité / fiabilité'],
  ['welcome','Accueil / attitude'],
  ['availability','Disponibilité'],
  ['proximity','Proximité / accessibilité'],
  ['followup','Suivi / fidélité']
 ]);
 const score=v=>typeof v==='number'&&Number.isFinite(v)&&v>=1&&v<=5;
 const count=v=>Number.isSafeInteger(v)&&v>0;
 const dec=v=>(Math.round(v*10)/10).toFixed(1);
 function interpretPublicAggregate(data){
  const none=()=>({verified:false,reason:'no_verified_aggregate',overall:null,valueForMoney:null,count:0,criteria:[]});
  // The status label does NOT prove verification; the future RESTO attestor/RPC
  // must authenticate evidence before it ever passes this object to the UI.
  if(!data||data.status!=='verified_public_aggregate'||!count(data.review_count)
    ||!score(data.overall_stars)||!score(data.value_for_money_stars))return none();
  const details=[];
  for(const [key,label] of CRITERIA){
   const item=data.criteria?.[key];
   if(item&&score(item.stars)&&count(item.count)&&item.count<=data.review_count){
    details.push({key,label,value:dec(item.stars),count:item.count});
   }
  }
  return {verified:true,overall:dec(data.overall_stars),valueForMoney:dec(data.value_for_money_stars),
   count:data.review_count,criteria:details};
 }
 function node(tag,cls,txt){
  const e=document.createElement(tag);if(cls)e.className=cls;
  if(txt!==undefined)e.textContent=txt;return e;
 }
 function render(target,aggregate){
  if(!target||typeof target.replaceChildren!=='function')throw Error('trust_restaurant_mount_required');
  const state=interpretPublicAggregate(aggregate);
  const h=node('h2','','⭐ DIGIY TRUST · Avis clients');
  const guidance=node('p','digiy-trust-hint','Des évaluations express par étoiles, après une prestation réellement effectuée et vérifiée. Aucun commentaire public.');
  target.replaceChildren(h,guidance);
  if(!state.verified){
   target.append(node('p','digiy-trust-empty','Pas encore d’évaluation vérifiée.'));
   target.append(node('p','digiy-trust-hint','Les notes apparaîtront uniquement après vérification des prestations et des clients.'));
   return state;
  }
  const metrics=node('div','digiy-trust-stats');
  const addMetric=(label,value,subtitle,extra)=>{
   const box=node('div','digiy-trust-stat'+(extra?' digiy-trust-stat--value':''));
   box.append(node('strong','',label));
   const out=node('output','',value+' / 5');out.setAttribute('aria-label',label+' '+value+' sur 5');
   box.append(out,node('small','',subtitle));metrics.append(box);
  };
  addMetric('Note générale',state.overall,state.count+' avis vérifié'+(state.count>1?'s':''),false);
  addMetric('Rapport qualité-prix',state.valueForMoney,'Valeur reçue, pas prix le plus bas',true);
  target.append(metrics);
  const breakdown=node('details','');
  breakdown.append(node('summary','','Voir le détail des critères'));
  if(state.criteria.length){
   const list=node('ul','');
   for(const c of state.criteria){
    list.append(node('li','',c.label+' : '+c.value+' / 5 ('+c.count+' note'+(c.count>1?'s':'')+')'));
   }breakdown.append(list);
  }else breakdown.append(node('p','digiy-trust-hint','Détail indisponible'));
  target.append(breakdown);
  return state;
 }
 function start(){
  for(const item of document.querySelectorAll('[data-digiy-trust-resto]'))render(item,null);
 }
 root.DIGIYTrustResto=Object.freeze({interpretPublicAggregate,render,criteria:CRITERIA});
 if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
 }
})(typeof window!=='undefined'?window:globalThis);
