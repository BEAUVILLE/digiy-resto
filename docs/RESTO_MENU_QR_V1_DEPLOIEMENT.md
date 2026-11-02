# DIGIY RESTO — Carte QR autonome V1 (2 novembre 2026)

## Rôle
Ajouter **dans DIGIY RESTO existant**, sans nouveau module ni nouvel abonnement technique, un menu lisible sur téléphone accessible par QR de table. Le restaurateur garde le contrôle de ses titres, rubriques, descriptions, prix, disponibilité et contact public. Pas d'application à installer pour les visiteurs, pas d'encaissement ni de réservation impliqués, zéro commission sur la transaction.

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
1. **Ne pas fusionner ni présenter comme disponible au public avant validation.** SQL non appliqué par cette PR.
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
6. Après accord propriétaire pour **ses vrais plats et prix**, déployer la migration en production et fusionner le code ; refaire les tests A/B réels et le contrôle du public. Sans ce feu vert, conserver la fonctionnalité en branche.

## Limites V1
- Création **manuelle** des textes et prix ; ni import PDF, ni téléchargement de photo, ni édition des plats de la semaine V35A.
- Pas de promesse de disponibilité garantie, de vente à emporter, ni de commande.
- Le menu QR public nécessite le réseau pour obtenir la **dernière publication**. Ne pas afficher une copie ancienne sans avertissement.
- Générateur QR sur l'espace PRO avec la bibliothèque libre qrcodejs chargée du CDN ; **aucun appel QR externe** ne transmet le contenu du menu. Le lien reste copiable si la bibliothèque ne charge pas.
- L'historique complet des révisions et la gestion des conflits entre deux sessions sont à étudier ultérieurement ; la copie publiée reste isolée des brouillons.

## Conservation doctrine
Un seul MASTER RESTO, sans clonage par ville, et abonnement RESTO existant. Le restaurateur reste maître des contenus et des prix. Contact/paiement directs, 0 % commission ; aucune nouvelle dépense technique.
