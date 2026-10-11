-- DIGIY RÉSA RESTO V31 — OWNER RPC PERMISSIONS CANDIDATE.
-- NEVER AUTO DEPLOY. NOT a migration. No booking/calendar/site row changes.
-- Source: DIGIY CORE live read-only catalog, 2026-10-09.
-- Scope: precisely three owner-only RPCs; public booking/availability left intact.
-- Activation requires a fresh encrypted backup/restore, owner A/B smoke, CI and GO SQL.
BEGIN;
SET LOCAL lock_timeout = '3s';

DO $resto_v31_pre$
DECLARE
  v_signatures text[] := ARRAY[
    'public.digiy_resa_resto_claim_site_by_email_v1(text)',
    'public.digiy_resa_resto_owner_refresh_no_shows_v1(uuid)',
    'public.digiy_resa_resto_owner_set_booking_status_v1(uuid,text)'
  ];
  v_sig text;
  v_func oid;
BEGIN
  FOREACH v_sig IN ARRAY v_signatures LOOP
    v_func := to_regprocedure(v_sig);
    IF v_func IS NULL THEN
      RAISE EXCEPTION 'RESTO_V31_PREFLIGHT_MISSING_SIGNATURE';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_proc p
      WHERE p.oid = v_func AND p.prosecdef = true
        AND 'search_path=public' = ANY(COALESCE(p.proconfig,ARRAY[]::text[]))
    ) THEN
      RAISE EXCEPTION 'RESTO_V31_PREFLIGHT_FUNCTION_CONTRACT_DRIFT';
    END IF;
    IF NOT has_function_privilege('authenticated',v_func,'EXECUTE') THEN
      RAISE EXCEPTION 'RESTO_V31_PREFLIGHT_OWNER_GRANT_MISSING';
    END IF;
  END LOOP;
END
$resto_v31_pre$;

-- Explicitly revoke BOTH inherited PUBLIC and anon grants.
-- Do not revoke authenticated: these functions authorize owner identity
-- and site ownership in their existing SECURITY DEFINER bodies.
REVOKE EXECUTE ON FUNCTION
  public.digiy_resa_resto_claim_site_by_email_v1(text),
  public.digiy_resa_resto_owner_refresh_no_shows_v1(uuid),
  public.digiy_resa_resto_owner_set_booking_status_v1(uuid,text)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
  public.digiy_resa_resto_claim_site_by_email_v1(text),
  public.digiy_resa_resto_owner_refresh_no_shows_v1(uuid),
  public.digiy_resa_resto_owner_set_booking_status_v1(uuid,text)
TO authenticated, service_role;

DO $resto_v31_post$
DECLARE
  v_signatures text[] := ARRAY[
    'public.digiy_resa_resto_claim_site_by_email_v1(text)',
    'public.digiy_resa_resto_owner_refresh_no_shows_v1(uuid)',
    'public.digiy_resa_resto_owner_set_booking_status_v1(uuid,text)'
  ];
  v_sig text;
  v_func oid;
BEGIN
  FOREACH v_sig IN ARRAY v_signatures LOOP
    v_func := to_regprocedure(v_sig);
    IF v_func IS NULL OR has_function_privilege('anon',v_func,'EXECUTE')
      OR NOT has_function_privilege('authenticated',v_func,'EXECUTE')
      OR NOT has_function_privilege('service_role',v_func,'EXECUTE') THEN
      RAISE EXCEPTION 'RESTO_V31_POSTCHECK_OWNER_RPC_GRANTS_INCORRECT';
    END IF;
  END LOOP;
  IF NOT has_function_privilege(
    'anon',
    'public.digiy_resa_resto_public_book_v1(text,date,time,integer,text,text,text)',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'RESTO_V31_POSTCHECK_PUBLIC_BOOKING_BROKEN';
  END IF;
END
$resto_v31_post$;
COMMIT;
