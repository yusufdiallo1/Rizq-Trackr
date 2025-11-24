'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractIncomeData, IncomeDocumentData } from '@/lib/income-scanner';

interface IncomeImageUploadProps {
  onDataExtracted: (data: IncomeDocumentData) => void;
  onClose: () => void;
}

export function IncomeImageUpload({ onDataExtracted, onClose }: IncomeImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process with OCR
    await processImage(file);
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const { data, error } = await extractIncomeData(file);

      if (error) {
        setError(error);
        setIsProcessing(false);
        return;
      }

      if (data) {
        onDataExtracted(data);
      }
    } catch (err) {
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    // On mobile, use the native camera input
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      cameraInputRef.current?.click();
    } else {
      // On desktop, show webcam view
      startCamera();
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Could not access camera. Please use file upload instead.');
    }
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        stopCamera();
        await handleFileSelect(file);
      }
    }, 'image/jpeg', 0.9);
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60"
          onClick={() => {
            stopCamera();
            onClose();
          }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl lg:rounded-3xl bg-slate-900 border border-slate-700"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-white">Scan Income Document</h2>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Description */}
            <p className="text-slate-400 text-sm">
              Upload or take a photo of your invoice, check, or pay stub. We'll automatically extract the payment details.
            </p>

            {/* Camera View */}
            {showCamera && (
              <div className="relative rounded-2xl overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-[4/3] object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <button
                    onClick={stopCamera}
                    className="w-14 h-14 rounded-full bg-slate-800/80 backdrop-blur-sm flex items-center justify-center text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500" />
                  </button>
                </div>
              </div>
            )}

            {/* Preview Image */}
            {previewImage && !showCamera && (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={previewImage} alt="Document preview" className="w-full" />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-white font-medium">Analyzing document...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload Options */}
            {!showCamera && !previewImage && (
              <div className="grid grid-cols-2 gap-4">
                {/* Take Photo */}
                <button
                  onClick={handleCameraClick}
                  className="p-6 rounded-2xl border-2 border-dashed border-slate-600 hover:border-emerald-500 transition-colors flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-white font-medium">Take Photo</span>
                  <span className="text-slate-400 text-xs">Use camera</span>
                </button>

                {/* Upload Image */}
                <button
                  onClick={handleUploadClick}
                  className="p-6 rounded-2xl border-2 border-dashed border-slate-600 hover:border-cyan-500 transition-colors flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-white font-medium">Upload Image</span>
                  <span className="text-slate-400 text-xs">From gallery</span>
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Supported Documents */}
            <div className="space-y-2">
              <p className="text-slate-500 text-xs uppercase tracking-wider">Supported Documents</p>
              <div className="flex flex-wrap gap-2">
                {['Invoices', 'Checks', 'Pay Stubs', 'Receipts'].map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 rounded-full text-xs bg-slate-800 text-slate-400 border border-slate-700"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Hidden Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
