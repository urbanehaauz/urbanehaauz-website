# Local Testing Guide

## Step 1: Verify Environment Variables

Make sure your `.env.local` file exists and has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=https://lqvccvtsydzptgsrncmz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdmNjdnRzeWR6cHRnc3JuY216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjYxMzksImV4cCI6MjA3OTc0MjEzOX0.EkcTvD4u8Jf6sS4tfwTwNugj3XvRcyOrdP_R5k6w45o
```

**Location:** `.env.local` in the root directory

## Step 2: Install Dependencies (if needed)

```bash
npm install
```

## Step 3: Start Development Server

```bash
npm run dev
```

The server will start at: **http://localhost:3000**

## Step 4: Test Features

### 4.1 Test Public Website

1. **Home Page** (`http://localhost:3000/#/`)
   - ✅ Should load with hero image
   - ✅ Navigation should work
   - ✅ "BOOK NOW" button should work

2. **Rooms Page** (`http://localhost:3000/#/rooms`)
   - ✅ Should show 4 rooms from database
   - ✅ Filtering should work
   - ✅ Clicking a room should work

3. **Booking Flow** (`http://localhost:3000/#/book`)
   - ✅ Date picker should work
   - ✅ Room selection should work
   - ✅ Guest info form should work
   - ✅ Payment simulation should work
   - ✅ Booking should be saved to database

### 4.2 Test Authentication (User Login)

1. **Click "Login" button in navbar**
   - ✅ Login modal should open
   - ✅ Try creating an account (email/password)
   - ✅ Or try signing in with existing account

2. **After Login:**
   - ✅ Navbar should show your email/profile
   - ✅ "Logout" option should appear
   - ✅ User menu should work

3. **Test Booking with Login:**
   - ✅ Go to booking flow
   - ✅ Email should be pre-filled
   - ✅ Name should be pre-filled (if in profile)
   - ✅ Booking should be linked to your account

### 4.3 Test Admin Dashboard

1. **Go to Admin Login** (`http://localhost:3000/#/admin/login`)
   - ✅ Should show login form
   - ✅ Use your admin email and password
   - ✅ Should redirect to dashboard after login

2. **Admin Dashboard** (`http://localhost:3000/#/admin`)
   - ✅ Should show Overview with charts
   - ✅ Bookings should load from database
   - ✅ Rooms management should work
   - ✅ Staff management should work
   - ✅ Financials should show expenses/investments
   - ✅ Settings should work

3. **Test Admin Features:**
   - ✅ Add/edit room
   - ✅ Update booking status
   - ✅ Add expense
   - ✅ Add investment
   - ✅ Update settings (images)

## Step 5: Check Browser Console

Open browser DevTools (F12) and check Console tab:

- ✅ Should see "Supabase connected" or similar
- ❌ No red errors
- ⚠️ Warnings are usually okay (like chunk size)

## Step 6: Verify Database Connection

1. **Check Rooms Load:**
   - Go to Rooms page
   - Should see 4 rooms from database
   - If empty, check Supabase connection

2. **Test a Booking:**
   - Complete a booking
   - Go to Supabase Dashboard → Table Editor → bookings
   - Should see your new booking

3. **Check Admin Data:**
   - Login as admin
   - View Financials
   - Should see data from database (or empty if no data yet)

## Troubleshooting

### Issue: "Supabase URL or Anon Key is missing"

**Fix:** Check `.env.local` file exists and has correct values. Restart dev server after adding.

### Issue: "Cannot connect to Supabase"

**Fix:** 
- Check internet connection
- Verify Supabase project is active
- Check URL and key are correct

### Issue: "Admin login not working"

**Fix:**
- Make sure you ran the SQL query to set `is_admin = true` for your user
- Check Supabase → Table Editor → user_profiles → your email → is_admin should be `true`

### Issue: "Rooms not loading"

**Fix:**
- Check Supabase → Table Editor → rooms table has data
- Check browser console for errors
- Verify RLS policies allow public read access

### Issue: "Build fails"

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Quick Test Checklist

- [ ] Dev server starts without errors
- [ ] Home page loads
- [ ] Rooms page shows 4 rooms
- [ ] Can create user account
- [ ] Can login as user
- [ ] Can login as admin
- [ ] Can make a booking (guest)
- [ ] Can make a booking (logged in user)
- [ ] Admin dashboard loads
- [ ] Can view bookings in admin
- [ ] Can add/edit rooms
- [ ] Database connection works

## Next Steps After Testing

Once everything works locally:

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: Integrate Supabase authentication and database"
   git push
   ```

2. **Deploy to Vercel:**
   - Push to GitHub
   - Vercel will auto-deploy
   - Or trigger manual deployment via GitHub Actions

3. **Verify Production:**
   - Check https://urbanehaauz-website.vercel.app
   - Test all features again
   - Check environment variables in Vercel are set

