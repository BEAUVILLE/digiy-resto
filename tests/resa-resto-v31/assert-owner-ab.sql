-- Dual-owner behavioral tests for synthetic RESTO tables and owner RPC bodies.
-- Must run only in the throwaway CI database (after synthetic-owner-ab.sql).
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',true);
SELECT set_config('request.jwt.claims','{"email":"owner-a@example.invalid"}',true);
DO $a$
DECLARE n integer; changed integer;
BEGIN
 IF (SELECT count(*) FROM public.digiy_resa_resto_sites) <> 1 THEN
   RAISE EXCEPTION 'OWNER_A_SITE_RLS_LEAK';
 END IF;
 IF NOT public.digiy_resa_resto_claim_site_by_email_v1('owner-a-test') THEN
   RAISE EXCEPTION 'OWNER_A_CLAIM_SELF_FAILED';
 END IF;
 IF public.digiy_resa_resto_claim_site_by_email_v1('owner-b-test') THEN
   RAISE EXCEPTION 'OWNER_A_CLAIM_OTHER_SUCCEEDED';
 END IF;
 IF public.digiy_resa_resto_claim_site_by_email_v1('claim-test') THEN
   RAISE EXCEPTION 'OWNER_A_CLAIM_WRONG_EMAIL_SUCCEEDED';
 END IF;
 PERFORM public.digiy_resa_resto_owner_set_booking_status_v1(
   '41111111-1111-1111-1111-111111111111','arrived');
 IF (SELECT status FROM public.digiy_resa_resto_bookings
     WHERE id='41111111-1111-1111-1111-111111111111') <> 'arrived' THEN
   RAISE EXCEPTION 'OWNER_A_OWN_BOOKING_NOT_CHANGED';
 END IF;
 BEGIN
   PERFORM public.digiy_resa_resto_owner_set_booking_status_v1(
     '42222222-2222-2222-2222-222222222222','cancelled');
   RAISE EXCEPTION 'OWNER_A_CROSS_BOOKING_ALLOWED';
 EXCEPTION WHEN OTHERS THEN
   IF SQLERRM <> 'Réservation inaccessible' THEN RAISE; END IF;
 END;
 BEGIN
   PERFORM public.digiy_resa_resto_owner_set_booking_status_v1(
     '41111111-1111-1111-1111-111111111111','invalid-state');
   RAISE EXCEPTION 'OWNER_A_INVALID_STATUS_ALLOWED';
 EXCEPTION WHEN OTHERS THEN
   IF SQLERRM <> 'Statut invalide' THEN RAISE; END IF;
 END;
 BEGIN
   PERFORM public.digiy_resa_resto_owner_refresh_no_shows_v1(
     '22222222-2222-2222-2222-222222222222');
   RAISE EXCEPTION 'OWNER_A_CROSS_NO_SHOW_ALLOWED';
 EXCEPTION WHEN OTHERS THEN
   IF SQLERRM <> 'Restaurant inaccessible' THEN RAISE; END IF;
 END;
 n:=public.digiy_resa_resto_owner_refresh_no_shows_v1(
   '11111111-1111-1111-1111-111111111111');
 IF n<>1 THEN RAISE EXCEPTION 'OWNER_A_NO_SHOW_COUNT_WRONG_%',n; END IF;
 UPDATE public.digiy_resa_resto_bookings SET status='cancelled'
 WHERE id='42222222-2222-2222-2222-222222222222';
 GET DIAGNOSTICS changed=ROW_COUNT;
 IF changed<>0 THEN RAISE EXCEPTION 'OWNER_A_DIRECT_BOOKING_RLS_LEAK'; END IF;
 UPDATE public.digiy_resa_resto_sites SET contact_email='bad@example.invalid'
 WHERE id='22222222-2222-2222-2222-222222222222';
 GET DIAGNOSTICS changed=ROW_COUNT;
 IF changed<>0 THEN RAISE EXCEPTION 'OWNER_A_DIRECT_SITE_RLS_LEAK'; END IF;
 IF (SELECT count(*) FROM public.digiy_resa_resto_bookings)<>2 THEN
   RAISE EXCEPTION 'OWNER_A_BOOKING_SELECT_RLS_LEAK';
 END IF;
 PERFORM set_config('request.jwt.claims','{"email":"claim@example.invalid"}',true);
 IF NOT public.digiy_resa_resto_claim_site_by_email_v1('claim-test') THEN
   RAISE EXCEPTION 'OWNER_A_VALID_UNCLAIMED_SITE_FAILED';
 END IF;
 IF (SELECT count(*) FROM public.digiy_resa_resto_sites)<>2 THEN
   RAISE EXCEPTION 'OWNER_A_NEWLY_CLAIMED_SITE_NOT_VISIBLE';
 END IF;
 RAISE NOTICE 'RESTO_V31_OWNER_A_ISOLATION_PASS';
END;
$a$;
ROLLBACK;

BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',true);
SELECT set_config('request.jwt.claims','{"email":"owner-b@example.invalid"}',true);
DO $b$
BEGIN
 IF (SELECT count(*) FROM public.digiy_resa_resto_sites)<>1 THEN
   RAISE EXCEPTION 'OWNER_B_SITE_RLS_LEAK';
 END IF;
 IF NOT public.digiy_resa_resto_claim_site_by_email_v1('owner-b-test') THEN
   RAISE EXCEPTION 'OWNER_B_SELF_CLAIM_FAILED';
 END IF;
 IF public.digiy_resa_resto_claim_site_by_email_v1('owner-a-test') THEN
   RAISE EXCEPTION 'OWNER_B_CLAIM_OTHER_SUCCEEDED';
 END IF;
 BEGIN
   PERFORM public.digiy_resa_resto_owner_set_booking_status_v1(
     '41111111-1111-1111-1111-111111111111','cancelled');
   RAISE EXCEPTION 'OWNER_B_CROSS_BOOKING_ALLOWED';
 EXCEPTION WHEN OTHERS THEN
   IF SQLERRM <> 'Réservation inaccessible' THEN RAISE; END IF;
 END;
 PERFORM public.digiy_resa_resto_owner_set_booking_status_v1(
   '42222222-2222-2222-2222-222222222222','completed');
 IF (SELECT status FROM public.digiy_resa_resto_bookings
   WHERE id='42222222-2222-2222-2222-222222222222')<>'completed' THEN
   RAISE EXCEPTION 'OWNER_B_OWN_BOOKING_NOT_CHANGED';
 END IF;
 IF (SELECT count(*) FROM public.digiy_resa_resto_bookings)<>1 THEN
   RAISE EXCEPTION 'OWNER_B_BOOKING_SELECT_RLS_LEAK';
 END IF;
 RAISE NOTICE 'RESTO_V31_OWNER_B_ISOLATION_PASS';
END;
$b$;
ROLLBACK;

-- Additional no-session identity check: function ACL permits authenticated
-- but auth.uid() is NULL, so the owner RPC body must reject the operation.
BEGIN;
SET LOCAL ROLE authenticated;
DO $none$
BEGIN
 IF public.digiy_resa_resto_claim_site_by_email_v1('claim-test') THEN
   RAISE EXCEPTION 'NO_SESSION_OWNER_CLAIM_SUCCEEDED';
 END IF;
 BEGIN
   PERFORM public.digiy_resa_resto_owner_refresh_no_shows_v1(
     '11111111-1111-1111-1111-111111111111');
   RAISE EXCEPTION 'NO_SESSION_OWNER_REFRESH_SUCCEEDED';
 EXCEPTION WHEN OTHERS THEN
   IF SQLERRM <> 'Restaurant inaccessible' THEN RAISE; END IF;
 END;
 RAISE NOTICE 'RESTO_V31_NO_SESSION_REJECTED';
END;
$none$;
ROLLBACK;
