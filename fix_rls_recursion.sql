-- Fix: Remove Infinite Recursion in RLS Policies
-- Run this in Supabase SQL Editor

-- The problem: Policies on user_profiles query user_profiles, causing infinite recursion
-- Solution: Use auth.jwt() to check admin status instead

-- Step 1: Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage rooms" ON rooms;

-- Step 2: Fix rooms policy - check admin from JWT metadata, not from user_profiles
CREATE POLICY "Admins can manage rooms"
  ON rooms FOR ALL
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'is_admin' = 'true'
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Step 3: Fix user_profiles policy - use direct check, not recursive query
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    auth.uid() = id  -- Users can view own profile
    OR (auth.jwt() ->> 'user_metadata')::jsonb->>'is_admin' = 'true'  -- Or check JWT
  );

-- Step 4: Verify policies are correct
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('rooms', 'user_profiles')
ORDER BY tablename, policyname;

