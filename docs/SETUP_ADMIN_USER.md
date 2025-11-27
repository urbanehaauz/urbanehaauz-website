# Setup Admin User - Step by Step

## Option 1: Create Admin via Supabase Dashboard (Easiest)

### Step 1: Create User in Supabase

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `urbanehaauz`
3. Go to **Authentication** → **Users** (left sidebar)
4. Click **"Add user"** → **"Create new user"**
5. Fill in:
   - **Email**: Your admin email (e.g., `admin@urbanehaauz.com` or your personal email)
   - **Password**: Create a strong password (min 6 characters)
   - **Auto Confirm User**: ✅ **Check this box** (important!)
6. Click **"Create user"**

### Step 2: Make User Admin

1. Go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy and paste this SQL (replace the email with your admin email):

```sql
-- Replace 'YOUR_EMAIL_HERE' with the email you just created
UPDATE user_profiles
SET is_admin = true
WHERE email = 'YOUR_EMAIL_HERE';

-- Verify it worked
SELECT id, email, is_admin FROM user_profiles WHERE email = 'YOUR_EMAIL_HERE';
```

4. Click **"Run"**
5. You should see: `Success. 1 row updated`
6. The verification query should show `is_admin = true`

### Step 3: Login to Admin Dashboard

1. Go to your website: http://localhost:3000
2. Click **"LOGIN"** in the navbar
3. Enter your admin email and password
4. Click **"Sign In"**
5. You should be logged in!
6. Click **"ADMIN"** in the navbar
7. You should see the admin dashboard!

---

## Option 2: Sign Up Normally, Then Promote to Admin

### Step 1: Sign Up on Website

1. Go to your website: http://localhost:3000
2. Click **"LOGIN"** in the navbar
3. Click **"Don't have an account? Sign up"**
4. Enter your email and password
5. Click **"Create Account"**
6. **If email confirmation is enabled**: Check your email and confirm

### Step 2: Make Yourself Admin

1. Go to Supabase → **SQL Editor**
2. Run this SQL (replace with your email):

```sql
-- Replace with your actual email
UPDATE user_profiles
SET is_admin = true
WHERE email = 'your-email@example.com';

-- Verify
SELECT id, email, is_admin FROM user_profiles WHERE email = 'your-email@example.com';
```

### Step 3: Login Again

1. Log out if you're logged in
2. Log back in with your email/password
3. Click **"ADMIN"** in navbar
4. You should see the dashboard!

---

## Troubleshooting

### "Access denied" after login?

**Cause:** The user exists but `is_admin` is not set to `true`

**Fix:** Run the UPDATE SQL query above

### "Invalid login credentials"?

**Possible causes:**
1. Email confirmation required → Check your email and confirm
2. Wrong email/password → Try again
3. User doesn't exist → Create user first

**Fix for email confirmation:**
1. Go to Supabase → **Authentication** → **Providers** → **Email**
2. **Uncheck** "Enable email confirmations" (for testing)
3. Or confirm your email first

### Can't find user in user_profiles?

**Cause:** User profile might not have been created automatically

**Fix:** Run this to create profile manually:

```sql
-- Replace with your user ID from auth.users
-- To find your user ID: Supabase → Authentication → Users → Click on your user → Copy UUID
INSERT INTO user_profiles (id, email, is_admin)
VALUES ('USER_ID_HERE', 'your-email@example.com', true)
ON CONFLICT (id) DO UPDATE SET is_admin = true;
```

---

## Quick Test After Setup

1. ✅ Login with your admin email/password
2. ✅ Click "ADMIN" in navbar
3. ✅ Should see admin dashboard (Overview, Rooms, Bookings, etc.)
4. ✅ If you see login page instead, check `is_admin = true` in database

---

## Recommended Admin Email

For production, use a professional email like:
- `admin@urbanehaauz.com`
- `management@urbanehaauz.com`

For testing, any email works (even `test@test.com`)

