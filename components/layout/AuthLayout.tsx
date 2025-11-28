'use client';

import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div 
      className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Status bar background - transparent on mobile */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-12" style={{ background: 'transparent' }} />

      {/* Left Side - Gradient Background with Islamic Pattern (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background - Deep emerald/teal for desktop */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#065f46] via-[#047857] to-[#059669]" />
        
        {/* Islamic Pattern Overlay - Subtle */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="auth-islamic-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <g fill="none" stroke="#ffffff" strokeWidth="2">
                  <path d="M 100 20 L 141.42 41.42 L 162.84 82.84 L 162.84 117.16 L 141.42 158.58 L 100 180 L 58.58 158.58 L 37.16 117.16 L 37.16 82.84 L 58.58 41.42 Z" />
                  <path d="M 100 50 L 120 80 L 150 80 L 130 100 L 140 130 L 100 110 L 60 130 L 70 100 L 50 80 L 80 80 Z" />
                  <path d="M 100 70 L 115 85 L 115 115 L 100 130 L 85 115 L 85 85 Z" />
                  <circle cx="37.16" cy="37.16" r="5" fill="#ffffff" opacity="0.5" />
                  <circle cx="162.84" cy="37.16" r="5" fill="#ffffff" opacity="0.5" />
                  <circle cx="37.16" cy="162.84" r="5" fill="#ffffff" opacity="0.5" />
                  <circle cx="162.84" cy="162.84" r="5" fill="#ffffff" opacity="0.5" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-islamic-pattern)" />
          </svg>
        </div>

        {/* Mosque Silhouette Watermark - Very Subtle */}
        <div className="absolute right-8 top-8 opacity-10">
          <span className="text-[200px]">🕌</span>
        </div>

        {/* Floating Glass Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full backdrop-blur-sm" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
        <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full backdrop-blur-sm" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
        <div className="absolute top-1/2 left-10 w-16 h-16 rounded-lg backdrop-blur-sm rotate-45" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white w-full">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8" style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
              <span className="text-5xl">🕌</span>
            </div>
            <h1 className="text-4xl font-heading font-bold mb-4">Rizq Trackr</h1>
            <p className="text-lg opacity-90 mb-8">
              Manage your finances the halal way. Track income, expenses, and calculate Zakat with ease.
            </p>
            <div className="space-y-3 text-sm opacity-80 text-left">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">✓</span>
                <span>Track zakatable assets automatically</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">✓</span>
                <span>Monitor savings goals and expenses</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">✓</span>
                <span>Generate financial reports instantly</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Area (Full width on mobile, half on desktop) */}
      <div 
        className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative pt-16 sm:pt-6"
        style={{ 
          background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)',
          paddingTop: 'clamp(4rem, 10vh, 6rem)',
        }}
      >
        <div className="w-full max-w-md relative z-10" style={{ maxWidth: 'calc(100% - 1rem)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

