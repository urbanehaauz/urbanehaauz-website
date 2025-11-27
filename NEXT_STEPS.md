# 🚀 Next Steps - Deployment Checklist

## ✅ Step 1: Push to GitHub (Auto-Deploys!)

```bash
git push origin main
```

**What happens:**
- Code pushed to GitHub
- GitHub Actions automatically runs
- Builds and deploys to Vercel
- Site goes live!

**Check deployment:**
- GitHub → Actions tab → See deployment status
- Wait 1-2 minutes for deployment to complete

---

## ✅ Step 2: First-Time Vercel Setup (If Not Done Yet)

### A. Create Vercel Project

1. Go to: https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Click **"Import"** next to your GitHub repo: `urbanehaauz/urbanehaauz-website`
4. Configure:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
5. Click **"Deploy"**

### B. Add Environment Variables

**Before deploying, add these:**

1. In Vercel project setup, expand **"Environment Variables"**
2. Add:
   ```
   VITE_SUPABASE_URL = https://lqvccvtsydzptgsrncmz.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdmNjdnRzeWR6cHRnc3JuY216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjYxMzksImV4cCI6MjA3OTc0MjEzOX0.EkcTvD4u8Jf6sS4tfwTwNugj3XvRcyOrdP_R5k6w45o
   ```
3. Make sure they're added for **Production**, **Preview**, and **Development**
4. Click **"Deploy"**

### C. Get Vercel Tokens (For GitHub Actions)

After first deployment:

1. Go to Vercel → **Settings** → **Tokens**
2. Create new token: Name it "GitHub Actions"
3. Copy the token
4. Go to GitHub → Your repo → **Settings** → **Secrets and variables** → **Actions**
5. Click **"New repository secret"**
6. Add these secrets:
   - `VERCEL_TOKEN` = (Your Vercel token from step 2)
   - `VERCEL_ORG_ID` = (Get from Vercel project settings → General)
   - `VERCEL_PROJECT_ID` = (Get from Vercel project settings → General)
   - `VITE_SUPABASE_URL` = `https://lqvccvtsydzptgsrncmz.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## ✅ Step 3: Connect Your Domain (urbanehaauz.com)

### In Vercel:

1. Go to your project → **Settings** → **Domains**
2. Enter: `urbanehaauz.com`
3. Click **"Add"**
4. Vercel will show DNS configuration

### In GoDaddy:

1. Log in to GoDaddy
2. Go to **My Products** → **Domains** → `urbanehaauz.com`
3. Click **"DNS"** or **"Manage DNS"**
4. Add/Update DNS records:

   **For root domain (urbanehaauz.com):**
   - Type: **A**
   - Name: `@`
   - Value: `76.76.21.21` (Vercel will provide actual IP - check Vercel dashboard)
   - TTL: 3600 (or default)

   **For www (www.urbanehaauz.com):**
   - Type: **CNAME**
   - Name: `www`
   - Value: `cname.vercel-dns.com` (Vercel will provide exact value)
   - TTL: 3600 (or default)

5. Save all changes

### Wait for DNS:

- Usually takes: 1-2 hours
- Can take up to: 24-48 hours
- Check status in Vercel → Domains → Should show "Valid" when ready

---

## ✅ Step 4: Update Supabase Redirect URLs

After your domain is connected:

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `https://urbanehaauz.com/auth/callback`
   - `https://www.urbanehaauz.com/auth/callback`
   - `http://localhost:3000/auth/callback` (keep for local dev)
3. Click **"Save"**

---

## ✅ Step 5: Verify Everything Works

### Test Your Live Site:

1. **Visit your Vercel URL:**
   - Check Vercel dashboard for your project URL
   - Usually: `https://your-project.vercel.app`

2. **Visit your domain (after DNS propagates):**
   - `https://urbanehaauz.com`
   - `https://www.urbanehaauz.com`

3. **Test features:**
   - ✅ Home page loads
   - ✅ Rooms page shows rooms
   - ✅ Can create account / login
   - ✅ Can access admin dashboard (if logged in as admin)
   - ✅ Booking flow works

---

## 🖱️ When to Run CI/CD Manually?

### You DON'T need to run it manually!

**It runs automatically when:**
- ✅ You push to `main` branch
- ✅ You create a pull request

**Run manually only if:**
- Testing deployment without pushing to main
- Retrying after a failed automatic deployment
- Deploying a specific commit

**To run manually:**
1. GitHub → **Actions** tab
2. Select **"Deploy to Vercel"** workflow
3. Click **"Run workflow"**
4. Select branch → **"Run workflow"**

---

## 📋 Quick Checklist

- [ ] Push code to GitHub: `git push origin main`
- [ ] Create Vercel project and add environment variables
- [ ] Add GitHub secrets for CI/CD
- [ ] Connect domain in Vercel
- [ ] Update DNS in GoDaddy
- [ ] Wait for DNS propagation
- [ ] Update Supabase redirect URLs
- [ ] Test live site
- [ ] Verify all features work

---

## 🆘 Need Help?

- Check `docs/DEPLOYMENT.md` for detailed instructions
- Check `docs/DEPLOYMENT_QUICK_START.md` for quick reference
- Check GitHub Actions logs if deployment fails
- Check Vercel deployment logs for build errors

