-- ASSERT permissions after ONLY synthetic V31 candidate application.
DO $test$
DECLARE
  v_signatures text[] := ARRAY[
    'public.digiy_resa_resto_claim_site_by_email_v1(text)',
    'public.digiy_resa_resto_owner_refresh_no_shows_v1(uuid)',
    'public.digiy_resa_resto_owner_set_booking_status_v1(uuid,text)'
  ];
  v text;
BEGIN
  FOREACH v IN ARRAY v_signatures LOOP
    IF has_function_privilege('anon',to_regprocedure(v),'EXECUTE') THEN
      RAISE EXCEPTION 'SYNTHETIC_OWNER_RPC_ANON_NOT_REVOKED';
    END IF;
    IF NOT has_function_privilege('authenticated',to_regprocedure(v),'EXECUTE')
      OR NOT has_function_privilege('service_role',to_regprocedure(v),'EXECUTE') THEN
      RAISE EXCEPTION 'SYNTHETIC_OWNER_GRANT_LOST';
    END IF;
  END LOOP;
  IF NOT has_function_privilege(
    'anon',
    'public.digiy_resa_resto_public_book_v1(text,date,time,integer,text,text,text)',
    'EXECUTE') THEN
    RAISE EXCEPTION 'SYNTHETIC_PUBLIC_BOOKING_BROKEN';
  END IF;
  RAISE NOTICE 'SYNTHETIC_RESTO_V31_GRANTS_PASS';
END
$test$;
