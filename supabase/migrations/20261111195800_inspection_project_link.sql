alter table public.kb_tak_kontroller
  add column portal_project_id text references public.prosjekter(id) on delete set null;

create index kb_tak_kontroller_portal_project_idx
  on public.kb_tak_kontroller (portal_project_id);
