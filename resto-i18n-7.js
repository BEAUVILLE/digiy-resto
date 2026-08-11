/* DIGIY RESTO — moteur natif FR EN ES DE IT NL AR, sans rechargement */
(function(){
  'use strict';
  if(window.__DIGIY_RESTO_I18N__) return;
  window.__DIGIY_RESTO_I18N__ = true;

  var SUPPORTED = ['fr','en','es','de','it','nl','ar'];
  var PACKS = {
    fr:{
      title:'DIGIY RESTO — Restaurants visibles · contact direct · 0% commission',
      description:'DIGIY RESTO présente les restaurants actifs et ouvre leur fiche directe. Paiement direct au restaurateur, contact direct et 0% commission DIGIY.',
      ariaLang:'Choisir la langue',
      brandSub:'Restaurants visibles · contact direct',
      kicker:'Vitrine des restaurants DIGIY',
      heroTitle:'Découvre un restaurant. <span>Entre directement dans sa fiche.</span>',
      heroLead:'DIGIY RESTO présente les restaurants réellement publiés. La carte, les horaires, les réservations et les contacts restent dans la fiche de chaque établissement.',
      pill1:'Paiement direct',pill2:'0% commission DIGIY',pill3:'Le restaurant confirme',
      featuredAria:'Restaurants publiés',realBadge:'Restaurant réellement publié',
      sarlatText:'Sarlat-la-Canéda · Périgord. Ouvre la fiche pour découvrir l’établissement, consulter ses informations et utiliser ses contacts directs.',
      openProfile:'Voir la fiche du restaurant →',backDigiy:'Retour DIGIYLYFE',
      sarlatVisual:'Porte réelle · Sarlat · Malraux & Entre2',discover:'☰ Découvrir DIGIY RESTO',
      info1t:'🍽️ Une fiche par restaurant',info1x:'Chaque établissement garde ses propres photos, sa carte, ses horaires et ses moyens de contact.',
      info2t:'🤝 Relation directe',info2x:'Le client contacte le restaurant. Le professionnel confirme lui-même la réservation ou la commande.',
      info3t:'💳 Argent au restaurateur',info3x:'DIGIY ne prend aucune commission sur la réservation, la vente ou le paiement.',
      modelsTitle:'📸 Modèles de vitrines — exemples à prendre',modelsSub:'Ces formats montrent ce que chaque restaurant peut adapter à sa propre activité.',
      example:'Exemple',m1t:'Restaurant local',m1x:'Photos, carte courte, horaires et contact direct.',
      m2t:'Pizzeria · terrasse',m2x:'Ambiance, plats forts, horaires et demande de table.',
      m3t:'Cuisine fraîche',m3x:'Photos propres, plats, horaires et contact humain.',
      signupShort:'🍽️ Demander',signup:'🍽️ Inscrire un restaurant',formNote:'Le formulaire d’inscription est actuellement disponible en français.',
      waExample:'💬 Exemple',waSn:'WhatsApp Sénégal',waFr:'WhatsApp France',wolof:'🇸🇳 Lexique Wolof RESTO',
      footer:'DIGIY RESTO · restaurants publiés · contact direct · paiement direct · 0% commission.',
      modelMessage:'Bonjour, je veux ce modèle RESTO.',activateMessage:'Bonjour, je veux activer DIGIY RESTO.'
    },
    en:{
      title:'DIGIY RESTO — Visible restaurants · direct contact · 0% commission',
      description:'DIGIY RESTO presents active restaurants and opens their direct profiles. Direct payment to the restaurant, direct contact and 0% DIGIY commission.',
      ariaLang:'Choose language',brandSub:'Visible restaurants · direct contact',kicker:'DIGIY restaurant showcase',
      heroTitle:'Discover a restaurant. <span>Enter its own profile directly.</span>',
      heroLead:'DIGIY RESTO displays restaurants that are actually published. Menus, opening hours, bookings and contacts stay inside each establishment’s own profile.',
      pill1:'Direct payment',pill2:'0% DIGIY commission',pill3:'The restaurant confirms',featuredAria:'Published restaurants',realBadge:'Actually published restaurant',
      sarlatText:'Sarlat-la-Canéda · Périgord. Open the profile to discover the establishment, read its information and use its direct contacts.',
      openProfile:'Open the restaurant profile →',backDigiy:'Back to DIGIYLYFE',sarlatVisual:'Real doorway · Sarlat · Malraux & Entre2',discover:'☰ Discover DIGIY RESTO',
      info1t:'🍽️ One profile per restaurant',info1x:'Each establishment keeps its own photos, menu, opening hours and contact methods.',
      info2t:'🤝 Direct relationship',info2x:'The client contacts the restaurant. The professional confirms the booking or order.',
      info3t:'💳 Money goes to the restaurant',info3x:'DIGIY takes no commission on bookings, sales or payments.',
      modelsTitle:'📸 Showcase models — examples to use',modelsSub:'These formats show what each restaurant can adapt to its own activity.',
      example:'Example',m1t:'Local restaurant',m1x:'Photos, short menu, opening hours and direct contact.',m2t:'Pizzeria · terrace',m2x:'Atmosphere, signature dishes, opening hours and table requests.',m3t:'Fresh cooking',m3x:'Clean photos, dishes, opening hours and human contact.',
      signupShort:'🍽️ Request · French form',signup:'🍽️ Register · French form',formNote:'The registration form is currently available in French.',
      waExample:'💬 Example',waSn:'WhatsApp Senegal',waFr:'WhatsApp France',wolof:'🇸🇳 Wolof RESTO glossary',footer:'DIGIY RESTO · published restaurants · direct contact · direct payment · 0% commission.',
      modelMessage:'Hello, I would like this RESTO model.',activateMessage:'Hello, I would like to activate DIGIY RESTO.'
    },
    es:{
      title:'DIGIY RESTO — Restaurantes visibles · contacto directo · 0% comisión',description:'DIGIY RESTO presenta restaurantes activos y abre sus fichas directas. Pago directo al restaurante, contacto directo y 0% de comisión DIGIY.',
      ariaLang:'Elegir idioma',brandSub:'Restaurantes visibles · contacto directo',kicker:'Escaparate de restaurantes DIGIY',heroTitle:'Descubre un restaurante. <span>Entra directamente en su ficha.</span>',
      heroLead:'DIGIY RESTO presenta restaurantes realmente publicados. La carta, los horarios, las reservas y los contactos permanecen en la ficha de cada establecimiento.',pill1:'Pago directo',pill2:'0% comisión DIGIY',pill3:'El restaurante confirma',featuredAria:'Restaurantes publicados',realBadge:'Restaurante realmente publicado',
      sarlatText:'Sarlat-la-Canéda · Périgord. Abre la ficha para descubrir el establecimiento, consultar su información y usar sus contactos directos.',openProfile:'Ver la ficha del restaurante →',backDigiy:'Volver a DIGIYLYFE',sarlatVisual:'Puerta real · Sarlat · Malraux & Entre2',discover:'☰ Descubrir DIGIY RESTO',
      info1t:'🍽️ Una ficha por restaurante',info1x:'Cada establecimiento conserva sus propias fotos, carta, horarios y medios de contacto.',info2t:'🤝 Relación directa',info2x:'El cliente contacta con el restaurante. El profesional confirma la reserva o el pedido.',info3t:'💳 Dinero para el restaurante',info3x:'DIGIY no cobra comisión por la reserva, la venta o el pago.',modelsTitle:'📸 Modelos de escaparate — ejemplos',modelsSub:'Estos formatos muestran lo que cada restaurante puede adaptar a su actividad.',
      example:'Ejemplo',m1t:'Restaurante local',m1x:'Fotos, carta corta, horarios y contacto directo.',m2t:'Pizzería · terraza',m2x:'Ambiente, platos destacados, horarios y solicitud de mesa.',m3t:'Cocina fresca',m3x:'Fotos limpias, platos, horarios y contacto humano.',signupShort:'🍽️ Solicitar · formulario FR',signup:'🍽️ Inscribir · formulario FR',formNote:'El formulario de inscripción está disponible actualmente en francés.',waExample:'💬 Ejemplo',waSn:'WhatsApp Senegal',waFr:'WhatsApp Francia',wolof:'🇸🇳 Léxico Wolof RESTO',footer:'DIGIY RESTO · restaurantes publicados · contacto directo · pago directo · 0% comisión.',modelMessage:'Hola, quiero este modelo RESTO.',activateMessage:'Hola, quiero activar DIGIY RESTO.'
    },
    de:{
      title:'DIGIY RESTO — Sichtbare Restaurants · direkter Kontakt · 0% Provision',description:'DIGIY RESTO präsentiert aktive Restaurants und öffnet ihre direkten Profile. Direkte Zahlung an das Restaurant, direkter Kontakt und 0% DIGIY-Provision.',
      ariaLang:'Sprache wählen',brandSub:'Sichtbare Restaurants · direkter Kontakt',kicker:'DIGIY Restaurant-Schaufenster',heroTitle:'Entdecke ein Restaurant. <span>Öffne direkt sein Profil.</span>',heroLead:'DIGIY RESTO zeigt tatsächlich veröffentlichte Restaurants. Speisekarte, Öffnungszeiten, Reservierungen und Kontakte bleiben im Profil jedes Betriebs.',pill1:'Direkte Zahlung',pill2:'0% DIGIY-Provision',pill3:'Das Restaurant bestätigt',featuredAria:'Veröffentlichte Restaurants',realBadge:'Tatsächlich veröffentlichtes Restaurant',sarlatText:'Sarlat-la-Canéda · Périgord. Öffne das Profil, entdecke den Betrieb und nutze seine direkten Kontakte.',openProfile:'Restaurantprofil öffnen →',backDigiy:'Zurück zu DIGIYLYFE',sarlatVisual:'Echte Tür · Sarlat · Malraux & Entre2',discover:'☰ DIGIY RESTO entdecken',
      info1t:'🍽️ Ein Profil pro Restaurant',info1x:'Jeder Betrieb behält seine eigenen Fotos, Speisekarte, Öffnungszeiten und Kontaktwege.',info2t:'🤝 Direkte Beziehung',info2x:'Der Kunde kontaktiert das Restaurant. Der Profi bestätigt Reservierung oder Bestellung selbst.',info3t:'💳 Geld an das Restaurant',info3x:'DIGIY nimmt keine Provision auf Reservierung, Verkauf oder Zahlung.',modelsTitle:'📸 Schaufenster-Modelle — Beispiele',modelsSub:'Diese Formate zeigen, was jedes Restaurant an seine Tätigkeit anpassen kann.',example:'Beispiel',m1t:'Lokales Restaurant',m1x:'Fotos, kurze Speisekarte, Öffnungszeiten und direkter Kontakt.',m2t:'Pizzeria · Terrasse',m2x:'Atmosphäre, starke Gerichte, Öffnungszeiten und Tischanfrage.',m3t:'Frische Küche',m3x:'Saubere Fotos, Gerichte, Öffnungszeiten und menschlicher Kontakt.',signupShort:'🍽️ Anfragen · Formular FR',signup:'🍽️ Registrieren · Formular FR',formNote:'Das Anmeldeformular ist derzeit auf Französisch verfügbar.',waExample:'💬 Beispiel',waSn:'WhatsApp Senegal',waFr:'WhatsApp Frankreich',wolof:'🇸🇳 Wolof-RESTO-Lexikon',footer:'DIGIY RESTO · veröffentlichte Restaurants · direkter Kontakt · direkte Zahlung · 0% Provision.',modelMessage:'Hallo, ich möchte dieses RESTO-Modell.',activateMessage:'Hallo, ich möchte DIGIY RESTO aktivieren.'
    },
    it:{
      title:'DIGIY RESTO — Ristoranti visibili · contatto diretto · 0% commissioni',description:'DIGIY RESTO presenta ristoranti attivi e apre le loro schede dirette. Pagamento diretto al ristorante, contatto diretto e 0% commissioni DIGIY.',ariaLang:'Scegli la lingua',brandSub:'Ristoranti visibili · contatto diretto',kicker:'Vetrina ristoranti DIGIY',heroTitle:'Scopri un ristorante. <span>Entra direttamente nella sua scheda.</span>',heroLead:'DIGIY RESTO presenta ristoranti realmente pubblicati. Menu, orari, prenotazioni e contatti restano nella scheda di ogni locale.',pill1:'Pagamento diretto',pill2:'0% commissioni DIGIY',pill3:'Il ristorante conferma',featuredAria:'Ristoranti pubblicati',realBadge:'Ristorante realmente pubblicato',sarlatText:'Sarlat-la-Canéda · Périgord. Apri la scheda per scoprire il locale, consultare le informazioni e usare i contatti diretti.',openProfile:'Apri la scheda del ristorante →',backDigiy:'Torna a DIGIYLYFE',sarlatVisual:'Porta reale · Sarlat · Malraux & Entre2',discover:'☰ Scopri DIGIY RESTO',info1t:'🍽️ Una scheda per ristorante',info1x:'Ogni locale conserva foto, menu, orari e contatti propri.',info2t:'🤝 Relazione diretta',info2x:'Il cliente contatta il ristorante. Il professionista conferma prenotazione o ordine.',info3t:'💳 Denaro al ristorante',info3x:'DIGIY non prende commissioni su prenotazioni, vendite o pagamenti.',modelsTitle:'📸 Modelli di vetrina — esempi',modelsSub:'Questi formati mostrano ciò che ogni ristorante può adattare alla propria attività.',example:'Esempio',m1t:'Ristorante locale',m1x:'Foto, menu breve, orari e contatto diretto.',m2t:'Pizzeria · terrazza',m2x:'Atmosfera, piatti forti, orari e richiesta tavolo.',m3t:'Cucina fresca',m3x:'Foto pulite, piatti, orari e contatto umano.',signupShort:'🍽️ Richiedi · modulo FR',signup:'🍽️ Registra · modulo FR',formNote:'Il modulo di iscrizione è attualmente disponibile in francese.',waExample:'💬 Esempio',waSn:'WhatsApp Senegal',waFr:'WhatsApp Francia',wolof:'🇸🇳 Lessico Wolof RESTO',footer:'DIGIY RESTO · ristoranti pubblicati · contatto diretto · pagamento diretto · 0% commissioni.',modelMessage:'Buongiorno, vorrei questo modello RESTO.',activateMessage:'Buongiorno, vorrei attivare DIGIY RESTO.'
    },
    nl:{
      title:'DIGIY RESTO — Zichtbare restaurants · direct contact · 0% commissie',description:'DIGIY RESTO toont actieve restaurants en opent hun directe profiel. Rechtstreekse betaling aan het restaurant, direct contact en 0% DIGIY-commissie.',ariaLang:'Kies taal',brandSub:'Zichtbare restaurants · direct contact',kicker:'DIGIY restaurantetalage',heroTitle:'Ontdek een restaurant. <span>Open rechtstreeks het eigen profiel.</span>',heroLead:'DIGIY RESTO toont restaurants die echt gepubliceerd zijn. Menu, openingstijden, reserveringen en contacten blijven in het profiel van elke zaak.',pill1:'Rechtstreekse betaling',pill2:'0% DIGIY-commissie',pill3:'Het restaurant bevestigt',featuredAria:'Gepubliceerde restaurants',realBadge:'Echt gepubliceerd restaurant',sarlatText:'Sarlat-la-Canéda · Périgord. Open het profiel om de zaak te ontdekken en de directe contacten te gebruiken.',openProfile:'Open het restaurantprofiel →',backDigiy:'Terug naar DIGIYLYFE',sarlatVisual:'Echte toegang · Sarlat · Malraux & Entre2',discover:'☰ Ontdek DIGIY RESTO',info1t:'🍽️ Eén profiel per restaurant',info1x:'Elke zaak behoudt eigen foto’s, menu, openingstijden en contactmogelijkheden.',info2t:'🤝 Directe relatie',info2x:'De klant neemt contact op met het restaurant. De professional bevestigt de reservering of bestelling.',info3t:'💳 Geld naar het restaurant',info3x:'DIGIY neemt geen commissie op reserveringen, verkopen of betalingen.',modelsTitle:'📸 Etalagemodellen — voorbeelden',modelsSub:'Deze formaten tonen wat elk restaurant aan zijn activiteit kan aanpassen.',example:'Voorbeeld',m1t:'Lokaal restaurant',m1x:'Foto’s, kort menu, openingstijden en direct contact.',m2t:'Pizzeria · terras',m2x:'Sfeer, sterke gerechten, openingstijden en tafelaanvraag.',m3t:'Verse keuken',m3x:'Nette foto’s, gerechten, openingstijden en menselijk contact.',signupShort:'🍽️ Aanvragen · FR-formulier',signup:'🍽️ Registreren · FR-formulier',formNote:'Het inschrijfformulier is momenteel in het Frans beschikbaar.',waExample:'💬 Voorbeeld',waSn:'WhatsApp Senegal',waFr:'WhatsApp Frankrijk',wolof:'🇸🇳 Wolof RESTO-woordenlijst',footer:'DIGIY RESTO · gepubliceerde restaurants · direct contact · rechtstreekse betaling · 0% commissie.',modelMessage:'Hallo, ik wil dit RESTO-model.',activateMessage:'Hallo, ik wil DIGIY RESTO activeren.'
    },
    ar:{
      title:'DIGIY RESTO — مطاعم ظاهرة · تواصل مباشر · عمولة 0%',description:'يعرض DIGIY RESTO المطاعم النشطة ويفتح صفحاتها المباشرة. الدفع مباشرة للمطعم والتواصل المباشر وعمولة DIGIY بنسبة 0%.',ariaLang:'اختيار اللغة',brandSub:'مطاعم ظاهرة · تواصل مباشر',kicker:'واجهة مطاعم DIGIY',heroTitle:'اكتشف مطعماً. <span>ادخل مباشرة إلى صفحته.</span>',heroLead:'يعرض DIGIY RESTO المطاعم المنشورة فعلياً. تبقى القائمة والمواعيد والحجوزات ووسائل الاتصال داخل صفحة كل مطعم.',pill1:'دفع مباشر',pill2:'عمولة DIGIY بنسبة 0%',pill3:'المطعم يؤكد',featuredAria:'المطاعم المنشورة',realBadge:'مطعم منشور فعلياً',sarlatText:'سارلا لا كانيدا · بيريغور. افتح الصفحة لاكتشاف المطعم والاطلاع على معلوماته واستخدام وسائل الاتصال المباشرة.',openProfile:'فتح صفحة المطعم ←',backDigiy:'العودة إلى DIGIYLYFE',sarlatVisual:'باب حقيقي · سارلا · Malraux & Entre2',discover:'☰ اكتشف DIGIY RESTO',info1t:'🍽️ صفحة لكل مطعم',info1x:'يحتفظ كل مطعم بصوره وقائمته ومواعيده ووسائل الاتصال الخاصة به.',info2t:'🤝 علاقة مباشرة',info2x:'يتواصل العميل مع المطعم، ويؤكد المهني الحجز أو الطلب بنفسه.',info3t:'💳 المال للمطعم',info3x:'لا تأخذ DIGIY أي عمولة على الحجز أو البيع أو الدفع.',modelsTitle:'📸 نماذج الواجهات — أمثلة',modelsSub:'توضح هذه الصيغ ما يمكن لكل مطعم تكييفه مع نشاطه.',example:'مثال',m1t:'مطعم محلي',m1x:'صور وقائمة قصيرة ومواعيد وتواصل مباشر.',m2t:'بيتزا · شرفة',m2x:'أجواء وأطباق مميزة ومواعيد وطلب طاولة.',m3t:'مطبخ طازج',m3x:'صور نظيفة وأطباق ومواعيد وتواصل إنساني.',signupShort:'🍽️ طلب · النموذج بالفرنسية',signup:'🍽️ تسجيل · النموذج بالفرنسية',formNote:'نموذج التسجيل متاح حالياً باللغة الفرنسية.',waExample:'💬 مثال',waSn:'واتساب السنغال',waFr:'واتساب فرنسا',wolof:'🇸🇳 قاموس Wolof RESTO',footer:'DIGIY RESTO · مطاعم منشورة · تواصل مباشر · دفع مباشر · عمولة 0%.',modelMessage:'مرحباً، أريد نموذج RESTO هذا.',activateMessage:'مرحباً، أريد تفعيل DIGIY RESTO.'
    }
  };

  function normalize(value){
    value=String(value||'').slice(0,2).toLowerCase();
    return SUPPORTED.indexOf(value)>=0?value:'fr';
  }

  function initialLanguage(){
    try{
      var query=new URL(location.href).searchParams.get('lang');
      if(SUPPORTED.indexOf(query)>=0)return query;
      var saved=localStorage.getItem('digiy-resto-lang');
      if(SUPPORTED.indexOf(saved)>=0)return saved;
    }catch(e){}
    var browser=String(navigator.language||'fr').slice(0,2).toLowerCase();
    return SUPPORTED.indexOf(browser)>=0?browser:'fr';
  }

  function whatsapp(anchor,message){
    if(!anchor||!message)return;
    try{
      var url=new URL(anchor.href,location.href);
      url.searchParams.set('text',message);
      anchor.href=url.toString();
    }catch(e){}
  }

  function apply(lang,updateAddress){
    lang=normalize(lang);
    var pack=PACKS[lang]||PACKS.fr;
    document.documentElement.lang=lang;
    document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    document.title=pack.title;
    var meta=document.querySelector('meta[name="description"]');
    if(meta)meta.setAttribute('content',pack.description);
    var bar=document.querySelector('[data-language-bar]');
    if(bar)bar.setAttribute('aria-label',pack.ariaLang);

    document.querySelectorAll('[data-i18n]').forEach(function(element){
      var value=pack[element.getAttribute('data-i18n')];
      if(value!=null)element.textContent=value;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function(element){
      var value=pack[element.getAttribute('data-i18n-html')];
      if(value!=null)element.innerHTML=value;
    });
    document.querySelectorAll('[data-resto-lang]').forEach(function(button){
      var active=button.getAttribute('data-resto-lang')===lang;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',active?'true':'false');
    });
    document.querySelectorAll('[data-signup]').forEach(function(anchor){
      anchor.href='https://resto.digiylyfe.com/inscription.html?lang=fr';
      anchor.title=pack.formNote;
      anchor.setAttribute('aria-label',anchor.textContent+' — '+pack.formNote);
    });
    document.querySelectorAll('[data-wa="model"]').forEach(function(anchor){whatsapp(anchor,pack.modelMessage);});
    document.querySelectorAll('[data-wa="activate"]').forEach(function(anchor){whatsapp(anchor,pack.activateMessage);});

    try{localStorage.setItem('digiy-resto-lang',lang);}catch(e){}
    if(updateAddress&&history.replaceState){
      try{
        var url=new URL(location.href);
        url.searchParams.set('lang',lang);
        history.replaceState({},'',url.pathname+url.search+url.hash);
      }catch(e){}
    }
  }

  function init(){
    document.querySelectorAll('[data-resto-lang]').forEach(function(button){
      button.addEventListener('click',function(){apply(button.getAttribute('data-resto-lang'),true);});
    });
    apply(initialLanguage(),false);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
