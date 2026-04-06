# Quick Fix: Rooms Not Showing

## Most Likely Issue

The rooms are probably in the database but marked as `available = false`, or the database query is failing.

## Quick Fix (2 minutes)

### Step 1: Check Supabase Database

1. Go to: https://supabase.com/dashboard/project/lqvccvtsydzptgsrncmz/editor
2. Click on **`rooms`** table
3. Check:
   - Do you see 4 rooms?
   - Is the `available` column `true` for all rooms?

### Step 2: Make All Rooms Available

If rooms show `available = false`, run this in Supabase SQL Editor:

```sql
UPDATE rooms SET available = true;
```

### Step 3: Verify Rooms Exist

Run this to check:
```sql
SELECT id, name, available, price FROM rooms;
```

Should return 4 rows with `available = true`.

### Step 4: Check Browser Console

1. Open your site: http://localhost:3000
2. Press F12 → Console tab
3. Look for:
   - ✅ `✅ Loaded 4 rooms from database` (good!)
   - ❌ Any red errors (bad - share with me)

### Step 5: Restart Dev Server

After making database changes:
```bash
# Stop server (Ctrl+C in terminal)
npm run dev
```

## If Still Not Working

Share with me:
1. What you see in browser console (F12)
2. How many rooms are in Supabase `rooms` table
3. What the `available` column shows

Then I can help debug further!

