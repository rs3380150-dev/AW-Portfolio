-- Achyut Wadhwa portfolio CMS
-- Run this migration in the Supabase SQL editor once per project.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Administrator',
  created_at timestamptz not null default now()
);

create table if not exists public.content_sections (
  section_key text primary key,
  content jsonb not null default '{}'::jsonb,
  revision integer not null default 1,
  published_at timestamptz not null default now(),
  published_by uuid references auth.users(id)
);

create table if not exists public.content_drafts (
  section_key text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  section_key text not null,
  content jsonb not null,
  revision integer not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  storage_path text not null unique,
  public_url text not null,
  mime_type text,
  size_bytes bigint,
  alt_text text default '',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  service text,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.content_sections enable row level security;
alter table public.content_drafts enable row level security;
alter table public.content_versions enable row level security;
alter table public.media_assets enable row level security;
alter table public.contact_submissions enable row level security;

drop policy if exists "Public can read published content" on public.content_sections;
create policy "Public can read published content"
on public.content_sections for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage published content" on public.content_sections;
create policy "Admins manage published content"
on public.content_sections for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage drafts" on public.content_drafts;
create policy "Admins manage drafts"
on public.content_drafts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins read versions" on public.content_versions;
create policy "Admins read versions"
on public.content_versions for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins manage media metadata" on public.media_assets;
create policy "Admins manage media metadata"
on public.media_assets for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Anyone can submit contact form" on public.contact_submissions;
create policy "Anyone can submit contact form"
on public.contact_submissions for insert
to anon, authenticated
with check (char_length(name) between 1 and 120 and char_length(message) between 1 and 5000);

drop policy if exists "Admins manage submissions" on public.contact_submissions;
create policy "Admins manage submissions"
on public.contact_submissions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.publish_section(p_section_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  next_content jsonb;
  next_revision integer;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  select content into next_content
  from public.content_drafts
  where section_key = p_section_key;

  if next_content is null then
    raise exception 'No draft exists for section %', p_section_key;
  end if;

  select coalesce(revision, 0) + 1 into next_revision
  from public.content_sections
  where section_key = p_section_key;

  next_revision := coalesce(next_revision, 1);

  insert into public.content_sections (section_key, content, revision, published_at, published_by)
  values (p_section_key, next_content, next_revision, now(), auth.uid())
  on conflict (section_key) do update
  set content = excluded.content,
      revision = excluded.revision,
      published_at = excluded.published_at,
      published_by = excluded.published_by;

  insert into public.content_versions (section_key, content, revision, created_by)
  values (p_section_key, next_content, next_revision, auth.uid());
end;
$$;

revoke all on function public.publish_section(text) from public;
grant execute on function public.publish_section(text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view portfolio media" on storage.objects;
create policy "Public can view portfolio media"
on storage.objects for select
to public
using (bucket_id = 'media');

drop policy if exists "Admins upload portfolio media" on storage.objects;
create policy "Admins upload portfolio media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "Admins update portfolio media" on storage.objects;
create policy "Admins update portfolio media"
on storage.objects for update
to authenticated
using (bucket_id = 'media' and public.is_admin())
with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "Admins delete portfolio media" on storage.objects;
create policy "Admins delete portfolio media"
on storage.objects for delete
to authenticated
using (bucket_id = 'media' and public.is_admin());

grant select on public.content_sections to anon, authenticated;
grant insert on public.contact_submissions to anon, authenticated;
grant all on public.content_drafts, public.content_versions, public.media_assets to authenticated;
grant select, update, delete on public.contact_submissions to authenticated;
grant select on public.admin_users to authenticated;

