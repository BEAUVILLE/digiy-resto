# DIGIY RESTO V31 — audit précis des RPC propriétaires (READ-ONLY)

**DIGIY CORE — 2026-10-09, lecture du catalogue, des fonctions et des politiques en production.** Ce dossier répond à [RESTO issue #18](https://github.com/BEAUVILLE/digiy-resto/issues/18). Il ne constitue **pas une migration** et n'a pas créé/modifié de réservation.

## État de référence constaté

La base réelle `wesqmwjjtsefyjnluosj` héberge **4 sites RESTO, 7 zones, 10 tables physiques et 0 réservation RESTO** au contrôle, sans identifiants client consultés. Ces nombres sont un instantané et peuvent évoluer.

Les six tables RESTO (`sites`, `zones`, `tables`, `service_windows`, `bookings`, `booking_tables`) ont RLS actif. Le catalogue `pg_policies` retourne **6 politiques**, toutes `TO authenticated`, chacune `FOR ALL` avec expressions `USING` et `WITH CHECK` rattachant l'objet à l'`owner_id = auth.uid()` du site. Ceci est un contrôle structurel, pas un smoke cross-owner sous vraie session.

Les rôles `anon` et `authenticated` n'ont **pas CREATE dans le schéma public** au contrôle.

## Les trois RPC propriétaires candidates à la correction des GRANT

| Signature publiée | Sécurité SQL | Permission anon | Garde réelle lue dans le corps |
| --- | --- | --- | --- |
| `digiy_resa_resto_claim_site_by_email_v1(p_slug text)` | `SECURITY DEFINER`, propriétaire `postgres`, `search_path=public` | **oui, explicite** | `auth.uid()` et email du JWT requis ; si `owner_id` existe et diffère, refus ; si site sans propriétaire, email JWT doit égaler `contact_email` |
| `digiy_resa_resto_owner_refresh_no_shows_v1(p_site_id uuid)` | identique | **oui, explicite ET héritée de PUBLIC** | contrôle du site via `site.owner_id = auth.uid()`, puis délégation à `release_no_shows_v1` |
| `digiy_resa_resto_owner_set_booking_status_v1(p_booking_id uuid,p_status text)` | identique | **oui, explicite ET héritée de PUBLIC** | liste de statuts autorisés, jointure booking→site et `site.owner_id=auth.uid()` avant UPDATE |

**Conclusion limitée :** la permission d'exécution anonyme est inutile au parcours propriétaire, mais **elle ne prouve pas un contournement d'identité**, car les fonctions effectuent des vérifications pertinentes. L'identification réelle des sessions et une tentative cross-owner en environnement isolé restent nécessaires pour conclure sur l'ensemble du modèle.

## Contrats métier qu'il faut absolument préserver

- `digiy_resa_resto_public_book_v1` doit rester exécutable par `anon` (réservation publique **confirmée immédiatement**) ; ses appels `public_availability_v1`, `public_settings_v1`, `public_zones_v1` sont également prévus pour la consultation sans connexion.
- Son code courant vérifie jour de fermeture, fenêtre de service, zone, capacité cumulée et disponibilité de table, et prend un **advisory lock transactionnel** sur site/date/service/zone avant allocation. **Ne pas copier le verrou de LOC** et ne pas le qualifier d'incorrect sans contre-test.
- La logique `release_no_shows_v1` modifie les réservations confirmées expirées. Elle est appelée pendant la réservation publique et par `owner_refresh_no_shows_v1`, qui est lui-même lancé automatiquement lorsque `resa-resto/gestion.html` charge les données. **Ouvrir l'interface propriétaire peut provoquer une mutation métier.** Ne pas utiliser ce parcours pour un « test en lecture seule ».
- La gestion des zones/tables/services et les réglages sites utilisent encore des **INSERT/UPDATE/DELETE directs avec RLS propriétaire** dans `resa-resto/gestion.html` et `reglages.html`. **Ne révoquer aucune permission de table** dans ce lot : cela briserait la gestion légitime.
- Le serveur de réservation ne semble pas rejeter explicitement une date/heure passée (le formulaire public impose la date côté navigateur) : examiner dans un test isolé la règle métier attendue, sans publier de test client réel.
- **RÉSA MULTI n'est pas RESTO :** la demande préparée attend confirmation du professionnel, alors que RESTO retourne un ticket confirmé. Garder deux contrats séparés.

## Lot V31 CANDIDATE : pas de production

Voir [supabase/candidates/RESA_RESTO_OWNER_RPC_V31_CANDIDATE.sql](../../supabase/candidates/RESA_RESTO_OWNER_RPC_V31_CANDIDATE.sql) :
- préflight bloquant : les trois signatures exactes, `SECURITY DEFINER`, `search_path=public`, et `authenticated EXECUTE` ;
- `REVOKE EXECUTE` sur **ces trois fonctions seulement** auprès de `PUBLIC` et `anon` ;
- `GRANT EXECUTE` explicite à `authenticated` et `service_role` ;
- postcheck sur les droits après transaction et **vérification du RPC `public_book_v1` conservé pour `anon`**.
- aucune modification de données client, de table, de RLS, de fonction, de caisse, de paiement, de notification, ni de LOC.

Tests [PostgreSQL 16 et 17](../../tests/resa-resto-v31) avec **rôles/fonctions intégralement fictifs** : GRANT anon retiré des fonctions propriétaire, accès authenticated conservé, réservation anonyme conservée, répétition idempotente et rejet d'un contrat SECURITY DEFINER altéré. Un test complémentaire (`assert-execute-roles.sh`) exécute réellement les RPC factices avec `SET ROLE anon`, `authenticated` et `service_role` : refus attendu pour les 3 RPC propriétaires en anonyme, succès pour les deux rôles autorisés, succès public pour la réservation. **Ce n'est pas un test d'autorisation entre deux propriétaires, car les corps des fonctions sont des doublures fictives**. Le succès de ces tests ne prouve pas que les vrais clients n'ont pas de liens anciens.

## Appelants identifiés dans les fichiers publiés sur `main` (contrôle statique)

- `resa-resto/acces-proprietaire.html` : connexion OTP, `shouldCreateUser:false`, puis redirection vers la gestion avec session ; aucun des trois appels RPC propriétaire sans session dans ce fichier.
- `resa-resto/gestion.html` : `getSession()` avant `enter()` ; `claim_site_by_email_v1` dans `enter`, `owner_refresh_no_shows_v1` **automatique** dans `loadAll`, `owner_set_booking_status_v1` lors du clic Enregistrer. Les écritures directes de tables restent nécessaires.
- `resa-resto/reglages.html` : `getSession()` ou OTP avant `enter()` ; `claim_site_by_email_v1` dans `enter` ; `UPDATE` direct du site sous RLS.
- `resa-resto/index.html` : réservation/consultation publique par RPC `public_book_v1`, `public_availability_v1`, `public_settings_v1`, `public_zones_v1` ; aucune dépendance directe aux trois RPC propriétaires.

**Limite de preuve :** cette lecture concerne les quatre fichiers de la branche `main`, pas l'intégralité des copies anciennes, sites déployés, caches, navigateurs encore ouverts ou autres dépôts. Une recherche de code indexée n'a retourné aucun résultat exploitable ; cela n'est **pas** une preuve d'absence d'appelants. Le GO SQL reste bloqué tant que la compatibilité terrain et les sessions réelles n'ont pas été contrôlées.

## GO/NO-GO avant une exécution sur DIGIY CORE

**NO-GO SQL actuellement.** Conditions cumulatives :
1. CI du candidat 16/17 verte.
2. Vérifier les liens réels vers `acces-proprietaire.html`, `gestion.html`, `reglages.html` et les anciennes copies éventuelles. Prouver qu'aucun propriétaire ne s'appuie sur une invocation non authentifiée de ces RPC.
3. Nouvelle sauvegarde chiffrée **restaurée réellement** dans PostgreSQL local, avec snapshot des réservations et des zones/tables, et congélation des modifications pendant le test final.
4. Tests propriétaires A/B authentifiés et anonymes **en bac à sable** ; conserver réservation publique, capacité concurrente, rotations, no-show et date validée. Ne pas appeler des RPC de création sur de vrais clients.
5. Préflight live juste avant migration, migration atomique ciblée, postcheck des permissions et du nombre de réservations, puis smoke réel après déploiement (lecture non destructive).

**LOT V31 = réduction de privilèges des RPC propriétaires ; V32 futur = traitement des écritures directes, moteur métier et capacités, après preuves.** Ne pas confondre.
