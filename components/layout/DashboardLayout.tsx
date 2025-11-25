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
import { User } from '@/lib/auth';

interface DashboardLayoutProps {
  children: ReactNode;
  user?: User | null;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const prefersReducedMotion = useReducedMotion();

  const isDark = theme === 'dark';

  // Don't do automatic auth checks - middleware handles authentication
  // Only use the user prop passed from parent components
  useEffect(() => {
    // Just set authenticated state based on user prop
    // No automatic checks, no redirects, no intervals
    setIsAuthenticated(!!user);
    setCheckingAuth(false);
  }, [user]);

  // Don't block rendering - show content immediately
  // If user is not authenticated, middleware will handle redirect
  // This prevents redirect loops and allows page to load

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

      {/* Desktop Navigation - Show if user is provided */}
      {user && (
        <div className="hidden lg:block" style={{ pointerEvents: 'auto', zIndex: 9999 }}>
          <Navbar user={user} />
        </div>
      )}

      {/* Mobile/Tablet Top Navigation */}
      <div className="lg:hidden">
        <MobileTopNav
          onMenuClick={() => setMobileMenuOpen(true)}
          isAuthenticated={!!user}
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

