# Debugging: Rooms Not Showing

## Quick Checks

### 1. Check Browser Console (F12)
Open DevTools → Console tab and look for:
- ✅ `✅ Loaded X rooms from database` (should see this)
- ❌ Any red error messages about Supabase
- ⚠️ Any warnings

### 2. Check Supabase Database

Go to Supabase → Table Editor → `rooms` table:

**Verify:**
- [ ] 4 rooms exist in the table
- [ ] `available` column is `true` for at least some rooms
- [ ] All columns have data (name, price, image, etc.)

**If rooms are marked as unavailable:**
Run this SQL in Supabase SQL Editor:
```sql
UPDATE rooms SET available = true;
```

### 3. Check Environment Variables

Make sure `.env.local` has:
```env
VITE_SUPABASE_URL=https://lqvccvtsydzptgsrncmz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Then restart dev server:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

### 4. Check Row Level Security (RLS)

In Supabase → Table Editor → `rooms`:
- Click on the table
- Check if RLS is enabled
- If enabled, make sure there's a policy allowing public read access

**If RLS is blocking:**
Run this SQL:
```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'rooms';

-- If no public read policy exists, create one:
CREATE POLICY "Public can view rooms"
ON rooms FOR SELECT
USING (true);
```

### 5. Test Database Connection

In browser console, run:
```javascript
// This should return your rooms
fetch('https://lqvccvtsydzptgsrncmz.supabase.co/rest/v1/rooms?select=*', {
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
})
.then(r => r.json())
.then(console.log)
```

## Common Issues

### Issue: "No rooms available"
**Cause:** All rooms marked as `available = false`  
**Fix:** Run `UPDATE rooms SET available = true;` in Supabase

### Issue: "Error loading rooms" in console
**Cause:** Database connection issue or RLS blocking  
**Fix:** Check RLS policies and environment variables

### Issue: Rooms page shows nothing
**Cause:** Rooms array is empty  
**Fix:** Check if seed.sql ran successfully, verify rooms exist in database

### Issue: "Check Availability" button works but no rooms show
**Cause:** Rooms loading but all filtered out  
**Fix:** Check `available` column in database

## Quick SQL Fixes

```sql
-- Make all rooms available
UPDATE rooms SET available = true;

-- Check room count
SELECT COUNT(*) FROM rooms;

-- Check available rooms
SELECT COUNT(*) FROM rooms WHERE available = true;

-- View all rooms
SELECT id, name, available, price FROM rooms;
```

