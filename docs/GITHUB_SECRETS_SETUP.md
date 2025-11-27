# GitHub Secrets Setup Guide

## 🔑 Required Secrets for CI/CD

You need to add these secrets to GitHub Actions for automatic deployment to work:

### Step-by-Step Setup

#### 1. Get Vercel Tokens

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `urbanehaauz-website`

2. **Get VERCEL_TOKEN:**
   - Go to: **Settings** → **Tokens**
   - Click **"Create Token"**
   - Name: `GitHub Actions CI/CD`
   - Scope: **Full Account** (or **Project** if you prefer)
   - Click **"Create"**
   - **COPY THE TOKEN** (you won't see it again!)

3. **Get VERCEL_ORG_ID:**
   - Go to: **Settings** → **General**
   - Look for **"Team ID"** or **"Organization ID"**
   - Copy the ID (looks like: `team_xxxxxxxxxxxxx`)

4. **Get VERCEL_PROJECT_ID:**
   - Stay in your project settings
   - Go to: **Settings** → **General**
   - Look for **"Project ID"**
   - Copy the ID (looks like: `prj_xxxxxxxxxxxxx`)

#### 2. Add Secrets to GitHub

1. **Go to GitHub Repository:**
   - Visit: https://github.com/urbanehaauz/urbanehaauz-website

2. **Navigate to Secrets:**
   - Click **"Settings"** tab (top menu)
   - Click **"Secrets and variables"** → **"Actions"** (left sidebar)

3. **Add Each Secret:**
   Click **"New repository secret"** for each:

   | Secret Name | Value | Where to Get It |
   |-------------|-------|-----------------|
   | `VERCEL_TOKEN` | Your Vercel token | Vercel → Settings → Tokens |
   | `VERCEL_ORG_ID` | Your org/team ID | Vercel → Settings → General |
   | `VERCEL_PROJECT_ID` | Your project ID | Vercel → Project Settings → General |
   | `VITE_SUPABASE_URL` | Your Supabase URL | Supabase → Settings → API |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase → Settings → API |

#### 3. Verify Secrets Are Set

1. Go back to: **Settings** → **Secrets and variables** → **"Actions"**
2. You should see all 5 secrets listed
3. Make sure they all have values (they show as `••••••••` for security)

---

## 🚀 After Adding Secrets

Once all secrets are added:

1. **Push a commit** (or trigger workflow manually):
   ```bash
   git push origin main
   ```

2. **Check GitHub Actions:**
   - Go to: **Actions** tab
   - Should see deployment running successfully ✅

---

## 🔍 Troubleshooting

### Error: "option requires argument: --token"
- **Cause:** `VERCEL_TOKEN` secret is not set or empty
- **Fix:** Make sure you copied the entire token (no spaces/line breaks)

### Error: "Project not found"
- **Cause:** `VERCEL_PROJECT_ID` is wrong
- **Fix:** Double-check project ID in Vercel project settings

### Error: "Unauthorized"
- **Cause:** `VERCEL_TOKEN` is invalid or expired
- **Fix:** Create a new token in Vercel and update the secret

---

## 📝 Quick Reference

**GitHub Secrets Location:**
```
https://github.com/urbanehaauz/urbanehaauz-website/settings/secrets/actions
```

**Vercel Tokens:**
```
https://vercel.com/account/tokens
```

**Vercel Project Settings:**
```
https://vercel.com/dashboard → Your Project → Settings → General
```

