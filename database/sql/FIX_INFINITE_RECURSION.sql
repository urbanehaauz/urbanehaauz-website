-- FIX: Infinite Recursion in RLS Policies
-- Run this in Supabase SQL Editor to fix the infinite recursion error

-- Step 1: Drop the problematic recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage rooms" ON rooms;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;

-- Step 2: Create a SECURITY DEFINER function to check admin status
-- This function runs with elevated privileges and avoids recursion
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND is_admin = true
  );
END;
$$;

-- Step 3: Recreate rooms policy using the function (no recursion)
CREATE POLICY "Admins can manage rooms"
  ON rooms FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Step 4: Recreate user_profiles policy (users view own, admins view all via function)
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    auth.uid() = id  -- Users can always view own profile
    OR is_admin(auth.uid())  -- Admins can view all (using function, no recursion)
  );

-- Step 5: Fix bookings policy
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (
    user_id = auth.uid()  -- Users view own bookings
    OR is_admin(auth.uid())  -- Admins view all (using function)
  );

-- Step 6: Verify policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('rooms', 'user_profiles', 'bookings')
ORDER BY tablename, policyname;

