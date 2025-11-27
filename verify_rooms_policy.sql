-- Verify Rooms RLS Policies
-- Run this in Supabase SQL Editor to check what policies exist

-- Check all policies on rooms table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'rooms';

-- Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'rooms';

-- Test query as anonymous user (simulate what the app does)
-- This should return rooms if policy is working
SELECT * FROM rooms LIMIT 5;

