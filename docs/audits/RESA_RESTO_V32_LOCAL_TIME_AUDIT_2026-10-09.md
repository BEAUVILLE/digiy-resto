# RESTO V32 — protection serveur des dates/heures de réservation (CANDIDAT, SANS DÉPLOIEMENT)

Date : 9 octobre 2026. Projet lu en **lecture seule** : DIGIY CORE `wesqmwjjtsefyjnluosj`. Suivi : [issue #20](https://github.com/BEAUVILLE/digiy-resto/issues/20).

## Constat initial et preuve reproductible

Le snapshot `pg_get_functiondef` réel de `digiy_resa_resto_public_book_v1` ne vérifie pas si `p_booking_date + p_booking_time` est antérieur à l'heure du restaurant. Le formulaire HTML applique une date minimale côté navigateur, mais la RPC est publiquement exécutable avec des paramètres directs. Aucune réservation réelle n'a été appelée.

Les fixtures SQL de `tests/resa-resto-v32/` copient les quatre définitions publiées le 9 octobre depuis la PR V31, **sans données clients**. Le script `assert-before-v32.sql` vérifie dans une transaction annulée que l'ancien moteur confirme une réservation d'hier et montre des créneaux anciens comme disponibles. Les seules données utilisées sont entièrement inventées.

## Contrat V32 proposé

- Réservation publique `digiy_resa_resto_public_book_v1` : refuser une heure/date non strictement future comparée dans le **fuseau horaire du site**, pas celui du navigateur. Vérifier après chargement du site ET **une seconde fois après acquisition du verrou transactionnel** pour éviter la réservation devenue passée pendant l'attente.
- Disponibilité `digiy_resa_resto_public_availability_v1` : rendre les créneaux passés non réservables avec motif `créneau passé`. Conserver explicitement les créneaux futurs disponibles.
- Ne pas toucher aux signatures, droits `anon EXECUTE`, propriétaires, fonctions de rotation et de no-show, réservation immédiate, règles de capacité et comportement de RÉSA MULTI.
- Garder `pg_advisory_xact_lock` et la validation de capacité tels quels : V32 traite uniquement les dates/heures passées.

Le **SQL est uniquement un candidat** dans `supabase/candidates/RESA_RESTO_V32_LOCAL_TIME_CANDIDATE.sql` ; il n'est pas placé dans `supabase/migrations/` et n'est appelé par aucun workflow de production.

## Préflight et sécurité de déploiement

1. Le candidat exige la variable de session `digiy.v32_manual_go=YES` (sinon exception). Cela n'autorise **pas** à l'activer sans un GO SQL spécifique et la sauvegarde récente restaurée.
2. Vérifie les deux fonctions par signature complète et **MD5 du `pg_get_functiondef` live du 9 octobre** (publication de fonctions différente => échec bloquant), `SECURITY DEFINER` et droit `anon EXECUTE`.
3. `CREATE OR REPLACE FUNCTION` sous transaction, avec postcheck des permissions et présence de garde serveur. Aucun `GRANT`/`REVOKE`, aucune écriture sur les données clients.
4. Le préflight est volontairement **à usage unique** : après application, le hash diffère du snapshot initial. Ne jamais ré-exécuter aveuglément.
5. Préparer un rollback indépendant depuis les définitions originales et une restauration ciblée autorisée ; **ne pas** retirer les règles métier ou déclencher de `public_book_v1` en production pour tester.

## Contrôle isolé

GitHub Actions sur PostgreSQL 16 et 17, base `resto_v32_synthetic` sur `127.0.0.1` avec mot de passe fictif : refus explicite si URL différente. Aucun secret Supabase, aucun client réel et aucun réseau vers DIGIY CORE.

Parcours :
- Ancienne faille reproduite en transaction `ROLLBACK` ;
- SQL candidat **sans** GO rejeté ;
- SQL candidat autorisé seulement dans le test jetable ;
- Vérifications date passée, aujourd'hui à 00:00, demain à 18:00 avec `Africa/Dakar`, `Europe/Paris`, `America/New_York`, `Asia/Tokyo` ;
- Non-régression moteur : capacité, fermeture, tables assemblées, rotation après annulation, no-show ;
- Deux sessions simultanées pour une seule place : une seule réservation confirmée.

**Limites restantes** : les frontières d'heure d'été et les minutes proches de la bascule, les utilisateurs réels et leurs anciens navigateurs, les redirections OTP et les logs déployés ne sont pas couverts par le test fictif. Les heures ambiguës de changement DST devront recevoir leur propre test métier.

## GO/NO-GO

**NO-GO PRODUCTION** tant que :
- CI V32 effectivement verte sur PostgreSQL 16/17 ;
- restauration récente de l'archive chiffrée prouvée après les dernières données MASTER ;
- comparaison des signatures/hashes de production le jour J, tests des fuseaux et transitions DST ;
- smoke de bout en bout autorisé avec vrais comptes en environnement non productif ;
- revue de compatibilité des anciens clients, des créneaux et du parcours propriétaire ;
- accord distinct explicite pour déployer le SQL.

V31 sécurité propriétaire demeure **PR distincte et indépendante**, sans couplage dans cette branche.
