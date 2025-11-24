'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { Logo } from '@/components/Logo';

export function HomepageNavbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  const [isTeleporting, setIsTeleporting] = useState(false);

  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Start teleportation effect
    setIsTeleporting(true);

    // Create blurred glow overlay
    const overlay = document.createElement('div');
    overlay.id = 'teleport-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, rgba(16, 185, 129, 0.6) 0%, rgba(5, 150, 105, 0.8) 50%, rgba(0, 0, 0, 0.95) 100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.4s ease-out;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);

    // Fade in the glow
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });

    // After glow appears, scroll to top
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      // Fade out the glow after scroll starts
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }
          setIsTeleporting(false);
        }, 400);
      }, 300);
    }, 200);
  };

  const scrollToTestimonials = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    // Start teleportation effect
    setIsTeleporting(true);

    // Create blurred glow overlay
    const overlay = document.createElement('div');
    overlay.id = 'teleport-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, rgba(16, 185, 129, 0.6) 0%, rgba(5, 150, 105, 0.8) 50%, rgba(0, 0, 0, 0.95) 100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.4s ease-out;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);

    // Fade in the glow
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });

    // After glow appears, scroll to testimonials
    setTimeout(() => {
      const testimonialsSection = document.getElementById('testimonials');
      if (testimonialsSection) {
        // Calculate position to center the testimonials section in viewport
        const elementTop = testimonialsSection.getBoundingClientRect().top + window.pageYOffset;
        const elementHeight = testimonialsSection.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollPosition = elementTop - (windowHeight / 2) + (elementHeight / 2);

        // Scroll to testimonials and ensure it stays in view
        window.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });

        // Ensure section stays in view after scroll completes
        setTimeout(() => {
          const rect = testimonialsSection.getBoundingClientRect();
          const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
          if (!isVisible) {
            // Re-center if not fully visible
            const newScrollPosition = elementTop - (windowHeight / 2) + (elementHeight / 2);
            window.scrollTo({
              top: Math.max(0, newScrollPosition),
              behavior: 'smooth'
            });
          }
        }, 1000);

        // Fade out the glow after scroll starts
        setTimeout(() => {
          overlay.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(overlay);
            setIsTeleporting(false);
          }, 400);
        }, 300);
      } else {
        // If section not found, remove overlay
        overlay.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }
          setIsTeleporting(false);
        }, 400);
      }
    }, 200);
  };

  const navBackground = theme === 'dark'
    ? 'rgba(30, 41, 59, 0.85)'
    : 'rgba(255, 255, 255, 0.9)';
  const navBorder = theme === 'dark'
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(31, 41, 55, 0.2)';
  const textColor = theme === 'dark' ? 'text-slate-100' : 'text-charcoal-dark';
  const hoverBg = theme === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(31, 41, 55, 0.08)';

  const navLinks = [
    { href: '/login', label: 'Login' },
    { href: '/signup', label: 'Sign Up' },
    { href: '/help', label: 'Help' },
    { href: '#testimonials', label: 'Testimonials', isAnchor: true },
  ];

  return (
    <nav
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-3xl px-4 mobile-menu-container"
      style={{
        pointerEvents: 'auto',
        zIndex: 9999,
        position: 'fixed',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <div
        className="rounded-full px-4 py-3 flex justify-between items-center backdrop-blur-md transition-all duration-300 relative"
        style={{
          pointerEvents: 'auto',
          background: navBackground,
          border: `1px solid ${navBorder}`,
          boxShadow: isScrolled
            ? theme === 'dark'
              ? '0 6px 24px rgba(0, 0, 0, 0.3)'
              : '0 6px 24px rgba(0, 0, 0, 0.15)'
            : theme === 'dark'
              ? '0 3px 18px rgba(0, 0, 0, 0.2)'
            : '0 3px 18px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
        }}
      >
        {/* Logo */}
        <a
          href="/"
          onClick={scrollToTop}
          className="flex items-center group animate-fade-in-instant relative z-10 cursor-pointer"
          style={{ textDecoration: 'none' }}
        >
          <Logo size={36} showText={true} className="group-hover:scale-105 transition-transform duration-300" />
        </a>

        {/* Desktop Navigation - 4 buttons */}
        <div
          className="hidden lg:flex items-center space-x-2 flex-1 justify-center mx-3 relative"
          style={{ zIndex: 10000, pointerEvents: 'auto' }}
        >
          {navLinks.map((link) => (
            link.isAnchor ? (
              <a
                key={link.href}
                href={link.href}
                onClick={scrollToTestimonials}
                className="px-5 py-2.5 rounded-full font-body text-sm font-semibold transition-all duration-200 hover:translate-y-[-2px] animate-fade-in-instant cursor-pointer"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: theme === 'dark' ? '#ffffff' : '#1e293b',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 10001,
                  pointerEvents: 'auto',
                  minHeight: '44px',
                  minWidth: '90px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#10b981';
                  e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1e293b';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="px-5 py-2.5 rounded-full font-body text-sm font-semibold transition-all duration-200 hover:translate-y-[-2px] animate-fade-in-instant"
                style={{
                  backgroundColor: pathname === link.href
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: pathname === link.href ? '#10b981' : (theme === 'dark' ? '#ffffff' : '#1e293b'),
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 10001,
                  pointerEvents: 'auto',
                  minHeight: '44px',
                  minWidth: '90px',
                  border: pathname === link.href ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#10b981';
                  e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  if (pathname !== link.href) {
                    e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1e293b';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
              >
                {link.label}
              </Link>
            )
          ))}
        </div>

        {/* Tablet Navigation - 4 smaller buttons */}
        <div
          className="hidden md:flex lg:hidden items-center space-x-1 flex-1 justify-center mx-2 relative"
          style={{ zIndex: 10000, pointerEvents: 'auto' }}
        >
          {navLinks.map((link) => (
            link.isAnchor ? (
              <a
                key={link.href}
                href={link.href}
                onClick={scrollToTestimonials}
                className="px-3 py-2 rounded-full font-body text-xs font-semibold transition-all duration-200 hover:translate-y-[-1px] animate-fade-in-instant cursor-pointer"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: theme === 'dark' ? '#ffffff' : '#1e293b',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 10001,
                  pointerEvents: 'auto',
                  minHeight: '36px',
                  minWidth: '70px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#10b981';
                  e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1e293b';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-full font-body text-xs font-semibold transition-all duration-200 hover:translate-y-[-1px] animate-fade-in-instant"
                style={{
                  backgroundColor: pathname === link.href
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: pathname === link.href ? '#10b981' : (theme === 'dark' ? '#ffffff' : '#1e293b'),
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 10001,
                  pointerEvents: 'auto',
                  minHeight: '36px',
                  minWidth: '70px',
                  border: pathname === link.href ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#10b981';
                  e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  if (pathname !== link.href) {
                    e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1e293b';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
              >
                {link.label}
              </Link>
            )
          ))}
        </div>

        {/* Right Side Controls - Desktop/Tablet */}
        <div className="hidden md:flex items-center gap-1 relative z-10 animate-fade-in-instant">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`px-2 py-1.5 rounded-full ${textColor} hover:bg-opacity-15 transition-all duration-300 backdrop-blur-sm`}
            style={{ backgroundColor: hoverBg }}
            title="Dark mode"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Button (Hamburger) */}
        <div className="md:hidden flex items-center space-x-2 relative z-10 animate-fade-in-instant">
          {/* Theme Toggle - Mobile */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-full ${textColor} hover:bg-opacity-15 transition-all duration-300`}
            style={{ backgroundColor: hoverBg }}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Hamburger Menu Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            className={`p-2 rounded-full ${textColor} hover:bg-opacity-15 transition-all duration-300`}
            style={{ backgroundColor: hoverBg }}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden absolute top-full left-4 right-4 mt-2 rounded-2xl overflow-hidden backdrop-blur-md animate-slide-down"
          style={{
            background: navBackground,
            border: `1px solid ${navBorder}`,
            boxShadow: theme === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.4)'
              : '0 8px 32px rgba(0, 0, 0, 0.15)',
            zIndex: 9998,
          }}
        >
          <div className="py-2">
            {navLinks.map((link) => (
              link.isAnchor ? (
                <button
                  key={link.href}
                  onClick={scrollToTestimonials}
                  className="w-full px-4 py-3 text-left font-body text-sm font-semibold transition-all duration-200 flex items-center gap-3"
                  style={{
                    color: theme === 'dark' ? '#ffffff' : '#1e293b',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                    e.currentTarget.style.color = '#10b981';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1e293b';
                  }}
                >
                  <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-4 py-3 font-body text-sm font-semibold transition-all duration-200 flex items-center gap-3"
                  style={{
                    color: pathname === link.href ? '#10b981' : (theme === 'dark' ? '#ffffff' : '#1e293b'),
                    backgroundColor: pathname === link.href ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== link.href) {
                      e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                      e.currentTarget.style.color = '#10b981';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== link.href) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#1e293b';
                    }
                  }}
                >
                  {link.href === '/login' && (
                    <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  )}
                  {link.href === '/signup' && (
                    <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  )}
                  {link.href === '/help' && (
                    <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {link.label}
                </Link>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
