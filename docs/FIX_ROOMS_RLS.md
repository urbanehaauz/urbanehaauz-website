# Fix: Rooms Not Showing in UI

## The Problem

The database has rooms, but the UI shows "No rooms available". This is likely an **RLS (Row Level Security) policy issue**.

## Quick Fix (2 steps)

### Step 1: Check Browser Console

1. Open your site: http://localhost:3000
2. Press **F12** → **Console** tab
3. Look for error messages - they will tell you exactly what's wrong

### Step 2: Fix RLS Policy in Supabase

The rooms table needs a public read policy. Run this SQL in Supabase SQL Editor:

```sql
-- Check if policy exists
SELECT * FROM pg_policies WHERE tablename = 'rooms';

-- If no public read policy exists, create it:
CREATE POLICY "Anyone can view available rooms"
  ON rooms FOR SELECT
  USING (true);
```

## Verify Fix

After running the SQL:

1. **Refresh your browser** (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. Check browser console - should see: `✅ Loaded 4 rooms from database`
3. Rooms should appear on the page

## If Still Not Working

Check the browser console for:
- Error messages (copy and share with me)
- Look for messages starting with `❌`, `🚨`, or `⚠️`
- Check if you see `📦 Raw data from Supabase` - this shows what was fetched

## Alternative: Disable RLS (NOT recommended for production)

Only for testing:

```sql
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
```

**Warning:** This removes all security. Re-enable it and add proper policies for production.

