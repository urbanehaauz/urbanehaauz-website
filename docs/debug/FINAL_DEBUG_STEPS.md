# Final Debug Steps - Rooms Not Showing

## ✅ Confirmed: RLS Policy is Correct!

I can see from your Supabase dashboard that:
- ✅ Policy "Anyone can view available rooms" exists
- ✅ `cmd = "SELECT"` (correct)
- ✅ `qual = "true"` (allows all rows)

So the RLS policy is **NOT** the issue!

## Next: Find the Real Problem

### Step 1: Check Browser Console (CRITICAL)

1. Open: http://localhost:3000
2. Press **F12** → **Console** tab
3. Look for messages starting with emojis:
   - `🔄 Attempting to load rooms from Supabase...`
   - `❌ Error loading rooms:`
   - `📦 Raw data from Supabase:`
   - `✅ Loaded X rooms from database`

**Copy and share any error messages you see!**

### Step 2: Test Direct API Call

Copy and paste this into your browser console (F12 → Console):

```javascript
const SUPABASE_URL = 'https://lqvccvtsydzptgsrncmz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdmNjdnRzeWR6cHRnc3JuY216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjYxMzksImV4cCI6MjA3OTc0MjEzOX0.EkcTvD4u8Jf6sS4tfwTwNugj3XvRcyOrdP_R5k6w45o';

fetch(`${SUPABASE_URL}/rest/v1/rooms?select=*`, {
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Direct API Result:', data);
  console.log('Number of rooms:', data.length);
})
.catch(err => console.error('❌ Direct API Error:', err));
```

This will tell us if it's:
- ✅ **Works** → Issue is in the React code
- ❌ **Fails** → Issue is with API/auth/env variables

### Step 3: Verify Environment Variables

Check that `.env.local` exists and has:

```env
VITE_SUPABASE_URL=https://lqvccvtsydzptgsrncmz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Then restart dev server:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 4: Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Refresh page
4. Look for requests to `supabase.co/rest/v1/rooms`
5. Click on it and check:
   - Status code (should be 200)
   - Response (should show rooms data)

## Common Issues (Now That RLS is Fixed)

1. **Environment variables not loaded** → Restart dev server
2. **Supabase client not initialized** → Check `lib/supabase.ts`
3. **Data format mismatch** → Check console logs
4. **Loading state stuck** → Check if `loading` is ever set to `false`
5. **Rooms array empty** → Check if data is being filtered out

## What to Share

After checking, tell me:
1. ✅/❌ What you see in browser console (F12)
2. ✅/❌ Result of direct API test (Step 2)
3. ✅/❌ Status code in Network tab for rooms request
4. Any error messages (copy/paste them)

With this info, I can pinpoint the exact issue!

