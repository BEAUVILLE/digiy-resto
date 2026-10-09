/* RESTO V35A — IN-MEMORY PROTOTYPE ONLY.
 * This code must never be mistaken for a public or owner-authenticated menu.
 * No network access, no localStorage, no cookies, no database, no publication.
 */
(()=>{'use strict';
 const core=window.DigiyWeeklyMenuCore;
 const $=id=>document.getElementById(id);
 if(!core){$('formStatus').textContent='Moteur du calendrier indisponible.';return;}
 const days=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
 const services={lunch:'Midi',dinner:'Soir'};
 const allowedTypes=new Set(['image/jpeg','image/png','image/webp','image/avif']);
 const maxImageBytes=4*1024*1024;
 const items=[];
 let nextId=1,selectedDate='',pendingPhoto=null,previewOpen=false;
 const status=t=>{$('formStatus').textContent=t;};
 const timezone=()=>$('timezone').value;
 const today=()=>core.localDay(new Date(),timezone());
 const weekStart=()=>core.mondayOf($('weekDate').value);
 const dates=()=>core.weekDates($('weekDate').value);

 function element(tag,text,klass){
   const e=document.createElement(tag);
   if(text!==undefined)e.textContent=String(text);
   if(klass)e.className=klass;
   return e;
 }
 function emptyPhoto(){
   if(pendingPhoto)URL.revokeObjectURL(pendingPhoto);
   pendingPhoto=null;
   $('photoPreview').hidden=true;
   $('photoPreview').removeAttribute('src');
   $('dishPhoto').value='';
 }
 function resetInput(){
   emptyPhoto();
   $('dishForm').reset();
   if(timezone()==='Africa/Dakar')$('currency').value='XOF';
 }
 function priceToMinor(value,currency){
   if(value.trim()==='')return null;
   const str=value.trim();
   if(currency==='XOF'){
     if(!/^(?:0|[1-9][0-9]{0,6})$/.test(str))throw Error('Le montant FCFA doit être un entier.');
     return Number(str);
   }
   if(currency!=='EUR'||!/^(?:0|[1-9][0-9]{0,6})(?:\.[0-9]{1,2})?$/.test(str))
     throw Error('Prix invalide : EUR avec deux décimales maximum.');
   const parts=str.split('.');
   const n=Number(parts[0])*100+Number((parts[1]||'').padEnd(2,'0'));
   if(!Number.isSafeInteger(n)||n>100000000)throw Error('Prix trop élevé.');
   return n;
 }
 function formatPrice(item){
   if(item.priceMinor===null)return 'Prix à confirmer';
   return new Intl.NumberFormat('fr-FR',{
     style:'currency',currency:item.currency,
     maximumFractionDigits:item.currency==='XOF'?0:2
   }).format(item.priceMinor/(item.currency==='EUR'?100:1));
 }
 function updateWeek(){
   const daysInWeek=dates();
   if(!daysInWeek.includes(selectedDate))selectedDate=daysInWeek[0];
   const week=$('week');
   week.replaceChildren();
   daysInWeek.forEach((date,i)=>{
     const button=element('button',undefined,'day');
     button.type='button';
     button.setAttribute('aria-pressed',String(date===selectedDate));
     button.setAttribute('aria-label',days[i]+' '+date);
     const small=element('span',days[i]);
     const number=element('strong',date.slice(-2));
     button.append(small,number);
     button.addEventListener('click',()=>{
       selectedDate=date;resetInput();renderDay();updateWeek();
     });
     week.appendChild(button);
   });
   $('selection').textContent='Jour sélectionné : '+selectedDate+' · votre brouillon est privé et non enregistré.';
 }
 function createDishCard(item){
   const card=element('div',undefined,'card');
   if(item.photoURL){
     const photo=element('img');
     photo.alt='Photo temporaire : '+item.title;
     photo.src=item.photoURL;
     card.appendChild(photo);
   }
   const details=element('div');
   details.style.flex='1';
   details.append(
     element('strong',services[item.service]+' · '+item.title),
     element('p',item.description||'Sans description'),
     element('strong',formatPrice(item))
   );
   const remove=element('button','Supprimer','smallbtn');
   remove.type='button';
   remove.setAttribute('aria-label','Supprimer le plat '+item.title);
   remove.addEventListener('click',()=>{
     if(item.photoURL)URL.revokeObjectURL(item.photoURL);
     items.splice(items.findIndex(x=>x.id===item.id),1);
     renderDay();if(previewOpen)renderPreview();
     status('Plat supprimé du brouillon temporaire.');
   });
   card.append(details,remove);
   return card;
 }
 function renderDay(){
   const target=$('dayDishes');
   target.replaceChildren();
   const dayItems=items.filter(x=>x.date===selectedDate);
   if(!dayItems.length){target.appendChild(element('p','Aucun plat ajouté pour ce jour.','muted'));return;}
   dayItems.forEach(x=>target.appendChild(createDishCard(x)));
 }
 function renderPreview(){
   previewOpen=true;
   const output=$('publicPreview');output.replaceChildren();
   const note=element('p','APERÇU UNIQUEMENT — aucun plat n’est publié.','guard');
   output.appendChild(note);
   const localToday=today();
   dates().forEach((date,i)=>{
     const section=element('section',undefined,'preview-day');
     section.appendChild(element('h3',days[i]+' '+date.slice(-2)+'/'+date.slice(5,7)));
     const dayItems=items.filter(x=>x.date===date);
     if(date<localToday){
       section.appendChild(element('p','Date passée : aucune disponibilité annoncée.','muted'));
     }else if(!dayItems.length){
       section.appendChild(element('p','Aucun plat annoncé pour cette journée.','muted'));
     }else {
       ['lunch','dinner'].forEach(service=>{
         const serviceItems=dayItems.filter(x=>x.service===service);
         if(!serviceItems.length)return;
         section.appendChild(element('h3',services[service]));
         serviceItems.forEach(item=>{
           const row=element('div',undefined,'preview-card');
           if(item.photoURL){
             const image=element('img');image.src=item.photoURL;image.alt='Photo de démonstration : '+item.title;
             row.appendChild(image);
           }
           const copy=element('div');copy.append(
             element('strong',item.title),
             element('p',item.description||''),
             element('strong',formatPrice(item))
           );row.appendChild(copy);section.appendChild(row);
         });
       });
     }
     output.appendChild(section);
   });
   output.appendChild(element('p','Contenu en brouillon : ni réservation, ni commande, ni paiement.','muted'));
 }
 $('weekDate').value=today();
 selectedDate=today();
 updateWeek();renderDay();
 $('timezone').addEventListener('change',()=>{
   // The real owner timezone will be fixed server-side to the verified site.
   resetInput();status('Fuseau de démonstration modifié. Aucun changement serveur.');
   if(previewOpen)renderPreview();
 });
 $('weekDate').addEventListener('change',()=>{
   try{core.mondayOf($('weekDate').value)}
   catch(_){$('weekDate').value=today();status('Date invalide.');}
   resetInput();updateWeek();renderDay();if(previewOpen)renderPreview();
 });
 $('dishPhoto').addEventListener('change',()=>{
   const file=$('dishPhoto').files?.[0];
   if(pendingPhoto)URL.revokeObjectURL(pendingPhoto);
   pendingPhoto=null;
   $('photoPreview').hidden=true;
   $('photoPreview').removeAttribute('src');
   // A file can be empty after a cancel; no remote upload ever occurs.
   if(!file)return;
   if(!allowedTypes.has(file.type)||file.size<=0||file.size>maxImageBytes){
     $('dishPhoto').value='';
     status('Photo refusée : JPG, PNG, WebP ou AVIF, 4 Mo maximum.');
     return;
   }
   pendingPhoto=URL.createObjectURL(file);
   $('photoPreview').src=pendingPhoto;
   $('photoPreview').hidden=false;
   status('Photo visible uniquement sur cet appareil. Elle ne sera pas sauvegardée.');
 });
 $('dishForm').addEventListener('submit',event=>{
   event.preventDefault();
   const title=$('dishName').value.trim();
   if(title.length<2||title.length>120){status('Le nom du plat doit contenir entre 2 et 120 caractères.');return;}
   const currency=$('currency').value;
   let priceMinor;
   try{priceMinor=priceToMinor($('price').value,currency)}
   catch(error){status(error.message);return;}
   if(items.length>=100){status('Maquette limitée à 100 plats par session.');return;}
   items.push({id:nextId++,date:selectedDate,service:$('service').value,
     title,description:$('dishDescription').value.trim().slice(0,500),
     priceMinor,currency,photoURL:pendingPhoto});
   // Ownership of this object URL moves to the just-created in-memory item.
   pendingPhoto=null;
   resetInput();renderDay();if(previewOpen)renderPreview();
   status('Plat ajouté au brouillon temporaire du '+selectedDate+'. Rien n’a été publié.');
 });
 $('previewBtn').addEventListener('click',renderPreview);
 $('clearBtn').addEventListener('click',()=>{
   if(!items.length)return;
   if(!window.confirm('Effacer tous les plats de cette maquette ? Ils ne sont pas enregistrés.'))return;
   for(const item of items)if(item.photoURL)URL.revokeObjectURL(item.photoURL);
   items.length=0;resetInput();renderDay();if(previewOpen)renderPreview();
   status('Brouillon temporaire effacé.');
 });
 window.addEventListener('pagehide',()=>{
   emptyPhoto();
   for(const item of items)if(item.photoURL)URL.revokeObjectURL(item.photoURL);
 });
})();