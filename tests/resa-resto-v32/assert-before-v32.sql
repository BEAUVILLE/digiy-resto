-- Read-only demonstration of OLD behavior in a throwaway synthetic DB.
-- All fake bookings made here are rolled back.
BEGIN;
DO $before$
DECLARE d date; n integer; result jsonb;
BEGIN
 d:=((clock_timestamp() AT TIME ZONE 'UTC')::date - 1);
 SELECT count(*) INTO n FROM public.digiy_resa_resto_public_availability_v1('capacity-fake',d,1,'main') WHERE available;
 IF n=0 THEN RAISE EXCEPTION 'RESTO_V32_PREPATCH_PAST_AVAILABILITY_NOT_REPRODUCED'; END IF;
 result:=public.digiy_resa_resto_public_book_v1('capacity-fake',d,'18:00',1,'main','Synthetic Old Clock','00000001');
 IF result->>'status'<>'confirmed' THEN
   RAISE EXCEPTION 'RESTO_V32_PREPATCH_PAST_BOOKING_NOT_REPRODUCED';
 END IF;
 RAISE NOTICE 'RESTO_V32_PREPATCH_PAST_BOOKING_REPRODUCED';
END;
$before$;
ROLLBACK;
