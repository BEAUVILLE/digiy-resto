# RESTO V34 — dossier de préparation terrain : L'Entre 2 (Sarlat)

**État : CANDIDAT À VALIDER — NON ACTIF.** Date du relevé : 9 octobre 2026.

Le premier restaurant **candidat pour la relecture** du parcours « À emporter » est **L'Entre 2**, à Sarlat-la-Canéda. Ce choix est un ordre de préparation technique, **pas un accord de l'établissement**, ni un ordre d'activer son RÉSA RESTO.

## État observé (lecture seule dans DIGIY CORE)

| Élément | L'Entre 2 | Le Malraux (candidat ultérieur) |
|---|---|---|
| Restaurant | L'Entre 2 · Sarlat | Le Malraux · Sarlat |
| Slug `digiy_resa_resto_sites` | `entre2-sarlat` | `le-malraux-sarlat` |
| Fuseau déclaré | `Europe/Paris` | `Europe/Paris` |
| `is_active` pour la configuration RÉSA RESTO | `false` | `false` |

L'état de configuration **RÉSA RESTO** ne prouve ni l'ouverture/fermeture des restaurants ni l'état des fiches publiques. Le modèle de test `modele-resa-resto-sarlat` est actif, mais **NE DOIT PAS être substitué au slug réel** du restaurant.

Les informations ci-dessus proviennent uniquement des quatre colonnes de configuration métier `slug`, `display_name`, `timezone`, `is_active`; aucune commande client, coordonnées privées, preuve d'identité ou paiement n'a été consulté.

## Présélection en attente de l'accord du restaurateur

Une présélection de **sept pizzas et leurs prix publiquement affichés** a été documentée à partir du site `restaurant-entre2malraux.fr` dans `docs/RESTO_V34_ENTRE2_PROPOSITION_CARTE_SOURCE.md` (relevé le 9 octobre 2026).

**Cette présélection ne constitue pas une carte à emporter validée.** Aucun produit, prix, contact ni horaire n'a été ajouté au catalogue public. Le restaurant doit décider si, à quelles conditions et à quel prix les plats peuvent être proposés en retrait.

## Éléments à obtenir pour ouvrir une commande à emporter

**Tous restent à obtenir ou confirmer par le propriétaire. Rien n'est approuvé par ce dossier.**

1. Accord explicite du professionnel pour proposer un **service de demandes à emporter**, indépendant de la réservation de table.
2. Sa **carte réelle de vente à emporter**, chaque nom de plat, son prix, la devise EUR et la disponibilité déclarée. Aucun prix ni plat n'est repris automatiquement de la vitrine.
3. Les jours/heures **précis de retrait** ; délai minimal de préparation. Ils ne prolongent pas les horaires des réservations de tables.
4. Le numéro professionnel **spécifiquement approuvé pour recevoir ces demandes** par WhatsApp, ou le téléphone pour un appel direct.
5. Confirmation par le propriétaire de la carte finale (relecture sur téléphone) et GO de publication **distinct**.

**Important :** Les numéros de téléphone déjà affichés sur une fiche ne constituent pas à eux seuls une autorisation de recevoir des demandes à emporter. Les conserver hors de ce dossier jusqu'à validation.

## Prévisualisation locale pour relecture, sans publication

La commande ci-dessous ne fonctionne **qu'après réception d'un brouillon de carte complète en JSON**. Conserver ce fichier et les preuves de consentement dans un espace privé, jamais dans GitHub.

```bash
node scripts/resto-v34-pilot-review.cjs \
  --draft /chemin/prive/entre2-carte-a-emporter.json \
  --site entre2-sarlat
```

Ouvrir sur **le même ordinateur** l'URL locale `http://127.0.0.1:<port>/` affichée par l'outil. La page sert à relire les noms, prix et plages proposées ; elle n'affiche aucun contact, ne produit aucun lien WhatsApp, n'enregistre aucune commande, ne transmet aucune donnée et n'appelle pas DIGIY CORE.

**Cette prévisualisation n'exige pas que le restaurateur ait déjà approuvé la carte** : les indicateurs techniques d'activation ne sont remplacés qu'en mémoire pour afficher une vue **passive**. Cela ne constitue jamais une autorisation de publication. Le script `resto-v34-pilot-preflight.cjs` est un contrôle distinct, à n'utiliser qu'après les validations humaines.

## Arrêt obligatoire

- Pas de menu réel approuvé ? **Aucune publication.**
- Pas de contact autorisé ? **Aucune transmission de demandes.**
- Une configuration RÉSA RESTO inactive ? **Ne pas modifier `is_active` pour lancer l'emporter.**
- Pas de test téléphone ni de GO publication ? **PR V34 en brouillon, catalogue vide.**
- Aucun encaissement DIGIYLYFE, caisse, POS, ticket, stock ou commission, maintenant ou plus tard dans ce MVP.

Candidat suivant : **Le Malraux** seulement après décision d'y adapter ce même parcours, jamais par duplication aveugle de menus ou contacts.
