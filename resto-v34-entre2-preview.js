/* Aperçu public V34 non transactionnel. Ne pas envoyer de commande. */
(()=>{'use strict';
const items=[["Margarita",990,"Sauce tomate, mozzarella, olives noires et basilic"],["Royale",1250,"Tomate, mozzarella, jambon blanc, champignons, œuf et olives"],["Végétarienne",1490,"Tomate, mozzarella, poivrons, champignons, artichauts et parmesan"],["Quatre Fromages",1550,"Crème, mozzarella, roquefort, chèvre et tome aux noix"],["Périgourdine",1650,"Crème, magret séché, chèvre, miel et olives"],["Sarladaise",1900,"Tomate, jambon noir du Périgord, burrata et huile de truffe"],["La Truffe",1950,"Crème de truffe, burrata et jambon noir du Périgord"]];
const root=document.getElementById('products'),total=document.getElementById('total');
const counts=Array(items.length).fill(0);
const eur=value=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(value/100);
function update(){total.textContent=eur(items.reduce((sum,item,i)=>sum+item[1]*counts[i],0))}
items.forEach((item,i)=>{
 const row=document.createElement('div');row.className='product';
 const info=document.createElement('div');const name=document.createElement('h3');name.textContent=item[0];
 const desc=document.createElement('div');desc.className='desc';desc.textContent=item[2];
 const price=document.createElement('strong');price.textContent=eur(item[1]);
 info.append(name,desc,price);
 const tools=document.createElement('div');tools.className='counter';
 const less=document.createElement('button');less.type='button';less.textContent='−';less.disabled=true;less.setAttribute('aria-label','Retirer '+item[0]);
 const count=document.createElement('output');count.textContent='0';
 const more=document.createElement('button');more.type='button';more.textContent='+';more.setAttribute('aria-label','Ajouter '+item[0]);
 less.addEventListener('click',()=>{if(counts[i])counts[i]--;count.textContent=counts[i];less.disabled=counts[i]===0;more.disabled=false;update()});
 more.addEventListener('click',()=>{if(counts[i]>=20)return;counts[i]++;count.textContent=counts[i];less.disabled=false;more.disabled=counts[i]===20;update()});
 tools.append(less,count,more);row.append(info,tools);root.append(row);
});
})();
