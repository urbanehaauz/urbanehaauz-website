# GitHub Actions CI/CD

## Workflow: Deploy to Vercel

This workflow automatically deploys your application to Vercel.

## When It Runs

### ✅ Automatic Triggers

**Every push to `main` branch:**
- Code is automatically built
- Deployed to Vercel production
- No manual action needed!

### 🖱️ Manual Trigger

1. Go to GitHub → **Actions** tab
2. Select **"Deploy to Vercel"** workflow
3. Click **"Run workflow"**
4. Select branch and click **"Run workflow"**

**Use manual trigger when:**
- Testing deployment
- Deploying without pushing to main
- Retrying failed deployment

## Required Secrets

Add these in GitHub → Settings → Secrets and variables → Actions:

- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Workflow Steps

1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Build application (with env vars)
5. Install Vercel CLI
6. Deploy to Vercel production

## Viewing Deployments

- **GitHub**: Actions tab → Select workflow run
- **Vercel**: Dashboard → Project → Deployments
