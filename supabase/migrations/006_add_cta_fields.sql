-- supabase/migrations/006_add_cta_fields.sql
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cta_button_text TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cta_subtext    TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cta_wa_message TEXT;
