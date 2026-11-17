/* DIGIY RESTO · WORLD10 PUBLIC — couche de présentation uniquement.
 * Pas de modification des comptes, données restaurants, réservations, QR ou paiements.
 * Les traductions wolof devront être relues par un locuteur natif.
 */
(() => {
  "use strict";
  const langs = ["fr","en","es","pt","de","it","nl","ar","wo","zh"];
  const names = ["🇫🇷 FR","🇬🇧 EN","🇪🇸 ES","🇵🇹 PT","🇩🇪 DE","🇮🇹 IT","🇳🇱 NL","🇸🇦 AR","🇸🇳 WO","🇨🇳 ZH"];
  const rows = [
    ["RESA RESTO — Réserver une table","RESA RESTO — Book a table","RESA RESTO — Reservar mesa","RESA RESTO — Reservar mesa","RESA RESTO — Tisch reservieren","RESA RESTO — Prenota un tavolo","RESA RESTO — Tafel reserveren","RESA RESTO — حجز طاولة","RESA RESTO — Tànn taabal","RESA RESTO — 预订餐桌"],
    ["TEST RESA RESTO","TEST RESTO BOOKING","PRUEBA DE RESERVA","TESTE DE RESERVA","TEST-RESERVIERUNG","TEST PRENOTAZIONE","TESTRESERVERING","اختبار الحجز","TEST REZERVAASIYOŊ","预订测试"],
    ["Réserver une table.","Book a table.","Reservar una mesa.","Reservar uma mesa.","Tisch reservieren.","Prenota un tavolo.","Reserveer een tafel.","احجز طاولة.","Tànn taabal.","预订餐桌。"],
    ["Choisissez simplement le jour, l’heure, le nombre de personnes et la zone souhaitée. RESA applique automatiquement les règles choisies par le restaurant.","Choose a date, time, party size and preferred area. RESA follows the restaurant's own booking rules.","Elige fecha, hora, personas y zona. RESA aplica las reglas establecidas por el restaurante.","Escolha dia, hora, número de pessoas e zona. RESA aplica as regras definidas pelo restaurante.","Wählen Sie Tag, Uhrzeit, Personenzahl und Bereich. RESA übernimmt die Regeln des Restaurants.","Scegli giorno, ora, numero di persone e zona. RESA applica le regole del ristorante.","Kies dag, tijd, aantal personen en ruimte. RESA past de regels van het restaurant toe.","اختر اليوم والوقت وعدد الأشخاص والمنطقة. يطبق RESA قواعد المطعم تلقائيًا.","Tànnal bés, waxtu, ñaata nit ak béréb bi nga bëgg. RESA dafay topp yoonu restauraŋ bi.","选择日期、时间、人数及区域。RESA 自动按照餐厅设定的规则办理。"],
    ["Heure choisie","Selected time","Hora elegida","Hora escolhida","Gewählte Uhrzeit","Orario scelto","Gekozen tijd","الوقت المختار","Waxtu bi ñu tànn","所选时间"],
    ["Nombre de personnes","Number of guests","Número de personas","Número de pessoas","Personenzahl","Numero di persone","Aantal personen","عدد الأشخاص","Ñaata nit","人数"],
    ["Zone souhaitée","Preferred area","Zona preferida","Zona pretendida","Gewünschter Bereich","Zona preferita","Gewenste plek","المنطقة المطلوبة","Béréb bi nga bëgg","希望区域"],
    ["Chargement…","Loading…","Cargando…","A carregar…","Lädt…","Caricamento…","Laden…","جارٍ التحميل…","Yeb na…","加载中…"],
    ["Téléphone","Phone","Teléfono","Telefone","Telefon","Telefono","Telefoon","الهاتف","Telefon","电话"],
    ["Règle de réservation","Booking rule","Regla de reserva","Regra de reserva","Reservierungsregel","Regola di prenotazione","Reserveringsregel","قاعدة الحجز","Yoonu rezervaasiyoŋ","预订规则"],
    ["Chargement des règles du restaurant…","Loading restaurant rules…","Cargando reglas del restaurante…","A carregar as regras do restaurante…","Restaurantregeln werden geladen…","Caricamento delle regole del ristorante…","Restaurantregels laden…","جارٍ تحميل قواعد المطعم…","Yeb yoonu restauraŋ bi…","正在加载餐厅规则…"],
    ["Jours de fermeture : chargement…","Closing days: loading…","Días de cierre: cargando…","Dias de fecho: a carregar…","Ruhetage: werden geladen…","Giorni di chiusura: caricamento…","Sluitingsdagen: laden…","أيام الإغلاق: جارٍ التحميل…","Bés yi restauraŋ tëj: yeb…","休息日：加载中…"],
    ["Créneaux disponibles","Available time slots","Horarios disponibles","Horários disponíveis","Verfügbare Zeiten","Orari disponibili","Beschikbare tijden","المواعيد المتاحة","Waxtu yi féex","可订时段"],
    ["Choisissez le jour, la zone et le nombre de personnes.","Choose a date, area and number of guests.","Elige fecha, zona y personas.","Escolha dia, zona e número de pessoas.","Wählen Sie Tag, Bereich und Personenzahl.","Scegli giorno, zona e numero di persone.","Kies dag, ruimte en aantal personen.","اختر اليوم والمنطقة وعدد الأشخاص.","Tànnal bés, béréb ak ñaata nit.","选择日期、区域和人数。"],
    ["CONFIRMER MA RÉSERVATION →","CONFIRM MY BOOKING →","CONFIRMAR MI RESERVA →","CONFIRMAR A MINHA RESERVA →","RESERVIERUNG BESTÄTIGEN →","CONFERMA LA PRENOTAZIONE →","RESERVERING BEVESTIGEN →","تأكيد حجزي ←","DËGGAL SAMA REZERVAASIYOŊ →","确认预订 →"],
    ["RESA est accessible 24/24, mais seules les dates et heures déclarées ouvertes par le restaurant peuvent être réservées.","RESA is available 24/7, but only the restaurant's declared opening dates and times can be booked.","RESA funciona las 24 horas, pero solo pueden reservarse fechas y horas abiertas por el restaurante.","O RESA está disponível 24h, mas só aceita datas e horas abertas pelo restaurante.","RESA ist rund um die Uhr erreichbar, Reservierungen sind jedoch nur zu geöffneten Zeiten möglich.","RESA è disponibile 24 ore su 24, ma si può prenotare solo nei giorni e orari indicati dal ristorante.","RESA is 24/7 beschikbaar, maar boeken kan alleen op de openingstijden van het restaurant.","RESA متاح على مدار الساعة، لكن الحجز يقتصر على الأيام والأوقات التي يحددها المطعم.","RESA dafay dox 24/24, waaye bés ak waxtu yi restauraŋ bi ubbee rekk lañuy rezervé.","RESA 全天开放，但只能预订餐厅公布的营业日期和时段。"],
    ["⭐ DIGIY TRUST · Avis clients","⭐ DIGIY TRUST · Guest reviews","⭐ DIGIY TRUST · Opiniones","⭐ DIGIY TRUST · Avaliações","⭐ DIGIY TRUST · Gästebewertungen","⭐ DIGIY TRUST · Recensioni","⭐ DIGIY TRUST · Klantbeoordelingen","⭐ DIGIY TRUST · تقييمات العملاء","⭐ DIGIY TRUST · Xalaatu kiliyaan yi","⭐ DIGIY TRUST · 顾客评价"],
    ["Pas encore d’évaluation vérifiée.","No verified review yet.","Aún no hay reseñas verificadas.","Ainda não há avaliações verificadas.","Noch keine bestätigte Bewertung.","Nessuna recensione verificata.","Nog geen geverifieerde beoordeling.","لا توجد تقييمات موثقة بعد.","Amagul xalaat bu ñu dëggal.","尚无已核实的评价。"],
    ["Le rapport qualité-prix sera noté séparément, après une prestation réellement effectuée.","Value for money will be rated separately after a real visit.","La relación calidad-precio se evaluará por separado tras una visita real.","A relação qualidade/preço será avaliada separadamente após uma visita real.","Das Preis-Leistungs-Verhältnis wird nach einem echten Besuch separat bewertet.","Il rapporto qualità-prezzo sarà valutato separatamente dopo una visita reale.","Prijs-kwaliteit wordt apart beoordeeld na een echt bezoek.","ستُقيّم القيمة مقابل السعر بشكل منفصل بعد خدمة فعلية.","Njëg ak njëriñ dinañu ko seet gannaaw sarwiis bu dëgg.","实际消费后将单独评价性价比。"],
    ["Votre nom","Your name","Tu nombre","O seu nome","Ihr Name","Il tuo nome","Uw naam","اسمك","Sa tur","您的姓名"],
    ["Votre téléphone","Your phone number","Tu teléfono","O seu telefone","Ihre Telefonnummer","Il tuo telefono","Uw telefoonnummer","رقم هاتفك","Sa telefon","您的电话"],
    ["Évaluations des prestations RESTO","RESTO service reviews","Opiniones sobre servicios RESTO","Avaliações de serviços RESTO","Bewertungen der RESTO-Leistungen","Recensioni dei servizi RESTO","Beoordelingen van RESTO-diensten","تقييمات خدمات RESTO","Xalaatu sarwiis RESTO","RESTO 服务评价"],
  [
    "DIGIY RESTO — Restaurants · Contact direct",
    "DIGIY RESTO — Restaurants · Direct contact",
    "DIGIY RESTO — Restaurantes · Contacto directo",
    "DIGIY RESTO — Restaurantes · Contacto direto",
    "DIGIY RESTO — Restaurants · Direkter Kontakt",
    "DIGIY RESTO — Ristoranti · Contatto diretto",
    "DIGIY RESTO — Restaurants · Direct contact",
    "DIGIY RESTO — مطاعم · تواصل مباشر",
    "DIGIY RESTO — Lekkukaay · Jokkoo jub",
    "DIGIY RESTO — 餐厅 · 直接联系"
  ],
  [
    "Adhérents · restaurants · contact direct",
    "Members · restaurants · direct contact",
    "Miembros · restaurantes · contacto directo",
    "Membros · restaurantes · contacto direto",
    "Mitglieder · Restaurants · direkter Kontakt",
    "Aderenti · ristoranti · contatto diretto",
    "Leden · restaurants · direct contact",
    "أعضاء · مطاعم · تواصل مباشر",
    "Ñi bokk · lekkukaay · jokkoo jub",
    "会员 · 餐厅 · 直接联系"
  ],
  [
    "0 % COMMISSION",
    "0% COMMISSION",
    "0 % COMISIÓN",
    "0 % COMISSÃO",
    "0 % PROVISION",
    "0% COMMISSIONI",
    "0% COMMISSIE",
    "0٪ عمولة",
    "0 % KOMISOŊ",
    "0% 佣金"
  ],
  [
    "🔐 Propriétaires : ouvrez la fiche de",
    "🔐 Owners: open the profile of",
    "🔐 Propietarios: abran la ficha de",
    "🔐 Proprietários: abram a ficha de",
    "🔐 Inhaber: Öffnen Sie das Profil von",
    "🔐 Proprietari: aprite la scheda del",
    "🔐 Eigenaren: open het profiel van",
    "🔐 للمالكين: افتحوا صفحة",
    "🔐 Boroom yi: ubbileen fichu",
    "🔐 业主：请打开"
  ],
  [
    "votre restaurant",
    "your restaurant",
    "su restaurante",
    "o seu restaurante",
    "Ihrem Restaurant",
    "vostro ristorante",
    "uw restaurant",
    "مطعمكم",
    "seen restauraŋ",
    "您的餐厅资料"
  ],
  [
    ", puis son accès sécurisé. Aucun site test n’est choisi à votre place.",
    ", then its secure owner access. No test restaurant is selected for you.",
    ", y después su acceso seguro. No se seleccionará un restaurante de prueba por ustedes.",
    ", e depois o acesso seguro. Nenhum restaurante de teste é selecionado automaticamente.",
    ", und danach den sicheren Zugang. Es wird kein Testrestaurant für Sie ausgewählt.",
    ", poi il suo accesso sicuro. Nessun ristorante di prova sarà selezionato automaticamente.",
    ", en vervolgens de beveiligde toegang. Er wordt geen testrestaurant voor u geselecteerd.",
    "، ثم الدخول الآمن. لن يتم اختيار أي مطعم تجريبي نيابةً عنكم.",
    ", te sa dugg bu wóor. Duñu tànn restauraŋ bu test ci seen tur.",
    "，然后进入安全业主入口。系统不会替您选择测试餐厅。"
  ],
  [
    "← RETOUR DIGIYLYFE.COM",
    "← BACK TO DIGIYLYFE.COM",
    "← VOLVER A DIGIYLYFE.COM",
    "← VOLTAR A DIGIYLYFE.COM",
    "← ZURÜCK ZU DIGIYLYFE.COM",
    "← TORNA A DIGIYLYFE.COM",
    "← TERUG NAAR DIGIYLYFE.COM",
    "العودة إلى DIGIYLYFE.COM →",
    "← DELLU DIGIYLYFE.COM",
    "← 返回 DIGIYLYFE.COM"
  ],
  [
    "Restaurant traditionnel · Gastronomie périgourdine",
    "Traditional restaurant · Périgord cuisine",
    "Restaurante tradicional · Gastronomía del Périgord",
    "Restaurante tradicional · Gastronomia do Périgord",
    "Traditionelles Restaurant · Périgord-Küche",
    "Ristorante tradizionale · Cucina del Périgord",
    "Traditioneel restaurant · Périgord-keuken",
    "مطعم تقليدي · مطبخ بيريغور",
    "Restauraŋ bu cosaan · Lekk yu Périgord",
    "传统餐厅 · 佩里戈尔美食"
  ],
  [
    "Cuisine périgourdine",
    "Périgord cuisine",
    "Cocina del Périgord",
    "Cozinha do Périgord",
    "Périgord-Küche",
    "Cucina del Périgord",
    "Périgord-keuken",
    "مطبخ بيريغور",
    "Lekk yu Périgord",
    "佩里戈尔菜"
  ],
  [
    "Foie gras maison",
    "House-made foie gras",
    "Foie gras casero",
    "Foie gras da casa",
    "Hausgemachte Foie gras",
    "Foie gras fatto in casa",
    "Huisgemaakte foie gras",
    "فوا غرا منزلية",
    "Foie gras bu ñu def fii",
    "自制鹅肝"
  ],
  [
    "Confit de canard",
    "Duck confit",
    "Confit de pato",
    "Confit de pato",
    "Entenconfit",
    "Confit d'anatra",
    "Eendenconfit",
    "كونفي البط",
    "Confit bu ganaar",
    "油封鸭"
  ],
  [
    "Terrasse",
    "Terrace",
    "Terraza",
    "Terraço",
    "Terrasse",
    "Terrazza",
    "Terras",
    "شرفة خارجية",
    "Teras",
    "露台"
  ],
  [
    "Restaurant traditionnel au cœur de Sarlat-la-Canéda, cuisine périgourdine et produits du terroir.",
    "Traditional restaurant in the heart of Sarlat-la-Canéda serving Périgord cuisine and local produce.",
    "Restaurante tradicional en el centro de Sarlat-la-Canéda, cocina del Périgord y productos locales.",
    "Restaurante tradicional no centro de Sarlat-la-Canéda, cozinha do Périgord e produtos locais.",
    "Traditionelles Restaurant im Herzen von Sarlat-la-Canéda mit Périgord-Küche und regionalen Produkten.",
    "Ristorante tradizionale nel cuore di Sarlat-la-Canéda, cucina del Périgord e prodotti locali.",
    "Traditioneel restaurant in het hart van Sarlat-la-Canéda, met Périgord-gerechten en lokale producten.",
    "مطعم تقليدي في قلب سارلا لا كانيدا يقدم مأكولات بيريغور ومنتجات محلية.",
    "Restauraŋ bu cosaan ci diggu Sarlat-la-Canéda, lekk yu Périgord ak lu jóge ci dëkk bi.",
    "位于萨拉拉卡内达中心的传统餐厅，供应佩里戈尔菜及当地食材。"
  ],
  [
    "Menus, horaires, disponibilité et réservation : accord direct avec Le Malraux, sous sa responsabilité.",
    "Menus, opening hours, availability and bookings are agreed directly with Le Malraux, under its responsibility.",
    "Menús, horarios, disponibilidad y reservas se acuerdan directamente con Le Malraux, bajo su responsabilidad.",
    "Menus, horários, disponibilidade e reservas são acordados diretamente com Le Malraux, sob sua responsabilidade.",
    "Menüs, Öffnungszeiten, Verfügbarkeit und Reservierungen werden direkt mit Le Malraux vereinbart.",
    "Menu, orari, disponibilità e prenotazioni si concordano direttamente con Le Malraux, sotto la sua responsabilità.",
    "Menu's, openingstijden, beschikbaarheid en reserveringen worden rechtstreeks met Le Malraux afgesproken.",
    "القوائم والمواعيد والتوفر والحجوزات بالتنسيق المباشر مع Le Malraux وعلى مسؤوليته.",
    "Menu, waxtu, li féex ak rezervaasiyoŋ dañuy ko waxante jub ak Le Malraux, ci ay ndigalam.",
    "菜单、营业时间、空位及预订由顾客直接与 Le Malraux 确认，餐厅自行负责。"
  ],
  [
    "Brasserie · Pizzeria · Terrasse cathédrale",
    "Brasserie · Pizzeria · Cathedral terrace",
    "Brasserie · Pizzería · Terraza junto a la catedral",
    "Brasserie · Pizzaria · Terraço junto à catedral",
    "Brasserie · Pizzeria · Terrasse an der Kathedrale",
    "Brasserie · Pizzeria · Terrazza presso la cattedrale",
    "Brasserie · Pizzeria · Terras bij kathedraal",
    "براسيري · بيتزا · شرفة قرب الكاتدرائية",
    "Brasserie · Pizzeria · Teras ci wetu katëdraal",
    "小酒馆 · 披萨店 · 教堂旁露台"
  ],
  [
    "Brasserie",
    "Brasserie",
    "Brasserie",
    "Brasserie",
    "Brasserie",
    "Brasserie",
    "Brasserie",
    "براسيري",
    "Brasserie",
    "小酒馆"
  ],
  [
    "Pizzeria",
    "Pizzeria",
    "Pizzería",
    "Pizzaria",
    "Pizzeria",
    "Pizzeria",
    "Pizzeria",
    "بيتزا",
    "Pizzeria",
    "披萨店"
  ],
  [
    "Pizzas artisanales",
    "Handmade pizzas",
    "Pizzas artesanales",
    "Pizzas artesanais",
    "Handgemachte Pizzen",
    "Pizze artigianali",
    "Ambachtelijke pizza's",
    "بيتزا حرفية",
    "Pizza yu ñu def ak loxo",
    "手工披萨"
  ],
  [
    "Terrasse cathédrale",
    "Cathedral terrace",
    "Terraza junto a la catedral",
    "Terraço junto à catedral",
    "Kathedralenterrasse",
    "Terrazza presso la cattedrale",
    "Terras bij kathedraal",
    "شرفة قرب الكاتدرائية",
    "Teras ci wetu katëdraal",
    "教堂旁露台"
  ],
  [
    "Brasserie et pizzeria face à la cathédrale Saint-Sacerdos de Sarlat-la-Canéda.",
    "Brasserie and pizzeria opposite the Saint-Sacerdos Cathedral in Sarlat-la-Canéda.",
    "Brasserie y pizzería frente a la catedral Saint-Sacerdos en Sarlat-la-Canéda.",
    "Brasserie e pizzaria em frente à catedral Saint-Sacerdos de Sarlat-la-Canéda.",
    "Brasserie und Pizzeria gegenüber der Kathedrale Saint-Sacerdos in Sarlat-la-Canéda.",
    "Brasserie e pizzeria davanti alla cattedrale Saint-Sacerdos di Sarlat-la-Canéda.",
    "Brasserie en pizzeria tegenover de kathedraal Saint-Sacerdos in Sarlat-la-Canéda.",
    "براسيري وبيتزا مقابل كاتدرائية سان ساكيردوس في سارلا لا كانيدا.",
    "Brasserie ak pizzeria ci kanamu katëdraal Saint-Sacerdos ci Sarlat-la-Canéda.",
    "位于萨拉拉卡内达圣萨塞尔多主教座堂对面的法式小酒馆及披萨店。"
  ],
  [
    "Menus, horaires, disponibilité et réservation : accord direct avec L’Entre 2, sous sa responsabilité.",
    "Menus, hours, availability and reservations are agreed directly with L’Entre 2, under its responsibility.",
    "Menús, horarios, disponibilidad y reservas se acuerdan directamente con L’Entre 2.",
    "Menus, horários, disponibilidade e reservas são acordados diretamente com L’Entre 2.",
    "Menüs, Öffnungszeiten, Verfügbarkeit und Reservierungen direkt mit L’Entre 2 vereinbaren.",
    "Menu, orari, disponibilità e prenotazioni da concordare direttamente con L’Entre 2.",
    "Menu's, tijden, beschikbaarheid en reserveringen rechtstreeks met L’Entre 2 afspreken.",
    "القوائم والمواعيد والتوفر والحجوزات بالتنسيق المباشر مع L’Entre 2.",
    "Menu, waxtu, li féex ak rezervaasiyoŋ dañuy ko waxante jub ak L’Entre 2.",
    "菜单、营业时间、空位及预订请直接与 L’Entre 2 确认。"
  ],
  [
    "au restaurant",
    "to the restaurant",
    "al restaurante",
    "ao restaurante",
    "an das Restaurant",
    "al ristorante",
    "aan het restaurant",
    "إلى المطعم",
    "ci restauraŋ bi",
    "直接向餐厅"
  ],
  [
    "Scannez pour ouvrir sa présence DIGIYLYFE.",
    "Scan to open the DIGIYLYFE profile.",
    "Escanea para abrir su perfil DIGIYLYFE.",
    "Digitalize para abrir o perfil DIGIYLYFE.",
    "Scannen, um das DIGIYLYFE-Profil zu öffnen.",
    "Scansiona per aprire il profilo DIGIYLYFE.",
    "Scan om het DIGIYLYFE-profiel te openen.",
    "امسح الرمز لفتح صفحة DIGIYLYFE.",
    "Scan ngir ubbi fich DIGIYLYFE bi.",
    "扫码打开 DIGIYLYFE 商家主页。"
  ],
  [
    "📞 APPELER",
    "📞 CALL",
    "📞 LLAMAR",
    "📞 LIGAR",
    "📞 ANRUFEN",
    "📞 CHIAMA",
    "📞 BELLEN",
    "📞 اتصال",
    "📞 WOOW",
    "📞 致电"
  ],
  [
    "🔐 ACCÈS PROPRIÉTAIRE",
    "🔐 OWNER ACCESS",
    "🔐 ACCESO PROPIETARIO",
    "🔐 ACESSO PROPRIETÁRIO",
    "🔐 INHABERZUGANG",
    "🔐 ACCESSO PROPRIETARIO",
    "🔐 EIGENAARSTOEGANG",
    "🔐 دخول المالك",
    "🔐 DUGGUB BOROOM",
    "🔐 业主入口"
  ]
];
  const phrases = new Map();
  for (const row of rows) {
    if (row.length !== 10 || phrases.has(row[0])) throw new Error("WORLD10 PUBLIC duplicate/missing "+row[0]);
    phrases.set(row[0], row);
  }
  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  let lang = new URLSearchParams(location.search).get("lang");
  if (!langs.includes(lang)) {
    try { lang = localStorage.getItem("digiy_resto_public_lang"); } catch (_) {}
  }
  if (!langs.includes(lang)) lang = "fr";
  const t = french => {
    const row = phrases.get(french);
    return row ? row[langs.indexOf(lang)] : french;
  };

  function isBusinessContent(el) {
    // Menu QR publié : le restaurant possède lui-même titres, rubriques, plats et prix.
    if (location.pathname.endsWith("/menu-qr.html")) {
      return !!el.closest("#title, #intro, #sections h2, .dish-name, .desc, .price, #posterName");
    }
    // Ne jamais convertir une valeur saisie dans un champ ou des données structurées.
    return !!el.closest("input, textarea, option[value][data-business], [data-business-text]");
  }
  function translateText(node) {
    const parent = node?.parentElement;
    if (!parent || parent.closest("script,style,noscript,textarea,code") || isBusinessContent(parent)) return;
    let original = originalText.get(node);
    if (original === undefined) { original = node.nodeValue; originalText.set(node, original); }
    const value = original.trim();
    let next = t(value);
    if (value.startsWith("Version publiée le ")) {
      next = t("Version publiée le ") + value.slice("Version publiée le ".length);
    } else if (value.startsWith("Prochain créneau disponible : ")) {
      next = t("Prochain créneau disponible : ") + value.slice("Prochain créneau disponible : ".length);
    } else if (value.startsWith("Jours de fermeture habituels : ")) {
      next = t("Jours de fermeture habituels : ") + value.slice("Jours de fermeture habituels : ".length);
    }
    const leading = (original.match(/^\s*/) || [""])[0];
    const trailing = (original.match(/\s*$/) || [""])[0];
    const proposed = value ? leading + next + trailing : original;
    if (node.nodeValue !== proposed) node.nodeValue = proposed;
  }
  const localizeLink = a => {
    if (a.matches("a[href^='tel:'],a[href^='mailto:']")) return;
    const href=a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
    let url; try { url=new URL(href,location.href); } catch (_) { return; }
    if (url.origin!==location.origin && url.hostname!=="digiylyfe.com") return;
    if (url.searchParams.get("lang")===lang) return;
    url.searchParams.set("lang",lang);
    a.setAttribute("href",url.toString());
  };
  function translatePage() {
    document.documentElement.lang=lang;
    document.documentElement.dir=lang==="ar"?"rtl":"ltr";
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) translateText(walker.currentNode);
    for (const attr of ["aria-label","placeholder","title","alt"]) {
      document.querySelectorAll("["+attr+"]").forEach(el=>{
        if (isBusinessContent(el)) return;
        let old = originalAttributes.get(el);
        if (!old) {old={};originalAttributes.set(el,old);}
        if (!(attr in old)) old[attr]=el.getAttribute(attr);
        const source=old[attr], target=t(source);
        if (source && phrases.has(source) && el.getAttribute(attr)!==target) el.setAttribute(attr,target);
      });
    }
    const title=phrases.get(document.documentElement.dataset.world10Title||document.title);
    if (title) document.title=t(title[0]);
    const meta=document.querySelector('meta[name="description"]');
    if (meta && phrases.has(meta.dataset.world10Original||meta.content)) {
      if (!meta.dataset.world10Original) meta.dataset.world10Original=meta.content;
      meta.content=t(meta.dataset.world10Original);
    }
    const picker=document.getElementById("restoPublicWorld10");
    if (picker) {picker.value=lang;picker.setAttribute("aria-label",t("Langue"));}
    document.querySelectorAll("a[href]").forEach(localizeLink);
  }
  function setLang(next) {
    if (!langs.includes(next)) return;
    lang=next;
    try { localStorage.setItem("digiy_resto_public_lang",lang); } catch (_) {}
    const u=new URL(location.href);u.searchParams.set("lang",lang);
    history.replaceState(null,"",u);
    translatePage();
  }
  function boot() {
    document.documentElement.dataset.world10Title=document.title;
    const hasHomepagePicker=!!document.getElementById("langs");
    const header=document.querySelector("header .topActions") || document.querySelector("header .wrap") || document.querySelector("body > header");
    if (header && !hasHomepagePicker && !document.getElementById("restoPublicWorld10")) {
      const picker=document.createElement("select");picker.id="restoPublicWorld10";
      picker.style.cssText="flex-shrink:0;max-width:122px;min-height:39px;border:2px solid #d8ad46;border-radius:10px;background:#fff;color:#073f32;padding:7px;font:900 12px system-ui;direction:ltr";
      picker.setAttribute("aria-label","Langue");
      for(let i=0;i<langs.length;i++) {
        const opt=document.createElement("option");opt.value=langs[i];opt.textContent=names[i];picker.appendChild(opt);
      }
      picker.addEventListener("change",()=>setLang(picker.value));
      header.appendChild(picker);
    }
    translatePage();
    const observer=new MutationObserver(()=>translatePage());
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    window.DIGIY_RESTO_PUBLIC_WORLD10={locales:langs.slice(),getLang:()=>lang,setLang,t};
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();
