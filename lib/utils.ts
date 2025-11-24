import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get text color class based on theme - automatically switches between black and white
export function getTextColor(theme: 'light' | 'dark' | 'night'): string {
  if (theme === 'light') {
    return 'text-charcoal-dark';
  }
  return 'text-white';
}

// Get muted text color based on theme
export function getMutedTextColor(theme: 'light' | 'dark' | 'night'): string {
  if (theme === 'light') {
    return 'text-gray-600';
  }
  return 'text-slate-300';
}

// Get text color for cards with white backgrounds (always black)
export function getCardTextColor(theme: 'light' | 'dark' | 'night', isWhiteBackground: boolean = false): string {
  if (isWhiteBackground) {
    return 'text-charcoal-dark';
  }
  return getTextColor(theme);
}

