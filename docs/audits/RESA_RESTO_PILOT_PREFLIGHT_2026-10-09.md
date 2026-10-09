# DIGIY RESTO / RÉSA MULTI — pilote de sécurisation après LOC V30
**9 octobre 2026, revue en lecture seule des sources GitHub main et du catalogue Supabase `digiy-core`.**

## Deux moteurs, contrats différents

- **RÉSA RESTO TABLES** : `BEAUVILLE/digiy-resto/resa-resto/index.html`, formulaire public proposant des créneaux et appelant `digiy_resa_resto_public_book_v1` ; confirmation immédiate suivant allocation et capacité côté RPC. Le propriétaire passe par `resa-resto/gestion.html` et `reglages.html`.
- **RÉSA MULTI** : `BEAUVILLE/digiy-resa-table-resto` (README du 29 août) ; restaurant / chauffeur / beauté / rendez-vous ; **demande préparée ≠ réservation confirmée**, professionnel confirme lui-même. `MASTER-MAITRE-RESA-V1/gestion.html` utilise `digiy_resa_profiles`, `digiy_resa_slots`, `digiy_resa_bookings`.
- Ces deux contrats ne doivent **pas** partager aveuglément le SQL de LOC ni un parcours de confirmation. Paiement/contact direct au professionnel, **0 % de commission** ; aucun paiement capté par DIGIY.

## Inventaire catalogue DIGIY CORE — sans divulguer de données clients

Tables RESTO : `digiy_resa_resto_sites`, `_zones`, `_tables`, `_service_windows`, `_bookings`, `_booking_tables`. RÉSA MULTI : `digiy_resa_profiles`, `_slots`, `_bookings`. Toutes les **neuf tables ont RLS activé** selon le catalogue. Cela **ne prouve pas** la correction de leurs règles d'accès.
Le catalogue liste **4 lignes de sites RESTO**, **7 zones**, **10 tables physiques** et **8 fenêtres de service** ; leur statut actif/public et les identités des adhérents n'ont pas été audités, et aucun contenu personnel n'a été lu ou publié. Aucun décompte de réservations RESTO n'est attesté.

## Chemins d'écriture confirmés dans le code de production

| Client | Écriture / mutation | Risque de rupture si REVOKE global |
| --- | --- | --- |
| `resa-resto/index.html` | RPC publique `digiy_resa_resto_public_book_v1` | Préserver la réservation et la détection de capacité/rotation |
| `resa-resto/gestion.html` | Tables `digiy_resa_resto_service_windows` UPDATE, `_zones` INSERT/UPDATE/DELETE, `_tables` INSERT/DELETE | **Élevé** : des révocations brutales casseraient le backoffice propriétaire |
| `resa-resto/gestion.html` | RPC `digiy_resa_resto_owner_set_booking_status_v1` | Authentification, propriétaire du site, états et journal d'audit à valider |
| `resa-resto/reglages.html` | UPDATE direct de `digiy_resa_resto_sites` | Ne pas supprimer ses droits sans RPC de remplacement |
| `resa-resto/gestion.html` | RPC `digiy_resa_resto_owner_refresh_no_shows_v1` **lancée automatiquement dans `loadAll()`** | **Attention : ouvrir cette page peut modifier l'état des réservations. Ce n'est pas un test de lecture seule.** |

## Sécurité — observations, pas déclarations de vulnérabilité

Le linter Supabase remonte des avertissements `SECURITY DEFINER` accordés au rôle `anon` pour plusieurs fonctions, y compris :
- `digiy_resa_resto_claim_site_by_email_v1`
- `digiy_resa_resto_owner_set_booking_status_v1`
- `digiy_resa_resto_owner_refresh_no_shows_v1`
- `digiy_resa_resto_public_book_v1` et les RPC de consultation publique

**Ces permissions seules ne prouvent pas une élévation de privilèges.** Il faut lire les corps exacts de fonctions, la vérification `auth.uid()`, la propriété du site, les contraintes RLS, l'absence d'accès croisé, les `search_path` et les dépendances avant tout `REVOKE`. Les RPC vraiment publiques doivent rester accessibles au bon rôle.
Référence : [linter 0028](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable).

## Première correction isolée (PR publique sans SQL)

La branche `security/resa-resto-public-render-guard-20261009` évite toute interprétation HTML des zones renvoyées par le serveur, noms de tables et règle de rotation affichés après réservation. Le délai de no-show injecté dans la règle statique est limité à un nombre sûr. Les **8 tests Node** injectent des contenus HTML agressifs simulés, comparent les résultats, et n'appellent jamais Supabase. Les noms RPC publics sont conservés. Un test CI vert n'est pas une preuve de sécurité du serveur.

## Suite ordonnée, sans précipitation

1. **Code public sécurisé et testé**, vérification GitHub Pages / rendu propriétaire sur version publiée.
2. **Audit ciblé READ-ONLY du SQL** des trois RPC propriétaires exécutables par `anon`, des privilèges table et de leurs usages. Tester séparément un utilisateur anonyme, un véritable propriétaire et un autre propriétaire uniquement dans un bac à sable autorisé, sans réservation client réelle.
3. **Analyse métier RESTO** : allocation atomique des tables, cumul des capacités par créneau, collisions concurrentes, rotation, no-show, fermeture, modifications manuelles et annulation. Vérifier que le comportement « confirmation immédiate » est bien voulu pour ce sous-module, distinct de RÉSA MULTI.
4. Préparer seulement ensuite des correctifs SQL/Edge ciblés et des tests avant/après à double propriétaire, en gardant tous les anciens identifiants/capacités. Vérifier la sauvegarde/restauration fraîche au GO SQL.
5. Pilote RESTO validé, puis adaptation **séparée** au contrat des demandes RÉSA MULTI, BEAUTY et autres métiers.

**Statut : audit initial terminé, correction de rendu en PR, SQL intact. Pas d'autorisation pour migration de production RESTO à ce stade.**
