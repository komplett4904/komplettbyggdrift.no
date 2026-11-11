alter table public.kb_tak_kontroller
  add column checklist_type text not null default 'tak-rehabilitering';

grant select, insert, update on public.kb_tak_kontroller to authenticated;

create index kb_tak_kontroller_type_updated_idx
  on public.kb_tak_kontroller (checklist_type, updated_at desc);

create policy inspection_project_access on public.kb_tak_kontroller
  as restrictive for all to authenticated
  using ((select public.kb_employee_access()) and (
  (select public.kb_is_admin()) or exists (
    select 1 from public.kb_access
    where email = (select kb_private.own_email()) and active and 'projects' = any(modules)
  )
))
  with check ((select public.kb_employee_access()) and (
  (select public.kb_is_admin()) or exists (
    select 1 from public.kb_access
    where email = (select kb_private.own_email()) and active and 'projects' = any(modules)
  )
));

create policy inspection_attachment_project_access on storage.objects
  as restrictive for all to authenticated
  using (bucket_id <> 'kb-tak-vedlegg' or ((select public.kb_employee_access()) and (
  (select public.kb_is_admin()) or exists (
    select 1 from public.kb_access
    where email = (select kb_private.own_email()) and active and 'projects' = any(modules)
  )
)))
  with check (bucket_id <> 'kb-tak-vedlegg' or ((select public.kb_employee_access()) and (
  (select public.kb_is_admin()) or exists (
    select 1 from public.kb_access
    where email = (select kb_private.own_email()) and active and 'projects' = any(modules)
  )
)));
