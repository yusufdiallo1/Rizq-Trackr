import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  // If there's an OAuth error, redirect to login with error message
  if (error) {
    const loginUrl = new URL('/login', request.url);
      const errorMessage = error_description || error || 'Authentication failed';
      loginUrl.searchParams.set('error', encodeURIComponent(errorMessage));
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies });
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('error', encodeURIComponent('Authentication failed. Please try again.'));
        return NextResponse.redirect(loginUrl);
      }

      // Session established successfully, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (err) {
      const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', encodeURIComponent('An unexpected error occurred. Please try again.'));
      return NextResponse.redirect(loginUrl);
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
  } catch (err) {
    // If everything fails, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', encodeURIComponent('An unexpected error occurred. Please try again.'));
    return NextResponse.redirect(loginUrl);
  }
}

