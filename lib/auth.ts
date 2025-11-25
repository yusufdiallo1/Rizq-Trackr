import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

const supabase = createClientComponentClient<Database>();

export interface AuthResponse {
  error: string | null;
  success: boolean;
  user?: User | null;
}

export interface User {
  id: string;
  email: string;
}

// Sign up new user
export async function signUp(
  email: string,
  password: string,
  metadata?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    country?: string;
    city?: string;
    dateOfBirth?: string;
    gender?: string;
  }
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Email confirmation is disabled in Supabase dashboard
        // Users are automatically confirmed upon signup
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback',
        data: {
          first_name: metadata?.firstName,
          last_name: metadata?.lastName,
          full_name: metadata?.firstName && metadata?.lastName 
            ? `${metadata.firstName} ${metadata.lastName}` 
            : undefined,
          phone: metadata?.phone,
          country: metadata?.country,
          city: metadata?.city,
          date_of_birth: metadata?.dateOfBirth,
          gender: metadata?.gender,
        },
      },
    });

    if (error) {
      return { error: error.message, success: false };
    }

    // If user is automatically confirmed (email confirmation disabled),
    // data.user and data.session will be available immediately
    // If email confirmation is enabled, data.user will be null and data.session will be null
    return { error: null, success: true };
  } catch (err) {
    return { error: 'An unexpected error occurred', success: false };
  }
}

// Sign in existing user
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message, success: false, user: null };
    }

    const user = data.user
      ? {
          id: data.user.id,
          email: data.user.email || '',
        }
      : null;

    return { error: null, success: true, user };
  } catch (err) {
    return { error: 'An unexpected error occurred', success: false, user: null };
  }
}

// Sign out current user
export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message, success: false };
    }

    return { error: null, success: true };
  } catch (err) {
    return { error: 'An unexpected error occurred', success: false };
  }
}

// Reset password - send email
export async function resetPassword(email: string): Promise<AuthResponse> {
  try {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/reset-password`
      : '/auth/reset-password';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      // Handle specific error cases
      if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
        return { error: 'Too many requests. Please try again in a few minutes.', success: false };
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return { error: 'Network error. Please check your connection and try again.', success: false };
      }
      return { error: error.message, success: false };
    }

    return { error: null, success: true };
  } catch (err: any) {
    // Handle network/fetch errors specifically
    if (err?.message?.includes('fetch') || err?.message?.includes('network') || err?.name === 'TypeError') {
      return { error: 'Unable to connect to the server. Please check your internet connection.', success: false };
    }
    return { error: 'An unexpected error occurred. Please try again.', success: false };
  }
}

// Get current user with 2-second timeout to prevent infinite loading
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Race between auth check and 2-second timeout
    const userPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise<{ data: { user: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null } }), 2000)
    );

    const { data: { user } } = await Promise.race([userPromise, timeoutPromise]);

    if (!user) return null;

    return {
      id: user.id,
      email: user.email || '',
    };
  } catch {
    // On any error, treat as not authenticated
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (err) {
    return false;
  }
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check password strength
export function checkPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length < 8) return 'weak';
  
  let strength = 0;
  
  // Check for different character types
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
}

// Re-export PIN and biometric functions from auth-pin
export {
  setupPIN,
  verifyPIN,
  clearPIN,
  isPINSetup,
  isBiometricEnabled,
  enableBiometric,
  disableBiometric,
  setupBiometric,
  authenticateWithBiometric,
  isWebAuthnAvailable,
  getUserInitials,
  getDisplayName,
} from './auth-pin';
