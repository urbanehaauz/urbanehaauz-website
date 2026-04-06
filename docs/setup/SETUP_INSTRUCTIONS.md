# Step-by-Step Setup Instructions

## Phase 1: Manual Account Setup (Do This First)

### 1. Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up" → Select "Continue with GitHub"
3. Authorize Vercel to access your GitHub account
4. Complete the onboarding (skip team creation for now)
5. **✅ Done when:** You're logged into Vercel dashboard

### 2. Create Supabase Project
1. Go to https://supabase.com
2. Click "Start your project" → Sign up (free tier is fine)
3. Click "New Project"
4. Fill in:
   - **Name:** `urbanehaauz` (or your choice)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users (e.g., "Southeast Asia (Singapore)")
   - **Pricing Plan:** Free (or Pro if needed)
5. Click "Create new project" and wait ~2 minutes for provisioning
6. Once ready, go to **Settings** → **API**
7. **Copy these values (you'll need them):**
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)
   - **service_role key** (keep this SECRET - admin only)

### 3. Enable Authentication Providers in Supabase
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable these providers:
   - **Google** - Click "Enable" → Follow setup (requires Google Cloud Console setup)
   - **Facebook** - Click "Enable" → Follow setup (requires Facebook App setup)
   - **Apple** - Click "Enable" → Follow setup (requires Apple Developer account)
3. **For now, just enable Email/Password** - We can add OAuth providers later if needed
4. **Note:** Each OAuth provider requires additional setup in their respective platforms

### 4. Domain Setup (We'll do this after Vercel deployment)
- Have your GoDaddy domain `urbanehaauz.com` ready
- We'll configure DNS after we get the Vercel deployment URL

---

## Phase 2: What I'll Do (After You Complete Phase 1)

Once you have:
- ✅ Vercel account created
- ✅ Supabase project created with URL and keys
- ✅ Email me the Supabase Project URL and anon key

I will:
1. **Create Vercel configuration** (`vercel.json`)
2. **Set up GitHub Actions workflow** (`.github/workflows/deploy.yml`)
3. **Install Supabase client** and configure it
4. **Create authentication system** with login UI
5. **Design and create database schema** in Supabase
6. **Migrate your app** from mock data to real database
7. **Update booking flow** to support optional authentication
8. **Migrate admin login** to use Supabase auth

---

## Quick Start Command (After Phase 1)

Once you have your Supabase credentials, tell me:
- "I have my Supabase URL and anon key ready"
- And share: `Project URL: https://xxxxx.supabase.co` and `Anon Key: eyJ...`

Then I'll proceed with all the code changes!

---

## Notes

- **Vercel Free Tier:** Unlimited deployments, 100GB bandwidth/month - perfect for starting
- **Supabase Free Tier:** 500MB database, 2GB bandwidth - good for initial development
- **OAuth Setup:** Can be complex (Google/Facebook/Apple require app registrations) - we can start with email/password and add OAuth later
- **Domain:** We'll connect it after deployment is working

