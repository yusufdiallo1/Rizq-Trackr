export function IslamicPattern() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        animation: 'subtlePatternDrift 40s ease-in-out infinite, subtleGlowPulse 12s ease-in-out infinite',
        opacity: 0.03,
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="islamic-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            {/* Star Pattern */}
            <g fill="none" stroke="#10b981" strokeWidth="2">
              {/* Outer octagon */}
              <path d="M 100 20 L 141.42 41.42 L 162.84 82.84 L 162.84 117.16 L 141.42 158.58 L 100 180 L 58.58 158.58 L 37.16 117.16 L 37.16 82.84 L 58.58 41.42 Z" />

              {/* Inner star */}
              <path d="M 100 50 L 120 80 L 150 80 L 130 100 L 140 130 L 100 110 L 60 130 L 70 100 L 50 80 L 80 80 Z" />

              {/* Center octagon */}
              <path d="M 100 70 L 115 85 L 115 115 L 100 130 L 85 115 L 85 85 Z" />

              {/* Decorative lines */}
              <line x1="100" y1="20" x2="100" y2="50" />
              <line x1="100" y1="150" x2="100" y2="180" />
              <line x1="20" y1="100" x2="50" y2="100" />
              <line x1="150" y1="100" x2="180" y2="100" />

              {/* Corner decorations */}
              <circle cx="37.16" cy="37.16" r="5" fill="#10b981" opacity="0.5" />
              <circle cx="162.84" cy="37.16" r="5" fill="#10b981" opacity="0.5" />
              <circle cx="37.16" cy="162.84" r="5" fill="#10b981" opacity="0.5" />
              <circle cx="162.84" cy="162.84" r="5" fill="#10b981" opacity="0.5" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
      </svg>
    </div>
  );
}
