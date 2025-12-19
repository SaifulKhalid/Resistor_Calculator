
import React, { useState, useCallback, useEffect } from 'react';
import { RotateCcw, Zap, Cpu, ShieldCheck, History, Sliders, Scan, Activity, BookOpen, CheckCircle, Calculator } from 'lucide-react';
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
  const [usageCount, setUsageCount] = useState<number>(0);

  useEffect(() => {
    const savedHistory = localStorage.getItem('resistor_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedUsage = localStorage.getItem('resistor_usage_count');
    if (savedUsage) setUsageCount(parseInt(savedUsage, 10));
  }, []);

  const incrementUsage = () => {
    const nextCount = usageCount + 1;
    setUsageCount(nextCount);
    localStorage.setItem('resistor_usage_count', nextCount.toString());
  };

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
        incrementUsage();
      } else {
        setError("Optical link failed. Please ensure the resistor is horizontal and brightly lit.");
      }
    } catch (err: any) {
      setError(err.message || "Visual analysis error.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [history, usageCount]);

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
    if (mode) incrementUsage();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050810]">
      <Navbar />
      
      {/* SEO Content for Crawlers */}
      <div className="sr-only">
        <h1>Resistor Lens Pro - AI Color Code Scanner</h1>
        <p>The leading online tool for identifying axial resistor values using artificial intelligence. Scan 4-band and 5-band resistors instantly with professional accuracy.</p>
        <h2>Axial Resistor Color Code Calculator</h2>
        <p>Manual selection tool for calculating resistance values based on standard electronics color coding standards.</p>
      </div>

      <div className="flex-1 flex flex-col items-center p-6 md:p-12">
        <header className="w-full max-w-2xl flex flex-col items-center mb-10 text-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-600 p-2.5 rounded-2xl shadow-xl shadow-emerald-500/10 border border-emerald-400/20">
              <Cpu className="text-white w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Resistor Lens <span className="text-emerald-500 font-normal not-italic">Pro</span></h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-8 px-4 py-1.5 bg-slate-900/40 rounded-full border border-white/5">
            <span className={`w-2 h-2 rounded-full animate-pulse ${manualMode ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></span>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              {manualMode ? 'Manual Input Mode' : 'AI Neural Scanner Mode'}
            </p>
          </div>

          <div className="w-full grid grid-cols-2 bg-slate-900/80 p-1.5 rounded-3xl border border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setMode(false)}
              aria-label="Switch to AI Scanner"
              className={`flex items-center justify-center gap-3 py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 z-10 ${!manualMode ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Scan size={20} className={!manualMode ? 'animate-pulse' : ''} />
              AI SCANNER
            </button>
            <button
              onClick={() => setMode(true)}
              aria-label="Switch to Manual Input"
              className={`flex items-center justify-center gap-3 py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 z-10 ${manualMode ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Sliders size={20} />
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
                      alt="Resistor being analyzed" 
                      className={`w-full h-auto aspect-video object-cover transition-all duration-700 ${isAnalyzing ? 'scale-105 opacity-20 blur-xl' : 'scale-100 opacity-100'}`} 
                    />
                    
                    {isAnalyzing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Zap className="w-12 h-12 text-emerald-400 animate-pulse mb-4" />
                        <p className="text-white font-black uppercase tracking-[0.4em] text-[9px] text-center">Neural Extraction...</p>
                      </div>
                    )}

                    {!isAnalyzing && (
                      <button 
                        onClick={reset}
                        aria-label="Reset scanner"
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

          {/* Detailed Informational Section */}
          <section className="bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-8 mt-4">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen size={20} className="text-emerald-500" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight italic">How the Calculation Works</h3>
            </div>
            
            <div className="mb-8 p-6 bg-slate-950/50 rounded-2xl border border-emerald-500/10 flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Standard Mathematical Model</span>
              <div className="flex items-center gap-4 text-xl sm:text-2xl font-mono text-white">
                <div className="flex flex-col items-center">
                   <span className="bg-slate-800 px-3 py-1 rounded-lg">(D1 × 10 + D2)</span>
                   <span className="text-[8px] mt-1 text-slate-500 uppercase">Digits</span>
                </div>
                <span className="text-emerald-500">×</span>
                <div className="flex flex-col items-center">
                   <span className="bg-slate-800 px-3 py-1 rounded-lg">10<sup>n</sup></span>
                   <span className="text-[8px] mt-1 text-slate-500 uppercase">Multiplier</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-400 text-sm leading-relaxed">
              <div className="flex gap-4">
                <Calculator size={18} className="text-emerald-500 shrink-0 mt-1" />
                <div>
                  <p className="text-white font-bold mb-1 uppercase text-[11px] tracking-wider">The Logic</p>
                  <p>Bands 1 and 2 represent the first two significant digits. Band 3 is the decimal multiplier, indicating the power of 10 to multiply by.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-1" />
                <div>
                  <p className="text-white font-bold mb-1 uppercase text-[11px] tracking-wider">E-Series Normalization</p>
                  <p>Our AI cross-references detected colors with standard E12 and E24 values to eliminate reading errors caused by environmental lighting.</p>
                </div>
              </div>
            </div>
          </section>

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

        <footer className="mt-20 py-12 flex flex-col items-center gap-6">
           <div className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-1000">
             <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
               <Activity size={14} className="text-emerald-500 animate-pulse" />
               <div className="flex flex-col">
                 <span className="text-white font-mono text-sm font-black leading-none">{usageCount.toLocaleString()}</span>
                 <span className="text-slate-600 text-[7px] font-black uppercase tracking-widest">Calculations Performed</span>
               </div>
             </div>
           </div>

           <div className="flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity duration-500">
             <img src="https://labddb.site/logo.png" className="w-6 h-6 grayscale hover:grayscale-0 transition-all" alt="Lab DDB Logo Official" />
             <p className="text-slate-500 text-[9px] font-bold tracking-[0.2em] uppercase text-center">Professional Electronics Toolkit<br/>Visual Recognition Engine v3.0</p>
             <p className="text-slate-600 text-[8px] font-bold tracking-[0.1em] uppercase text-center max-w-xs">Designed for ODOMMO 23 by LabDDB. Empowering engineers with AI-driven hardware tools.</p>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
