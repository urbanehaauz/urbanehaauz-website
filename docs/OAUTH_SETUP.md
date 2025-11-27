# OAuth Provider Setup (Optional - For Later)

Currently, OAuth providers (Google, Facebook, Apple) are **disabled** because they require additional setup. You can use **email/password login** which is already working.

## Why OAuth Providers Need Setup

Each OAuth provider requires:
1. Creating an app in their developer console
2. Getting API keys and secrets
3. Configuring redirect URLs
4. Setting up in Supabase dashboard

This is complex and can be done later. **Email/password login works perfectly fine for now.**

## Current Status

- ✅ **Email/Password Login** - Fully working
- ❌ **Google OAuth** - Not configured (disabled in UI)
- ❌ **Facebook OAuth** - Not configured (disabled in UI)
- ❌ **Apple OAuth** - Not configured (disabled in UI)

## When You're Ready to Enable OAuth (Later)

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URI: `https://lqvccvtsydzptgsrncmz.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret
7. Go to Supabase → Authentication → Providers → Google
8. Enable Google and paste Client ID and Secret

### Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. Set Valid OAuth Redirect URIs: `https://lqvccvtsydzptgsrncmz.supabase.co/auth/v1/callback`
5. Copy App ID and App Secret
6. Go to Supabase → Authentication → Providers → Facebook
7. Enable Facebook and paste App ID and Secret

### Apple OAuth Setup

1. Requires Apple Developer account ($99/year)
2. Create App ID in Apple Developer Console
3. Configure Sign in with Apple
4. Get Service ID and Key
5. Configure in Supabase

## For Now

**Just use email/password login** - it's secure, works great, and doesn't require any additional setup!

