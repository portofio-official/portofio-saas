-- Migration: Add profile_synced_at to projects table
-- Tracks when workspace_profile was last synced to this project's draft content.

alter table public.projects
  add column if not exists profile_synced_at timestamptz default now();
