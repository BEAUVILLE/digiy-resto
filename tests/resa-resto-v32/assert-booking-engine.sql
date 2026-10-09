-- Actual 2026-10-09 booking/availability/rotation/no-show FUNCTION BODIES
-- exercised against synthetic sites, synthetic contacts and synthetic tables.
-- Run only on a locally dedicated throwaway database.
DO $t$
DECLARE
 r jsonb; second_booking uuid; n integer;
 rot_first uuid; prior_status boolean; prior_release timestamptz;
BEGIN
 -- Capacity: 3 covers reserved, 2 more refused; 1 more succeeds.
 r:=public.digiy_resa_resto_public_book_v1(
 'capacity-fake','2099-06-01','18:00',3,'main','Fake Client A','00000001');
 IF r->>'status'<>'confirmed' THEN RAISE EXCEPTION 'CAPACITY_FIRST_NOT_CONFIRMED'; END IF;
 IF EXISTS(SELECT 1 FROM public.digiy_resa_resto_public_availability_v1(
   'capacity-fake','2099-06-01',2,'main') WHERE available) THEN
   RAISE EXCEPTION 'CAPACITY_AVAILABILITY_EXCEEDED';
 END IF;
 BEGIN
   PERFORM public.digiy_resa_resto_public_book_v1(
   'capacity-fake','2099-06-01','18:00',2,'main','Fake Client B','00000002');
   RAISE EXCEPTION 'CAPACITY_OVERBOOK_SUCCEEDED';
 EXCEPTION WHEN OTHERS THEN
   IF SQLERRM <> 'Capacité de zone insuffisante' THEN RAISE; END IF;
 END;
 r:=public.digiy_resa_resto_public_book_v1(
 'capacity-fake','2099-06-01','18:00',1,'main','Fake Client C','00000003');
 IF r->>'status'<>'confirmed' THEN RAISE EXCEPTION 'CAPACITY_LAST_COVER_FAILED'; END IF;
 SELECT SUM(guests) INTO n FROM public.digiy_resa_resto_bookings
 WHERE site_id=(SELECT id FROM public.digiy_resa_resto_sites WHERE slug='capacity-fake')
 AND status='confirmed';
 IF n<>4 THEN RAISE EXCEPTION 'CAPACITY_INVARIANT_WRONG_%',n; END IF;
 RAISE NOTICE 'RESTO_ENGINE_CAPACITY_PASS';

 -- Weekly closure: no slots and no public reservation.
 IF EXISTS(SELECT 1 FROM public.digiy_resa_resto_public_availability_v1(
  'closed-fake','2099-06-01',2,'main')) THEN RAISE EXCEPTION 'CLOSED_SITE_SLOTS_SHOWN'; END IF;
 BEGIN
  PERFORM public.digiy_resa_resto_public_book_v1(
  'closed-fake','2099-06-01','18:00',2,'main','Fake Closed','00000004');
  RAISE EXCEPTION 'CLOSED_SITE_BOOKING_SUCCEEDED';
 EXCEPTION WHEN OTHERS THEN
  IF SQLERRM <> 'Restaurant fermé ce jour' THEN RAISE; END IF;
 END;
 RAISE NOTICE 'RESTO_ENGINE_CLOSURE_PASS';

 -- A group of 2+2 seats can accommodate three guests.
 r:=public.digiy_resa_resto_public_book_v1(
 'join-fake','2099-06-01','18:00',3,'main','Fake Group','00000005');
 SELECT COUNT(*) INTO n FROM public.digiy_resa_resto_booking_tables
 WHERE booking_id=(r->>'booking_id')::uuid;
 IF n<>2 OR jsonb_array_length(r->'tables')<>2 THEN
  RAISE EXCEPTION 'JOIN_TABLES_EXPECTED_TWO_GOT_%',n;
 END IF;
 RAISE NOTICE 'RESTO_ENGINE_JOIN_PASS';

 -- Rotation: same real table in the first and second dinner services.
 r:=public.digiy_resa_resto_public_book_v1(
 'rotation-fake','2099-06-01','18:00',2,'main','Fake Rotation A','00000006');
 rot_first:=(r->>'booking_id')::uuid;
 r:=public.digiy_resa_resto_public_book_v1(
 'rotation-fake','2099-06-01','20:00',2,'main','Fake Rotation B','00000007');
 second_booking:=(r->>'booking_id')::uuid;
 SELECT rotation_required,release_by INTO STRICT prior_status,prior_release
 FROM public.digiy_resa_resto_bookings WHERE id=rot_first;
 IF NOT COALESCE(prior_status,false) OR prior_release IS NULL THEN
   RAISE EXCEPTION 'ROTATION_SECOND_SERVICE_NOT_TRIGGERED';
 END IF;
 IF prior_release<>(('2099-06-01'::date + '20:00'::time) AT TIME ZONE 'UTC') THEN
   RAISE EXCEPTION 'ROTATION_RELEASE_TIME_WRONG';
 END IF;
 UPDATE public.digiy_resa_resto_bookings SET status='cancelled' WHERE id=second_booking;
 PERFORM public.digiy_resa_resto_recalc_rotation_v1(
 (SELECT id FROM public.digiy_resa_resto_sites WHERE slug='rotation-fake'),'2099-06-01');
 IF EXISTS(SELECT 1 FROM public.digiy_resa_resto_bookings
 WHERE id=rot_first AND (rotation_required=true OR release_by IS NOT NULL)) THEN
   RAISE EXCEPTION 'ROTATION_NOT_CLEARED_AFTER_CANCEL';
 END IF;
 RAISE NOTICE 'RESTO_ENGINE_ROTATION_CANCEL_PASS';

 -- No-show release runs as part of a public booking and clears stale capacity.
 INSERT INTO public.digiy_resa_resto_bookings(
 site_id,zone_id,service_window_id,booking_date,booking_time,starts_at,expires_at,
 customer_name,customer_phone,guests,status)
 SELECT s.id,z.id,w.id,'2099-06-01','18:00',
 '2001-01-01 18:00+00','2001-01-01 18:15+00',
 'Fake Expired','00000008',4,'confirmed'
 FROM public.digiy_resa_resto_sites s
 JOIN public.digiy_resa_resto_zones z ON z.site_id=s.id
 JOIN public.digiy_resa_resto_service_windows w ON w.site_id=s.id AND w.service_no=1
 WHERE s.slug='no-show-fake';
 r:=public.digiy_resa_resto_public_book_v1(
 'no-show-fake','2099-06-01','18:00',1,'main','Fake Fresh','00000009');
 IF r->>'status'<>'confirmed' THEN RAISE EXCEPTION 'NO_SHOW_FRESH_BOOK_FAILED'; END IF;
 SELECT COUNT(*) INTO n FROM public.digiy_resa_resto_bookings b
 JOIN public.digiy_resa_resto_sites s ON s.id=b.site_id
 WHERE s.slug='no-show-fake' AND b.status='no_show_released';
 IF n<>1 THEN RAISE EXCEPTION 'NO_SHOW_RELEASE_COUNT_WRONG_%',n; END IF;
 RAISE NOTICE 'RESTO_ENGINE_NO_SHOW_PASS';
END
$t$;
