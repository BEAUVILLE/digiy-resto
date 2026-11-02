# DIGIY RESTO — Carte QR autonome V1 (2 novembre 2026)

## Rôle
Ajouter **dans DIGIY RESTO existant**, sans nouveau module ni nouvel abonnement technique, un menu lisible sur téléphone accessible par QR de table. Le restaurateur garde le contrôle de ses titres, rubriques, descriptions, prix, disponibilité et contact public. Pas d'application à installer pour les visiteurs, pas d'encaissement ni de réservation impliqués, zéro commission sur la transaction.

## Décision propriétaire — site commun, gestion indépendante (2 novembre 2026)

**Le Malraux et L’Entre 2 partagent une vitrine web** `https://malraux-entre2.digiylyfe.com/`, **mais ne partagent pas leur compte de gestion**. Il ne faut jamais confondre le site vitrine commun avec une propriété juridique ou une autorisation partagée.

| Restaurant | Slug de gestion | Menu QR dédié | Identité de gestion |
| --- | --- | --- | --- |
| Le Malraux | `le-malraux-sarlat` | `/menu-qr.html?site=le-malraux-sarlat` | Son propre compte Auth, distinct |
| L’Entre 2 | `entre2-sarlat` | `/menu-qr.html?site=entre2-sarlat` | Son propre compte Auth, distinct |

- Une connexion à un établissement **n'autorise jamais** la modification des prix, plats, brouillons ou publications de l'autre.
- La migration propose un **index SQL unique partiel** sur `digiy_resa_resto_sites.owner_id`, ciblé **uniquement sur les deux slugs réels** : elle refuse le rattachement des deux restaurants au même identifiant Auth. Les environnements de test restent autonomes et sont exclus de cet index.
- Aujourd'hui les deux fiches RÉSA de ces établissements sont **inactives et sans owner_id**. Ceci décrit l'activation logicielle, **pas la fermeture des établissements physiques**. Il faut deux propriétaires effectivement autorisés et deux rattachements séparés avant toute ouverture.
- Aucun compte ne doit être inventé, partagé ou revendiqué sans l'accord du professionnel. Ne modifier ni le site web commun ni les contacts publics pour contourner ce contrôle.
- Le test PostgreSQL 17 isolé vérifie la séparation des droits A/B **et** le refus SQL d'un owner Auth commun.

## Parcours livré dans la branche
- Depuis l'espace authentifié `/resa-resto/gestion.html?site=<slug>`, le restaurateur clique **GÉRER MON MENU QR**.
- `/resa-resto/ma-menu-qr.html?site=<slug>` vérifie **le JWT Auth réel** et que `digiy_resa_resto_sites.owner_id = auth.uid()`. Aucun repli sur un site test.
- Le professionnel ajoute/modifie/supprime des rubriques/plats, modifie les prix, marque **épuisé**, puis **sauvegarde le brouillon privé**. Publier est volontaire et distinct ; masquer est immédiat dès confirmation DB.
- Il obtient une URL stable `https://resto.digiylyfe.com/menu-qr.html?site=<slug>`, son QR imprimable et un bouton copier le lien.
- Le visiteur ne lit **que la version publiée**, adaptée au mobile. Sans publication, le message est neutre ; aucun plat ou prix n'est inventé. En cas d'indisponibilité réseau, on ne montre pas de prix périmé comme actuel.

## Schéma et sécurité
`sql/20261102_resto_menu_qr_owner_public.sql` crée **deux tables distinctes**, `digiy_resto_qr_drafts` et `digiy_resto_qr_public` ; la première n'accorde **aucun accès anon** ; la seconde ne révèle que les lignes `published = true` à `anon`, et réserve INSERT/UPDATE aux propriétaires autorisés par RLS et `auth.uid()`. Le contrôle de la correspondance `site_id ↔ slug` empêche la publication sous le slug d'autrui. Aucun `service_role` n'est présent dans le navigateur.

Les clients ne récupèrent pas les emails des propriétaires ni les réservations. Texte public rendu avec `textContent` (pas de HTML fourni par le commerçant). Les numéros de téléphone passent par une validation stricte pour les actions d'appel/WhatsApp.

## Mise en service : ordre impératif
1. **La fusion du code est permise, mais n'active pas la fonction** : le bloc Menu QR dans `resa-resto/gestion.html` reste masqué par la classe CSS `hidden`, et aucune carte n'est publiée. Le SQL n'est PAS appliqué par la fusion ; n'annoncer ni lien QR opérationnel ni menus modifiables aux restaurateurs avant activation.
2. Contrôler le dernier **backup chiffré digiy-core**, effectuer une **restauration isolée** et vérifier RLS / droits actuels. Ne jamais afficher la clé de sauvegarde.
3. Exécuter le SQL de manière transactionnelle **sur environnement isolé d'abord** ; vérifier les politiques avec deux utilisateurs authentifiés A et B propriétaires de deux sites différents et un utilisateur anonyme :
   - A peut sauvegarder puis publier **uniquement A** ;
   - B ne peut pas lire le brouillon A, modifier la carte A, publier ou masquer A, ni utiliser le `slug` de A sur son propre `site_id` ;
   - `anon` ne voit aucun brouillon et aucune carte masquée ; ne voit qu'une version explicitement publiée ;
   - un compte connecté **non propriétaire** et un site sans propriétaire sont refusés ;
   - une modification de brouillon ne modifie pas le menu public, une republication oui ;
   - le retour de la publication côté navigateur indique un succès seulement après confirmation DB.
4. Vérifier sur iPhone et Android : menus vides, plusieurs rubriques, FCFA/EUR, prix absent, prix corrigé, épuisé, impressions QR, caméra native, accès sans application, connexion lente et panne du CDN QR (lien texte reste utilisable).
5. Vérifier qu'aucune donnée de réservation, aucun calendrier, aucune caisse ou commande réelle n'a été modifiée.
6. Après accord propriétaire pour **ses vrais plats et prix**, et restauration de sauvegarde récente prouvée, déployer la migration en production, habiliter les deux propriétaires distincts, réaliser les tests A/B réels et téléphone, puis **ouvrir le bloc Menu QR par une nouvelle PR dédiée** retirant sa classe `hidden`. Tant que ces prérequis manquent, le menu demeure masqué malgré la fusion du code.

## Limites V1
- Création **manuelle** des textes et prix ; ni import PDF, ni téléchargement de photo, ni édition des plats de la semaine V35A.
- Pas de promesse de disponibilité garantie, de vente à emporter, ni de commande.
- Le menu QR public nécessite le réseau pour obtenir la **dernière publication**. Ne pas afficher une copie ancienne sans avertissement.
- Générateur QR sur l'espace PRO avec la bibliothèque libre qrcodejs chargée du CDN ; **aucun appel QR externe** ne transmet le contenu du menu. Le lien reste copiable si la bibliothèque ne charge pas.
- L'historique complet des révisions et la gestion des conflits entre deux sessions sont à étudier ultérieurement ; la copie publiée reste isolée des brouillons.

## Conservation doctrine
Un seul MASTER RESTO, sans clonage par ville, et abonnement RESTO existant. Le restaurateur reste maître des contenus et des prix. Contact/paiement directs, 0 % commission ; aucune nouvelle dépense technique.
