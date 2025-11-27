import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create Supabase client to refresh session
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - this is important for maintaining auth state
  await supabase.auth.getSession();

  // NO REDIRECTS - Let pages handle their own auth
  // This prevents automatic refreshing and unwanted redirects
  // Pages will show their own loading states while checking auth

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
  ],
};
