# DIGIY RESTO V35A — Menu visuel de la semaine (7 jours)

**Statut : conception et moteur d'affichage isolé — aucun déploiement métier, aucune migration SQL, aucune carte réelle publiée.**  
Chantier parent : [V35, autonomie de la carte du restaurateur](https://github.com/BEAUVILLE/digiy-resto/issues/27).  
**Intention :** le restaurateur annonce ses vrais plats de la semaine, en photos, **jour après jour**. Le client reste en contact direct avec lui.

## Expérience propriétaire — « Ma semaine »

- Le propriétaire connecté, rattaché à **son** restaurant, ouvre « Ma carte → Ma semaine ».
- Il choisit la semaine du **lundi au dimanche** de son établissement (Europe/Paris ou Africa/Dakar selon configuration).
- Chaque jour possède, **uniquement si le professionnel les utilise**, une rubrique MIDI et une rubrique SOIR. Plusieurs plats peuvent être annoncés par service ; pas d'obligation d'avoir un menu fixe.
- Pour chaque plat : photo réelle (facultative), texte alternatif de la photo, nom, catégorie, petite description, tarif annoncé si le restaurant souhaite le communiquer, devise locale et disponibilité déclarée. Photo absente = carte typographique élégante, **jamais une photo artificielle**.
- Possibilité de modifier et de réordonner les plats, corriger un prix, masquer un plat épuisé, suspendre un jour entier.
- **Brouillon → prévisualisation → publication explicite.** Un enregistrement ne publie pas automatiquement. Le propriétaire peut dépublier immédiatement ; une modification d'un brouillon ne change jamais ce qu'un client voit.
- « **Dupliquer la semaine précédente** » crée seulement un **nouveau brouillon** daté. Nouvelle vérification des prix, produits et photos avant republication ; jamais de reconduction automatique de la disponibilité.
- Versionnage minimal : semaine, restaurant propriétaire, numéro de version, date de publication, statut, auteur de la dernière publication. Historique privé ; pas de données client.

## Expérience publique — « Nos plats cette semaine »

1. **Aujourd'hui** en tête sur la fiche : photos, noms, prix déclarés et services correspondant à la date locale du restaurant.
2. Sous le jour actuel, une bande « **Programme de la semaine** » avec sept jours (lun. → dim.). Sur téléphone : onglets défilants, grandes photos en cartes 4:3, noms et prix très lisibles, `loading="lazy"` pour les autres journées.
3. Une semaine ou un jour non renseigné affiche « **Aucun plat annoncé pour cette journée** », plus les boutons existants **APPELER** et **VOIR LE SITE**. **Ne pas interpréter silence comme fermeture du restaurant.**
4. Les dates passées ne restent pas annoncées comme disponibles ; les heures et le fuseau sont ceux du restaurant. Si le plat du jour est « épuisé », indiquer « épuisé » ou masquer conformément à son choix.
5. **Informer n'est pas vendre.** Une photo et un prix ne créent ni réservation, ni commande, ni disponibilité garantie. À emporter reste une option **séparée**, désactivée sans accord et paramètres réels validés, suivant V34.

## Proposition de contrat serveur (concept, aucun SQL livré)

- `weekly_menus` : `id`, `site_id`, `week_start_date` (lundi ISO), `timezone` fixé selon le site, `status` (draft/published/paused), `draft_revision`, `published_revision`, `published_at`.
- `weekly_menu_items` ou snapshot JSON contrôlé : `menu_id`, `date`, `service` (lunch/dinner), `order`, `title`, `description`, `category`, `price_minor` optionnel, `currency`, `photo_object_key` optionnel, `photo_alt`, `availability_label`, `takeaway_approved` séparé.
- Lecture publique **uniquement des versions publiées** dans la semaine correspondante, sans email, session ni information privée. Les droits propriétaires doivent lier toutes les écritures à l'identité JWT réelle et au site, y compris les photos.
- Réduire la surface de droits des RPC ; la publication des snapshots doit être atomique pour éviter une semaine à moitié publiée.
- Photos : contrôle de type, taille et propriétaire des objets ; formats sûrs optimisés WebP/AVIF, pas de SVG actif ni de HTML transmis comme HTML, pas d'URL utilisateur arbitraire. Prévoir suppression/archivage sans effacer des photos utilisées par une autre version publiée.

## Validation — la boussole LOC

- Avant backend : analyse complète des tables, signatures, grants, politiques RLS, Auth et clients RESTO ; restaurateurs réellement rattachés à leur compte.
- Nouvelle sauvegarde chiffrée restaurée en isolation avant SQL ; ne jamais toucher à `digiy_resa_resto_bookings`, `digiy_resa_resto_booking_tables` ni aux réservations LOC.
- Tests : zéro contenu, 1 plat et plusieurs plats par jour, midi/soir, 7 jours, lundi/dimanche, année bissextile et DST Europe/Paris, photos manquantes, prix optionnel, plats épuisés ; refus anonyme et refus propriétaire B d'écrire chez A ; brouillon invisible, pause immédiate, versions et concurrence.
- Tests navigateur iPhone/Android, images optimisées et boutons appel/site. Tests V34 à emporter et moteur RÉSA RESTO toujours verts.
- Publication progressive uniquement après validation des **vrais menus et photos** du restaurateur et vérification des sessions propriétaires.

## État réellement codé dans cette PR

- `src/resto-v35-weekly-core.js` : calcul ISO de la semaine, changement de territoire/fuseau, contrôle des jours et projection publique des seuls menus publiés. **Aucune requête réseau.**
- `prototypes/resto-v35-ma-semaine.html` et `prototypes/resto-v35-ma-semaine.js` : **interface de démonstration réellement interactive, NON CONNECTÉE**. Choisir un jour, midi/soir, ajouter un plat et sa description, sélectionner un prix EUR/XOF, prévisualiser une photo locale JPG/PNG/WebP/AVIF de moins de 4 Mo, examiner le programme des sept jours et effacer le brouillon.
- Le prototype ne conserve **rien** : pas de base, pas d'auth, pas de cookie, pas de `localStorage`, pas d'upload, pas de commande, aucun bouton « Publier » actif. Les photos sont des URLs `blob:` temporaires révoquées lors de leur suppression/fermeture. Le formulaire est explicitement étiqueté « MAQUETTE NON CONNECTÉE ».
- `tests/resto-v35-weekly-core.test.cjs` (**9 cas**) + `tests/resto-v35-prototype.test.cjs` (**7 cas**) et workflow CI Node 22 : 16 scénarios automatiques isolés. Ces tests ne prouvent **pas** un accès propriétaire réel ni un affichage navigateur final sur téléphone.
- **À ne pas confondre avec le déploiement client** : aucun menu hebdomadaire réel n'est visible sur `resto.digiylyfe.com`, pas de table Supabase weekly menu, et pas de lien depuis l'espace propriétaire réel vers cette maquette.

### Conditions avant de mettre en service

1. Rattachement du **vrai propriétaire** à son restaurant et authentification fonctionnelle, sans repli sur les sites de démonstration.
2. Persistance d'un brouillon propriétaire + version publiée distincte ; auth A/B, `anon` lecture des seules versions publiées ; sauvegarde chiffrée/restauration isolée et RLS avant activation.
3. Images professionnelles stockées avec autorisation propriétaire et quotas, photo réelle approuvée, retrait d'image/suppression propre ; optimisation mobile.
4. Raccord `gestion.html` « Ma semaine », puis bloc public « Les plats aujourd'hui / Cette semaine » sur les deux fiches, sans fausse disponibilité, sans paiement et sans changement aux RPC réservations.
5. Tests sur navigateur/téléphone, horaires Europe/Paris/Africa/Dakar, accord du restaurateur, autorisation de publication et contrôle après déploiement.

**Doctrine : être vu, être trouvé, être contacté. 0 % de commission. Relation directe et carte décidée par le restaurateur.**
