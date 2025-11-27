# Step-by-Step Debug: Rooms Not Showing

## Step 1: Check Browser Console (Most Important!)

1. Open your site: http://localhost:3000
2. Press **F12** → **Console** tab
3. Look for messages starting with:
   - `🔄 Attempting to load rooms...`
   - `❌ Error loading rooms:` (if there's an error)
   - `✅ Loaded X rooms from database` (if successful)
   - `📦 Raw data from Supabase:` (shows what was fetched)

**Copy any error messages you see and share them!**

## Step 2: Verify RLS Policy in Supabase

Since the policy already exists, let's verify it's working:

1. Go to Supabase SQL Editor
2. Run `verify_rooms_policy.sql` (or this query):

```sql
-- Check all policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'rooms';
```

3. You should see: `"Anyone can view available rooms"` with `cmd = 'SELECT'`

## Step 3: Test Direct Query

Run this in Supabase SQL Editor to test if query works:

```sql
SELECT * FROM rooms;
```

If this returns 4 rooms, the database is fine. If it returns 0, rooms might be filtered out.

## Step 4: Check if Rooms are Actually Available

```sql
SELECT id, name, available, price FROM rooms;
```

Make sure at least some rooms have `available = true`.

## Step 5: Check Environment Variables

Make sure `.env.local` has correct values:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Then **restart dev server**:
```bash
# Stop server (Ctrl+C)
npm run dev
```

## Step 6: Test API Directly

In browser console (F12), run:

```javascript
// Replace with your actual anon key from .env.local
const SUPABASE_URL = 'https://lqvccvtsydzptgsrncmz.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY_HERE';

fetch(`${SUPABASE_URL}/rest/v1/rooms?select=*`, {
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Direct API call result:', data);
  console.log('Number of rooms:', data.length);
})
.catch(err => {
  console.error('❌ Direct API call error:', err);
});
```

This will tell us if it's an RLS issue or something else.

## Most Common Issues

1. **RLS Policy exists but not working** → Check policy details
2. **Environment variables wrong** → Check `.env.local` and restart server
3. **All rooms marked unavailable** → Run `UPDATE rooms SET available = true;`
4. **CORS or network issue** → Check browser Network tab

## Share With Me

After checking, share:
1. What you see in browser console (F12)
2. Result of `SELECT * FROM rooms;` in Supabase
3. Result of direct API test (if you ran it)

