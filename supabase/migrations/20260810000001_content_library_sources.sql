-- Make Content Library the workspace's canonical source for reusable template content.
-- Existing rows remain valid and are treated as active project items.

alter table public.content_library add column if not exists content_type text not null default 'project';
alter table public.content_library add column if not exists is_active boolean not null default true;
alter table public.content_library add column if not exists sort_order integer not null default 0;
alter table public.content_library add column if not exists content_json jsonb not null default '{}'::jsonb;

update public.content_library
set content_json = jsonb_build_object(
  'title', title,
  'description', description,
  'imageUrl', image_url,
  'link', link
)
where content_json = '{}'::jsonb;

alter table public.content_library drop constraint if exists content_library_content_type_check;
alter table public.content_library add constraint content_library_content_type_check
  check (content_type in ('project', 'testimonial', 'certificate', 'caseStudy', 'gallery'));

create index if not exists content_library_type_order_idx
  on public.content_library(workspace_id, content_type, is_active, sort_order);
