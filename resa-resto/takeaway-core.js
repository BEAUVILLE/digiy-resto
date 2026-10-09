/* DIGIY RESTO V34 — pure, testable takeaway logic. No auth, no backend or cashier. */
(function(root,factory){
  'use strict';
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.DigiyTakeawayCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const hhmm=/^([01]\d|2[0-3]):([0-5]\d)$/;
  const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const currencies={XOF:0,EUR:2};
  const phonePattern=/^\+[1-9]\d{7,14}$/;
  function minutes(text){
    const m=typeof text==='string'&&hhmm.exec(text);
    return m?Number(m[1])*60+Number(m[2]):null;
  }
  function pad(n){return String(n).padStart(2,'0')}
  function hh(n){return pad(Math.floor(n/60))+':'+pad(n%60)}
  function validDate(s){
    if(typeof s!=='string'||!/^\d{4}-\d\d-\d\d$/.test(s))return false;
    const d=new Date(s+'T12:00:00Z');
    return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s;
  }
  function addDays(s,days){
    if(!validDate(s))return null;
    const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);
    return d.toISOString().slice(0,10);
  }
  function localClock(zone,now){
    const date=now instanceof Date?now:new Date(now||Date.now());
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',
      day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);
    const dict=Object.fromEntries(parts.map(p=>[p.type,p.value]));
    return {day:dict.year+'-'+dict.month+'-'+dict.day,
      minute:Number(dict.hour)*60+Number(dict.minute)};
  }
  function isTransitionAdjacent(day,zone){
    if(!validDate(day))return true;
    const fmt=new Intl.DateTimeFormat('en-US',{timeZone:zone,timeZoneName:'shortOffset'});
    const utc=Date.parse(day+'T12:00:00Z');
    const offsets=[-86400000,0,86400000].map(n=>fmt.formatToParts(new Date(utc+n))
      .find(p=>p.type==='timeZoneName')?.value||'');
    return new Set(offsets).size>1;
  }
  function validate(raw,expectedSlug){
    const fail=reason=>({ok:false,reason});
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return fail('missing');
    // Manual owner approval is mandatory. Static flags are not proof of consent;
    // each publish still requires a reviewed PR and confirmed real menu.
    if(raw.enabled!==true||raw.ownerApproved!==true)return fail('not-approved');
    if(typeof raw.restaurantSlug!=='string'||!slugPattern.test(raw.restaurantSlug)
      ||raw.restaurantSlug.length>72||raw.restaurantSlug!==expectedSlug)return fail('site');
    if(typeof raw.restaurantName!=='string'||raw.restaurantName.trim().length<2
      ||raw.restaurantName.length>100)return fail('name');
    if(!Object.hasOwn(currencies,raw.currency))return fail('currency');
    if(typeof raw.timezone!=='string'||raw.timezone.length>80)return fail('timezone');
    try{new Intl.DateTimeFormat('en',{timeZone:raw.timezone})}catch(_){return fail('timezone')}
    const wa=raw.whatsapp||null,phone=raw.phone||null;
    if((wa&&!phonePattern.test(wa))||(phone&&!phonePattern.test(phone))||(!wa&&!phone))
      return fail('contact');
    if(!Number.isInteger(raw.preparationMinutes)||raw.preparationMinutes<0
      ||raw.preparationMinutes>360)return fail('preparation');
    if(!Array.isArray(raw.pickupWindows)||raw.pickupWindows.length===0
      ||raw.pickupWindows.length>21)return fail('windows');
    const windows=[];
    for(const window of raw.pickupWindows){
      if(!window||!Array.isArray(window.weekdays)||window.weekdays.length===0
        ||window.weekdays.some(n=>!Number.isInteger(n)||n<1||n>7))return fail('weekdays');
      const from=minutes(window.from),to=minutes(window.to);
      if(from===null||to===null||to<from)return fail('hours');
      windows.push({weekdays:[...new Set(window.weekdays)],from,to});
    }
    if(!Array.isArray(raw.items)||!raw.items.length||raw.items.length>70)return fail('menu');
    const seen=new Set(),items=[];
    for(const item of raw.items){
      if(!item||typeof item.id!=='string'||!slugPattern.test(item.id)
        ||item.id.length>60||seen.has(item.id)||typeof item.name!=='string'
        ||item.name.trim().length<2||item.name.length>100
        ||!Number.isSafeInteger(item.priceMinor)||item.priceMinor<0
        ||item.priceMinor>500000000||typeof item.available!=='boolean')
          return fail('item');
      seen.add(item.id);items.push({id:item.id,name:item.name.trim(),priceMinor:item.priceMinor,available:item.available});
    }
    if(!items.some(i=>i.available))return fail('menu-unavailable');
    return {ok:true,data:{restaurantSlug:raw.restaurantSlug,restaurantName:raw.restaurantName.trim(),
      currency:raw.currency,timezone:raw.timezone,whatsapp:wa,phone:phone,
      preparationMinutes:raw.preparationMinutes,pickupWindows:windows,items}};
  }
  function isoWeekday(day){
    return new Date(day+'T12:00:00Z').getUTCDay()||7;
  }
  function pickupSlots(data,day,now){
    if(!validDate(day))return [];
    const current=localClock(data.timezone,now);
    if(day<current.day||day>addDays(current.day,14)||isTransitionAdjacent(day,data.timezone))return [];
    const weekday=isoWeekday(day),out=new Set();
    for(const w of data.pickupWindows){
      if(!w.weekdays.includes(weekday))continue;
      let t=Math.ceil(w.from/15)*15;
      for(;t<=w.to;t+=15){
        if(day===current.day&&t<=current.minute+data.preparationMinutes)continue;
        out.add(hh(t));
      }
    }
    return [...out].sort();
  }
  function totalMinor(data,quantities){
    let total=0,selected=[];
    if(!quantities||typeof quantities!=='object')return {total,selected};
    for(const item of data.items){
      const n=quantities[item.id]??0;
      if(!Number.isInteger(n)||n<0||n>20)throw new Error('Invalid quantity');
      if(!item.available&&n!==0)throw new Error('Unavailable item');
      if(n){
        selected.push({id:item.id,name:item.name,quantity:n,priceMinor:item.priceMinor});
        total+=n*item.priceMinor;
        if(!Number.isSafeInteger(total))throw new Error('Invalid total');
      }
    }
    return {total,selected};
  }
  function money(value,currency,lang){
    if(!Number.isSafeInteger(value)||value<0||!Object.hasOwn(currencies,currency))
      throw new Error('Invalid amount');
    return new Intl.NumberFormat(lang==='en'?'en-GB':'fr-FR',{
      style:'currency',currency,minimumFractionDigits:currencies[currency],
      maximumFractionDigits:currencies[currency]}).format(value/10**currencies[currency]);
  }
  function prepare(data,quantities,day,slot,now,lang){
    const result=totalMinor(data,quantities);
    if(result.selected.length===0)throw new Error('Choose an item');
    if(typeof slot!=='string'||!pickupSlots(data,day,now).includes(slot))
      throw new Error('Pickup time unavailable');
    const en=lang==='en';
    const lines=[
      en?'Takeaway request — not confirmed':'Demande à emporter — non confirmée',
      data.restaurantName,
      '',
      ...result.selected.map(i=>i.quantity+' × '+i.name+' — '+money(i.quantity*i.priceMinor,data.currency,lang)),
      '',
      (en?'Indicative total: ':'Total indicatif : ')+money(result.total,data.currency,lang),
      (en?'Requested pickup: ':'Retrait souhaité : ')+day+' '+slot+' ('+data.timezone+')',
      en?'Please confirm availability, pickup time and final price. Payment directly to the restaurant.':
      'Merci de confirmer les plats, l’heure de retrait et le prix définitif. Paiement direct au restaurant.'
    ];
    return {message:lines.join('\n'),totalMinor:result.total,selected:result.selected};
  }
  function whatsappUrl(data,message){
    if(!data.whatsapp||!phonePattern.test(data.whatsapp)||typeof message!=='string'
      ||message.length>2500)throw new Error('Invalid professional contact/message');
    return 'https://wa.me/'+data.whatsapp.slice(1)+'?text='+encodeURIComponent(message);
  }
  function phoneUrl(data){
    if(!data.phone||!phonePattern.test(data.phone))return null;
    return 'tel:'+data.phone;
  }
  return Object.freeze({validate,localClock,addDays,isTransitionAdjacent,pickupSlots,
    totalMinor,money,prepare,whatsappUrl,phoneUrl});
});
