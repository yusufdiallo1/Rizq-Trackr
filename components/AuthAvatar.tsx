'use client';

import { getUserInitials } from '@/lib/auth-pin';

interface AuthAvatarProps {
  email: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AuthAvatar({ email, name, size = 'lg' }: AuthAvatarProps) {
  const initials = getUserInitials(email);
  const sizeClasses = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-20 h-20 text-2xl',
    lg: 'w-[120px] h-[120px] text-[2rem]',
  };

  return (
    <div className="relative mb-6">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-bold relative overflow-hidden mx-auto`}
        style={{
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #10b981 100%)',
          boxShadow: '0 0 40px rgba(6, 182, 212, 0.6), 0 0 80px rgba(16, 185, 129, 0.4), 0 0 120px rgba(8, 145, 178, 0.2)',
          border: '4px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        <div className="absolute inset-0 border-2 border-white/40 rounded-full"></div>
        <span className="relative z-10">{initials}</span>
      </div>
      {name && (
        <div className="mt-4 text-center">
          <h2 className="text-white text-xl md:text-2xl font-bold">{name}</h2>
        </div>
      )}
    </div>
  );
}

