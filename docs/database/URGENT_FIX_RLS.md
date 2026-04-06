# URGENT FIX: Infinite Recursion in RLS Policies

## The Problem

**Error:** `infinite recursion detected in policy for relation "user_profiles"`

The RLS policies are causing infinite recursion because:
- The `rooms` policy checks if user is admin by querying `user_profiles`
- But `user_profiles` policy might also query itself
- This creates an infinite loop

## Quick Fix (5 minutes)

### Step 1: Go to Supabase SQL Editor

1. Open: https://supabase.com/dashboard/project/lqvccvtsydzptgsrncmz/sql
2. Click "New query"

### Step 2: Run This SQL

Copy and paste this into the SQL Editor:

```sql
-- Fix: Remove Infinite Recursion in RLS Policies

-- Step 1: Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage rooms" ON rooms;

-- Step 2: Recreate rooms policy without recursion
CREATE POLICY "Admins can manage rooms"
  ON rooms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Step 3: Recreate user_profiles policy without recursion
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    auth.uid() = id  -- Users can view own profile
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.is_admin = true
    )
  );
```

### Step 3: Verify

Run this to check policies:

```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('rooms', 'user_profiles');
```

### Step 4: Refresh Browser

1. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)
2. Check console - errors should be gone
3. Rooms should load!

## Alternative: Simplified Fix (If Above Doesn't Work)

If recursion still happens, use this simpler version:

```sql
-- Drop all admin policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage rooms" ON rooms;

-- Simple admin check using service role (not recommended for production)
-- Or use JWT claims instead

-- For now, allow admins via direct query (one level only)
CREATE POLICY "Admins can manage rooms"
  ON rooms FOR ALL
  USING (
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) = true
  );

-- Users can only view own profile, admins view all via separate query
CREATE POLICY "Users view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);
```

## After Fix

- ✅ Rooms should load
- ✅ Bookings should load
- ✅ Admin dashboard should work
- ✅ No more infinite recursion errors

