'use client';

import React, { useEffect, useState } from 'react';

interface IPhoneMockupProps {
  className?: string;
}

export function IPhoneMockup({ className = '' }: IPhoneMockupProps) {
  const [currentScreen, setCurrentScreen] = useState(0);

  const screens = [
    {
      name: 'Dashboard',
      content: (
        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-white text-sm">🕌</span>
            </div>
            <div className="text-white text-xs font-semibold">FinanceTracker</div>
            <div className="w-8 h-8"></div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="bg-slate-700/50 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-emerald-400 text-xs mb-1">Total Balance</div>
              <div className="text-white text-xl font-bold">$12,450.00</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-700/50 rounded-lg p-2 backdrop-blur-sm">
                <div className="text-emerald-400 text-xs mb-1">Income</div>
                <div className="text-white text-sm font-semibold">$5,200</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-2 backdrop-blur-sm">
                <div className="text-amber-400 text-xs mb-1">Expenses</div>
                <div className="text-white text-sm font-semibold">$2,100</div>
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-2 backdrop-blur-sm">
              <div className="text-cyan-400 text-xs mb-1">Zakat Due</div>
              <div className="text-white text-sm font-semibold">$311.25</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: 'Income',
      content: (
        <div className="w-full h-full bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white text-sm font-semibold">Income</div>
            <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 text-xs">+</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white text-xs">Salary</span>
                <span className="text-emerald-400 text-sm font-bold">$4,500</span>
              </div>
              <div className="text-white/60 text-xs">March 2024</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white text-xs">Business</span>
                <span className="text-emerald-400 text-sm font-bold">$700</span>
              </div>
              <div className="text-white/60 text-xs">March 2024</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white text-xs">Total</span>
                <span className="text-emerald-400 text-lg font-bold">$5,200</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      name: 'Zakat',
      content: (
        <div className="w-full h-full bg-gradient-to-br from-cyan-900/20 to-blue-800/10 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white text-sm font-semibold">Zakat Calculator</div>
            <div className="w-6 h-6 rounded-full bg-cyan-500/30 flex items-center justify-center">
              <span className="text-cyan-400 text-xs">⚖️</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
              <div className="text-cyan-400 text-xs mb-2">Zakatable Assets</div>
              <div className="text-white text-2xl font-bold mb-1">$12,450.00</div>
              <div className="text-white/60 text-xs">2.5% Zakat Rate</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
              <div className="flex justify-between items-center">
                <span className="text-white text-xs">Zakat Due</span>
                <span className="text-cyan-400 text-lg font-bold">$311.25</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm border border-white/20">
              <div className="text-white/80 text-xs">Next payment due in 15 days</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreen((prev) => (prev + 1) % screens.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [screens.length]);

  return (
    <div className={`relative ${className}`}>
      {/* iPhone Frame */}
      <div className="relative mx-auto" style={{ width: '280px', maxWidth: '100%' }}>
        {/* Phone Body */}
        <div
          className="relative rounded-[3rem] p-2 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '8px solid #0f172a',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(16, 185, 129, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Notch */}
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 rounded-b-2xl z-10"
            style={{
              background: '#0f172a',
            }}
          />

          {/* Screen */}
          <div
            className="relative rounded-[2.5rem] overflow-hidden"
            style={{
              width: '100%',
              paddingTop: '177.78%', // 16:9 aspect ratio
              background: '#000',
            }}
          >
            <div className="absolute inset-0">
              {screens.map((screen, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 ${
                    index === currentScreen
                      ? 'opacity-100 translate-y-0'
                      : index < currentScreen
                      ? 'opacity-0 -translate-y-4'
                      : 'opacity-0 translate-y-4'
                  }`}
                >
                  {screen.content}
                </div>
              ))}
            </div>
          </div>

          {/* Home Indicator */}
          <div
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 rounded-full"
            style={{
              background: 'rgba(255, 255, 255, 0.3)',
            }}
          />
        </div>

        {/* Glow Effect */}
        <div
          className="absolute inset-0 rounded-[3rem] pointer-events-none animate-pulse-glow"
          style={{
            background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
            filter: 'blur(20px)',
            zIndex: -1,
          }}
        />
      </div>
    </div>
  );
}

