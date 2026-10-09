# DIGIY RESTO V34 — première carte à emporter : validation propriétaire

**Document de préparation, jamais un formulaire de paiement ni une caisse.** Aucune commande n'est activée par ce document.

## Message simple à transmettre au premier restaurateur volontaire

> Bonjour,
>
> Nous préparons un service facultatif **DIGIY RESTO — À EMPORTER**, sans commission et sans caisse. Vos clients pourront choisir des plats, proposer une heure de retrait et vous envoyer **directement une demande** via votre contact professionnel. **Vous décidez toujours si vous confirmez la commande**, et le règlement se fait directement auprès de votre établissement.
>
> Pour préparer votre première carte, merci de nous transmettre :
> 
> 1. Le nom exact de votre restaurant et votre autorisation d'afficher sa carte.
> 2. Les plats réellement disponibles à emporter, avec prix, devise et options éventuelles.
> 3. Les jours/heures **spécifiques de retrait à emporter** (ils n'ont pas à suivre les réservations de tables), ainsi que le délai minimum de préparation.
> 4. Le numéro professionnel WhatsApp auquel vous acceptez de recevoir les demandes, ou le téléphone d'appel.
> 5. Votre choix : **activer / ne pas activer** les demandes à emporter.
>
> Avant publication, nous vous présenterons la carte telle que le client la verra, pour votre accord. Vous pourrez désactiver cette option. Il n'y a ni encaissement DIGIYLYFE, ni gestion de stock, ni logiciel de caisse.

## Contrôles internes DIGIYLYFE avant toute activation

- Vérifier que le restaurant et son slug correspondent bien à la bonne fiche DIGIY RESTO, avec accord de son propriétaire (accès par parcours propriétaire existant).
- Ne recopier aucune carte sans autorisation explicite du restaurant. Confirmer noms, prix, devise et disponibilité.
- Vérifier le téléphone professionnel (format international, usage WhatsApp accepté si choisi). La présence d'un numéro sur une ancienne fiche **n'est pas en soi un consentement** pour recevoir les commandes.
- Vérifier la plage de retrait et la fermeture souhaitées par le restaurateur, sans étendre les horaires des tables ; exclure les créneaux traversant minuit du MVP.
- Confirmer son délai minimum de préparation. Ne jamais promettre une heure de retrait sans accord explicite.
- Accusé de réception **uniquement humain** sur WhatsApp/téléphone ; le texte sur DIGIY est toujours « Demande à confirmer ».
- Vérifier en navigateur et sur téléphone : démarrage désactivé, carte exacte, quantités, total indicatif, créneaux et message au bon professionnel.
- Réviser par PR les données du seul restaurant concerné dans `resa-resto/takeaway-catalog.js`. Sans ses données vérifiées, conserver `{ }`.
- Obtenir un GO de publication distinct, puis activer uniquement l'établissement opt-in. Ne pas faire de modification SQL, ni de migration Supabase, ni de liaison au logiciel de caisse.

## Données à noter dans le dossier partenaire (ne pas stocker d'informations client)

| Champ | Informations requises |
|---|---|
| Restaurant | Nom, slug DIGIY RESTO confirmé |
| Autorisation d'afficher la carte | Oui / Non + date et responsable de la validation |
| Carte à emporter | Liste réelle des plats et prix validés |
| Devise | XOF ou EUR |
| Disponibilité déclarée | Par plat : oui / non |
| Plages de retrait | Jours et début / dernière heure, propres à l'emporter |
| Temps de préparation | Nombre de minutes avant retrait |
| Fuseau horaire | Africa/Dakar, Europe/Paris ou autre fuseau réel |
| Contact de réception des demandes | WhatsApp professionnel validé ou téléphone |
| Consentement d'activation | Oui / Non + date |
| Test téléphone et confirmation propriétaire | Date / résultat |
| GO publication DIGIY | Distinct, daté, après validation |

**Aucun menu de démonstration ne doit apparaître sur une fiche cliente.** Les seuls menus fictifs sont injectés au moment des tests automatisés et ne figurent pas dans le catalogue public.

## Découpage après le premier pilote

1. **Premier restaurant pilote** : accord, carte réelle, horaires et contact validés.
2. **Publication ciblée** : activer uniquement ce restaurant sur sa page à emporter, après revue.
3. **Retour terrain** : vérifier qu'un client prépare une demande, l'envoie lui-même et que le restaurateur reçoit et confirme ; aucune écriture dans `digiy_resa_resto_bookings`.
4. **Généralisation légère** : reproduire la même méthode, sans caisse, sans commission et sans dépendance supplémentaire.


## Préflight hors ligne — zéro publication

Le script `scripts/resto-v34-pilot-preflight.cjs` permet à l'opérateur de vérifier un brouillon **après réception de la vraie carte et des autorisations**. Il ne contacte ni GitHub, ni Supabase, ni WhatsApp ; il n'écrit aucun fichier et n'active aucune commande.

Le restaurateur doit approuver séparément **la carte, son numéro de réception, les horaires de retrait et l'option à emporter**. Une attestation opérateur est un rappel de vérification humaine, **pas une signature numérique**. La preuve d'accord reste en archive privée et **ne doit pas être commise dans un dépôt GitHub public**, pas davantage que les échanges personnels. Un identifiant interne suffit pour la référence.

En local, sur une machine autorisée et dans la racine du dépôt :

```bash
node scripts/resto-v34-pilot-preflight.cjs \
  --draft /chemin/prive/carte-restaurant.json \
  --attestation /chemin/prive/validation-proprietaire.json \
  --site SLUG_REEL_DU_RESTAURANT
```

La carte proposée doit respecter le schéma de `docs/RESTO_V34_A_EMPORTER_CONTRAT.md`, avec `enabled=true` et `ownerApproved=true` **uniquement après accord réel**. L'attestation privée doit comprendre les champs `restaurantSlug`, `ownerApprovedMenu`, `ownerApprovedContact`, `ownerApprovedPickupHours`, `ownerOptInTakeaway` (tous vrais), `verifiedOn` (date ISO), `evidenceReference` (identifiant interne), `operatorReview` (identifiant du vérificateur) et **`publicationAuthorized=false`**.

**Résultat attendu** : `VALID_FOR_MANUAL_REVIEW_ONLY`, et non un GO de publication. Le script refuse les slugs incompatibles, les contacts incorrects, menus invalides, approbations manquantes, créneaux inutilisables et toute prétention à une autorisation de publication.

**Dernières étapes humaines indispensables** : revue des vrais menus/prix/numéros avec le restaurateur, essai sur son téléphone, nouvelle revue GitHub et GO publication explicite. Le registre public `resa-resto/takeaway-catalog.js` reste **vide et désactivé** jusque-là. Les tests de préflight créent seulement des fixtures fictives temporaires qui ne sont jamais publiées.
