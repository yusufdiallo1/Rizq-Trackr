'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LiquidGlassContextType {
  isLiquidGlassEnabled: boolean;
  enableLiquidGlass: () => void;
  disableLiquidGlass: () => void;
  hasSeenUpdatePrompt: boolean;
  setHasSeenUpdatePrompt: (seen: boolean) => void;
}

const LiquidGlassContext = createContext<LiquidGlassContextType | undefined>(undefined);

export function LiquidGlassProvider({ children }: { children: ReactNode }) {
  const [isLiquidGlassEnabled, setIsLiquidGlassEnabled] = useState(false);
  const [hasSeenUpdatePrompt, setHasSeenUpdatePrompt] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const enabled = localStorage.getItem('liquidGlassEnabled') === 'true';
        const seen = localStorage.getItem('liquidGlassUpdateSeen') === 'true';
        setIsLiquidGlassEnabled(enabled);
        setHasSeenUpdatePrompt(seen);
      } catch (err) {
        // Silently handle localStorage errors
      }
    }
  }, []);

  const enableLiquidGlass = () => {
    setIsLiquidGlassEnabled(true);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('liquidGlassEnabled', 'true');
        document.documentElement.setAttribute('data-liquid-glass', 'true');
      } catch (err) {
        // Silently handle localStorage errors
      }
    }
  };

  const disableLiquidGlass = () => {
    setIsLiquidGlassEnabled(false);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('liquidGlassEnabled', 'false');
        document.documentElement.removeAttribute('data-liquid-glass');
      } catch (err) {
        // Silently handle localStorage errors
      }
    }
  };

  const handleSetHasSeenUpdatePrompt = (seen: boolean) => {
    setHasSeenUpdatePrompt(seen);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('liquidGlassUpdateSeen', seen ? 'true' : 'false');
      } catch (err) {
        // Silently handle localStorage errors
      }
    }
  };

  // Apply liquid glass class to document
  useEffect(() => {
    if (isLiquidGlassEnabled) {
      document.documentElement.setAttribute('data-liquid-glass', 'true');
    } else {
      document.documentElement.removeAttribute('data-liquid-glass');
    }
  }, [isLiquidGlassEnabled]);

  return (
    <LiquidGlassContext.Provider
      value={{
        isLiquidGlassEnabled,
        enableLiquidGlass,
        disableLiquidGlass,
        hasSeenUpdatePrompt,
        setHasSeenUpdatePrompt: handleSetHasSeenUpdatePrompt,
      }}
    >
      {children}
    </LiquidGlassContext.Provider>
  );
}

export function useLiquidGlass() {
  const context = useContext(LiquidGlassContext);
  if (context === undefined) {
    throw new Error('useLiquidGlass must be used within a LiquidGlassProvider');
  }
  return context;
}

