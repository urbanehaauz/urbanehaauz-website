# Pushing Code to GitHub

## Current Status
✅ **Code is committed locally** (commit: `31706d8`)  
✅ **Remote repository added**: `https://github.com/urbanehaauz/urbanehaauz-website.git`  
❌ **Push failed**: Permission denied for account `datachakra`

## Solutions

You need to authenticate with an account that has access to the `urbanehaauz` organization.

### Option 1: Switch GitHub CLI Account (Recommended)

```bash
# Switch to urbanehaauz account
gh auth login --hostname github.com

# Follow the prompts to authenticate with urbanehaauz account
# Then push:
git push -u origin main
```

### Option 2: Use Personal Access Token

1. **Create a Personal Access Token:**
   - Visit: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (full control of private repositories)
   - Copy the token

2. **Update remote URL with token:**
   ```bash
   git remote set-url origin https://<YOUR_TOKEN>@github.com/urbanehaauz/urbanehaauz-website.git
   git push -u origin main
   ```

### Option 3: Use SSH (if you have SSH keys for urbanehaauz)

```bash
# Change remote to SSH
git remote set-url origin git@github.com:urbanehaauz/urbanehaauz-website.git

# Push
git push -u origin main
```

### Option 4: Get Access Added

If you need to use the `datachakra` account:
1. Ask the repository owner to add `datachakra` as a collaborator
2. Or get added to the `urbanehaauz` organization

## Quick Check

After authenticating, verify:
```bash
git remote -v
git push -u origin main
```

## Current Repository Info

- **Local Branch**: `main`
- **Remote URL**: `https://github.com/urbanehaauz/urbanehaauz-website.git`
- **Last Commit**: `31706d8` - "Initial commit: Urbane Haauz Boutique Hotel Management System"
- **Files Ready**: 30 files (5,480+ lines)

