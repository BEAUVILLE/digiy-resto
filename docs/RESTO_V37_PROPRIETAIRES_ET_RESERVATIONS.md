# RESTO V37 — propriétaires A/B, réservations, emporter : audit de production et tests isolés

**10 octobre 2026.** Restitution de contrôles en **lecture seule** sur
Supabase DIGIY CORE, projet `wesqmwjjtsefyjnluosj`, et de tests fictifs
PostgreSQL 17 à l'écart de toute production. Aucun compte, client, paiement
ou commande réelle n'est créé par cette PR.

## Sauvegarde — porte prioritaire à renouveler

La restauration hors réseau du snapshot chiffré 2026-10-09 09:13 UTC
a **réussi** : LOC 82/82, RESTO 4 restaurants (2 actifs et rattachés), 7
zones, 10 tables, 8 services, 0 réservation V31, 2 anciennes réservations,
RLS 6/6, RPC 5/5, zéro relation orpheline.

**Attention : l'ancien snapshot garde EXECUTE anon sur trois RPC
propriétaires (3/3)**. La production est **corrigée (0/3)**.
Ce décalage correspond à la chronologie du correctif RESTO.
Une nouvelle archive **postérieure** à la correction et une restauration
privée Docker sont donc nécessaires pour vérifier la récupération des
droits actuels.

Workflow manuel de sauvegarde :
[admin-digiy / DIGIY — Sauvegarde Supabase chiffrée](https://github.com/BEAUVILLE/admin-digiy/actions/workflows/supabase-backup.yml),
bouton `Run workflow`, branche `main`. Contrôler succès, nom du ZIP,
artefact chiffré et rapport du backup ; ne jamais afficher ou partager le
mot de passe. La sauvegarde nocturne existe mais n'est pas une preuve du
dernier état tant que son exécution n'est pas confirmée.

## Audit réel RESTO CORE

- 4 restaurants ; 2 actifs, 2 rattachés avec un utilisateur Auth valide.
- **Un seul `owner_id` distinct pour les deux restaurants actifs.**
  Aucun test vrai A/B de propriétaires indépendants n'est possible à ce
  jour sans autoriser explicitement un deuxième utilisateur réel.
- 6 tables RESTO avec RLS activée, politiques propriétaires utilisant
  `auth.uid()`; toutes les relations enfant contrôlées.
- Trois RPC propriétaire `SECURITY DEFINER` actuellement non exécutables
  par `anon`; deux RPC de réservation publiques accessibles par `anon`.
- 0 réservation moteur V31, 2 enregistrements anciens ; pas de trigger
  PAY attaché à `digiy_resa_resto_bookings` : aucune recette PAY fictive
  générée par changement de statut RESTO observée.
- La RPC `digiy_resa_resto_public_book_v1` contrôle zone, horaires,
  capacité et verrou `pg_advisory_xact_lock`, puis insère une
  réservation `confirmed` avec délai de grâce.
- **Point à corriger avant ouverture généralisée :** ni
  `digiy_resa_resto_public_availability_v1` ni
  `digiy_resa_resto_public_book_v1` ne refusent explicitement une
  **date/heure passée dans le fuseau local du restaurant**. L'emploi de
  `now()` dans la RPC de booking ne sert qu'aux `updated_at` ;
  il ne filtre pas `p_booking_date` / `p_booking_time`. Les issues
  RESTO V32 signalent ce manque. Ne pas modifier aveuglément les
  fonctions existantes : préparer une correction dédiée, isolée,
  transactionnelle et testée pour Europe/Paris (été/hiver) et
  Africa/Dakar, après snapshot actuel.
- Le moteur `À EMPORTER` de la fiche L'Entre 2 est un aperçu non
  transactionnel ; Le Malraux est une prise de renseignements directe.
  Il n'y a pas de commande client à valider comme enregistrée, aucune
  carte officielle validée ni caisse à activer. Cette étape nécessite
  l'accord réel du restaurant sur menus/prix/horaires.
- V35 `Ma carte` est encore un éditeur brouillon **non persistant**,
  et `Ma semaine` une maquette autonome ; ne pas les présenter comme
  en production.

## Cette PR : test propriétaire A/B isolé

La CI crée un PostgreSQL 17 sans réseau avec deux propriétaires fictifs
ayant des UUID distincts et trois restaurants, dont un encore non
réclamé. Elle recopie le comportement de propriété des **trois RPC
propriétaires actuelles**, y compris leurs droits SQL, avec RLS par
`auth.uid()`. Vérifications :

1. Le rôle `anon` ne peut exécuter aucune des trois RPC propriétaire.
2. A voit seulement son restaurant et sa réservation via RLS.
3. A peut changer son statut, mais ne peut ni modifier la réservation
   de B, ni déclencher les no-show de B, ni revendiquer un restaurant
   lié à l'email de B.
4. B voit seulement son restaurant et sa réservation, modifie la sienne
   mais ne peut jamais modifier celle de A ; B seul peut revendiquer
   le site dont l'email contact correspond à son jeton fictif.
5. Les refus croisés ne doivent pas modifier l'état initial de l'autre
   propriétaire. Aucun vrai JWT ou Auth Supabase n'est généré.
6. Toutes les données et le conteneur sont détruits en fin de CI.

**Limites explicites :** Ce test rejoue la logique de fonctions en
environnement synthétique ; il ne prouve pas l'authentification de
deux vrais propriétaires sur l'application publique. Il faut le
confirmer au navigateur sur deux vraies sessions autorisées, puis
confirmer sur iPhone/Android.

## GO/NO GO : ordre opérationnel

1. Lancer nouveau backup chiffré via `workflow_dispatch` du dépôt
   `admin-digiy`. Télécharger le ZIP privé après succès et l'utiliser
   avec le script de restauration Docker qui sait vérifier LOC + RESTO.
   La baseline doit venir d'une lecture réelle du snapshot concerné ;
   ne pas la supposer à vie.
2. Après CI A/B isolée verte, organiser deux comptes propriétaires réels
   distincts autorisés ; garder `service_role` côté serveur uniquement.
3. Refuser les réservations dans le passé **côté serveur** et revalider
   date/heure/zone/capacité et 15 minutes de grâce. Pas de réservations
   fictives sur PROD.
4. Obtenir BAT et validation restaurateur pour carte, prix, produits
   emportables, horaires de retrait et modes de contact ; activer
   séparément de la réservation des tables.
5. Garder contact/paiement directs, **0 % de commission**, aucune
   obligation de logiciel caisse ; CARNET PRO reste un produit facultatif.

**Aucune migration SQL sur production ni activation d'emporter dans cette PR.**
