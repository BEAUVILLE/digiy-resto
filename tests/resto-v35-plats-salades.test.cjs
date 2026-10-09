'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const page=fs.readFileSync(path.join(root,'prototypes/resto-v35-plats-salades.html'),'utf8');
const source=fs.readFileSync(path.join(root,'prototypes/resto-v35-plats-salades.js'),'utf8');
const owner=fs.readFileSync(path.join(root,'resa-resto/ma-carte.html'),'utf8');
const manager=fs.readFileSync(path.join(root,'resa-resto/gestion.html'),'utf8');

class FakeElement{
 constructor(tag='div'){
  this.tag=tag;this.children=[];this.events={};this.attributes={};
  this.value='';this.textContent='';this.hidden=false;
  this.style={};this.files=[];this.src='';
 }
 setAttribute(k,v){this.attributes[k]=v}
 removeAttribute(k){delete this.attributes[k]}
 append(...nodes){this.children.push(...nodes)}
 appendChild(child){this.children.push(child)}
 replaceChildren(...nodes){this.children=nodes}
 addEventListener(type,callback){this.events[type]=callback}
 reset(){}
}
function harness(zone='Europe/Paris'){
 const ids=['category','currency','dishTitle','dishDescription','price','photo','photoPreview',
  'dishForm','editorStatus','items','preview','previewBtn','clearBtn'];
 const nodes=Object.fromEntries(ids.map(id=>[id,new FakeElement()]));
 nodes.category.value='plats';nodes.currency.value='EUR';
 const created=[],revoked=[];
 const window={location:{search:'?timezone='+encodeURIComponent(zone)},confirm:()=>true,events:{},
  addEventListener(k,fn){this.events[k]=fn}};
 const URL={
  createObjectURL(file){const u='blob:local-photo-'+created.length;created.push({file,url:u});return u},
  revokeObjectURL(u){revoked.push(u)}
 };
 const document={
  getElementById(id){if(!nodes[id])throw Error('Missing '+id);return nodes[id]},
  createElement(tag){return new FakeElement(tag)}
 };
 vm.runInNewContext(source,{window,document,URL,URLSearchParams,Set,Array,Number,Error,String,Intl},{timeout:2000});
 const dispatch=(id,type='click')=>{
  const cb=nodes[id].events[type];
  assert.equal(typeof cb,'function',id+' '+type);
  cb({preventDefault(){}});
 };
 const textOf=n=>String(n.textContent||'')+' '+(n.children||[]).map(textOf).join(' ');
 return {nodes,dispatch,created,revoked,window,textOf};
}
test('Plats et Salades only; no formulas, menus, payments or publication',()=>{
 assert.match(page,/<option value="plats">Plats<\/option>/);
 assert.match(page,/<option value="salades">Salades<\/option>/);
 assert.doesNotMatch(page,/<option value="(?:menus|formules|boissons|desserts|pizzas)">/);
 assert.match(page,/BROUILLON TEMPORAIRE — NON PUBLIÉ/);
 assert.match(page,/<button class="primary" disabled type="button">PUBLIER SUR MA FICHE<\/button>/);
 assert.doesNotMatch(source,/(?:fetch\s*\(|XMLHttpRequest|localStorage\s*\.|indexedDB|supabase\s*\.|\.rpc\s*\(|wa\.me\/|navigator\.sendBeacon|\.innerHTML|checkout)/i);
});
test('Owner page keeps original verified site authorization before loading both editors',()=>{
 assert.match(owner,/client\.auth\.getUser\(\)/);
 assert.match(owner,/site\.owner_id!==user\.id/);
 assert.match(owner,/allowedSlugs\.has\(slug\)/);
 assert.match(owner,/cartePrototype/);
 assert.match(owner,/resto-v35-plats-salades-apercu-valide\.html\?timezone=/);
 assert.match(owner,/weeklyMode/);
 assert.match(owner,/regularMode/);
 assert.match(manager,/id="maCarteLink"/);
 assert.match(manager,/MES PLATS DU JOUR/);
 assert.match(manager,/MES PLATS &amp; SALADES/);
 assert.match(manager,/id="platsSaladesLink"/);
});
test('Empty carte has no fictional products',()=>{
 const t=harness();
 assert.match(t.textOf(t.nodes.items),/carte est encore vide/);
 assert.equal(t.nodes.currency.value,'EUR');
 assert.equal(t.created.length,0);
});
test('Plats and salads are independent undated entries with local preview',()=>{
 const t=harness('Africa/Dakar');
 assert.equal(t.nodes.currency.value,'XOF');
 t.nodes.dishTitle.value='Plat témoin';
 t.nodes.price.value='2500';
 t.nodes.dishDescription.value='Préparation locale';
 t.dispatch('dishForm','submit');
 assert.match(t.textOf(t.nodes.items),/Plat témoin/);
 assert.match(t.textOf(t.nodes.items),/2\s?500/);
 t.nodes.category.value='salades';
 t.nodes.dishTitle.value='Salade témoin';
 t.nodes.price.value='1500';
 t.dispatch('dishForm','submit');
 assert.match(t.textOf(t.nodes.items),/Salades/);
 assert.match(t.textOf(t.nodes.items),/Salade témoin/);
 t.dispatch('previewBtn');
 assert.match(t.textOf(t.nodes.preview),/APERÇU CLIENT — NON PUBLIÉ/);
 assert.match(t.textOf(t.nodes.preview),/Plat témoin/);
 assert.match(t.textOf(t.nodes.preview),/Salade témoin/);
 t.dispatch('clearBtn');
 assert.match(t.textOf(t.nodes.items),/carte est encore vide/);
});
test('Photos are local, validated and revoked when discarded',()=>{
 const t=harness();
 t.nodes.photo.files=[{type:'image/webp',size:900,name:'photo.webp'}];
 t.dispatch('photo','change');
 assert.equal(t.nodes.photoPreview.hidden,false);
 assert.equal(t.nodes.photoPreview.src,'blob:local-photo-0');
 t.nodes.dishTitle.value='Plat photographie';
 t.dispatch('dishForm','submit');
 assert.equal(t.nodes.items.children[0].children[1].children[0].src,'blob:local-photo-0');
 assert.equal(t.revoked.length,0);
 t.dispatch('clearBtn');
 assert.ok(t.revoked.includes('blob:local-photo-0'));
});
test('Invalid images, decimal FCFA and bad categories fail closed',()=>{
 const t=harness('Africa/Dakar');
 t.nodes.photo.files=[{type:'image/svg+xml',size:500,name:'x.svg'}];
 t.dispatch('photo','change');
 assert.equal(t.created.length,0);
 assert.match(t.nodes.editorStatus.textContent,/Photo refusée/);
 t.nodes.dishTitle.value='Test prix';
 t.nodes.price.value='12.50';
 t.dispatch('dishForm','submit');
 assert.match(t.nodes.editorStatus.textContent,/entier/);
 t.nodes.price.value='3000';
 t.nodes.category.value='formules';
 t.dispatch('dishForm','submit');
 assert.match(t.nodes.editorStatus.textContent,/Catégorie invalide/);
 assert.match(t.textOf(t.nodes.items),/carte est encore vide/);
});
test('Hostile product strings stay plain text, never HTML',()=>{
 const t=harness();
 t.nodes.dishTitle.value='<img src=x onerror=alert(1)>';
 t.dispatch('dishForm','submit');
 t.dispatch('previewBtn');
 assert.match(t.textOf(t.nodes.preview),/<img src=x onerror=alert\(1\)>/);
 assert.doesNotMatch(source,/\.innerHTML/);
});
