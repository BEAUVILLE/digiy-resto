/* RESTO V34 public page. ZERO requests to a DIGIY database or checkout provider. */
(function(){
  'use strict';
  const core=window.DigiyTakeawayCore, catalog=window.DIGIY_TAKEAWAY_CATALOG;
  const $=id=>document.getElementById(id);
  const params=new URLSearchParams(location.search);
  const site=params.get('site')||'';
  const lang=params.get('lang')==='en'?'en':'fr';
  document.documentElement.lang=lang;
  const words={
    fr:{
      heroTitle:'À emporter',heroNote:'Votre repas, à récupérer directement au restaurant.',
      unavailableTitle:'Commande à emporter non disponible',
      unavailableText:'Aucune carte à emporter approuvée pour cet établissement. Contactez-le directement pour connaître ses possibilités.',
      directoryLink:'Voir les restaurants et leurs contacts',
      orderNotice:'Ceci est une demande, pas une commande confirmée. Le restaurateur valide les plats, le retrait et le prix définitif.',
      menuHeading:'Choisir les plats',pickupHeading:'Choisir le retrait',
      dateLabel:'Date souhaitée',timeLabel:'Heure souhaitée',
      chooseTime:'Choisir une heure',noTime:'Aucun retrait proposé pour ce jour ; contactez le restaurant.',
      pickupInfo:'Le retrait respecte les plages dédiées et le délai de préparation. Lors d’un changement d’heure, contactez directement le restaurant.',
      totalLabel:'Total indicatif',directPay:'Paiement direct au restaurant. DIGIYLYFE ne collecte aucun règlement.',
      select:'Sélectionnez un plat et un créneau de retrait pour préparer votre demande.',
      whatsapp:'Préparer la demande sur WhatsApp ↗',copyRequest:'Copier la demande',
      phone:'Appeler le restaurateur',requestNote:'Aucune demande n’est transmise à DIGIYLYFE. Le restaurant accepte ou refuse directement.',
      copyDone:'Demande copiée. Contactez maintenant le restaurant pour la faire confirmer.',
      copyFailed:'Copie indisponible sur cet appareil. Utilisez le contact direct.',
      invalidTime:'Le créneau n’est plus proposé : vérifiez la date et l’heure.',
      footer:'DIGIYLYFE · Contact direct · Paiement direct · 0 % commission',
      unavailableDish:'Indisponible',increase:'Ajouter',decrease:'Retirer'
    },
    en:{
      heroTitle:'Takeaway',heroNote:'Pick up your meal directly from the restaurant.',
      unavailableTitle:'Takeaway requests unavailable',
      unavailableText:'This restaurant has not approved a takeaway menu. Contact them directly to ask about takeaway options.',
      directoryLink:'See restaurants and direct contacts',
      orderNotice:'This is a request, not a confirmed order. The restaurant confirms dishes, pickup time and final price.',
      menuHeading:'Choose dishes',pickupHeading:'Choose pickup',
      dateLabel:'Preferred day',timeLabel:'Preferred time',
      chooseTime:'Choose a time',noTime:'No pickup slots offered for this day; contact the restaurant.',
      pickupInfo:'Pickup follows restaurant-approved windows and preparation time. Please contact the restaurant during daylight-saving changes.',
      totalLabel:'Indicative total',directPay:'Pay the restaurant directly. DIGIYLYFE does not collect payments.',
      select:'Choose at least one dish and an available pickup time to prepare your request.',
      whatsapp:'Prepare request on WhatsApp ↗',copyRequest:'Copy request',
      phone:'Call the restaurant',requestNote:'Nothing is sent to DIGIYLYFE. The restaurant accepts or declines your request directly.',
      copyDone:'Request copied. Contact the restaurant for confirmation.',
      copyFailed:'Copy is not available on this device. Please contact the restaurant.',
      invalidTime:'This slot is no longer offered; select a new pickup time.',
      footer:'DIGIYLYFE · Direct contact · Direct payment · 0% commission',
      unavailableDish:'Unavailable',increase:'Add',decrease:'Remove'
    }
  };
  const tr=words[lang];
  for(const id of ['heroTitle','heroNote','unavailableTitle','unavailableText','directoryLink',
    'orderNotice','menuHeading','pickupHeading','dateLabel','timeLabel','pickupInfo',
    'totalLabel','directPay','requestNote','footer']){
    $(id).textContent=tr[id];
  }
  // No real approved menu is supplied in the V34 branch. Fail closed.
  const config=core&&catalog&&Object.prototype.hasOwnProperty.call(catalog,site)?
    core.validate(catalog[site],site):{ok:false,reason:'no-approved-menu'};
  if(!config.ok)return;
  const data=config.data,quantities=Object.create(null);
  $('unavailable').classList.add('hidden');
  $('ordering').classList.remove('hidden');
  $('restaurantName').textContent=data.restaurantName;
  $('total').textContent=core.money(0,data.currency,lang);
  const clock=core.localClock(data.timezone);
  $('pickupDate').min=clock.day;
  $('pickupDate').max=core.addDays(clock.day,14);
  $('pickupDate').value=clock.day;
  const menu=$('menu'),slotSelect=$('pickupTime'),send=$('whatsapp'),copy=$('copyRequest');
  const call=$('phone');
  const phoneUrl=core.phoneUrl(data);
  if(phoneUrl){
    call.href=phoneUrl;
    call.textContent=tr.phone;
    call.classList.remove('hidden');
  }
  $('whatsapp').textContent=tr.whatsapp;
  copy.textContent=tr.copyRequest;
  function create(tag,text,css){
    const node=document.createElement(tag);
    if(text!==undefined)node.textContent=text;
    if(css)node.className=css;
    return node;
  }
  for(const item of data.items){
    const card=create('div',undefined,'dish');
    const desc=create('div');
    desc.append(create('div',item.name,'dishName'));
    desc.append(create('div',core.money(item.priceMinor,data.currency,lang),'price'));
    if(!item.available)desc.append(create('div',tr.unavailableDish,'muted small'));
    card.append(desc);
    const counter=create('div',undefined,'counter');
    const less=create('button','−'),count=create('output','0'),more=create('button','+');
    less.type=more.type='button';
    less.setAttribute('aria-label',tr.decrease+' '+item.name);
    more.setAttribute('aria-label',tr.increase+' '+item.name);
    less.disabled=true;
    more.disabled=!item.available;
    quantities[item.id]=0;
    less.addEventListener('click',()=>{
      if(quantities[item.id]>0){quantities[item.id]--;count.textContent=String(quantities[item.id]);}
      less.disabled=quantities[item.id]===0;more.disabled=!item.available||quantities[item.id]>=20;
      update();
    });
    more.addEventListener('click',()=>{
      if(!item.available||quantities[item.id]>=20)return;
      quantities[item.id]++;count.textContent=String(quantities[item.id]);
      less.disabled=false;more.disabled=quantities[item.id]>=20;
      update();
    });
    counter.append(less,count,more);card.append(counter);menu.append(card);
  }
  function refreshSlots(){
    const before=slotSelect.value;
    slotSelect.replaceChildren();
    const initial=create('option',tr.chooseTime);
    initial.value='';slotSelect.append(initial);
    for(const time of core.pickupSlots(data,$('pickupDate').value)){
      const opt=create('option',time);opt.value=time;slotSelect.append(opt);
    }
    if([...slotSelect.options].some(o=>o.value===before))slotSelect.value=before;
    if(slotSelect.options.length===1){
      $('pickupInfo').textContent=tr.noTime;
      slotSelect.disabled=true;
    }else{
      $('pickupInfo').textContent=tr.pickupInfo;
      slotSelect.disabled=false;
    }
    update();
  }
  let prepared=null;
  function update(){
    prepared=null;
    send.classList.add('hidden');
    send.removeAttribute('href');
    copy.classList.add('hidden');
    const amount=core.totalMinor(data,quantities);
    $('total').textContent=core.money(amount.total,data.currency,lang);
    $('status').textContent=tr.select;
    $('status').classList.remove('error');
    try{
      prepared=core.prepare(data,quantities,$('pickupDate').value,slotSelect.value,new Date(),lang);
      if(data.whatsapp){
        send.href=core.whatsappUrl(data,prepared.message);
        send.classList.remove('hidden');
      }
      copy.classList.remove('hidden');
      $('status').textContent=tr.orderNotice;
    }catch(_){
      // No messages or contact URLs until a valid, future pickup and nonempty order.
    }
  }
  $('pickupDate').addEventListener('change',refreshSlots);
  slotSelect.addEventListener('change',update);
  send.addEventListener('click',event=>{
    try{
      const nowPrepared=core.prepare(data,quantities,$('pickupDate').value,slotSelect.value,new Date(),lang);
      send.href=core.whatsappUrl(data,nowPrepared.message);
    }catch(_){
      event.preventDefault();
      $('status').textContent=tr.invalidTime;
      $('status').classList.add('error');
      refreshSlots();
    }
  });
  copy.addEventListener('click',async()=>{
    try{
      const p=core.prepare(data,quantities,$('pickupDate').value,slotSelect.value,new Date(),lang);
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(p.message);
      $('status').textContent=tr.copyDone;
      $('status').classList.remove('error');
    }catch(_){
      $('status').textContent=tr.copyFailed;
      $('status').classList.add('error');
    }
  });
  refreshSlots();
})();
