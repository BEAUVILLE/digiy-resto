-- RESTO V33 SQL CANDIDATE. NEVER AUTO DEPLOY / never call on DIGIY CORE without separate approval.
-- Intended only for the exact 2026-10-09 pre-V32 availability definition.
-- The still-open V32 PR also changes availability: if V32 lands first, this MUST fail
-- and be rebuilt from that new function, preserving its time-zone guard.
BEGIN;
SET LOCAL lock_timeout = '3s';
DO $preflight$
DECLARE v_oid oid;
BEGIN
  IF current_setting('digiy.v33_manual_go',true) IS DISTINCT FROM 'YES' THEN
    RAISE EXCEPTION 'RESTO_V33_MANUAL_SQL_GO_REQUIRED';
  END IF;
  v_oid := to_regprocedure('public.digiy_resa_resto_public_availability_v1(text,date,integer,text)');
  IF v_oid IS NULL THEN RAISE EXCEPTION 'RESTO_V33_FUNCTION_SIGNATURE_MISSING'; END IF;
  IF (SELECT md5(pg_get_functiondef(v_oid))) <> '7c64271f7460b312be95c60f555a249c' THEN
    RAISE EXCEPTION 'RESTO_V33_FUNCTION_DRIFT_REBASE_WITH_V32_REQUIRED';
  END IF;
  IF NOT EXISTS (
      SELECT 1 FROM pg_proc p
      WHERE p.oid=v_oid AND p.prosecdef AND pg_get_userbyid(p.proowner)='postgres'
        AND 'search_path=pg_catalog, public'=ANY(p.proconfig)
  ) THEN RAISE EXCEPTION 'RESTO_V33_OWNER_SEARCH_PATH_SECURITY_DRIFT'; END IF;
  IF NOT has_function_privilege('anon',v_oid,'EXECUTE') THEN
    RAISE EXCEPTION 'RESTO_V33_PUBLIC_AVAILABILITY_EXECUTE_MISSING'; END IF;
END
$preflight$;

CREATE OR REPLACE FUNCTION public.digiy_resa_resto_public_availability_v1(p_slug text, p_booking_date date, p_guests integer, p_zone_slug text)
 RETURNS TABLE(slot_time time without time zone, service_label text, available boolean, reason text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
declare
  v_site public.digiy_resa_resto_sites%rowtype;
  v_zone public.digiy_resa_resto_zones%rowtype;
  v_window public.digiy_resa_resto_service_windows%rowtype;
  v_isodow integer;
  v_used integer;
  v_has_table boolean;
  v_t time;
begin
  if p_booking_date is null or p_guests is null or p_guests < 1 or p_guests > 30 then
    raise exception 'Paramètres de disponibilité invalides';
  end if;

  select * into v_site
  from public.digiy_resa_resto_sites
  where slug = p_slug and is_active = true;
  if not found then raise exception 'Restaurant indisponible'; end if;

  select * into v_zone
  from public.digiy_resa_resto_zones
  where site_id = v_site.id and slug = p_zone_slug and is_active = true;
  if not found then raise exception 'Zone indisponible'; end if;

  v_isodow := extract(isodow from p_booking_date)::integer;

  if v_isodow = any(v_site.closed_weekdays) then
    return;
  end if;

  for v_window in
    select *
    from public.digiy_resa_resto_service_windows
    where site_id = v_site.id
      and is_active = true
      and v_isodow = any(weekdays)
    order by booking_from
  loop
    select coalesce(sum(b.guests),0)::integer into v_used
    from public.digiy_resa_resto_bookings b
    where b.site_id = v_site.id
      and b.zone_id = v_zone.id
      and b.booking_date = p_booking_date
      and b.service_window_id = v_window.id
      and b.status in ('confirmed','arrived');

    v_has_table := true;

    if v_site.table_plan_enabled then
      select exists(
        select 1
        from public.digiy_resa_resto_tables t
        where t.zone_id = v_zone.id
          and t.is_active = true
          and t.seats >= p_guests
          and not exists (
            select 1
            from public.digiy_resa_resto_booking_tables bt
            join public.digiy_resa_resto_bookings b on b.id = bt.booking_id
            where bt.table_id = t.id
              and b.booking_date = p_booking_date
              and b.service_window_id = v_window.id
              and b.status in ('confirmed','arrived')
          )
      ) or exists(
        select 1
        from public.digiy_resa_resto_tables t
        where t.zone_id = v_zone.id
          and t.is_active = true
          and t.is_joinable = true
          and t.join_group is not null
          and not exists (
            select 1
            from public.digiy_resa_resto_booking_tables bt
            join public.digiy_resa_resto_bookings b on b.id = bt.booking_id
            where bt.table_id = t.id
              and b.booking_date = p_booking_date
              and b.service_window_id = v_window.id
              and b.status in ('confirmed','arrived')
          )
        group by t.join_group
        having sum(t.seats) >= p_guests
      )
      into v_has_table;
    end if;

    v_t := v_window.booking_from;
    while v_t <= v_window.booking_to loop
      slot_time := v_t;
      service_label := v_window.label;
      available := (v_used + p_guests <= v_zone.max_covers) and v_has_table;
      reason := case
        when v_used + p_guests > v_zone.max_covers then 'complet'
        when not v_has_table then 'aucune table adaptée'
        else null
      end;
      return next;
      -- Stop before TIME arithmetic wraps past midnight; never restart at 00:00.
      exit when (v_t + interval '30 minutes') <= v_t;
      v_t := v_t + interval '30 minutes';
    end loop;
  end loop;
end;
$function$
;

DO $postcheck$
DECLARE v_oid oid;
BEGIN
  v_oid:='public.digiy_resa_resto_public_availability_v1(text,date,integer,text)'::regprocedure;
  IF NOT has_function_privilege('anon',v_oid,'EXECUTE')
  OR NOT EXISTS (SELECT 1 FROM pg_proc p WHERE p.oid=v_oid AND p.prosecdef
      AND 'search_path=pg_catalog, public'=ANY(p.proconfig)
      AND pg_get_userbyid(p.proowner)='postgres')
  OR position('exit when (v_t + interval ''30 minutes'') <= v_t;' IN pg_get_functiondef(v_oid))=0
  THEN RAISE EXCEPTION 'RESTO_V33_POSTCHECK_BROKEN'; END IF;
END
$postcheck$;
COMMIT;
