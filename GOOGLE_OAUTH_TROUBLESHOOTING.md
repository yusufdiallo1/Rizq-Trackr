# Google OAuth Troubleshooting Guide

## Quick Setup Verification

Your Google Sign-In button is now installed with comprehensive error handling. If it's not working, follow these steps to diagnose and fix the issue.

## Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Click the "Sign in with Google" button
4. Look for error messages

### Common Error Messages:

#### "Google Sign-In is not configured"
**Cause**: Google OAuth provider is not enabled in Supabase
**Fix**: Follow the complete setup guide in `GOOGLE_AUTH_SETUP.md`

#### "redirect_uri_mismatch"
**Cause**: The callback URL in Google Console doesn't match Supabase
**Fix**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Credentials** → Your OAuth Client
3. Add these Authorized redirect URIs:
   - `https://akufeyurndcymmosmikd.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)

#### "Access blocked: Authorization Error"
**Cause**: App not verified or user not added as test user
**Fix**:
1. Go to Google Cloud Console → **OAuth consent screen**
2. Under **Test users**, add your email address
3. Save changes

## Step 2: Verify Supabase Configuration

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: `akufeyurndcymmosmikd`
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list

### Required Configuration:

- ✅ **Enabled**: Toggle should be ON (green)
- ✅ **Client ID**: Must be filled in from Google Console
- ✅ **Client Secret**: Must be filled in from Google Console
- ✅ **Authorized Client IDs**: Optional, can be left empty

If any of these are missing, you need to:
1. Get credentials from Google Cloud Console (see Step 3)
2. Paste them into Supabase
3. Click **Save**

## Step 3: Set Up Google OAuth Credentials

If you haven't set up Google OAuth yet:

### A. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it "Finance Tracker" or similar

### B. Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type → **Create**
3. Fill in required fields:
   - **App name**: Rizq Trackr (or your app name)
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **Save and Continue**
5. Skip scopes → **Save and Continue**
6. Add yourself as a test user → **Save and Continue**

### C. Create OAuth Client ID

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth Client ID**
3. Select **Web application**
4. Name: "Finance Tracker Web Client"
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - Your production domain (if deployed)
6. Add **Authorized redirect URIs**:
   - `https://akufeyurndcymmosmikd.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback`
7. Click **Create**
8. **Copy the Client ID and Client Secret** (you'll need these!)

### D. Add Credentials to Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and click to expand
5. Enable the toggle
6. Paste your **Client ID**
7. Paste your **Client Secret**
8. Click **Save**

## Step 4: Test the Integration

1. Clear your browser cache and cookies (or use Incognito mode)
2. Navigate to `/login` or `/signup`
3. Click **"Sign in with Google"** or **"Sign up with Google"**
4. You should be redirected to Google's login page
5. After logging in with Google, you should be redirected back to `/dashboard`

## Step 5: Common Issues

### Issue: Button shows error immediately
**Check**: Browser console for specific error message
**Fix**: Follow error-specific instructions above

### Issue: Redirects to Google but then shows error
**Check**: The error message on the login page after redirect
**Fix**: Usually a redirect URI mismatch - check Step 3C above

### Issue: Successful Google login but redirected back to login page
**Cause**: Session not being established (same as email/password issue)
**Status**: This should be fixed with the session verification we added
**Check**: Browser console and network tab for session errors

### Issue: "Invalid OAuth Configuration"
**Check**:
1. Client ID and Secret are correctly entered in Supabase
2. No extra spaces or characters
3. Google provider is enabled (toggle is ON)

## Step 6: Verify It's Working

After successful setup, you should see:
1. Console log: "Initiating Google OAuth with redirect URL: ..."
2. Console log: "Google OAuth initiated successfully, redirecting to Google..."
3. Browser redirects to Google login
4. After Google auth, redirects to `/dashboard`
5. You're logged in!

## Need More Help?

1. Check the main setup guide: `GOOGLE_AUTH_SETUP.md`
2. Check Supabase docs: [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
3. Check Google docs: [OAuth 2.0 for Web Apps](https://developers.google.com/identity/protocols/oauth2/web-server)
4. Look at Supabase Dashboard → Authentication → Logs for detailed error messages

## Your Supabase Project Info

- **Project URL**: `https://akufeyurndcymmosmikd.supabase.co`
- **Required Callback URL**: `https://akufeyurndcymmosmikd.supabase.co/auth/v1/callback`

Make sure this exact URL is added to your Google OAuth Client's Authorized redirect URIs!
