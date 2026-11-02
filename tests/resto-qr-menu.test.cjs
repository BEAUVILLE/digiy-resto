'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const test=require('node:test');
const core=require('../src/resto-qr-menu-core.js');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('seul un slug canonique permet de consulter un menu',()=>{
 assert.equal(core.validSlug('entre2-sarlat'),true);
 for(const value of ['','../abc','<script>','RESTO','a','a?site=autre'])assert.equal(core.validSlug(value),false);
});
test('le brouillon nettoie les chaînes et limite les structures',()=>{
 const menu=core.normalize({title:' Mon resto ',currency:'INVALID',
   sections:[{name:'Desserts',items:[{name:' Crème ',price:'2000',available:false},
     {name:'Sans prix',price:'',available:true}]}]});
 assert.equal(menu.title,'Mon resto');assert.equal(menu.currency,'XOF');
 assert.equal(menu.sections[0].items[0].price,2000);
 assert.equal(menu.sections[0].items[0].available,false);
 assert.equal(menu.sections[0].items[1].price,null);
});
test('on ne peut publier sans titre et plat réel',()=>{
 assert.equal(core.publishable({title:'Test',sections:[]}).ok,false);
 assert.equal(core.publishable({title:'Test',sections:[{name:'Plats',items:[{name:''}]}]}).ok,false);
 const p=core.publishable({title:'Test',sections:[
  {name:'Plats',items:[{name:'Riz',price:2500},{name:'',price:9}]},
  {name:'',items:[{name:'Autre',price:10}]}
 ]});
 assert.equal(p.ok,true);assert.equal(p.menu.sections.length,1);
 assert.equal(p.menu.sections[0].items.length,1);
});
test('prix XOF, EUR, sans prix et numéros vérifiés',()=>{
 assert.match(core.formatPrice(2500,'XOF'),/2\s?500/);
 assert.match(core.formatPrice(12.5,'EUR'),/12,50/);
 assert.equal(core.formatPrice(null,'XOF'),'Prix sur demande');
 assert.equal(core.phoneDigits('+221 77 123 45 67'),'221771234567');
 assert.equal(core.phoneDigits('javascript:alert(1)'),'');
});
test('public ne lit jamais les brouillons et n’affiche que published',()=>{
 const html=read('menu-qr.html');
 assert.doesNotMatch(html,/digiy_resto_qr_drafts/);
 assert.match(html,/\.eq\('published',true\)/);
 assert.match(html,/textContent/);
 assert.doesNotMatch(html,/\.innerHTML\s*=/);
});
test('les plats inclus dans une formule ne s affichent pas comme prix sur demande',()=>{
 const html=read('menu-qr.html');
 assert.match(html,/section\.name\.startsWith\('Choix menu '\)\&\&item\.price===null/);
 assert.match(html,/Inclus dans la formule/);
});

test('éditeur vérifie identité ET ownership et publie explicitement',()=>{
 const html=read('resa-resto/ma-menu-qr.html');
 assert.match(html,/auth\.getUser\(\)/);
 assert.match(html,/s\.owner_id!==identity\.data\.user\.id/);
 assert.match(html,/digiy_resto_qr_drafts/);
 assert.match(html,/digiy_resto_qr_public/);
 assert.match(html,/async function publish\(/);
 assert.match(html,/async function pause\(/);
 assert.match(read('resa-resto/gestion.html'),/menuQrLink/);
});
test('SQL isole drafts des visiteurs et revérifie l’owner à chaque écriture',()=>{
 const sql=read('sql/20261102_resto_menu_qr_owner_public.sql');
 assert.match(sql,/digiy_resto_qr_drafts enable row level security/);
 assert.match(sql,/digiy_resto_qr_public enable row level security/);
 assert.match(sql,/grant select, insert, update on table public\.digiy_resto_qr_drafts to authenticated/);
 assert.doesNotMatch(sql,/grant\s+\S+\s+on\s+table\s+public\.digiy_resto_qr_drafts\s+to\s+anon/i);
 assert.match(sql,/using \(published = true\)/);
 assert.match(sql,/owner_id = \(select auth\.uid\(\)\)/);
 assert.match(sql,/with check \(exists/);
 assert.doesNotMatch(sql,/security definer/i);
});

test('site internet commun mais deux fiches, deux QR et deux espaces propriétaires',()=>{
 const malraux=read('fiche-le-malraux.html');
 const entre2=read('fiche-lentre2.html');
 assert.match(malraux,/https:\/\/malraux-entre2\.digiylyfe\.com\//);
 assert.match(entre2,/https:\/\/malraux-entre2\.digiylyfe\.com\//);
 assert.match(malraux,/acces-proprietaire\.html\?site=le-malraux-sarlat/);
 assert.match(entre2,/acces-proprietaire\.html\?site=entre2-sarlat/);
 const sql=read('sql/20261102_resto_menu_qr_owner_public.sql');
 assert.match(sql,/create unique index if not exists digiy_resto_malraux_entre2_owners_distinct_uq/);
 assert.match(sql,/slug in \('le-malraux-sarlat', 'entre2-sarlat'\)/);
 assert.match(sql,/owner_id is not null/);
 const integration=read('resa-resto/gestion.html');
 assert.match(integration,/ma-menu-qr\.html\?site=/);
 assert.match(integration,/<section class="panel" id="menu-qr-pro"/);
 assert.match(integration,/data-activation="supabase-menu-qr-20261102"/);
 assert.doesNotMatch(integration,/<section class="panel hidden" id="menu-qr-pro"/);
 assert.doesNotMatch(integration,/SITE_SLUG=\(new URLSearchParams\(location\.search\)\.get\('site'\)\|\|'modele-resa-resto-sarlat'\)/);
 assert.match(integration,/data\.owner_id!==session\.user\.id/);
});

test('scripts inline statiques compilent',()=>{
 for(const name of ['menu-qr.html','resa-resto/ma-menu-qr.html','resa-resto/gestion.html']){
  const html=read(name);
  for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
   if(match[1].trim())assert.doesNotThrow(()=>new vm.Script(match[1],{filename:name}));
  }
 }
});
