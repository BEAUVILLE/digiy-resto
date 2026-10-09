# RESTO V35B — Préflight Auth / Photos / Publication (sans SQL)

**09 octobre 2026 — catalogue DIGIY CORE lu en SELECT uniquement, aucun client ni secret inspecté.**

## V35A : ce qui existe déjà

- Contrat du menu **sept jours lundi→dimanche**, services facultatifs MIDI/SOIR, dates au fuseau du restaurant.
- `prototypes/resto-v35-ma-semaine.html` : **maquette interactive locale** avec sélection de la semaine, sept jours, plusieurs plats, titre/description, prix EUR/XOF, photo depuis l'appareil (prévisualisation par Object URL), suppression de plat, aperçu client et bouton **PUBLIER désactivé**. Tout disparaît quand on ferme la page : **aucune persistance**.
- `src/resto-v35-weekly-core.js` : calcul des semaines et choix des seuls jours d'un menu publié, sans SQL ni réseau.
- CI : 16 tests (9 cœur semaine + 7 maquette), données entièrement fictives.

## Données réelles constatées en lecture seule

- Table `public.digiy_resa_resto_sites` : `id uuid`, `slug text`, `display_name text`, `owner_id uuid nullable`, `timezone text`, `is_active boolean`, `contact_phone`/`contact_email` et autres réglages RÉSA. Politique actuelle `resa resto sites owner` : **TO authenticated FOR ALL**, `USING (owner_id=auth.uid())`, `WITH CHECK (owner_id=auth.uid())`.
- Au contrôle, les deux slugs exacts `entre2-sarlat` et `le-malraux-sarlat` sont configurés avec `timezone=Europe/Paris`, **sans `owner_id` rattaché**, `is_active=false`. Cela **ne prouve rien** sur l'ouverture des restaurants ; c'est uniquement la configuration du sous-module réservation.
- Le schéma public n'a **pas de table dédiée aux cartes hebdomadaires RESTO** identifiée par la recherche des noms *resto/menu/plat*.
- Le catalogue Storage ne présente **aucun bucket de photos spécifique au menu RESTO** ; les buckets existants d'adhésion, paiement et annonces ont une autre finalité. **Ne pas y mélanger des photos restaurant** par commodité.
- Aucune mutation, aucun login réel, aucun rattachement automatique et aucun test de réservation effectués pendant le préflight.

## Blocages avant « MON MENU » réellement sauvegardé

1. **Propriétaire réel** : demander au restaurant de confirmer son identité et son email autorisé ; rattacher sa session `auth.uid()` à **son propre site**, avec test propriétaire A/B. Pas de fallback `test-resa-resto-saly` et ne jamais lier L'Entre 2 au compte du Malraux.
2. **Persistance indépendante** : modéliser `weekly_menus` et les items ou snapshots versionnés, dans une transaction atomique de publication. Le draft propriétaire et sa version publiée sont isolés ; un brouillon n'apparaît jamais à un visiteur.
3. **RLS / RPC ciblées** : lecture publique **des seuls snapshots publiés**, mise à jour autorisée exclusivement au propriétaire du `site_id`, protection contre écriture d'une semaine d'autrui et validation de prix/devise/date. Interdire tout accès anonyme à la modification. Les droits de la table historique de réservations ne changent pas.
4. **Photos** : nouveau bucket ou partition strictement dédiée RESTO, MIME image validé en serveur et quotas, chemin préfixé par site avec contrôle effectif du JWT, retrait des métadonnées indésirables, transcodage WebP/AVIF pour la vue publique ; fichiers brouillons privés ou non accessibles publiquement. Nettoyage seulement des fichiers orphelins, pas d'image utilisée par une ancienne version publiée.
5. **Maquette → vraie gestion** : ouvrir « Ma semaine » seulement après vérification de la session, sauvegarder draft, recharger, prévisualiser, publier / suspendre par décision explicite, proposer copie de la semaine uniquement en brouillon. Vérifier deux propriétaires différents et deux navigateurs.
6. **Fiche publique** : afficher automatiquement « Aujourd'hui » puis « Cette semaine », sans forcer l'activation à emporter. Photo et prix public ne valent **pas** commande ni disponibilité en temps réel. Un jour vide garde bouton **APPELER**.
7. **Séquence LOC** : sauvegarde chiffrée fraîche → restauration isolée prouvée → audit des droits exacts → CI / tests concurrents et A/B → revue propriétaire terrain → préflight production → GO SQL séparé → postcheck → smoke authentifié.

## Séparation des domaines

- RÉSA RESTO **tables** : capacités, créneaux, rotation, no-show, réservations, sans changement.
- RESTO **carte hebdomadaire** : photos et annonce des plats.
- RESTO **à emporter V34** : opt-in distinct, menu de retrait et contacts/horaires validés, client formule une demande directement sans paiement DIGIY.
- Aucun rattachement du vieux module de **caisse**.

## Décision de livraison

**V35A peut être relu et testé en maquette. V35B reste NO-GO SQL ; V35C reste NO-GO public.** Éviter de confondre un bouton « publier » avec une permission de mettre en ligne. Attendre les vrais propriétaires et l'ensemble des protections avant l'activation.
