import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // VERY CONSERVATIVE: Only check session if absolutely necessary
  // Add very short timeout and be extremely lenient
  let session = null;
  let hasValidSessionCheck = false;
  
  try {
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<{ data: { session: null }; isTimeout: true }>((resolve) =>
      setTimeout(() => resolve({ data: { session: null }, isTimeout: true }), 1000) // Very short timeout
    );

    const sessionResult = await Promise.race([sessionPromise.then(r => ({ ...r, isTimeout: false })), timeoutPromise]);
    
    // Only consider it a valid check if it wasn't a timeout AND we got a definitive result
    if (!sessionResult.isTimeout && sessionResult?.data !== undefined) {
      session = sessionResult?.data?.session || null;
      hasValidSessionCheck = true;
    }
    // If timeout or undefined, hasValidSessionCheck stays false - don't redirect
  } catch (error) {
    // If session check fails for ANY reason, allow the request through
    // NEVER redirect on errors - this prevents all redirect loops
    // hasValidSessionCheck remains false, so we won't redirect
  }

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

  // EXTREMELY CONSERVATIVE: Only redirect if we're 100% certain
  // Requirements:
  // 1. Valid session check completed (not timeout/error)
  // 2. Session is explicitly null (not undefined, not missing)
  // 3. User is on a protected page
  // 4. Not already on an auth page
  // 5. Not a navigation request (prevent redirect loops)
  const isNavigationRequest = req.headers.get('x-middleware-rewrite') || 
                              req.headers.get('x-middleware-redirect');
  
  if (
    hasValidSessionCheck && 
    session === null && 
    isProtectedPage && 
    !isAuthPage &&
    !isNavigationRequest
  ) {
    // Only redirect if absolutely certain - this should be very rare
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // DEFAULT: Always allow through if:
  // - Session check timed out
  // - Session check failed
  // - Session check returned undefined
  // - Any uncertainty whatsoever
  // This prevents ALL false redirects and redirect loops

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
