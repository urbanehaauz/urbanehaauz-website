# Database Setup Instructions

## Step 1: Run the Schema

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `urbanehaauz`
3. Go to **SQL Editor** (left sidebar)
4. Click **"New query"**
5. Copy and paste the contents of `lib/database/schema.sql`
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. Wait for success message: "Success. No rows returned"

## Step 2: Seed Initial Data

1. In the same SQL Editor
2. Click **"New query"** again
3. Copy and paste the contents of `lib/database/seed.sql`
4. Click **"Run"**
5. You should see: "Success. No rows returned"

## Step 3: Create Your First Admin User

There are two ways to create an admin user:

### Option A: Via Supabase Dashboard (Recommended)

1. Go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - Email: your admin email
   - Password: create a strong password
   - Auto Confirm User: ✅ (check this)
4. Click **"Create user"**
5. Go back to **SQL Editor** and run:

```sql
-- Replace 'your-email@example.com' with your actual admin email
UPDATE user_profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

### Option B: Sign Up Normally, Then Promote

1. Go to your website and click "Login"
2. Click "Create Account" and sign up with your email
3. Go to Supabase **SQL Editor** and run:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE user_profiles
SET is_admin = true
WHERE email = 'your-email@example.com';
```

## Step 4: Verify Setup

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - `user_profiles`
   - `rooms` (with 4 rooms)
   - `bookings`
   - `staff`
   - `tasks`
   - `expenses`
   - `investments`
   - `settings` (with 2 settings)

## Step 5: Configure OAuth Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (for local dev)
   - `https://urbanehaauz-website.vercel.app/auth/callback` (for production)
   - `https://urbanehaauz.com/auth/callback` (for custom domain, when set up)

## Troubleshooting

### If schema fails:
- Make sure you're running the entire `schema.sql` file
- Check for error messages in the SQL Editor
- Some functions might fail if they already exist - that's okay

### If RLS policies block you:
- Make sure you've created an admin user
- Check that `is_admin = true` in `user_profiles` table
- You might need to temporarily disable RLS, then re-enable it

### To check if you're admin:
```sql
SELECT id, email, is_admin FROM user_profiles WHERE email = 'your-email@example.com';
```

Should return `is_admin: true`

