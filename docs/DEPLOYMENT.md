# Deployment Guide

## 🚀 Quick Answer: When Does CI/CD Run?

### ✅ Automatic Deployment (No Manual Action Needed!)

**Every time you push to `main` branch:**
```bash
git push origin main
```

That's it! GitHub Actions automatically:
1. Builds your app
2. Deploys to Vercel production
3. Makes it live

### 🖱️ Manual Deployment (Optional)

You can also trigger manually:

1. Go to GitHub → Your repository
2. Click **"Actions"** tab
3. Select **"Deploy to Vercel"** workflow
4. Click **"Run workflow"** → Select branch → **"Run workflow"**

**When to use manual:**
- Testing deployment without pushing to main
- Deploying a specific commit
- Retrying after a failed automatic deployment

---

## 📍 Deployment Process

### Step 1: First Deployment Setup

#### A. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import GitHub repository: `urbanehaauz/urbanehaauz-website`
4. Configure:
   - **Framework**: Vite (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=https://lqvccvtsydzptgsrncmz.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
6. Click **"Deploy"**

#### B. Get Vercel Tokens (For GitHub Actions)

1. Go to Vercel → **Settings** → **Tokens**
2. Create new token: Name it "GitHub Actions"
3. Copy the token
4. Go to GitHub → Your repo → **Settings** → **Secrets and variables** → **Actions**
5. Add secrets:
   - `VERCEL_TOKEN` = Your Vercel token
   - `VERCEL_ORG_ID` = Get from Vercel project settings
   - `VERCEL_PROJECT_ID` = Get from Vercel project settings
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

### Step 2: Push Code (Triggers Auto-Deploy)

```bash
git push origin main
```

GitHub Actions will automatically deploy!

### Step 3: Connect Your Domain (urbanehaauz.com)

#### In Vercel:

1. Go to your project → **Settings** → **Domains**
2. Enter: `urbanehaauz.com`
3. Click **"Add"**
4. Vercel will show DNS configuration

#### In GoDaddy:

1. Log in to GoDaddy
2. Go to **DNS Management** for `urbanehaauz.com`
3. Update DNS records (Vercel will provide exact values):

   **For root domain:**
   - Type: **A**
   - Name: `@`
   - Value: `76.76.21.21` (or IP Vercel provides)

   **For www:**
   - Type: **CNAME**
   - Name: `www`
   - Value: `cname.vercel-dns.com` (Vercel will provide)

4. Save changes

#### Wait for DNS Propagation:

- Usually: 1-2 hours
- Maximum: 24-48 hours
- Check in Vercel → Domains when it shows "Valid"

### Step 4: Update Supabase Redirect URLs

After domain is connected:

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `https://urbanehaauz.com/auth/callback`
   - `https://www.urbanehaauz.com/auth/callback`
   - `http://localhost:3000/auth/callback` (keep for local dev)

---

## ✅ Normal Workflow (After Initial Setup)

For regular updates:

1. **Make changes locally**
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "your commit message"
   git push origin main
   ```
3. **That's it!** Automatic deployment happens
4. **Wait 1-2 minutes** for deployment to complete
5. **Check Vercel dashboard** to see deployment status

---

## 🔍 Verify Deployment

### Check GitHub Actions:
1. Go to GitHub → **Actions** tab
2. Should see green checkmark ✅ for latest deployment

### Check Vercel:
1. Go to Vercel Dashboard
2. Project → **Deployments**
3. Latest should show "Ready" status

### Test Your Site:
1. Visit your Vercel URL
2. Or visit `https://urbanehaauz.com` (after DNS propagates)
3. Test all features

---

## 📋 Deployment Checklist

Before deploying:
- [ ] Code tested locally
- [ ] All changes committed
- [ ] Environment variables set in Vercel

After first deployment:
- [ ] Vercel project created
- [ ] Domain connected
- [ ] DNS records updated in GoDaddy
- [ ] Supabase redirect URLs updated
- [ ] Site accessible
- [ ] Login works
- [ ] Admin dashboard accessible

---

## 🆘 Troubleshooting

### GitHub Actions Fails

1. Check Actions tab for error details
2. Verify all secrets are set in GitHub
3. Check Vercel tokens are valid

### Vercel Deployment Fails

1. Check Vercel deployment logs
2. Verify environment variables
3. Check build command works locally

### Domain Not Working

1. Wait for DNS propagation (up to 48 hours)
2. Verify DNS records match Vercel instructions exactly
3. Check domain status in Vercel dashboard

---

## 📚 Related Documentation

- `DEPLOYMENT_QUICK_START.md` - Quick reference
- `SETUP_INSTRUCTIONS.md` - Initial setup
- `DATABASE_SETUP.md` - Database configuration
