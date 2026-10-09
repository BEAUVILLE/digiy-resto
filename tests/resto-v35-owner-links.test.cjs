'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'resa-resto/ma-carte.html'),'utf8');
const management=fs.readFileSync(path.join(root,'resa-resto/gestion.html'),'utf8');
const entre2=fs.readFileSync(path.join(root,'fiche-lentre2.html'),'utf8');
const malraux=fs.readFileSync(path.join(root,'fiche-le-malraux.html'),'utf8');
const access=fs.readFileSync(path.join(root,'resa-resto/acces-proprietaire.html'),'utf8');
const script=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
assert.ok(script.includes('async function init()'));

function element(){return {href:'',src:'',hidden:false,textContent:'',attributes:{},events:{},
 addEventListener(k,fn){this.events[k]=fn},setAttribute(k,v){this.attributes[k]=v}}}
async function simulate(slug,userId,ownerId){
 const ids=['back','loginLink','loading','allowed','previewWrapper','denialText','denied','restaurantTitle',
 'menuPrototype','cartePrototype','weeklyMode','regularMode'];
 const nodes=Object.fromEntries(ids.map(id=>[id,element()]));
 nodes.denied.hidden=true;nodes.allowed.hidden=true;nodes.previewWrapper.hidden=true;
 const events=[];
 const auth={
  getUser:async()=>{events.push('auth');return {data:{user:userId?{id:userId}:null},error:null}}
 };
 const query={
  maybeSingle:async()=>{events.push('select');return {data:ownerId?{id:'test-id',slug,owner_id:ownerId,display_name:'Restaurant fictif',timezone:'Africa/Dakar'}:null,error:null}}
 };
 const supabase={createClient:()=>({auth,from:(name)=>{
  events.push('table:'+name);
  return {select:()=>({eq:()=>query})};
 }})};
 const ctx={URLSearchParams,location:{search:'?site='+encodeURIComponent(slug)},
  document:{getElementById:id=>nodes[id]},supabase};
 vm.runInNewContext(script,ctx,{timeout:1000});
 await new Promise(resolve=>setImmediate(resolve));
 return {nodes,events};
}
test('authenticated test Saly management displays a site-specific owner shortcut',()=>{
 assert.match(management,/id="ma-carte"/);
 assert.match(management,/🥡 Ma carte, mes plats &amp; l’emporter/);
 assert.match(management,/id="maCarteLink"/);
 assert.match(management,/ma-carte\.html\?site='\+encodeURIComponent\(SITE_SLUG\)/);
 assert.match(management,/Préversion de test/);
});
test('ma-carte denies anonymous sessions without loading any editor',async()=>{
 const r=await simulate('test-resa-resto-saly',null,'owner-A');
 assert.equal(r.nodes.allowed.hidden,true);
 assert.equal(r.nodes.previewWrapper.hidden,true);
 assert.equal(r.nodes.menuPrototype.src,'');
 assert.match(r.nodes.denialText.textContent,/Connectez-vous/);
 assert.deepEqual(r.events,['auth']);
});
test('ma-carte refuses user B trying the URL of restaurant A',async()=>{
 const r=await simulate('test-resa-resto-saly','owner-B','owner-A');
 assert.equal(r.nodes.previewWrapper.hidden,true);
 assert.equal(r.nodes.menuPrototype.src,'');
 assert.match(r.nodes.denialText.textContent,/pas rattaché/);
 assert.deepEqual(r.events,['auth','table:digiy_resa_resto_sites','select']);
});
test('confirmed owner can open only a local mock preview without publication',async()=>{
 const r=await simulate('test-resa-resto-saly','owner-A','owner-A');
 assert.equal(r.nodes.allowed.hidden,false);
 assert.equal(r.nodes.previewWrapper.hidden,false);
 assert.match(r.nodes.restaurantTitle.textContent,/Restaurant fictif/);
 assert.equal(r.nodes.menuPrototype.src,'../prototypes/resto-v35-ma-semaine.html?timezone=Africa%2FDakar');
 assert.equal(r.nodes.cartePrototype.src,'../prototypes/resto-v35-plats-salades.html?timezone=Africa%2FDakar');
 r.nodes.regularMode.events.click();
 assert.equal(r.nodes.menuPrototype.hidden,true);
 assert.equal(r.nodes.cartePrototype.hidden,false);
 r.nodes.weeklyMode.events.click();
 assert.equal(r.nodes.menuPrototype.hidden,false);
 assert.equal(r.nodes.cartePrototype.hidden,true);
 assert.ok(!/\.insert\(|\.update\(|\.delete\(|\.rpc\(/.test(script));
});
test('missing or unknown site never silently defaults to TEST SALY',async()=>{
 const r=await simulate('not-a-restaurant','owner-A','owner-A');
 assert.equal(r.nodes.previewWrapper.hidden,true);
 assert.equal(r.nodes.menuPrototype.src,'');
 assert.deepEqual(r.events,[]);
 assert.match(r.nodes.denialText.textContent,/non reconnu/);
 assert.ok(access.includes("if(!allowed.has(site))site=''"));
});
test('both real restaurant fiches show their own owner access, never shared or test',()=>{
 assert.match(entre2,/href="\.\/resa-resto\/acces-proprietaire\.html\?site=entre2-sarlat"/);
 assert.match(malraux,/href="\.\/resa-resto\/acces-proprietaire\.html\?site=le-malraux-sarlat"/);
 assert.ok(!entre2.includes('acces-proprietaire.html?site=test-resa-resto-saly'));
 assert.ok(!malraux.includes('acces-proprietaire.html?site=test-resa-resto-saly'));
 assert.match(entre2,/le rattachement et l’email de gestion/);
 assert.match(malraux,/rattachement/);
});
test('never promise a functional restaurant menu editor or live takeaway order',()=>{
 assert.match(html,/sans sauvegarde/);
 assert.match(html,/Ni la carte publique, ni les réservations, ni l’emporter ne sont modifiés/);
 assert.ok(!html.includes('service_role'));
 assert.ok(!html.includes("claim_site_by_email"));
});
