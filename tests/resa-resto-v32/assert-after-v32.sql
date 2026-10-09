-- Compare clock rules from the exact snapshotted booking functions after V32 candidate.
-- All sites, people, bookings and time zones are test data. Roll back all mutations.
BEGIN;
DO $time$
DECLARE zone_name text; past_date date; today_date date; next_date date;
        r jsonb; n integer; disabled_count integer;
BEGIN
 INSERT INTO public.digiy_resa_resto_sites(slug,timezone)
 VALUES ('v32-clock-fake','UTC');
 INSERT INTO public.digiy_resa_resto_zones(site_id,slug,name,max_covers)
 SELECT id,'main','Synthetic timed zone',100 FROM public.digiy_resa_resto_sites WHERE slug='v32-clock-fake';
 INSERT INTO public.digiy_resa_resto_service_windows(site_id,booking_from,booking_to,label)
 SELECT id,'00:00','23:59','All-day synthetic slots'
 FROM public.digiy_resa_resto_sites WHERE slug='v32-clock-fake';
 FOREACH zone_name IN ARRAY ARRAY[
   'Africa/Dakar','Europe/Paris','America/New_York','Asia/Tokyo'
 ] LOOP
  UPDATE public.digiy_resa_resto_sites SET timezone=zone_name WHERE slug='v32-clock-fake';
  today_date:=(clock_timestamp() AT TIME ZONE zone_name)::date;
  past_date:=today_date-1;
  next_date:=today_date+1;
  -- Availability must block all slots on past days.
  SELECT count(*) INTO n FROM public.digiy_resa_resto_public_availability_v1(
   'v32-clock-fake',past_date,1,'main') WHERE available;
  IF n<>0 THEN RAISE EXCEPTION 'V32_PAST_AVAILABILITY_OPEN_%',zone_name; END IF;
  SELECT count(*) INTO disabled_count FROM public.digiy_resa_resto_public_availability_v1(
   'v32-clock-fake',past_date,1,'main') WHERE reason='créneau passé';
  IF disabled_count=0 THEN RAISE EXCEPTION 'V32_PAST_REASON_MISSING_%',zone_name; END IF;
  BEGIN
    PERFORM public.digiy_resa_resto_public_book_v1(
     'v32-clock-fake',past_date,'18:00',1,'main','Fake Past','00000001');
    RAISE EXCEPTION 'V32_PAST_BOOKING_ACCEPTED_%',zone_name;
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM<>'Date ou heure de réservation passée' THEN RAISE; END IF;
  END;
  -- Midnight earlier today must be closed for this restaurant's LOCAL calendar day.
  SELECT count(*) INTO n FROM public.digiy_resa_resto_public_availability_v1(
   'v32-clock-fake',today_date,1,'main') WHERE slot_time='00:00' AND available;
  IF n<>0 THEN RAISE EXCEPTION 'V32_TODAY_MIDNIGHT_OPEN_%',zone_name; END IF;
  BEGIN
    PERFORM public.digiy_resa_resto_public_book_v1(
     'v32-clock-fake',today_date,'00:00',1,'main','Fake Today Past','00000001');
    RAISE EXCEPTION 'V32_TODAY_PAST_BOOKING_ACCEPTED_%',zone_name;
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM<>'Date ou heure de réservation passée' THEN RAISE; END IF;
  END;
  -- Same restaurant can still accept tomorrow's booking with immediate confirmation.
  SELECT count(*) INTO n FROM public.digiy_resa_resto_public_availability_v1(
   'v32-clock-fake',next_date,1,'main') WHERE slot_time='18:00' AND available;
  IF n<>1 THEN RAISE EXCEPTION 'V32_FUTURE_SLOT_MISSING_%',zone_name; END IF;
  r:=public.digiy_resa_resto_public_book_v1(
    'v32-clock-fake',next_date,'18:00',1,'main','Fake Tomorrow','00000001');
  IF r->>'status'<>'confirmed' THEN RAISE EXCEPTION 'V32_FUTURE_NOT_CONFIRMED_%',zone_name; END IF;
  RAISE NOTICE 'RESTO_V32_LOCAL_CLOCK_PASS_%',zone_name;
 END LOOP;
 SELECT COUNT(*) INTO n FROM public.digiy_resa_resto_bookings b
 JOIN public.digiy_resa_resto_sites s ON s.id=b.site_id
 WHERE s.slug='v32-clock-fake' AND b.status='confirmed';
 IF n<>4 THEN RAISE EXCEPTION 'V32_FUTURE_COUNT_WRONG_%',n; END IF;
 RAISE NOTICE 'RESTO_V32_PAST_BLOCK_AND_FUTURE_PASS';
END;
$time$;
ROLLBACK;
