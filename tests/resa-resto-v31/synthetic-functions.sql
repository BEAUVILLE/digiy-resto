-- SYNTHETIC PostgreSQL fixture ONLY. This DB contains no DIGIY CORE data.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN;

CREATE OR REPLACE FUNCTION public.digiy_resa_resto_claim_site_by_email_v1(p_slug text)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path TO public
AS $$ SELECT true $$;
CREATE OR REPLACE FUNCTION public.digiy_resa_resto_owner_refresh_no_shows_v1(p_site_id uuid)
RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path TO public
AS $$ SELECT 0 $$;
CREATE OR REPLACE FUNCTION public.digiy_resa_resto_owner_set_booking_status_v1(
 p_booking_id uuid,p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public
AS $$ BEGIN RETURN; END $$;
CREATE OR REPLACE FUNCTION public.digiy_resa_resto_public_book_v1(
 p_slug text,p_booking_date date,p_booking_time time,p_guests integer,
 p_zone_slug text,p_customer_name text,p_customer_phone text)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path TO public
AS $$ SELECT '{"ok":true}'::jsonb $$;

GRANT USAGE ON SCHEMA public TO anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION
 public.digiy_resa_resto_claim_site_by_email_v1(text),
 public.digiy_resa_resto_owner_refresh_no_shows_v1(uuid),
 public.digiy_resa_resto_owner_set_booking_status_v1(uuid,text),
 public.digiy_resa_resto_public_book_v1(text,date,time,integer,text,text,text)
TO PUBLIC,anon,authenticated,service_role;
