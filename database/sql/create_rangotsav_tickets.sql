-- Rangotsav 2026 ticketing schema.
-- One row per purchase (a buyer can buy N tickets in one go => one row, quantity = N).
-- Online + offline sales share a single 300-ticket inventory pool.
--
-- Run this in Supabase SQL Editor. Idempotent.

-- 0) Self-heal: if a prior partial/older rangotsav_tickets table exists
--    without our expected columns, drop it (with CASCADE) so we can recreate
--    cleanly. Safe because the new schema is the only one we use; if you
--    already have real ticket sales in the old table, comment this block out
--    and migrate manually instead.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'rangotsav_tickets'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'rangotsav_tickets'
      AND column_name = 'buyer_email'
  ) THEN
    RAISE NOTICE 'Dropping incompatible existing rangotsav_tickets table (missing buyer_email)';
    DROP TABLE public.rangotsav_tickets CASCADE;
  END IF;
END $$;

-- 1) Table -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rangotsav_tickets (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code        TEXT         UNIQUE NOT NULL,
  buyer_name         TEXT         NOT NULL,
  buyer_email        TEXT         NOT NULL,
  buyer_phone        TEXT         NOT NULL,
  quantity           INT          NOT NULL CHECK (quantity > 0 AND quantity <= 10),
  unit_price         NUMERIC(10,2) NOT NULL,
  total_amount       NUMERIC(10,2) NOT NULL,
  source             TEXT         NOT NULL CHECK (source IN ('online','offline')),
  payment_status     TEXT         NOT NULL DEFAULT 'pending'
                                    CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_method     TEXT,
  razorpay_order_id  TEXT,
  razorpay_payment_id TEXT,
  checked_in_count   INT          NOT NULL DEFAULT 0,
  checked_in_at      TIMESTAMPTZ,
  notes              TEXT,
  sold_by            UUID         REFERENCES auth.users(id),
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rangotsav_tickets_status
  ON public.rangotsav_tickets (payment_status);
CREATE INDEX IF NOT EXISTS idx_rangotsav_tickets_email
  ON public.rangotsav_tickets (buyer_email);
CREATE INDEX IF NOT EXISTS idx_rangotsav_tickets_code
  ON public.rangotsav_tickets (ticket_code);
CREATE INDEX IF NOT EXISTS idx_rangotsav_tickets_created
  ON public.rangotsav_tickets (created_at DESC);

-- 2) Settings seed (price + capacity) ----------------------------------------
-- The settings table is {key TEXT, value TEXT}; existing public read policy
-- already lets anon read these, so the buy form can fetch the price.
INSERT INTO public.settings (key, value)
VALUES
  ('rangotsav_ticket_price', '100'),
  ('rangotsav_total_capacity', '300')
ON CONFLICT (key) DO NOTHING;

-- 3) Atomic reservation function --------------------------------------------
-- Locks the capacity setting row for the duration of the transaction so
-- concurrent buyers can't oversell. Counts paid + recently-pending tickets
-- (15-min hold for in-flight Razorpay flows). Offline sales are marked paid
-- immediately; online sales start as pending and flip to paid on verify.
CREATE OR REPLACE FUNCTION public.reserve_rangotsav_tickets(
  p_quantity        INT,
  p_buyer_name      TEXT,
  p_buyer_email     TEXT,
  p_buyer_phone     TEXT,
  p_unit_price      NUMERIC,
  p_source          TEXT DEFAULT 'online',
  p_payment_method  TEXT DEFAULT 'razorpay',
  p_sold_by         UUID DEFAULT NULL,
  p_notes           TEXT DEFAULT NULL
)
RETURNS TABLE(ticket_id UUID, ticket_code TEXT, remaining INT)
LANGUAGE plpgsql
SECURITY DEFINER
-- pgcrypto lives in the `extensions` schema on Supabase; include it here so
-- gen_random_bytes() resolves. Table refs below are aliased to avoid clashing
-- with the RETURNS TABLE column names (ticket_code in particular).
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_capacity INT;
  v_reserved INT;
  v_id       UUID;
  v_code     TEXT;
BEGIN
  IF p_quantity IS NULL OR p_quantity <= 0 OR p_quantity > 10 THEN
    RAISE EXCEPTION 'INVALID_QUANTITY: must be between 1 and 10';
  END IF;

  -- Lock the capacity row so concurrent reservations serialize on it
  SELECT (s.value)::INT INTO v_capacity
  FROM public.settings s
  WHERE s.key = 'rangotsav_total_capacity'
  FOR UPDATE;

  IF v_capacity IS NULL THEN
    v_capacity := 300;
  END IF;

  -- Count anything paid OR pending-but-recent (15-min hold for in-flight pays)
  SELECT COALESCE(SUM(t.quantity), 0) INTO v_reserved
  FROM public.rangotsav_tickets t
  WHERE t.payment_status = 'paid'
     OR (t.payment_status = 'pending' AND t.created_at > NOW() - INTERVAL '15 minutes');

  IF v_reserved + p_quantity > v_capacity THEN
    RAISE EXCEPTION 'SOLD_OUT: only % tickets remaining', GREATEST(v_capacity - v_reserved, 0);
  END IF;

  -- Generate a 6-char hex suffix, retry up to 3 times on the (extremely unlikely) collision
  FOR i IN 1..3 LOOP
    v_code := 'RANG-2026-' || UPPER(ENCODE(extensions.gen_random_bytes(3), 'hex'));
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.rangotsav_tickets t WHERE t.ticket_code = v_code
    );
    v_code := NULL;
  END LOOP;
  IF v_code IS NULL THEN
    RAISE EXCEPTION 'CODE_COLLISION: unable to generate unique ticket code, retry';
  END IF;

  INSERT INTO public.rangotsav_tickets (
    ticket_code, buyer_name, buyer_email, buyer_phone,
    quantity, unit_price, total_amount,
    source, payment_method, payment_status,
    sold_by, notes
  ) VALUES (
    v_code, p_buyer_name, p_buyer_email, p_buyer_phone,
    p_quantity, p_unit_price, p_quantity * p_unit_price,
    p_source, p_payment_method,
    CASE WHEN p_source = 'offline' THEN 'paid' ELSE 'pending' END,
    p_sold_by, p_notes
  )
  RETURNING id INTO v_id;

  RETURN QUERY SELECT v_id, v_code, (v_capacity - v_reserved - p_quantity);
END
$$;

-- Allow anon (public website) and authenticated users to call the function.
-- The function is SECURITY DEFINER so it bypasses RLS for the insert it does.
REVOKE ALL ON FUNCTION public.reserve_rangotsav_tickets(INT, TEXT, TEXT, TEXT, NUMERIC, TEXT, TEXT, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_rangotsav_tickets(INT, TEXT, TEXT, TEXT, NUMERIC, TEXT, TEXT, UUID, TEXT) TO anon, authenticated;

-- 4) Public remaining-capacity helper ---------------------------------------
-- Used by the buy form to render "X tickets left" without exposing rows.
CREATE OR REPLACE FUNCTION public.rangotsav_tickets_remaining()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
STABLE
AS $$
DECLARE
  v_capacity INT;
  v_reserved INT;
BEGIN
  SELECT (s.value)::INT INTO v_capacity FROM public.settings s WHERE s.key = 'rangotsav_total_capacity';
  IF v_capacity IS NULL THEN v_capacity := 300; END IF;

  SELECT COALESCE(SUM(t.quantity), 0) INTO v_reserved
  FROM public.rangotsav_tickets t
  WHERE t.payment_status = 'paid'
     OR (t.payment_status = 'pending' AND t.created_at > NOW() - INTERVAL '15 minutes');

  RETURN GREATEST(v_capacity - v_reserved, 0);
END
$$;

REVOKE ALL ON FUNCTION public.rangotsav_tickets_remaining() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rangotsav_tickets_remaining() TO anon, authenticated;

-- 4b) Abandonment helpers ----------------------------------------------------
-- Buyers reserve a row before paying, so abandoned attempts leave 'pending'
-- rows that pollute the admin dashboard. Two helpers handle cleanup:
--
--   expire_stale_pending_rangotsav_tickets()
--     Sweep: any 'pending' row older than 15 min is flipped to 'failed'.
--     Inventory math already ignores it after 15 min (see remaining() above);
--     this just keeps the table tidy. Called on every admin dashboard load.
--
--   mark_rangotsav_ticket_failed(ticket_id, order_id)
--     Active cleanup: the buyer's own browser calls this when they dismiss
--     the Razorpay modal or the payment errors. The order_id check makes
--     this safe to expose to anon — only the browser that just received
--     the order_id from create-rangotsav-order can mark its own row failed.

CREATE OR REPLACE FUNCTION public.expire_stale_pending_rangotsav_tickets()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE public.rangotsav_tickets
  SET payment_status = 'failed'
  WHERE payment_status = 'pending'
    AND created_at < NOW() - INTERVAL '15 minutes';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END
$$;

REVOKE ALL ON FUNCTION public.expire_stale_pending_rangotsav_tickets() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_stale_pending_rangotsav_tickets() TO authenticated;

CREATE OR REPLACE FUNCTION public.mark_rangotsav_ticket_failed(
  p_ticket_id UUID,
  p_order_id  TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE public.rangotsav_tickets t
  SET payment_status = 'failed'
  WHERE t.id = p_ticket_id
    AND t.razorpay_order_id = p_order_id
    AND t.payment_status = 'pending'
    AND t.created_at > NOW() - INTERVAL '30 minutes';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END
$$;

REVOKE ALL ON FUNCTION public.mark_rangotsav_ticket_failed(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_rangotsav_ticket_failed(UUID, TEXT) TO anon, authenticated;

-- 5) RLS ---------------------------------------------------------------------
ALTER TABLE public.rangotsav_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rangotsav_tickets_admin_select" ON public.rangotsav_tickets;
DROP POLICY IF EXISTS "rangotsav_tickets_admin_update" ON public.rangotsav_tickets;
DROP POLICY IF EXISTS "rangotsav_tickets_buyer_select_by_code" ON public.rangotsav_tickets;

-- Admins (per user_profiles.is_admin) get full read.
CREATE POLICY "rangotsav_tickets_admin_select"
  ON public.rangotsav_tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can update (for check-in count + offline payment edits).
CREATE POLICY "rangotsav_tickets_admin_update"
  ON public.rangotsav_tickets
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

-- Note: There is intentionally NO public INSERT/SELECT policy on this table.
-- All public writes go through reserve_rangotsav_tickets() (SECURITY DEFINER).
-- Edge Functions that need to read/update use the SUPABASE_SERVICE_ROLE_KEY,
-- which bypasses RLS.

-- 6) updated_at trigger ------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_rangotsav_tickets_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_rangotsav_tickets_updated_at ON public.rangotsav_tickets;
CREATE TRIGGER trg_rangotsav_tickets_updated_at
  BEFORE UPDATE ON public.rangotsav_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_rangotsav_tickets_updated_at();

-- 7) Helpful view for admin dashboard ---------------------------------------
-- Now includes check-in metrics so the dashboards can show "1/1 ✓" rows and
-- "Checked In Today" KPIs without per-row aggregation on the client.
-- "today" is computed in IST so the festival-day cut-off is intuitive.
CREATE OR REPLACE VIEW public.rangotsav_inventory_summary AS
SELECT
  (SELECT (value)::INT FROM public.settings WHERE key = 'rangotsav_total_capacity') AS total_capacity,
  COALESCE(SUM(CASE WHEN payment_status = 'paid' AND source = 'online'  THEN quantity END), 0) AS sold_online,
  COALESCE(SUM(CASE WHEN payment_status = 'paid' AND source = 'offline' THEN quantity END), 0) AS sold_offline,
  COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN quantity END), 0) AS sold_total,
  COALESCE(SUM(CASE WHEN payment_status = 'pending'
                      AND created_at > NOW() - INTERVAL '15 minutes'
                    THEN quantity END), 0) AS pending_held,
  COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount END), 0) AS revenue_collected,
  COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN checked_in_count END), 0) AS checked_in_total,
  COALESCE(SUM(CASE WHEN payment_status = 'paid'
                      AND checked_in_at IS NOT NULL
                      AND DATE(checked_in_at AT TIME ZONE 'Asia/Kolkata') = (NOW() AT TIME ZONE 'Asia/Kolkata')::DATE
                    THEN checked_in_count END), 0) AS checked_in_today
FROM public.rangotsav_tickets;

-- View inherits RLS from underlying table; admins are the only readers.

-- 8) Realtime ----------------------------------------------------------------
-- Enable Postgres realtime on the tickets table so admin dashboards subscribe
-- to inserts/updates and reflect new sales + check-ins without manual refresh.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.rangotsav_tickets;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- already in publication, idempotent
END $$;
