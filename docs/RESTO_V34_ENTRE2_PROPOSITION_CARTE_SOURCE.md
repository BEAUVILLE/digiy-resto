# RESTO V34 — L'Entre 2 : présélection depuis la carte publiée (NON APPROUVÉE)

**Statut : DOCUMENT DE RELECTURE / PROPOSITION — NE PAS ACTIVER NI PUBLIER COMME CARTE À EMPORTER.**

Date du relevé web : **9 octobre 2026**. Source consultée :
- https://restaurant-entre2malraux.fr/ — rubrique **« L'Entre 2 / La Carte / Nos Pizzas »**
- Source distincte de toute autorisation du restaurateur.

Site associé dans DIGIY CORE : `entre2-sarlat`, fuseau `Europe/Paris` ; la configuration de réservation de tables est `is_active=false`. Cela ne dit **rien** sur l'ouverture au public et **ne doit pas** être modifié pour les demandes à emporter.

## Carte publiquement affichée — produits candidats à confirmer

Ce tableau reprend exclusivement les **noms et prix affichés sur le site cité**. Il ne garantit **ni** l'exactitude actuelle au moment d'une commande, **ni** la disponibilité à emporter, **ni** le consentement à intégrer ces produits dans DIGIYLYFE.

| Groupe | Article affiché | Prix affiché TTC |
| --- | --- | ---: |
| Pizzas | Margarita | 9,90 € |
| Pizzas | Royale | 12,50 € |
| Pizzas | Végétarienne | 14,90 € |
| Pizzas | Quatre Fromages | 15,50 € |
| Pizzas · spécialités | Périgourdine | 16,50 € |
| Pizzas · spécialités | Sarladaise | 19,00 € |
| Pizzas · spécialités | La Truffe | 19,50 € |

**Aucune de ces lignes ne doit être inscrite dans `resa-resto/takeaway-catalog.js` sans validation explicite.** Le menu public de L'Entre 2 est un **menu de restaurant**, pas un accord de commercialiser chaque plat en retrait.

### Points manquants et bloquants

- [ ] Confirmer auprès du restaurateur que ces sept articles sont (ou ne sont pas) proposés en retrait.
- [ ] Confirmer le prix **spécifiquement applicable à l'emporter** et la devise EUR pour chaque article.
- [ ] Obtenir les jours et fenêtres horaires **spécifiques à l'emporter** et le délai de préparation, sans déduire des horaires généraux de salle et sans prolonger la fermeture.
- [ ] Obtenir un contact professionnel pour recevoir les demandes et son consentement explicite à cet usage ; un numéro affiché pour la réservation de table n'est pas une autorisation implicite pour les commandes.
- [ ] Confirmer l'accord de publier la carte sur DIGIYLYFE et le nom du responsable autorisant cette publication (conserver preuves et échanges en privé).
- [ ] Faire relire la prévisualisation au restaurant, valider sur téléphone, obtenir un GO de publication distinct.

### Proposition de message de prise de contact — À NE PAS ENVOYER AUTOMATIQUEMENT

> Bonjour, nous préparons un service facultatif DIGIY RESTO permettant à vos clients de demander des plats à emporter, puis de convenir directement avec vous du retrait et du règlement, sans caisse supplémentaire et sans commission.
>
> Nous avons relevé sur votre carte en ligne une sélection de pizzas. Souhaitez-vous en proposer certaines à emporter ? Si oui, pourriez-vous nous confirmer les plats, les prix de retrait, les jours/heures, le délai de préparation et le numéro professionnel que vous autorisez pour recevoir les demandes ?
>
> Rien ne sera activé ni publié sans votre relecture et votre accord. Vous resterez libre d'accepter ou de refuser chaque demande.

### Décision technique

**Aucun acte sur `digiy_resa_resto_sites`, aucune mise en service et aucune commande fictive.** Garder le fichier `resa-resto/takeaway-catalog.js` **vide** sur cette PR.

Après obtention de l'accord, une carte JSON pourra être construite dans un fichier privé de l'opérateur, relue à l'aide de `scripts/resto-v34-pilot-review.cjs`, puis contrôlée avec `scripts/resto-v34-pilot-preflight.cjs` et mise en revue dans une PR séparée avant publication.

**Source, prix et disponibilité à emporter ne sont pas interchangeables.**
