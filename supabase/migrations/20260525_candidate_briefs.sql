-- supabase/migrations/20260525_candidate_briefs.sql

CREATE TABLE public.candidate_briefs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  full_name         text NOT NULL,
  preferred_name    text,
  kawasan           text NOT NULL,
  kawasan_jenis     text NOT NULL DEFAULT 'DUN',
  parti_name        text NOT NULL,
  tagline           text,

  -- Assets (R2 URLs)
  photo_url         text,
  parti_logo_url    text,

  -- Content
  fokus             jsonb DEFAULT '[]',
  isu_kawasan       jsonb DEFAULT '[]',
  profil_ringkas    text,
  pencapaian        jsonb DEFAULT '[]',
  quote_peribadi    text,

  -- Social
  whatsapp          text,
  facebook_url      text,
  instagram_url     text,
  tiktok_url        text,

  -- Config
  subdomain         text UNIQUE,
  warna_utama       text DEFAULT '#1e3a5f',
  bahasa            text DEFAULT 'BM',

  -- Payment
  is_paid           boolean DEFAULT false,
  payment_method    text,
  paid_at           timestamptz,

  -- Status
  is_live           boolean DEFAULT false,
  revision_count    integer DEFAULT 0,
  notes             text,

  -- Timestamps
  submitted_at      timestamptz DEFAULT now(),
  live_at           timestamptz
);

-- Grants (required for Supabase PostgREST)
GRANT INSERT ON public.candidate_briefs TO anon;
GRANT ALL ON public.candidate_briefs TO authenticated;
GRANT ALL ON public.candidate_briefs TO service_role;

-- RLS
ALTER TABLE public.candidate_briefs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_candidate_briefs_subdomain_live ON public.candidate_briefs(subdomain, is_live);

-- Anon can submit forms
CREATE POLICY "Public can insert briefs"
  ON public.candidate_briefs FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated (admin) can do everything
CREATE POLICY "Admin can do everything"
  ON public.candidate_briefs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role can do everything (for server-side API routes)
CREATE POLICY "Service role full access"
  ON public.candidate_briefs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
