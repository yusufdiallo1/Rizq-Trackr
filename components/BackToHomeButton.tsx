'use client';

import Link from 'next/link';

export function BackToHomeButton() {
  return (
    <Link
      href="/"
      className="fixed top-20 right-4 sm:right-6 z-50 group"
      style={{
        pointerEvents: 'auto',
      }}
    >
      <div
        className="px-4 py-3 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(16, 185, 129, 0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.3)';
          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.6)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(16, 185, 129, 0.2)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-white group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">Home</span>
        </div>
      </div>
    </Link>
  );
}

