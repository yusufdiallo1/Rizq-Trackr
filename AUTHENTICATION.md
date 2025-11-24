# Authentication System Documentation

## Overview

The Finance Tracker application includes a complete authentication system built with Supabase. This document explains how the authentication flow works.

## Pages Created

### 1. Home Page (`/`)
- Landing page with Login and Sign Up buttons
- Automatically redirects authenticated users to `/dashboard`
- Shows app features and information for unauthenticated users

### 2. Login Page (`/login`)
- **Fields:**
  - Email (required, validated)
  - Password (required, min 6 characters)
  - Show/Hide password toggle
- **Links:**
  - Forgot password
  - Sign up for new users
- **Validation:**
  - Email format validation
  - Password length check
- **Behavior:**
  - Redirects to `/dashboard` on successful login
  - Shows error messages for invalid credentials
  - Cannot access if already logged in (redirects to dashboard)

### 3. Sign Up Page (`/signup`)
- **Fields:**
  - Email (required, validated)
  - Password (required, min 8 characters)
  - Confirm Password (must match)
  - Show/Hide password toggle
- **Features:**
  - Password strength indicator (weak/medium/strong)
  - Visual strength bar with colors
  - Real-time password match validation
- **Behavior:**
  - Sends verification email to user
  - Shows success message
  - Redirects to login page after 2 seconds
  - Cannot access if already logged in

### 4. Forgot Password Page (`/forgot-password`)
- **Fields:**
  - Email (required, validated)
- **Behavior:**
  - Sends password reset email via Supabase
  - Shows success message
  - Provides link back to login

### 5. Dashboard Page (`/dashboard`)
- **Protected Route** - requires authentication
- Shows user information
- Displays income, expenses, and zakat summary (placeholder data)
- Sign out button
- Automatically redirects to login if not authenticated

## Authentication Functions (`/lib/auth.ts`)

### Core Functions

1. **`signUp(email, password)`**
   - Creates new user account
   - Sends verification email
   - Returns success/error status

2. **`signIn(email, password)`**
   - Authenticates existing user
   - Creates session
   - Returns success/error status

3. **`signOut()`**
   - Logs out current user
   - Clears session
   - Returns success/error status

4. **`resetPassword(email)`**
   - Sends password reset email
   - Returns success/error status

5. **`getCurrentUser()`**
   - Gets currently logged-in user
   - Returns user object or null

6. **`isAuthenticated()`**
   - Checks if user has valid session
   - Returns boolean

### Helper Functions

1. **`validateEmail(email)`**
   - Validates email format using regex
   - Returns boolean

2. **`checkPasswordStrength(password)`**
   - Analyzes password complexity
   - Returns: 'weak', 'medium', or 'strong'
   - Checks for:
     - Length (8+, 12+ characters)
     - Lowercase letters
     - Uppercase letters
     - Numbers
     - Special characters

## Middleware (`/middleware.ts`)

### Purpose
Protects routes and manages redirects based on authentication state.

### Rules

1. **Authenticated users accessing auth pages** (`/login`, `/signup`, `/forgot-password`)
   - Redirects to `/dashboard`

2. **Unauthenticated users accessing protected pages** (`/dashboard/*`)
   - Redirects to `/login`

3. **All other routes**
   - Allow access

### Protected Routes
- `/dashboard` and all sub-routes

### Public Routes
- `/` (home)
- `/login`
- `/signup`
- `/forgot-password`

## Auth Callback Handler (`/app/auth/callback/route.ts`)

Handles OAuth callbacks and email verification links from Supabase.
- Exchanges authorization code for session
- Redirects to dashboard after successful verification

## Session Management

### Client-Side
- Sessions are automatically managed by Supabase
- Each page checks authentication on load
- Redirects happen automatically based on auth state

### Server-Side
- Middleware validates session on every request
- Protected routes require valid session
- Session refresh handled automatically by Supabase

## User Flow

### New User Registration
1. User visits `/signup`
2. Fills out form with email, password, confirm password
3. System validates input and checks password strength
4. On submit, creates account via Supabase
5. Supabase sends verification email
6. User sees success message
7. Redirects to `/login` after 2 seconds
8. User checks email and clicks verification link
9. Redirected to `/dashboard` after verification

### Existing User Login
1. User visits `/login`
2. Enters email and password
3. System validates credentials via Supabase
4. On success, redirects to `/dashboard`
5. Session persists across page reloads

### Password Reset
1. User visits `/forgot-password` or clicks link from login
2. Enters email address
3. System sends reset email via Supabase
4. User receives email with reset link
5. Clicks link and sets new password
6. Redirects to login

### Sign Out
1. User clicks "Sign Out" button on dashboard
2. System clears session via Supabase
3. Redirects to `/login`

## Security Features

1. **Row Level Security (RLS)**
   - Enabled on all database tables
   - Users can only access their own data

2. **Password Requirements**
   - Minimum 8 characters for signup
   - Minimum 6 characters for login
   - Strength indicator guides users to stronger passwords

3. **Email Verification**
   - Users must verify email before full access
   - Prevents fake account creation

4. **Session Security**
   - Automatic session refresh
   - Secure token storage
   - Session expiration handling

5. **Protected Routes**
   - Middleware validates every request
   - Automatic redirects for unauthorized access

## Testing the System

### Test Sign Up
1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Enter valid email and password (min 8 chars)
4. Click "Create Account"
5. Check email for verification link (check spam folder)
6. Click verification link
7. Should redirect to dashboard

### Test Login
1. Navigate to http://localhost:3000/login
2. Enter credentials
3. Click "Login"
4. Should redirect to dashboard

### Test Protected Routes
1. Try accessing http://localhost:3000/dashboard without login
2. Should redirect to login page

### Test Logout
1. Login to dashboard
2. Click "Sign Out"
3. Should redirect to login
4. Try accessing dashboard again - should redirect to login

## Environment Variables Required

Make sure `.env.local` contains:
```
NEXT_PUBLIC_SUPABASE_URL=https://akufeyurndcymmosmikd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Next Steps

With authentication complete, you can now:
1. Build income/expense entry forms
2. Create CRUD operations for financial data
3. Add data visualization and reports
4. Implement filtering and search
5. Add user profile management
6. Integrate zakat calculation logic

## Troubleshooting

### "User not found" error
- Make sure user has verified their email
- Check Supabase dashboard for user status

### Redirect loops
- Clear browser cookies/cache
- Check middleware configuration
- Verify Supabase session handling

### Email not received
- Check spam folder
- Verify email settings in Supabase dashboard
- Check Supabase email templates

### Session not persisting
- Check browser cookies are enabled
- Verify environment variables
- Check Supabase project settings

