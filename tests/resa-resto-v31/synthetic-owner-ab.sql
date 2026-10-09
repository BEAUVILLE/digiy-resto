-- RESTO V31: only synthetic records and identities, no CORE data.
-- Owner-function bodies reproduce the 2026-10-09 read-only catalog snapshot,
-- but helpers/tables below are synthetic: NOT a production restore or live security test.
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid
$$;
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT COALESCE(NULLIF(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb)
$$;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.uid(),auth.jwt() TO authenticated;

CREATE TABLE public.digiy_resa_resto_sites (
  id uuid PRIMARY KEY, slug text UNIQUE NOT NULL, contact_email text,
  owner_id uuid, updated_at timestamptz DEFAULT now()
);
CREATE TABLE public.digiy_resa_resto_bookings (
  id uuid PRIMARY KEY, site_id uuid NOT NULL REFERENCES public.digiy_resa_resto_sites(id),
  booking_date date NOT NULL, expires_at timestamptz NOT NULL,
  status text NOT NULL, updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.digiy_resa_resto_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digiy_resa_resto_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resa resto sites owner" ON public.digiy_resa_resto_sites FOR ALL TO authenticated
  USING (owner_id=auth.uid()) WITH CHECK (owner_id=auth.uid());
CREATE POLICY "resa resto bookings owner" ON public.digiy_resa_resto_bookings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.digiy_resa_resto_sites s
                  WHERE s.id=site_id AND s.owner_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.digiy_resa_resto_sites s
                       WHERE s.id=site_id AND s.owner_id=auth.uid()));
GRANT SELECT,UPDATE ON public.digiy_resa_resto_sites,public.digiy_resa_resto_bookings TO authenticated;

INSERT INTO public.digiy_resa_resto_sites(id,slug,owner_id,contact_email) VALUES
('11111111-1111-1111-1111-111111111111','owner-a-test','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','owner-a@example.invalid'),
('22222222-2222-2222-2222-222222222222','owner-b-test','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','owner-b@example.invalid'),
('33333333-3333-3333-3333-333333333333','claim-test',NULL,'claim@example.invalid');
INSERT INTO public.digiy_resa_resto_bookings(id,site_id,booking_date,expires_at,status) VALUES
('41111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111','2099-07-07','2099-07-07 22:00+00','confirmed'),
('42222222-2222-2222-2222-222222222222','22222222-2222-2222-2222-222222222222','2099-07-07','2099-07-07 22:00+00','confirmed'),
('43333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','2001-01-01','2001-01-01 21:00+00','confirmed');

CREATE FUNCTION public.digiy_resa_resto_release_no_shows_v1(p_site_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public AS $func$
DECLARE v_count integer;
BEGIN
 UPDATE public.digiy_resa_resto_bookings
 SET status='no_show_released',updated_at=now()
 WHERE site_id=p_site_id AND status='confirmed' AND expires_at < now();
 GET DIAGNOSTICS v_count=ROW_COUNT;
 RETURN v_count;
END;
$func$;
-- Only the rotation helper is a deliberately inert synthetic stub.
CREATE FUNCTION public.digiy_resa_resto_recalc_rotation_v1(p_site_id uuid,p_day date)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public
AS $func$ BEGIN RETURN; END; $func$;

CREATE OR REPLACE FUNCTION public.digiy_resa_resto_claim_site_by_email_v1(p_slug text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public AS $func$
DECLARE
 v_uid uuid:=auth.uid();
 v_email text:=lower(coalesce(auth.jwt()->>'email',''));
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
 RETURN FOUND;
END;
$func$;

CREATE OR REPLACE FUNCTION public.digiy_resa_resto_owner_refresh_no_shows_v1(p_site_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public AS $func$
DECLARE v_count integer;
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.digiy_resa_resto_sites s
   WHERE s.id=p_site_id AND s.owner_id=auth.uid()) THEN
   RAISE EXCEPTION 'Restaurant inaccessible';
 END IF;
 v_count:=public.digiy_resa_resto_release_no_shows_v1(p_site_id);
 RETURN v_count;
END;
$func$;

CREATE OR REPLACE FUNCTION public.digiy_resa_resto_owner_set_booking_status_v1(p_booking_id uuid,p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public AS $func$
DECLARE v_site_id uuid; v_day date;
BEGIN
 IF p_status NOT IN ('confirmed','arrived','completed','cancelled','no_show_released') THEN
   RAISE EXCEPTION 'Statut invalide';
 END IF;
 SELECT b.site_id,b.booking_date INTO v_site_id,v_day
 FROM public.digiy_resa_resto_bookings b
 JOIN public.digiy_resa_resto_sites s ON s.id=b.site_id
 WHERE b.id=p_booking_id AND s.owner_id=auth.uid();
 IF NOT FOUND THEN RAISE EXCEPTION 'Réservation inaccessible'; END IF;
 UPDATE public.digiy_resa_resto_bookings SET status=p_status,updated_at=now()
 WHERE id=p_booking_id;
 PERFORM public.digiy_resa_resto_recalc_rotation_v1(v_site_id,v_day);
END;
$func$;
