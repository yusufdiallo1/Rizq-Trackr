'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';
import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeFeature, setActiveFeature] = useState(0);
  
  const features = [
    { icon: '🕌', name: 'Zakat', color: '#f59e0b', description: 'Calculating Zakat' },
    { icon: '💰', name: 'Income', color: '#10b981', description: 'Tracking Income' },
    { icon: '💸', name: 'Expenses', color: '#ef4444', description: 'Recording Expenses' },
    { icon: '💹', name: 'Savings', color: '#3b82f6', description: 'Monitoring Savings' },
  ];
  
  useEffect(() => {
    // Cycle through features every 600ms for faster feedback
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 600);
    
    return () => clearInterval(interval);
  }, [features.length]);
  
  return (
    <div 
      className="fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: isDark 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' 
          : 'linear-gradient(to bottom, #ffffff, #f8fafc)',
      }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        {/* Islamic Geometric Pattern */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              width: '40px',
              height: '40px',
              border: `2px solid ${features[i % features.length].color}`,
              borderRadius: '50%',
              left: `${(i * 5) % 100}%`,
              top: `${(i * 7) % 100}%`,
              animation: `pulse 3s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center">
        {/* Feature Icons Carousel */}
        <div className="mb-8 relative h-32 w-32 mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="absolute inset-0 flex items-center justify-center transition-all duration-500"
              style={{
                opacity: activeFeature === index ? 1 : 0,
                transform: activeFeature === index 
                  ? 'scale(1) translateY(0)' 
                  : 'scale(0.5) translateY(20px)',
                zIndex: activeFeature === index ? 10 : 1,
              }}
            >
              <div
                className="relative"
                style={{
                  animation: activeFeature === index ? 'bounce 1s ease-in-out infinite' : 'none',
                }}
              >
                {/* Icon with glow effect */}
                <div
                  className="text-7xl mb-4 relative"
                  style={{
                    filter: activeFeature === index 
                      ? `drop-shadow(0 0 20px ${feature.color}80)`
                      : 'none',
                  }}
                >
                  {feature.icon}
                </div>
                
                {/* Rotating ring */}
                {activeFeature === index && (
                  <div
                    className="absolute inset-0 rounded-full border-4"
                    style={{
                      borderColor: `${feature.color}40`,
                      borderTopColor: feature.color,
                      animation: 'spin 1s linear infinite',
                      top: '-10px',
                      left: '-10px',
                      right: '-10px',
                      bottom: '-10px',
                }}
                  />
                )}
              </div>
              </div>
            ))}
          </div>
          
        {/* Active Feature Name */}
        <div className="mb-4 h-8">
          <h2 
            className={`text-2xl md:text-3xl font-bold transition-all duration-500 ${
              isDark ? 'text-white' : 'text-charcoal'
            }`}
            style={{
              color: activeFeature !== null ? features[activeFeature].color : undefined,
              opacity: 1,
            }}
          >
            {features[activeFeature].name}
        </h2>
        </div>

        {/* Loading Text */}
        <div className="mb-6 h-6">
          <p 
            className={`text-base font-medium transition-all duration-500 ${
              isDark ? 'text-white/70' : 'text-charcoal/70'
            }`}
            key={activeFeature}
            style={{
              animation: 'fadeIn 0.3s ease-in',
            }}
          >
            {features[activeFeature].description}...
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-full transition-all duration-300"
              style={{
                width: activeFeature === index ? '12px' : '8px',
                height: activeFeature === index ? '12px' : '8px',
                backgroundColor: activeFeature === index 
                  ? feature.color 
                  : isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                transform: activeFeature === index ? 'scale(1.2)' : 'scale(1)',
                boxShadow: activeFeature === index 
                  ? `0 0 10px ${feature.color}80`
                  : 'none',
              }}
            />
          ))}
        </div>

        {/* App Name */}
        <p className={`text-sm ${isDark ? 'text-white/50' : 'text-charcoal/50'}`}>
          Rizq Trackr
        </p>
      </div>

    </div>
  );
}
