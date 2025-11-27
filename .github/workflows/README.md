# GitHub Actions Deployment Workflow

This workflow deploys the application to Vercel when:
- A GitHub Release is published (tags)
- Manual trigger from Actions tab

## Setup Required

### 1. Vercel Secrets (Required)

You need to add these secrets to your GitHub repository:

1. Go to your repository: `https://github.com/urbanehaauz/urbanehaauz-website/settings/secrets/actions`
2. Click "New repository secret"
3. Add these secrets:

#### VERCEL_TOKEN
- Go to Vercel: https://vercel.com/account/tokens
- Click "Create Token"
- Name it (e.g., "GitHub Actions")
- Copy the token
- Add as `VERCEL_TOKEN` secret

#### VERCEL_ORG_ID
- Go to Vercel project settings
- Copy "Organization ID"
- Add as `VERCEL_ORG_ID` secret

#### VERCEL_PROJECT_ID
- Go to Vercel project settings
- Copy "Project ID"
- Add as `VERCEL_PROJECT_ID` secret

#### VITE_SUPABASE_URL
- Your Supabase project URL: `https://lqvccvtsydzptgsrncmz.supabase.co`
- Add as `VITE_SUPABASE_URL` secret

#### VITE_SUPABASE_ANON_KEY
- Your Supabase anon key (from Supabase dashboard)
- Add as `VITE_SUPABASE_ANON_KEY` secret

### 2. How to Deploy

#### Option A: Create a GitHub Release
```bash
# Create a release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Then create a release on GitHub:
# Go to: https://github.com/urbanehaauz/urbanehaauz-website/releases/new
# Select the tag, add release notes, click "Publish release"
```

#### Option B: Manual Trigger
1. Go to: https://github.com/urbanehaauz/urbanehaauz-website/actions
2. Select "Deploy to Vercel" workflow
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow"

## Notes

- The workflow builds the app with environment variables
- Deployment happens automatically to Vercel production
- Make sure all secrets are set before deploying

