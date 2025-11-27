# Deployment Guide

## Overview

This guide covers deploying the Urbane Haauz website to Vercel and connecting it to your domain `urbanehaauz.com`.

## Current Status

- ✅ Code ready for deployment
- ✅ Supabase database configured
- ✅ GitHub Actions CI/CD configured
- ⏳ Needs: Vercel deployment + Domain setup

---

## Step 1: Deploy to Vercel

### Option A: Connect GitHub Repository (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `urbanehaauz/urbanehaauz-website`
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
5. Add Environment Variables:
   - `VITE_SUPABASE_URL` = `https://lqvccvtsydzptgsrncmz.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your anon key)
6. Click **"Deploy"**

### Option B: Deploy via GitHub Actions (CI/CD)

The GitHub Actions workflow (`.github/workflows/deploy.yml`) is configured to deploy on:
- ✅ **Push to `main` branch** (automatic)
- ✅ **Manual trigger** (workflow_dispatch)

**To trigger manual deployment:**
1. Go to GitHub → Your repository
2. Click **"Actions"** tab
3. Select **"Deploy to Vercel"** workflow
4. Click **"Run workflow"** → Select branch → **"Run workflow"**

---

## Step 2: Connect Domain (urbanehaauz.com)

### In Vercel Dashboard

1. Go to your project in Vercel
2. Click **"Settings"** → **"Domains"**
3. Enter your domain: `urbanehaauz.com`
4. Vercel will show DNS configuration instructions

### In GoDaddy (Domain Provider)

1. Log in to GoDaddy
2. Go to **DNS Management** for `urbanehaauz.com`
3. Update DNS records as shown in Vercel:

**For Root Domain (urbanehaauz.com):**
- **Type**: A
- **Name**: @
- **Value**: `76.76.21.21` (Vercel will provide the actual IP)

**For www (www.urbanehaauz.com):**
- **Type**: CNAME
- **Name**: www
- **Value**: `cname.vercel-dns.com` (Vercel will provide)

4. Save changes
5. Wait 24-48 hours for DNS propagation (usually takes 1-2 hours)

### Verify Domain

1. Go to Vercel → Project → Settings → Domains
2. Wait for domain to show as "Valid"
3. Test: Visit `https://urbanehaauz.com` (should work!)

---

## Step 3: Update Supabase Redirect URLs

After deploying to your domain:

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `https://urbanehaauz.com/auth/callback`
   - `https://www.urbanehaauz.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)

---

## When Does CI/CD Run?

### Automatic Triggers ✅

1. **Push to `main` branch** → Automatically deploys to Vercel
2. **Pull Request to `main`** → Creates preview deployment

### Manual Triggers 🖱️

You can manually trigger deployment:

1. **Via GitHub Actions:**
   - GitHub → Actions → "Deploy to Vercel" → "Run workflow"

2. **Via Vercel Dashboard:**
   - Vercel → Project → "Deployments" → "Redeploy"

### When to Run Manually?

Run manual deployment when:
- ✅ You want to deploy without pushing to `main`
- ✅ You want to test deployment process
- ✅ Automatic deployment failed and you fixed it
- ✅ You want to deploy a specific commit

**For normal development:**
- Just push to `main` → Automatic deployment happens!

---

## Environment Variables

### In Vercel Dashboard

Go to: Project → Settings → Environment Variables

Add:
```
VITE_SUPABASE_URL=https://lqvccvtsydzptgsrncmz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Add these for all environments:
- Production
- Preview
- Development

---

## Deployment Checklist

Before deploying:
- [ ] Code committed and pushed to GitHub
- [ ] All environment variables set in Vercel
- [ ] Supabase database configured
- [ ] Tested locally (`npm run dev`)
- [ ] Build works (`npm run build`)

After deploying:
- [ ] Site loads at Vercel URL
- [ ] Domain connected and working
- [ ] Login/authentication works
- [ ] Admin dashboard accessible
- [ ] Rooms display correctly
- [ ] Booking flow works

---

## Troubleshooting

### Deployment Fails

1. Check Vercel deployment logs
2. Verify environment variables are set
3. Check build command is correct
4. Ensure all dependencies are in `package.json`

### Domain Not Working

1. Wait 24-48 hours for DNS propagation
2. Verify DNS records in GoDaddy match Vercel instructions
3. Check domain status in Vercel dashboard
4. Clear browser cache and try again

### OAuth Redirect Errors

1. Update Supabase redirect URLs with production domain
2. Verify OAuth providers are configured
3. Check redirect URL format matches exactly

---

## Post-Deployment

### Update Documentation

After domain is live, update:
- README.md with production URL
- Any hardcoded localhost URLs

### Monitor

- Check Vercel analytics
- Monitor Supabase usage
- Set up error tracking (optional)

