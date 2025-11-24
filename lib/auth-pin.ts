/**
 * PIN and Biometric Authentication Utilities
 * Handles PIN storage, validation, and WebAuthn biometric authentication
 */

const PIN_STORAGE_KEY = 'finance_tracker_pin_hash';
const BIOMETRIC_STORAGE_KEY = 'finance_tracker_biometric_enabled';
const USER_ID_KEY = 'finance_tracker_user_id';
const CREDENTIAL_ID_KEY = 'finance_tracker_credential_id';
const PIN_FAILED_ATTEMPTS_KEY = 'finance_tracker_pin_failed_attempts';
const PIN_LOCKOUT_UNTIL_KEY = 'finance_tracker_pin_lockout_until';
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Simple hash function for PIN (not cryptographically secure, but sufficient for local storage)
 * In production, consider using a more secure method or server-side hashing
 */
function hashPIN(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Check if PIN is set up for the current user
 * If userId is provided, it must match. Otherwise, just check if PIN exists.
 */
export function isPINSetup(userId?: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const storedUserId = localStorage.getItem(USER_ID_KEY);
  const pinHash = localStorage.getItem(PIN_STORAGE_KEY);
  
  // If PIN exists, it's set up (userId check is optional for persistence)
  if (!pinHash) {
    return false;
  }
  
  // If userId is provided and doesn't match stored userId, PIN is not for this user
  // But if no userId is provided, assume PIN exists for current user
  if (userId && storedUserId && storedUserId !== userId) {
    return false;
  }
  
  return true;
}

/**
 * Setup PIN for the current user
 */
export function setupPIN(pin: string, userId: string): { success: boolean; error?: string } {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Not available in server environment' };
  }

  if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    return { success: false, error: 'PIN must be exactly 6 digits' };
  }

  try {
    const pinHash = hashPIN(pin);
    localStorage.setItem(PIN_STORAGE_KEY, pinHash);
    localStorage.setItem(USER_ID_KEY, userId);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to store PIN' };
  }
}

/**
 * Check if PIN is currently locked
 */
export function isPINLocked(): boolean {
  if (typeof window === 'undefined') return false;
  
  const lockoutUntil = localStorage.getItem(PIN_LOCKOUT_UNTIL_KEY);
  if (!lockoutUntil) return false;
  
  const lockoutTime = parseInt(lockoutUntil, 10);
  const now = Date.now();
  
  if (now < lockoutTime) {
    return true;
  } else {
    // Lockout expired, clear it
    localStorage.removeItem(PIN_LOCKOUT_UNTIL_KEY);
    localStorage.removeItem(PIN_FAILED_ATTEMPTS_KEY);
    return false;
  }
}

/**
 * Get remaining lockout time in seconds
 */
export function getLockoutRemainingSeconds(): number {
  if (typeof window === 'undefined') return 0;
  
  const lockoutUntil = localStorage.getItem(PIN_LOCKOUT_UNTIL_KEY);
  if (!lockoutUntil) return 0;
  
  const lockoutTime = parseInt(lockoutUntil, 10);
  const now = Date.now();
  const remaining = Math.ceil((lockoutTime - now) / 1000);
  
  return remaining > 0 ? remaining : 0;
}

/**
 * Verify PIN with lockout protection
 */
export function verifyPIN(pin: string, userId?: string): { success: boolean; error?: string; locked?: boolean; remainingSeconds?: number } {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Not available in server environment' };
  }

  // Check if PIN is locked
  if (isPINLocked()) {
    const remaining = getLockoutRemainingSeconds();
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return { 
      success: false, 
      error: `PIN locked. Please try again in ${minutes}:${seconds.toString().padStart(2, '0')}`,
      locked: true,
      remainingSeconds: remaining
    };
  }

  if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    return { success: false, error: 'PIN must be exactly 6 digits' };
  }

  const storedPinHash = localStorage.getItem(PIN_STORAGE_KEY);
  const storedUserId = localStorage.getItem(USER_ID_KEY);

  if (!storedPinHash) {
    return { success: false, error: 'PIN not set up' };
  }

  if (userId && storedUserId !== userId) {
    return { success: false, error: 'User mismatch' };
  }

  const pinHash = hashPIN(pin);
  
  if (pinHash === storedPinHash) {
    // Successful PIN entry - reset failed attempts
    localStorage.removeItem(PIN_FAILED_ATTEMPTS_KEY);
    localStorage.removeItem(PIN_LOCKOUT_UNTIL_KEY);
    return { success: true };
  } else {
    // Failed attempt - increment counter
    const failedAttempts = parseInt(localStorage.getItem(PIN_FAILED_ATTEMPTS_KEY) || '0', 10) + 1;
    localStorage.setItem(PIN_FAILED_ATTEMPTS_KEY, failedAttempts.toString());
    
    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      // Lock the PIN
      const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(PIN_LOCKOUT_UNTIL_KEY, lockoutUntil.toString());
      const minutes = Math.floor(LOCKOUT_DURATION_MS / 60000);
      return { 
        success: false, 
        error: `Too many failed attempts. PIN locked for ${minutes} minutes.`,
        locked: true,
        remainingSeconds: LOCKOUT_DURATION_MS / 1000
      };
    }
    
    const remainingAttempts = MAX_FAILED_ATTEMPTS - failedAttempts;
    return { 
      success: false, 
      error: `Incorrect PIN. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.` 
    };
  }
}

/**
 * Clear PIN (useful for logout or reset)
 */
export function clearPIN(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PIN_STORAGE_KEY);
  localStorage.removeItem(USER_ID_KEY);
}

/**
 * Check if biometric authentication is enabled
 */
export function isBiometricEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(BIOMETRIC_STORAGE_KEY) === 'true';
}

/**
 * Enable biometric authentication
 */
export function enableBiometric(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BIOMETRIC_STORAGE_KEY, 'true');
}

/**
 * Disable biometric authentication
 */
export function disableBiometric(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BIOMETRIC_STORAGE_KEY);
  localStorage.removeItem(CREDENTIAL_ID_KEY);
}

/**
 * Get stored credential ID
 */
function getCredentialId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CREDENTIAL_ID_KEY);
}

/**
 * Check if WebAuthn is available in the browser
 */
export function isWebAuthnAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(navigator.credentials && navigator.credentials.create);
}

/**
 * Setup biometric authentication using WebAuthn
 */
export async function setupBiometric(userId: string, userName: string): Promise<{ 
  success: boolean; 
  error?: string;
  credentialId?: string;
}> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Not available in server environment' };
  }

  if (!isWebAuthnAvailable()) {
    return { success: false, error: 'Biometric authentication not supported in this browser' };
  }

  try {
    // Create a unique user ID for WebAuthn
    const userIdBuffer = new TextEncoder().encode(userId);
    
    // Generate a challenge (in production, this should come from the server)
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    
    // Create credential options
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'Finance Tracker',
        id: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
      },
      user: {
        id: userIdBuffer,
        name: userName,
        displayName: userName,
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }], // ES256
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
      },
      timeout: 60000,
      attestation: 'direct',
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    }) as PublicKeyCredential | null;

    if (!credential) {
      return { success: false, error: 'Failed to create biometric credential' };
    }

    // Store credential ID (in production, also verify with server)
    const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
    localStorage.setItem(CREDENTIAL_ID_KEY, credentialId);
    enableBiometric();
    
    return { success: true, credentialId };
  } catch (error: any) {
    console.error('Biometric setup error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to setup biometric authentication' 
    };
  }
}

/**
 * Authenticate using biometric (Face Recognition)
 */
export async function authenticateWithBiometric(userId: string): Promise<{ 
  success: boolean; 
  error?: string;
  attemptsRemaining?: number;
}> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Not available in server environment' };
  }

  if (!isBiometricEnabled()) {
    return { success: false, error: 'Biometric authentication not enabled' };
  }

  try {
    // Use face recognition instead of WebAuthn
    const { verifyFace } = await import('./face-recognition');
    const result = await verifyFace(userId);
    return result;
  } catch (error: any) {
    console.error('Biometric authentication error:', error);
    
    // Handle user cancellation gracefully
    if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
      return { success: false, error: 'Authentication cancelled' };
    }
    
    return { 
      success: false, 
      error: error.message || 'Face recognition failed' 
    };
  }
}

/**
 * Get user initials from email
 */
export function getUserInitials(email: string): string {
  if (!email) return '?';
  const parts = email.split('@')[0].split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return email.charAt(0).toUpperCase();
}

/**
 * Get display name from email
 */
export function getDisplayName(email: string): string {
  if (!email) return 'User';
  return email.split('@')[0].replace(/[._-]/g, ' ');
}

