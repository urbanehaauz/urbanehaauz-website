# Deployment Quick Start

## 🚀 Deploy Now

### Step 1: Push to GitHub

```bash
git push origin main
```

**That's it!** GitHub Actions will automatically deploy to Vercel.

---

## 📍 When CI/CD Runs

### ✅ Automatic (No Action Needed)

**Every time you push to `main` branch:**
- Code is automatically built
- Deployed to Vercel production
- No manual steps required!

### 🖱️ Manual (Optional)

You can manually trigger deployment:

1. Go to: GitHub → Your repo → **"Actions"** tab
2. Click **"Deploy to Vercel"** workflow
3. Click **"Run workflow"** → Select branch → **"Run workflow"**

**When to use manual:**
- Testing deployment without pushing to main
- Deploying a specific commit
- Automatic deployment failed and you want to retry

---

## 🌐 Connect Your Domain

### After First Deployment

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project

2. **Add Domain:**
   - Settings → Domains
   - Enter: `urbanehaauz.com`
   - Vercel will show DNS instructions

3. **Update GoDaddy DNS:**
   - Log in to GoDaddy
   - DNS Management for `urbanehaauz.com`
   - Add records as shown in Vercel:
     - **A record**: @ → Vercel IP
     - **CNAME**: www → Vercel CNAME

4. **Wait for DNS:**
   - Usually 1-2 hours
   - Can take up to 24-48 hours

5. **Update Supabase Redirect URLs:**
   - Supabase → Authentication → URL Configuration
   - Add: `https://urbanehaauz.com/auth/callback`
   - Add: `https://www.urbanehaauz.com/auth/callback`

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] GitHub Actions workflow runs successfully
- [ ] Vercel deployment completes
- [ ] Environment variables set in Vercel
- [ ] Domain connected
- [ ] DNS records updated
- [ ] Supabase redirect URLs updated
- [ ] Site accessible at `urbanehaauz.com`
- [ ] Login/authentication works
- [ ] Admin dashboard accessible

---

## 🔍 Verify Deployment

1. **Check GitHub Actions:**
   - GitHub → Actions → Should see green checkmark ✅

2. **Check Vercel:**
   - Vercel Dashboard → Project → Deployments
   - Latest deployment should be "Ready"

3. **Test Site:**
   - Visit your Vercel URL
   - Test all features

---

## 📚 Full Documentation

See `docs/DEPLOYMENT_GUIDE.md` for complete deployment instructions.

