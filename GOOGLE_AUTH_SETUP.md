# Google OAuth Setup Guide

## Overview
Your Finance Tracker app now supports Google Sign-In/Sign-Up! Users can authenticate with their Google accounts for a seamless experience.

## Setup Steps

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth Client ID**
5. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type
   - Fill in app name: "Rizq Trackr" or your app name
   - Add your email as support email
   - Add authorized domains
6. For OAuth Client ID:
   - Application type: **Web application**
   - Name: "Rizq Trackr Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://your-production-domain.com` (for production)
   - Authorized redirect URIs:
     - `https://your-supabase-project.supabase.co/auth/v1/callback`
7. Click **Create** and save your:
   - **Client ID**
   - **Client Secret**

### 2. Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list and enable it
5. Enter your Google OAuth credentials:
   - **Client ID**: Paste from Google Console
   - **Client Secret**: Paste from Google Console
6. Note the Callback URL shown (should be `https://your-project.supabase.co/auth/v1/callback`)
7. Click **Save**

### 3. Update Redirect URLs in Google Console

1. Go back to Google Cloud Console
2. Edit your OAuth Client ID
3. Under **Authorized redirect URIs**, make sure you have:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`
   - Supabase: `https://your-project.supabase.co/auth/v1/callback`
4. Save changes

### 4. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/login` or `/signup`
3. Click **"Sign in with Google"** or **"Sign up with Google"**
4. You should be redirected to Google's OAuth consent screen
5. After authorizing, you'll be redirected back to your dashboard

## Features

- ✅ **One-Click Authentication**: Users can sign in/up with a single click
- ✅ **No Password Required**: Google handles authentication
- ✅ **Secure OAuth 2.0**: Industry-standard security protocol
- ✅ **Automatic Account Creation**: First-time Google users are automatically registered
- ✅ **Profile Information**: Fetches user's name and email from Google
- ✅ **Error Handling**: Graceful error messages if authentication fails

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure the redirect URI in Google Console matches exactly with Supabase callback URL
- Check for trailing slashes and http vs https

### "Access blocked: Authorization Error"
- Your app needs to be verified if requesting sensitive scopes
- For testing, add your email as a test user in OAuth consent screen

### "Invalid OAuth Configuration"
- Verify Client ID and Secret are correctly entered in Supabase
- Check that Google provider is enabled in Supabase

### Users Redirected to Login After Google Sign-In
- Check your middleware configuration
- Ensure the auth callback route is working correctly
- Verify Supabase session is being set properly

## Security Best Practices

1. **Never commit OAuth secrets** to version control
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** in production
4. **Regularly rotate** OAuth credentials
5. **Monitor** authentication logs in Supabase dashboard

## Need Help?

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- Check the Supabase Dashboard logs for detailed error messages

---

**Note**: The Google Sign-In button will appear on both `/login` and `/signup` pages once OAuth is configured in Supabase.
