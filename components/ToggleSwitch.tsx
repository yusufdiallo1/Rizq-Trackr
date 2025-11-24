'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function ToggleSwitch({ 
  enabled, 
  onToggle, 
  label, 
  description,
  disabled = false 
}: ToggleSwitchProps) {
  const { theme } = useTheme();

  return (
    <div className="flex items-center justify-between">
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <h3 className={`font-semibold ${theme === 'light' ? 'text-charcoal-dark' : 'text-white'} mb-1`}>
              {label}
            </h3>
          )}
          {description && (
            <p className={`text-sm ${theme === 'light' ? 'text-charcoal opacity-70' : 'text-white/70'}`}>
              {description}
            </p>
          )}
        </div>
      )}
      <button
        onClick={() => !disabled && onToggle(!enabled)}
        disabled={disabled}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
          enabled 
            ? 'bg-cyan-500' 
            : theme === 'light' 
              ? 'bg-gray-300' 
              : 'bg-white/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        style={{
          backdropFilter: 'blur(10px)',
        }}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-lg ${
            enabled ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

