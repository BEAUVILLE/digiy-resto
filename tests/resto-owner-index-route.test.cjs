'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const entre2=fs.readFileSync(path.join(root,'fiche-lentre2.html'),'utf8');
const malraux=fs.readFileSync(path.join(root,'fiche-le-malraux.html'),'utf8');
const source=html.match(/<script>\s*\/\* RESTO INDEX[\s\S]*?<\/script>/);
assert.ok(source,'The index must contain the isolated owner auth callback');
const script=source[0].replace(/^<script>/,'').replace(/<\/script>$/,'');

async function simulate({search='',hash='',pending='',session=true}={}){
 const current=new Map();
 if(pending)current.set('digiy_resa_owner_site',pending);
 const data={redirect:null,clientCreated:0,removed:[],tries:0};
 const location={
   search,hash,
   replace(value){data.redirect=value;}
 };
 const localStorage={
   getItem(key){return current.get(key)||null;},
   removeItem(key){data.removed.push(key);current.delete(key);}
 };
 const window={supabase:{createClient(){data.clientCreated++;return {auth:{
   async getSession(){data.tries++;return {data:{session:session?{user:{id:'mock-owner'}}:null}};}
 }};}}};
 const timers=[];
 vm.runInNewContext(script,{
   window,location,URLSearchParams,encodeURIComponent,localStorage,
   setTimeout(fn){timers.push(fn);}
 },{timeout:1500});
 for(let i=0;i<12;i++){
   await new Promise(resolve=>setImmediate(resolve));
   if(!timers.length)break;
   timers.splice(0).forEach(fn=>fn());
 }
 await new Promise(resolve=>setImmediate(resolve));
 return data;
}

test('public RESTO index is never redirected for ordinary visitors',async()=>{
 const result=await simulate();
 assert.equal(result.redirect,null);
 assert.equal(result.clientCreated,0);
});
test('L’Entre 2 login callback returns to its OWN gate, not index or TEST SALY',async()=>{
 const result=await simulate({search:'?site=entre2-sarlat&code=mock-token'});
 assert.equal(result.redirect,'/resa-resto/acces-proprietaire.html?site=entre2-sarlat');
 assert.equal(result.clientCreated,1);
});
test('Le Malraux callback preserves its own restaurant',async()=>{
 const result=await simulate({search:'?site=le-malraux-sarlat&code=mock-token'});
 assert.equal(result.redirect,'/resa-resto/acces-proprietaire.html?site=le-malraux-sarlat');
});
test('unidentified auth return never silently selects a restaurant test',async()=>{
 const result=await simulate({search:'?code=mock-token'});
 assert.equal(result.redirect,null);
 assert.equal(result.clientCreated,0);
});
test('unknown requested site is refused even if stale TEST SALY is stored',async()=>{
 const result=await simulate({search:'?site=invalid-sarlat&code=mock-token',pending:'test-resa-resto-saly'});
 assert.equal(result.redirect,null);
 assert.equal(result.clientCreated,0);
});
test('legacy saved site may return only to the matching authorization gate',async()=>{
 const result=await simulate({pending:'le-malraux-sarlat'});
 assert.equal(result.redirect,'/resa-resto/acces-proprietaire.html?site=le-malraux-sarlat');
 assert.deepEqual(result.removed,['digiy_resa_owner_site']);
});
test('no authenticated session does not direct a visitor into management',async()=>{
 const result=await simulate({search:'?site=entre2-sarlat&code=mock-token',session:false});
 assert.equal(result.redirect,null);
 assert.equal(result.tries,8);
});
test('public index shows the exact owner link under each real restaurant',()=>{
 const slugs=['entre2-sarlat','le-malraux-sarlat'];
 for(const slug of slugs){
   assert.ok(html.includes('href="resa-resto/acces-proprietaire.html?site='+slug+'"'));
   assert.ok(html.includes('aria-label="Accès propriétaire sécurisé '+slug+'"'));
 }
 assert.ok(!html.includes('PROPRIÉTAIRE TEST SALY'));
 assert.ok(!html.includes('PROPRIÉTAIRE TEST SARLAT'));
 assert.ok(!html.includes("pending||'test-resa-resto-saly'"));
 assert.ok(html.includes('href="fiche-lentre2.html"'));
 assert.ok(html.includes('href="fiche-le-malraux.html"'));
});
test('the two fiches retain owner access with correct, distinct slugs',()=>{
 assert.ok(entre2.includes('href="./resa-resto/acces-proprietaire.html?site=entre2-sarlat"'));
 assert.ok(malraux.includes('href="./resa-resto/acces-proprietaire.html?site=le-malraux-sarlat"'));
});
test('L’Entre 2 cannot become magically connected by changing the index route',()=>{
 const access=fs.readFileSync(path.join(root,'resa-resto/acces-proprietaire.html'),'utf8');
 assert.ok(access.includes("const needsOwnerOnboarding=new Set(['entre2-sarlat'])"));
 assert.ok(access.includes("const eligible=()=>allowed.has(site)&&!needsOwnerOnboarding.has(site)"));
});
