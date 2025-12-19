
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Upload, RefreshCcw, ShieldAlert, Maximize2 } from 'lucide-react';

interface Props {
  onCapture: (image: string) => void;
  isProcessing: boolean;
}

const ResistorScanner: React.FC<Props> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const startCamera = async () => {
    setIsInitializing(true);
    setHasPermission(null);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setHasPermission(true);
    } catch (err) {
      setHasPermission(false);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  const captureFrame = useCallback(() => {
    if (isProcessing) return;
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      onCapture(canvas.toDataURL('image/jpeg', 0.9));
    }
  }, [onCapture, isProcessing]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) onCapture(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative bg-[#0a0d14] border border-slate-800 rounded-[2rem] overflow-hidden aspect-video shadow-2xl group">
        
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-20">
             <div className="w-8 h-8 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        )}

        {hasPermission === false ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-950/95 z-30">
            <ShieldAlert className="w-10 h-10 text-rose-500 mb-4" />
            <p className="text-slate-400 text-sm mb-6">Camera access is required for live scanning.</p>
            <div className="flex gap-3">
              <button onClick={startCamera} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-500 flex items-center gap-2 transition-all">
                <RefreshCcw size={16} /> Retry
              </button>
              <label className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-700 flex items-center gap-2 cursor-pointer transition-all">
                <Upload size={16} /> Upload <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
              </label>
            </div>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            
            {/* Alignment Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-full h-px bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                <div className="mt-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded text-[9px] text-white uppercase tracking-[0.2em] font-black border border-white/10">
                    Align Resistor Horizontally
                </div>
                <div className="absolute top-4 right-4 text-[8px] text-white/40 font-bold uppercase tracking-widest bg-black/20 px-2 py-1 rounded border border-white/5">
                    Live Feed 60FPS
                </div>
            </div>
            
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <button 
                onClick={captureFrame}
                disabled={isProcessing}
                className={`p-5 bg-white text-slate-950 rounded-full shadow-2xl active:scale-90 transition-all ${isProcessing ? 'opacity-20 scale-90 grayscale' : 'hover:scale-105'}`}
              >
                <Camera className="w-7 h-7" />
              </button>
            </div>
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ResistorScanner;
