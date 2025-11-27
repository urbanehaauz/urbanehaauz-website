-- Simple Fix for Infinite Recursion
-- Run this in Supabase SQL Editor

-- The issue: Policies checking user_profiles while being on user_profiles causes recursion
-- Solution: Simplify the policies to avoid circular dependencies

-- 1. Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage rooms" ON rooms;

-- 2. Fix rooms policy - use simple admin check
CREATE POLICY "Admins can manage rooms"
  ON rooms FOR ALL
  USING (
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) = true
  )
  WITH CHECK (
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) = true
  );

-- 3. Fix user_profiles - users can view own, admins view all via direct check
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) = true
  );

-- Verify
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('rooms', 'user_profiles')
ORDER BY tablename;

