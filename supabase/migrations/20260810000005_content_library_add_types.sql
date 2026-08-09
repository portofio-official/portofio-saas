-- Extend Content Library types with Experience, Education, Publications, and Media.
-- Existing types (project, testimonial, certificate, caseStudy, gallery) are preserved;
-- caseStudy and gallery stay selectable in the item form but are not surfaced as
-- sidebar sub-items.

alter table public.content_library drop constraint if exists content_library_content_type_check;
alter table public.content_library add constraint content_library_content_type_check
  check (content_type in (
    'project', 'testimonial', 'certificate',
    'experience', 'education', 'publication', 'media',
    'caseStudy', 'gallery'
  ));

-- The user-scoped ordering index already covers (user_id, content_type, ...),
-- so the new types need no index changes.