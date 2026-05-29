-- Add conversion segment columns to orders table
alter table public.orders
  add column if not exists stats_bar  jsonb not null default '[]',
  add column if not exists usp        jsonb not null default '[]',
  add column if not exists pakej      jsonb not null default '[]',
  add column if not exists testimoni  jsonb not null default '[]',
  add column if not exists faq        jsonb not null default '[]';
