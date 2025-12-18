
import React, { useState, useCallback } from 'react';
import { RotateCcw, Zap, Info, Cpu, ShieldCheck } from 'lucide-react';
import ResistorScanner from './components/ResistorScanner';
import AnalysisResult from './components/AnalysisResult';
import { ResistorResult } from './types';
import { analyzeResistorImage } from './services/geminiService';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ResistorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = useCallback(async (base64Image: string) => {
    setImage(base64Image);
    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const analysis = await analyzeResistorImage(base64Image);
      if (analysis) {
        setResult(analysis);
      } else {
        setError("AI could not identify the component clearly. Ensure the resistor is centered and well-lit.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during visual analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#050810] font-sans p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">Resistor Lens <span className="text-indigo-500 font-normal not-italic">Pro</span></h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Powered by LabDDB.site</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => alert("ALIGNMENT GUIDE:\n1. Place resistor horizontally.\n2. Ensure left-to-right orientation.\n3. Keep lighting consistent.\n\nThe AI uses expert electronics logic to identify bands and calculate Ω values.")}
          className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-900/50 rounded-lg border border-slate-800"
        >
          <Info className="w-5 h-5" />
        </button>
      </header>

      <main className="w-full max-w-2xl flex flex-col gap-6">
        {!image ? (
          <ResistorScanner onCapture={handleCapture} />
        ) : (
          <div className="flex flex-col gap-6 animate-in zoom-in-95 duration-500">
            {/* Image Preview Container */}
            <div className="relative group rounded-3xl overflow-hidden border border-slate-800/50 bg-slate-900 shadow-2xl ring-1 ring-white/5">
              <img 
                src={image} 
                alt="Captured Resistor" 
                className={`w-full h-auto aspect-video object-cover transition-all duration-700 ${isAnalyzing ? 'scale-105 opacity-40 blur-md' : 'scale-100 opacity-100'}`} 
              />
              
              {isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-sm">
                  <div className="relative">
                    <Zap className="w-16 h-16 text-indigo-400 animate-pulse" />
                    <div className="absolute -inset-4 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-8 text-white font-black uppercase tracking-[0.2em] text-xs">Processing Visual Data</p>
                  <p className="text-indigo-400/60 text-[10px] mt-2 font-mono italic text-center px-4">Analyzing color bands using expert computer vision persona...</p>
                </div>
              )}

              <button 
                onClick={reset}
                className="absolute bottom-4 right-4 p-3 bg-slate-950/80 hover:bg-red-600 text-white rounded-2xl backdrop-blur-xl transition-all border border-slate-800 hover:border-red-400 shadow-xl"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              
              {!isAnalyzing && result && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Analysis Complete</span>
                </div>
              )}
            </div>

            {error && (
              <div className="p-5 bg-red-950/30 border border-red-500/30 rounded-2xl text-red-200 text-sm flex items-start gap-3 shadow-inner">
                <div className="mt-0.5 p-1 bg-red-500/20 rounded">
                  <Zap className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <strong className="block mb-1 text-red-400 uppercase text-xs tracking-wider font-black">Scan Error</strong>
                  {error}
                </div>
              </div>
            )}

            {result && <AnalysisResult result={result} />}
          </div>
        )}
      </main>

      <footer className="mt-auto py-10 flex flex-col items-center gap-2">
        <div className="flex items-center gap-4 text-slate-600">
           <span className="w-8 h-px bg-slate-800"></span>
           <span className="text-[10px] font-bold uppercase tracking-widest">Build | Share | Grow with LabDDB</span>
           <span className="w-8 h-px bg-slate-800"></span>
        </div>
        <p className="text-slate-700 text-[9px] font-mono tracking-tighter">Built for EEECU 💚</p>
      </footer>
    </div>
  );
};

export default App;
