-- Throwaway PostgreSQL CI database only: fake sites, zones, tables and bookings.
-- Never run against DIGIY CORE. No real customer, site or login data.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE public.digiy_resa_resto_sites (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text UNIQUE NOT NULL,
 owner_id uuid, contact_email text, is_active boolean NOT NULL DEFAULT true,
 closed_weekdays smallint[] NOT NULL DEFAULT '{}'::smallint[],
 timezone text NOT NULL DEFAULT 'UTC', no_show_grace_minutes integer NOT NULL DEFAULT 15,
 table_plan_enabled boolean NOT NULL DEFAULT false, fixed_services_enabled boolean NOT NULL DEFAULT false,
 updated_at timestamptz DEFAULT now()
);
CREATE TABLE public.digiy_resa_resto_zones (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), site_id uuid NOT NULL REFERENCES public.digiy_resa_resto_sites(id),
 slug text NOT NULL, name text NOT NULL,max_covers integer NOT NULL,
 is_active boolean NOT NULL DEFAULT true, UNIQUE(site_id,slug)
);
CREATE TABLE public.digiy_resa_resto_service_windows (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),site_id uuid NOT NULL REFERENCES public.digiy_resa_resto_sites(id),
 booking_from time NOT NULL,booking_to time NOT NULL,
 weekdays smallint[] NOT NULL DEFAULT ARRAY[1,2,3,4,5,6,7]::smallint[],
 is_active boolean NOT NULL DEFAULT true, label text NOT NULL,
 meal_period text NOT NULL DEFAULT 'dinner',service_no integer NOT NULL DEFAULT 1
);
CREATE TABLE public.digiy_resa_resto_tables (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),zone_id uuid NOT NULL REFERENCES public.digiy_resa_resto_zones(id),
 label text NOT NULL,seats integer NOT NULL,is_active boolean NOT NULL DEFAULT true,
 is_joinable boolean NOT NULL DEFAULT false,join_group text,sort_order integer NOT NULL DEFAULT 100
);
CREATE TABLE public.digiy_resa_resto_bookings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 site_id uuid NOT NULL REFERENCES public.digiy_resa_resto_sites(id),
 zone_id uuid NOT NULL REFERENCES public.digiy_resa_resto_zones(id),
 service_window_id uuid NOT NULL REFERENCES public.digiy_resa_resto_service_windows(id),
 booking_date date NOT NULL, booking_time time NOT NULL,
 starts_at timestamptz NOT NULL, expires_at timestamptz NOT NULL,
 customer_name text NOT NULL,customer_phone text NOT NULL,
 guests integer NOT NULL,status text NOT NULL DEFAULT 'confirmed',
 rotation_required boolean NOT NULL DEFAULT false, release_by timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.digiy_resa_resto_booking_tables (
 booking_id uuid NOT NULL REFERENCES public.digiy_resa_resto_bookings(id),
 table_id uuid NOT NULL REFERENCES public.digiy_resa_resto_tables(id),
 PRIMARY KEY(booking_id,table_id)
);
INSERT INTO public.digiy_resa_resto_sites(slug,table_plan_enabled,fixed_services_enabled)
 VALUES ('capacity-fake',false,false),('concurrency-fake',false,false),
 ('rotation-fake',true,true),('no-show-fake',false,false),
 ('join-fake',true,false),('closed-fake',false,false);
UPDATE public.digiy_resa_resto_sites
 SET closed_weekdays=ARRAY[1,2,3,4,5,6,7]::smallint[]
 WHERE slug='closed-fake';
INSERT INTO public.digiy_resa_resto_zones(site_id,slug,name,max_covers)
 SELECT id,'main','Synthetic room',CASE WHEN slug='concurrency-fake' THEN 1 ELSE 4 END
 FROM public.digiy_resa_resto_sites;
INSERT INTO public.digiy_resa_resto_service_windows(site_id,booking_from,booking_to,label,meal_period,service_no)
 SELECT id,'18:00','19:00','Service 1','dinner',1 FROM public.digiy_resa_resto_sites;
INSERT INTO public.digiy_resa_resto_service_windows(site_id,booking_from,booking_to,label,meal_period,service_no)
 SELECT id,'20:00','21:00','Service 2','dinner',2
 FROM public.digiy_resa_resto_sites WHERE slug='rotation-fake';
INSERT INTO public.digiy_resa_resto_tables(zone_id,label,seats)
 SELECT z.id,'T1',4 FROM public.digiy_resa_resto_zones z
 JOIN public.digiy_resa_resto_sites s ON s.id=z.site_id WHERE s.slug='rotation-fake';
INSERT INTO public.digiy_resa_resto_tables(zone_id,label,seats,is_joinable,join_group,sort_order)
 SELECT z.id,x.label,2,true,'A',x.ord
 FROM public.digiy_resa_resto_zones z
 JOIN public.digiy_resa_resto_sites s ON s.id=z.site_id
 CROSS JOIN (VALUES ('J1',10),('J2',20),('J3',30)) AS x(label,ord)
 WHERE s.slug='join-fake';
