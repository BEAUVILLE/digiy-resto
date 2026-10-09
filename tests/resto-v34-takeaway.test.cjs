'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const core=require('../resa-resto/takeaway-core.js');

const source={restaurantSlug:'fictional-test-only',restaurantName:'Fictional Restaurant',
  enabled:true,ownerApproved:true,currency:'XOF',timezone:'Africa/Dakar',
  whatsapp:'+221771234567',phone:'+221771234567',preparationMinutes:30,
  pickupWindows:[{weekdays:[1,2,3,4,5,6,7],from:'12:00',to:'14:00'}],
  items:[{id:'plat-fictif',name:'Plat fictif (test uniquement)',priceMinor:3500,available:true},
    {id:'jus-fictif',name:'Jus fictif (test uniquement)',priceMinor:1000,available:true},
    {id:'indisponible',name:'Plat non disponible',priceMinor:2000,available:false}]};
const mockNow=new Date('2026-10-09T12:00:00.000Z');
const valid=()=>core.validate(structuredClone(source),source.restaurantSlug);

test('real deployed catalog is empty and refuses every restaurant',()=>{
  const s=fs.readFileSync(path.resolve(__dirname,'../resa-resto/takeaway-catalog.js'),'utf8');
  const ctx={window:{}};vm.runInNewContext(s,ctx);
  assert.deepEqual(Object.keys(ctx.window.DIGIY_TAKEAWAY_CATALOG),[]);
  assert.equal(core.validate(ctx.window.DIGIY_TAKEAWAY_CATALOG[source.restaurantSlug],source.restaurantSlug).ok,false);
});
test('owner must explicitly approve and opt in',()=>{
  assert.equal(valid().ok,true);
  for(const key of ['enabled','ownerApproved']){
    const x=structuredClone(source);x[key]=false;
    assert.equal(core.validate(x,source.restaurantSlug).ok,false,key);
  }
});
test('wrong restaurant, invalid timezone and invalid professional contacts fail closed',()=>{
  assert.equal(core.validate(source,'another-restaurant').ok,false);
  for(const update of [{timezone:'No/Timezone'},{whatsapp:'javascript:alert(1)'},{phone:'123456'},
    {whatsapp:null,phone:null},{currency:'BITCOIN'}]){
    const x={...structuredClone(source),...update};
    assert.equal(core.validate(x,source.restaurantSlug).ok,false,JSON.stringify(update));
  }
});
test('invalid, missing or invented menu data cannot activate a live offer',()=>{
  for(const items of [[],[{id:'injected',name:'Not real',priceMinor:NaN,available:true}],
    [{id:'weird name!',name:'Dish',priceMinor:1200,available:true}],
    [{id:'sold-out',name:'Dish',priceMinor:1200,available:false}]]){
    assert.equal(core.validate({...structuredClone(source),items},source.restaurantSlug).ok,false);
  }
});
test('must use a non-overnight window, valid 15-minute candidates and local weekday',()=>{
  const x=structuredClone(source);x.pickupWindows=[{weekdays:[5],from:'23:30',to:'01:00'}];
  assert.equal(core.validate(x,source.restaurantSlug).ok,false);
  const y=structuredClone(source);y.pickupWindows=[{weekdays:[4],from:'12:00',to:'14:00'}];
  const good=core.validate(y,y.restaurantSlug);
  assert.equal(core.pickupSlots(good.data,'2026-10-09',mockNow).length,0);
});
test('Dakar minimum preparation delay blocks immediate/past slots',()=>{
  const data=valid().data;
  const slots=core.pickupSlots(data,'2026-10-09',mockNow);
  assert.deepEqual(slots.slice(0,2),['12:45','13:00']);
  assert.equal(slots.at(-1),'14:00');
  assert.equal(slots.includes('12:30'),false);
  assert.equal(core.pickupSlots(data,'2026-10-08',mockNow).length,0);
  assert.equal(core.pickupSlots(data,'2026-10-24',mockNow).length,0);
  assert.equal(core.pickupSlots(data,'2026-10-10',mockNow).length>0,true);
});
test('real timezone and date are calculated at restaurant, not the client browser',()=>{
  assert.deepEqual(core.localClock('Africa/Dakar',new Date('2026-10-09T23:30:00Z')),
    {day:'2026-10-09',minute:1410});
  assert.deepEqual(core.localClock('Europe/Paris',new Date('2026-10-09T23:30:00Z')),
    {day:'2026-10-10',minute:90});
});
test('transition day is conservative: cannot imply automatic pickup on ambiguous clock',()=>{
  assert.equal(core.isTransitionAdjacent('2026-10-25','Europe/Paris'),true);
  assert.equal(core.isTransitionAdjacent('2026-10-25','Africa/Dakar'),false);
  const paris=structuredClone(source);paris.timezone='Europe/Paris';
  const data=core.validate(paris,paris.restaurantSlug).data;
  assert.equal(core.pickupSlots(data,'2026-10-25',mockNow).length,0);
});
test('XOF has zero decimals and EUR has two, all amounts remain indicative',()=>{
  assert.match(core.money(4500,'XOF'),/4[\s\u00a0\u202f]?500/);
  assert.match(core.money(4500,'EUR'),/45,00/);
  assert.equal(core.totalMinor(valid().data,{'plat-fictif':2,'jus-fictif':1}).total,8000);
  const eur={...structuredClone(source),currency:'EUR',items:[{id:'p',name:'Test only',priceMinor:1299,available:true}]};
  const d=core.validate(eur,eur.restaurantSlug).data;
  assert.equal(core.totalMinor(d,{p:3}).total,3897);
  assert.match(core.money(3897,'EUR'),/38,97/);
});
test('quantities are bounded and unavailable dishes cannot be selected',()=>{
  const data=valid().data;
  for(const bad of [{'plat-fictif':-1},{'plat-fictif':21},{'plat-fictif':1.5},{'indisponible':1}]){
    assert.throws(()=>core.totalMinor(data,bad));
  }
});
test('request is not a payment/confirmed order and includes requested restaurant pickup',()=>{
  const req=core.prepare(valid().data,{'plat-fictif':2},'2026-10-09','13:00',mockNow,'fr');
  assert.equal(req.totalMinor,7000);
  assert.match(req.message,/Demande à emporter — non confirmée/);
  assert.match(req.message,/Retrait souhaité : 2026-10-09 13:00 \(Africa\/Dakar\)/);
  assert.match(req.message,/Paiement direct au restaurant/);
  assert.throws(()=>core.prepare(valid().data,{'plat-fictif':1},'2026-10-09','12:15',mockNow));
  assert.throws(()=>core.prepare(valid().data,{},'2026-10-09','13:00',mockNow));
});
test('WhatsApp URL targets only verified direct contact; newlines are URL-encoded',()=>{
  const d=valid().data,req=core.prepare(d,{'plat-fictif':1},'2026-10-09','13:00',mockNow);
  const url=core.whatsappUrl(d,req.message);
  assert.ok(url.startsWith('https://wa.me/221771234567?text='));
  assert.equal(new URL(url).searchParams.get('text'),req.message);
  assert.equal(core.phoneUrl(d),'tel:+221771234567');
  assert.throws(()=>core.whatsappUrl({...d,whatsapp:'https://evil.example'},req.message));
});
test('hostile restaurant or item names do not become active markup',()=>{
  const x=structuredClone(source);
  x.restaurantName='<img src=x onerror=alert(1)>';
  x.items[0].name='<svg onload=alert(1)>';
  const data=core.validate(x,x.restaurantSlug).data;
  const request=core.prepare(data,{'plat-fictif':1},'2026-10-09','13:00',mockNow);
  assert.match(request.message,/<svg onload=alert\(1\)>/);
  const page=fs.readFileSync(path.resolve(__dirname,'../resa-resto/takeaway-page.js'),'utf8');
  assert.match(page,/\.textContent\s*=\s*data\.restaurantName/);
  assert.doesNotMatch(page,/\.innerHTML\s*=/);
});
test('UI entrypoint never calls booking RPC, backend, POS, payment or cashier',()=>{
  const src=fs.readFileSync(path.resolve(__dirname,'../resa-resto/takeaway-page.js'),'utf8');
  const page=fs.readFileSync(path.resolve(__dirname,'../resa-resto/a-emporter.html'),'utf8');
  assert.doesNotMatch(src,/db\.rpc|\.from\(|fetch\(|checkout|stripe|service_role|localStorage|sessionStorage|sendBeacon/);
  assert.doesNotMatch(page,/supabase-js|checkout|stripe|digiy_resa_resto_public_book_v1/);
  assert.match(page,/Commande à emporter non disponible/);
  assert.match(page,/id="ordering" class="hidden"/);
  assert.ok(!page.includes('<form action='));
});
test('all restaurant configuration fields must be real and publisher-verified',()=>{
  const x=structuredClone(source);
  x.pickupWindows=[{weekdays:[1,2,3,4,5,6,7],from:'12:00',to:'14:00'}];
  x.items[0].priceMinor=-1;
  assert.equal(core.validate(x,x.restaurantSlug).ok,false);
  const y=structuredClone(source);y.pickupWindows[0].weekdays=[0];
  assert.equal(core.validate(y,y.restaurantSlug).ok,false);
});
