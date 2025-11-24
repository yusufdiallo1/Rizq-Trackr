/**
 * Face Recognition Service
 * Handles camera access, face detection, face encoding, and face matching
 */

const FACE_STORAGE_KEY = 'finance_tracker_face_data';
const FACE_ATTEMPTS_KEY = 'finance_tracker_face_attempts';
const MAX_FACE_ATTEMPTS = 3;

interface FaceDescriptor {
  descriptor: Float32Array;
  userId: string;
  timestamp: number;
}

/**
 * Load face-api.js models (we'll use a CDN or install the library)
 * For now, we'll use a simplified approach with MediaDevices API
 */
let modelsLoaded = false;

/**
 * Check if camera is available
 */
export async function isCameraAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'videoinput');
  } catch (error) {
    return false;
  }
}

/**
 * Get camera stream
 */
export async function getCameraStream(): Promise<MediaStream | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    });
    return stream;
  } catch (error: any) {
    console.error('Camera access error:', error);
    throw new Error(error.message || 'Failed to access camera');
  }
}

/**
 * Capture face from video stream
 * This is a simplified version - in production, use face-api.js or similar
 */
async function captureFaceFromStream(video: HTMLVideoElement): Promise<ImageData | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      resolve(null);
      return;
    }
    
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    resolve(imageData);
  });
}

/**
 * Generate a face descriptor from image data
 * This is a simplified hash-based approach
 * In production, use face-api.js or TensorFlow.js face recognition
 */
function generateFaceDescriptor(imageData: ImageData): Float32Array {
  // Simplified: create a descriptor based on image features
  // In production, use proper face recognition models
  const descriptor = new Float32Array(128);
  const data = imageData.data;
  
  // Simple feature extraction (this is a placeholder)
  for (let i = 0; i < 128; i++) {
    let sum = 0;
    const step = Math.floor(data.length / 128);
    for (let j = 0; j < step; j++) {
      sum += data[i * step + j] || 0;
    }
    descriptor[i] = sum / step / 255;
  }
  
  return descriptor;
}

/**
 * Calculate distance between two face descriptors
 */
function calculateFaceDistance(descriptor1: Float32Array, descriptor2: Float32Array): number {
  let distance = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    distance += diff * diff;
  }
  return Math.sqrt(distance);
}

/**
 * Save face data to database/localStorage
 */
export async function saveFaceData(userId: string, descriptor: Float32Array): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Not available in server environment' };
  }

  try {
    const faceData: FaceDescriptor = {
      descriptor,
      userId,
      timestamp: Date.now(),
    };

    // Store in localStorage (in production, store in database)
    localStorage.setItem(FACE_STORAGE_KEY, JSON.stringify({
      ...faceData,
      descriptor: Array.from(descriptor), // Convert Float32Array to array for JSON
    }));

    // Also try to save to Supabase if available
    try {
      const { createSupabaseClient } = await import('./supabase');
      const supabase = createSupabaseClient();
      // Note: user_faces table needs to be created in Supabase
      // For now, we'll just use localStorage
      // await supabase.from('user_faces').upsert({
      //   user_id: userId,
      //   face_descriptor: Array.from(descriptor),
      //   created_at: new Date().toISOString(),
      // });
    } catch (dbError) {
      // If database save fails, continue with localStorage
      console.warn('Using localStorage for face data:', dbError);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save face data' };
  }
}

/**
 * Get stored face data
 */
export function getStoredFaceData(userId: string): FaceDescriptor | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(FACE_STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    if (data.userId !== userId) return null;

    return {
      ...data,
      descriptor: new Float32Array(data.descriptor),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Register face - capture and save
 */
export async function registerFace(userId: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Not available in server environment' };
  }

  try {
    // Get camera stream
    const stream = await getCameraStream();
    if (!stream) {
      return { success: false, error: 'Failed to access camera' };
    }

    // Create video element
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true; // Required for autoplay in most browsers

    // Wait for video to be ready
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Video loading timeout'));
      }, 10000);
      
      video.onloadedmetadata = () => {
        video.play()
          .then(() => {
            clearTimeout(timeout);
            resolve(undefined);
          })
          .catch((err) => {
            clearTimeout(timeout);
            reject(err);
          });
      };
      video.onerror = (err) => {
        clearTimeout(timeout);
        reject(new Error('Video error'));
      };
      
      // If video is already loaded
      if (video.readyState >= 2) {
        video.play()
          .then(() => {
            clearTimeout(timeout);
            resolve(undefined);
          })
          .catch((err) => {
            clearTimeout(timeout);
            reject(err);
          });
      }
    });

    // Wait a bit for face to be visible and stable
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Capture face
    const imageData = await captureFaceFromStream(video);
    if (!imageData) {
      stream.getTracks().forEach(track => track.stop());
      return { success: false, error: 'Failed to capture face' };
    }

    // Generate descriptor
    const descriptor = generateFaceDescriptor(imageData);

    // Save face data
    const result = await saveFaceData(userId, descriptor);

    // Stop camera
    stream.getTracks().forEach(track => track.stop());

    return result;
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to register face' };
  }
}

/**
 * Verify face - capture and match
 */
export async function verifyFace(userId: string): Promise<{ 
  success: boolean; 
  error?: string;
  attemptsRemaining?: number;
}> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Not available in server environment' };
  }

  // Get stored face data
  const storedFace = getStoredFaceData(userId);
  if (!storedFace) {
    return { success: false, error: 'No face registered for this user' };
  }

  // Check attempts
  const attempts = getFaceAttempts();
  if (attempts >= MAX_FACE_ATTEMPTS) {
    return { 
      success: false, 
      error: 'Too many failed attempts. Please use PIN instead.',
      attemptsRemaining: 0,
    };
  }

  try {
    // Get camera stream
    const stream = await getCameraStream();
    if (!stream) {
      return { success: false, error: 'Failed to access camera' };
    }

    // Create video element
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true; // Required for autoplay in most browsers

    // Wait for video to be ready
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Video loading timeout'));
      }, 10000);
      
      video.onloadedmetadata = () => {
        video.play()
          .then(() => {
            clearTimeout(timeout);
            resolve(undefined);
          })
          .catch((err) => {
            clearTimeout(timeout);
            reject(err);
          });
      };
      video.onerror = (err) => {
        clearTimeout(timeout);
        reject(new Error('Video error'));
      };
      
      // If video is already loaded
      if (video.readyState >= 2) {
        video.play()
          .then(() => {
            clearTimeout(timeout);
            resolve(undefined);
          })
          .catch((err) => {
            clearTimeout(timeout);
            reject(err);
          });
      }
    });

    // Wait a bit for face to be visible and stable
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Capture face
    const imageData = await captureFaceFromStream(video);
    if (!imageData) {
      stream.getTracks().forEach(track => track.stop());
      incrementFaceAttempts();
      return { 
        success: false, 
        error: 'Failed to capture face',
        attemptsRemaining: MAX_FACE_ATTEMPTS - attempts - 1,
      };
    }

    // Generate descriptor
    const currentDescriptor = generateFaceDescriptor(imageData);

    // Calculate distance
    const distance = calculateFaceDistance(currentDescriptor, storedFace.descriptor);
    
    // Stop camera
    stream.getTracks().forEach(track => track.stop());

    // Threshold for matching (adjust based on your needs)
    const threshold = 0.6; // Lower = more strict

    if (distance < threshold) {
      // Match found - reset attempts
      resetFaceAttempts();
      return { success: true };
    } else {
      // No match - increment attempts
      incrementFaceAttempts();
      const remaining = MAX_FACE_ATTEMPTS - attempts - 1;
      return { 
        success: false, 
        error: remaining > 0 ? `${remaining} attempts remaining` : 'Face recognition failed',
        attemptsRemaining: remaining,
      };
    }
  } catch (error: any) {
    incrementFaceAttempts();
    return { 
      success: false, 
      error: error.message || 'Face verification failed',
      attemptsRemaining: MAX_FACE_ATTEMPTS - attempts - 1,
    };
  }
}

/**
 * Get current face attempts
 */
function getFaceAttempts(): number {
  if (typeof window === 'undefined') return 0;
  const attempts = localStorage.getItem(FACE_ATTEMPTS_KEY);
  return attempts ? parseInt(attempts, 10) : 0;
}

/**
 * Increment face attempts
 */
function incrementFaceAttempts(): void {
  if (typeof window === 'undefined') return;
  const current = getFaceAttempts();
  localStorage.setItem(FACE_ATTEMPTS_KEY, (current + 1).toString());
}

/**
 * Reset face attempts
 */
function resetFaceAttempts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(FACE_ATTEMPTS_KEY);
}

/**
 * Clear face data
 */
export function clearFaceData(userId: string): void {
  if (typeof window === 'undefined') return;
  const stored = getStoredFaceData(userId);
  if (stored && stored.userId === userId) {
    localStorage.removeItem(FACE_STORAGE_KEY);
  }
  resetFaceAttempts();
}

