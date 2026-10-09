/* DIGIY RESTO V35A — isolated weekly date and public-view projection logic.
 * NO database, authentication, network, checkout or publishing operations.
 * Any future server API MUST enforce ownership, versioning and public visibility.
 */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.DigiyWeeklyMenuCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const SERVICE_ORDER=['lunch','dinner'];
  const DAYS=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
  const DATE_RE=/^\d{4}-\d{2}-\d{2}$/;

  function parseDay(value){
    if(typeof value!=='string'||!DATE_RE.test(value))throw new TypeError('Invalid local ISO date');
    const d=new Date(value+'T12:00:00Z');
    if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==value){
      throw new TypeError('Invalid local ISO date');
    }
    return d;
  }
  function shiftDay(iso,offset){
    if(!Number.isSafeInteger(offset)||Math.abs(offset)>3660)throw new RangeError('Invalid day offset');
    const date=parseDay(iso);
    date.setUTCDate(date.getUTCDate()+offset);
    return date.toISOString().slice(0,10);
  }
  function mondayOf(iso){
    const date=parseDay(iso);
    const offset=(date.getUTCDay()+6)%7;
    return shiftDay(iso,-offset);
  }
  function weekDates(iso){
    const monday=mondayOf(iso);
    return DAYS.map((_,i)=>shiftDay(monday,i));
  }
  function localDay(instant,timezone){
    if(typeof timezone!=='string'||!timezone||timezone.length>80)throw new TypeError('Invalid timezone');
    const dt=instant instanceof Date?instant:new Date(instant);
    if(!Number.isFinite(dt.getTime()))throw new TypeError('Invalid instant');
    const fmt=new Intl.DateTimeFormat('en-US',{
      timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'
    });
    const parts=Object.fromEntries(fmt.formatToParts(dt).filter(p=>['year','month','day'].includes(p.type)).map(p=>[p.type,p.value]));
    const out=parts.year+'-'+parts.month+'-'+parts.day;
    parseDay(out);
    return out;
  }
  function safeItem(item){
    if(!item||typeof item!=='object'||typeof item.title!=='string')return null;
    const title=item.title.trim();
    if(!title||title.length>120)return null;
    const price=(item.priceMinor===null||item.priceMinor===undefined)?null:item.priceMinor;
    if(price!==null&&(!Number.isSafeInteger(price)||price<0||price>100000000))return null;
    const currency=price===null?null:(item.currency==='EUR'||item.currency==='XOF'?item.currency:null);
    if(price!==null&&!currency)return null;
    const isValidPhotoKey=typeof item.photoObjectKey==='string'
      && /^resto\/[a-z0-9-]{3,100}\/[a-zA-Z0-9_./-]{1,180}\.(?:webp|avif|jpe?g|png)$/.test(item.photoObjectKey)
      && !item.photoObjectKey.split('/').includes('..');
    return Object.freeze({
      title,description:typeof item.description==='string'?item.description.trim().slice(0,500):'',
      priceMinor:price,currency,
      photoObjectKey:isValidPhotoKey?item.photoObjectKey:null,
      photoAlt:isValidPhotoKey&&typeof item.photoAlt==='string'?item.photoAlt.trim().slice(0,160):'',
      state:item.state==='sold_out'?'sold_out':'announced'
    });
  }
  function visibleWeek(snapshot,instant){
    // Fail closed: drafts, paused or absent menus leak NOTHING.
    if(!snapshot||snapshot.status!=='published'||!snapshot.publishedAt){
      return Object.freeze({visible:false,days:[]});
    }
    if(typeof snapshot.weekStart!=='string'||mondayOf(snapshot.weekStart)!==snapshot.weekStart){
      return Object.freeze({visible:false,days:[]});
    }
    const today=localDay(instant,snapshot.timezone);
    // Archived weeks never masquerade as current availability.
    if(snapshot.weekStart < mondayOf(today))return Object.freeze({visible:false,days:[]});
    const dates=weekDates(snapshot.weekStart);
    const items=Array.isArray(snapshot.items)?snapshot.items:[];
    const days=dates.map((date,i)=>({
      date,label:DAYS[i],isToday:date===today,isPast:date<today,
      services:SERVICE_ORDER.map(service=>({
        service,
        items:date<today?[]:items.filter(x=>x&&x.date===date&&x.service===service)
          .sort((a,b)=>(Number.isFinite(a.sortOrder)?a.sortOrder:0)-(Number.isFinite(b.sortOrder)?b.sortOrder:0))
          .map(safeItem).filter(Boolean)
      }))
    }));
    return Object.freeze({
      visible:true,weekStart:snapshot.weekStart,today,
      // Week menus cannot automatically claim a dish from yesterday remains available.
      days
    });
  }
  return Object.freeze({mondayOf,shiftDay,weekDates,localDay,visibleWeek});
});
