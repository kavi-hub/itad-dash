begin;

create function public.is_valid_workbook_inspection(payload jsonb, warning_list jsonb)
returns boolean
language sql
immutable
strict
set search_path = pg_catalog, public
as $$
  select
    jsonb_typeof(payload) = 'array'
    and jsonb_array_length(payload) between 1 and 100
    and not exists (
      select 1
      from jsonb_array_elements(payload) as item(sheet)
      where jsonb_typeof(sheet) is distinct from 'object'
        or not (sheet ?& array['name', 'rowCount', 'columnCount', 'headerRow', 'headers'])
        or sheet - array['name', 'rowCount', 'columnCount', 'headerRow', 'headers'] <> '{}'::jsonb
        or jsonb_typeof(sheet->'name') is distinct from 'string'
        or length(sheet->>'name') not between 1 and 160
        or coalesce(sheet->>'rowCount', '') !~ '^[0-9]{1,6}$'
        or (sheet->>'rowCount')::integer not between 0 and 200000
        or coalesce(sheet->>'columnCount', '') !~ '^[0-9]{1,5}$'
        or (sheet->>'columnCount')::integer not between 0 and 16384
        or not (
          jsonb_typeof(sheet->'headerRow') = 'null'
          or (
            coalesce(sheet->>'headerRow', '') ~ '^[0-9]{1,6}$'
            and (sheet->>'headerRow')::integer between 1 and 200000
          )
        )
        or jsonb_typeof(sheet->'headers') is distinct from 'array'
        or jsonb_array_length(sheet->'headers') > 100
        or exists (
          select 1 from jsonb_array_elements(sheet->'headers') as header(value)
          where jsonb_typeof(value) is distinct from 'string' or length(value #>> '{}') > 160
        )
    )
    and jsonb_typeof(warning_list) = 'array'
    and jsonb_array_length(warning_list) <= 100
    and not exists (
      select 1 from jsonb_array_elements(warning_list) as warning(value)
      where jsonb_typeof(value) is distinct from 'string' or length(value #>> '{}') > 300
    );
$$;

revoke all on function public.is_valid_workbook_inspection(jsonb, jsonb) from public;
grant execute on function public.is_valid_workbook_inspection(jsonb, jsonb) to authenticated;

create table public.workbook_inspections (
  id uuid primary key default gen_random_uuid(),
  source_upload_id uuid not null unique references public.source_uploads(id) on delete restrict,
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  inspected_by uuid not null references auth.users(id) on delete restrict,
  inspector_version text not null check (length(inspector_version) between 1 and 40),
  sheets jsonb not null,
  warnings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint workbook_inspections_structural_metadata_only
    check (public.is_valid_workbook_inspection(sheets, warnings))
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
