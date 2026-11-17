/* DIGIY RESTO · WORLD10 PUBLIC — couche de présentation uniquement.
 * Pas de modification des comptes, données restaurants, réservations, QR ou paiements.
 * Les traductions wolof devront être relues par un locuteur natif.
 */
(() => {
  "use strict";
  const langs = ["fr","en","es","pt","de","it","nl","ar","wo","zh"];
  const names = ["🇫🇷 FR","🇬🇧 EN","🇪🇸 ES","🇵🇹 PT","🇩🇪 DE","🇮🇹 IT","🇳🇱 NL","🇸🇦 AR","🇸🇳 WO","🇨🇳 ZH"];
  const rows = [
    ["← Restaurants DIGIY","← DIGIY restaurants","← Restaurantes DIGIY","← Restaurantes DIGIY","← DIGIY Restaurants","← Ristoranti DIGIY","← DIGIY restaurants","مطاعم DIGIY →","← Lekkukaay DIGIY","← DIGIY 餐厅"],
    ["Fiche professionnelle · Sarlat-la-Canéda","Business profile · Sarlat-la-Canéda","Ficha profesional · Sarlat-la-Canéda","Perfil profissional · Sarlat-la-Canéda","Unternehmensprofil · Sarlat-la-Canéda","Profilo professionale · Sarlat-la-Canéda","Bedrijfsprofiel · Sarlat-la-Canéda","ملف مهني · سارلا لا كانيدا","Fichu liggéey · Sarlat-la-Canéda","商家主页 · 萨拉拉卡内达"],
    ["Cuisine périgourdine, spécialités du terroir et accueil au cœur de Sarlat-la-Canéda.","Périgord cuisine, local specialties and a warm welcome in central Sarlat-la-Canéda.","Cocina del Périgord, especialidades locales y acogida en el centro de Sarlat-la-Canéda.","Cozinha do Périgord, especialidades locais e acolhimento no centro de Sarlat-la-Canéda.","Périgord-Küche, regionale Spezialitäten und Gastfreundschaft im Zentrum von Sarlat-la-Canéda.","Cucina del Périgord, specialità locali e accoglienza nel centro di Sarlat-la-Canéda.","Périgord-keuken, lokale specialiteiten en gastvrijheid in het centrum van Sarlat-la-Canéda.","مطبخ بيريغور وأطباق محلية وضيافة في قلب سارلا لا كانيدا.","Lekk yu Périgord, lekk yu dëkk bi ak nangu nit ci diggu Sarlat-la-Canéda.","佩里戈尔菜、当地特色美食及萨拉拉卡内达中心的热情款待。"],
    ["Brasserie et pizzeria à Sarlat-la-Canéda, avec terrasse près de la cathédrale Saint-Sacerdos.","Brasserie and pizzeria in Sarlat-la-Canéda with a terrace near Saint-Sacerdos Cathedral.","Brasserie y pizzería en Sarlat-la-Canéda, con terraza cerca de la catedral Saint-Sacerdos.","Brasserie e pizzaria em Sarlat-la-Canéda, com terraço perto da catedral Saint-Sacerdos.","Brasserie und Pizzeria in Sarlat-la-Canéda mit Terrasse nahe der Kathedrale Saint-Sacerdos.","Brasserie e pizzeria a Sarlat-la-Canéda con terrazza vicino alla cattedrale Saint-Sacerdos.","Brasserie en pizzeria in Sarlat-la-Canéda met terras nabij kathedraal Saint-Sacerdos.","براسيري وبيتزا في سارلا لا كانيدا مع شرفة قرب كاتدرائية سان ساكيردوس.","Brasserie ak pizzeria ci Sarlat-la-Canéda, ak teras ci wetu katëdraal Saint-Sacerdos.","位于萨拉拉卡内达的法式小酒馆与披萨店，露台靠近圣萨塞尔多主教座堂。"],
    ["📍 Adresse","📍 Address","📍 Dirección","📍 Morada","📍 Adresse","📍 Indirizzo","📍 Adres","📍 العنوان","📍 Adres","📍 地址"],
    ["📞 Contact direct","📞 Direct contact","📞 Contacto directo","📞 Contacto direto","📞 Direktkontakt","📞 Contatto diretto","📞 Direct contact","📞 تواصل مباشر","📞 Jokkoo jub","📞 直接联系"],
    ["📞 APPELER LE MALRAUX","📞 CALL LE MALRAUX","📞 LLAMAR A LE MALRAUX","📞 LIGAR PARA LE MALRAUX","📞 LE MALRAUX ANRUFEN","📞 CHIAMA LE MALRAUX","📞 BEL LE MALRAUX","📞 الاتصال بـ LE MALRAUX","📞 WOOW LE MALRAUX","📞 致电 LE MALRAUX"],
    ["📞 APPELER L’ENTRE 2","📞 CALL L’ENTRE 2","📞 LLAMAR A L’ENTRE 2","📞 LIGAR PARA L’ENTRE 2","📞 L’ENTRE 2 ANRUFEN","📞 CHIAMA L’ENTRE 2","📞 BEL L’ENTRE 2","📞 الاتصال بـ L’ENTRE 2","📞 WOOW L’ENTRE 2","📞 致电 L’ENTRE 2"],
    ["↗ VOIR LE SITE & LA CARTE","↗ VIEW SITE & MENU","↗ VER WEB Y CARTA","↗ VER SITE E CARTA","↗ WEBSITE & KARTE","↗ SITO E MENU","↗ WEBSITE & KAART","↗ الموقع والقائمة","↗ XOOL SITE AK KART","↗ 查看官网与菜单"],
    ["🥡 À EMPORTER · SE RENSEIGNER","🥡 TAKEAWAY · ASK DIRECTLY","🥡 PARA LLEVAR · CONSULTAR","🥡 TAKEAWAY · INFORMAR-SE","🥡 ZUM MITNEHMEN · ANFRAGEN","🥡 ASPORTO · CHIEDI","🥡 AFHALEN · INFORMEREN","🥡 سفري · استفسر","🥡 LEKK NGIR YÓBBU · LAAJ","🥡 外带 · 直接咨询"],
    ["🍕 VOIR L’APERÇU À EMPORTER","🍕 VIEW TAKEAWAY PREVIEW","🍕 VER VISTA PARA LLEVAR","🍕 VER PRÉ-VISUALIZAÇÃO TAKEAWAY","🍕 ABHOL-VORSCHAU ANSEHEN","🍕 VEDI ANTEPRIMA ASPORTO","🍕 BEKIJK AFHAALVOORBEELD","🍕 عرض معاينة الطلبات الخارجية","🍕 XOOL DEMO LEKK YÓBBU","🍕 查看外带预览"],
    ["🍽️ TOUS LES RESTAURANTS","🍽️ ALL RESTAURANTS","🍽️ TODOS LOS RESTAURANTES","🍽️ TODOS OS RESTAURANTES","🍽️ ALLE RESTAURANTS","🍽️ TUTTI I RISTORANTI","🍽️ ALLE RESTAURANTS","🍽️ جميع المطاعم","🍽️ LEKKUKAAY YÉPP","🍽️ 所有餐厅"],
    ["Gestion du restaurant :","Restaurant management:","Gestión del restaurante:","Gestão do restaurante:","Restaurantverwaltung:","Gestione del ristorante:","Restaurantbeheer:","إدارة المطعم:","Saytu restauraŋ bi:","餐厅管理："],
    ["Accès réservé au propriétaire autorisé du Malraux. Le rattachement du compte reste à confirmer ; le code reçu par email ne remplace pas les contrôles de propriété.","Only the authorized Le Malraux owner can access management. Account linkage remains to be confirmed; the emailed code does not replace ownership checks.","Solo el propietario autorizado de Le Malraux puede acceder. Falta confirmar la vinculación; el código por correo no sustituye la verificación.","Acesso reservado ao proprietário autorizado do Le Malraux. A associação da conta aguarda confirmação; o código não substitui a verificação.","Zugang nur für den berechtigten Inhaber von Le Malraux. Kontozuordnung noch zu bestätigen; der E-Mail-Code ersetzt keine Eigentumsprüfung.","Accesso solo al proprietario autorizzato di Le Malraux. Il collegamento account è da confermare; il codice email non sostituisce i controlli.","Alleen voor de bevoegde eigenaar van Le Malraux. De accountkoppeling moet worden bevestigd; een e-mailcode vervangt geen eigenaarscontrole.","الدخول متاح فقط لمالك Le Malraux المخوّل. ربط الحساب بانتظار التأكيد؛ رمز البريد لا يحل محل التحقق من الملكية.","Duggub saytu Le Malraux boroom bi ñu nangu rekk la. Lëkkaloo kont bi war nañu ko dëggal; kóodu imeel du wuutu seetu boroom.","只有获授权的 Le Malraux 业主可以管理。账户关联仍待确认，邮件验证码不能替代业主身份验证。"],
    ["Accès propriétaire en préparation : le rattachement et l’email de gestion de L’Entre 2 ne sont pas encore configurés. Aucun accès à la gestion n’est ouvert sans validation du restaurant.","Owner access is being prepared: L’Entre 2 account linkage and management email are not configured. Management stays locked until restaurant approval.","Acceso propietario en preparación: aún no están configurados la vinculación ni el correo de L’Entre 2. Sin aprobación no se abre la gestión.","Acesso proprietário em preparação: a associação e email de gestão do L’Entre 2 ainda não estão configurados. Gestão bloqueada até validação.","Inhaberzugang in Vorbereitung: Konto und Verwaltungs-E-Mail für L’Entre 2 sind noch nicht eingerichtet. Ohne Zustimmung bleibt der Zugang gesperrt.","Accesso proprietario in preparazione: collegamento ed email di L’Entre 2 non sono configurati. Gestione bloccata fino all'approvazione.","Eigenaarstoegang in voorbereiding: accountkoppeling en beheermail van L’Entre 2 ontbreken nog. Beheer blijft geblokkeerd tot goedkeuring.","دخول المالك قيد التجهيز: لم يتم إعداد ربط حساب L’Entre 2 أو بريد الإدارة. تظل الإدارة مغلقة حتى موافقة المطعم.","Duggub boroom L’Entre 2 ñu koy waajal: lëkkaloo ak imeel saytu amaguñu. Kenn du ubbi saytu ba restauraŋ dëggalee.","L’Entre 2 的业主入口仍在准备中：账户关联及管理邮箱尚未配置。未经餐厅确认不得进入后台。"],
    ["Rapport qualité-prix noté séparément dès que des prestations réelles auront été vérifiées.","Value for money will be rated separately once real visits have been verified.","La relación calidad-precio se evaluará por separado tras verificar visitas reales.","A relação qualidade/preço será avaliada separadamente após verificar serviços reais.","Das Preis-Leistungs-Verhältnis wird nach geprüften echten Besuchen separat bewertet.","Il rapporto qualità-prezzo sarà valutato separatamente dopo visite reali verificate.","Prijs-kwaliteit wordt apart beoordeeld zodra echte bezoeken zijn geverifieerd.","ستُقيّم القيمة مقابل السعر بشكل منفصل بعد توثيق زيارات فعلية.","Njëg ak njëriñ dinañu ko seet gannaaw seetu sarwiis bu dëgg.","经核实真实消费后，将单独评价性价比。"],
    ["Réservation et paiement directement auprès du restaurant. DIGIYLYFE ne collecte aucun paiement et ne prélève aucune commission. Pour les menus, les prix et les horaires actuels, consultez le site du restaurant ou appelez-le.","Book and pay directly with the restaurant. DIGIYLYFE collects no payment and takes no commission. Check the restaurant's own website or call for current menus, prices and hours.","Reservas y pagos directamente al restaurante. DIGIYLYFE no cobra ni recibe comisiones. Consulta la web del restaurante o llama para menús, precios y horarios.","Reserve e pague diretamente ao restaurante. DIGIYLYFE não recebe pagamentos nem comissões. Consulte o site do restaurante ou ligue para confirmar menus, preços e horários.","Reservierung und Zahlung erfolgen direkt beim Restaurant. DIGIYLYFE erhält keine Zahlung und keine Provision. Aktuelle Menüs, Preise und Zeiten bitte direkt erfragen.","Prenotazioni e pagamenti direttamente al ristorante. DIGIYLYFE non incassa pagamenti né commissioni. Consulta il sito del ristorante o chiama per menu, prezzi e orari.","Reserveren en betalen rechtstreeks bij het restaurant. DIGIYLYFE ontvangt geen betalingen of commissie. Raadpleeg de restaurantsite of bel voor menu's, prijzen en tijden.","الحجز والدفع مباشرة لدى المطعم. لا تتلقى DIGIYLYFE مدفوعات أو عمولات. تحقق من القائمة والأسعار والمواعيد عبر موقع المطعم أو اتصل به.","Rezervaasiyoŋ ak fay ci restauraŋ bi la. DIGIYLYFE du jël peymaŋ walla komisoŋ. Xoolal site bi walla woow restauraŋ bi ngir menu, njëg ak waxtu.","预订与付款直接向餐厅办理。DIGIYLYFE 不收款、不抽佣。当前菜单、价格和营业时间请查看餐厅官网或电话咨询。"],
    ["DIGIY RESTO · Votre activité, votre territoire, votre contact direct · 0 % commission","DIGIY RESTO · Your business, your place, your direct contact · 0% commission","DIGIY RESTO · Tu negocio, tu territorio, tu contacto directo · 0 % comisión","DIGIY RESTO · O seu negócio, a sua região, contacto direto · 0 % comissão","DIGIY RESTO · Ihr Geschäft, Ihre Region, direkter Kontakt · 0 % Provision","DIGIY RESTO · La tua attività, il tuo territorio, contatto diretto · 0% commissioni","DIGIY RESTO · Uw bedrijf, uw regio, direct contact · 0% commissie","DIGIY RESTO · نشاطك ومنطقتك وتواصلك المباشر · 0٪ عمولة","DIGIY RESTO · Sa liggéey, sa béréb, sa jokkoo jub · 0 % komisoŋ","DIGIY RESTO · 您的生意、您的地区、直接联系 · 零佣金"],
    ["Aucun créneau réservable ce jour.","No bookable slot on this day.","No hay horarios disponibles ese día.","Sem horários disponíveis neste dia.","An diesem Tag keine buchbaren Zeiten.","Nessun orario prenotabile per questo giorno.","Geen tijdsloten beschikbaar op deze dag.","لا توجد مواعيد للحجز في هذا اليوم.","Amul waxtu bu féex ci bés bii.","当天没有可预订时段。"],
    ["Créneau disponible","Slot available","Horario disponible","Horário disponível","Zeit verfügbar","Orario disponibile","Tijd beschikbaar","موعد متاح","Waxtu bu féex","时段可订"],
    ["Disponible","Available","Disponible","Disponível","Verfügbar","Disponibile","Beschikbaar","متاح","Am na","可订"],
    ["Indisponible","Unavailable","No disponible","Indisponível","Nicht verfügbar","Non disponibile","Niet beschikbaar","غير متاح","Amul","不可用"],
    ["Aucune zone","No area","Sin zona","Sem zona","Kein Bereich","Nessuna zona","Geen ruimte","لا توجد منطقة","Amul béréb","无区域"],
    [" couverts max"," guests max"," comensales máx."," lugares máx."," Gäste max."," coperti max."," gasten max."," ضيوف كحد أقصى"," nit la ëppul"," 位上限"],
    ["Choisissez un créneau disponible.","Choose an available time.","Elige un horario disponible.","Escolha um horário disponível.","Wählen Sie eine verfügbare Zeit.","Scegli un orario disponibile.","Kies een beschikbare tijd.","اختر موعدًا متاحًا.","Tànnal waxtu bu féex.","请选择可订时段。"],
    ["Complet pour cette zone et ce nombre de personnes.","Fully booked for this area and party size.","Completo para esta zona y número de personas.","Lotado para esta zona e número de pessoas.","Für diesen Bereich und diese Personenzahl ausgebucht.","Completo per questa zona e numero di persone.","Volgeboekt voor deze plek en groepsgrootte.","مكتمل لهذه المنطقة وهذا العدد من الضيوف.","Béréb bii fees na ci ñaata nit yii.","该区域及人数已满。"],
    ["Restaurant fermé ce jour.","Restaurant closed on this day.","Restaurante cerrado ese día.","Restaurante encerrado neste dia.","Restaurant an diesem Tag geschlossen.","Ristorante chiuso questo giorno.","Restaurant gesloten op deze dag.","المطعم مغلق في هذا اليوم.","Restauraŋ bi tëj na tey.","餐厅当天休息。"],
    ["Vérification des créneaux…","Checking available times…","Comprobando horarios…","A verificar horários…","Verfügbare Zeiten werden geprüft…","Verifica degli orari disponibili…","Beschikbare tijden controleren…","جارٍ التحقق من المواعيد…","Seet waxtu yi féex…","正在检查可订时段…"],
    ["Créneaux indisponibles pour le moment.","Time slots temporarily unavailable.","Los horarios no están disponibles ahora.","Horários temporariamente indisponíveis.","Zeiten momentan nicht verfügbar.","Orari temporaneamente non disponibili.","Tijdsloten tijdelijk niet beschikbaar.","المواعيد غير متاحة حاليًا.","Waxtu yi féex amuñu léegi.","暂时无法查询时段。"],
    ["Prochain créneau disponible : ","Next available slot: ","Próximo horario disponible: ","Próximo horário disponível: ","Nächster verfügbarer Termin: ","Prossimo orario disponibile: ","Volgende beschikbare tijd: ","الموعد التالي المتاح: ","Waxtu bi ci topp bu féex: ","下一个可订时段："],
    ["Aucun créneau disponible trouvé sur les 7 prochains jours pour cette zone.","No available slot found in the next seven days for this area.","No hay horarios disponibles en esta zona durante los próximos siete días.","Não há horários disponíveis para esta zona nos próximos sete dias.","Für diesen Bereich in den nächsten sieben Tagen kein Termin frei.","Nessun orario disponibile in quest'area nei prossimi sette giorni.","Geen beschikbaar tijdslot in dit gebied gedurende de komende zeven dagen.","لا توجد مواعيد متاحة لهذه المنطقة خلال الأيام السبعة المقبلة.","Amul waxtu bu féex ci béréb bii ci 7 bés yi di ñëw.","该区域未来七天无可订时段。"],
    ["Jours de fermeture habituels : ","Regular closing days: ","Días de cierre habituales: ","Dias habituais de encerramento: ","Regelmäßige Ruhetage: ","Giorni abituali di chiusura: ","Vaste sluitingsdagen: ","أيام الإغلاق المعتادة: ","Bés yi restauraŋ daan tëj: ","常规休息日："],
    ["Aucun jour de fermeture hebdomadaire déclaré.","No regular weekly closing day declared.","No se han indicado días de cierre semanales.","Não foram declarados dias de fecho semanais.","Keine regelmäßigen Ruhetage angegeben.","Nessun giorno di chiusura settimanale indicato.","Geen vaste wekelijkse sluitingsdag opgegeven.","لم يتم تحديد يوم إغلاق أسبوعي.","Waxaguñu benn bés bu restauraŋ di tëj ci ayu-bés.","未设置每周休息日。"],
    ["Réservation confirmée.","Booking confirmed.","Reserva confirmada.","Reserva confirmada.","Reservierung bestätigt.","Prenotazione confermata.","Reservering bevestigd.","تم تأكيد الحجز.","Dëggal nañu rezervaasiyoŋ bi.","预订已确认。"],
    [" · réservation confirmée selon la capacité disponible"," · booking confirmed based on available capacity"," · reserva confirmada según la capacidad disponible"," · reserva confirmada segundo a capacidade disponível"," · Buchung nach verfügbarer Kapazität bestätigt"," · prenotazione confermata secondo la capienza disponibile"," · reservering bevestigd op basis van capaciteit"," · تم تأكيد الحجز حسب السعة المتاحة"," · rezervaasiyoŋ bi dëggal nañu ko ci palaas yi féex"," · 根据可用容量确认预订"],
    ["personne","guest","persona","pessoa","Person","persona","persoon","شخص","nit","人"],
    ["personnes","guests","personas","pessoas","Personen","persone","personen","أشخاص","nit","人"],
    ["Votre réservation est garantie ","Your booking is held for ","Tu reserva se mantiene durante ","A sua reserva é mantida durante ","Ihre Reservierung gilt für ","La prenotazione è garantita per ","Uw reservering blijft geldig tot ","سيتم الاحتفاظ بحجزك لمدة ","Sa rezervaasiyoŋ ñu denc na ko ba ","您的预订保留 "],
    [" minutes après l’heure choisie."," minutes after the selected time."," minutos después de la hora elegida."," minutos após a hora escolhida."," Minuten nach der gewählten Uhrzeit."," minuti dopo l'orario scelto."," minuten na de gekozen tijd."," دقيقة بعد الموعد المختار."," simili gannaaw waxtu bi ñu tànn."," 分钟，超过所选时间后可释放。"],
    ["⚠️ Le restaurant est fermé ce jour. Choisissez une autre date.","⚠️ Restaurant closed on this day. Choose another date.","⚠️ Restaurante cerrado ese día. Elige otra fecha.","⚠️ O restaurante está fechado neste dia. Escolha outra data.","⚠️ Das Restaurant ist an diesem Tag geschlossen. Bitte anderen Tag wählen.","⚠️ Ristorante chiuso questo giorno. Scegli un'altra data.","⚠️ Restaurant gesloten op deze dag. Kies een andere datum.","⚠️ المطعم مغلق في هذا اليوم. اختر تاريخًا آخر.","⚠️ Restauraŋ bi tëj na ci bés bii. Tànnal beneen bés.","⚠️ 餐厅当天休息。请选择其他日期。"],
    ["⚠️ Choisissez d’abord un créneau disponible.","⚠️ Choose an available slot first.","⚠️ Elige primero un horario disponible.","⚠️ Escolha primeiro um horário disponível.","⚠️ Wählen Sie zuerst eine verfügbare Zeit.","⚠️ Scegli prima un orario disponibile.","⚠️ Kies eerst een beschikbaar tijdslot.","⚠️ اختر موعدًا متاحًا أولًا.","⚠️ Tànnal waxtu bu féex njëkk.","⚠️ 请先选择可订时段。"],
    ["Vérification des disponibilités…","Checking availability…","Comprobando disponibilidad…","A verificar disponibilidade…","Verfügbarkeit wird geprüft…","Verifica della disponibilità…","Beschikbaarheid controleren…","جارٍ التحقق من التوفر…","Seet li féex…","正在查询空位…"],
    [". Essayez une autre date, une autre zone ou une autre heure.",". Try another date, area or time.",". Prueba otra fecha, zona u hora.",". Tente outra data, zona ou hora.",". Versuchen Sie einen anderen Tag, Bereich oder eine andere Uhrzeit.",". Prova un'altra data, zona o ora.",". Probeer een andere datum, plek of tijd.",". جرّب تاريخًا أو منطقة أو وقتًا آخر.",". Jéemal beneen bés, béréb walla waxtu.","。请尝试其他日期、区域或时间。"],
    ["lundi","Monday","lunes","segunda-feira","Montag","lunedì","maandag","الاثنين","Altine","周一"],
    ["mardi","Tuesday","martes","terça-feira","Dienstag","martedì","dinsdag","الثلاثاء","Talaata","周二"],
    ["mercredi","Wednesday","miércoles","quarta-feira","Mittwoch","mercoledì","woensdag","الأربعاء","Àllarba","周三"],
    ["jeudi","Thursday","jueves","quinta-feira","Donnerstag","giovedì","donderdag","الخميس","Alxames","周四"],
    ["vendredi","Friday","viernes","sexta-feira","Freitag","venerdì","vrijdag","الجمعة","Àjjuma","周五"],
    ["samedi","Saturday","sábado","sábado","Samstag","sabato","zaterdag","السبت","Gaawu","周六"],
    ["dimanche","Sunday","domingo","domingo","Sonntag","domenica","zondag","الأحد","Dibéer","周日"],
    [" à "," at "," a las "," às "," um "," alle "," om "," في "," ci "," 于 "],
    ["Carte du restaurant · DIGIY RESTO","Restaurant menu · DIGIY RESTO","Carta del restaurante · DIGIY RESTO","Carta do restaurante · DIGIY RESTO","Speisekarte des Restaurants · DIGIY RESTO","Menu del ristorante · DIGIY RESTO","Restaurantmenu · DIGIY RESTO","قائمة المطعم · DIGIY RESTO","Kart restauraŋ bi · DIGIY RESTO","餐厅菜单 · DIGIY RESTO"],
    ["Consultez la carte publiée par le restaurateur : plats, prix et contact direct. Aucun téléchargement d'application.","Browse the restaurant's published menu, dishes, prices and direct contact. No app download.","Consulta la carta del restaurante, platos, precios y contacto directo. Sin instalar aplicación.","Consulte a carta publicada, pratos, preços e contacto direto. Sem instalar aplicação.","Sehen Sie die Speisekarte, Gerichte, Preise und direkten Kontakt. Keine App nötig.","Consulta menu, piatti, prezzi e contatto diretto. Nessuna app da installare.","Bekijk de gepubliceerde menukaart, gerechten, prijzen en direct contact. Geen app nodig.","تصفح قائمة المطعم المنشورة وأطباقه وأسعاره وتواصله المباشر. دون تنزيل تطبيق.","Xoolal kart bi restauraŋ siif, lekk, njëg ak jokkoo jub. Amul app bu ñu yeb.","查看餐厅公布的菜单、菜品、价格及直接联系方式，无须下载应用。"],
    ["← Restaurants","← Restaurants","← Restaurantes","← Restaurantes","← Restaurants","← Ristoranti","← Restaurants","المطاعم →","← Lekkukaay yi","← 餐厅列表"],
    ["Carte numérique · Contact direct","Digital menu · Direct contact","Carta digital · Contacto directo","Carta digital · Contacto direto","Digitale Karte · Direktkontakt","Menu digitale · Contatto diretto","Digitale kaart · Direct contact","قائمة رقمية · تواصل مباشر","Kart digitaal · Jokkoo jub","数字菜单 · 直接联系"],
    ["Chargement de la carte publiée…","Loading published menu…","Cargando carta publicada…","A carregar carta publicada…","Veröffentlichte Karte wird geladen…","Caricamento menu pubblicato…","Gepubliceerde kaart laden…","جارٍ تحميل القائمة المنشورة…","Yeb kart bi ñu siif…","正在加载公开菜单…"],
    ["La carte et les disponibilités sont déclarées par le restaurateur. Pour commander, réserver ou confirmer un prix, contactez-le directement. Paiement direct · 0 % de commission DIGIY.","Menus and availability are provided by the restaurant. Contact it directly to order, book or confirm prices. Pay directly · 0% DIGIY commission.","La carta y disponibilidad dependen del restaurante. Contacta directamente para pedir, reservar o confirmar precios. Pago directo · 0 % comisión DIGIY.","A carta e disponibilidade são declaradas pelo restaurante. Contacte diretamente para encomendar, reservar ou confirmar preços. Pagamento direto · 0 % comissão DIGIY.","Speisekarte und Verfügbarkeit gibt das Restaurant an. Bestellungen, Reservierungen und Preise direkt klären. Direktzahlung · 0 % DIGIY-Provision.","Menu e disponibilità sono indicati dal ristorante. Contattalo direttamente per ordinare, prenotare o confermare prezzi. Pagamento diretto · 0% commissioni DIGIY.","Kaart en beschikbaarheid komen van het restaurant. Neem rechtstreeks contact op om te bestellen, reserveren of prijzen te controleren. Direct betalen · 0% DIGIY-commissie.","يحدد المطعم قائمته وتوفر الأطباق. تواصل معه مباشرة للطلب أو الحجز أو تأكيد السعر. دفع مباشر · 0٪ عمولة DIGIY.","Restauraŋ bi mooy wax kartam ak li féex. Jokkoo ak moom ngir komànd, rezervé walla dëggal njëg. Fay jub · 0 % komisoŋ DIGIY.","菜单和供货信息由餐厅提供。点餐、预订或确认价格请直接联系餐厅。直接付款 · DIGIY 零佣金。"],
    ["↻ Actualiser la carte","↻ Refresh menu","↻ Actualizar carta","↻ Atualizar carta","↻ Karte aktualisieren","↻ Aggiorna menu","↻ Kaart vernieuwen","↻ تحديث القائمة","↻ Yeesal kart bi","↻ 刷新菜单"],
    ["DIGIYLYFE · Le terrain garde la main · Aucun téléchargement d’application.","DIGIYLYFE · Local businesses stay in control · No app download.","DIGIYLYFE · El negocio conserva el control · Sin descargar aplicaciones.","DIGIYLYFE · O negócio mantém o controlo · Sem instalar aplicações.","DIGIYLYFE · Der Betrieb behält die Kontrolle · Keine App nötig.","DIGIYLYFE · Il commerciante mantiene il controllo · Nessuna app da scaricare.","DIGIYLYFE · De ondernemer houdt de regie · Geen app nodig.","DIGIYLYFE · القرار بيد أصحاب الأعمال · دون تنزيل تطبيق.","DIGIYLYFE · Boroom liggéey bi moo yor ndigal · Amul app bu yeb.","DIGIYLYFE · 本地经营者掌握主动权 · 无须下载应用。"],
    ["Lien de carte invalide ou service temporairement indisponible. Contactez le restaurant.","Invalid menu link or service temporarily unavailable. Contact the restaurant.","Enlace de carta no válido o servicio temporalmente no disponible. Contacta con el restaurante.","Link da carta inválido ou serviço temporariamente indisponível. Contacte o restaurante.","Ungültiger Link oder Dienst vorübergehend nicht verfügbar. Restaurant kontaktieren.","Link del menu non valido o servizio temporaneamente indisponibile. Contatta il ristorante.","Ongeldige menulink of dienst tijdelijk niet beschikbaar. Neem contact op met het restaurant.","رابط القائمة غير صالح أو الخدمة غير متاحة مؤقتًا. تواصل مع المطعم.","Lëkkalekaayu kart bi baaxul walla sarwiis amul. Jokkoo ak restauraŋ bi.","菜单链接无效或服务暂不可用，请联系餐厅。"],
    ["Actualisation de la carte publiée…","Refreshing published menu…","Actualizando carta publicada…","A atualizar carta publicada…","Veröffentlichte Karte wird aktualisiert…","Aggiornamento menu pubblicato…","Gepubliceerde kaart vernieuwen…","جارٍ تحديث القائمة المنشورة…","Yeesal kart bi ñu siif…","正在刷新公开菜单…"],
    ["La carte est momentanément inaccessible. Réessayez ou contactez directement le restaurant.","Menu temporarily unavailable. Try again or contact the restaurant directly.","Carta temporalmente inaccesible. Vuelve a intentarlo o contacta con el restaurante.","Carta temporariamente inacessível. Tente novamente ou contacte o restaurante.","Karte derzeit nicht erreichbar. Erneut versuchen oder Restaurant direkt kontaktieren.","Menu temporaneamente non disponibile. Riprova o contatta il ristorante.","Menukaart tijdelijk niet beschikbaar. Probeer opnieuw of neem rechtstreeks contact op.","القائمة غير متاحة مؤقتًا. أعد المحاولة أو تواصل مع المطعم.","Kart bi amul léegi. Jéemaat walla jokkoo jub ak restauraŋ bi.","菜单暂时无法访问，请重试或直接联系餐厅。"],
    ["Ce restaurant ne publie pas encore de carte QR. Contactez-le pour connaître ses plats et ses prix.","This restaurant has not published a QR menu yet. Contact it for dishes and prices.","Este restaurante aún no publica carta QR. Contacta con él para conocer platos y precios.","Este restaurante ainda não publicou uma carta QR. Contacte-o para conhecer pratos e preços.","Dieses Restaurant hat noch keine QR-Karte veröffentlicht. Fragen Sie direkt nach Gerichten und Preisen.","Questo ristorante non ha ancora pubblicato un menu QR. Contattalo per piatti e prezzi.","Dit restaurant heeft nog geen QR-menu gepubliceerd. Vraag rechtstreeks naar gerechten en prijzen.","لم ينشر هذا المطعم قائمة QR بعد. تواصل معه لمعرفة الأطباق والأسعار.","Restauraŋ bii siifagul kart QR. Jokkoo ak moom ngir xam lekk ak njëg.","餐厅尚未发布二维码菜单。请直接咨询菜品及价格。"],
    ["La carte est momentanément indisponible. Contactez le restaurant.","Menu temporarily unavailable. Contact the restaurant.","Carta temporalmente no disponible. Contacta con el restaurante.","Carta temporariamente indisponível. Contacte o restaurante.","Speisekarte vorübergehend nicht verfügbar. Restaurant kontaktieren.","Menu temporaneamente non disponibile. Contatta il ristorante.","Menukaart tijdelijk niet beschikbaar. Neem contact op.","القائمة غير متاحة مؤقتًا. تواصل مع المطعم.","Kart bi amul léegi. Jokkoo ak restauraŋ bi.","菜单暂时不可用，请联系餐厅。"],
    ["Version publiée le ","Version published on ","Versión publicada el ","Versão publicada a ","Veröffentlicht am ","Versione pubblicata il ","Versie gepubliceerd op ","نُشرت النسخة في ","Siif nañu wersiyoŋ bi ci ","版本发布于 "],
    ["Carte publiée par le restaurateur","Menu published by the restaurant","Carta publicada por el restaurante","Carta publicada pelo restaurante","Karte vom Restaurant veröffentlicht","Menu pubblicato dal ristorante","Menukaart gepubliceerd door het restaurant","قائمة منشورة من المطعم","Kart bi restauraŋ siif","餐厅发布的菜单"],
    [" · Épuisé / indisponible"," · Sold out / unavailable"," · Agotado / no disponible"," · Esgotado / indisponível"," · Ausverkauft / nicht verfügbar"," · Esaurito / non disponibile"," · Uitverkocht / niet beschikbaar"," · نفد / غير متاح"," · Jeex na / amul"," · 售罄 / 不可用"],
    ["Inclus dans la formule","Included in set menu","Incluido en el menú","Incluído no menu","Im Menü enthalten","Incluso nel menu","In het menu inbegrepen","مشمول في الوجبة","Bokk na ci menu bi","已包含在套餐中"],
    ["📞 Appeler","📞 Call","📞 Llamar","📞 Ligar","📞 Anrufen","📞 Chiama","📞 Bellen","📞 اتصال","📞 Woow","📞 致电"],
    ["Connexion indisponible. Réessayez.","Connection unavailable. Try again.","Conexión no disponible. Reintenta.","Ligação indisponível. Tente novamente.","Verbindung nicht verfügbar. Erneut versuchen.","Connessione non disponibile. Riprova.","Verbinding niet beschikbaar. Probeer opnieuw.","الاتصال غير متاح. حاول مرة أخرى.","Jokkoo amul léegi. Jéemaat.","连接不可用，请重试。"],
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
