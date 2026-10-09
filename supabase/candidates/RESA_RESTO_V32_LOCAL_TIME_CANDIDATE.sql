-- RESTO V32 SQL CANDIDATE — NEVER AUTO DEPLOY. No data mutation by script.
-- Explicit manual GO is required even in a private isolated replay.
-- V31 owner ACL work is separate; preserve public anonymous reservation access.
BEGIN;
SET LOCAL lock_timeout = '3s';
DO $preflight$
DECLARE v_proc oid; v_hash text; v_expected text; v_sig text;
BEGIN
 IF current_setting('digiy.v32_manual_go',true) IS DISTINCT FROM 'YES' THEN
    RAISE EXCEPTION 'RESTO_V32_EXPLICIT_MANUAL_GO_REQUIRED';
 END IF;
 FOR v_sig,v_expected IN
 SELECT * FROM (VALUES
   ('public.digiy_resa_resto_public_book_v1(text,date,time without time zone,integer,text,text,text)','8f9778e927528eeb3b42e2f651037bac'),
   ('public.digiy_resa_resto_public_availability_v1(text,date,integer,text)','7c64271f7460b312be95c60f555a249c')
 ) AS expected(sig,baseline_md5)
 LOOP
   v_proc:=to_regprocedure(v_sig);
   IF v_proc IS NULL THEN RAISE EXCEPTION 'RESTO_V32_SIGNATURE_MISSING_%',v_sig; END IF;
   SELECT md5(pg_get_functiondef(v_proc)) INTO v_hash;
   IF v_hash<>v_expected THEN RAISE EXCEPTION 'RESTO_V32_CODE_DRIFT_%_GOT_%',v_sig,v_hash; END IF;
   IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE oid=v_proc AND prosecdef=true) THEN
     RAISE EXCEPTION 'RESTO_V32_SECURITY_DEFINER_DRIFT_%',v_sig;
   END IF;
   IF NOT has_function_privilege('anon',v_proc,'EXECUTE') THEN
     RAISE EXCEPTION 'RESTO_V32_PUBLIC_BOOKING_PERMISSION_MISSING_%',v_sig;
   END IF;
 END LOOP;
END
$preflight$;

CREATE OR REPLACE FUNCTION public.digiy_resa_resto_public_book_v1(p_slug text, p_booking_date date, p_booking_time time without time zone, p_guests integer, p_zone_slug text, p_customer_name text, p_customer_phone text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_site public.digiy_resa_resto_sites%rowtype;
  v_zone public.digiy_resa_resto_zones%rowtype;
  v_window public.digiy_resa_resto_service_windows%rowtype;
  v_used integer := 0;
  v_booking_id uuid;
  v_starts_at timestamptz;
  v_expires_at timestamptz;
  v_single uuid;
  v_single_label text;
  v_group text;
  v_sum integer := 0;
  v_rec record;
  v_table_ids uuid[] := array[]::uuid[];
  v_table_labels text[] := array[]::text[];
  v_isodow integer;
begin
  if p_booking_date is null or p_booking_time is null or p_guests is null or p_guests < 1 or p_guests > 30 then
    raise exception 'Paramètres de réservation invalides';
  end if;
  if length(trim(coalesce(p_customer_name,''))) < 2 then raise exception 'Nom client requis'; end if;
  if length(trim(coalesce(p_customer_phone,''))) < 6 then raise exception 'Téléphone client requis'; end if;

  select * into v_site
  from public.digiy_resa_resto_sites
  where slug=p_slug and is_active=true;
  if not found then raise exception 'Restaurant indisponible'; end if;

  -- V32: compare restaurant-local wall clock, never the browser/UTC clock.
  if (p_booking_date + p_booking_time) <= (clock_timestamp() at time zone v_site.timezone) then
    raise exception 'Date ou heure de réservation passée';
  end if;

  v_isodow := extract(isodow from p_booking_date)::integer;
  if v_isodow = any(v_site.closed_weekdays) then
    raise exception 'Restaurant fermé ce jour';
  end if;

  select * into v_zone
  from public.digiy_resa_resto_zones
  where site_id=v_site.id and slug=p_zone_slug and is_active=true;
  if not found then raise exception 'Zone indisponible'; end if;

  select * into v_window
  from public.digiy_resa_resto_service_windows
  where site_id=v_site.id
    and is_active=true
    and v_isodow = any(weekdays)
    and p_booking_time between booking_from and booking_to
  order by booking_from desc
  limit 1;
  if not found then raise exception 'Horaire non réservable'; end if;

  perform pg_advisory_xact_lock(hashtextextended(v_site.id::text||p_booking_date::text||v_window.id::text||v_zone.id::text,0));
  -- Recheck after waiting on the contention lock; the slot may expire while queued.
  -- V32: compare restaurant-local wall clock, never the browser/UTC clock.
  if (p_booking_date + p_booking_time) <= (clock_timestamp() at time zone v_site.timezone) then
    raise exception 'Date ou heure de réservation passée';
  end if;
  perform public.digiy_resa_resto_release_no_shows_v1(v_site.id);

  select coalesce(sum(b.guests),0)::integer into v_used
  from public.digiy_resa_resto_bookings b
  where b.site_id=v_site.id and b.zone_id=v_zone.id
    and b.booking_date=p_booking_date and b.service_window_id=v_window.id
    and b.status in ('confirmed','arrived');

  if v_used + p_guests > v_zone.max_covers then
    raise exception 'Capacité de zone insuffisante';
  end if;

  if v_site.table_plan_enabled then
    select t.id, t.label into v_single, v_single_label
    from public.digiy_resa_resto_tables t
    where t.zone_id=v_zone.id and t.is_active=true and t.seats >= p_guests
      and not exists (
        select 1 from public.digiy_resa_resto_booking_tables bt
        join public.digiy_resa_resto_bookings b on b.id=bt.booking_id
        where bt.table_id=t.id and b.booking_date=p_booking_date
          and b.service_window_id=v_window.id and b.status in ('confirmed','arrived')
      )
    order by t.seats asc, t.sort_order, t.label
    limit 1;

    if v_single is not null then
      v_table_ids := array[v_single];
      v_table_labels := array[v_single_label];
    else
      select t.join_group into v_group
      from public.digiy_resa_resto_tables t
      where t.zone_id=v_zone.id and t.is_active=true and t.is_joinable=true and t.join_group is not null
        and not exists (
          select 1 from public.digiy_resa_resto_booking_tables bt
          join public.digiy_resa_resto_bookings b on b.id=bt.booking_id
          where bt.table_id=t.id and b.booking_date=p_booking_date
            and b.service_window_id=v_window.id and b.status in ('confirmed','arrived')
        )
      group by t.join_group
      having sum(t.seats) >= p_guests
      order by sum(t.seats) asc
      limit 1;

      if v_group is null then raise exception 'Aucune table disponible pour ce nombre de personnes'; end if;

      for v_rec in
        select t.id, t.label, t.seats
        from public.digiy_resa_resto_tables t
        where t.zone_id=v_zone.id and t.is_active=true and t.is_joinable=true and t.join_group=v_group
          and not exists (
            select 1 from public.digiy_resa_resto_booking_tables bt
            join public.digiy_resa_resto_bookings b on b.id=bt.booking_id
            where bt.table_id=t.id and b.booking_date=p_booking_date
              and b.service_window_id=v_window.id and b.status in ('confirmed','arrived')
          )
        order by t.seats desc, t.sort_order, t.label
      loop
        exit when v_sum >= p_guests;
        v_table_ids := array_append(v_table_ids, v_rec.id);
        v_table_labels := array_append(v_table_labels, v_rec.label);
        v_sum := v_sum + v_rec.seats;
      end loop;
      if v_sum < p_guests then raise exception 'Aucune combinaison de tables disponible'; end if;
    end if;
  end if;

  v_starts_at := (p_booking_date::timestamp + p_booking_time) at time zone v_site.timezone;
  v_expires_at := v_starts_at + make_interval(mins => v_site.no_show_grace_minutes);

  insert into public.digiy_resa_resto_bookings(
    site_id,zone_id,service_window_id,booking_date,booking_time,starts_at,expires_at,
    customer_name,customer_phone,guests,status
  ) values (
    v_site.id,v_zone.id,v_window.id,p_booking_date,p_booking_time,v_starts_at,v_expires_at,
    trim(p_customer_name),trim(p_customer_phone),p_guests,'confirmed'
  ) returning id into v_booking_id;

  if coalesce(array_length(v_table_ids,1),0) > 0 then
    insert into public.digiy_resa_resto_booking_tables(booking_id,table_id)
    select v_booking_id, unnest(v_table_ids);
  end if;

  if v_site.fixed_services_enabled and v_site.table_plan_enabled and v_window.service_no=2 and coalesce(array_length(v_table_ids,1),0) > 0 then
    update public.digiy_resa_resto_bookings b1
    set rotation_required=true,
        release_by=least(coalesce(b1.release_by,v_starts_at),v_starts_at),
        updated_at=now()
    where b1.site_id=v_site.id
      and b1.booking_date=p_booking_date
      and b1.status in ('confirmed','arrived')
      and exists (
        select 1
        from public.digiy_resa_resto_booking_tables bt1
        join public.digiy_resa_resto_booking_tables bt2 on bt2.table_id=bt1.table_id
        where bt1.booking_id=b1.id and bt2.booking_id=v_booking_id
      )
      and exists (
        select 1 from public.digiy_resa_resto_service_windows w1
        where w1.id=b1.service_window_id and w1.meal_period=v_window.meal_period and w1.service_no=1
      );
  end if;

  return jsonb_build_object(
    'ok',true,
    'booking_id',v_booking_id,
    'status','confirmed',
    'zone',v_zone.name,
    'tables',to_jsonb(v_table_labels),
    'service',v_window.label,
    'no_show_grace_minutes',v_site.no_show_grace_minutes,
    'table_plan_enabled',v_site.table_plan_enabled,
    'fixed_services_enabled',v_site.fixed_services_enabled,
    'rotation_rule',case when v_site.fixed_services_enabled and v_site.table_plan_enabled and v_window.service_no=1 then 'La libération avant le service suivant ne s’applique que si cette table est ensuite réservée.' else null end
  );
end;
$function$;

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
      available := (v_used + p_guests <= v_zone.max_covers) and v_has_table
                   and ((p_booking_date + v_t) > (clock_timestamp() at time zone v_site.timezone));
      reason := case
        when (p_booking_date + v_t) <= (clock_timestamp() at time zone v_site.timezone)
          then 'créneau passé'
        when v_used + p_guests > v_zone.max_covers then 'complet'
        when not v_has_table then 'aucune table adaptée'
        else null
      end;
      return next;
      v_t := v_t + interval '30 minutes';
    end loop;
  end loop;
end;
$function$;
DO $postcheck$
BEGIN
  IF NOT has_function_privilege('anon',
  'public.digiy_resa_resto_public_book_v1(text,date,time without time zone,integer,text,text,text)','EXECUTE')
  OR NOT has_function_privilege('anon',
  'public.digiy_resa_resto_public_availability_v1(text,date,integer,text)','EXECUTE') THEN
    RAISE EXCEPTION 'RESTO_V32_PUBLIC_ACCESS_BROKEN';
  END IF;
  IF NOT EXISTS (
     SELECT 1 FROM pg_proc p WHERE p.oid='public.digiy_resa_resto_public_book_v1(text,date,time without time zone,integer,text,text,text)'::regprocedure
     AND p.prosecdef AND 'search_path=public'=ANY(p.proconfig)
     AND pg_get_functiondef(p.oid) LIKE '%clock_timestamp() at time zone v_site.timezone%')
  THEN RAISE EXCEPTION 'RESTO_V32_BOOKING_TIME_GUARD_MISSING'; END IF;
END
$postcheck$;
COMMIT;
