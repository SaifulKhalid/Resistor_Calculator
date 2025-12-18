
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Upload, RefreshCcw } from 'lucide-react';

interface Props {
  onCapture: (image: string) => void;
}

const ResistorScanner: React.FC<Props> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setHasPermission(true);
    } catch (err) {
      console.error("Camera error:", err);
      setHasPermission(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onCapture(dataUrl);
      }
    }
  }, [onCapture]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCapture(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden aspect-video shadow-2xl group">
        {hasPermission === false ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
            <Camera className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-300 font-medium mb-2">Camera access denied</p>
            <p className="text-slate-500 text-sm mb-6">We need camera access to scan resistors. Please check your browser permissions.</p>
            <button 
              onClick={startCamera}
              className="px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-500 transition-colors flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover scale-x-[-1] md:scale-x-1"
            />
            {/* Alignment Guide Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[70%] h-[30%] border-2 border-dashed border-indigo-400/50 rounded-2xl flex items-center justify-center relative">
                <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[2px]"></div>
                <div className="z-10 text-indigo-300/80 text-[10px] uppercase tracking-widest font-bold bg-slate-900/80 px-2 py-1 rounded">
                  Place Resistor Here
                </div>
                {/* Horizontal guide line */}
                <div className="absolute left-0 right-0 h-px bg-indigo-400/30"></div>
              </div>
            </div>
            
            {/* Scan Button */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <button 
                onClick={captureFrame}
                className="group relative p-1 bg-white rounded-full shadow-2xl shadow-indigo-500/50 active:scale-95 transition-transform"
              >
                <div className="bg-indigo-600 p-4 rounded-full border-4 border-slate-900 group-hover:bg-indigo-500 transition-colors">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <label className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl cursor-pointer transition-all border border-slate-700">
          <Upload className="w-5 h-5" />
          <span className="font-medium">Upload Image</span>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </label>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ResistorScanner;
