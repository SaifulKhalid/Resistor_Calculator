
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Upload, RefreshCcw, ShieldAlert, Settings2 } from 'lucide-react';

interface Props {
  onCapture: (image: string) => void;
}

const ResistorScanner: React.FC<Props> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const startCamera = async () => {
    setIsInitializing(true);
    setHasPermission(null);
    
    // 1. Check if mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("MediaDevices API not available");
      setHasPermission(false);
      setIsInitializing(false);
      return;
    }

    try {
      // 2. Attempt high-quality environment capture
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      }).catch(async (err) => {
        // 3. Fallback to basic constraints if high-res/facingMode fails
        console.warn("Retrying with basic constraints...", err);
        return await navigator.mediaDevices.getUserMedia({ video: true });
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setHasPermission(true);
    } catch (err) {
      console.error("Final camera initialization error:", err);
      setHasPermission(false);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
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
      <div className="relative bg-[#0a0d14] border border-slate-800 rounded-3xl overflow-hidden aspect-video shadow-2xl group ring-1 ring-white/5">
        
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-20">
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">Initializing Optics...</p>
          </div>
        )}

        {hasPermission === false ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-950/90 backdrop-blur-md z-30 animate-in fade-in duration-300">
            <div className="bg-red-500/10 p-4 rounded-full mb-6 border border-red-500/20">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-white font-black uppercase tracking-tight text-lg mb-2">Camera Access Blocked</h3>
            <p className="text-slate-400 text-sm mb-8 max-w-sm leading-relaxed">
              To scan resistors, please click the <Settings2 className="inline w-4 h-4 text-indigo-400" /> <strong>lock icon</strong> in your browser's address bar and set <strong>Camera</strong> to <strong>Allow</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              <button 
                onClick={startCamera}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                <RefreshCcw className="w-4 h-4" />
                Retry System
              </button>
              <label className="flex-1 px-6 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700 active:scale-95">
                <Upload className="w-4 h-4" />
                Manual File
                <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
              </label>
            </div>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover md:scale-x-1"
            />
            {/* Alignment Guide Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[80%] h-[25%] border-2 border-dashed border-indigo-400/40 rounded-2xl flex items-center justify-center relative">
                <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[1px]"></div>
                <div className="z-10 text-indigo-300/60 text-[9px] uppercase tracking-[0.3em] font-black bg-slate-950/80 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                  Target Alignment Zone
                </div>
                {/* Crosshairs */}
                <div className="absolute left-0 right-0 h-px bg-indigo-400/20"></div>
                <div className="absolute top-0 bottom-0 w-px bg-indigo-400/20"></div>
              </div>
            </div>
            
            {/* Scan Button */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button 
                onClick={captureFrame}
                className="group relative p-1 bg-white/10 rounded-full backdrop-blur-xl border border-white/20 active:scale-90 transition-transform shadow-2xl"
              >
                <div className="bg-white p-4 rounded-full border-[6px] border-slate-950 group-hover:scale-105 transition-transform">
                  <Camera className="w-8 h-8 text-slate-950" />
                </div>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-center">
        <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
          High-Speed Capture Engine v1.2
        </p>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ResistorScanner;
