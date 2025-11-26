'use client';

import { useEffect, useRef, useState } from 'react';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: '🕌',
    title: 'Islamic First',
    description: 'Built with Islamic principles. Automatic Zakat calculations based on authentic Islamic jurisprudence.',
  },
  {
    icon: '🛡️',
    title: 'Secure & Private',
    description: 'Bank-level security with Face ID, PIN protection, and end-to-end encrypted data storage.',
  },
  {
    icon: '📊',
    title: 'Beautiful Analytics',
    description: 'Understand your finances with intuitive charts, detailed reports, and actionable insights.',
  },
];

export function HomepageFeatures() {
  const [visibleCards, setVisibleCards] = useState<boolean[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards((prev) => {
              const newCards = [...prev];
              newCards[index] = true;
              return newCards;
            });
            // Also mark title as visible
            const title = sectionRef.current?.querySelector('h2');
            if (title) {
              title.classList.add('visible');
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
      const cards = sectionRef.current.querySelectorAll('[data-index]');
      cards.forEach((card) => observer.observe(card));
    }

    return () => {
      if (sectionRef.current) {
        const cards = sectionRef.current.querySelectorAll('[data-index]');
        cards.forEach((card) => observer.unobserve(card));
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 sm:py-24 lg:py-32 relative"
      style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white text-center mb-16 scroll-fade-in visible">
          Why Choose Rizq Trackr?
        </h2>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              data-index={index}
              className={`group relative p-8 rounded-2xl transition-all duration-500 cursor-pointer scroll-scale-in ${
                visibleCards[index] ? 'visible' : ''
              }`}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transitionDelay: `${index * 0.1}s`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-6 transition-all duration-500 group-hover:rotate-360 group-hover:scale-110"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-white mb-4">{feature.title}</h3>

              {/* Description */}
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">{feature.description}</p>

              {/* Hover Glow Effect */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

