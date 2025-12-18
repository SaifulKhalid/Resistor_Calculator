
import React from 'react';
import { ResistorResult, ColorMap } from '../types';
import { Target, Info, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  result: ResistorResult;
}

const AnalysisResult: React.FC<Props> = ({ result }) => {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'text-emerald-400';
    if (conf >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getConfidenceIcon = (conf: number) => {
    if (conf >= 80) return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (conf >= 60) return <Target className="w-4 h-4 text-amber-400" />;
    return <AlertCircle className="w-4 h-4 text-rose-400" />;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{result.formatted_value}</h2>
          <p className="text-slate-400 text-sm mt-1">{result.resistance_ohms.toLocaleString()} Ohms</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 ${getConfidenceColor(result.confidence)}`}>
          {getConfidenceIcon(result.confidence)}
          <span className="text-xs font-bold">{result.confidence}% Confidence</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Detected Color Bands</h3>
        <div className="flex gap-4">
          {result.bands.map((color, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 flex-1">
              <div 
                className="w-full h-12 rounded-xl shadow-inner border border-white/10 flex items-center justify-center"
                style={{ backgroundColor: ColorMap[color.toLowerCase()] || '#334155' }}
              >
                <span className={`text-[10px] font-bold uppercase mix-blend-difference text-white opacity-60`}>
                  {idx + 1}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-300 capitalize">{color}</span>
            </div>
          ))}
          {/* Mock Tolerance Band (Ignored in prompt but visual placeholder) */}
          <div className="flex flex-col items-center gap-2 flex-1 opacity-40">
            <div className="w-full h-12 rounded-xl bg-slate-800 border border-dashed border-slate-600 flex items-center justify-center">
              <span className="text-[10px] font-bold uppercase text-slate-500">
                Tol
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500">Ignored</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-200/70 leading-relaxed">
          The first band represents the first digit <strong>({result.bands[0]})</strong>, the second is the second digit <strong>({result.bands[1]})</strong>, and the third is the multiplier <strong>(10^{result.bands.indexOf(result.bands[2])})</strong>.
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
