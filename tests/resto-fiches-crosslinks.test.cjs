'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const cases=[
 {file:'fiche-le-malraux.html',label:'Le Malraux',phone:'+33642160657'},
 {file:'fiche-lentre2.html',label:'L’Entre 2',phone:'+33673274427'}
];
for(const info of cases){
 test(info.label+' has a real public DIGIY RESTO fiche, with visible direct-call button',()=>{
  const s=fs.readFileSync(path.join(root,info.file),'utf8');
  assert.match(s,/<html lang="fr">/);
  assert.match(s,/<main class="wrap">/);
  assert.match(s,/<h1>[^<]+<\/h1>/);
  assert.ok(!/http-equiv\s*=\s*["']refresh/i.test(s),'must not redirect on load');
  assert.ok(!/window\.location\.replace\(/.test(s),'must not JS redirect');
  assert.ok(s.includes('href="tel:'+info.phone+'"'),'direct call phone preserved');
  assert.ok(s.includes('href="https://malraux-entre2.digiylyfe.com/"'),'common site visible');
  assert.ok(s.includes('href="./index.html"'),'return to restaurant directory');
  assert.ok(index.includes('href="'+info.file+'"'),'DIGIY RESTO listing links to this exact fiche');
  assert.match(s,/0 % commission/);
 });
}
test('each RESTO listing exposes the fiche twice (photo and primary button)',()=>{
 for(const info of cases){
  assert.equal(index.split('href="'+info.file+'"').length-1,2,info.file);
 }
});
test('old shared-site links remain as separate VOIR LE SITE',()=>{
 assert.ok(index.includes('href="https://malraux-entre2.digiylyfe.com/"'));
 assert.ok(index.includes('data-i18n="site">VOIR LE SITE'));
});
test('no fake owner/booking engine introduced on fiche',()=>{
 for(const info of cases){
  const s=fs.readFileSync(path.join(root,info.file),'utf8');
  assert.ok(!s.includes('test-resa-resto-saly'));
  assert.ok(!s.includes('modele-resa-resto-sarlat'));
  assert.ok(!s.includes('supabase.createClient'));
 }
});
