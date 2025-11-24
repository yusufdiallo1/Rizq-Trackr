'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useEffect, useState } from 'react';

export function DesktopPillNav() {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Ensure component only renders on client to prevent SSR/hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/income', label: 'Income' },
    { href: '/expenses', label: 'Expenses' },
    { href: '/savings', label: 'Savings' },
    { href: '/zakat', label: 'Zakat' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/transactions', label: 'Transactions' },
  ];

  const isActive = (path: string) => {
    if (!isMounted || !pathname) return false;
    try {
      return pathname === path || pathname.startsWith(path + '/');
    } catch {
      return false;
    }
  };

  const handleNavClick = (href: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isMounted) {
      console.warn('DesktopPillNav: Component not mounted yet');
      return;
    }
    
    if (!router || typeof router.push !== 'function') {
      console.warn('DesktopPillNav: Router not available, using window.location');
      // Fallback to window.location if router is not available
      if (typeof window !== 'undefined') {
        window.location.href = href;
      }
      return;
    }
    
    try {
      // Haptic feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
      console.log('DesktopPillNav: Navigating to', href);
      router.push(href);
    } catch (error) {
      console.error('DesktopPillNav: Navigation error:', error);
      // Fallback to window.location
      if (typeof window !== 'undefined') {
        window.location.href = href;
      }
    }
  };

  // Return placeholder during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center gap-2" aria-label="Main navigation">
        <div className={`flex items-center gap-1 px-2 py-1.5 rounded-full ${
          isDark
            ? 'bg-slate-800/80 border border-white/10'
            : 'bg-white/80 border border-black/5'
        }`}>
          {navItems.map((item) => (
            <div key={item.href} className="px-4 py-2 rounded-full text-sm font-medium opacity-50">
              {item.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center gap-2"
      role="navigation"
      aria-label="Main navigation"
      style={{
        pointerEvents: 'auto',
        position: 'relative',
        zIndex: 10001,
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className={`flex items-center gap-1 px-2 py-1.5 rounded-full transition-all duration-300 ${
          isDark
            ? 'bg-slate-800/80 border border-white/10'
            : 'bg-white/80 border border-black/5'
        }`}
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: isDark
            ? '0 4px 16px rgba(0, 0, 0, 0.3)'
            : '0 4px 16px rgba(0, 0, 0, 0.1)',
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 10001,
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNavClick(item.href, e);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                active
                  ? isDark
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-emerald-500/10 text-emerald-600'
                  : isDark
                  ? 'text-gray-400 hover:text-white hover:bg-white/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
              }`}
              style={{
                cursor: 'pointer',
                pointerEvents: 'auto',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

