/* DIGIY RESTO — adaptateur PT local, moteur 7 langues conservé */
(function(){
'use strict';
if(window.__DIGIY_RESTO_PT_LOCAL__)return;window.__DIGIY_RESTO_PT_LOCAL__=true;
var PT={"title":"DIGIY RESTO — Restaurantes visíveis · contacto direto · 0% de comissão","description":"A DIGIY RESTO apresenta restaurantes ativos e abre as suas fichas diretas. Pagamento direto ao restaurante, contacto direto e 0% de comissão DIGIY.","ariaLang":"Escolher o idioma","brandSub":"Restaurantes visíveis · contacto direto","kicker":"Vitrine de restaurantes DIGIY","heroTitle":"Descobre um restaurante. <span>Entra diretamente na sua ficha.</span>","heroLead":"A DIGIY RESTO apresenta restaurantes realmente publicados. A ementa, os horários, as reservas e os contactos permanecem na ficha de cada estabelecimento.","pill1":"Pagamento direto","pill2":"0% de comissão DIGIY","pill3":"O restaurante confirma","featuredAria":"Restaurantes publicados","realBadge":"Restaurante realmente publicado","sarlatText":"Sarlat-la-Canéda · Périgord. Abre a ficha para conhecer o estabelecimento, consultar as informações e usar os contactos diretos.","openProfile":"Ver a ficha do restaurante →","backDigiy":"Voltar à DIGIYLYFE","sarlatVisual":"Porta real · Sarlat · Malraux & Entre2","discover":"☰ Descobrir DIGIY RESTO","info1t":"🍽️ Uma ficha por restaurante","info1x":"Cada estabelecimento mantém as suas próprias fotos, ementa, horários e meios de contacto.","info2t":"🤝 Relação direta","info2x":"O cliente contacta o restaurante. O profissional confirma diretamente a reserva ou o pedido.","info3t":"💳 Dinheiro para o restaurante","info3x":"A DIGIY não cobra comissão sobre a reserva, a venda ou o pagamento.","modelsTitle":"📸 Modelos de vitrines — exemplos","modelsSub":"Estes formatos mostram o que cada restaurante pode adaptar à sua própria atividade.","example":"Exemplo","m1t":"Restaurante local","m1x":"Fotos, ementa curta, horários e contacto direto.","m2t":"Pizzaria · esplanada","m2x":"Ambiente, pratos fortes, horários e pedido de mesa.","m3t":"Cozinha fresca","m3x":"Fotos claras, pratos, horários e contacto humano.","signupShort":"🍽️ Pedir · formulário FR","signup":"🍽️ Registar · formulário FR","formNote":"O formulário de registo está atualmente disponível em francês.","waExample":"💬 Exemplo","waSn":"WhatsApp Senegal","waFr":"WhatsApp França","wolof":"🇸🇳 Léxico Wolof RESTO","footer":"DIGIY RESTO · restaurantes publicados · contacto direto · pagamento direto · 0% de comissão.","modelMessage":"Olá, gostaria deste modelo RESTO.","activateMessage":"Olá, gostaria de ativar DIGIY RESTO."};
var requested=(new URLSearchParams(location.search).get('lang')||'').slice(0,2).toLowerCase();
try{if(!requested)requested=(localStorage.getItem('digiy-resto-lang')||'').slice(0,2).toLowerCase();}catch(e){}
var ptActive=requested==='pt';
function currentLang(){
 try{
  var q=(new URLSearchParams(location.search).get('lang')||'').slice(0,2).toLowerCase();
  if(/^(fr|en|es|pt|de|it|nl|ar)$/.test(q))return q;
  var s=(localStorage.getItem('digiy-resto-lang')||localStorage.getItem('digiy-lang')||'').slice(0,2).toLowerCase();
  if(/^(fr|en|es|pt|de|it|nl|ar)$/.test(s))return s;
 }catch(e){}
 return ptActive?'pt':'fr';
}
function routeTarifs(){
 var lang=currentLang();
 document.querySelectorAll('[data-signup]').forEach(function(a){
  a.href='https://digiylyfe.com/tarifs-adherents-1.html?lang='+encodeURIComponent(lang);
 });
}
function wa(a,msg){if(!a||!msg)return;try{var u=new URL(a.href,location.href);u.searchParams.set('text',msg);a.href=u.toString();}catch(e){}}
function inject(){
 var bar=document.querySelector('[data-language-bar]'); if(!bar)return;
 var b=bar.querySelector('[data-resto-lang="pt"]');
 if(!b){b=document.createElement('button');b.type='button';b.setAttribute('data-resto-lang','pt');b.setAttribute('aria-pressed','false');b.textContent='🇵🇹 PT';var es=bar.querySelector('[data-resto-lang="es"]');es&&es.after(b);}
}
function applyPt(update){
 ptActive=true; inject();
 document.documentElement.lang='pt';document.documentElement.dir='ltr';document.title=PT.title;
 var meta=document.querySelector('meta[name="description"]');if(meta)meta.content=PT.description;
 var bar=document.querySelector('[data-language-bar]');if(bar)bar.setAttribute('aria-label',PT.ariaLang);
 document.querySelectorAll('[data-i18n]').forEach(function(el){var k=el.getAttribute('data-i18n');if(PT[k]!=null)el.textContent=PT[k];});
 document.querySelectorAll('[data-i18n-html]').forEach(function(el){var k=el.getAttribute('data-i18n-html');if(PT[k]!=null)el.innerHTML=PT[k];});
 document.querySelectorAll('[data-resto-lang]').forEach(function(b){var on=b.getAttribute('data-resto-lang')==='pt';b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false');});
 document.querySelectorAll('[data-signup]').forEach(function(a){a.title=PT.formNote;a.setAttribute('aria-label',a.textContent+' — '+PT.formNote);});
 routeTarifs();
 document.querySelectorAll('[data-wa="model"]').forEach(function(a){wa(a,PT.modelMessage);});
 document.querySelectorAll('[data-wa="activate"]').forEach(function(a){wa(a,PT.activateMessage);});
 try{localStorage.setItem('digiy-resto-lang','pt');localStorage.setItem('digiy-lang','pt');}catch(e){}
 if(update!==false&&history.replaceState){var u=new URL(location.href);u.searchParams.set('lang','pt');history.replaceState({},'',u.pathname+u.search+u.hash);}
}
function boot(){
 inject();
 routeTarifs();
 document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-resto-lang]');if(!b)return;var l=b.getAttribute('data-resto-lang');if(l==='pt'){e.preventDefault();e.stopImmediatePropagation();applyPt(true);}else{ptActive=false;try{localStorage.setItem('digiy-lang',l);}catch(_){}setTimeout(routeTarifs,0);}},true);
 if(ptActive)setTimeout(function(){applyPt(true);},0);
}
var s=document.createElement('script');s.src='./resto-i18n-7.js?v=20260811-pt-local';s.onload=function(){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();};(document.head||document.documentElement).appendChild(s);
})();