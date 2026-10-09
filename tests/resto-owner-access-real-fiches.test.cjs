'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const ficheEntre2=fs.readFileSync(path.join(root,'fiche-lentre2.html'),'utf8');
const ficheMalraux=fs.readFileSync(path.join(root,'fiche-le-malraux.html'),'utf8');
const login=fs.readFileSync(path.join(root,'resa-resto/acces-proprietaire.html'),'utf8');
const gestion=fs.readFileSync(path.join(root,'resa-resto/gestion.html'),'utf8');
const source=login.slice(login.lastIndexOf('<script>')+8,login.lastIndexOf('</script>'));
assert.match(source,/createClient/);

function mockClassList(){
  const classes=new Set();
  return {toggle(name,enabled){if(enabled)classes.add(name);else classes.delete(name);},add(name){classes.add(name);},remove(name){classes.delete(name);},contains(name){return classes.has(name);}};
}
function node(site){
  const events={},attributes={};
  return {
    dataset:{site},disabled:false,value:'',events,attributes,
    classList:mockClassList(),
    addEventListener(type,fn){events[type]=fn;},
    setAttribute(k,v){attributes[k]=v;},
  };
}
function boot(query){
  const names=['test-resa-resto-saly','modele-resa-resto-sarlat','entre2-sarlat','le-malraux-sarlat'];
  const sites=names.map(node);
  const controls=Object.fromEntries(['status','send','verify','otp','otpBox','email'].map(id=>[id,node('')]));
  const calls={otp:[],redirects:[],getSession:0};
  const loc={
    origin:'https://resto.digiylyfe.com',
    pathname:'/resa-resto/acces-proprietaire.html',
    search:query,
    replace(url){calls.redirects.push(url);}
  };
  const db={auth:{
    async getSession(){calls.getSession++;return {data:{session:null}}},
    async signInWithOtp(args){calls.otp.push(args);return {error:null}},
    async verifyOtp(){return {data:{session:null},error:null}},
    onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}}}
  }};
  const context={
    supabase:{createClient(){return db}},
    document:{
      getElementById(id){assert.ok(controls[id],id);return controls[id];},
      querySelectorAll(selector){assert.equal(selector,'.site');return sites;}
    },
    location:loc,
    history:{replaceState(_a,_b,url){calls.urlUpdate=url}},
    URLSearchParams,Set,String,encodeURIComponent,
    setTimeout(fn){fn()},
  };
  vm.runInNewContext(source,context,{timeout:2500});
  return {sites,controls,calls};
}
test('visible owner buttons link to the exact independently managed restaurant',()=>{
 assert.match(ficheEntre2,/class="btn owner" href="\.\/resa-resto\/acces-proprietaire\.html\?site=entre2-sarlat"/);
 assert.match(ficheMalraux,/class="btn owner" href="\.\/resa-resto\/acces-proprietaire\.html\?site=le-malraux-sarlat"/);
 assert.match(ficheEntre2,/🔐 ACCÈS PROPRIÉTAIRE/);
 assert.match(ficheMalraux,/🔐 ACCÈS PROPRIÉTAIRE/);
 assert.ok(!ficheEntre2.includes('acces-proprietaire.html?site=le-malraux-sarlat'));
 assert.ok(!ficheMalraux.includes('acces-proprietaire.html?site=entre2-sarlat'));
});
test('owner landing recognizes real restaurants and preserves test choices',()=>{
 for(const slug of ['entre2-sarlat','le-malraux-sarlat','modele-resa-resto-sarlat','test-resa-resto-saly']){
  assert.ok(login.includes('data-site="'+slug+'"'));
 }
 assert.match(gestion,/GESTION PROPRIÉTAIRE · SARLAT/);
 assert.match(gestion,/🍽️ L’ENTRE 2 · SARLAT/);
 assert.match(gestion,/🍽️ LE MALRAUX · SARLAT/);
});
test('unknown slug does not fall back to an owner test account or request an OTP',async()=>{
 const h=boot('?site=wrong-or-another-restaurant');
 assert.equal(h.controls.send.disabled,true);
 assert.match(h.controls.status.textContent,/Sélectionnez votre restaurant/);
 assert.ok(h.sites.every(x=>x.attributes['aria-pressed']==='false'));
 assert.equal(h.calls.getSession,0);
 h.controls.email.value='contact@example.test';
 await h.controls.send.events.click();
 assert.equal(h.calls.otp.length,0);
 assert.equal(h.calls.redirects.length,0);
 assert.ok(!login.includes("if(!allowed.has(site))site='test-resa-resto-saly'"));
});
test('missing site never defaults to Saly test',()=>{
 const h=boot('');
 assert.equal(h.controls.send.disabled,true);
 assert.equal(h.calls.getSession,0);
 assert.equal(h.calls.redirects.length,0);
});
test('L’Entre 2 owner not provisioned: show status, block all email attempts',async()=>{
 const h=boot('?site=entre2-sarlat');
 assert.equal(h.controls.send.disabled,true);
 assert.equal(h.controls.verify.disabled,true);
 assert.match(h.controls.status.textContent,/rattachement/);
 assert.equal(h.sites[2].attributes['aria-pressed'],'true');
 h.controls.email.value='anything@example.test';
 await h.controls.send.events.click();
 assert.equal(h.calls.otp.length,0);
 assert.equal(h.calls.getSession,0);
});
test('Le Malraux has a correctly scoped OTP path, no account creation',async()=>{
 const h=boot('?site=le-malraux-sarlat');
 assert.equal(h.controls.send.disabled,false);
 assert.equal(h.sites[3].attributes['aria-pressed'],'true');
 h.controls.email.value='restaurant@example.test';
 await h.controls.send.events.click();
 assert.equal(h.calls.otp.length,1);
 const args=h.calls.otp[0];
 assert.equal(args.options.shouldCreateUser,false);
 assert.match(args.options.emailRedirectTo,/\?site=le-malraux-sarlat$/);
 assert.equal(h.calls.redirects.length,0);
});
test('changing restaurant clears typed email and changes the precise target',()=>{
 const h=boot('?site=le-malraux-sarlat');
 h.controls.email.value='one@example.test';
 h.sites[2].events.click();
 assert.equal(h.controls.email.value,'');
 assert.equal(h.controls.send.disabled,true);
 assert.equal(h.calls.urlUpdate,'/resa-resto/acces-proprietaire.html?site=entre2-sarlat');
 assert.equal(h.sites[2].attributes['aria-pressed'],'true');
 assert.equal(h.sites[3].attributes['aria-pressed'],'false');
});
test('public fiche displays direct contact and takeaway without an owner-login promise',()=>{
 assert.match(ficheEntre2,/href="tel:\+33673274427"/);
 assert.match(ficheMalraux,/href="tel:\+33642160657"/);
 assert.match(ficheEntre2,/DÉMONSTRATION NON ACTIVE/);
 assert.match(ficheMalraux,/Aucune commande à emporter ne peut être enregistrée ici/);
 assert.match(ficheEntre2,/Accès propriétaire en préparation/);
 assert.match(ficheMalraux,/rattachement du compte reste à confirmer/);
});
