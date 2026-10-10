-- PostgreSQL 17 DISPOSABLE DATABASE ONLY.
-- Both owners, restaurant records, emails and requests are SYNTHETIC.
-- The three owner RPC definitions are derived from the 2026-10-10 live
-- read-only introspection, and here run on a minimal synthetic schema.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
  $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS
  $$ SELECT coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb) $$;
GRANT USAGE ON SCHEMA auth, public TO anon,authenticated;
GRANT EXECUTE ON FUNCTION auth.uid(),auth.jwt() TO authenticated;

CREATE TABLE public.digiy_resa_resto_sites(
 id uuid PRIMARY KEY, slug text UNIQUE NOT NULL, owner_id uuid,
 contact_email text, updated_at timestamptz NOT NULL DEFAULT now(),
 is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE public.digiy_resa_resto_bookings(
 id uuid PRIMARY KEY, site_id uuid NOT NULL REFERENCES public.digiy_resa_resto_sites(id),
 booking_date date NOT NULL, status text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.resto_test_audit(id integer GENERATED ALWAYS AS IDENTITY, action text);
ALTER TABLE public.digiy_resa_resto_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digiy_resa_resto_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resa resto sites owner" ON public.digiy_resa_resto_sites FOR ALL
  TO authenticated USING (owner_id=auth.uid()) WITH CHECK (owner_id=auth.uid());
CREATE POLICY "resa resto bookings owner" ON public.digiy_resa_resto_bookings FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.digiy_resa_resto_sites s
            WHERE s.id=digiy_resa_resto_bookings.site_id AND s.owner_id=auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.digiy_resa_resto_sites s
            WHERE s.id=digiy_resa_resto_bookings.site_id AND s.owner_id=auth.uid())
  );
GRANT SELECT,UPDATE ON public.digiy_resa_resto_sites, public.digiy_resa_resto_bookings TO authenticated;
CREATE FUNCTION public.digiy_resa_resto_recalc_rotation_v1(p_site_id uuid,p_day date)
RETURNS void LANGUAGE plpgsql AS $$ BEGIN
 INSERT INTO public.resto_test_audit(action) VALUES('recalc');
END $$;
CREATE FUNCTION public.digiy_resa_resto_release_no_shows_v1(p_site_id uuid)
RETURNS integer LANGUAGE plpgsql AS $$ BEGIN
 INSERT INTO public.resto_test_audit(action) VALUES('refresh');
 RETURN 0;
END $$;
-- Live RESTO owner RPC #1: exact permission/owner logic from current CORE.
CREATE OR REPLACE FUNCTION public.digiy_resa_resto_claim_site_by_email_v1(p_slug text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
 v_uid uuid := auth.uid();
 v_email text := lower(coalesce(auth.jwt()->>'email',''));
 v_site public.digiy_resa_resto_sites%rowtype;
BEGIN
 IF v_uid IS NULL OR v_email='' THEN RETURN false; END IF;
 SELECT * INTO v_site FROM public.digiy_resa_resto_sites WHERE slug=p_slug FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 IF v_site.owner_id=v_uid THEN RETURN true; END IF;
 IF v_site.owner_id IS NOT NULL THEN RETURN false; END IF;
 IF v_site.contact_email IS NULL OR lower(v_site.contact_email)<>v_email THEN RETURN false; END IF;
 UPDATE public.digiy_resa_resto_sites SET owner_id=v_uid,updated_at=now()
 WHERE id=v_site.id AND owner_id IS NULL;
 RETURN found;
END $function$;
-- Live RESTO owner RPC #2.
CREATE OR REPLACE FUNCTION public.digiy_resa_resto_owner_refresh_no_shows_v1(p_site_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_count integer;
BEGIN
 IF NOT EXISTS (
  SELECT 1 FROM public.digiy_resa_resto_sites s
  WHERE s.id=p_site_id AND s.owner_id=auth.uid()
 ) THEN RAISE EXCEPTION 'Restaurant inaccessible'; END IF;
 v_count := public.digiy_resa_resto_release_no_shows_v1(p_site_id);
 RETURN v_count;
END $function$;
-- Live RESTO owner RPC #3.
CREATE OR REPLACE FUNCTION public.digiy_resa_resto_owner_set_booking_status_v1(
 p_booking_id uuid,p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_site_id uuid; v_day date;
BEGIN
 IF p_status NOT IN ('confirmed','arrived','completed','cancelled','no_show_released')
 THEN RAISE EXCEPTION 'Statut invalide'; END IF;
 SELECT b.site_id,b.booking_date INTO v_site_id,v_day
 FROM public.digiy_resa_resto_bookings b
 JOIN public.digiy_resa_resto_sites s ON s.id=b.site_id
 WHERE b.id=p_booking_id AND s.owner_id=auth.uid();
 IF NOT FOUND THEN RAISE EXCEPTION 'Réservation inaccessible'; END IF;
 UPDATE public.digiy_resa_resto_bookings SET status=p_status,updated_at=now()
 WHERE id=p_booking_id;
 PERFORM public.digiy_resa_resto_recalc_rotation_v1(v_site_id,v_day);
END $function$;
-- Mirror real SQL grants (anon denied owner operations, authenticated allowed).
REVOKE EXECUTE ON FUNCTION public.digiy_resa_resto_claim_site_by_email_v1(text)
 FROM PUBLIC,anon;
REVOKE EXECUTE ON FUNCTION public.digiy_resa_resto_owner_refresh_no_shows_v1(uuid)
 FROM PUBLIC,anon;
REVOKE EXECUTE ON FUNCTION public.digiy_resa_resto_owner_set_booking_status_v1(uuid,text)
 FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.digiy_resa_resto_claim_site_by_email_v1(text)
 TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.digiy_resa_resto_owner_refresh_no_shows_v1(uuid)
 TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.digiy_resa_resto_owner_set_booking_status_v1(uuid,text)
 TO authenticated,service_role;

INSERT INTO public.digiy_resa_resto_sites(id,slug,owner_id,contact_email) VALUES
 ('00000000-0000-4000-8000-000000000101','resto-a','00000000-0000-4000-8000-000000000001','owner-a@example.invalid'),
 ('00000000-0000-4000-8000-000000000102','resto-b','00000000-0000-4000-8000-000000000002','owner-b@example.invalid'),
 ('00000000-0000-4000-8000-000000000103','unclaimed-b',NULL,'owner-b@example.invalid');
INSERT INTO public.digiy_resa_resto_bookings(id,site_id,booking_date,status) VALUES
 ('00000000-0000-4000-8000-000000000201','00000000-0000-4000-8000-000000000101','2026-10-20','confirmed'),
 ('00000000-0000-4000-8000-000000000202','00000000-0000-4000-8000-000000000102','2026-10-20','confirmed');

DO $authz$
BEGIN
 IF has_function_privilege('anon','public.digiy_resa_resto_claim_site_by_email_v1(text)','EXECUTE')
 OR has_function_privilege('anon','public.digiy_resa_resto_owner_refresh_no_shows_v1(uuid)','EXECUTE')
 OR has_function_privilege('anon','public.digiy_resa_resto_owner_set_booking_status_v1(uuid,text)','EXECUTE')
 THEN RAISE EXCEPTION 'RESTO_SYNTHETIC_ANON_OWNER_FUNCTION_LEAK'; END IF;
END $authz$;

-- Fake signed claim A, as in test client; no real Auth users or cookies.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',true);
SELECT set_config('request.jwt.claims','{"email":"owner-a@example.invalid"}',true);
DO $test$
DECLARE n integer; errmsg text; can_claim boolean;
BEGIN
 SELECT count(*) INTO n FROM public.digiy_resa_resto_sites;
 IF n<>1 THEN RAISE EXCEPTION 'A_RLS_SITE_LEAK: %',n; END IF;
 SELECT count(*) INTO n FROM public.digiy_resa_resto_bookings;
 IF n<>1 THEN RAISE EXCEPTION 'A_RLS_BOOKING_LEAK: %',n; END IF;
 SELECT public.digiy_resa_resto_claim_site_by_email_v1('unclaimed-b') INTO can_claim;
 IF can_claim IS DISTINCT FROM false THEN RAISE EXCEPTION 'A_CLAIMED_B_SITE'; END IF;
 PERFORM public.digiy_resa_resto_owner_set_booking_status_v1(
  '00000000-0000-4000-8000-000000000201','completed');
 BEGIN
  PERFORM public.digiy_resa_resto_owner_set_booking_status_v1(
    '00000000-0000-4000-8000-000000000202','cancelled');
  RAISE EXCEPTION 'A_CROSS_OWNER_BOOKING_ALLOWED';
 EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS errmsg=MESSAGE_TEXT;
  IF errmsg<>'Réservation inaccessible' THEN
   RAISE EXCEPTION 'A_UNEXPECTED_REJECTION: %',errmsg;
  END IF;
 END;
 BEGIN
  PERFORM public.digiy_resa_resto_owner_refresh_no_shows_v1(
    '00000000-0000-4000-8000-000000000102');
  RAISE EXCEPTION 'A_CROSS_OWNER_REFRESH_ALLOWED';
 EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS errmsg=MESSAGE_TEXT;
  IF errmsg<>'Restaurant inaccessible' THEN
   RAISE EXCEPTION 'A_UNEXPECTED_REFRESH_REJECTION: %',errmsg;
  END IF;
 END;
END $test$;
COMMIT;
DO $aftera$
BEGIN
 IF (SELECT status FROM public.digiy_resa_resto_bookings WHERE id='00000000-0000-4000-8000-000000000201')<>'completed'
 OR (SELECT status FROM public.digiy_resa_resto_bookings WHERE id='00000000-0000-4000-8000-000000000202')<>'confirmed'
 THEN RAISE EXCEPTION 'A_ISOLATION_NOT_SAVED'; END IF;
END $aftera$;
-- Fake B, independent from A.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',true);
SELECT set_config('request.jwt.claims','{"email":"owner-b@example.invalid"}',true);
DO $test$
DECLARE n integer; errmsg text; can_claim boolean;
BEGIN
 SELECT count(*) INTO n FROM public.digiy_resa_resto_sites;
 IF n<>1 THEN RAISE EXCEPTION 'B_RLS_SITE_LEAK: %',n; END IF;
 SELECT count(*) INTO n FROM public.digiy_resa_resto_bookings;
 IF n<>1 THEN RAISE EXCEPTION 'B_RLS_BOOKING_LEAK: %',n; END IF;
 SELECT public.digiy_resa_resto_claim_site_by_email_v1('unclaimed-b') INTO can_claim;
 IF can_claim IS DISTINCT FROM true THEN RAISE EXCEPTION 'B_CANNOT_CLAIM_OWN_EMAIL'; END IF;
 PERFORM public.digiy_resa_resto_owner_set_booking_status_v1(
    '00000000-0000-4000-8000-000000000202','cancelled');
 BEGIN
  PERFORM public.digiy_resa_resto_owner_set_booking_status_v1(
    '00000000-0000-4000-8000-000000000201','confirmed');
  RAISE EXCEPTION 'B_CROSS_OWNER_BOOKING_ALLOWED';
 EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS errmsg=MESSAGE_TEXT;
  IF errmsg<>'Réservation inaccessible' THEN
   RAISE EXCEPTION 'B_UNEXPECTED_REJECTION: %',errmsg;
  END IF;
 END;
END $test$;
COMMIT;
DO $finish$
BEGIN
 IF (SELECT status FROM public.digiy_resa_resto_bookings WHERE id='00000000-0000-4000-8000-000000000201')<>'completed'
 OR (SELECT status FROM public.digiy_resa_resto_bookings WHERE id='00000000-0000-4000-8000-000000000202')<>'cancelled'
 OR (SELECT owner_id FROM public.digiy_resa_resto_sites WHERE slug='unclaimed-b')<>
     '00000000-0000-4000-8000-000000000002'::uuid
 THEN RAISE EXCEPTION 'OWNER_AB_FINAL_INCONSISTENCY'; END IF;
END $finish$;
SELECT 'RESTO_ISOLATED_OWNER_AB_OK' AS proof;
