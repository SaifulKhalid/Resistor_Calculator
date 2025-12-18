
import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, RotateCcw, Zap, Info, Cpu } from 'lucide-react';
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
        setError("Could not parse resistor information. Please ensure the resistor is clear and horizontally aligned.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
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
    <div className="min-h-screen flex flex-col items-center bg-slate-950 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Resistor Lens</h1>
            <p className="text-slate-400 text-sm">AI Component Identification</p>
          </div>
        </div>
        <button 
          onClick={() => alert("Align the resistor horizontally. The first band should be on the left. Gemini will detect the colors and calculate Ω.")}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Info className="w-6 h-6" />
        </button>
      </header>

      <main className="w-full max-w-2xl flex flex-col gap-6">
        {!image ? (
          <ResistorScanner onCapture={handleCapture} />
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Image Preview Container */}
            <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
              <img 
                src={image} 
                alt="Captured Resistor" 
                className={`w-full h-auto aspect-video object-cover transition-opacity duration-300 ${isAnalyzing ? 'opacity-50 blur-sm' : 'opacity-100'}`} 
              />
              
              {isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm">
                  <div className="relative">
                    <Zap className="w-12 h-12 text-indigo-400 animate-pulse" />
                    <div className="absolute inset-0 w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-4 text-indigo-100 font-medium tracking-wide">Analyzing Color Bands...</p>
                  <p className="text-indigo-300/60 text-xs mt-1">AI-powered Computer Vision</p>
                </div>
              )}

              <button 
                onClick={reset}
                className="absolute top-4 right-4 p-3 bg-slate-900/80 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md transition-all border border-slate-700 hover:border-red-400"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            {result && <AnalysisResult result={result} />}
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 text-slate-500 text-sm">
        Powered by Gemini 3 Flash • Electronic Vision Suite v1.0
      </footer>
    </div>
  );
};

export default App;
