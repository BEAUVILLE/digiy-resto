# RESTO V34 — À EMPORTER / commande directe (contrat validé)

Décision produit : 9 octobre 2026. Suivi : [issue #23](https://github.com/BEAUVILLE/digiy-resto/issues/23).

## Positionnement

**DIGIY RESTO facilite la commande à récupérer, sans être une caisse.** Le restaurateur conserve la relation, décide du menu, accepte ou refuse une demande et reçoit le règlement directement. DIGIYLYFE ne prélève **0 % de commission**.

Trois chemins indépendants :
1. Vitrine RESTO : découverte, coordonnées, photos, présentation.
2. RÉSA RESTO : réservation confirmée d'une table, avec disponibilité, capacité, rotation et no-show.
3. À EMPORTER : **demande de plats** et retrait proposé. **Jamais une réservation de table, jamais une confirmation automatique, jamais une vente encaissée par DIGIYLYFE.**

## MVP retenu — zéro caisse, zéro backend supplémentaire

- Le restaurant choisit librement d'activer ou de désactiver l'emporter ; son menu **réel et expressément approuvé** est la seule source autorisée.
- Afficher des articles publiés (nom, prix dans la devise du restaurant, disponibilité déclarée), quantités et **total indicatif**.
- Afficher des plages de retrait **propres à l'emporter**, sans modifier les fenêtres du restaurant pour les tables et sans prolonger la fermeture.
- Préparer un message contenant les articles, quantités, total indicatif, jour et heure de retrait souhaités. Le visiteur l'envoie lui-même au **canal professionnel validé** (WhatsApp du restaurateur, ou appel comme alternative).
- Un message préparé ou envoyé reste une **DEMANDE**. C'est le restaurateur qui confirme explicitement la disponibilité, l'heure et le prix définitif par contact direct.
- Pas d'obligation pour le restaurant de saisir un stock ou de gérer des tickets.
- Aucune sauvegarde de données d'acheteur dans DIGIY, aucune transaction, aucun terminal ni frais de plateforme pour ce parcours initial.

## Contenu et validation

Une structure de menu doit être rattachée à un slug de restaurant existant et contrôlé. Les menus, contacts, horaires et prix ne sont jamais déduits d'anciennes fiches, générés artificiellement ou présumés ; **aucun menu réel n'est actuellement validé par cette PR**.

Les tests utilisent exclusivement des données fictives. Un restaurant sans menu publié ou sans contact direct vérifié affiche simplement « Commande à emporter non disponible » + accès aux coordonnées déjà publiées. La commande ne doit pas être activée.

### Contrat minimal de données (intentionnellement petit)

- `restaurantSlug`, `restaurantName`, `currency` (ISO 4217), `timezone` (IANA)
- `enabled` (désactivé par défaut)
- `whatsapp` (optionnel, téléphone professionnel E.164 vérifié)
- `phone` (optionnel, téléphone professionnel E.164 vérifié)
- `preparationMinutes` (entier supérieur ou égal à zéro)
- `pickupWindows` : jours ISO 1 à 7, `from` et `to` « HH:MM » **sans dépassement de minuit** en MVP
- `items` : identifiant, libellé, `priceMinor` (entier dans la plus petite unité de la devise), `available` (déclaré par le restaurant)

Utiliser le taux de décimales de la devise (XOF : 0 ; EUR : 2) pour l'affichage. La somme est **un total indicatif non encaissé**.

## Sécurité et confort

- **Pas de commande automatique.** Un clic explicite déclenche l'ouverture du WhatsApp externe : le visiteur décide de l'envoi ; ne jamais simuler une commande « enregistrée » dans DIGIY.
- N'accepter que des numéros professionnels vérifiés, un schéma d'URL HTTPS et du texte encodé pour les liens WhatsApp ; **aucune URL javascript:** ni code HTML provenant des plats.
- Les messages ne comportent aucun jeton d'authentification, numéro de carte, donnée bancaire ou donnée personnelle ajoutée implicitement. Les détails supplémentaires sont convenus entre le client et le restaurant.
- Les heures de retrait doivent être vérifiées selon le fuseau du restaurant, son délai de préparation et ses plages dédiées avant l'affichage du bouton ; la **confirmation humaine** reste obligatoire même si l'interface indique un créneau.
- Si les horaires ne peuvent être validés sans ambiguïté (dont passage heure d'été/hiver), ne pas proposer de validation implicite : demander confirmation directe.
- Format accessible, mobile d'abord, FR/EN, sans dépendances externes lourdes.
- Ne pas toucher aux réservations `digiy_resa_resto_public_book_v1`, aux tables `digiy_resa_resto_bookings`, ni aux politiques RLS du moteur de réservation.
- Aucun affichage de fausses commandes ou de vrais plats sans accord du professionnel.

## Exigences avant publication

1. Obtenir l'accord d'un premier restaurateur, sa **carte réelle**, ses coordonnées, sa devise, son canal de réception et ses plages de retrait.
2. UI client sur une page séparée avec option activée uniquement si les données sont valides ; possibilité de refuser ou désactiver immédiatement.
3. Tests de liens directs, sommes XOF/EUR, quantités invalides, plats indisponibles, menu absent, horaires fermés, délai insuffisant et sécurité des libellés.
4. Tester qu'aucun appel à la RPC de réservation table n'a lieu, et qu'aucun nouveau backend ni outil de caisse n'a été introduit.
5. Faire une revue sur téléphone et obtenir le GO de publication **distinct**.

La présente PR de contrat est **préparatoire et en brouillon** : elle n'active aucune commande, ne change pas la vitrine publique et ne modifie jamais la production.

Chantiers parallèles, indépendants : V31 propriétaires, V32 dates passées, V33 créneaux tardifs.

## Implémentation préparatoire sur la branche V34 (9 octobre 2026)

- `resa-resto/a-emporter.html` : interface mobile FR/EN séparée, sans lien ajouté à l'accueil RESTO. Elle montre **« Commande à emporter non disponible »** pour tout site tant que la carte n'est pas validée.
- `resa-resto/takeaway-catalog.js` : registre **entièrement vide**. Aucune carte, aucun plat, aucun prix ou numéro de commande réel ajouté ou simulé.
- `resa-resto/takeaway-core.js` : modèle pur, contraintes d'activation par établissement, contrôle des numéros professionnels, prix XOF/EUR, quantités, créneaux de retrait et délais de préparation, comparaison des horaires locaux (dont prudence sur les transitions DST).
- `resa-resto/takeaway-page.js` : affichage texte sécurisé des menus opt-in, quantités, date et retrait, total indicatif, composition du message WhatsApp vers le **seul canal validé**, alternative « copier la demande / appeler ». WhatsApp n'envoie rien avant action explicite du client et confirmation du restaurateur.
- `tests/resto-v34-takeaway.test.cjs` : jeux de données **exclusivement fictifs**; vérifient entre autres menu absent, propriétaire non consentant, horaires, devises, liens de contact, refus des quantités invalides, séparation du moteur de tables et absence de code de caisse.
- `.github/workflows/resto-v34-takeaway.yml` : tests Node 22, sans secret Supabase ni déploiement. [Dernière exécution validée](https://github.com/BEAUVILLE/digiy-resto/actions/runs/37950496742) : **PASS** après correction d'un faux positif de test.

**À ne pas confondre avec une mise en service :** aucun menu réel approuvé, aucun bouton public vers cette page, aucune base ou RPC RESTO modifiée ; la PR reste **en brouillon**. Pour activer un premier restaurateur, il faut sa validation explicite de menu, contacts et plages de retrait, une revue du contenu, des essais mobiles de bout en bout et un GO publication séparé.
