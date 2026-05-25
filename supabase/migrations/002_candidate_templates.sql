-- supabase/migrations/002_candidate_templates.sql
alter table public.candidate_briefs
  add column if not exists template_id       text    not null default 'T1',
  add column if not exists galeri_urls       jsonb   not null default '[]',
  add column if not exists testimoni         jsonb   not null default '[]',
  add column if not exists ai_copy           jsonb   not null default '{}',
  add column if not exists umur              integer,
  add column if not exists bilangan_anak     integer,
  add column if not exists tahun_pengalaman  integer,
  add column if not exists nama_syarikat     text;
