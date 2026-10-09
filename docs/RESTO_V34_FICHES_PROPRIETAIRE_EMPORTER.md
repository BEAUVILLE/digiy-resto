# RESTO V34 — deux fiches distinctes, accès propriétaire et exemple pizzas

**État : PR #24 DRAFT. PAS DE MISE EN PRODUCTION.** 9 octobre 2026.

## Correction du parcours DIGIY RESTO

Auparavant :
- `fiche-lentre2.html` et `fiche-le-malraux.html` renvoyaient **toutes deux** vers `https://malraux-entre2.digiylyfe.com/`. La présence était partagée ; on ne retrouvait pas un accès propriétaire propre à chaque restaurant.
- `resa-resto/acces-proprietaire.html` n'admettait que les deux sites de test. Un `?site=entre2-sarlat` était redirigé par défaut vers le **test Saly**.

Désormais, dans la branche V34 :
- `fiche-lentre2.html` est une véritable fiche individuelle avec `🔐 Accès propriétaire` pointant vers `resa-resto/acces-proprietaire.html?site=entre2-sarlat`.
- `fiche-le-malraux.html` est une fiche distincte avec `?site=le-malraux-sarlat`.
- L'index DIGIY RESTO ouvre désormais **la bonne fiche** pour chacun ; les QR dans l'index correspondent aux URLs publiques des deux fiches `https://resto.digiylyfe.com/fiche-*.html`, après publication éventuelle.
- `resa-resto/acces-proprietaire.html` reconnaît les **deux slugs réels** en plus des deux slugs de test. Le slug invalide n'est jamais remplacé par celui d'un autre restaurant ; le bouton est désactivé.
- `resa-resto/gestion.html` ne présente plus L'Entre 2 ou Le Malraux comme un **environnement de test**. Toute consultation/gestion dépend toujours de l'authentification et de la politique RLS existantes.

## Blocage propriétaire à respecter avant d'annoncer l'accès opérationnel

Lecture **non mutante** de DIGIY CORE, sur les colonnes de configuration (sans consulter ni afficher d'email privé) :

| Slug | propriétaire rattaché | email de contact propriétaire configuré | configuration RESA RESTO active |
|---|---|---|---|
| `entre2-sarlat` | non | **non** | non |
| `le-malraux-sarlat` | non | oui | non |

Par conséquent, **l'accès réel de L'Entre 2 n'est PAS opérationnel** à ce stade ; son bouton d'authentification reste désactivé et un message informe que le rattachement doit être effectué par un opérateur autorisé, après accord du véritable restaurateur. **Ne jamais inventer un email ou un propriétaire, ni rattacher le compte d'un autre restaurant.**

Pour Le Malraux, la présence d'un email professionnel dans la configuration ne prouve pas que l'accès fonctionne : aucun propriétaire n'est encore rattaché ; un test réel de l'OTP et des droits RLS avec le bon propriétaire sera nécessaire avant validation.

Les configurations RÉSA RESTO sont inactives, **sans modifier** `is_active` ; cela ne préjuge pas de l'activité commerciale du restaurant. Les travaux V31 de sécurité des RPC restent indépendants et non fusionnés.

## L'Entre 2 — exemple d'emporter **intégré à la fiche**

Sur `fiche-lentre2.html`, lien interne « 🍕 Voir l'exemple à emporter » vers le bloc d'exemple sur **la même fiche**. Ce bloc offre :
- Les **sept pizzas** de la carte publique du restaurant et leurs prix affichés (Margarita, Royale, Végétarienne, Quatre Fromages, Périgourdine, Sarladaise, La Truffe).
- Des boutons + / − et un total indicatif EUR recalculé **en mémoire dans le navigateur**.
- Une mention forte « DÉMONSTRATION NON ACTIVE » ; aucun créneau de retrait inventé, aucun WhatsApp de commande, aucune transmission ni aucune vente.

Source de la carte **publiée**, pas des conditions d'emporter : `https://restaurant-entre2malraux.fr/`, consultée le 9 octobre 2026. Le propriétaire doit confirmer les articles éligibles au retrait, les prix de retrait et la disponibilité. La nouvelle page de prise de commandes `resa-resto/a-emporter.html` reste **fermée** : le catalogue `takeaway-catalog.js` est toujours vide.

**Le site commun `malraux-entre2.digiylyfe.com` et le site officiel externe `restaurant-entre2malraux.fr` ne sont pas modifiés par la présente PR.** L'accès et la simulation sont disponibles sur les **fiches DIGIY RESTO** de la branche V34 seulement après déploiement autorisé. Avant publication, leurs anciennes URLs de site commun ou QR déjà distribués peuvent encore ouvrir l'ancien site : ne pas déclarer le parcours opérationnel.

## Contrôle non-régression

`tests/resto-v34-fiches-browser.test.cjs` valide dans Chromium :
- les 2 fiches distinctes sans redirection,
- le bon slug sur chaque bouton propriétaire,
- la désactivation effective de l'OTP pour L'Entre 2 et pour les slugs inconnus,
- 7 pizzas, montants indicatifs et absence d'envoi de commandes pour la démo,
- absence de menu fictif pour Le Malraux,
- la séparation intacte du moteur de tables et du catalogue d'emporter (vide).

Avant tout GO de publication : vérifier visuellement téléphone FR, PDF ou capture du restaurant, email/identité propriétaire prouvés, puis validation expresse du partenaire pour recevoir des **commandes à emporter**. **La publication de l'exemple n'autorise aucune commande réelle.**
