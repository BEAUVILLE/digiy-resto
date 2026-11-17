const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source=fs.readFileSync(path.join(__dirname,'../assets/resto-public-world10.js'),'utf8');
function fakePage(route, items) {
  const host='https://resto.digiylyfe.com';
  const location={
    href: host + route,
    origin: host,
    hostname: 'resto.digiylyfe.com',
    pathname: route.split('?')[0],
    search: route.includes('?') ? '?' + route.split('?')[1] : ''
  };
  const anchor={
    attrs:{href:'/resa-resto/index.html?site=le-malraux-sarlat'},
    matches(){return false},
    getAttribute(k){return this.attrs[k]},
    setAttribute(k,v){this.attrs[k]=v}
  };
  const nodes=items.map(item=>{
    const parent={
      id:item.id||'',
      tagName:item.tagName||'SPAN',
      closest(selector) {
        if(item.kind==='business' && selector.includes('#title, #intro'))return {};
        if(item.kind==='sold' && selector==='.sold')return {};
        if(item.kind==='sold' && selector.includes('.dish-name'))return {};
        if(item.kind==='success' && selector==='#success')return {};
        return null;
      }
    };
    return {nodeValue:item.text,parentElement:parent};
  });
  const doc={
    readyState:'complete',
    title:route.startsWith('/menu-qr')?'Carte du restaurant · DIGIY RESTO':'RESA RESTO — Réserver une table',
    documentElement:{lang:'fr',dir:'ltr',dataset:{}},
    body:{},
    getElementById(id){return id==='langs'?{}:null},
    querySelector(){return null},
    querySelectorAll(selector){return selector==='a[href]'?[anchor]:[]},
    createTreeWalker(){
      let i=-1;
      return {
        currentNode:null,
        nextNode(){i+=1;if(i>=nodes.length)return false;this.currentNode=nodes[i];return true}
      };
    }
  };
  const storage={};
  const sandbox={
    document:doc,location,URL,URLSearchParams,
    NodeFilter:{SHOW_TEXT:4},
    MutationObserver:class{observe(){}},
    localStorage:{getItem(k){return storage[k]||null},setItem(k,v){storage[k]=v}},
    history:{replaceState(){}},
  };
  sandbox.window=sandbox;
  vm.runInNewContext(source,sandbox,{timeout:3000});
  return {api:sandbox.DIGIY_RESTO_PUBLIC_WORLD10,doc,nodes,anchor,storage};
}

test('WORLD10 changes QR menu chrome but preserves published dish content and restaurant site',()=>{
  const page=fakePage('/menu-qr.html?site=le-malraux-sarlat',[
    {text:'Chargement de la carte publiée…',id:'status'},
    {text:'Pizzeria',kind:'business'},
    {text:' · Épuisé / indisponible',kind:'sold'},
    {text:'Version publiée le 17/11/2026',id:'published'},
  ]);
  assert.equal(page.api.locales.length,10);
  page.api.setLang('en');
  assert.equal(page.nodes[0].nodeValue,'Loading published menu…');
  assert.equal(page.nodes[1].nodeValue,'Pizzeria','Business-owned dish text must not change');
  assert.equal(page.nodes[2].nodeValue,' · Sold out / unavailable');
  assert.equal(page.nodes[3].nodeValue,'Version published on 17/11/2026');
  let url=new URL(page.anchor.attrs.href);
  assert.equal(url.searchParams.get('site'),'le-malraux-sarlat');
  assert.equal(url.searchParams.get('lang'),'en');
  page.api.setLang('ar');
  assert.equal(page.doc.documentElement.dir,'rtl');
  assert.equal(page.nodes[1].nodeValue,'Pizzeria');
  assert.match(page.nodes[0].nodeValue,/[\u0600-\u06ff]/);
  assert.equal(page.api.getLang(),'ar');
});

test('WORLD10 translates booking status fragments but never fabricates a real reservation',()=>{
  const page=fakePage('/resa-resto/index.html?site=le-malraux-sarlat',[
    {text:'Réservation confirmée.',kind:'success'},
    {text:'2 personnes · 2026-11-18 · 12:30',kind:'success'},
    {text:'Votre réservation est garantie 15 minutes après l’heure choisie.',kind:'success'},
    {text:'Jours de fermeture habituels : lundi, dimanche.',id:'closedInfo'},
    {text:'Le Malraux',kind:'business'},
    {text:'Créneau disponible · 12:30',id:'slotsMeta'}
  ]);
  page.api.setLang('en');
  assert.equal(page.nodes[0].nodeValue,'Booking confirmed.');
  assert.equal(page.nodes[1].nodeValue,'2 guests · 2026-11-18 · 12:30');
  assert.equal(page.nodes[2].nodeValue,'Your booking is held for 15 minutes after the selected time.');
  assert.equal(page.nodes[3].nodeValue,'Regular closing days: Monday, Sunday.');
  assert.equal(page.nodes[4].nodeValue,'Le Malraux');
  assert.equal(page.nodes[5].nodeValue,'Slot available · 12:30');
  page.api.setLang('zh');
  assert.match(page.nodes[0].nodeValue,/[\u4e00-\u9fff]/);
  assert.equal(page.nodes[4].nodeValue,'Le Malraux');
});
