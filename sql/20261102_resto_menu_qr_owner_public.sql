
-- DIGIY RESTO : menu QR V1. À appliquer uniquement après sauvegarde et tests A/B.
-- Ne touche ni aux réservations ni aux tables existantes.
-- Les brouillons et la publication sont dans DEUX tables, pour éviter toute fuite via SELECT anon.
begin;

create table if not exists public.digiy_resto_qr_drafts (
  site_id uuid primary key references public.digiy_resa_resto_sites(id) on delete cascade,
  content jsonb not null default '{"title":"","intro":"","currency":"XOF","phone":"","sections":[]}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint resto_qr_draft_shape check (
    jsonb_typeof(content) = 'object'
    and jsonb_typeof(content -> 'sections') = 'array'
    and octet_length(content::text) <= 60000
  )
);

create table if not exists public.digiy_resto_qr_public (
  site_id uuid primary key references public.digiy_resa_resto_sites(id) on delete cascade,
  slug text not null unique
    check (slug ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  content jsonb not null,
  published boolean not null default false,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint resto_qr_public_shape check (
    jsonb_typeof(content) = 'object'
    and jsonb_typeof(content -> 'sections') = 'array'
    and octet_length(content::text) <= 60000
  )
);
create index if not exists digiy_resto_qr_public_slug_idx on public.digiy_resto_qr_public(slug);

alter table public.digiy_resto_qr_drafts enable row level security;
alter table public.digiy_resto_qr_public enable row level security;

revoke all on table public.digiy_resto_qr_drafts from public, anon, authenticated;
revoke all on table public.digiy_resto_qr_public from public, anon, authenticated;
grant select, insert, update on table public.digiy_resto_qr_drafts to authenticated;
grant select on table public.digiy_resto_qr_public to anon, authenticated;
grant insert, update on table public.digiy_resto_qr_public to authenticated;

-- Le rôle connecté seul ne suffit jamais : contrôle de propriétaire réel par auth.uid().
create policy "resto qr draft owner read"
on public.digiy_resto_qr_drafts for select to authenticated
using (exists (
  select 1 from public.digiy_resa_resto_sites s
  where s.id = site_id and s.owner_id = (select auth.uid()) and s.is_active
));
create policy "resto qr draft owner create"
on public.digiy_resto_qr_drafts for insert to authenticated
with check (exists (
  select 1 from public.digiy_resa_resto_sites s
  where s.id = site_id and s.owner_id = (select auth.uid()) and s.is_active
));
create policy "resto qr draft owner update"
on public.digiy_resto_qr_drafts for update to authenticated
using (exists (
  select 1 from public.digiy_resa_resto_sites s
  where s.id = site_id and s.owner_id = (select auth.uid()) and s.is_active
))
with check (exists (
  select 1 from public.digiy_resa_resto_sites s
  where s.id = site_id and s.owner_id = (select auth.uid()) and s.is_active
));

-- Les visiteurs anonymes n'accèdent QU'à la version publiquement publiée.
create policy "resto qr published customer read"
on public.digiy_resto_qr_public for select to anon, authenticated
using (published = true);
create policy "resto qr published owner read"
on public.digiy_resto_qr_public for select to authenticated
using (exists (
  select 1 from public.digiy_resa_resto_sites s
  where s.id = site_id and s.owner_id = (select auth.uid()) and s.is_active
));
create policy "resto qr published owner insert"
on public.digiy_resto_qr_public for insert to authenticated
with check (exists (
  select 1 from public.digiy_resa_resto_sites s
  where s.id = site_id and s.slug = slug
    and s.owner_id = (select auth.uid()) and s.is_active
));
create policy "resto qr published owner update"
on public.digiy_resto_qr_public for update to authenticated
using (exists (
  select 1 from public.digiy_resa_resto_sites s
  where s.id = site_id and s.owner_id = (select auth.uid()) and s.is_active
))
with check (exists (
  select 1 from public.digiy_resa_resto_sites s
  where s.id = site_id and s.slug = slug
    and s.owner_id = (select auth.uid()) and s.is_active
));
commit;
