'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/contexts/ThemeContext';

export function Footer() {
  const { theme } = useTheme();
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(30px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4), 0 0 30px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  };

  const linkHoverStyle = 'hover:bg-white hover:bg-opacity-10 hover:text-primary';

  return (
    <footer className="mt-auto relative z-10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
          style={glassStyle}
        >
          {/* Gradient overlay */}
          <div
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(245, 158, 11, 0.15) 50%, rgba(139, 92, 246, 0.1) 100%)',
            }}
          />

          <div className="relative z-10">
            {/* Main Footer Content */}
            <div className={`grid grid-cols-1 ${isHomepage ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-8 mb-8`}>
              {/* Brand Section */}
              <div>
                <Link href="/dashboard" className="flex items-center space-x-2 mb-4 group">
                  <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-slate-700 bg-opacity-50' : 'bg-white bg-opacity-30'} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm`}>
                    <span className="text-xl">🕌</span>
                  </div>
                  <span className="font-heading font-bold text-lg text-white group-hover:text-primary transition-colors">
                    Rizq Trackr
                  </span>
                </Link>
                <p className="text-sm text-white/80 mb-4">
                  Track your finances with Islamic principles. Built with ❤️ for the Ummah.
          </p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 bg-white bg-opacity-15"
                    style={{ border: '1px solid rgba(255, 255, 255, 0.15)' }}
                    aria-label="X (Twitter)"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 bg-white bg-opacity-15"
                    style={{ border: '1px solid rgba(255, 255, 255, 0.15)' }}
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <defs>
                        <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f09433" />
                          <stop offset="25%" stopColor="#e6683c" />
                          <stop offset="50%" stopColor="#dc2743" />
                          <stop offset="75%" stopColor="#cc2366" />
                          <stop offset="100%" stopColor="#bc1888" />
                        </linearGradient>
                      </defs>
                      <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 bg-white bg-opacity-15"
                    style={{ border: '1px solid rgba(255, 255, 255, 0.15)' }}
                    aria-label="TikTok"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 bg-white bg-opacity-15"
                    style={{ border: '1px solid rgba(255, 255, 255, 0.15)' }}
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="#0077b5" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links - Only show on dashboard pages */}
              {!isHomepage && (
                <div>
                  <h3 className="font-heading font-semibold text-lg mb-4 text-white">
                    Quick Links
                  </h3>
                  <ul className="space-y-3">
                    {[
                      { href: '/dashboard', label: 'Dashboard' },
                      { href: '/income', label: 'Income' },
                      { href: '/expenses', label: 'Expenses' },
                      { href: '/savings', label: 'Savings' },
                      { href: '/zakat', label: 'Zakat Calculator' },
                      { href: '/analytics', label: 'Analytics' },
                    ].map((link) => (
                      <li key={link.href}>
              <Link
                          href={link.href}
                          className="text-sm transition-all inline-flex items-center gap-2 group text-white/80 hover:text-primary"
              >
                          <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {link.label}
              </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Support & Legal */}
              <div>
                <h3 className="font-heading font-semibold text-lg mb-4 text-white">
                  Support & Legal
                </h3>
                <ul className="space-y-3">
                  {[
                    { href: '/help', label: 'Help & Support' },
                    { href: '/privacy', label: 'Privacy Policy' },
                    { href: '/terms', label: 'Terms of Service' },
                    { href: '/contact', label: 'Contact Us' },
                  ].map((link) => (
                    <li key={link.href}>
            <Link
                        href={link.href}
                        className="text-sm transition-all inline-flex items-center gap-2 group text-white/80 hover:text-primary"
            >
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {link.label}
            </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Divider */}
            <div
              className="h-px mb-6"
              style={{ background: 'rgba(255, 255, 255, 0.15)' }}
            />

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-white/80 text-center md:text-left">
                © {new Date().getFullYear()} Rizq Trackr. All rights reserved.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/80">Made with</span>
                <span className="text-red-500 animate-pulse">❤️</span>
                <span className="text-xs text-white/80">for the Ummah</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

