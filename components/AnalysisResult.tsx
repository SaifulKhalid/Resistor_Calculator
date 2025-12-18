
import React from 'react';
import { ResistorResult, ColorMap } from '../types';
import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight, Settings } from 'lucide-react';

interface Props {
  result: ResistorResult;
}

const AnalysisResult: React.FC<Props> = ({ result }) => {
  const getStatus = (conf: number) => {
    if (result.isManual) return { label: 'Manual Input', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/30', icon: <Settings size={14} /> };
    if (conf >= 80) return { label: 'High Precision', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', icon: <CheckCircle2 size={14} /> };
    if (conf >= 60) return { label: 'Verify Values', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30', icon: <AlertCircle size={14} /> };
    return { label: 'Low Confidence', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/30', icon: <HelpCircle size={14} /> };
  };

  const status = getStatus(result.confidence);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Measured Resistance</span>
          <h2 className="text-5xl font-black text-white italic">
            {result.formatted_value}
            <span className="text-xl font-normal text-slate-600 not-italic ml-2">Ω</span>
          </h2>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${status.bg} ${status.border} ${status.color}`}>
          {status.icon}
          <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
        </div>
      </div>

      {/* Visual Resistor Model */}
      <div className="relative py-8 flex justify-center items-center bg-slate-950/50 rounded-2xl border border-white/5 overflow-hidden">
        {/* Wires */}
        <div className="absolute w-[80%] h-1 bg-slate-700 rounded-full"></div>
        
        {/* Resistor Body */}
        <div className="relative w-48 h-12 bg-[#d1bfa7] rounded-xl shadow-2xl flex items-center justify-between px-6 border-y border-white/10">
          {result.bands.map((color, idx) => (
            <div 
              key={idx} 
              className="w-4 h-full shadow-[inset_0_0_8px_rgba(0,0,0,0.3)] transition-colors duration-300"
              style={{ backgroundColor: ColorMap[color.toLowerCase()] || '#334155' }}
            />
          ))}
          {/* Default Tolerance Band (Gold) */}
          <div className="w-3 h-full bg-[#ffd700] opacity-80" />
        </div>
      </div>

      {/* Bands Strip */}
      <div className="grid grid-cols-4 gap-2">
        {result.bands.map((color, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <div 
              className="h-2 rounded-full shadow-inner transition-colors duration-300"
              style={{ backgroundColor: ColorMap[color.toLowerCase()] || '#334155' }}
            />
            <span className="text-[9px] font-black text-center text-slate-500 uppercase tracking-tighter">{color}</span>
          </div>
        ))}
        <div className="flex flex-col gap-2 opacity-20">
          <div className="h-2 rounded-full bg-slate-800 border border-dashed border-slate-600" />
          <span className="text-[9px] font-black text-center text-slate-700 uppercase tracking-tighter">Tolerance</span>
        </div>
      </div>

      {/* Calculation Summary */}
      <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
          <span className="text-white font-bold">{result.bands[0]}</span>
          <span className="text-white font-bold">{result.bands[1]}</span>
          <span className="mx-1">×</span>
          <span className="text-indigo-400 font-bold">{result.bands[2]}</span>
          <ArrowRight size={10} className="mx-1" />
          <span className="text-white font-black">{result.formatted_value}</span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
