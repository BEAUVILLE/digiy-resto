
-- Test RLS A/B ISOLÉ : PostgreSQL 17 sans réseau, sans production, sans données personnelles.
\set ON_ERROR_STOP on
create role anon nologin;
create role authenticated nologin;
create schema auth;
create function auth.uid() returns uuid language sql stable
as 'select nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';
grant usage on schema auth, public to anon, authenticated;
grant execute on function auth.uid() to authenticated, anon;

create table public.digiy_resa_resto_sites(
 id uuid primary key, slug text not null unique,
 display_name text not null, owner_id uuid, is_active boolean not null default true
);
alter table public.digiy_resa_resto_sites enable row level security;
grant select on public.digiy_resa_resto_sites to authenticated;
create policy "mock site owner" on public.digiy_resa_resto_sites
 for select to authenticated using (owner_id = (select auth.uid()));

insert into public.digiy_resa_resto_sites(id,slug,display_name,owner_id,is_active) values
 ('11111111-1111-4111-8111-111111111111','le-malraux-sarlat','Restaurant A','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true),
 ('22222222-2222-4222-8222-222222222222','entre2-sarlat','Restaurant B','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true),
 ('33333333-3333-4333-8333-333333333333','sans-owner','Sans propriétaire',null,true);

\ir ../../sql/20261102_resto_menu_qr_owner_public.sql

-- Le même compte Auth ne peut gérer les deux restaurants réels.
-- Aucun changement permanent ne se produit pendant ce test d'échec.
do $test$
declare owner_after uuid;
begin
  begin
    update public.digiy_resa_resto_sites
    set owner_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    where slug='entre2-sarlat';
    raise exception 'Deux restaurants réels ont accepté le même compte propriétaire';
  exception when unique_violation then
    null; -- succès : l'index d'indépendance protège la gestion
  end;
  select owner_id into owner_after from public.digiy_resa_resto_sites
    where slug='entre2-sarlat';
  if owner_after <> 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' then
    raise exception 'Le propriétaire B a été remplacé durant le test';
  end if;
end $test$;

-- Owner A prépare et publie une version.
set role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
insert into public.digiy_resto_qr_drafts(site_id,content)
 values('11111111-1111-4111-8111-111111111111',
 '{"title":"A","currency":"XOF","sections":[{"name":"Plats","items":[{"name":"Riz","price":2500}]}]}'::jsonb);
insert into public.digiy_resto_qr_public(site_id,slug,content,published,published_at)
 select site_id,'le-malraux-sarlat',content,true,now() from public.digiy_resto_qr_drafts;
-- Changer le brouillon ne modifie PAS la publication.
update public.digiy_resto_qr_drafts set content=
 '{"title":"BROUILLON SECRET A","sections":[]}'::jsonb
 where site_id='11111111-1111-4111-8111-111111111111';
do $test$
declare title text;
begin
 select content->>'title' into title from public.digiy_resto_qr_public
 where site_id='11111111-1111-4111-8111-111111111111';
 if title <> 'A' then raise exception 'Brouillon divulgué dans la publication'; end if;
end $test$;

-- B peut consulter les menus publiés comme visiteur, pas les brouillons privés A.
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',false);
do $test$
declare n int;
begin
 select count(*) into n from public.digiy_resto_qr_drafts;
 if n <> 0 then raise exception 'B lit le brouillon A'; end if;
 update public.digiy_resto_qr_drafts set content='{"title":"attaque","sections":[]}'::jsonb
  where site_id='11111111-1111-4111-8111-111111111111';
 get diagnostics n = row_count;
 if n <> 0 then raise exception 'B modifie le brouillon A'; end if;
 update public.digiy_resto_qr_public set published=false
  where site_id='11111111-1111-4111-8111-111111111111';
 get diagnostics n = row_count;
 if n <> 0 then raise exception 'B masque la carte A'; end if;
end $test$;
do $test$
begin
 begin
  insert into public.digiy_resto_qr_drafts(site_id,content)
  values('33333333-3333-4333-8333-333333333333',
   '{"title":"attaque","sections":[]}'::jsonb);
  raise exception 'B a inséré chez un site sans propriétaire';
 exception when insufficient_privilege then null;
 end;
 begin
  insert into public.digiy_resto_qr_public(site_id,slug,content,published)
  values('22222222-2222-4222-8222-222222222222',
   'fake-slug','{"title":"B","sections":[]}'::jsonb,true);
  raise exception 'B publie sous un slug usurpé';
 exception when insufficient_privilege then null;
 end;
end $test$;
-- B peut publier sa propre fiche, d'abord en version masquée.
insert into public.digiy_resto_qr_drafts(site_id,content)
 values('22222222-2222-4222-8222-222222222222','{"title":"B","sections":[]}'::jsonb);
insert into public.digiy_resto_qr_public(site_id,slug,content,published)
 values('22222222-2222-4222-8222-222222222222','entre2-sarlat','{"title":"B","sections":[]}'::jsonb,false);

-- Anonyme ne possède aucune permission de lecture sur les brouillons.
reset role;
set role anon;
select set_config('request.jwt.claim.sub','',false);
do $test$
declare n int;
begin
 if has_table_privilege(current_user,'public.digiy_resto_qr_drafts','select') then
  raise exception 'anon a le droit SELECT sur les brouillons';
 end if;
 select count(*) into n from public.digiy_resto_qr_public;
 if n<>1 then raise exception 'anon doit voir A publié, mais ni B masqué ni drafts, obtenu %',n; end if;
end $test$;
-- A masque la carte, elle disparaît pour anon.
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',false);
update public.digiy_resto_qr_public set published=false
 where site_id='11111111-1111-4111-8111-111111111111';
reset role;
set role anon;
select set_config('request.jwt.claim.sub','',false);
do $test$
declare n int;
begin
 select count(*) into n from public.digiy_resto_qr_public;
 if n<>0 then raise exception 'anon voit un menu masqué'; end if;
end $test$;
reset role;
select 'RESTO QR A/B ISOLÉ : OK' as result;
