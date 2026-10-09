-- V33 POST: the real RESTO availability function, fake late services.
-- Single transaction with rollback. Fail-fast timer prevents any regression hang.
BEGIN;
SET LOCAL statement_timeout='3500ms';
INSERT INTO public.digiy_resa_resto_sites(slug,timezone)
VALUES ('late-2259','Africa/Dakar'),('late-2330','Africa/Dakar'),
('late-day','Africa/Dakar'),('late-2345','Europe/Paris'),
('late-boundary','Africa/Dakar'),('late-2330-only','Africa/Dakar'),
('late-overnight','Africa/Dakar'),('late-normal','Africa/Dakar');
INSERT INTO public.digiy_resa_resto_zones(site_id,slug,name,max_covers)
SELECT id,'main','Synthetic late-night room',25
FROM public.digiy_resa_resto_sites WHERE slug LIKE 'late-%';
INSERT INTO public.digiy_resa_resto_service_windows(site_id,booking_from,booking_to,label)
SELECT id,
CASE slug WHEN 'late-2259' THEN time '22:00'
          WHEN 'late-2330' THEN time '23:30'
          WHEN 'late-day' THEN time '00:00'
          WHEN 'late-2345' THEN time '23:45'
          WHEN 'late-boundary' THEN time '22:00'
          WHEN 'late-2330-only' THEN time '23:30'
          WHEN 'late-overnight' THEN time '23:30'
          ELSE time '18:00' END,
CASE slug WHEN 'late-2259' THEN time '23:59'
          WHEN 'late-2330' THEN time '23:59'
          WHEN 'late-day' THEN time '23:59'
          WHEN 'late-2345' THEN time '23:59'
          WHEN 'late-boundary' THEN time '23:30'
          WHEN 'late-2330-only' THEN time '23:30'
          WHEN 'late-overnight' THEN time '01:30'
          ELSE time '20:30' END,
'Fictional service'
FROM public.digiy_resa_resto_sites WHERE slug LIKE 'late-%';
DO $night$
DECLARE r record; booked jsonb; total integer; first_time time; last_time time; n_distinct integer;
BEGIN
 FOR r IN SELECT * FROM (VALUES
 ('late-2259',4,time '22:00',time '23:30'),
 ('late-2330',1,time '23:30',time '23:30'),
 ('late-day',48,time '00:00',time '23:30'),
 ('late-2345',1,time '23:45',time '23:45'),
 ('late-boundary',4,time '22:00',time '23:30'),
 ('late-2330-only',1,time '23:30',time '23:30'),
 ('late-overnight',0,NULL::time,NULL::time),
 ('late-normal',6,time '18:00',time '20:30')
 ) x(slug,expected,first_slot,last_slot)
 LOOP
   SELECT count(*),min(slot_time),max(slot_time),count(DISTINCT slot_time)
   INTO total,first_time,last_time,n_distinct
   FROM public.digiy_resa_resto_public_availability_v1(r.slug,DATE '2099-06-01',2,'main');
   IF total<>r.expected OR n_distinct<>r.expected
    OR first_time IS DISTINCT FROM r.first_slot
    OR last_time IS DISTINCT FROM r.last_slot
   THEN RAISE EXCEPTION 'V33_LATE_SLOTS_WRONG_%_EXPECTED_%_GOT_%_%_%_%',
    r.slug,r.expected,total,n_distinct,first_time,last_time; END IF;
   RAISE NOTICE 'RESTO_V33_LATE_WINDOW_PASS_%',r.slug;
 END LOOP;
 -- Booking late evening must remain PUBLIC and immediately confirmed.
 booked := public.digiy_resa_resto_public_book_v1(
 'late-2259',DATE '2099-06-01',time '23:30',2,'main','Synthetic Guest','00000001');
 IF booked->>'status'<>'confirmed' THEN RAISE EXCEPTION 'V33_REAL_LATE_BOOKING_FAILED'; END IF;
 SELECT count(*) INTO total FROM public.digiy_resa_resto_public_availability_v1(
 'late-2259',DATE '2099-06-01',24,'main') WHERE available;
 IF total<>0 THEN RAISE EXCEPTION 'V33_LATE_CAPACITY_STILL_AVAILABLE'; END IF;
 SELECT count(*) INTO total FROM public.digiy_resa_resto_public_availability_v1(
 'late-2259',DATE '2099-06-01',23,'main') WHERE available;
 IF total<>4 THEN RAISE EXCEPTION 'V33_REMAINING_CAPACITY_NOT_AVAILABLE'; END IF;
 RAISE NOTICE 'RESTO_V33_PUBLIC_BOOKING_AND_CAPACITY_PASS';
END;
$night$;
ROLLBACK;
