
import React, { useState, useEffect } from 'react';
import { ColorMap, RESISTOR_VALUES, ResistorResult } from '../types';
import { ChevronDown } from 'lucide-react';

interface Props {
  onChange: (result: ResistorResult) => void;
}

const ManualSelector: React.FC<Props> = ({ onChange }) => {
  const [bands, setBands] = useState<string[]>(['brown', 'black', 'red']);
  
  const colors = Object.keys(RESISTOR_VALUES).filter(c => RESISTOR_VALUES[c].digit !== -1);
  const multiplierColors = Object.keys(RESISTOR_VALUES);

  const formatValue = (ohms: number) => {
    if (ohms >= 1000000) return `${(ohms / 1000000).toFixed(ohms % 1000000 === 0 ? 0 : 1)}M`;
    if (ohms >= 1000) return `${(ohms / 1000).toFixed(ohms % 1000 === 0 ? 0 : 1)}k`;
    return ohms.toString();
  };

  useEffect(() => {
    const d1 = RESISTOR_VALUES[bands[0]].digit;
    const d2 = RESISTOR_VALUES[bands[1]].digit;
    const mult = RESISTOR_VALUES[bands[2]].multiplier;
    const ohms = (d1 * 10 + d2) * mult;
    
    onChange({
      bands: bands.map(b => b.charAt(0).toUpperCase() + b.slice(1)),
      resistance_ohms: ohms,
      formatted_value: formatValue(ohms),
      confidence: 100,
      isManual: true
    });
  }, [bands]);

  const updateBand = (index: number, color: string) => {
    const newBands = [...bands];
    newBands[index] = color;
    setBands(newBands);
  };

  const BandControl = ({ label, index, options }: { label: string, index: number, options: string[] }) => (
    <div className="flex flex-col gap-2 flex-1">
      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</label>
      <div className="relative group">
        <select 
          value={bands[index]} 
          onChange={(e) => updateBand(index, e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-3 text-xs font-bold text-white appearance-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
        >
          {options.map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
          <ChevronDown size={14} />
        </div>
        <div 
          className="absolute left-0 bottom-0 h-1 w-full rounded-b-xl opacity-50"
          style={{ backgroundColor: ColorMap[bands[index]] }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-[2rem] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col sm:flex-row gap-4">
        <BandControl label="1st Band" index={0} options={colors} />
        <BandControl label="2nd Band" index={1} options={colors} />
        <BandControl label="Multiplier" index={2} options={multiplierColors} />
      </div>
      
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 mt-2">
        {multiplierColors.map(c => (
          <button
            key={c}
            onClick={() => {
              // Intelligently decide which band to update based on selection
              // For simplicity, we'll just show all colors as a quick-picker for the currently selected band logic
              // but here we just show them as a reference.
            }}
            className="h-8 rounded-lg border border-white/5 shadow-lg transition-transform hover:scale-110"
            style={{ backgroundColor: ColorMap[c] }}
            title={c}
          />
        ))}
      </div>
    </div>
  );
};

export default ManualSelector;
