begin;

create type public.membership_role as enum ('operator', 'manager', 'client_viewer');
create type public.membership_status as enum ('active', 'suspended');
create type public.source_upload_status as enum ('stored', 'inspection_requested', 'failed');

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (length(trim(display_name)) between 1 and 160),
  created_at timestamptz not null default now()
);

create table public.organisation_memberships (
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.membership_role not null,
  status public.membership_status not null default 'active',
  created_at timestamptz not null default now(),
  primary key (organisation_id, user_id)
);

create table public.source_uploads (
  id uuid primary key,
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  original_filename text not null check (original_filename ~* '[.]xlsx$'),
  storage_path text not null unique,
  byte_size bigint not null check (byte_size > 0 and byte_size <= 20971520),
  mime_type text,
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  status public.source_upload_status not null default 'stored',
  created_at timestamptz not null default now(),
  unique (organisation_id, sha256)
);

revoke all on public.organisations, public.organisation_memberships, public.source_uploads from anon, authenticated;
grant select on public.organisations, public.organisation_memberships to authenticated;
grant select, insert on public.source_uploads to authenticated;

alter table public.organisations enable row level security;
alter table public.organisation_memberships enable row level security;
alter table public.source_uploads enable row level security;

create policy "members view their organisations"
on public.organisations for select to authenticated
using (exists (
  select 1 from public.organisation_memberships m
  where m.organisation_id = organisations.id and m.user_id = (select auth.uid()) and m.status = 'active'
));

create policy "members view their membership"
on public.organisation_memberships for select to authenticated
using (user_id = (select auth.uid()) and status = 'active');

create policy "members view organisation uploads"
on public.source_uploads for select to authenticated
using (exists (
  select 1 from public.organisation_memberships m
  where m.organisation_id = source_uploads.organisation_id and m.user_id = (select auth.uid()) and m.status = 'active'
));

create policy "operators record own uploads"
on public.source_uploads for insert to authenticated
with check (
  uploaded_by = (select auth.uid())
  and storage_path like organisation_id::text || '/' || id::text || '/%'
  and exists (
    select 1 from public.organisation_memberships m
    where m.organisation_id = source_uploads.organisation_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role in ('operator', 'manager')
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'itad-source-files',
  'itad-source-files',
  false,
  20971520,
  array['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "members read organisation source files"
on storage.objects for select to authenticated
using (
  bucket_id = 'itad-source-files'
  and exists (
    select 1 from public.organisation_memberships m
    where m.organisation_id::text = (storage.foldername(name))[1]
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role in ('operator', 'manager')
  )
);

create policy "operators upload immutable source files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'itad-source-files'
  and storage.extension(name) = 'xlsx'
  and array_length(storage.foldername(name), 1) = 2
  and owner_id = (select auth.uid()::text)
  and exists (
    select 1 from public.organisation_memberships m
    where m.organisation_id::text = (storage.foldername(name))[1]
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role in ('operator', 'manager')
  )
);

commit;
