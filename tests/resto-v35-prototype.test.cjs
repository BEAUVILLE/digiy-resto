'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const core=require('../src/resto-v35-weekly-core.js');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'prototypes/resto-v35-ma-semaine.html'),'utf8');
const code=fs.readFileSync(path.join(root,'prototypes/resto-v35-ma-semaine.js'),'utf8');

class FakeElement {
 constructor(tag='div'){this.tag=tag;this.children=[];this.events={};this.attributes={};this.value='';this.textContent='';this.hidden=false;this.disabled=false;this.style={};this.files=[];}
 setAttribute(k,v){this.attributes[k]=v;}
 removeAttribute(k){delete this.attributes[k];}
 append(...kids){this.children.push(...kids);}
 appendChild(kid){this.children.push(kid);}
 replaceChildren(...kids){this.children=kids;}
 addEventListener(name,fn){this.events[name]=fn;}
 reset(){}
}
function setup(){
 const ids=['formStatus','weekDate','timezone','photoPreview','dishPhoto','currency','dishForm','selection','week','dayDishes','price','dishName','dishDescription','service','publicPreview','previewBtn','clearBtn'];
 const nodes=Object.fromEntries(ids.map(id=>[id,new FakeElement()]));
 nodes.timezone.value='Europe/Paris';nodes.currency.value='EUR';nodes.service.value='lunch';
 const createdURLs=[],revokedURLs=[];
 const FakeDate=class extends Date{
   constructor(...args){super(...(args.length?args:['2026-10-09T10:00:00Z']))}
   static now(){return new Date('2026-10-09T10:00:00Z').getTime()}
 };
 const window={DigiyWeeklyMenuCore:core,events:{},confirm:()=>true,addEventListener(name,fn){this.events[name]=fn;}};
 const context={window,document:{getElementById:id=>nodes[id],createElement:tag=>new FakeElement(tag)},URL:{
  createObjectURL(file){const url='blob:local-preview-'+createdURLs.length;createdURLs.push({file,url});return url;},
  revokeObjectURL(url){revokedURLs.push(url)}
 },Intl,Date:FakeDate,Set,Array,Number,Error,String};
 vm.runInNewContext(code,context,{timeout:2000});
 function dispatch(id,type='click',arg={}){
  const fn=nodes[id].events[type];
  assert.equal(typeof fn,'function',id+' event '+type);
  fn({preventDefault(){},...arg});
 }
 function treeText(node){
  if(typeof node==='string')return node;
  return String(node.textContent||'')+' '+(node.children||[]).map(treeText).join(' ');
 }
 return {nodes,dispatch,createdURLs,revokedURLs,window,treeText};
}
test('prototype is nonpublished, offline, and has no hidden authorization',()=>{
 assert.match(html,/MAQUETTE DE PRÉPARATION — NON CONNECTÉE/);
 assert.match(html,/PUBLIER SUR MA FICHE<\/button>/);
 assert.match(html,/<button[^>]+disabled[^>]+aria-describedby="publishWarning"/);
 assert.match(html,/input id="dishPhoto" type="file"/);
 assert.match(html,/value="Africa\/Dakar"/);
 assert.match(html,/value="XOF"/);
 assert.ok(!/(?:fetch\s*\(|XMLHttpRequest|localStorage\s*\.|supabase\s*\.|service_role\s*\.|\.rpc\s*\(|wa\.me\/|checkout|navigator\.sendBeacon)/i.test(code));
});
test('first screen has seven day tabs, today selected, no fictitious plate',()=>{
 const h=setup();
 assert.equal(h.nodes.week.children.length,7);
 assert.equal(h.nodes.selection.textContent.includes('2026-10-09'),true);
 assert.equal(h.nodes.week.children[4].attributes['aria-pressed'],'true');
 assert.match(h.treeText(h.nodes.dayDishes),/Aucun plat ajouté/);
});
test('owner can build a two-meal weekly draft and preview without saving',()=>{
 const h=setup();
 h.nodes.dishName.value='Plat de test';
 h.nodes.price.value='16.50';h.nodes.dishDescription.value='Test description';
 h.dispatch('dishForm','submit');
 assert.match(h.treeText(h.nodes.dayDishes),/Plat de test/);
 assert.match(h.treeText(h.nodes.dayDishes),/16,50/);
 h.nodes.service.value='dinner';h.nodes.dishName.value='Autre plat test';
 h.nodes.currency.value='XOF';h.nodes.price.value='3000';
 h.dispatch('dishForm','submit');
 assert.equal(h.nodes.dayDishes.children.length,2);
 h.dispatch('previewBtn');
 const rendered=h.treeText(h.nodes.publicPreview);
 assert.match(rendered,/Ven/);
 assert.match(rendered,/Plat de test/);
 assert.match(rendered,/Autre plat test/);
 assert.match(rendered,/APERÇU UNIQUEMENT/);
 h.dispatch('clearBtn');
 assert.match(h.treeText(h.nodes.dayDishes),/Aucun plat ajouté/);
});
test('selected photo stays on this device and follows the right dish',()=>{
 const h=setup();
 h.nodes.dishPhoto.files=[{type:'image/webp',size:950,name:'photo.webp'}];
 h.dispatch('dishPhoto','change');
 assert.equal(h.nodes.photoPreview.hidden,false);
 assert.equal(h.nodes.photoPreview.src,'blob:local-preview-0');
 h.nodes.dishName.value='Test photographie';h.dispatch('dishForm','submit');
 assert.equal(h.nodes.dayDishes.children[0].children[0].src,'blob:local-preview-0');
 h.dispatch('previewBtn');
 assert.match(h.treeText(h.nodes.publicPreview),/Test photographie/);
 assert.equal(h.revokedURLs.length,0);
 h.dispatch('clearBtn');
 assert.ok(h.revokedURLs.includes('blob:local-preview-0'));
});
test('disallowed photo type, oversized photo and XOF decimal are rejected',()=>{
 const h=setup();
 h.nodes.dishPhoto.files=[{type:'image/svg+xml',size:150,name:'active.svg'}];
 h.dispatch('dishPhoto','change');
 assert.match(h.nodes.formStatus.textContent,/Photo refusée/);
 assert.equal(h.createdURLs.length,0);
 h.nodes.dishPhoto.files=[{type:'image/png',size:5*1024*1024,name:'big.png'}];
 h.dispatch('dishPhoto','change');
 assert.equal(h.createdURLs.length,0);
 h.nodes.dishName.value='Prix invalide';h.nodes.currency.value='XOF';h.nodes.price.value='12.50';
 h.dispatch('dishForm','submit');
 assert.match(h.nodes.formStatus.textContent,/entier/);
 assert.equal(h.nodes.dayDishes.children.length,1);
});
test('hostile plate text never enters HTML interpretation',()=>{
 const h=setup();
 h.nodes.dishName.value='<img src=x onerror=alert(1)>';
 h.dispatch('dishForm','submit');
 assert.match(h.treeText(h.nodes.dayDishes),/<img src=x onerror=alert\(1\)>/);
 h.dispatch('previewBtn');
 assert.match(h.treeText(h.nodes.publicPreview),/<img src=x onerror=alert\(1\)>/);
 assert.ok(!code.includes('.innerHTML'));
});
test('switching weekdays does not lose or reassign draft plates',()=>{
 const h=setup();
 h.nodes.week.children[5].events.click();
 assert.equal(h.nodes.selection.textContent.includes('2026-10-10'),true);
 h.nodes.dishName.value='Samedi test';h.dispatch('dishForm','submit');
 h.nodes.week.children[4].events.click();
 assert.match(h.treeText(h.nodes.dayDishes),/Aucun plat ajouté/);
 h.nodes.week.children[5].events.click();
 assert.match(h.treeText(h.nodes.dayDishes),/Samedi test/);
});
