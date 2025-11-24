import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthPage =
    req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/signup') ||
    req.nextUrl.pathname.startsWith('/forgot-password');
  
  // Any page that shows personal finance data should be protected
  const isProtectedPage =
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/zakat') ||
    req.nextUrl.pathname.startsWith('/income') ||
    req.nextUrl.pathname.startsWith('/savings') ||
    req.nextUrl.pathname.startsWith('/expenses') ||
    req.nextUrl.pathname.startsWith('/analytics') ||
    req.nextUrl.pathname.startsWith('/transactions') ||
    req.nextUrl.pathname.startsWith('/profile') ||
    req.nextUrl.pathname.startsWith('/settings') ||
    req.nextUrl.pathname.startsWith('/notifications');

  // If user is not logged in and trying to access protected pages, redirect to login
  if (!session && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

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
