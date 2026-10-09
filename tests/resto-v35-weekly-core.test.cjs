'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const core=require('../src/resto-v35-weekly-core.js');

// ALL menu item records in this file are fictitious laboratory fixtures.
const fiction={
  weekStart:'2026-10-05', timezone:'Europe/Paris',status:'published',
  publishedAt:'2026-10-04T10:00:00Z',
  items:[
    {date:'2026-10-09',service:'lunch',sortOrder:2,title:'Plat fictif B',priceMinor:1450,currency:'EUR'},
    {date:'2026-10-09',service:'lunch',sortOrder:1,title:'Plat fictif A',priceMinor:1250,currency:'EUR',
     photoObjectKey:'resto/demo-test-01/photos/plat.webp',photoAlt:'Illustration fictive de test'},
    {date:'2026-10-10',service:'dinner',title:'Plat fictif C',priceMinor:null},
    {date:'2026-10-08',service:'lunch',title:'Plat fictif PASSÉ',priceMinor:999,currency:'EUR'},
    {date:'2026-10-11',service:'dinner',title:'<img src=x onerror=alert(1)>',
     priceMinor:0,currency:'XOF',photoObjectKey:'javascript:alert(1)'}
  ]
};
test('ISO week starts Monday and seven dates remain contiguous',()=>{
 assert.equal(core.mondayOf('2026-10-09'),'2026-10-05');
 assert.deepEqual(core.weekDates('2026-10-09'),[
  '2026-10-05','2026-10-06','2026-10-07','2026-10-08','2026-10-09','2026-10-10','2026-10-11'
 ]);
 assert.equal(core.mondayOf('2026-01-01'),'2025-12-29');
 assert.equal(core.mondayOf('2028-02-29'),'2028-02-28');
 assert.equal(core.shiftDay('2028-02-28',1),'2028-02-29');
});
test('invalid days never silently roll over',()=>{
 assert.throws(()=>core.mondayOf('2026-02-30'),/Invalid/);
 assert.throws(()=>core.mondayOf('2026-02-29'),/Invalid/);
 assert.throws(()=>core.mondayOf('wrong-date'),/Invalid/);
 assert.throws(()=>core.shiftDay('2026-10-09',1.5),/offset/);
});
test('territory-local date uses DST-safe time-zone-aware calendar',()=>{
 assert.equal(core.localDay('2026-10-09T22:30:00Z','Europe/Paris'),'2026-10-10');
 assert.equal(core.localDay('2026-10-09T22:30:00Z','Africa/Dakar'),'2026-10-09');
 assert.equal(core.localDay('2026-10-24T23:30:00Z','Europe/Paris'),'2026-10-25');
 assert.equal(core.localDay('2026-10-25T01:30:00Z','Europe/Paris'),'2026-10-25');
 assert.throws(()=>core.localDay('2026-10-09T12:00:00Z','Bad/TimeZone'),/time zone|timezone/i);
});
test('drafts, paused menus and missing approval fail closed',()=>{
 for(const snapshot of [null,{...fiction,status:'draft'},{...fiction,status:'paused'},{...fiction,publishedAt:null},{...fiction,weekStart:'2026-10-06'}]){
  assert.deepEqual(core.visibleWeek(snapshot,'2026-10-09T12:00:00Z').days,[]);
  assert.equal(core.visibleWeek(snapshot,'2026-10-09T12:00:00Z').visible,false);
 }
});
test('one published week has 7 days with multi-plate lunch and dinner',()=>{
 const result=core.visibleWeek(fiction,'2026-10-09T12:00:00Z');
 assert.equal(result.visible,true);
 assert.equal(result.days.length,7);
 assert.equal(result.today,'2026-10-09');
 const friday=result.days[4];
 assert.equal(friday.label,'Vendredi');
 assert.equal(friday.isToday,true);
 assert.equal(friday.services[0].items.length,2);
 assert.deepEqual(friday.services[0].items.map(x=>x.title),['Plat fictif A','Plat fictif B']);
 assert.equal(friday.services[0].items[0].priceMinor,1250);
 assert.equal(friday.services[0].items[0].photoObjectKey,'resto/demo-test-01/photos/plat.webp');
 assert.equal(result.days[5].services[1].items[0].title,'Plat fictif C');
 assert.equal(result.days[5].services[1].items[0].priceMinor,null);
});
test('past days never advertise dated dishes as available',()=>{
 const result=core.visibleWeek(fiction,'2026-10-09T12:00:00Z');
 assert.equal(result.days[3].isPast,true);
 assert.deepEqual(result.days[3].services[0].items,[]);
 assert.equal(core.visibleWeek(fiction,'2026-10-12T09:00:00Z').visible,false);
});
test('bad photo URL fails closed; malicious titles stay literal text only',()=>{
 const res=core.visibleWeek(fiction,'2026-10-09T12:00:00Z');
 const bad=res.days[6].services[1].items[0];
 assert.equal(bad.title,'<img src=x onerror=alert(1)>');
 assert.equal(bad.photoObjectKey,null);
 assert.equal(bad.priceMinor,0);
 assert.equal(bad.currency,'XOF');
});
test('do not leak takeaway activation or unrelated fields into public presentation',()=>{
 const item={date:'2026-10-09',service:'lunch',title:'Plat fictif',priceMinor:1500,currency:'EUR',takeawayEnabled:true,ownerEmail:'secret@example.com',password:'never'};
 const res=core.visibleWeek({...fiction,items:[item]},'2026-10-09T12:00:00Z');
 const publicItem=res.days[4].services[0].items[0];
 assert.equal(Object.hasOwn(publicItem,'takeawayEnabled'),false);
 assert.equal(Object.hasOwn(publicItem,'ownerEmail'),false);
 assert.equal(Object.hasOwn(publicItem,'password'),false);
});
test('missing or invalid prices do not fabricate a valid offer',()=>{
 const items=[
 {date:'2026-10-09',service:'lunch',title:'Plat sans tarif'},
 {date:'2026-10-09',service:'lunch',title:'Prix illégal',priceMinor:-1,currency:'EUR'},
 {date:'2026-10-09',service:'lunch',title:'Devise inconnue',priceMinor:1200,currency:'USD'}
 ];
 const publicItems=core.visibleWeek({...fiction,items},'2026-10-09T12:00:00Z').days[4].services[0].items;
 assert.equal(publicItems.length,1);
 assert.equal(publicItems[0].priceMinor,null);
});
