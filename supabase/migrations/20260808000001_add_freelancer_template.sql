-- Migration: B-2 add freelancer template to active templates table
-- The freelancer template exists in registry.tsx but was missing from the initial seed,
-- causing it to be hidden in gallery (gallery filters by activeTemplateIds.includes(id)).

insert into public.templates (id, name, is_active)
values ('freelancer', 'Freelancer', true)
on conflict (id) do update set is_active = true, name = 'Freelancer';
