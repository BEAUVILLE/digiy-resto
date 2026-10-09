# DIGIY TRUST — RÉSA RESTO et fiches professionnelles

**9 octobre 2026 — Portage public non transactionnel, sans activation des évaluations.**

## Pourquoi

Les fiches RESTO doivent inspirer confiance grâce à une information **exacte**, et non à des étoiles ou des avis fictifs. On reprend de DIGIY TRUST LOC et MASTER/MAÎTRE le principe **étoiles rapides sans commentaire, après une prestation réellement accomplie et attestée**, avec un **rapport qualité-prix toujours distinct** de la note générale.

Le rapport qualité-prix mesure **la valeur du repas et du service effectivement reçus au regard de son prix**, pas le restaurant le moins cher. Les critères et pondérations doivent respecter le métier (qualité des plats, service/accueil, ponctualité/fiabilité, disponibilité, autres axes réellement pertinents).

## Surfaces intégrées

- `fiche-le-malraux.html` : bloc DIGIY TRUST sous les accès/conditions, avant les informations à emporter.
- `fiche-lentre2.html` : même bloc sur la fiche, avant l'aperçu de la vente à emporter.
- `resa-resto/index.html` : bloc de confiance placé **après** la carte de réservation, pas entre le choix du créneau et le bouton de confirmation.
- `assets/digiy-trust-resto.css` : présentation harmonisée, accessible et mobile.
- `assets/digiy-trust-resto.js` : rendu en lecture seule, état vide par défaut, deux moyennes indépendantes si et seulement si un agrégat public **déjà vérifié côté serveur** est injecté volontairement.

**Aucune donnée réelle ou fictive dans le rendu** : état « Pas encore d'évaluation vérifiée. » Aucun chiffre de notation, aucune donnée client, aucun commentaire ni formulaire de contribution n'est affiché. Les données numériques dans les tests ne sont que des fixtures Node isolées.

## Conditions d'activation des vraies notes

1. Prestations **réellement effectuées**. Une réservation `confirmed`, le passage de 15 minutes de grâce, un no-show, une commande simulée ou un paiement annoncé ne suffisent pas.
2. Identité client vérifiée indépendamment de celle du professionnel. Pas d'auto-évaluation du restaurant ni d'échantillonnage des seuls clients satisfaits.
3. Attestation serveur par module, jeton d'invitation haché et à usage unique, écriture atomique protégée par RLS, unicité par événement consommé.
4. Agrégation publique **uniquement à partir d'avis éligibles vérifiés**, avec compteurs, axes métier, sans noms ni téléphones et sans commentaire.
5. Note générale affichée sur la fiche et **rapport qualité-prix séparé, exclu de la moyenne générale** ; critère sans avis = absent, jamais zéro.
6. Le module RESTO garde ses **tables, capacités, services, zones, rotations, no-show et commande à emporter spécialisée**. Aucun appel RESTO de réservation ne dépend de DIGIY TRUST.
7. Vérifier sur mobile, puis sur une fiche de restaurant vraiment autorisée. Ne pas publier de données structurées `aggregateRating` tant que les agrégats vérifiés et leur provenance ne sont pas prouvés.
8. Les programmes de tests existants RESTO doivent rester verts.

## Limite explicite du composant

`DIGIYTrustResto.render(element,aggregate)` est une **présentation visuelle**, pas une attestation : même la chaîne `verified_public_aggregate` ne prouve rien si le navigateur peut créer l'objet. Le raccordement ne pourra être autorisé qu'après une RPC de lecture publique contrôlée, qui filtre la provenance serveur et les droits, et des tests de non-contournement. Par défaut, seul `render(element,null)` est appelé et aucun appel réseau TRUST n'a lieu.

**NO GO :** aucune RPC d'évaluation, aucune table, grant, trigger ou agrégat en production n'est installé par cette livraison. DIGIY CORE, RESTO SQL, LOC et MULTI RÉSA ne sont pas modifiés.

## Alignement avec MULTI RÉSA

Le contrat existe déjà dans `BEAUVILLE/digiy-resa-table-resto`, PR #24, et dans `BEAUVILLE/digiy-master-modeles`, PR #18. **Ne pas créer un deuxième système de notation** pour RESTO : le futur agrégateur de DIGIY TRUST est partagé dans la doctrine, et chaque moteur métier fournit sa preuve indépendante.

**Relation directe, paiement direct, 0 % commission.**
