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
  firstName?: string;
  lastName?: string;
  fullName?: string;
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
    // No timeout - let it complete naturally
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
          firstName: data.user.user_metadata?.first_name,
          lastName: data.user.user_metadata?.last_name,
          fullName: data.user.user_metadata?.full_name,
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

// Get current user with improved timeout handling to prevent redirect loops
export async function getCurrentUser(): Promise<User | null> {
  try {
    // First try to get session (faster than getUser)
    const { data: { session } } = await supabase.auth.getSession();
    
    // If we have a session, get the user from it (no need for getUser call)
    if (session?.user) {
      return {
        id: session.user.id,
        email: session.user.email || '',
        firstName: session.user.user_metadata?.first_name,
        lastName: session.user.user_metadata?.last_name,
        fullName: session.user.user_metadata?.full_name,
      };
    }

    // If no session, try getUser with a longer timeout (5 seconds)
    // This handles cases where session might not be immediately available
    const userPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise<{ data: { user: null }; error: null }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null }, error: null }), 5000)
    );

    const result = await Promise.race([userPromise, timeoutPromise]);
    
    // If timeout occurred, check session one more time before giving up
    if (!result.data?.user) {
      const { data: { session: retrySession } } = await supabase.auth.getSession();
      if (retrySession?.user) {
        return {
          id: retrySession.user.id,
          email: retrySession.user.email || '',
          firstName: retrySession.user.user_metadata?.first_name,
          lastName: retrySession.user.user_metadata?.last_name,
          fullName: retrySession.user.user_metadata?.full_name,
        };
      }
      return null;
    }

    const user = result.data.user;
    if (!user) return null;

    return {
      id: user.id,
      email: user.email || '',
      firstName: user.user_metadata?.first_name,
      lastName: user.user_metadata?.last_name,
      fullName: user.user_metadata?.full_name,
    };
  } catch {
    // On any error, try one more time with getSession before giving up
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        return {
          id: session.user.id,
          email: session.user.email || '',
          firstName: session.user.user_metadata?.first_name,
          lastName: session.user.user_metadata?.last_name,
          fullName: session.user.user_metadata?.full_name,
        };
      }
    } catch {
      // Final fallback - return null
    }
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
