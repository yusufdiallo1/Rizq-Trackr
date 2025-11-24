/**
 * Password lockout utilities
 * Handles password attempt tracking and lockout
 */

const PASSWORD_FAILED_ATTEMPTS_KEY = 'finance_tracker_password_failed_attempts';
const PASSWORD_LOCKOUT_UNTIL_KEY = 'finance_tracker_password_lockout_until';
const PASSWORD_LOCKOUT_EMAIL_KEY = 'finance_tracker_password_lockout_email';
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 3 * 60 * 1000; // 3 minutes

/**
 * Check if password is currently locked
 */
export function isPasswordLocked(): boolean {
  if (typeof window === 'undefined') return false;
  
  const lockoutUntil = localStorage.getItem(PASSWORD_LOCKOUT_UNTIL_KEY);
  if (!lockoutUntil) return false;
  
  const lockoutTime = parseInt(lockoutUntil, 10);
  const now = Date.now();
  
  if (now < lockoutTime) {
    return true;
  } else {
    // Lockout expired, clear it
    localStorage.removeItem(PASSWORD_LOCKOUT_UNTIL_KEY);
    localStorage.removeItem(PASSWORD_FAILED_ATTEMPTS_KEY);
    localStorage.removeItem(PASSWORD_LOCKOUT_EMAIL_KEY);
    return false;
  }
}

/**
 * Get remaining lockout time in seconds
 */
export function getPasswordLockoutRemainingSeconds(): number {
  if (typeof window === 'undefined') return 0;
  
  const lockoutUntil = localStorage.getItem(PASSWORD_LOCKOUT_UNTIL_KEY);
  if (!lockoutUntil) return 0;
  
  const lockoutTime = parseInt(lockoutUntil, 10);
  const now = Date.now();
  const remaining = Math.ceil((lockoutTime - now) / 1000);
  
  return remaining > 0 ? remaining : 0;
}

/**
 * Record a failed password attempt
 */
export function recordFailedPasswordAttempt(email: string): { 
  locked: boolean; 
  remainingSeconds?: number;
  attemptsRemaining: number;
} {
  if (typeof window === 'undefined') {
    return { locked: false, attemptsRemaining: MAX_FAILED_ATTEMPTS };
  }

  const failedAttempts = parseInt(localStorage.getItem(PASSWORD_FAILED_ATTEMPTS_KEY) || '0', 10) + 1;
  localStorage.setItem(PASSWORD_FAILED_ATTEMPTS_KEY, failedAttempts.toString());
  
  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    // Lock the password
    const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
    localStorage.setItem(PASSWORD_LOCKOUT_UNTIL_KEY, lockoutUntil.toString());
    localStorage.setItem(PASSWORD_LOCKOUT_EMAIL_KEY, email);
    
    // Send email notification
    sendLockoutEmail(email);
    
    return { 
      locked: true, 
      remainingSeconds: LOCKOUT_DURATION_MS / 1000,
      attemptsRemaining: 0
    };
  }
  
  return { 
    locked: false, 
    attemptsRemaining: MAX_FAILED_ATTEMPTS - failedAttempts 
  };
}

/**
 * Clear failed password attempts (on successful login)
 */
export function clearPasswordAttempts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PASSWORD_FAILED_ATTEMPTS_KEY);
  localStorage.removeItem(PASSWORD_LOCKOUT_UNTIL_KEY);
  localStorage.removeItem(PASSWORD_LOCKOUT_EMAIL_KEY);
}

/**
 * Send lockout email notification - sends security confirmation email
 */
async function sendLockoutEmail(email: string): Promise<void> {
  try {
    // Check if we already sent an email for this lockout
    const lastEmailTime = localStorage.getItem(`${PASSWORD_LOCKOUT_EMAIL_KEY}_sent`);
    const lockoutUntil = localStorage.getItem(PASSWORD_LOCKOUT_UNTIL_KEY);
    
    if (lastEmailTime && lockoutUntil) {
      const lastSent = parseInt(lastEmailTime, 10);
      const lockoutTime = parseInt(lockoutUntil, 10);
      // Only send one email per lockout period
      if (lastSent > lockoutTime - LOCKOUT_DURATION_MS) {
        return;
      }
    }
    
    // Use Supabase to send security confirmation email
    // Using resetPasswordForEmail as a security notification mechanism
    // The email will ask the user to confirm if it was them
    const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs');
    const supabase = createClientComponentClient();
    
    // Send email notification (using password reset as security confirmation)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' 
        ? `${window.location.origin}/forgot-password?security=true` 
        : '/forgot-password?security=true',
    });
    
    // Mark email as sent
    localStorage.setItem(`${PASSWORD_LOCKOUT_EMAIL_KEY}_sent`, Date.now().toString());
  } catch (error) {
    console.error('Failed to send lockout email:', error);
    // Don't throw - email failure shouldn't block the lockout
  }
}

/**
 * Get current failed attempts count
 */
export function getFailedPasswordAttempts(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(PASSWORD_FAILED_ATTEMPTS_KEY) || '0', 10);
}

