
/* DIGIY RESTO - QR menu core V1. Sans réseau, sans secret, compatible navigateur/Node. */
(function(root,factory){
  'use strict';
  var api=factory();
  if(typeof module==='object' && module.exports){module.exports=api;}
  else{root.DigiyRestoQrCore=api;}
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  var CURRENCIES=['XOF','EUR','USD'];
  function txt(v,max){return String(v===null||v===undefined?'':v).trim().slice(0,max);}
  function normalize(input){
    var x=input&&typeof input==='object'?input:{};
    var currency=CURRENCIES.includes(x.currency)?x.currency:'XOF';
    var sections=Array.isArray(x.sections)?x.sections.slice(0,20):[];
    return {
      title:txt(x.title,100),intro:txt(x.intro,500),
      currency:currency,phone:txt(x.phone,30),
      sections:sections.map(function(section){
        var s=section&&typeof section==='object'?section:{};
        var items=Array.isArray(s.items)?s.items.slice(0,80):[];
        return {name:txt(s.name,80),items:items.map(function(item){
          var p=item&&typeof item==='object'?item:{};
          var price=p.price===''||p.price===null||p.price===undefined?null:Number(p.price);
          if(price!==null&&(!Number.isFinite(price)||price<0||price>100000000))price=null;
          return {name:txt(p.name,120),description:txt(p.description,300),
            price:price,available:p.available!==false};
        })};
      })
    };
  }
  function publishable(value){
    var m=normalize(value);
    m.sections=m.sections.map(function(s){
      return {name:s.name,items:s.items.filter(function(i){return i.name.length>0;})};
    }).filter(function(s){return s.name.length>0&&s.items.length>0;});
    if(!m.title||!m.sections.length)return {ok:false,message:'Indiquez un titre et au moins une rubrique contenant un plat nommé.'};
    if(JSON.stringify(m).length>55000)return {ok:false,message:'Carte trop volumineuse : réduisez les descriptions.'};
    return {ok:true,menu:m};
  }
  function formatPrice(price,currency){
    if(price===null||price===undefined||!Number.isFinite(Number(price)))return 'Prix sur demande';
    var unit=CURRENCIES.includes(currency)?currency:'XOF';
    return new Intl.NumberFormat('fr-FR',{style:'currency',currency:unit,
      minimumFractionDigits:unit==='XOF'?0:2,maximumFractionDigits:unit==='XOF'?0:2}).format(Number(price));
  }
  function validSlug(slug){return typeof slug==='string'&&/^[a-z0-9][a-z0-9-]{1,79}$/.test(slug);}
  function phoneDigits(phone){var s=String(phone||'').replace(/[^0-9]/g,'');return s.length>=8&&s.length<=15?s:'';}
  return Object.freeze({normalize:normalize,publishable:publishable,formatPrice:formatPrice,validSlug:validSlug,phoneDigits:phoneDigits});
});
