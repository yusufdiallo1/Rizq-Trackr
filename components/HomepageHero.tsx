'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/contexts/ThemeContext';

export function HomepageHero() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true); // Start visible for instant display
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    { 
      icon: '🕌', 
      title: 'Zakat Calculator', 
      description: 'Automatically calculate your Zakat obligations based on Islamic principles',
      color: '#f59e0b',
      gradient: 'from-amber-500 to-orange-600'
    },
    { 
      icon: '💰', 
      title: 'Income Tracking', 
      description: 'Track all your income sources with detailed categorization',
      color: '#10b981',
      gradient: 'from-emerald-500 to-green-600'
    },
    { 
      icon: '💸', 
      title: 'Expense Management', 
      description: 'Monitor spending across categories and stay within budget',
      color: '#ef4444',
      gradient: 'from-red-500 to-pink-600'
    },
    { 
      icon: '💹', 
      title: 'Savings Goals', 
      description: 'Set and achieve your financial goals with visual progress tracking',
      color: '#3b82f6',
      gradient: 'from-blue-500 to-indigo-600'
    },
  ];

  useEffect(() => {
    // Auto-cycle through features
    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(featureInterval);
  }, [features.length]);

  return (
    <section
      ref={heroRef}
      className="homepage-hero relative flex items-center justify-center overflow-hidden transition-colors duration-300"
      style={{
        minHeight: '100vh',
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientShift 15s ease infinite',
      }}
    >
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Feature-specific background colors */}
        {features.map((feature, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: currentFeature === index ? 0.3 : 0,
              background: `radial-gradient(circle at 50% 50%, ${feature.color}20 0%, transparent 70%)`,
            }}
          />
        ))}
        
        {/* Floating Circles */}
        <div
          className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
            top: '10%',
            left: '10%',
            animation: 'floatShapes 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)',
            top: '60%',
            right: '10%',
            animation: 'floatShapes 25s ease-in-out infinite reverse',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute w-48 h-48 rounded-full opacity-10 blur-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            bottom: '20%',
            left: '50%',
            animation: 'floatShapes 18s ease-in-out infinite',
            animationDelay: '4s',
          }}
        />

        {/* Mobile-Only: App Store 2.0 Floating Bubbles */}
        {isMobile && (
          <>
            {/* Large glass bubble - top left */}
            <div
              className="absolute w-32 h-32 rounded-full"
              style={{
                background: theme === 'dark'
                  ? 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)'
                  : 'radial-gradient(circle at 30% 30%, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.02) 50%, transparent 70%)',
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                backdropFilter: 'blur(8px)',
                top: '8%',
                left: '-5%',
                animation: 'floatBubble1 8s ease-in-out infinite',
                boxShadow: theme === 'dark'
                  ? 'inset 0 0 30px rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.2)'
                  : 'inset 0 0 30px rgba(0, 0, 0, 0.05), 0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            />
            {/* Medium glass bubble - top right */}
            <div
              className="absolute w-24 h-24 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 50%, transparent 70%)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                backdropFilter: 'blur(8px)',
                top: '15%',
                right: '5%',
                animation: 'floatBubble2 6s ease-in-out infinite',
                boxShadow: 'inset 0 0 20px rgba(16, 185, 129, 0.1), 0 8px 32px rgba(0, 0, 0, 0.2)',
              }}
            />
            {/* Small glass bubble - mid left */}
            <div
              className="absolute w-16 h-16 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 50%, transparent 70%)',
                border: '1px solid rgba(245, 158, 11, 0.15)',
                backdropFilter: 'blur(8px)',
                top: '40%',
                left: '8%',
                animation: 'floatBubble3 7s ease-in-out infinite',
                boxShadow: 'inset 0 0 15px rgba(245, 158, 11, 0.1), 0 8px 32px rgba(0, 0, 0, 0.2)',
              }}
            />
            {/* Tiny glass bubble - mid right */}
            <div
              className="absolute w-12 h-12 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                backdropFilter: 'blur(8px)',
                top: '55%',
                right: '10%',
                animation: 'floatBubble1 5s ease-in-out infinite',
                animationDelay: '1s',
                boxShadow: 'inset 0 0 10px rgba(59, 130, 246, 0.1), 0 8px 32px rgba(0, 0, 0, 0.2)',
              }}
            />
            {/* Large glass bubble - bottom */}
            <div
              className="absolute w-28 h-28 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 50%, transparent 70%)',
                border: '1px solid rgba(239, 68, 68, 0.1)',
                backdropFilter: 'blur(8px)',
                bottom: '20%',
                left: '15%',
                animation: 'floatBubble2 9s ease-in-out infinite',
                animationDelay: '2s',
                boxShadow: 'inset 0 0 25px rgba(239, 68, 68, 0.1), 0 8px 32px rgba(0, 0, 0, 0.2)',
              }}
            />
            {/* Extra small bubble - bottom right */}
            <div
              className="absolute w-10 h-10 rounded-full"
              style={{
                background: theme === 'dark'
                  ? 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)'
                  : 'radial-gradient(circle at 30% 30%, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.02) 50%, transparent 70%)',
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(8px)',
                bottom: '30%',
                right: '20%',
                animation: 'floatBubble3 4s ease-in-out infinite',
                boxShadow: theme === 'dark'
                  ? 'inset 0 0 8px rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.2)'
                  : 'inset 0 0 8px rgba(0, 0, 0, 0.05), 0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            />
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '180px', paddingBottom: '5rem' }}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div
            className="space-y-8 opacity-100 translate-y-0"
          >
            {/* Heading */}
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
            >
              Take Control of Your{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Islamic Finances
              </span>
            </h1>

            {/* Subheading */}
            <p className={`text-lg sm:text-xl max-w-xl ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
              Track, Save, and Calculate Zakat with Confidence
            </p>

            {/* Feature Carousel Animation */}
            <div className={`relative h-32 overflow-hidden transition-all duration-500 ${isMobile ? 'rounded-3xl' : 'rounded-2xl'}`}
              style={{
                background: isMobile
                  ? theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.03)'
                  : theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)',
                backdropFilter: isMobile ? 'blur(30px)' : 'blur(20px)',
                WebkitBackdropFilter: isMobile ? 'blur(30px)' : 'blur(20px)',
                border: isMobile
                  ? theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.15)'
                    : '1px solid rgba(0, 0, 0, 0.1)'
                  : theme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: isMobile
                  ? theme === 'dark'
                  ? `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px ${features[currentFeature].color}15, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                    : `0 8px 32px rgba(0, 0, 0, 0.1), 0 0 60px ${features[currentFeature].color}10, inset 0 1px 0 rgba(255, 255, 255, 0.5)`
                  : 'none',
              }}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="absolute inset-0 flex items-center gap-4 p-6 transition-all duration-700"
                  style={{
                    transform: `translateX(${(index - currentFeature) * 100}%)`,
                    opacity: Math.abs(index - currentFeature) <= 1 ? 1 : 0,
                  }}
                >
                  <div 
                    className="text-5xl flex-shrink-0"
                    style={{
                      filter: `drop-shadow(0 0 20px ${feature.color}80)`,
                      animation: currentFeature === index ? 'pulse 2s ease-in-out infinite' : 'none',
                    }}
                  >
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 
                      className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
                      style={{ color: feature.color }}
                    >
                      {feature.title}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'}`}>
                      {feature.description}
                    </p>
                  </div>
                  {/* Progress bar - styled like image #2: red on left, gray on right */}
                  <div className="absolute bottom-0 left-0 right-0 h-2 rounded-full overflow-hidden"
                    style={{
                      background: 'rgba(107, 114, 128, 0.3)', // Dark gray for unfilled portion
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: currentFeature === index ? '70%' : '0%',
                        background: currentFeature === index 
                          ? `linear-gradient(90deg, ${feature.color === '#ef4444' ? '#ef4444' : feature.color}, ${feature.color}dd)` 
                          : 'transparent',
                        boxShadow: currentFeature === index ? `0 0 8px ${feature.color}60, inset 0 1px 0 rgba(255, 255, 255, 0.2)` : 'none',
                        animation: currentFeature === index ? 'progressBar 3s linear' : 'none',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className={`group relative font-semibold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 ${isMobile ? 'px-10 py-5 rounded-2xl text-center' : 'px-8 py-4 rounded-full'}`}
                style={{
                  background: isMobile
                    ? `linear-gradient(135deg, ${features[currentFeature].color} 0%, ${features[currentFeature].color}cc 50%, ${features[currentFeature].color}99 100%)`
                    : `linear-gradient(135deg, ${features[currentFeature].color} 0%, ${features[currentFeature].color}dd 100%)`,
                  backdropFilter: isMobile ? 'blur(30px)' : 'blur(20px)',
                  WebkitBackdropFilter: isMobile ? 'blur(30px)' : 'blur(20px)',
                  border: isMobile
                    ? '1px solid rgba(255, 255, 255, 0.25)'
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: isMobile
                    ? `0 12px 40px ${features[currentFeature].color}50, 0 0 80px ${features[currentFeature].color}30, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                    : `0 8px 32px ${features[currentFeature].color}40`,
                  transition: 'all 0.5s ease',
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>

              <button
                onClick={() => router.push('/login')}
                className={`font-semibold text-lg transition-all duration-300 hover:scale-105 ${isMobile ? 'px-10 py-5 rounded-2xl' : 'px-8 py-4 rounded-full'} ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
                style={{
                  background: isMobile
                    ? theme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(0, 0, 0, 0.05)'
                    : theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.05)',
                  backdropFilter: isMobile ? 'blur(30px)' : 'blur(20px)',
                  WebkitBackdropFilter: isMobile ? 'blur(30px)' : 'blur(20px)',
                  border: isMobile
                    ? theme === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '1px solid rgba(0, 0, 0, 0.1)'
                    : theme === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: isMobile
                    ? theme === 'dark'
                    ? '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                    : 'none',
                }}
              >
                Learn More
              </button>
            </div>

            {/* Quick Stats - Highlight active feature */}
            <div className={`grid grid-cols-4 gap-4 pt-4 ${isMobile ? 'gap-3' : ''}`}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`text-center transition-all duration-500 hover:scale-105 cursor-pointer ${isMobile ? 'p-4 rounded-2xl' : 'p-3 rounded-xl'}`}
                  style={{
                    background: currentFeature === index
                      ? isMobile
                        ? `${feature.color}25`
                        : `${feature.color}20`
                      : isMobile
                        ? theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.03)'
                        : theme === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.02)',
                    border: `1px solid ${currentFeature === index ? feature.color : isMobile ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)') : (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)')}`,
                    transform: currentFeature === index ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: currentFeature === index
                      ? isMobile
                        ? `0 0 30px ${feature.color}50, inset 0 1px 0 ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)'}`
                        : `0 0 20px ${feature.color}40`
                      : isMobile
                        ? theme === 'dark'
                        ? 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                          : 'inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        : 'none',
                    backdropFilter: isMobile ? 'blur(20px)' : 'none',
                    WebkitBackdropFilter: isMobile ? 'blur(20px)' : 'none',
                  }}
                  onClick={() => setCurrentFeature(index)}
                >
                  <div
                    className={`mb-1 ${isMobile ? 'text-3xl' : 'text-2xl'}`}
                    style={{
                      animation: currentFeature === index ? 'pulse 2s ease-in-out infinite' : 'none',
                      filter: currentFeature === index && isMobile ? `drop-shadow(0 0 10px ${feature.color}80)` : 'none',
                    }}
                  >
                    {feature.icon}
                  </div>
                  <div className={`${isMobile ? 'text-xs font-medium' : 'text-xs'} ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>{feature.title.split(' ')[0]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Animated App Demo */}
          <div className="flex justify-center lg:justify-end mt-12 lg:mt-0 opacity-100 translate-y-0">
            <div className="relative w-full max-w-[380px]">
              {/* iPhone 17 Pro Max Frame - Realistic Design */}
              <div 
                className="relative mx-auto transition-all duration-700"
                style={{
                  background: '#000000',
                  borderRadius: '47px',
                  boxShadow: `
                    0 0 0 1px rgba(255, 255, 255, 0.05),
                    0 25px 70px rgba(0, 0, 0, 0.7),
                    inset 0 0 0 1px rgba(255, 255, 255, 0.03)
                  `,
                  animation: 'floatPhone 3s ease-in-out infinite',
                  transform: 'rotate(-2deg)',
                  padding: '8px',
                  width: '100%',
                  maxWidth: '380px',
                }}
              >
                {/* Screen Content */}
                <div 
                  className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800"
                  style={{ 
                    aspectRatio: '430/932',
                    minHeight: '600px',
                    borderRadius: '39px',
                    border: '1px solid rgba(0, 0, 0, 0.8)',
                  }}
                >
                  {/* Dynamic Island - Realistic Pill Shape */}
                  <div 
                    className="absolute top-3 left-1/2 transform -translate-x-1/2 z-30"
                    style={{
                      width: '126px',
                      height: '37px',
                      background: '#000000',
                      borderRadius: '19px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.5), 0 1px 1px rgba(0, 0, 0, 0.3)',
                    }}
                  />

                  {/* Status Bar - Left Side (Time) */}
                  <div className="absolute top-3 left-6 text-white text-sm font-semibold z-20" style={{ fontSize: '15px', letterSpacing: '-0.3px' }}>
                    11:29
                  </div>

                  {/* Status Bar - Right Side (Signal, WiFi, Battery) */}
                  <div className="absolute top-3 right-6 flex items-center gap-1.5 z-20">
                    {/* Signal bars */}
                    <div className="flex items-end gap-0.5">
                      <div className="w-0.5 h-1.5 bg-white rounded-t"></div>
                      <div className="w-0.5 h-2 bg-white rounded-t"></div>
                      <div className="w-0.5 h-2.5 bg-white rounded-t"></div>
                      <div className="w-0.5 h-3 bg-white rounded-t"></div>
                    </div>
                    {/* WiFi icon */}
                    <div className="w-4 h-3 relative">
                      <svg viewBox="0 0 16 12" fill="none" className="w-full h-full">
                        <path d="M8 0C4 0 1 3 1 7L3 9C3 6 5 4 8 4C11 4 13 6 13 9L15 7C15 3 12 0 8 0Z" fill="white" opacity="0.9"/>
                        <path d="M8 6C6 6 5 7 5 9L7 11C7 9 7 8 8 8C9 8 9 9 9 11L11 9C11 7 10 6 8 6Z" fill="white" opacity="0.9"/>
                        <circle cx="8" cy="11" r="1" fill="white" opacity="0.9"/>
                      </svg>
                    </div>
                    {/* Battery */}
                    <div className="w-6 h-3 border border-white/90 rounded-sm relative">
                      <div className="absolute right-0 top-0.5 w-0.5 h-2 bg-white/90 rounded-r"></div>
                      <div className="absolute left-0.5 top-0.5 bottom-0.5 right-1 bg-white/90 rounded-sm"></div>
                    </div>
                  </div>

                  {/* Animated Dashboard Preview - Cycles through features */}
                  <div className="h-full pt-16 px-4 pb-8 relative overflow-hidden">
                    {/* Feature Animation Based on Current Feature */}
                    <div className="relative h-full mt-4">
                      {features.map((feature, index) => (
                        <div
                          key={index}
                          className="absolute inset-0 transition-all duration-700"
                          style={{
                            opacity: currentFeature === index ? 1 : 0,
                            transform: `translateX(${currentFeature === index ? '0' : '100%'})`,
                            zIndex: currentFeature === index ? 10 : 1,
                          }}
                        >
                          {/* Feature Card Animation */}
                          <div 
                            className="rounded-2xl p-5 mb-4 backdrop-blur-xl transition-all duration-500"
                            style={{
                              background: `${feature.color}20`,
                              border: `2px solid ${feature.color}40`,
                              animation: currentFeature === index ? 'slideIn 0.5s ease-out' : 'none',
                            }}
                          >
                            <div 
                              className="text-5xl mb-3 text-center" 
                              style={{ 
                                color: feature.color,
                                animation: currentFeature === index ? 'bounce 1s ease-in-out infinite' : 'none',
                                filter: currentFeature === index ? `drop-shadow(0 0 15px ${feature.color}80)` : 'none',
                              }}
                            >
                              {feature.icon}
                            </div>
                            <h3 className="text-white font-bold text-lg mb-1.5 text-center" style={{ color: feature.color }}>
                              {feature.title}
                            </h3>
                            <p className="text-white/70 text-xs text-center leading-tight px-2">{feature.description}</p>
                          </div>

                          {/* Progress Bar - Animated */}
                          <div className="space-y-3">
                            <div 
                              className="h-2.5 rounded-full overflow-hidden bg-white/10"
                              style={{ animation: currentFeature === index ? 'progressBar 2s ease-out' : 'none' }}
                            >
                              <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{
                                  width: currentFeature === index ? '75%' : '0%',
                                  background: `linear-gradient(90deg, ${feature.color}, ${feature.color}80)`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Home Indicator Bar - iPhone 17 Pro Max */}
                  <div 
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
                    style={{
                      width: '134px',
                      height: '5px',
                      background: 'rgba(255, 255, 255, 0.4)',
                      borderRadius: '3px',
                      boxShadow: '0 0 8px rgba(255, 255, 255, 0.15)',
                    }}
                  />
                </div>
              </div>

              {/* Floating feature badges around iPhone - Cycle through features */}
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="absolute rounded-full p-3 backdrop-blur-xl transition-all duration-700 pointer-events-none z-30"
                  style={{
                    background: `${feature.color}30`,
                    border: `2px solid ${feature.color}`,
                    top: `${18 + index * 22}%`,
                    left: index % 2 === 0 ? '-12%' : '102%',
                    opacity: currentFeature === index ? 1 : 0.25,
                    transform: `translateY(${currentFeature === index ? '-15px' : '0'}) scale(${currentFeature === index ? 1.2 : 0.85})`,
                    animation: currentFeature === index ? 'floatPhone 2s ease-in-out infinite' : 'none',
                    animationDelay: `${index * 0.2}s`,
                    boxShadow: currentFeature === index ? `0 0 30px ${feature.color}80` : 'none',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span 
                    className="text-2xl"
                    style={{
                      filter: currentFeature === index ? `drop-shadow(0 0 10px ${feature.color}80)` : 'none',
                      animation: currentFeature === index ? 'pulse 2s ease-in-out infinite' : 'none',
                    }}
                  >
                    {feature.icon}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
