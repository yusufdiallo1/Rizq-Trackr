'use client';

import { useEffect, useState, useRef } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote: 'Rizq Trackr has transformed how I manage my finances. The Zakat calculator is incredibly accurate and saves me hours of work.',
    name: 'Ahmed Al-Rashid',
    role: 'Business Owner',
    avatar: '👨‍💼',
    rating: 5,
  },
  {
    quote: 'As a Muslim professional, I needed a tool that respects Islamic principles. This app does exactly that, and the UI is beautiful!',
    name: 'Fatima Hassan',
    role: 'Software Engineer',
    avatar: '👩‍💻',
    rating: 5,
  },
  {
    quote: 'The security features give me peace of mind, and the analytics help me understand my spending patterns better than ever.',
    name: 'Omar Khan',
    role: 'Financial Advisor',
    avatar: '👨‍💼',
    rating: 5,
  },
  {
    quote: 'Finally, a finance app built for Muslims! The automatic Zakat calculations are a game-changer for my family.',
    name: 'Aisha Malik',
    role: 'Teacher',
    avatar: '👩‍🏫',
    rating: 5,
  },
];

export function HomepageTestimonials() {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleStars, setVisibleStars] = useState<boolean[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Reset and animate stars when testimonial changes
    setVisibleStars([]);
    const stars = Array.from({ length: testimonials[currentIndex].rating }, (_, i) => i);
    stars.forEach((_, index) => {
      setTimeout(() => {
        setVisibleStars((prev) => {
          const newStars = [...prev];
          newStars[index] = true;
          return newStars;
        });
      }, index * 100);
    });
  }, [currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setVisibleStars([]);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setVisibleStars([]);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="py-20 sm:py-24 lg:py-32 relative"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-center mb-16 scroll-fade-in visible ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          What Our Users Say
        </h2>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto relative">
          {/* Testimonial Card */}
          <div
            key={currentIndex}
            className="relative p-8 sm:p-12 rounded-2xl transition-all duration-500 hover:scale-105"
            style={{
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: theme === 'dark' ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(16, 185, 129, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = theme === 'dark' ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            }}
          >
            {/* Quote */}
            <p className={`text-lg sm:text-xl italic mb-8 leading-relaxed ${theme === 'dark' ? 'text-white/90' : 'text-slate-800'}`}>
              &ldquo;{currentTestimonial.quote}&rdquo;
            </p>

            {/* User Info */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                {currentTestimonial.avatar}
              </div>

              {/* Name & Role */}
              <div className="flex-1">
                <h4 className={`font-semibold text-lg mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{currentTestimonial.name}</h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>{currentTestimonial.role}</p>
              </div>

              {/* Star Rating */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className="text-2xl transition-all duration-300"
                    style={{
                      opacity: visibleStars[i] ? 1 : 0,
                      transform: visibleStars[i] ? 'scale(1)' : 'scale(0)',
                      color: i < currentTestimonial.rating ? '#fbbf24' : '#4b5563',
                    }}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Arrows - Hidden on mobile */}
          <button
            onClick={goToPrevious}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 w-12 h-12 rounded-full items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
            }}
            aria-label="Previous testimonial"
          >
            <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 w-12 h-12 rounded-full items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
            }}
            aria-label="Next testimonial"
          >
            <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setVisibleStars([]);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-8 bg-emerald-400' : 'bg-white/30'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

