-- Fix: Add public read access to rooms table
-- Run this in Supabase SQL Editor

-- First, check if a public policy exists
-- If not, create one:

-- Drop existing policy if it exists (in case you need to recreate)
DROP POLICY IF EXISTS "Public can view rooms" ON rooms;

-- Create policy for public to view all rooms
CREATE POLICY "Public can view rooms"
  ON rooms FOR SELECT
  USING (true);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'rooms';

