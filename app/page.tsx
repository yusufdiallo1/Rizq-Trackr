'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';
import { HomepageHero } from '@/components/HomepageHero';
import { HomepageNavbar } from '@/components/layout/HomepageNavbar';
import { Footer } from '@/components/layout/Footer';
import { useTheme } from '@/lib/contexts/ThemeContext';
import Link from 'next/link';

// Lazy load below-the-fold components
const HomepageFeatures = lazy(() => import('@/components/HomepageFeatures').then(m => ({ default: m.HomepageFeatures })));
const HomepageHowItWorks = lazy(() => import('@/components/HomepageHowItWorks').then(m => ({ default: m.HomepageHowItWorks })));
const HomepageTestimonials = lazy(() => import('@/components/HomepageTestimonials').then(m => ({ default: m.HomepageTestimonials })));
const HomepageCTA = lazy(() => import('@/components/HomepageCTA').then(m => ({ default: m.HomepageCTA })));

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const [user, setUser] = useState<{ id: string; email: string; firstName?: string; lastName?: string; fullName?: string } | null>(null);
  const [showDashboardButton, setShowDashboardButton] = useState(false);
  // Removed supabaseInitialized - not needed, page renders immediately

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    // Initialize Supabase client - NON-BLOCKING, happens in background
    let supabase: ReturnType<typeof createClientComponentClient<Database>> | null = null;
    try {
      if (typeof window !== 'undefined') {
        supabase = createClientComponentClient<Database>();
      }
    } catch (error) {
      // Silently fail - page renders anyway
    }

    // Defer auth check to next tick - don't block initial render
    const checkAuth = async () => {
      // Use requestIdleCallback or setTimeout to defer
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(() => {
          if (!mounted) return;
          performAuthCheck();
        }, { timeout: 1000 });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          if (!mounted) return;
          performAuthCheck();
        }, 0);
      }
    };

    const performAuthCheck = async () => {
      if (!supabase || !mounted) return;

      try {
        // Quick session check instead of full auth check
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          // User is authenticated - get user data
          try {
          const currentUser = await getCurrentUser();
            if (mounted && currentUser) {
            setUser(currentUser);
              // Check sessionStorage for dashboard button
              if (typeof window !== 'undefined' && window.sessionStorage) {
                try {
              const shouldShow = sessionStorage.getItem('showDashboardButton') === 'true';
              if (shouldShow) {
                setShowDashboardButton(true);
                sessionStorage.removeItem('showDashboardButton');
              }
                } catch (storageError) {
                  // Silently handle storage errors
                }
              }
            }
          } catch (userError) {
            // If getCurrentUser fails, use session data
            if (mounted && session.user) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                firstName: session.user.user_metadata?.first_name,
                lastName: session.user.user_metadata?.last_name,
                fullName: session.user.user_metadata?.full_name,
              });
            }
          }
        } else {
          if (mounted) {
            setUser(null);
            setShowDashboardButton(false);
          }
        }
      } catch (error) {
        // Silently fail - page already rendered
        if (mounted) {
          setUser(null);
          setShowDashboardButton(false);
        }
      }
    };

    // Start auth check in background - non-blocking
    checkAuth();

    // Set up auth state listener - only for SIGNED_IN/SIGNED_OUT events
    if (supabase) {
      try {
    const {
          data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
          // Only handle actual auth events
          if (event === 'SIGNED_IN' && session?.user) {
            try {
        const currentUser = await getCurrentUser();
        if (mounted) {
        setUser(currentUser);
              }
            } catch (error) {
              // Use session data as fallback
              if (mounted && session.user) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  firstName: session.user.user_metadata?.first_name,
                  lastName: session.user.user_metadata?.last_name,
                  fullName: session.user.user_metadata?.full_name,
                });
              }
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
              setUser(null);
              setShowDashboardButton(false);
        }
          }
          // Ignore TOKEN_REFRESHED and other events
        });
        subscription = authSubscription;
      } catch (error) {
        // Silently fail - page already rendered
      }
    }

    return () => {
      mounted = false;
      if (subscription) {
        try {
      subscription.unsubscribe();
        } catch (err) {
          // Silently handle unsubscribe errors
        }
      }
    };
  }, []); // Empty deps - only run once on mount

  // Always render the page, even if Supabase isn't initialized
  // This prevents blank pages
  return (
    <main
      className="min-h-screen transition-colors duration-300"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      {/* Homepage Navbar */}
      <HomepageNavbar />

      {/* Back to Dashboard Button - Show only when user clicked "Back to Home" from user menu */}
      {user && showDashboardButton && (
        <Link
          href="/dashboard"
          className="fixed top-20 right-4 sm:right-6 z-50 group"
          style={{
            pointerEvents: 'auto',
          }}
        >
          <div
            className="px-5 py-3.5 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 30px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.75)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 30px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
            }}
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-white group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-white text-sm font-semibold group-hover:text-emerald-400 transition-colors">Dashboard</span>
            </div>
          </div>
        </Link>
      )}

      {/* Hero Section - Load immediately */}
      <HomepageHero />

      {/* Features Section - Lazy loaded */}
      <Suspense fallback={null}>
        <HomepageFeatures />
      </Suspense>

      {/* How It Works Section - Lazy loaded */}
      <Suspense fallback={null}>
        <HomepageHowItWorks />
      </Suspense>

      {/* Testimonials Section - Lazy loaded */}
      <Suspense fallback={null}>
        <HomepageTestimonials />
      </Suspense>

      {/* CTA Section - Lazy loaded */}
      <Suspense fallback={null}>
        <HomepageCTA />
      </Suspense>

      {/* Footer */}
      <Footer />
    </main>
  );
}
