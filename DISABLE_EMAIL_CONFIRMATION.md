# Disable Email Confirmation in Supabase

## Steps to Disable Email Confirmation

To disable email confirmation for your Supabase project:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Click on **Email** provider
5. Find the **"Confirm email"** toggle/setting
6. **Disable** the "Confirm email" option
7. Click **Save**

## What This Does

When email confirmation is disabled:
- Users are automatically confirmed upon signup
- They receive a session immediately after creating an account
- No verification email is sent
- Users can log in immediately after signup

## Code Changes Made

The following code has been updated to support auto-confirmed users:
- `lib/auth.ts` - Signup function now handles auto-confirmed users
- `app/signup/page.tsx` - Success message updated to remove email verification text
- Users are redirected to PIN setup immediately after signup

## Security Note

Disabling email confirmation reduces security by allowing unverified email addresses. Consider:
- Implementing alternative verification methods
- Monitoring for abuse
- Using rate limiting on signup endpoints

