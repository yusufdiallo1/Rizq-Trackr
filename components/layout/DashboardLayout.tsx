'use client';

import { ReactNode, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { MobileTopNav } from './MobileTopNav';
import { MobileHamburgerNav } from './MobileHamburgerNav';
import { DesktopPillNav } from './DesktopPillNav';
import { IslamicPattern } from './IslamicPattern';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useReducedMotion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { getCurrentUser } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
  user?: {
    id: string;
    email: string;
  } | null;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const isDark = theme === 'dark';
  
  // Don't check auth if already on login/signup pages
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname?.startsWith('/forgot-password');

  // SECURITY: Check authentication status on mount and redirect if not authenticated
  useEffect(() => {
    // Skip auth check if on auth pages
    if (isAuthPage) {
      setCheckingAuth(false);
      setIsAuthenticated(false);
      return;
    }
    
    let isMounted = true;
    
    const checkAuth = async () => {
      if (!isMounted) return;
      
      const currentUser = await getCurrentUser();
      const authenticated = !!currentUser;
      
      if (!isMounted) return;
      setIsAuthenticated(authenticated);
      
      // CRITICAL: If not authenticated, redirect to login ONCE
      if (!authenticated && !hasRedirected && !isAuthPage) {
        setHasRedirected(true);
        setMobileMenuOpen(false);
        setCheckingAuth(false);
        router.replace('/login');
        return;
      }
      
      if (authenticated && isMounted) {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
    
    if (isAuthenticated && !hasRedirected && !isAuthPage) {
      const interval = setInterval(() => {
        if (isMounted) {
          checkAuth();
        }
      }, 3000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, router, hasRedirected, isAuthenticated, isAuthPage, pathname]);

  // Loading state with iPhone-style spinner
  if (checkingAuth || !isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-slate-900' : 'bg-slate-50'
      }`}>
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  const mainVariants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : fadeInUp;

  return (
    <div
      className={`iphone-app min-h-screen flex flex-col ${
        isDark
          ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
      }`}
    >
      <IslamicPattern />

      {/* Desktop Navigation - Only show when authenticated */}
      {isAuthenticated && (
        <div className="hidden lg:block" style={{ pointerEvents: 'auto', zIndex: 9999 }}>
          <Navbar user={user} />
        </div>
      )}

      {/* Mobile/Tablet Top Navigation */}
      <div className="lg:hidden">
        <MobileTopNav
          onMenuClick={() => setMobileMenuOpen(true)}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Mobile/Tablet Hamburger Side Menu */}
      <MobileHamburgerNav
        user={user}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area with iPhone-native safe areas */}
      <motion.main
        id="main-content"
        className="flex-1 w-full relative z-10 iphone-scroll iphone-content"
        variants={mainVariants}
        initial="hidden"
        animate="visible"
        role="main"
      >
          {children}
      </motion.main>

    </div>
  );
}

