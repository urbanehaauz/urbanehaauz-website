-- Rangotsav 2026 ticketing schema (per-day model).
--
-- A buyer can purchase mixed line items in a single checkout:
--   Day 1 only (₹100 / admit), Day 2 only (₹100 / admit), or Both Days (₹200 / admit).
-- Each line item is one row in rangotsav_tickets; rows that share a checkout
-- are linked by purchase_group_id (and razorpay_order_id for online sales).
--
-- Capacity is per-day (300 each by default), configurable via two settings rows.
-- A 'both' ticket consumes one slot from each day's bucket.
--
-- Run this in Supabase SQL Editor. Idempotent.

-- 0) Self-heal: if a prior partial/older rangotsav_tickets table exists
--    without our expected columns, drop it (with CASCADE) so we can recreate
--    cleanly. Safe because no real ticket sales exist yet; if you already
--    have real ticket sales in the old table, comment this block out and
--    migrate manually instead.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'rangotsav_tickets'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'rangotsav_tickets'
      AND column_name = 'day_selection'
  ) THEN
    RAISE NOTICE 'Dropping old rangotsav_tickets table (missing day_selection column)';
    DROP TABLE public.rangotsav_tickets CASCADE;
  END IF;
END $$;

-- 1) Table -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rangotsav_tickets (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code        TEXT         UNIQUE NOT NULL,
  purchase_group_id  UUID         NOT NULL,
  day_selection      TEXT         NOT NULL CHECK (day_selection IN ('day_1','day_2','both')),
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
  -- Per-day check-in counters. day_2 is irrelevant for 'day_1' rows and vice
  -- versa; CHECK constraints enforce that.
  checked_in_day_1   INT          NOT NULL DEFAULT 0,
  checked_in_day_2   INT          NOT NULL DEFAULT 0,
  checked_in_at      TIMESTAMPTZ,
  notes              TEXT,
  sold_by            UUID         REFERENCES auth.users(id),
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_checkin_day_1_within_qty
    CHECK (checked_in_day_1 >= 0 AND checked_in_day_1 <= quantity),
  CONSTRAINT chk_checkin_day_2_within_qty
    CHECK (checked_in_day_2 >= 0 AND checked_in_day_2 <= quantity),
  CONSTRAINT chk_day_1_only_zero_for_day_2_row
    CHECK (day_selection <> 'day_2' OR checked_in_day_1 = 0),
  CONSTRAINT chk_day_2_only_zero_for_day_1_row
    CHECK (day_selection <> 'day_1' OR checked_in_day_2 = 0)
);

CREATE INDEX IF NOT EXISTS idx_rangotsav_tickets_status
  ON public.rangotsav_tickets (payment_status);
CREATE INDEX IF NOT EXISTS idx_rangotsav_tickets_email
  ON public.rangotsav_tickets (buyer_email);
CREATE INDEX IF NOT EXISTS idx_rangotsav_tickets_code
  ON public.rangotsav_tickets (ticket_code);
CREATE INDEX IF NOT EXISTS idx_rangotsav_tickets_created
  ON public.rangotsav_tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rangotsav_tickets_group
  ON public.rangotsav_tickets (purchase_group_id);
CREATE INDEX IF NOT EXISTS idx_rangotsav_tickets_order
  ON public.rangotsav_tickets (razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_rangotsav_tickets_day
  ON public.rangotsav_tickets (day_selection);

-- 2) Settings seed (price + per-day capacity) --------------------------------
-- The settings table is {key TEXT, value TEXT}; existing public read policy
-- already lets anon read these, so the buy form can fetch the price.
-- ticket_price is per-day-per-admit; a 'both' ticket charges 2× this amount.
INSERT INTO public.settings (key, value)
VALUES
  ('rangotsav_ticket_price',     '100'),
  ('rangotsav_capacity_day_1',   '300'),
  ('rangotsav_capacity_day_2',   '300')
ON CONFLICT (key) DO NOTHING;

-- 3) Atomic reservation function --------------------------------------------
-- Drop the legacy single-quantity signature first.
DROP FUNCTION IF EXISTS public.reserve_rangotsav_tickets(INT, TEXT, TEXT, TEXT, NUMERIC, TEXT, TEXT, UUID, TEXT) CASCADE;

-- Accepts a JSONB array of line items: [{"day_selection":"day_1","quantity":2}, ...]
-- Locks both day-capacity setting rows so concurrent buyers serialize on
-- per-day inventory. Counts paid + recently-pending rows (15-min hold for
-- in-flight Razorpay flows). Offline sales are marked paid immediately;
-- online sales start as pending and flip to paid on verify.
CREATE OR REPLACE FUNCTION public.reserve_rangotsav_tickets(
  p_items           JSONB,
  p_buyer_name      TEXT,
  p_buyer_email     TEXT,
  p_buyer_phone     TEXT,
  p_unit_price      NUMERIC,
  p_source          TEXT DEFAULT 'online',
  p_payment_method  TEXT DEFAULT 'razorpay',
  p_sold_by         UUID DEFAULT NULL,
  p_notes           TEXT DEFAULT NULL
)
RETURNS TABLE(
  ticket_id          UUID,
  ticket_code        TEXT,
  day_selection      TEXT,
  quantity           INT,
  unit_price         NUMERIC,
  total_amount       NUMERIC,
  purchase_group_id  UUID,
  remaining_day_1    INT,
  remaining_day_2    INT
)
LANGUAGE plpgsql
SECURITY DEFINER
-- pgcrypto lives in the `extensions` schema on Supabase; include it here so
-- gen_random_bytes() resolves.
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_capacity_day_1 INT;
  v_capacity_day_2 INT;
  v_reserved_day_1 INT;
  v_reserved_day_2 INT;
  v_needed_day_1   INT;
  v_needed_day_2   INT;
  v_total_qty      INT;
  v_group_id       UUID := gen_random_uuid();
  v_item           JSONB;
  v_item_day       TEXT;
  v_item_qty       INT;
  v_item_unit      NUMERIC;
  v_code           TEXT;
  v_id             UUID;
  v_remaining_1    INT;
  v_remaining_2    INT;
BEGIN
  -- Validate items array shape
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'INVALID_ITEMS: expected non-empty JSONB array';
  END IF;

  v_total_qty := 0;
  v_needed_day_1 := 0;
  v_needed_day_2 := 0;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_item_day := v_item->>'day_selection';
    v_item_qty := COALESCE((v_item->>'quantity')::INT, 0);

    IF v_item_day NOT IN ('day_1','day_2','both') THEN
      RAISE EXCEPTION 'INVALID_ITEMS: day_selection must be day_1, day_2, or both (got %)', v_item_day;
    END IF;
    IF v_item_qty <= 0 OR v_item_qty > 10 THEN
      RAISE EXCEPTION 'INVALID_ITEMS: each quantity must be between 1 and 10';
    END IF;

    v_total_qty := v_total_qty + v_item_qty;
    IF v_item_day = 'day_1' OR v_item_day = 'both' THEN
      v_needed_day_1 := v_needed_day_1 + v_item_qty;
    END IF;
    IF v_item_day = 'day_2' OR v_item_day = 'both' THEN
      v_needed_day_2 := v_needed_day_2 + v_item_qty;
    END IF;
  END LOOP;

  IF v_total_qty > 10 THEN
    RAISE EXCEPTION 'INVALID_ITEMS: total quantity across line items must be ≤ 10';
  END IF;

  -- Lock both capacity rows in alphabetical key order to avoid deadlocks
  SELECT (s.value)::INT INTO v_capacity_day_1
  FROM public.settings s
  WHERE s.key = 'rangotsav_capacity_day_1'
  FOR UPDATE;
  IF v_capacity_day_1 IS NULL THEN v_capacity_day_1 := 300; END IF;

  SELECT (s.value)::INT INTO v_capacity_day_2
  FROM public.settings s
  WHERE s.key = 'rangotsav_capacity_day_2'
  FOR UPDATE;
  IF v_capacity_day_2 IS NULL THEN v_capacity_day_2 := 300; END IF;

  -- Per-day reserved = paid OR recent-pending rows where this day is included
  SELECT COALESCE(SUM(t.quantity), 0) INTO v_reserved_day_1
  FROM public.rangotsav_tickets t
  WHERE t.day_selection IN ('day_1','both')
    AND (t.payment_status = 'paid'
         OR (t.payment_status = 'pending' AND t.created_at > NOW() - INTERVAL '15 minutes'));

  SELECT COALESCE(SUM(t.quantity), 0) INTO v_reserved_day_2
  FROM public.rangotsav_tickets t
  WHERE t.day_selection IN ('day_2','both')
    AND (t.payment_status = 'paid'
         OR (t.payment_status = 'pending' AND t.created_at > NOW() - INTERVAL '15 minutes'));

  IF v_reserved_day_1 + v_needed_day_1 > v_capacity_day_1 THEN
    RAISE EXCEPTION 'SOLD_OUT_DAY_1: only % Day 1 passes remaining', GREATEST(v_capacity_day_1 - v_reserved_day_1, 0);
  END IF;
  IF v_reserved_day_2 + v_needed_day_2 > v_capacity_day_2 THEN
    RAISE EXCEPTION 'SOLD_OUT_DAY_2: only % Day 2 passes remaining', GREATEST(v_capacity_day_2 - v_reserved_day_2, 0);
  END IF;

  v_remaining_1 := v_capacity_day_1 - v_reserved_day_1 - v_needed_day_1;
  v_remaining_2 := v_capacity_day_2 - v_reserved_day_2 - v_needed_day_2;

  -- Insert one row per line item; each gets its own ticket_code + QR
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_item_day := v_item->>'day_selection';
    v_item_qty := (v_item->>'quantity')::INT;
    v_item_unit := p_unit_price * (CASE WHEN v_item_day = 'both' THEN 2 ELSE 1 END);

    -- Generate a 6-char hex suffix, retry up to 3× on (extremely unlikely) collision
    v_code := NULL;
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
      ticket_code, purchase_group_id, day_selection,
      buyer_name, buyer_email, buyer_phone,
      quantity, unit_price, total_amount,
      source, payment_method, payment_status,
      sold_by, notes
    ) VALUES (
      v_code, v_group_id, v_item_day,
      p_buyer_name, p_buyer_email, p_buyer_phone,
      v_item_qty, v_item_unit, v_item_unit * v_item_qty,
      p_source, p_payment_method,
      CASE WHEN p_source = 'offline' THEN 'paid' ELSE 'pending' END,
      p_sold_by, p_notes
    )
    RETURNING id INTO v_id;

    ticket_id := v_id;
    ticket_code := v_code;
    day_selection := v_item_day;
    quantity := v_item_qty;
    unit_price := v_item_unit;
    total_amount := v_item_unit * v_item_qty;
    purchase_group_id := v_group_id;
    remaining_day_1 := v_remaining_1;
    remaining_day_2 := v_remaining_2;
    RETURN NEXT;
  END LOOP;

  RETURN;
END
$$;

REVOKE ALL ON FUNCTION public.reserve_rangotsav_tickets(JSONB, TEXT, TEXT, TEXT, NUMERIC, TEXT, TEXT, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_rangotsav_tickets(JSONB, TEXT, TEXT, TEXT, NUMERIC, TEXT, TEXT, UUID, TEXT) TO anon, authenticated;

-- 4) Public remaining-capacity helper (per day) ------------------------------
-- Drop legacy INT-returning version if present; replace with TABLE return.
DROP FUNCTION IF EXISTS public.rangotsav_tickets_remaining() CASCADE;

CREATE OR REPLACE FUNCTION public.rangotsav_tickets_remaining()
RETURNS TABLE(day_1_remaining INT, day_2_remaining INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
STABLE
AS $$
DECLARE
  v_cap_1 INT;
  v_cap_2 INT;
  v_res_1 INT;
  v_res_2 INT;
BEGIN
  SELECT (s.value)::INT INTO v_cap_1 FROM public.settings s WHERE s.key = 'rangotsav_capacity_day_1';
  IF v_cap_1 IS NULL THEN v_cap_1 := 300; END IF;
  SELECT (s.value)::INT INTO v_cap_2 FROM public.settings s WHERE s.key = 'rangotsav_capacity_day_2';
  IF v_cap_2 IS NULL THEN v_cap_2 := 300; END IF;

  SELECT COALESCE(SUM(t.quantity), 0) INTO v_res_1
  FROM public.rangotsav_tickets t
  WHERE t.day_selection IN ('day_1','both')
    AND (t.payment_status = 'paid'
         OR (t.payment_status = 'pending' AND t.created_at > NOW() - INTERVAL '15 minutes'));

  SELECT COALESCE(SUM(t.quantity), 0) INTO v_res_2
  FROM public.rangotsav_tickets t
  WHERE t.day_selection IN ('day_2','both')
    AND (t.payment_status = 'paid'
         OR (t.payment_status = 'pending' AND t.created_at > NOW() - INTERVAL '15 minutes'));

  day_1_remaining := GREATEST(v_cap_1 - v_res_1, 0);
  day_2_remaining := GREATEST(v_cap_2 - v_res_2, 0);
  RETURN NEXT;
END
$$;

REVOKE ALL ON FUNCTION public.rangotsav_tickets_remaining() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rangotsav_tickets_remaining() TO anon, authenticated;

-- 4b) Abandonment helpers ----------------------------------------------------
-- A buyer reserves N rows (one per line item) before paying, so abandoned
-- attempts leave 'pending' rows polluting the admin dashboard. Helpers:
--
--   expire_stale_pending_rangotsav_tickets()
--     Sweep: any 'pending' row older than 15 min flips to 'failed'.
--     Inventory math already ignores rows past 15 min; this just keeps the
--     admin table tidy. Called on every admin dashboard load.
--
--   mark_rangotsav_purchase_group_failed(group_id, order_id)
--     Active cleanup for mixed-cart checkouts: the buyer's browser calls this
--     when the Razorpay modal is dismissed or the payment errors. Marks ALL
--     sibling rows in the group as failed at once. The order_id check makes
--     it safe to expose to anon — only the browser that just received the
--     order_id from create-rangotsav-order can mark its own group failed.
--
--   mark_rangotsav_ticket_failed(ticket_id, order_id) [legacy, single-row]
--     Kept as a defensive fallback for older clients / edge cases.

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

CREATE OR REPLACE FUNCTION public.mark_rangotsav_purchase_group_failed(
  p_group_id UUID,
  p_order_id TEXT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE public.rangotsav_tickets t
  SET payment_status = 'failed'
  WHERE t.purchase_group_id = p_group_id
    AND t.razorpay_order_id = p_order_id
    AND t.payment_status = 'pending'
    AND t.created_at > NOW() - INTERVAL '30 minutes';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END
$$;

REVOKE ALL ON FUNCTION public.mark_rangotsav_purchase_group_failed(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_rangotsav_purchase_group_failed(UUID, TEXT) TO anon, authenticated;

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

-- 7) Per-day inventory summary view -----------------------------------------
-- Breaks sales/check-ins out by day. A 'both' ticket counts as 1 sale but
-- 2 admits (one for each day). "today's check-ins" is computed in IST so the
-- festival-day cutoff is intuitive.
CREATE OR REPLACE VIEW public.rangotsav_inventory_summary AS
SELECT
  (SELECT (value)::INT FROM public.settings WHERE key = 'rangotsav_capacity_day_1') AS total_capacity_day_1,
  (SELECT (value)::INT FROM public.settings WHERE key = 'rangotsav_capacity_day_2') AS total_capacity_day_2,

  -- Sold = paid rows, broken out by day_selection
  COALESCE(SUM(CASE WHEN payment_status = 'paid' AND day_selection = 'day_1' THEN quantity END), 0) AS sold_day_1_only,
  COALESCE(SUM(CASE WHEN payment_status = 'paid' AND day_selection = 'day_2' THEN quantity END), 0) AS sold_day_2_only,
  COALESCE(SUM(CASE WHEN payment_status = 'paid' AND day_selection = 'both'  THEN quantity END), 0) AS sold_both,

  -- Per-day occupancy = single-day rows + both-day rows for that day
  COALESCE(SUM(CASE WHEN payment_status = 'paid' AND day_selection IN ('day_1','both') THEN quantity END), 0) AS occupied_day_1,
  COALESCE(SUM(CASE WHEN payment_status = 'paid' AND day_selection IN ('day_2','both') THEN quantity END), 0) AS occupied_day_2,

  COALESCE(SUM(CASE WHEN payment_status = 'paid' AND source = 'online'  THEN quantity END), 0) AS sold_online,
  COALESCE(SUM(CASE WHEN payment_status = 'paid' AND source = 'offline' THEN quantity END), 0) AS sold_offline,

  -- Total admits across both days (a 'both' ticket counts twice)
  COALESCE(SUM(CASE WHEN payment_status = 'paid'
                     THEN quantity * (CASE WHEN day_selection = 'both' THEN 2 ELSE 1 END)
                   END), 0) AS sold_total_admits,

  COALESCE(SUM(CASE WHEN payment_status = 'pending'
                      AND created_at > NOW() - INTERVAL '15 minutes'
                      AND day_selection IN ('day_1','both') THEN quantity END), 0) AS pending_day_1,
  COALESCE(SUM(CASE WHEN payment_status = 'pending'
                      AND created_at > NOW() - INTERVAL '15 minutes'
                      AND day_selection IN ('day_2','both') THEN quantity END), 0) AS pending_day_2,

  COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount END), 0) AS revenue_collected,

  -- Check-in counters
  COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN checked_in_day_1 END), 0) AS checked_in_day_1,
  COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN checked_in_day_2 END), 0) AS checked_in_day_2,
  COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN checked_in_day_1 + checked_in_day_2 END), 0) AS checked_in_total,
  COALESCE(SUM(CASE WHEN payment_status = 'paid'
                      AND checked_in_at IS NOT NULL
                      AND DATE(checked_in_at AT TIME ZONE 'Asia/Kolkata') = (NOW() AT TIME ZONE 'Asia/Kolkata')::DATE
                    THEN checked_in_day_1 + checked_in_day_2 END), 0) AS checked_in_today
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
