# How to Disable Email Confirmation (For Testing)

By default, Supabase requires users to confirm their email before they can log in. If you want to disable this for testing/development:

## Option 1: Disable in Supabase Dashboard (Recommended for Development)

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Providers**
4. Click on **Email** provider
5. Find **"Confirm email"** setting
6. **Uncheck** "Enable email confirmations"
7. Click **Save**

**Note:** This disables email confirmation for ALL users. For production, you should keep it enabled.

## Option 2: Auto-Confirm Users in Supabase

If you want to keep email confirmation enabled but auto-confirm specific users:

1. Go to Supabase → **Authentication** → **Users**
2. Find the user you want to auto-confirm
3. Click on the user
4. Check **"Auto Confirm User"** checkbox
5. Save

## Option 3: Update Code to Handle Unconfirmed Users

The code has been updated to show a helpful message after signup, telling users to check their email.

## Current Behavior

✅ After signup: Shows message "Account created! Please check your email to confirm your account before signing in."

✅ After email confirmation: User can log in normally

❌ If user tries to log in before confirming: Shows "Invalid login credentials" or "Email not confirmed"

## For Production

Keep email confirmation enabled for security. Users should check their email and click the confirmation link before logging in.

