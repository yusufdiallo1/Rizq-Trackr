'use client';

interface PINDotsProps {
  length: number;
  filled: number;
  error?: boolean;
}

export function PINDots({ length, filled, error = false }: PINDotsProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {Array.from({ length }).map((_, index) => {
        const isFilled = index < filled;
        const isError = error && filled === length;
        
        return (
          <div
            key={index}
            className={`w-4 h-4 rounded-full transition-all duration-300 flex-shrink-0 ${
              isFilled && !isError
                ? 'animate-pin-dot-fill'
                : isError
                ? 'animate-shake'
                : ''
            }`}
            style={{
              background: isFilled && !isError
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : isError
                ? '#ef4444'
                : 'rgba(255, 255, 255, 0.4)',
              border: isFilled && !isError
                ? 'none'
                : `2px solid ${isError ? '#ef4444' : 'rgba(255, 255, 255, 0.5)'}`,
              boxShadow: isFilled && !isError
                ? '0 0 10px rgba(16, 185, 129, 0.5)'
                : isError
                ? '0 0 10px rgba(239, 68, 68, 0.6)'
                : 'none',
              transform: isError && filled === length ? 'scale(1.1)' : 'scale(1)',
              minWidth: '16px',
              minHeight: '16px',
            }}
          />
        );
      })}
    </div>
  );
}

