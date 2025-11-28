# 🚀 Deployment Checklist - NEVER SKIP THIS!

This checklist ensures your Vercel deployments NEVER fail due to TypeScript or build errors.

## ⚠️ BEFORE EVERY PUSH TO MAIN

Run these commands **IN ORDER** before pushing:

### 1️⃣ Type Check (MANDATORY)
```bash
npm run type-check
```
**This catches TypeScript errors before deployment!**

### 2️⃣ Build Test (MANDATORY)
```bash
npm run build
```
**This simulates Vercel's production build!**

### 3️⃣ Quick Validation (Alternative to above)
```bash
npm run validate
```
**Runs both type-check and build in one command!**

---

## 🛡️ Automated Protection

### GitHub Actions CI (Automatic)
Every push to `main` or `develop` automatically runs:
- ✅ TypeScript type checking
- ✅ Production build test
- ✅ Uploads build artifacts

**If CI fails, DO NOT merge to main!**

### Pre-Deploy Quick Check
```bash
npm run pre-deploy
```
Runs type-check only (faster feedback before pushing)

---

## 🐛 Common Issues & Fixes

### Issue 1: TypeScript Type Errors
**Symptom:** `Type 'X' is not assignable to type 'Y'`

**Fix:**
1. Run `npm run type-check` locally
2. Fix all type errors shown
3. Run `npm run type-check` again to verify
4. Only then push to GitHub

### Issue 2: Recharts Tooltip Type Errors
**Symptom:** `readonly` vs mutable array type errors

**Fix:** Use `readonly` arrays for Recharts tooltip props:
```typescript
// ❌ WRONG
({ active, payload }: { active?: boolean; payload?: Array<...> })

// ✅ CORRECT
({ active, payload }: { active?: boolean; payload?: readonly {...}[] })
```

### Issue 3: Import/Export Mismatches
**Symptom:** `'X' is not exported from './Y'`

**Fix:**
1. Check the source file's exports
2. Import only what's actually exported
3. Use named exports, not default exports for utilities

---

## 📋 Pre-Deployment Workflow

### Every Single Time Before Deploy:

```bash
# 1. Make your code changes
# 2. Test locally
npm run dev

# 3. Type check
npm run type-check

# 4. If type check passes, test production build
npm run build

# 5. If build passes, commit
git add .
git commit -m "Your commit message"

# 6. Push to GitHub
git push origin main

# 7. Vercel auto-deploys (watch the deployment in Vercel dashboard)
```

---

## 🔍 Vercel Deployment Monitoring

After pushing to main:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Watch the deployment logs in real-time
3. If it fails:
   - Copy the error message
   - Fix locally using the error message
   - Run `npm run validate` to verify fix
   - Push again

---

## 🎯 The Golden Rule

**NEVER push to main without running:**
```bash
npm run validate
```

**This single command prevents 99% of deployment failures!**

---

## ⚡ Quick Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run type-check` | Check TypeScript types | Before every commit |
| `npm run build` | Test production build | Before pushing to main |
| `npm run validate` | Type check + build | Before pushing to main |
| `npm run pre-deploy` | Quick type check | Fast pre-push verification |

---

## 🚨 Emergency: Deployment Failed

If Vercel deployment fails despite running checks:

1. **Check Node/Next.js versions match:**
   - Local: Check `package.json`
   - Vercel: Uses Next.js 14.2.33 (as of this doc)

2. **Check environment variables in Vercel:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Re-run validation locally:**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run validate
   ```

4. **If still failing, check Vercel logs for:**
   - TypeScript errors (fix types)
   - Import errors (check exports)
   - Build errors (check dependencies)

---

## ✅ Success Criteria

Your deployment is ready when:

- ✅ `npm run type-check` completes with no errors
- ✅ `npm run build` completes successfully
- ✅ All features work in development (`npm run dev`)
- ✅ GitHub Actions CI passes (if configured)
- ✅ You've read this checklist!

---

**Last Updated:** 2025-11-28
**Maintained By:** Development Team
