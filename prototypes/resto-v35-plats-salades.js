/* DIGIY RESTO · plats & salades à la carte. TEST ONLY.
 * No database, persistent storage, network, payment, takeaway orders or publishing.
 */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const allowedTypes=new Set(['image/jpeg','image/png','image/webp','image/avif']);
 const categories=[['plats','Plats'],['salades','Salades']];
 const items=[];
 let pendingPhoto=null,previewOpen=false,nextId=1;
 const locale=new URLSearchParams(window.location.search).get('timezone');
 const preferredCurrency=locale==='Africa/Dakar'?'XOF':'EUR';
 $('currency').value=preferredCurrency;
 const status=t=>{$('editorStatus').textContent=t;};
 function element(tag,content,cls){
  const node=document.createElement(tag);
  if(content!==undefined)node.textContent=String(content);
  if(cls)node.className=cls;
  return node;
 }
 function clearPhoto(){
  if(pendingPhoto)URL.revokeObjectURL(pendingPhoto);
  pendingPhoto=null;
  $('photo').value='';
  $('photoPreview').hidden=true;
  $('photoPreview').removeAttribute('src');
 }
 function priceMinor(raw,currency){
  const str=String(raw||'').trim();
  if(!str)return null;
  if(currency==='XOF'){
   if(!/^(?:0|[1-9][0-9]{0,6})$/.test(str))throw Error('En FCFA, indiquez un montant entier.');
   return Number(str);
  }
  if(currency!=='EUR'||!/^(?:0|[1-9][0-9]{0,6})(?:\.[0-9]{1,2})?$/.test(str))throw Error('Prix EUR invalide : deux décimales au maximum.');
  const [whole,dec='']=str.split('.');
  const minor=Number(whole)*100+Number(dec.padEnd(2,'0'));
  if(!Number.isSafeInteger(minor)||minor>100000000)throw Error('Prix trop élevé.');
  return minor;
 }
 function showPrice(item){
  if(item.minor===null)return 'Prix à demander';
  return new Intl.NumberFormat('fr-FR',{style:'currency',currency:item.currency,maximumFractionDigits:item.currency==='XOF'?0:2})
   .format(item.minor/(item.currency==='EUR'?100:1));
 }
 function card(item,editable){
  const box=element('article',undefined,'card');
  if(item.photoURL){
   const photo=element('img');
   photo.src=item.photoURL;
   photo.alt='Photo temporaire : '+item.title;
   box.appendChild(photo);
  }
  const info=element('div');
  info.style.flex='1';
  info.append(element('strong',item.title),element('p',item.description||'Sans description'),element('strong',showPrice(item)));
  if(editable){
   const remove=element('button','Supprimer','secondary');
   remove.type='button';
   remove.setAttribute('aria-label','Supprimer '+item.title);
   remove.addEventListener('click',()=>{
    const index=items.findIndex(x=>x.id===item.id);
    if(index<0)return;
    if(item.photoURL)URL.revokeObjectURL(item.photoURL);
    items.splice(index,1);
    render();
    if(previewOpen)renderPreview();
    status('Plat retiré du brouillon.');
   });
   info.appendChild(remove);
  }
  box.appendChild(info);
  return box;
 }
 function displayInto(target,editable){
  target.replaceChildren();
  if(!items.length){
   target.appendChild(element('p','Votre carte est encore vide.','small'));
   return;
  }
  for(const [key,label] of categories){
   const inCategory=items.filter(item=>item.category===key);
   if(!inCategory.length)continue;
   const group=element('section',undefined,'group');
   group.appendChild(element('h3',label));
   for(const item of inCategory)group.appendChild(card(item,editable));
   target.appendChild(group);
  }
 }
 function render(){displayInto($('items'),true);}
 function renderPreview(){
  previewOpen=true;
  const output=$('preview');
  output.replaceChildren();
  output.appendChild(element('p','APERÇU CLIENT — NON PUBLIÉ','notice'));
  const content=element('div');
  displayInto(content,false);
  output.appendChild(content);
 }
 $('photo').addEventListener('change',()=>{
  const file=$('photo').files?.[0];
  if(pendingPhoto)URL.revokeObjectURL(pendingPhoto);
  pendingPhoto=null;
  $('photoPreview').hidden=true;
  $('photoPreview').removeAttribute('src');
  if(!file)return;
  if(!allowedTypes.has(file.type)||file.size<=0||file.size>4*1024*1024){
   $('photo').value='';
   status('Photo refusée : JPG, PNG, WebP ou AVIF, 4 Mo maximum.');
   return;
  }
  pendingPhoto=URL.createObjectURL(file);
  $('photoPreview').src=pendingPhoto;
  $('photoPreview').hidden=false;
  status('La photo reste uniquement sur cet appareil.');
 });
 $('dishForm').addEventListener('submit',event=>{
  event.preventDefault();
  const title=$('dishTitle').value.trim();
  const category=$('category').value;
  if(title.length<2||title.length>120)return status('Nom du plat invalide.');
  if(!categories.some(([id])=>id===category))return status('Catégorie invalide.');
  let minor;
  try{minor=priceMinor($('price').value,$('currency').value)}
  catch(error){return status(error.message);}
  if(items.length>=100)return status('Limite de 100 plats pour cet essai.');
  items.push({
   id:nextId++,category,title,description:$('dishDescription').value.trim().slice(0,500),
   currency:$('currency').value,minor,photoURL:pendingPhoto
  });
  pendingPhoto=null;
  clearPhoto();
  $('dishForm').reset();
  $('currency').value=preferredCurrency;
  render();
  if(previewOpen)renderPreview();
  status('Plat ajouté au brouillon local. Rien n’est publié.');
 });
 $('previewBtn').addEventListener('click',renderPreview);
 $('clearBtn').addEventListener('click',()=>{
  if(!items.length)return;
  if(!window.confirm('Effacer les plats et salades temporaires ?'))return;
  for(const item of items)if(item.photoURL)URL.revokeObjectURL(item.photoURL);
  items.length=0;
  clearPhoto();render();
  if(previewOpen)renderPreview();
  status('Brouillon effacé.');
 });
 window.addEventListener('pagehide',()=>{
  clearPhoto();
  for(const item of items)if(item.photoURL)URL.revokeObjectURL(item.photoURL);
 });
 render();
})();