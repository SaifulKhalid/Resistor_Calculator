
import React, { useState, useCallback, useEffect } from 'react';
import { RotateCcw, Zap, Cpu, ShieldCheck, History, Sliders, Scan } from 'lucide-react';
import Navbar from './components/Navbar';
import ResistorScanner from './components/ResistorScanner';
import AnalysisResult from './components/AnalysisResult';
import ManualSelector from './components/ManualSelector';
import { ResistorResult } from './types';
import { analyzeResistorImage } from './services/geminiService';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ResistorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ResistorResult[]>([]);
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('resistor_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleCapture = useCallback(async (base64Image: string) => {
    setImage(base64Image);
    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const analysis = await analyzeResistorImage(base64Image);
      if (analysis) {
        setResult(analysis);
        const newHistory = [analysis, ...history.slice(0, 4)];
        setHistory(newHistory);
        localStorage.setItem('resistor_history', JSON.stringify(newHistory));
      } else {
        setError("Optical link failed. Please ensure the resistor is horizontal and brightly lit.");
      }
    } catch (err: any) {
      setError(err.message || "Visual analysis error.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [history]);

  const handleManualChange = (newResult: ResistorResult) => {
    setResult(newResult);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  };

  const setMode = (mode: boolean) => {
    if (mode === manualMode) return;
    reset();
    setManualMode(mode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050810]">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center p-6 md:p-12">
        <header className="w-full max-w-2xl flex flex-col items-center mb-10 text-center">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-indigo-500/10 border border-indigo-400/20">
              <Cpu className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">Resistor Lens <span className="text-indigo-500 font-normal not-italic">Pro</span></h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 mb-8">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${manualMode ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
              {manualMode ? 'Manual Input Mode' : 'AI Neural Scanner Mode'}
            </p>
          </div>

          {/* New Prominent Mode Switcher */}
          <div className="w-full bg-slate-900/50 p-1 rounded-2xl border border-slate-800 flex shadow-inner">
            <button
              onClick={() => setMode(false)}
              className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl font-black text-xs uppercase tracking-[0.15em] transition-all duration-300 ${!manualMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Scan size={18} />
              AI SCANNER
            </button>
            <button
              onClick={() => setMode(true)}
              className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl font-black text-xs uppercase tracking-[0.15em] transition-all duration-300 ${manualMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Sliders size={18} />
              MANUAL INPUT
            </button>
          </div>
        </header>

        <main className="w-full max-w-2xl flex flex-col gap-10">
          {!manualMode ? (
            <>
              {!image ? (
                <ResistorScanner onCapture={handleCapture} isProcessing={isAnalyzing} />
              ) : (
                <div className="flex flex-col gap-6 animate-in zoom-in-95 duration-500">
                  <div className="relative group rounded-[2.5rem] overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                    <img 
                      src={image} 
                      alt="Capture" 
                      className={`w-full h-auto aspect-video object-cover transition-all duration-700 ${isAnalyzing ? 'scale-105 opacity-20 blur-xl' : 'scale-100 opacity-100'}`} 
                    />
                    
                    {isAnalyzing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Zap className="w-12 h-12 text-indigo-400 animate-pulse mb-4" />
                        <p className="text-white font-black uppercase tracking-[0.4em] text-[9px] text-center">Neural Extraction...</p>
                      </div>
                    )}

                    {!isAnalyzing && (
                      <button 
                        onClick={reset}
                        className="absolute bottom-6 right-6 p-4 bg-slate-950/80 hover:bg-rose-600 text-white rounded-2xl backdrop-blur-xl transition-all border border-slate-800 shadow-xl active:scale-90"
                      >
                        <RotateCcw size={20} />
                      </button>
                    )}
                    
                    {!isAnalyzing && result && (
                      <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full backdrop-blur-md">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Scan Verified</span>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-3xl text-rose-200 text-sm flex items-start gap-3">
                      <Zap className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <p className="font-medium opacity-80">{error}</p>
                    </div>
                  )}

                  {result && <AnalysisResult result={result} />}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-8">
              <ManualSelector onChange={handleManualChange} />
              {result && <AnalysisResult result={result} />}
            </div>
          )}

          {/* History Log */}
          {history.length > 0 && (
            <section className="mt-8">
               <div className="flex items-center gap-2 mb-4 opacity-50">
                  <History size={14} className="text-slate-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Measurements</h3>
               </div>
               <div className="flex flex-col gap-2">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-white/5 group hover:bg-slate-900 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="flex gap-1">
                              {h.bands.map((b, bi) => (
                                <div key={bi} className="w-1.5 h-4 rounded-full" style={{backgroundColor: b.toLowerCase()}}></div>
                              ))}
                           </div>
                           <span className="text-sm font-bold text-slate-300">{h.formatted_value}Ω</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-600 uppercase">{h.confidence}% Conf.</span>
                    </div>
                  ))}
               </div>
            </section>
          )}
        </main>

        <footer className="mt-20 py-12 flex flex-col items-center gap-4 opacity-30">
           <img src="https://labddb.site/logo.png" className="w-6 h-6 grayscale" alt="Lab DDB" />
           <p className="text-slate-500 text-[9px] font-bold tracking-[0.2em] uppercase text-center">Made for ODOMMO 23<br/>LabDDB 💚</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
