'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'prototypes/resto-v35-plats-salades-apercu-valide.html'),'utf8');
const script=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
const owner=fs.readFileSync(path.join(root,'resa-resto/ma-carte.html'),'utf8');
class FakeElement {
 constructor(tag='div'){
  this.tag=tag;this.children=[];this.events={};this.attributes={};
  this.textContent='';this.value='';this.hidden=false;this.files=[];
  this.style={};this.src='';
 }
 append(...items){this.children.push(...items)}
 appendChild(item){this.children.push(item)}
 replaceChildren(...items){this.children=items}
 addEventListener(name,cb){this.events[name]=cb}
 setAttribute(name,val){this.attributes[name]=val}
 removeAttribute(name){delete this.attributes[name]}
 reset(){}
}
function setup(zone='Africa/Dakar'){
 const ids=['dishForm','category','currency','dishTitle','dishDescription','price','photo',
  'photoPreview','editorStatus','items','count','publicPreview','preview','previewBtn','clearBtn'];
 const nodes=Object.fromEntries(ids.map(id=>[id,new FakeElement()]));
 nodes.category.value='plats';nodes.currency.value='XOF';
 const created=[],revoked=[];
 const window={
  location:{search:'?timezone='+encodeURIComponent(zone)},
  events:{},addEventListener(k,fn){this.events[k]=fn}
 };
 const URL={
  createObjectURL(file){const url='blob:local-'+created.length;created.push(url);return url},
  revokeObjectURL(url){revoked.push(url)}
 };
 const document={
  getElementById(id){if(!nodes[id])throw Error('unknown node '+id);return nodes[id]},
  createElement(tag){return new FakeElement(tag)}
 };
 vm.runInNewContext(script,{window,document,URL,URLSearchParams,Intl,Set,Number,String,Error,
  confirm:()=>true},{timeout:2000});
 const dispatch=(id,type='click')=>{
  assert.equal(typeof nodes[id].events[type],'function');
  nodes[id].events[type]({preventDefault(){}});
 };
 const treeText=n=>String(n.textContent||'')+' '+(n.children||[]).map(treeText).join(' ');
 return {nodes,dispatch,created,revoked,treeText};
}
test('rendu approuvé est bien celui de l’espace propriétaire',()=>{
 assert.match(owner,/resto-v35-plats-salades-apercu-valide\.html\?timezone=/);
 assert.match(owner,/owner_id!==user\.id/);
 assert.match(owner,/auth\.getUser\(\)/);
 assert.match(html,/👁 VOIR COMME UN CLIENT/);
 assert.match(html,/Plats &amp; salades à la carte/);
 assert.match(html,/ESSAI INTERACTIF — NON PUBLIÉ/);
 assert.match(html,/<button type="button" class="btn primary" disabled>PUBLIER SUR MA FICHE<\/button>/);
});
test('l’aperçu n’envoie aucune donnée et ne commande jamais',()=>{
 assert.doesNotMatch(script,/fetch\s*\(|XMLHttpRequest|\.rpc\s*\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|localStorage|indexedDB|wa\.me|checkout|service_role|\.innerHTML|navigator\.sendBeacon/);
 assert.match(html,/Aucune caisse, aucune formule, aucune commande/);
});
test('la carte est initialement vide et le fuseau pilote la devise',()=>{
 const saly=setup('Africa/Dakar');
 assert.equal(saly.nodes.currency.value,'XOF');
 assert.match(saly.treeText(saly.nodes.items),/Aucun plat ou salade ajouté/);
 assert.equal(saly.nodes.count.textContent,'0 élément');
 assert.equal(setup('Europe/Paris').nodes.currency.value,'EUR');
});
test('plat et salade puis aperçu comme client, sans publication',()=>{
 const h=setup();
 h.nodes.dishTitle.value='Plat de démonstration';
 h.nodes.price.value='2500';
 h.nodes.dishDescription.value='Préparation témoin';
 h.dispatch('dishForm','submit');
 assert.match(h.treeText(h.nodes.items),/Plat de démonstration/);
 assert.match(h.treeText(h.nodes.items),/2\s?500/);
 h.nodes.category.value='salades';
 h.nodes.dishTitle.value='Salade de démonstration';
 h.nodes.price.value='1500';
 h.dispatch('dishForm','submit');
 assert.match(h.treeText(h.nodes.items),/Salades/);
 assert.match(h.treeText(h.nodes.items),/Salade de démonstration/);
 h.dispatch('previewBtn');
 assert.equal(h.nodes.publicPreview.hidden,false);
 assert.match(h.treeText(h.nodes.preview),/Plat de démonstration/);
 assert.match(h.treeText(h.nodes.preview),/Salade de démonstration/);
 h.dispatch('clearBtn');
 assert.match(h.treeText(h.nodes.items),/Aucun plat ou salade ajouté/);
});
test('photos locales, tailles et types contrôlés, URLs révoquées',()=>{
 const h=setup();
 h.nodes.photo.files=[{type:'image/webp',size:860,name:'photo.webp'}];
 h.dispatch('photo','change');
 assert.equal(h.nodes.photoPreview.src,'blob:local-0');
 h.nodes.dishTitle.value='Plat photographié';
 h.dispatch('dishForm','submit');
 assert.equal(h.revoked.length,0);
 h.dispatch('clearBtn');
 assert.deepEqual(h.revoked,['blob:local-0']);
 h.nodes.photo.files=[{type:'image/svg+xml',size:120,name:'unsafe.svg'}];
 h.dispatch('photo','change');
 assert.match(h.nodes.editorStatus.textContent,/Photo refusée/);
 assert.equal(h.created.length,1);
});
test('texte hostile reste littéral et les prix invalides sont refusés',()=>{
 const h=setup();
 h.nodes.dishTitle.value='Test FCFA';
 h.nodes.price.value='12.50';
 h.dispatch('dishForm','submit');
 assert.match(h.nodes.editorStatus.textContent,/entier/);
 h.nodes.price.value='1200';
 h.nodes.dishTitle.value='<img src=x onerror=alert(1)>';
 h.dispatch('dishForm','submit');
 h.dispatch('previewBtn');
 assert.match(h.treeText(h.nodes.preview),/<img src=x onerror=alert\(1\)>/);
});
