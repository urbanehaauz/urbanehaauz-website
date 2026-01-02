-- Financial Tracker Daily Table Migration
-- Run this in Supabase SQL Editor (Database → SQL Editor)

-- Financial Tracker Daily
CREATE TABLE IF NOT EXISTS financial_tracker_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  total_rooms INTEGER NOT NULL, -- (A) Fixed
  premium_room_occupancy DECIMAL(5,2) NOT NULL, -- (B) Variable - percentage or count
  driver_room_occupancy DECIMAL(5,2) NOT NULL, -- (C) Variable - percentage or count
  per_day_room_tariff DECIMAL(10,2) NOT NULL, -- (D) Variable
  per_day_driver_tariff DECIMAL(10,2) NOT NULL, -- (E) Variable
  restaurant_inflow DECIMAL(10,2) DEFAULT 0, -- (F) Variable - placeholder for future integration
  total_fixed_monthly_liability DECIMAL(10,2) NOT NULL, -- (H) Fixed
  total_variable_monthly_liability DECIMAL(10,2) NOT NULL, -- (I) Variable
  interest DECIMAL(10,2) DEFAULT 0, -- (K)
  depreciation DECIMAL(10,2) DEFAULT 0, -- (L)
  tax DECIMAL(10,2) DEFAULT 0, -- (M)
  apportionment DECIMAL(10,2) DEFAULT 0, -- (N)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE financial_tracker_daily ENABLE ROW LEVEL SECURITY;

-- Admin-only policy
CREATE POLICY "Admins can manage financial tracker"
  ON financial_tracker_daily FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_financial_tracker_daily_updated_at BEFORE UPDATE ON financial_tracker_daily
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add index for date queries
CREATE INDEX IF NOT EXISTS idx_financial_tracker_daily_date ON financial_tracker_daily(date);

