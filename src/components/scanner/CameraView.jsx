import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertCircle } from 'lucide-react';

export default function CameraView({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activeStream = null;
    
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API is not supported by your browser.");
        }
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // Prioritize back camera
        });
        setStream(activeStream);
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access the camera. Please check your browser permissions and try again.");
        // Fallback to user-facing camera if environment fails
        try {
            activeStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(activeStream);
            if (videoRef.current) {
                videoRef.current.srcObject = activeStream;
            }
            setError(null); // Clear previous error if fallback succeeds
        } catch (fallbackErr) {
             console.error("Fallback camera access failed:", fallbackErr);
        }
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(onCapture, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
      >
        <X className="h-7 w-7" />
      </Button>

      {error && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex max-w-sm flex-col items-center gap-2 rounded-lg bg-black/70 p-4 text-center text-white">
            <AlertCircle className="h-8 w-8 text-yellow-400" />
            <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      
      <div className="absolute bottom-8 z-10 flex items-center justify-center">
        <button
          onClick={handleCapture}
          className="group relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/50 bg-white/30 transition-all duration-200 hover:border-white"
          aria-label="Take picture"
          disabled={!!error}
        >
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary opacity-50 blur-md group-hover:opacity-75"></div>
          <div className="h-16 w-16 rounded-full bg-white shadow-lg transition-transform group-hover:scale-105"></div>
        </button>
      </div>
    </div>
  );
}