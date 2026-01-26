-- Urbane Haauz Database Schema V2 - Additional Tables
-- Run this AFTER schema.sql in Supabase SQL Editor

-- ============================================
-- Contact Inquiries Table
-- ============================================
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  inquiry_type TEXT NOT NULL DEFAULT 'general' CHECK (inquiry_type IN ('booking', 'general', 'feedback', 'partnership')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'resolved')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can insert, only admins can read/update
CREATE POLICY "Anyone can submit contact inquiry"
  ON contact_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage contact inquiries"
  ON contact_inquiries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- Reviews Table
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT NOT NULL,
  stay_date DATE,
  room_type TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  admin_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can view their own reviews"
  ON reviews FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can submit reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all reviews"
  ON reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- Promo Codes Table
-- ============================================
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_booking_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2), -- Cap for percentage discounts
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER, -- NULL means unlimited
  times_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  applicable_room_types TEXT[], -- NULL means all rooms
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can validate promo codes"
  ON promo_codes FOR SELECT
  USING (is_active = true AND valid_from <= NOW() AND valid_until >= NOW());

CREATE POLICY "Admins can manage promo codes"
  ON promo_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- Seasonal Pricing Table
-- ============================================
CREATE TABLE IF NOT EXISTS seasonal_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.00, -- 1.5 = 50% increase, 0.8 = 20% discount
  room_category TEXT, -- NULL means all rooms
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE seasonal_pricing ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active seasonal pricing"
  ON seasonal_pricing FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage seasonal pricing"
  ON seasonal_pricing FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- Email Logs Table (for tracking sent emails)
-- ============================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  email_type TEXT NOT NULL CHECK (email_type IN ('booking_confirmation', 'booking_cancellation', 'contact_reply', 'promotional', 'reminder')),
  subject TEXT NOT NULL,
  booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  resend_id TEXT, -- ID from Resend API
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view email logs"
  ON email_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- Update Bookings table for new fields
-- ============================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_phone TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS adults INTEGER DEFAULT 1;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS children INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_requests TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- ============================================
-- Triggers for new tables
-- ============================================
CREATE TRIGGER update_contact_inquiries_updated_at BEFORE UPDATE ON contact_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasonal_pricing_updated_at BEFORE UPDATE ON seasonal_pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Indexes for new tables
-- ============================================
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved, is_featured);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid ON promo_codes(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_seasonal_pricing_dates ON seasonal_pricing(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(guest_email);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_id ON bookings(booking_id);

-- ============================================
-- Insert default seasonal pricing (examples)
-- ============================================
INSERT INTO seasonal_pricing (name, description, start_date, end_date, price_multiplier, is_active) VALUES
  ('Peak Season - Oct to Dec', 'High demand during autumn and early winter', '2024-10-01', '2024-12-31', 1.25, true),
  ('Peak Season - Mar to May', 'Spring peak season with clear mountain views', '2025-03-01', '2025-05-31', 1.20, true),
  ('Monsoon Discount', 'Reduced rates during monsoon season', '2024-06-15', '2024-09-15', 0.85, true),
  ('New Year Special', 'Premium rates for New Year celebrations', '2024-12-28', '2025-01-05', 1.50, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- Insert sample promo codes
-- ============================================
INSERT INTO promo_codes (code, description, discount_type, discount_value, min_booking_amount, valid_from, valid_until, usage_limit, is_active) VALUES
  ('WELCOME10', 'Welcome discount for first-time guests', 'percentage', 10, 2000, NOW(), NOW() + INTERVAL '1 year', NULL, true),
  ('LONGSTAY15', '15% off for stays of 3+ nights', 'percentage', 15, 5000, NOW(), NOW() + INTERVAL '1 year', NULL, true),
  ('FLAT500', 'Flat ₹500 off on bookings above ₹3000', 'fixed', 500, 3000, NOW(), NOW() + INTERVAL '6 months', 100, true)
ON CONFLICT DO NOTHING;
