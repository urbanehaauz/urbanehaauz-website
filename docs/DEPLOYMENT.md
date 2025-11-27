# Deployment Guide

## Quick Answer: When to Run CI/CD Manually?

**You DON'T need to run it manually for normal deployments!**

### Automatic Deployment ✅
- **Every push to `main` branch** → Automatically deploys
- **Pull requests** → Creates preview deployments

### Manual Deployment (Optional) 🖱️
Run manually only when:
- Testing deployment without pushing to main
- Automatic deployment failed
- Deploying a specific commit/version

---

## Full Deployment Process

See `DEPLOYMENT_GUIDE.md` in the root directory for complete instructions.

