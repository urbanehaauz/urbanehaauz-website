-- Unified Rangotsav registrations table.
-- Replaces the separate rangotsav_notify and rangotsav_vendors tables with a
-- single row-per-signup shape keyed by (type, email).
--
-- Run this in Supabase SQL Editor, in order. It is idempotent.

-- 1) Table
CREATE TABLE IF NOT EXISTS public.rangotsav_registrations (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT         NOT NULL CHECK (type IN ('notify', 'vendor', 'volunteer')),
  email       TEXT         NOT NULL,
  name        TEXT,
  phone       TEXT,
  details     JSONB        NOT NULL DEFAULT '{}'::jsonb,
  status      TEXT         NOT NULL DEFAULT 'pending'
                                     CHECK (status IN ('pending', 'approved', 'rejected', 'confirmed')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (type, email)
);

-- 2) Indexes
CREATE INDEX IF NOT EXISTS idx_rangotsav_registrations_type
  ON public.rangotsav_registrations (type);
CREATE INDEX IF NOT EXISTS idx_rangotsav_registrations_status
  ON public.rangotsav_registrations (status);
CREATE INDEX IF NOT EXISTS idx_rangotsav_registrations_created_at
  ON public.rangotsav_registrations (created_at DESC);

-- 3) RLS
ALTER TABLE public.rangotsav_registrations ENABLE ROW LEVEL SECURITY;

-- Drop any prior policies (safe re-run)
DROP POLICY IF EXISTS "rangotsav_registrations_public_insert"  ON public.rangotsav_registrations;
DROP POLICY IF EXISTS "rangotsav_registrations_admin_select"   ON public.rangotsav_registrations;
DROP POLICY IF EXISTS "rangotsav_registrations_admin_update"   ON public.rangotsav_registrations;

-- Public (anon + authenticated) may insert new registrations.
CREATE POLICY "rangotsav_registrations_public_insert"
  ON public.rangotsav_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins may read.
CREATE POLICY "rangotsav_registrations_admin_select"
  ON public.rangotsav_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Only admins may update (status changes).
CREATE POLICY "rangotsav_registrations_admin_update"
  ON public.rangotsav_registrations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 4) Backfill from legacy tables (safe if they don't exist; wrap in DO blocks)

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'rangotsav_notify') THEN
    INSERT INTO public.rangotsav_registrations (type, email, created_at)
    SELECT 'notify', email, created_at
    FROM public.rangotsav_notify
    ON CONFLICT (type, email) DO NOTHING;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'rangotsav_vendors') THEN
    INSERT INTO public.rangotsav_registrations (type, email, name, details, status, created_at)
    SELECT
      'vendor',
      email,
      name,
      jsonb_build_object('what_selling', what_selling),
      COALESCE(status, 'pending'),
      created_at
    FROM public.rangotsav_vendors
    ON CONFLICT (type, email) DO NOTHING;
  END IF;
END $$;

-- 5) (Optional) Once you've verified the new table works end-to-end, drop legacy tables:
--
--    DROP TABLE IF EXISTS public.rangotsav_notify;
--    DROP TABLE IF EXISTS public.rangotsav_vendors;
--
-- Leave this commented out during the first deploy so you can roll back if needed.
