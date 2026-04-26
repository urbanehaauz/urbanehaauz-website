-- Migration: Add Razorpay and OTA columns to bookings table
-- Run this in Supabase SQL Editor before deploying Edge Functions

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ota_platform TEXT;

COMMENT ON COLUMN bookings.razorpay_order_id IS 'Razorpay order ID created before payment (rzp_order_xxx)';
COMMENT ON COLUMN bookings.razorpay_payment_id IS 'Razorpay payment ID after successful payment (pay_xxx)';
COMMENT ON COLUMN bookings.ota_platform IS 'OTA platform name for OTA bookings (e.g. MakeMyTrip, Booking.com). NULL for non-OTA bookings.';
