'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Create Account',
    description: 'Sign up in seconds with your email. No credit card required.',
    icon: '👤',
  },
  {
    number: 2,
    title: 'Add Transactions',
    description: 'Track your income and expenses. Set up automatic categorization.',
    icon: '💰',
  },
  {
    number: 3,
    title: 'Reach Goals',
    description: 'Monitor your savings, calculate Zakat, and achieve financial peace.',
    icon: '🎯',
  },
];

export function HomepageHowItWorks() {
  const { theme } = useTheme();
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([]);
  const [lineProgress, setLineProgress] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate steps sequentially
            steps.forEach((_, index) => {
              setTimeout(() => {
                setVisibleSteps((prev) => {
                  const newSteps = [...prev];
                  newSteps[index] = true;
                  return newSteps;
                });
              }, index * 300);
            });

            // Animate connecting lines between steps
            // Line 1: between step 1 and 2
            setTimeout(() => {
              setLineProgress((prev) => {
                const newProgress = [...prev];
                newProgress[0] = 100;
                return newProgress;
              });
            }, 600);
            // Line 2: between step 2 and 3
            setTimeout(() => {
              setLineProgress((prev) => {
                const newProgress = [...prev];
                newProgress[1] = 100;
                return newProgress;
              });
            }, 1200);
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

  return (
    <section
      ref={sectionRef}
      className="py-20 sm:py-24 lg:py-32 relative"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(180deg, #e2e8f0 0%, #f8fafc 100%)',
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-center mb-16 scroll-fade-in ${
            visibleSteps.length > 0 ? 'visible' : ''
          } ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
        >
          Get Started in 3 Steps
        </h2>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden lg:block relative">
          {/* Steps */}
          <div className="relative grid grid-cols-3 gap-8 z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center relative"
                style={{
                  opacity: visibleSteps[index] ? 1 : 0,
                  transform: visibleSteps[index] ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
                  filter: visibleSteps[index] ? 'blur(0)' : 'blur(4px)',
                  transition: 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  transitionDelay: `${index * 0.3}s`,
                }}
              >
                {/* Number Circle */}
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-6 relative z-10 transition-all duration-500 hover:scale-110"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(16, 185, 129, 0.5)',
                    boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <span className="text-4xl mb-2">{step.icon}</span>
                  <div
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    {step.number}
                  </div>
                </div>

                {/* Animated Connecting Line - Between circles */}
                {index < steps.length - 1 && (
                  <div
                    className="absolute top-12 h-0.5"
                    style={{
                      left: 'calc(50% + 3rem)',
                      right: 'calc(-50% + 3rem)',
                      zIndex: 1,
                    }}
                  >
                    {/* Background line */}
                    <div
                      className="absolute inset-0 bg-slate-700/30 rounded-full"
                      style={{ zIndex: 0 }}
                    />
                    {/* Animated fill line - starts from right side of circle, fills to left side of next */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        transform: `scaleX(${(lineProgress[index] || 0) / 100})`,
                        transformOrigin: 'left center',
                        boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                        zIndex: 1,
                      }}
                    />
                  </div>
                )}

                {/* Content */}
                <h3 className={`text-xl font-heading font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{step.title}</h3>
                <p className={`text-sm leading-relaxed max-w-xs ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet: Vertical Timeline */}
        <div className="lg:hidden space-y-12 relative">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex gap-6 items-start relative"
              style={{
                opacity: visibleSteps[index] ? 1 : 0,
                transform: visibleSteps[index] ? 'translateX(0) scale(1)' : 'translateX(-40px) scale(0.95)',
                filter: visibleSteps[index] ? 'blur(0)' : 'blur(4px)',
                transition: 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transitionDelay: `${index * 0.3}s`,
              }}
            >
              {/* Vertical Line */}
              {index < steps.length - 1 && (
                <div
                  className="absolute left-8 top-16 w-0.5 bg-slate-700/50"
                  style={{
                    height: 'calc(100% + 3rem)',
                    zIndex: 0,
                  }}
                >
                  <div
                    className="w-full bg-gradient-to-b from-emerald-400 to-cyan-400 transition-all duration-1000 ease-out"
                    style={{
                      height: visibleSteps[index] ? '100%' : '0%',
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                    }}
                  />
                </div>
              )}

              {/* Number Circle */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center relative z-10 flex-shrink-0 transition-all duration-500"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(16, 185, 129, 0.5)',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
                }}
              >
                <span className="text-2xl">{step.icon}</span>
                <div
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                  }}
                >
                  {step.number}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pt-2">
                <h3 className={`text-lg font-heading font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{step.title}</h3>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

