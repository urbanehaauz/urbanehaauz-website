# Google Login Setup - Step by Step Guide

Follow these steps to enable Google OAuth login for your Urbane Haauz website.

## Prerequisites

- ✅ Google account (Gmail account)
- ✅ Access to Supabase dashboard
- ✅ Your Supabase project URL: `https://lqvccvtsydzptgsrncmz.supabase.co`

---

## Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click the project dropdown at the top (next to "Google Cloud")
   - Click **"New Project"**
   - **Project Name**: `Urbane Haauz` (or any name you prefer)
   - **Organization**: Leave as default (if applicable)
   - Click **"Create"**
   - Wait for project creation (10-30 seconds)

3. **Select Your Project**
   - Make sure your new project is selected in the project dropdown

---

## Step 2: Configure OAuth Consent Screen

1. **Navigate to OAuth Consent Screen**
   - In the left sidebar, go to **"APIs & Services"** → **"OAuth consent screen"**
   - Or search for "OAuth consent screen" in the top search bar

2. **Choose User Type**
   - Select **"External"** (unless you have a Google Workspace account)
   - Click **"Create"**

3. **Fill in App Information**
   - **App name**: `Urbane Haauz`
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload your logo if you have one
   - **App domain**: `urbanehaauz.com`
   - **Developer contact information**: Your email address
   - Click **"Save and Continue"**

4. **Scopes** (Skip for now)
   - Click **"Save and Continue"** (no scopes needed for basic login)

5. **Test Users** (Skip for now)
   - Click **"Save and Continue"** (not needed if app is in production)

6. **Summary**
   - Review your settings
   - Click **"Back to Dashboard"**

---

## Step 3: Create OAuth 2.0 Credentials

1. **Go to Credentials**
   - In the left sidebar, go to **"APIs & Services"** → **"Credentials"**
   - Or search for "Credentials" in the top search bar

2. **Create OAuth Client ID**
   - Click **"+ CREATE CREDENTIALS"** at the top
   - Select **"OAuth client ID"**

3. **Configure OAuth Client**
   - **Application type**: Select **"Web application"**
   - **Name**: `Urbane Haauz Web Client` (or any name)

4. **Authorized JavaScript origins**
   - Click **"+ ADD URI"**
   - Add: `https://urbanehaauz.com`
   - Click **"+ ADD URI"** again
   - Add: `https://www.urbanehaauz.com`
   - (Optional) Add: `http://localhost:3000` (for local development)

5. **Authorized redirect URIs** (IMPORTANT!)
   - Click **"+ ADD URI"**
   - Add: `https://lqvccvtsydzptgsrncmz.supabase.co/auth/v1/callback`
   - ⚠️ **This must match exactly!** Copy it carefully.
   - Click **"+ ADD URI"** again
   - Add: `https://urbanehaauz.com/auth/callback`
   - Click **"+ ADD URI"** again
   - Add: `https://www.urbanehaauz.com/auth/callback`

6. **Create Client ID**
   - Click **"CREATE"**
   - A popup will appear with your credentials

7. **Copy Your Credentials** ⚠️ IMPORTANT!
   - **Client ID**: Copy this (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
   - **Client Secret**: Copy this (looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)
   - ⚠️ **Save these securely!** You'll need them for Supabase.

---

## Step 4: Configure Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `urbanehaauz` (or your project name)

2. **Navigate to Authentication → Providers**
   - In the left sidebar, click **"Authentication"**
   - Click **"Providers"** tab

3. **Enable Google Provider**
   - Find **"Google"** in the list of providers
   - Click the toggle to **enable** it

4. **Enter Google Credentials**
   - **Client ID (for OAuth)**: Paste your Google Client ID from Step 3
   - **Client Secret (for OAuth)**: Paste your Google Client Secret from Step 3
   - Click **"Save"**

5. **Verify Configuration**
   - The Google provider should now show as **"Enabled"** ✅

---

## Step 5: Update Redirect URLs in Supabase

1. **Go to Authentication → URL Configuration**
   - In Supabase, go to **"Authentication"** → **"URL Configuration"**

2. **Add Redirect URLs** (if not already added)
   - **Site URL**: `https://urbanehaauz.com`
   - **Redirect URLs**: Add these (one per line):
     ```
     https://urbanehaauz.com/auth/callback
     https://www.urbanehaauz.com/auth/callback
     http://localhost:3000/auth/callback
     ```
   - Click **"Save"**

---

## Step 6: Enable Google Button in Code

After completing Steps 1-5, the Google login button will be automatically enabled. The code is already set up to work once Supabase is configured.

---

## Step 7: Test Google Login

1. **Visit Your Website**
   - Go to: `https://urbanehaauz.com`
   - Click **"Sign In"** or the user icon

2. **Test Google Login**
   - Click **"Continue with Google"** button
   - You should be redirected to Google's login page
   - Sign in with your Google account
   - You should be redirected back to your website
   - You should be logged in! ✅

---

## Troubleshooting

### Issue: "Error 400: redirect_uri_mismatch"
**Solution**: 
- Go back to Google Cloud Console → Credentials
- Make sure the redirect URI `https://lqvccvtsydzptgsrncmz.supabase.co/auth/v1/callback` is added exactly as shown

### Issue: "OAuth client not found"
**Solution**:
- Verify your Client ID and Client Secret are correct in Supabase
- Make sure there are no extra spaces when copying

### Issue: Button still shows "Coming Soon"
**Solution**:
- The button is disabled in code until Supabase is configured
- After completing Steps 1-5, we'll enable the button in code

### Issue: Login works but user is not created
**Solution**:
- Check Supabase → Authentication → Users
- The user should be created automatically
- If not, check Supabase logs for errors

---

## Security Notes

- ⚠️ **Never share your Client Secret publicly**
- ✅ Keep your Google Cloud Console credentials secure
- ✅ Regularly review OAuth consent screen settings
- ✅ Monitor authentication logs in Supabase

---

## Next Steps

After Google login is working:
- ✅ Test with multiple Google accounts
- ✅ Verify user profiles are created correctly
- ✅ Test admin login (if applicable)
- ✅ Consider enabling Facebook/Apple login (optional)

---

## Quick Reference

**Supabase Project URL**: `https://lqvccvtsydzptgsrncmz.supabase.co`  
**Required Redirect URI**: `https://lqvccvtsydzptgsrncmz.supabase.co/auth/v1/callback`  
**Your Domain**: `https://urbanehaauz.com`

