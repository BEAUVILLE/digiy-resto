-- RESTO isolated CI only. Actual definitions snapshotted via pg_get_functiondef on 2026-10-09.
-- SQL source only, NO CUSTOMER OR PRODUCTION DATA. Do not deploy this fixture.
-- Functions: digiy_resa_resto_public_availability_v1, digiy_resa_resto_public_book_v1, digiy_resa_resto_recalc_rotation_v1, digiy_resa_resto_release_no_shows_v1.

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
      v_t := v_t + interval '30 minutes';
    end loop;
  end loop;
end;
$function$;

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

CREATE OR REPLACE FUNCTION public.digiy_resa_resto_recalc_rotation_v1(p_site_id uuid, p_day date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_fixed boolean;
  v_plan boolean;
begin
  select fixed_services_enabled,table_plan_enabled into v_fixed,v_plan
  from public.digiy_resa_resto_sites where id=p_site_id;

  update public.digiy_resa_resto_bookings b1
  set rotation_required=false, release_by=null, updated_at=now()
  where b1.site_id=p_site_id and b1.booking_date=p_day
    and exists (
      select 1 from public.digiy_resa_resto_service_windows w1
      where w1.id=b1.service_window_id and w1.service_no=1
    );

  if not coalesce(v_fixed,false) or not coalesce(v_plan,false) then
    return;
  end if;

  update public.digiy_resa_resto_bookings b1
  set rotation_required=true,
      release_by=(
        select min(b2.starts_at)
        from public.digiy_resa_resto_bookings b2
        join public.digiy_resa_resto_service_windows w2 on w2.id=b2.service_window_id
        where b2.site_id=b1.site_id and b2.booking_date=b1.booking_date
          and b2.status in ('confirmed','arrived') and w2.service_no=2
          and exists (
            select 1
            from public.digiy_resa_resto_booking_tables bt1
            join public.digiy_resa_resto_booking_tables bt2 on bt2.table_id=bt1.table_id
            where bt1.booking_id=b1.id and bt2.booking_id=b2.id
          )
      ),
      updated_at=now()
  where b1.site_id=p_site_id and b1.booking_date=p_day
    and b1.status in ('confirmed','arrived')
    and exists (
      select 1 from public.digiy_resa_resto_service_windows w1
      where w1.id=b1.service_window_id and w1.service_no=1
    )
    and exists (
      select 1
      from public.digiy_resa_resto_bookings b2
      join public.digiy_resa_resto_service_windows w2 on w2.id=b2.service_window_id
      where b2.site_id=b1.site_id and b2.booking_date=b1.booking_date
        and b2.status in ('confirmed','arrived') and w2.service_no=2
        and exists (
          select 1
          from public.digiy_resa_resto_booking_tables bt1
          join public.digiy_resa_resto_booking_tables bt2 on bt2.table_id=bt1.table_id
          where bt1.booking_id=b1.id and bt2.booking_id=b2.id
        )
    );
end;
$function$;

CREATE OR REPLACE FUNCTION public.digiy_resa_resto_release_no_shows_v1(p_site_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_count integer;
begin
  update public.digiy_resa_resto_bookings
  set status='no_show_released', updated_at=now()
  where site_id=p_site_id
    and status='confirmed'
    and expires_at < now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$function$;
