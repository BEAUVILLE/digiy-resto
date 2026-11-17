/* DIGIY RESTO PRO — WORLD10, couche de présentation seule.
 * Ne modifie ni les valeurs métier, ni les comptes, ni les écritures Supabase.
 * Les chaînes WO sont des propositions à relire avec un locuteur natif.
 */
(() => {
  "use strict";
  const langs = ["fr","en","es","pt","de","it","nl","ar","wo","zh"];
  const names = ["🇫🇷 FR","🇬🇧 EN","🇪🇸 ES","🇵🇹 PT","🇩🇪 DE","🇮🇹 IT","🇳🇱 NL","🇸🇦 AR","🇸🇳 WO","🇨🇳 ZH"];
  // fr, en, es, pt, de, it, nl, ar, wo, zh — une traduction par colonne.
  const rows = [
    ["👁 VOIR LA DÉMONSTRATION CLIENT →","👁 VIEW CUSTOMER DEMO →","👁 VER DEMO DEL CLIENTE →","👁 VER DEMO DO CLIENTE →","👁 KUNDEN-DEMO ANSEHEN →","👁 VEDI DEMO CLIENTE →","👁 BEKIJK KLANTDEMO →","👁 عرض تجربة العميل ←","👁 XOOL DEMO KILIYAAN →","👁 查看顾客演示 →"],
    ["👁 VOIR UNE DÉMONSTRATION (SANS COMPTE) →","👁 VIEW A DEMO (NO ACCOUNT) →","👁 VER DEMO (SIN CUENTA) →","👁 VER DEMO (SEM CONTA) →","👁 DEMO OHNE KONTO ANSEHEN →","👁 VEDI DEMO (SENZA ACCOUNT) →","👁 DEMO ZONDER ACCOUNT →","👁 عرض تجريبي (دون حساب) ←","👁 XOOL DEMO (AMUL KONT) →","👁 查看演示（无需账户）→"],
    ["← ACCÈS PROPRIÉTAIRE","← OWNER LOGIN","← ACCESO PROPIETARIO","← ACESSO PROPRIETÁRIO","← INHABERZUGANG","← ACCESSO PROPRIETARIO","← EIGENAARSTOEGANG","دخول المالك →","← DUGGUB BOROOM BI","← 业主入口"],
    ["DEMO RESTO PRO · DIGIYLYFE","RESTO PRO DEMO · DIGIYLYFE","DEMO RESTO PRO · DIGIYLYFE","DEMO RESTO PRO · DIGIYLYFE","RESTO PRO DEMO · DIGIYLYFE","DEMO RESTO PRO · DIGIYLYFE","RESTO PRO DEMO · DIGIYLYFE","عرض RESTO PRO · DIGIYLYFE","DEMO RESTO PRO · DIGIYLYFE","餐厅专业版演示 · DIGIYLYFE"],
    ["DÉMONSTRATION · AUCUNE DONNÉE RÉELLE","DEMO · NO REAL DATA","DEMO · SIN DATOS REALES","DEMO · SEM DADOS REAIS","DEMO · KEINE ECHTEN DATEN","DEMO · NESSUN DATO REALE","DEMO · GEEN ECHTE GEGEVENS","عرض تجريبي · دون بيانات حقيقية","DEMO · AMUL DONE YU DËGG","演示 · 不含真实数据"],
    ["🍽️ RESTAURANT DÉMO · SALY","🍽️ SAMPLE RESTAURANT · SALY","🍽️ RESTAURANTE DEMO · SALY","🍽️ RESTAURANTE DEMO · SALY","🍽️ DEMO-RESTAURANT · SALY","🍽️ RISTORANTE DEMO · SALY","🍽️ DEMORESTAURANT · SALY","🍽️ مطعم تجريبي · سالي","🍽️ RESTAURAŊ DEMO · SALY","🍽️ 示例餐厅 · SALY"],
    ["Voici un exemple du cockpit du restaurateur. Les horaires, tables et réservations ci-dessous sont entièrement fictifs.","This is a sample restaurant dashboard. The times, tables and bookings below are entirely fictional.","Este es un ejemplo del panel del restaurante. Los horarios, las mesas y las reservas son ficticios.","Este é um exemplo do painel do restaurante. Horários, mesas e reservas são fictícios.","Dies ist ein Beispiel-Dashboard. Zeiten, Tische und Reservierungen sind frei erfunden.","Questo è un esempio del pannello ristorante. Orari, tavoli e prenotazioni sono fittizi.","Dit is een voorbeeld van het restaurantdashboard. Tijden, tafels en reserveringen zijn fictief.","هذه لوحة تحكم نموذجية للمطعم. الأوقات والطاولات والحجوزات أدناه خيالية بالكامل.","Lii ab misaalu saytu restauraŋ la. Waxtu, taabal ak rezervaasiyoŋ yi di fii du yu dëgg.","这是餐厅管理后台示例。下面的时间、餐桌与预订均为虚构。"],
    ["MODE LECTURE SEULE · Aucune réservation, aucun paiement et aucune modification ne sont possibles ici. Le vrai logiciel exige un Magic Link et des droits propriétaire vérifiés.","READ-ONLY DEMO · No bookings, payments or changes are possible here. The real software requires a Magic Link and verified owner permissions.","DEMO DE SOLO LECTURA · Aquí no se pueden reservar, pagar ni modificar datos. El software real exige Magic Link y permisos verificados.","DEMO SÓ DE LEITURA · Aqui não se pode reservar, pagar nem alterar dados. O software real exige Magic Link e permissões verificadas.","NUR-LESEN-DEMO · Keine Reservierungen, Zahlungen oder Änderungen möglich. Die echte Software erfordert einen Magic Link und geprüfte Inhaberrechte.","DEMO SOLO LETTURA · Nessuna prenotazione, pagamento o modifica. Il software reale richiede Magic Link e autorizzazioni verificate.","ALLEEN-LEZEN DEMO · Geen boekingen, betalingen of wijzigingen. De echte software vereist een Magic Link en gecontroleerde eigenaarsrechten.","عرض للقراءة فقط · لا يمكن الحجز أو الدفع أو التعديل هنا. يتطلب النظام الحقيقي رابط Magic Link وصلاحيات مالك مؤكدة.","DEMO BU ÑU XOOL REKK · Mënuloo def rezervaasiyoŋ, fay walla soppi dara fii. Liggéey bu dëgg bi soxla Magic Link ak ndigalu boroom bu ñu seet.","只读演示 · 此处不能预订、付款或修改。真实系统需要 Magic Link 和已核实的业主权限。"],
    ["DEMO · Service midi","Lunch service","Servicio de mediodía","Serviço de almoço","Mittagsservice","Servizio pranzo","Lunchdienst","خدمة الغداء","Sarwiis bëccëg","午餐时段"],
    ["DEMO · Service soir","Dinner service","Servicio de noche","Serviço de jantar","Abendservice","Servizio cena","Avonddienst","خدمة العشاء","Sarwiis guddi","晚餐时段"],
    ["DEMO · Terrasse","DEMO · Terrace","Terraza","Terraço","Terrasse","Terrazza","Terras","الشرفة","Teras","露台"],
    ["DEMO · Salle","DEMO · Dining room","Sala","Sala","Gastraum","Sala","Zaal","القاعة","Saal","室内餐厅"],
    ["4 tables · 12 places","4 tables · 12 seats","4 mesas · 12 plazas","4 mesas · 12 lugares","4 Tische · 12 Plätze","4 tavoli · 12 posti","4 tafels · 12 plaatsen","4 طاولات · 12 مقعدًا","4 taabal · 12 palaas","4 张桌 · 12 个座位"],
    ["6 tables · 24 places","6 tables · 24 seats","6 mesas · 24 plazas","6 mesas · 24 lugares","6 Tische · 24 Plätze","6 tavoli · 24 posti","6 tafels · 24 plaatsen","6 طاولات · 24 مقعدًا","6 taabal · 24 palaas","6 张桌 · 24 个座位"],
    ["Client démo A · 2 pers.","Demo guest A · 2 people","Cliente demo A · 2 pers.","Cliente demo A · 2 pessoas","Demo-Gast A · 2 Pers.","Cliente demo A · 2 persone","Demo-gast A · 2 personen","عميل تجريبي A · شخصان","Kiliyaan demo A · 2 nit","演示顾客 A · 2 人"],
    ["Client démo B · 4 pers.","Demo guest B · 4 people","Cliente demo B · 4 pers.","Cliente demo B · 4 pessoas","Demo-Gast B · 4 Pers.","Cliente demo B · 4 persone","Demo-gast B · 4 personen","عميل تجريبي B · 4 أشخاص","Kiliyaan demo B · 4 nit","演示顾客 B · 4 人"],
    ["Plat démo A","Sample dish A","Plato demo A","Prato demo A","Demo-Gericht A","Piatto demo A","Demo-gerecht A","طبق تجريبي A","Lekk demo A","演示菜品 A"],
    ["Plat démo B","Sample dish B","Plato demo B","Prato demo B","Demo-Gericht B","Piatto demo B","Demo-gerecht B","طبق تجريبي B","Lekk demo B","演示菜品 B"],
    ["🔐 ACCÈS PROPRIÉTAIRE · MAGIC LINK","🔐 OWNER LOGIN · MAGIC LINK","🔐 ACCESO PROPIETARIO · MAGIC LINK","🔐 ACESSO PROPRIETÁRIO · MAGIC LINK","🔐 INHABERZUGANG · MAGIC LINK","🔐 ACCESSO PROPRIETARIO · MAGIC LINK","🔐 EIGENAARSTOEGANG · MAGIC LINK","🔐 دخول المالك · MAGIC LINK","🔐 DUGGUB BOROOM · MAGIC LINK","🔐 业主登录 · MAGIC LINK"],
    ["EXEMPLE FICTIF · Aucun compte ni aucune donnée réelle utilisés.","FICTIONAL SAMPLE · No real account or data used.","EJEMPLO FICTICIO · Sin cuentas ni datos reales.","EXEMPLO FICTÍCIO · Sem contas nem dados reais.","FIKTIVES BEISPIEL · Keine echten Konten oder Daten.","ESEMPIO FITTIZIO · Nessun account o dato reale.","FICTIEF VOORBEELD · Geen echte accounts of gegevens.","مثال خيالي · لا حسابات أو بيانات حقيقية مستخدمة.","MISAAL BU DU DËGG · Amul kont walla done yu dëgg.","虚构示例 · 不使用真实账户或数据。"],
    ["Ouvrez votre espace professionnel avec votre lien sécurisé par e-mail. L’accès dépend de votre restaurant et de vos droits de propriétaire.","Open your professional workspace with your secure email link. Access depends on your restaurant and your owner permissions.","Abre tu espacio profesional con el enlace seguro recibido por correo. El acceso depende de tu restaurante y de tus permisos como propietario.","Abra o seu espaço profissional com o link seguro enviado por email. O acesso depende do restaurante e dos seus direitos de proprietário.","Öffnen Sie Ihren Geschäftsbereich mit Ihrem sicheren E-Mail-Link. Der Zugang hängt von Ihrem Restaurant und Ihren Inhaberrechten ab.","Apri il tuo spazio professionale con il link sicuro inviato via email. L'accesso dipende dal ristorante e dai tuoi diritti di proprietario.","Open uw professionele omgeving via uw veilige e-maillink. De toegang hangt af van uw restaurant en eigenaarsrechten.","افتح مساحة عملك برابط البريد الإلكتروني الآمن. يعتمد الدخول على مطعمك وصلاحياتك كمالك.","Ubbi sa bérébu liggéey ak sa lëkkalekaay bu wóor ci imeel. Sa dugg dafay aju ci sa restauraŋ ak sa ndigalu boroom.","使用安全邮件链接进入专业工作区。访问权限取决于您的餐厅及业主权限。"],
    ["MON RESTAURANT","MY RESTAURANT","MI RESTAURANTE","O MEU RESTAURANTE","MEIN RESTAURANT","IL MIO RISTORANTE","MIJN RESTAURANT","مطعمي","SAMA RESTAURAŊ","我的餐厅"],
    ["Lien de restaurant requis","Restaurant link required","Se necesita un enlace al restaurante","É necessário o link do restaurante","Restaurant-Link erforderlich","È necessario il link del ristorante","Restaurantlink vereist","رابط المطعم مطلوب","Lëkkalekaayu restauraŋ lañu soxla","需要餐厅专属链接"],
    ["Aucun restaurant associé à ce lien","No restaurant linked to this address","No hay restaurante asociado a este enlace","Nenhum restaurante associado a este link","Kein Restaurant mit diesem Link verknüpft","Nessun ristorante associato a questo link","Geen restaurant gekoppeld aan deze link","لا يوجد مطعم مرتبط بهذا الرابط","Amul restauraŋ bu ñu lëkkale ak lii","此链接未关联餐厅"],
    ["Ce lien ne désigne aucun restaurant. Ouvrez « Accès propriétaire » depuis votre propre fiche DIGIY RESTO. Aucun établissement de test ne sera choisi à votre place.","This link does not identify a restaurant. Open Owner access from your own DIGIY RESTO listing. No test restaurant will be chosen for you.","Este enlace no identifica ningún restaurante. Abre Acceso del propietario desde tu propia ficha DIGIY RESTO. No se seleccionará ningún restaurante de prueba.","Este link não identifica um restaurante. Abra Acesso do proprietário a partir da sua ficha DIGIY RESTO. Nenhum restaurante de teste será escolhido.","Dieser Link gehört zu keinem Restaurant. Öffnen Sie den Inhaberzugang über Ihren eigenen DIGIY RESTO-Eintrag. Kein Testrestaurant wird automatisch gewählt.","Questo link non identifica un ristorante. Apri Accesso proprietario dalla tua scheda DIGIY RESTO. Nessun ristorante di prova sarà selezionato automaticamente.","Deze link verwijst niet naar een restaurant. Open Eigenaarstoegang via uw eigen DIGIY RESTO-vermelding. Er wordt geen testrestaurant gekozen.","هذا الرابط لا يحدد مطعمًا. افتح دخول المالك من صفحتك الخاصة في DIGIY RESTO. لن يُختار أي مطعم تجريبي نيابةً عنك.","Lëkkalekaay bii wonewul benn restauraŋ. Ubbi Duggub boroom bi ci sa fich DIGIY RESTO. Kenn du tànn restauraŋ bu seet ci sa tur.","此链接未指定餐厅。请从您自己的 DIGIY RESTO 商家页面进入“业主入口”。系统不会替您选择测试餐厅。"],
    ["Le lien envoyé par e-mail (Magic Link) et le code reçu ouvrent la même gestion sécurisée, après vérification des droits de votre compte. Chaque restaurant conserve ses propres données.","The emailed Magic Link and the received code open the same secure workspace after your account permissions are checked. Each restaurant keeps its own data.","El enlace enviado por correo (Magic Link) y el código abren el mismo espacio seguro tras comprobar los permisos de la cuenta. Cada restaurante conserva sus datos.","O link enviado por email (Magic Link) e o código abrem o mesmo espaço seguro após a verificação das permissões da conta. Cada restaurante mantém os seus dados.","E-Mail-Link (Magic Link) und Code öffnen denselben sicheren Bereich nach Prüfung Ihrer Zugriffsrechte. Jedes Restaurant behält seine eigenen Daten.","Il Magic Link inviato via email e il codice aprono la stessa area sicura dopo la verifica dei permessi. Ogni ristorante conserva i propri dati.","De Magic Link per e-mail en de code openen dezelfde veilige omgeving na controle van uw rechten. Elk restaurant behoudt zijn eigen gegevens.","يفتح رابط البريد (Magic Link) والرمز مساحة الإدارة الآمنة نفسها بعد التحقق من صلاحيات الحساب. يحتفظ كل مطعم ببياناته الخاصة.","Magic Link bi ñu yónnee ci imeel ak kóod bi ñoo ubbi benn bérébu saytu bu wóor, gannaaw seetu sa ndigal. Restauraŋ bu nekk dafay denc ay doneem.","邮件中的 Magic Link 与验证码均可进入同一安全后台，系统会先验证账户权限。各餐厅的数据相互独立。"],
    ["Langue","Language","Idioma","Idioma","Sprache","Lingua","Taal","اللغة","Làkk","语言"],
    ["Accès propriétaire RÉSA RESTO — DIGIYLYFE","Restaurant owner access — DIGIYLYFE","Acceso del propietario — DIGIYLYFE","Acesso do proprietário — DIGIYLYFE","Restaurantinhaber-Zugang — DIGIYLYFE","Accesso proprietario — DIGIYLYFE","Toegang eigenaar — DIGIYLYFE","دخول مالك المطعم — DIGIYLYFE","Duggub boroom restauraŋ — DIGIYLYFE","餐厅业主入口 — DIGIYLYFE"],
    ["Gestion RESA RESTO — DIGIYLYFE","Restaurant management — DIGIYLYFE","Gestión del restaurante — DIGIYLYFE","Gestão do restaurante — DIGIYLYFE","Restaurantverwaltung — DIGIYLYFE","Gestione ristorante — DIGIYLYFE","Restaurantbeheer — DIGIYLYFE","إدارة المطعم — DIGIYLYFE","Saytu restauraŋ — DIGIYLYFE","餐厅管理 — DIGIYLYFE"],
    ["ESPACE PROPRIÉTAIRE","OWNER AREA","ÁREA DEL PROPIETARIO","ÁREA DO PROPRIETÁRIO","INHABERBEREICH","AREA PROPRIETARIO","EIGENAARSOMGEVING","مساحة المالك","BÉRÉBU BOROOM","业主专区"],
    ["Entrer dans ma gestion.","Open my management area.","Entrar en mi gestión.","Abrir a minha gestão.","Meine Verwaltung öffnen.","Apri la mia gestione.","Mijn beheer openen.","الدخول إلى لوحة الإدارة.","Dugg ci sama saytu.","进入我的管理后台。"],
    ["Choisissez votre restaurant, recevez votre accès sécurisé, puis ouvrez directement votre espace de gestion.","Choose your restaurant, receive a secure sign-in link, then open your management area.","Elige tu restaurante, recibe tu acceso seguro y abre tu espacio de gestión.","Escolha o seu restaurante, receba o acesso seguro e abra a sua área de gestão.","Wählen Sie Ihr Restaurant, erhalten Sie einen sicheren Zugang und öffnen Sie Ihre Verwaltung.","Scegli il ristorante, ricevi l'accesso sicuro e apri la tua area di gestione.","Kies uw restaurant, ontvang een veilige toegang en open uw beheeromgeving.","اختر مطعمك، وتلقَّ رابط الدخول الآمن، ثم افتح مساحة الإدارة.","Tànnal sa restauraŋ, jot sa dugg bu wóor, ba noppi ubbi sa bérébu saytu.","选择您的餐厅，接收安全登录信息，然后进入管理后台。"],
    ["Email propriétaire","Owner email","Correo del propietario","Email do proprietário","E-Mail des Inhabers","Email del proprietario","E-mail eigenaar","بريد المالك الإلكتروني","Imeel boroom bi","业主邮箱"],
    ["Votre email","Your email","Tu correo electrónico","O seu email","Ihre E-Mail-Adresse","La tua email","Uw e-mailadres","بريدك الإلكتروني","Sa imeel","您的邮箱"],
    ["RECEVOIR MON ACCÈS →","GET MY ACCESS →","RECIBIR MI ACCESO →","RECEBER O MEU ACESSO →","ZUGANG ERHALTEN →","RICEVI IL MIO ACCESSO →","TOEGANG ONTVANGEN →","استلام رابط الدخول ←","JOT SAMA DUGG →","获取登录链接 →"],
    ["Code reçu","Code received","Código recibido","Código recebido","Erhaltener Code","Codice ricevuto","Ontvangen code","الرمز المستلم","Kóod bi nga jot","收到的验证码"],
    ["OUVRIR MA GESTION →","OPEN MY MANAGEMENT →","ABRIR MI GESTIÓN →","ABRIR A MINHA GESTÃO →","VERWALTUNG ÖFFNEN →","APRI LA MIA GESTIONE →","BEHEER OPENEN →","فتح لوحة الإدارة ←","UBBI SAMA SAYTU →","打开管理后台 →"],
    ["Le lien email et le code ouvrent la même gestion. Aucun passage par PRO ESPACE ni par l’index public.","The email link and code open the same management area. No detour through PRO ESPACE or the public directory.","El enlace de correo y el código abren la misma gestión. Sin pasar por PRO ESPACE ni por el directorio público.","O link de email e o código abrem a mesma gestão. Sem passar pelo PRO ESPACE nem pelo diretório público.","E-Mail-Link und Code öffnen dieselbe Verwaltung. Kein Umweg über PRO ESPACE oder das öffentliche Verzeichnis.","Link email e codice aprono la stessa gestione, senza passare da PRO ESPACE o dall'elenco pubblico.","De e-maillink en code openen hetzelfde beheer, zonder PRO ESPACE of de openbare gids.","رابط البريد والرمز يفتحان لوحة الإدارة نفسها دون المرور عبر PRO ESPACE أو الدليل العام.","Liy ñëw ci imeel ak kóod bi ñoo ubbi benn saytu bi, te du jaar ci PRO ESPACE walla lim bu ñépp gis.","邮箱链接和验证码都进入同一后台，无需经过 PRO ESPACE 或公开目录。"],
    ["Sélectionnez votre restaurant : aucun site de test ne sera choisi automatiquement.","Select your restaurant: no test site will be selected automatically.","Selecciona tu restaurante: no se elegirá ningún sitio de prueba automáticamente.","Escolha o seu restaurante: nenhum site de teste será escolhido automaticamente.","Wählen Sie Ihr Restaurant: Es wird kein Teststandort automatisch ausgewählt.","Seleziona il ristorante: nessun sito di prova sarà scelto automaticamente.","Kies uw restaurant: er wordt geen testlocatie automatisch gekozen.","اختر مطعمك: لن يتم اختيار أي موقع تجريبي تلقائيًا.","Tànnal sa restauraŋ: duñu tànn benn bérébu seet boppam.","请选择您的餐厅：不会自动选择测试站点。"],
    ["L’Entre 2 : accès propriétaire en préparation. Aucun email de gestion n’est encore configuré. Contactez DIGIYLYFE pour valider votre rattachement.","L’Entre 2: owner access is being prepared. No management email is configured yet. Contact DIGIYLYFE to confirm your connection.","L’Entre 2: acceso del propietario en preparación. Aún no hay correo de gestión configurado. Contacta con DIGIYLYFE.","L’Entre 2: acesso do proprietário em preparação. Ainda não existe email de gestão configurado. Contacte a DIGIYLYFE.","L’Entre 2: Inhaberzugang in Vorbereitung. Noch keine Verwaltungs-E-Mail eingerichtet. Bitte DIGIYLYFE kontaktieren.","L’Entre 2: accesso proprietario in preparazione. Email di gestione non ancora configurata. Contatta DIGIYLYFE.","L’Entre 2: eigenaarstoegang wordt voorbereid. Nog geen beheer-e-mail ingesteld. Neem contact op met DIGIYLYFE.","L’Entre 2: يجري إعداد دخول المالك. لم يُضبط بريد الإدارة بعد. اتصل بـ DIGIYLYFE.","L’Entre 2: ñungi waajal duggub boroom bi. Amagul imeel bu saytu. Jokkoo ak DIGIYLYFE.","L’Entre 2：业主入口准备中。尚未配置管理邮箱。请联系 DIGIYLYFE 核实绑定。"],
    ["Cet accès propriétaire n’est pas encore activé ou le restaurant est inconnu.","This owner access is not active yet, or the restaurant is unknown.","Este acceso aún no está activado o no se reconoce el restaurante.","Este acesso ainda não está ativo ou o restaurante é desconhecido.","Dieser Inhaberzugang ist noch nicht aktiv oder das Restaurant ist unbekannt.","Questo accesso non è ancora attivo o il ristorante è sconosciuto.","Deze eigenaarstoegang is nog niet actief of het restaurant is onbekend.","دخول المالك غير مفعل بعد أو المطعم غير معروف.","Duggub boroom bi doora amul ndigal walla restauraŋ bi xameesu ko.","业主入口尚未启用，或餐厅未识别。"],
    ["Indiquez votre email propriétaire.","Enter your owner email.","Indica el correo del propietario.","Indique o email do proprietário.","Geben Sie Ihre Inhaber-E-Mail ein.","Inserisci l'email del proprietario.","Vul het e-mailadres van de eigenaar in.","أدخل البريد الإلكتروني للمالك.","Dugal imeel boroom bi.","请输入业主邮箱。"],
    ["Envoi de votre accès sécurisé…","Sending your secure access…","Enviando tu acceso seguro…","A enviar o acesso seguro…","Sicherer Zugang wird gesendet…","Invio dell'accesso sicuro…","Veilige toegang wordt verzonden…","جارٍ إرسال رابط الدخول الآمن…","Ñungi yónnee sa dugg bu wóor…","正在发送安全登录信息…"],
    ["Email envoyé. Cliquez sur le lien reçu ou saisissez le code.","Email sent. Open the link or enter the code.","Correo enviado. Abre el enlace recibido o introduce el código.","Email enviado. Abra o link recebido ou introduza o código.","E-Mail gesendet. Öffnen Sie den Link oder geben Sie den Code ein.","Email inviata. Apri il link o inserisci il codice.","E-mail verzonden. Open de link of voer de code in.","تم إرسال البريد. افتح الرابط أو أدخل الرمز.","Imeel bi dem na. Bësal ci lëkkalekaay bi walla dugal kóod bi.","邮件已发送。点击链接或输入验证码。"],
    ["Cet accès propriétaire n’est pas encore activé.","This owner access is not active yet.","Este acceso de propietario aún no está activado.","Este acesso do proprietário ainda não está ativo.","Dieser Inhaberzugang ist noch nicht aktiv.","Questo accesso del proprietario non è ancora attivo.","Deze eigenaarstoegang is nog niet actief.","لم يُفعّل دخول المالك بعد.","Duggub boroom bi doora amul ndigal.","业主入口尚未启用。"],
    ["Entrez le code reçu par email.","Enter the code received by email.","Introduce el código recibido por correo.","Introduza o código recebido por email.","Geben Sie den Code aus der E-Mail ein.","Inserisci il codice ricevuto via email.","Voer de code uit de e-mail in.","أدخل الرمز المرسل بالبريد الإلكتروني.","Dugal kóod bi nga jot ci imeel.","请输入邮件中的验证码。"],
    ["⚠️ Code invalide ou expiré.","⚠️ Invalid or expired code.","⚠️ Código no válido o caducado.","⚠️ Código inválido ou expirado.","⚠️ Ungültiger oder abgelaufener Code.","⚠️ Codice non valido o scaduto.","⚠️ Ongeldige of verlopen code.","⚠️ الرمز غير صالح أو انتهت صلاحيته.","⚠️ Kóod bi baaxul walla jeex na.","⚠️ 验证码无效或已过期。"],
    ["⚙️ Réglages facultatifs","⚙️ Optional settings","⚙️ Ajustes opcionales","⚙️ Definições opcionais","⚙️ Optionale Einstellungen","⚙️ Impostazioni facoltative","⚙️ Optionele instellingen","⚙️ إعدادات اختيارية","⚙️ Tëralin yu nga mën a tànn","⚙️ 可选设置"],
    ["← Vue client","← Customer view","← Vista cliente","← Vista cliente","← Kundenansicht","← Vista cliente","← Klantweergave","عرض العميل →","← Li kiliyaan bi gis","← 顾客视图"],
    ["Accès adhérent","Member access","Acceso del miembro","Acesso do aderente","Mitgliederzugang","Accesso aderente","Ledentoegang","دخول العضو","Duggub àndandoo","会员入口"],
    ["Mon plan de restaurant.","My restaurant floor plan.","Mi plano de restaurante.","O plano do meu restaurante.","Mein Restaurantplan.","La pianta del mio ristorante.","Mijn restaurantplattegrond.","مخطط مطعمي.","Sama palaŋu restauraŋ.","我的餐厅布局。"],
    ["Vous organisez vos zones, vos tables et vos services. RESA répond ensuite 24/24 selon ce que vous avez réellement préparé.","Set up your areas, tables and services. RESA then responds 24/7 based on your actual setup.","Organiza zonas, mesas y servicios. RESA responde 24/7 según lo que hayas preparado.","Organize as zonas, mesas e serviços. A RESA responde 24 horas por dia conforme o que preparou.","Sie organisieren Bereiche, Tische und Services. RESA antwortet rund um die Uhr entsprechend Ihren Einstellungen.","Organizza zone, tavoli e servizi. RESA risponde 24 ore su 24 in base a ciò che hai preparato.","Richt zones, tafels en diensten in. RESA reageert 24/7 op basis van uw instellingen.","نظّم الأقسام والطاولات والخدمات. ثم يرد RESA على مدار الساعة وفق إعداداتك الفعلية.","Tëral sa béréb, sa taabal ak sa sarwiis. RESA dina tontu guddi ak bëccëg ci li nga waajal.","设置区域、餐桌与服务时段，RESA 将根据实际设置全天候响应。"],
    ["Email adhérent","Member email","Correo del miembro","Email do aderente","Mitglieder-E-Mail","Email aderente","E-mail lid","بريد العضو","Imeel àndandoo","会员邮箱"],
    ["Recevoir mon code →","Get my code →","Recibir mi código →","Receber o meu código →","Code erhalten →","Ricevi il mio codice →","Code ontvangen →","استلام الرمز ←","Jot sama kóod →","获取验证码 →"],
    ["Ouvrir mon plan →","Open my floor plan →","Abrir mi plano →","Abrir o meu plano →","Plan öffnen →","Apri la pianta →","Plattegrond openen →","فتح المخطط ←","Ubbi sama palaŋ →","打开布局 →"],
    ["ENVIRONNEMENT TEST","TEST ENVIRONMENT","ENTORNO DE PRUEBA","AMBIENTE DE TESTE","TESTUMGEBUNG","AMBIENTE DI TEST","TESTOMGEVING","بيئة تجريبية","BÉRÉBU SEET","测试环境"],
    ["ENVIRONNEMENT TEST · SALY","TEST ENVIRONMENT · SALY","PRUEBA · SALY","TESTE · SALY","TESTUMGEBUNG · SALY","TEST · SALY","TESTOMGEVING · SALY","بيئة تجريبية · سالي","BÉRÉBU SEET · SALY","测试环境 · SALY"],
    ["ENVIRONNEMENT TEST · SARLAT","TEST ENVIRONMENT · SARLAT","PRUEBA · SARLAT","TESTE · SARLAT","TESTUMGEBUNG · SARLAT","TEST · SARLAT","TESTOMGEVING · SARLAT","بيئة تجريبية · سارلا","BÉRÉBU SEET · SARLAT","测试环境 · SARLAT"],
    ["GESTION PROPRIÉTAIRE · SARLAT","OWNER MANAGEMENT · SARLAT","GESTIÓN DEL PROPIETARIO · SARLAT","GESTÃO DO PROPRIETÁRIO · SARLAT","INHABERVERWALTUNG · SARLAT","GESTIONE PROPRIETARIO · SARLAT","EIGENAARSBEHEER · SARLAT","إدارة المالك · سارلا","SAYTU BOROOM · SARLAT","业主管理 · SARLAT"],
    ["RESTAURANT NON RECONNU","UNKNOWN RESTAURANT","RESTAURANTE DESCONOCIDO","RESTAURANTE DESCONHECIDO","UNBEKANNTES RESTAURANT","RISTORANTE SCONOSCIUTO","ONBEKEND RESTAURANT","مطعم غير معروف","RESTAURAŊ BU XAMEESUL","未知餐厅"],
    ["Déconnexion","Sign out","Cerrar sesión","Terminar sessão","Abmelden","Esci","Uitloggen","تسجيل الخروج","Génn ci sa kont","退出登录"],
    ["Règles du restaurant","Restaurant rules","Reglas del restaurante","Regras do restaurante","Restaurantregeln","Regole del ristorante","Restaurantregels","قواعد المطعم","Sàrtu restauraŋ","餐厅规则"],
    ["Réservation garantie","Reservation held","Reserva garantizada","Reserva garantida","Reservierung garantiert","Prenotazione garantita","Reservering gegarandeerd","حجز مضمون","Denc rezervaasiyoŋ","预订保留"],
    ["après l’heure choisie. Plan détaillé de tables et organisation en 2 services :","after the selected time. Detailed table layout and two-service scheduling:","después de la hora elegida. Plano detallado y organización en dos servicios:","após a hora escolhida. Planta detalhada e organização em dois serviços:","nach der gewählten Zeit. Detaillierter Tischplan und zwei Servicezeiten:","dopo l'orario scelto. Pianta dettagliata e due turni di servizio:","na de gekozen tijd. Gedetailleerd tafelplan en twee diensten:","بعد الوقت المحدد. مخطط الطاولات التفصيلي وتنظيم خدمتين:","gannaaw waxtu bi ñu tànn. Palaŋu taabal ak ñaari sarwiis:","自所选时间起。详细餐桌布局及双时段安排："],
    ["facultatifs","optional","opcionales","opcionais","optional","facoltativi","optioneel","اختياريان","mën nañu leen a tànn","可选"],
    ["via ⚙️ Réglages.","via ⚙️ Settings.","desde ⚙️ Ajustes.","em ⚙️ Definições.","über ⚙️ Einstellungen.","tramite ⚙️ Impostazioni.","via ⚙️ Instellingen.","عبر ⚙️ الإعدادات.","ci ⚙️ Tëralin.","通过 ⚙️ 设置。"],
    ["MON RESTAURANT · NOUVEAU","MY RESTAURANT · NEW","MI RESTAURANTE · NUEVO","O MEU RESTAURANTE · NOVO","MEIN RESTAURANT · NEU","IL MIO RISTORANTE · NUOVO","MIJN RESTAURANT · NIEUW","مطعمي · جديد","SAMA RESTAURAŊ · LU BEES","我的餐厅 · 新功能"],
    ["🥡 Ma carte, mes plats & l’emporter","🥡 My menu, dishes & takeaway","🥡 Mi carta, platos y para llevar","🥡 A minha ementa, pratos e takeaway","🥡 Meine Karte, Gerichte & Abholung","🥡 Il mio menù, piatti e asporto","🥡 Mijn menu, gerechten en afhaal","🥡 قائمتي وأطباقي والطلبات الخارجية","🥡 Sama kart, samay lekk ak yóbbu","🥡 我的菜单、菜品与外带"],
    ["Préparez vos plats du jour du lundi au dimanche","Prepare your daily dishes from Monday to Sunday","Prepara los platos del día de lunes a domingo","Prepare os pratos do dia de segunda a domingo","Planen Sie Tagesgerichte von Montag bis Sonntag","Prepara i piatti del giorno da lunedì a domenica","Bereid daggerechten voor van maandag tot zondag","حضّر أطباق اليوم من الإثنين إلى الأحد","Waajal sa lekk yu bés bi, altine ba dibéer","准备周一至周日的每日菜品"],
    ["et votre carte habituelle de plats ou salades","and your regular menu of dishes or salads","y tu carta habitual de platos o ensaladas","e a sua ementa habitual de pratos ou saladas","und Ihre normale Speise- oder Salatkarte","e il menù abituale di piatti o insalate","en uw vaste kaart met gerechten of salades","وقائمة أطباقك أو سلطاتك المعتادة","ak sa kart bu yeesul ci lekk ak salaad","以及日常菜品或沙拉菜单"],
    [", avec photos, descriptions et prix. Sans menus ni formules imposés. L’emporter reste facultatif, sans caisse ni commission.",", with photos, descriptions and prices. No mandatory set menus. Takeaway is optional, with no checkout or commission.",", con fotos, descripciones y precios. Sin menús impuestos. Para llevar es opcional, sin caja ni comisión.",", com fotografias, descrições e preços. Sem menus obrigatórios. Takeaway opcional, sem caixa nem comissão.",", mit Fotos, Beschreibungen und Preisen. Keine Pflicht-Menüs. Abholung ist optional, ohne Kasse oder Provision.",", con foto, descrizioni e prezzi. Nessun menù imposto. Asporto facoltativo, senza cassa né commissioni.",", met foto's, beschrijvingen en prijzen. Geen verplichte menu's. Afhaal is optioneel, zonder kassa of commissie.","، مع الصور والأوصاف والأسعار. بلا قوائم مفروضة. الطلبات الخارجية اختيارية، دون صندوق دفع أو عمولة.","ak nataal, tekki ak njëg. Kenn du la sant sa menu. Yóbbu lekk du wajib, te amul komisiyoŋ.","配上照片、描述和价格。不强制套餐。外带自选，不设收银或佣金。"],
    ["📅 MES PLATS DU JOUR →","📅 MY DAILY DISHES →","📅 MIS PLATOS DEL DÍA →","📅 PRATOS DO DIA →","📅 MEINE TAGESGERICHTE →","📅 I MIEI PIATTI DEL GIORNO →","📅 MIJN DAGGERECHTEN →","أطباق اليوم 📅 ←","📅 SAMA LEKK YU BÉS BI →","📅 每日菜品 →"],
    ["🥗 MES PLATS & SALADES →","🥗 MY DISHES & SALADS →","🥗 MIS PLATOS Y ENSALADAS →","🥗 PRATOS E SALADAS →","🥗 GERICHTE & SALATE →","🥗 PIATTI E INSALATE →","🥗 GERECHTEN & SALADES →","الأطباق والسلطات 🥗 ←","🥗 SAMA LEKK AK SALAAD →","🥗 菜品与沙拉 →"],
    ["Préversion de test :","Test preview:","Vista de prueba:","Pré-visualização de teste:","Testvorschau:","Anteprima di prova:","Testvoorbeeld:","نسخة تجريبية:","Seet bu njëkk:","测试预览："],
    ["les plats et photos des deux éditeurs sont temporaires. Aucun plat n’est enregistré ou publié, et aucune commande à emporter ne peut être reçue. Votre gestion actuelle des tables et réservations reste inchangée.","dishes and photos in both editors are temporary. Nothing is saved or published and no takeaway orders can be received. Table and booking management is unchanged.","los platos y las fotos son temporales. No se guarda ni publica nada y no se reciben pedidos para llevar. La gestión de mesas y reservas no cambia.","os pratos e fotos são temporários. Nada é guardado ou publicado e não se recebem pedidos takeaway. A gestão de mesas e reservas mantém-se.","Gerichte und Fotos sind vorläufig. Nichts wird gespeichert oder veröffentlicht, keine Abholbestellungen möglich. Tische und Reservierungen bleiben unverändert.","piatti e foto sono provvisori. Nulla viene salvato o pubblicato e non si ricevono ordini da asporto. Tavoli e prenotazioni restano invariati.","gerechten en foto's zijn tijdelijk. Niets wordt opgeslagen of gepubliceerd en er zijn geen afhaalbestellingen. Tafels en boekingen blijven ongewijzigd.","الأطباق والصور مؤقتة. لا يتم حفظ أو نشر أي طبق ولا تُستقبل طلبات خارجية. إدارة الطاولات والحجوزات لا تتغير.","lekk ak nataal yi dañuy seet rekk. Amul lu ñuy denc walla siiwal, te kenn du mën a yónnee komànd yóbbu. Saytu taabal ak rezervaasiyoŋ soppeekuñu.","两个编辑器中的菜品和照片均为临时内容。不保存或发布菜品，也不接收外带订单。餐桌与预订管理保持不变。"],
    ["CARTE NUMÉRIQUE · QR SUR LES TABLES","DIGITAL MENU · QR ON TABLES","CARTA DIGITAL · QR EN MESAS","EMENTA DIGITAL · QR NAS MESAS","DIGITALE KARTE · QR AUF TISCHEN","MENÙ DIGITALE · QR AI TAVOLI","DIGITAAL MENU · QR OP TAFELS","قائمة رقمية · QR على الطاولات","KART DIGITAL · QR CI TAABAL YI","电子菜单 · 桌面二维码"],
    ["📱 Mon menu QR · Je modifie mes prix","📱 My QR menu · Change prices","📱 Mi menú QR · Cambio los precios","📱 O meu menu QR · Alterar preços","📱 Mein QR-Menü · Preise ändern","📱 Il mio menù QR · Modifico i prezzi","📱 Mijn QR-menu · Prijzen wijzigen","📱 قائمتي QR · تعديل الأسعار","📱 Sama menu QR · Soppi njëg yi","📱 我的二维码菜单 · 修改价格"],
    ["Créez vos rubriques, changez les prix, signalez un plat épuisé et publiez votre carte quand elle est prête. QR stable, accessible sur tout smartphone. Le brouillon reste privé.","Create categories, change prices, mark sold-out dishes and publish when ready. Stable QR works on any smartphone. Draft stays private.","Crea categorías, cambia precios, marca platos agotados y publica cuando esté listo. QR estable en cualquier móvil. El borrador es privado.","Crie categorias, altere preços, marque pratos esgotados e publique quando estiver pronto. QR estável em qualquer smartphone. Rascunho privado.","Erstellen Sie Kategorien, ändern Sie Preise, markieren Sie ausverkaufte Gerichte und veröffentlichen Sie bei Bedarf. Der QR bleibt stabil, Entwürfe privat.","Crea categorie, modifica prezzi, segnala piatti esauriti e pubblica quando vuoi. QR stabile su smartphone, bozza privata.","Maak rubrieken, wijzig prijzen, markeer uitverkochte gerechten en publiceer als het klaar is. Vaste QR op smartphones, concept privé.","أنشئ فئات وعدّل الأسعار وحدد الأطباق النافدة وانشر قائمتك عند جاهزيتها. رمز QR ثابت على الهواتف وتبقى المسودة خاصة.","Sàkk ay pàcc, soppi njëg yi, wax bu lekk jeexee te siiwal kart bi bu paree. QR bi du soppeeku, te li nga tëral du siiw.","创建分类、修改价格、标记售罄菜品，准备好后发布。二维码稳定、手机可用，草稿保持私密。"],
    ["📱 GÉRER MON MENU QR →","📱 MANAGE MY QR MENU →","📱 GESTIONAR MI MENÚ QR →","📱 GERIR O MEU MENU QR →","📱 QR-MENÜ VERWALTEN →","📱 GESTISCI IL MENÙ QR →","📱 QR-MENU BEHEREN →","إدارة قائمة QR 📱 ←","📱 SAYTU SAMA MENU QR →","📱 管理二维码菜单 →"],
    ["Sans commande automatique, sans frais sur les ventes. Cette fonction utilise une publication distincte des essais « Ma carte ».","No automatic orders or sales fees. This feature publishes separately from the test 'My menu' editor.","Sin pedidos automáticos ni comisiones. Esta función publica aparte del editor de prueba «Mi carta».","Sem pedidos automáticos nem taxas de venda. Esta função publica separadamente do editor de teste.","Keine automatischen Bestellungen oder Verkaufsgebühren. Die Veröffentlichung erfolgt getrennt vom Testeditor.","Niente ordini automatici né commissioni. La pubblicazione è separata dall'editor di prova.","Geen automatische bestellingen of verkoopkosten. Publicatie staat los van de testeditor.","لا طلبات تلقائية ولا رسوم على المبيعات. النشر مستقل عن محرر القائمة التجريبي.","Amul komànd bu boppam, amul fay komisiyoŋ. Siiwal bi bokkul ak seetu 'Sama kart'.","无自动下单、无销售手续费。此功能与“我的菜单”测试编辑器分别发布。"],
    ["🕒 Services","🕒 Services","🕒 Servicios","🕒 Serviços","🕒 Servicezeiten","🕒 Servizi","🕒 Diensten","🕒 فترات الخدمة","🕒 Sarwiis yi","🕒 服务时段"],
    ["Horaires modifiables. Chaque service affiche clairement son début et sa dernière heure de réservation.","Editable hours. Each service shows its opening and last booking time.","Horarios editables. Cada servicio muestra su inicio y la última hora de reserva.","Horários editáveis. Cada serviço mostra o início e a última hora de reserva.","Zeiten sind bearbeitbar. Jeder Service zeigt Beginn und letzte Buchungszeit.","Orari modificabili. Ogni servizio mostra inizio e ultimo orario di prenotazione.","Tijden zijn aanpasbaar. Elke dienst toont begin en laatste reserveringstijd.","يمكن تعديل المواعيد. تظهر بداية كل خدمة وآخر وقت للحجز.","Mën nga soppi waxtu yi. Sarwiis bu nekk dina wone tambali ak waxtu bu mujj ci rezervaasiyoŋ.","可调整时段。每个服务时段显示开始时间和最晚预订时间。"],
    ["Enregistrer les horaires","Save hours","Guardar horarios","Guardar horários","Zeiten speichern","Salva orari","Tijden opslaan","حفظ المواعيد","Denc waxtu yi","保存时段"],
    ["🪑 Zones & tables","🪑 Areas & tables","🪑 Zonas y mesas","🪑 Zonas e mesas","🪑 Bereiche & Tische","🪑 Zone e tavoli","🪑 Zones & tafels","🪑 المناطق والطاولات","🪑 Béréb ak taabal yi","🪑 区域与餐桌"],
    ["Structure indicative · facultative. Chaque grand carré peut représenter un secteur réel du restaurant.","Optional layout. Each large square can represent a real area of the restaurant.","Estructura orientativa y opcional. Cada cuadro grande representa una zona real del restaurante.","Estrutura indicativa e opcional. Cada quadrado representa uma zona real do restaurante.","Unverbindlicher, optionaler Plan. Jedes große Feld kann einen realen Restaurantbereich abbilden.","Struttura indicativa facoltativa. Ogni riquadro può rappresentare una zona reale del locale.","Indicatieve, optionele indeling. Elk groot vak kan een echte restaurantzone zijn.","مخطط إرشادي اختياري. كل مربع كبير قد يمثل قسمًا فعليًا من المطعم.","Palaŋ bu ñu wone rekk, doo ko war. Kër gu mag mën na tekki béréb bu dëgg ci restauraŋ bi.","可选的示意布局。每个大方框可代表餐厅的真实区域。"],
    ["↻ Rafraîchir","↻ Refresh","↻ Actualizar","↻ Atualizar","↻ Aktualisieren","↻ Aggiorna","↻ Vernieuwen","↻ تحديث","↻ Yeesal","↻ 刷新"],
    ["Nouvelle zone","New area","Nueva zona","Nova zona","Neuer Bereich","Nuova zona","Nieuwe zone","منطقة جديدة","Béréb bu bees","新区域"],
    ["Jardin, étage 2, terrasse...","Garden, floor 2, terrace...","Jardín, planta 2, terraza...","Jardim, 2.º piso, terraço...","Garten, 2. Stock, Terrasse...","Giardino, 2° piano, terrazza...","Tuin, 2e verdieping, terras...","حديقة، طابق ثانٍ، شرفة...","Tool, etaas 2, teras...","花园、二楼、露台……"],
    ["Couverts max","Max guests","Comensales máx.","Lotação máx.","Max. Gäste","Coperti max","Max. gasten","العدد الأقصى للضيوف","Ñaata nit ñoo mën a toog","最大用餐人数"],
    ["+ Ajouter une zone","+ Add area","+ Añadir zona","+ Adicionar zona","+ Bereich hinzufügen","+ Aggiungi zona","+ Zone toevoegen","إضافة منطقة +","+ Yokkal béréb","+ 添加区域"],
    ["📒 Réservations","📒 Bookings","📒 Reservas","📒 Reservas","📒 Reservierungen","📒 Prenotazioni","📒 Reserveringen","📒 الحجوزات","📒 Rezervaasiyoŋ yi","📒 预订"],
    ["Arrivé protège la table du no-show. Annulé la libère et retire la contrainte de rotation si elle n’est plus nécessaire.","Arrived protects the table from no-shows. Cancelled releases it and removes turnover constraints when unnecessary.","Llegó protege la mesa ante ausencias. Cancelada libera la mesa y elimina la rotación cuando no se necesita.","Chegou protege a mesa de faltas. Cancelada liberta-a e remove a restrição de rotação quando desnecessária.","Angekommen schützt den Tisch vor Nichterscheinen. Storniert gibt ihn frei und hebt unnötige Wechselvorgaben auf.","Arrivato protegge il tavolo dal no-show. Annullato lo libera e rimuove vincoli di rotazione non necessari.","Aangekomen voorkomt no-show voor de tafel. Geannuleerd maakt de tafel vrij en heft onnodige wisselbeperkingen op.","تأكيد الوصول يحمي الطاولة من الغياب. الإلغاء يحررها ويلغي قيود التناوب غير اللازمة.","Ñëw na dafay aar taabal bi ci ñëwul. Neenal bi dafay bàyyi taabal bi, te dindi sàrtu wërgu bu amul solo.","“已到店”避免被记为爽约；“已取消”释放餐桌，并移除不必要的翻台限制。"],
    ["Début","Start","Inicio","Início","Beginn","Inizio","Begin","البداية","Tambali","开始"],
    ["Fin réservations","Last booking","Última reserva","Última reserva","Letzte Buchung","Ultima prenotazione","Laatste reservering","آخر موعد للحجز","Mujj waxtu rezervaasiyoŋ","最晚预订"],
    ["Zone","Area","Zona","Zona","Bereich","Zona","Zone","منطقة","Béréb","区域"],
    ["Capacité max :","Max capacity:","Capacidad máx.:","Capacidade máx.:","Max. Kapazität:","Capienza max:","Max. capaciteit:","السعة القصوى:","Ñaata nit ñoo mën a toog:","最大容量："],
    ["Supprimer","Delete","Eliminar","Eliminar","Löschen","Elimina","Verwijderen","حذف","Far","删除"],
    ["🔗 Assemblable","🔗 Joinable","🔗 Unible","🔗 Unível","🔗 Kombinierbar","🔗 Unibile","🔗 Combineerbaar","🔗 قابلة للضم","🔗 Mën nañu ko boole","🔗 可拼桌"],
    [" · groupe "," · group "," · grupo "," · grupo "," · Gruppe "," · gruppo "," · groep "," · مجموعة "," · kurël "," · 组 "],
    ["Table fixe","Fixed table","Mesa fija","Mesa fixa","Fester Tisch","Tavolo fisso","Vaste tafel","طاولة ثابتة","Taabal bu sax","固定餐桌"],
    ["Aucune table : ajoutez les vraies tables de cette zone.","No tables yet: add this area's actual tables.","Sin mesas: añade las mesas reales de esta zona.","Sem mesas: adicione as mesas reais desta zona.","Keine Tische: Fügen Sie die tatsächlichen Tische hinzu.","Nessun tavolo: aggiungi i tavoli reali della zona.","Geen tafels: voeg de echte tafels van deze zone toe.","لا توجد طاولات: أضف الطاولات الفعلية لهذه المنطقة.","Amul taabal: yokkal taabal yu dëgg yi ci béréb bi.","暂无餐桌：添加该区域的真实餐桌。"],
    ["Nom table","Table name","Nombre mesa","Nome da mesa","Tischname","Nome tavolo","Tafelnaam","اسم الطاولة","Turu taabal","餐桌名称"],
    ["Places","Seats","Plazas","Lugares","Plätze","Posti","Plaatsen","المقاعد","Palaas yi","座位数"],
    ["Assemblable","Joinable","Unible","Unível","Kombinierbar","Unibile","Combineerbaar","قابلة للضم","Mën nañu ko boole","可拼桌"],
    ["Non","No","No","Não","Nein","No","Nee","لا","Déedéet","否"],
    ["Oui","Yes","Sí","Sim","Ja","Sì","Ja","نعم","Waaw","是"],
    ["Groupe","Group","Grupo","Grupo","Gruppe","Gruppo","Groep","مجموعة","Kurël","分组"],
    ["+ Table","+ Table","+ Mesa","+ Mesa","+ Tisch","+ Tavolo","+ Tafel","طاولة +","+ Taabal","+ 餐桌"],
    ["Enregistrer la zone","Save area","Guardar zona","Guardar zona","Bereich speichern","Salva zona","Zone opslaan","حفظ المنطقة","Denc béréb bi","保存区域"],
    ["Aucune réservation à venir.","No upcoming bookings.","No hay próximas reservas.","Sem reservas futuras.","Keine bevorstehenden Reservierungen.","Nessuna prenotazione in arrivo.","Geen komende reserveringen.","لا توجد حجوزات قادمة.","Amul rezervaasiyoŋ bu ñëw.","暂无即将到来的预订。"],
    ["⚠️ Table requise au service suivant · libération avant ","⚠️ Table needed for next service · release by ","⚠️ Mesa necesaria para el siguiente servicio · liberar antes de ","⚠️ Mesa necessária para o próximo serviço · libertar antes de ","⚠️ Tisch für den nächsten Service benötigt · frei bis ","⚠️ Tavolo necessario per il servizio successivo · liberare entro ","⚠️ Tafel nodig voor volgende dienst · vrij vóór ","⚠️ الطاولة مطلوبة للخدمة التالية · تُخلى قبل ","⚠️ Ñu soxla taabal bi ci sarwiis bi ci topp · bàyyil ko bala ","⚠️ 下一时段需要此桌 · 请于此时间前释放："],
    ["✅ Réservée","✅ Reserved","✅ Reservada","✅ Reservada","✅ Reserviert","✅ Prenotata","✅ Gereserveerd","✅ محجوزة","✅ Ñu denc na ko","✅ 已预订"],
    ["🟢 Arrivé","🟢 Arrived","🟢 Llegó","🟢 Chegou","🟢 Angekommen","🟢 Arrivato","🟢 Aangekomen","🟢 وصل","🟢 Ñëw na","🟢 已到店"],
    ["Terminé","Completed","Finalizada","Concluída","Abgeschlossen","Completata","Afgerond","مكتمل","Jeex na","已完成"],
    ["Annulé","Cancelled","Cancelada","Cancelada","Storniert","Annullata","Geannuleerd","ملغاة","Neenal na","已取消"],
    ["Enregistrer","Save","Guardar","Guardar","Speichern","Salva","Opslaan","حفظ","Denc","保存"],
    ["confirmed","Confirmed","Confirmada","Confirmada","Bestätigt","Confermata","Bevestigd","مؤكد","Dëggal nañu ko","已确认"],
    ["arrived","Arrived","Llegó","Chegou","Angekommen","Arrivato","Aangekomen","وصل","Ñëw na","已到店"],
    ["completed","Completed","Finalizada","Concluída","Abgeschlossen","Completata","Afgerond","مكتمل","Jeex na","已完成"],
    ["cancelled","Cancelled","Cancelada","Cancelada","Storniert","Annullata","Geannuleerd","ملغى","Neenal na","已取消"],
    ["no_show_released","No-show, released","Ausencia, liberada","Falta, libertada","Nichterscheinen, freigegeben","Assente, liberato","Niet verschenen, vrijgegeven","لم يحضر، الطاولة متاحة","Ñëwul, taabal bi féex na","未到店，餐桌已释放"],
    ["Connecté : ","Signed in: ","Conectado: ","Ligado: ","Angemeldet: ","Connesso: ","Ingelogd: ","متصل: ","Dugg na: ","已登录："],
    ["pers.","guests","personas","pessoas","Pers.","pers.","personen","أشخاص","nit","位"],
    ["⚠️ Restaurant manquant ou inconnu. Ouvrez votre propre fiche DIGIY RESTO.","⚠️ Missing or unknown restaurant. Open your own DIGIY RESTO listing.","⚠️ Restaurante inexistente o desconocido. Abre tu propia ficha DIGIY RESTO.","⚠️ Restaurante ausente ou desconhecido. Abra a sua ficha DIGIY RESTO.","⚠️ Restaurant fehlt oder ist unbekannt. Öffnen Sie Ihren eigenen DIGIY RESTO-Eintrag.","⚠️ Ristorante mancante o sconosciuto. Apri la tua scheda DIGIY RESTO.","⚠️ Restaurant ontbreekt of is onbekend. Open uw eigen DIGIY RESTO-profiel.","⚠️ المطعم مفقود أو غير معروف. افتح صفحتك الخاصة في DIGIY RESTO.","⚠️ Restauraŋ bi amul walla xameesu ko. Ubbi sa fich DIGIY RESTO.","⚠️ 餐厅不存在或未识别。请打开您自己的 DIGIY RESTO 页面。"],
    ["⚠️ Ce compte n’est pas autorisé à gérer ce restaurant.","⚠️ This account cannot manage this restaurant.","⚠️ Esta cuenta no tiene permiso para gestionar este restaurante.","⚠️ Esta conta não pode gerir este restaurante.","⚠️ Dieses Konto darf das Restaurant nicht verwalten.","⚠️ Questo account non può gestire il ristorante.","⚠️ Dit account mag dit restaurant niet beheren.","⚠️ هذا الحساب غير مخوّل بإدارة المطعم.","⚠️ Kont bii amul ndigal ngir saytu restauraŋ bii.","⚠️ 此账户无权管理该餐厅。"],
    ["✅ Horaires enregistrés.","✅ Hours saved.","✅ Horarios guardados.","✅ Horários guardados.","✅ Zeiten gespeichert.","✅ Orari salvati.","✅ Tijden opgeslagen.","✅ تم حفظ المواعيد.","✅ Denc nañu waxtu yi.","✅ 时段已保存。"],
    ["Nom et capacité requis.","Name and capacity required.","Se necesitan nombre y capacidad.","Nome e capacidade obrigatórios.","Name und Kapazität erforderlich.","Nome e capienza obbligatori.","Naam en capaciteit vereist.","الاسم والسعة مطلوبان.","Turu béréb ak ñaata nit lañu soxla.","必须填写名称和容量。"],
    ["✅ Zone ajoutée.","✅ Area added.","✅ Zona añadida.","✅ Zona adicionada.","✅ Bereich hinzugefügt.","✅ Zona aggiunta.","✅ Zone toegevoegd.","✅ تمت إضافة المنطقة.","✅ Yokkal nañu béréb bi.","✅ 区域已添加。"],
    ["✅ Zone enregistrée.","✅ Area saved.","✅ Zona guardada.","✅ Zona guardada.","✅ Bereich gespeichert.","✅ Zona salvata.","✅ Zone opgeslagen.","✅ تم حفظ المنطقة.","✅ Denc nañu béréb bi.","✅ 区域已保存。"],
    ["Nom et nombre de places requis.","Table name and seats required.","Nombre y plazas obligatorios.","Nome e lugares obrigatórios.","Name und Sitzplätze erforderlich.","Nome e posti obbligatori.","Naam en aantal plaatsen vereist.","اسم الطاولة وعدد المقاعد مطلوبان.","Turu taabal ak ñaata palaas lañu soxla.","必须填写餐桌名称和座位数。"],
    ["✅ Table ajoutée.","✅ Table added.","✅ Mesa añadida.","✅ Mesa adicionada.","✅ Tisch hinzugefügt.","✅ Tavolo aggiunto.","✅ Tafel toegevoegd.","✅ تمت إضافة الطاولة.","✅ Yokkal nañu taabal bi.","✅ 餐桌已添加。"],
    ["Table supprimée.","Table deleted.","Mesa eliminada.","Mesa eliminada.","Tisch gelöscht.","Tavolo eliminato.","Tafel verwijderd.","تم حذف الطاولة.","Far nañu taabal bi.","餐桌已删除。"],
    ["Zone supprimée.","Area deleted.","Zona eliminada.","Zona eliminada.","Bereich gelöscht.","Zona eliminata.","Zone verwijderd.","تم حذف المنطقة.","Far nañu béréb bi.","区域已删除。"],
    ["✅ Réservation mise à jour.","✅ Booking updated.","✅ Reserva actualizada.","✅ Reserva atualizada.","✅ Reservierung aktualisiert.","✅ Prenotazione aggiornata.","✅ Reservering bijgewerkt.","✅ تم تحديث الحجز.","✅ Yeesal nañu rezervaasiyoŋ bi.","✅ 预订已更新。"]
  ];

  const phrases = new Map();
  for (const row of rows) {
    if (row.length !== langs.length) throw new Error("WORLD10: missing locale for " + row[0]);
    if (phrases.has(row[0])) throw new Error("WORLD10: duplicate key " + row[0]);
    phrases.set(row[0], row);
  }
  const originalText = new WeakMap();
  const originalPlaceholder = new WeakMap();
  const params = new URLSearchParams(location.search);
  let lang = params.get("lang");
  if (!langs.includes(lang)) {
    try { lang = localStorage.getItem("digiy_resto_pro_lang") || sessionStorage.getItem("digiy_resto_pro_lang"); } catch (_) {}
  }
  if (!langs.includes(lang)) lang = "fr";

  const t = fr => {
    const row = phrases.get(fr);
    return row ? row[langs.indexOf(lang)] : fr;
  };
  const isOwnerName = el => !!el.closest(".site, #ownerHeaderTitle, #siteName");
  function translateText(node) {
    if (!node || !node.parentElement) return;
    const parent = node.parentElement;
    if (parent.closest("script,style,textarea,code") || isOwnerName(parent)) return;
    let raw = originalText.get(node);
    if (raw === undefined) { raw = node.nodeValue; originalText.set(node, raw); }
    const leading = (raw.match(/^\s*/) || [""])[0];
    const trailing = (raw.match(/\s*$/) || [""])[0];
    const source = raw.trim();
    let value = t(source);
    if (parent.matches(".badge") && lang === "fr") {
      const frStatuses = {confirmed:"Confirmée", arrived:"Arrivée", completed:"Terminée", cancelled:"Annulée", no_show_released:"Absence, table libérée"};
      value = frStatuses[source] || value;
    }
    if (parent.id === "who" && source.startsWith("Connecté : ")) {
      value = t("Connecté : ") + source.slice("Connecté : ".length);
    } else if (parent.classList.contains("rotation") && source.startsWith("⚠️ Table requise au service suivant · libération avant ")) {
      const prefix = "⚠️ Table requise au service suivant · libération avant ";
      value = t(prefix) + source.slice(prefix.length);
    } else if ((parent.closest(".bookingTop strong") || parent.closest(".tableCard strong")) && source.endsWith(" pers.")) {
      value = source.slice(0, -"pers.".length) + t("pers.");
    } else if (parent.closest(".tableCard small") && source.startsWith("🔗 Assemblable")) {
      value = source.replace("🔗 Assemblable", t("🔗 Assemblable")).replace(" · groupe ", t(" · groupe "));
    }
    const next = source ? leading + value + trailing : raw;
    if (node.nodeValue !== next) node.nodeValue = next;
  }
  function translatePage() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[placeholder]").forEach(el => {
      if (!originalPlaceholder.has(el)) originalPlaceholder.set(el, el.getAttribute("placeholder"));
      const raw = originalPlaceholder.get(el);
      if (raw != null && el.getAttribute("placeholder") !== t(raw)) el.setAttribute("placeholder", t(raw));
    });
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) translateText(walker.currentNode);
    const access = location.pathname.endsWith("/acces-proprietaire.html");
    const demo = location.pathname.endsWith("/demo-pro.html");
    document.title = t(demo ? "DEMO RESTO PRO · DIGIYLYFE" : (access ? "Accès propriétaire RÉSA RESTO — DIGIYLYFE" : "Gestion RESA RESTO — DIGIYLYFE"));
    const picker = document.getElementById("restoProWorld10");
    if (picker) {
      picker.value = lang;
      picker.setAttribute("aria-label", t("Langue"));
    }
    document.querySelectorAll("a[href]").forEach(a => {
      const raw = a.getAttribute("href");
      if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return;
      let url;
      try { url = new URL(raw, location.href); } catch (_) { return; }
      if (url.hostname !== location.hostname && url.hostname !== "resto.digiylyfe.com") return;
      if (url.searchParams.get("lang") === lang) return;
      url.searchParams.set("lang", lang);
      a.setAttribute("href", url.href);
    });
  }
  function setLang(next) {
    if (!langs.includes(next)) return;
    lang = next;
    try { sessionStorage.setItem("digiy_resto_pro_lang", lang); localStorage.setItem("digiy_resto_pro_lang", lang); } catch (_) {}
    const url = new URL(location.href);
    url.searchParams.set("lang", lang);
    history.replaceState(null, "", url.href);
    translatePage();
  }
  function boot() {
    const header = document.querySelector("header.top");
    if (header && !document.getElementById("restoProWorld10")) {
      const picker = document.createElement("select");
      picker.id = "restoProWorld10";
      picker.style.cssText = "width:auto;max-width:120px;min-height:37px;border:1px solid #d8ad46;border-radius:12px;padding:6px 8px;background:#fff;color:#073f32;font:900 12px system-ui;direction:ltr";
      picker.setAttribute("aria-label", "Langue");
      for (let i=0; i<langs.length; i++) {
        const option = document.createElement("option");
        option.value = langs[i];
        option.textContent = names[i];
        picker.appendChild(option);
      }
      picker.value = lang;
      picker.addEventListener("change", () => setLang(picker.value));
      header.appendChild(picker);
    }
    translatePage();
    // Rend aussi les panneaux construits après chargement Supabase / chaque réservation.
    const observer = new MutationObserver(() => translatePage());
    observer.observe(document.body, {subtree:true, childList:true, characterData:true});
    // Le clic sur un restaurant met à jour ?site= dans le code historique :
    // conserver ?lang= sans modifier le choix de site ni la connexion.
    document.querySelectorAll(".site").forEach(el => {
      el.addEventListener("click", () => {
        const url = new URL(location.href);
        if (url.searchParams.get("lang") !== lang) {
          url.searchParams.set("lang", lang);
          history.replaceState(null, "", url.href);
        }
      });
    });
    window.DIGIY_RESTO_PRO_WORLD10 = {locales: langs.slice(), phrases: phrases.size, getLang: () => lang, setLang};
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once:true});
  else boot();
})();
