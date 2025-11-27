import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  // If there's an OAuth error, redirect to login with error message
  if (error) {
    console.error('OAuth error:', error, error_description);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', error_description || error);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies });
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError);
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', 'Authentication failed. Please try again.');
        return NextResponse.redirect(loginUrl);
      }

      // Session established successfully, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (err) {
      console.error('Unexpected error in OAuth callback:', err);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'An unexpected error occurred.');
      return NextResponse.redirect(loginUrl);
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}

