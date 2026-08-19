begin;

create table public.workbook_inspections (
  id uuid primary key default gen_random_uuid(),
  source_upload_id uuid not null unique references public.source_uploads(id) on delete restrict,
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  inspected_by uuid not null references auth.users(id) on delete restrict,
  inspector_version text not null check (length(inspector_version) between 1 and 40),
  sheets jsonb not null check (jsonb_typeof(sheets) = 'array' and jsonb_array_length(sheets) between 1 and 100),
  warnings jsonb not null default '[]'::jsonb check (jsonb_typeof(warnings) = 'array'),
  created_at timestamptz not null default now()
);

create index workbook_inspections_organisation_id_idx
on public.workbook_inspections (organisation_id);

create index workbook_inspections_inspected_by_idx
on public.workbook_inspections (inspected_by);

revoke all on public.workbook_inspections from anon, authenticated;
grant select, insert on public.workbook_inspections to authenticated;

alter table public.workbook_inspections enable row level security;

create policy "operators view workbook inspections"
on public.workbook_inspections for select to authenticated
using (exists (
  select 1 from public.organisation_memberships m
  where m.organisation_id = workbook_inspections.organisation_id
    and m.user_id = (select auth.uid())
    and m.status = 'active'
    and m.role in ('operator', 'manager')
));

create policy "operators record workbook inspections"
on public.workbook_inspections for insert to authenticated
with check (
  inspected_by = (select auth.uid())
  and exists (
    select 1
    from public.source_uploads su
    join public.organisation_memberships m on m.organisation_id = su.organisation_id
    where su.id = workbook_inspections.source_upload_id
      and su.organisation_id = workbook_inspections.organisation_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role in ('operator', 'manager')
  )
);

commit;
