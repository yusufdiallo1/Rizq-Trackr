import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // NON-BLOCKING: Create Supabase client and refresh session in background
  // Don't await - let it happen asynchronously to avoid blocking requests
  try {
  const supabase = createMiddlewareClient({ req, res });

    // Fire and forget - don't block the request
    supabase.auth.getSession().catch(() => {
      // Silently handle session refresh errors - don't block request
    });
  } catch (error) {
    // If Supabase initialization fails, continue anyway
  }

  // Return immediately - don't wait for session refresh
  // Pages will handle their own auth checks asynchronously
  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/zakat/:path*',
    '/income/:path*',
    '/savings/:path*',
    '/expenses/:path*',
    '/analytics/:path*',
    '/transactions/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/notifications/:path*',
    '/login',
    '/signup',
    '/forgot-password'
    // NOTE: Public pages (help, contact, privacy, terms) are NOT in matcher
    // This makes them accessible without authentication
  ],
};
