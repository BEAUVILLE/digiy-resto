'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const home=path.resolve(__dirname,'..');
const entre2=fs.readFileSync(path.join(home,'fiche-lentre2.html'),'utf8');
const malraux=fs.readFileSync(path.join(home,'fiche-le-malraux.html'),'utf8');
const code=fs.readFileSync(path.join(home,'resto-v34-entre2-preview.js'),'utf8');

function createElement(tag) {
 const e={tagName:tag,children:[],textContent:'',disabled:false,events:{},attributes:{}};
 e.append=(...kids)=>e.children.push(...kids);
 e.addEventListener=(name,fn)=>e.events[name]=fn;
 e.setAttribute=(name,value)=>e.attributes[name]=value;
 return e;
}
function demo(){
 const root=createElement('div');
 const total=createElement('output');
 const ctx={
  document:{getElementById:id=>({products:root,total})[id],createElement},
  Intl,Array
 };
 vm.runInNewContext(code,ctx,{timeout:2000});
 return {root,total};
}
function button(row,n){
 const tools=row.children[1];
 return tools.children[n];
}
test('real Entre 2 public fiche exposes a clearly disabled takeover-style demonstration',()=>{
 assert.match(entre2,/href="#emporter"/);
 assert.match(entre2,/DÉMONSTRATION NON ACTIVE/);
 assert.match(entre2,/restaurant n’a pas validé leur vente à emporter/);
 assert.match(entre2,/id="products"/);
 assert.match(entre2,/id="total"/);
 assert.match(entre2,/src="\.\/resto-v34-entre2-preview\.js"/);
 assert.match(entre2,/tel:\+33673274427/);
});
test('seven published pizzas and price sums render without any network calls',()=>{
 const d=demo();
 assert.equal(d.root.children.length,7);
 assert.equal(d.root.children[0].children[0].children[0].textContent,'Margarita');
 assert.equal(d.root.children[0].children[0].children[2].textContent,'9,90 €');
 assert.equal(d.total.textContent,'0,00 €');
 button(d.root.children[0],2).events.click();
 assert.equal(d.total.textContent,'9,90 €');
 button(d.root.children[1],2).events.click();
 assert.equal(d.total.textContent,'22,40 €');
 button(d.root.children[0],0).events.click();
 assert.equal(d.total.textContent,'12,50 €');
});
test('the demonstration cannot choose negative quantities or more than 20',()=>{
 const d=demo(),first=d.root.children[0];
 assert.equal(button(first,0).disabled,true);
 for(let i=0;i<25;i++)button(first,2).events.click();
 assert.equal(button(first,1).textContent,20);
 assert.equal(button(first,2).disabled,true);
 assert.equal(d.total.textContent,'198,00 €');
});
test('this preview cannot send an order or collect any payment',()=>{
 assert.ok(!/\b(fetch|XMLHttpRequest|WebSocket)\s*\(/.test(code));
 assert.ok(!code.includes('db.rpc('));
 assert.ok(!code.includes('wa.me/'));
 assert.ok(!code.includes('checkout'));
 assert.ok(!/onclick=/.test(entre2));
 assert.ok(!/form[^>]*action=/i.test(entre2));
});
test('Malraux can be called directly but no false menu or ordering is displayed',()=>{
 assert.match(malraux,/href="#emporter"/);
 assert.match(malraux,/Aucune commande à emporter ne peut être enregistrée ici/);
 assert.match(malraux,/href="tel:\+33642160657"/);
 assert.ok(!malraux.includes('resto-v34-entre2-preview.js'));
 assert.ok(!malraux.includes('id="products"'));
});
