'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export function HomepageCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const floatingIcons = ['💰', '📊', '🕌', '⚖️', '💎', '📈'];

  return (
    <section
      ref={sectionRef}
      className="py-20 sm:py-24 lg:py-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      }}
    >
      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingIcons.map((icon, index) => (
          <div
            key={index}
            className="absolute text-4xl opacity-10 animate-float"
            style={{
              left: `${15 + index * 15}%`,
              top: `${20 + (index % 3) * 30}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${3 + index * 0.5}s`,
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className={`max-w-3xl mx-auto text-center`}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
            filter: isVisible ? 'blur(0)' : 'blur(4px)',
            transition: 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {/* CTA Card */}
          <div
            className="relative p-8 sm:p-12 rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)',
            }}
          >
            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
              Ready to Transform Your{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Finances?
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-white/80 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of Muslims managing their money wisely with FinanceTracker
            </p>

            {/* CTA Button */}
            <Link
              href="/signup"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-semibold text-xl text-white transition-all duration-300 hover:scale-105 animate-pulse-glow"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
              }}
            >
              <span>Download App</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-20 blur-2xl bg-emerald-400" />
            <div className="absolute bottom-4 left-4 w-32 h-32 rounded-full opacity-10 blur-3xl bg-cyan-400" />
          </div>
        </div>
      </div>
    </section>
  );
}

