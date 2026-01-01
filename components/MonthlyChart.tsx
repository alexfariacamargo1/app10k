
import React from 'react';
import { MonthlyEntry } from '../types';

interface MonthlyChartProps {
  entries: MonthlyEntry[];
  isCouple: boolean;
  isPremium?: boolean;
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ entries, isCouple, isPremium = false }) => {
  const multiplier = isCouple ? 2 : 1;
  
  // Calculate cumulative target values
  const cumulativeTarget = entries.reduce((acc, entry, idx) => {
    const prevValue = idx > 0 ? acc[idx - 1] : 0;
    acc.push(prevValue + (entry.value * multiplier));
    return acc;
  }, [] as number[]);

  const maxVal = cumulativeTarget[cumulativeTarget.length - 1];

  return (
    <div className={`p-6 rounded-2xl shadow-xl border transition-all ${isPremium ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`handwritten text-2xl font-bold ${isPremium ? 'text-slate-100' : 'text-slate-800'}`}>Crescimento Acumulado</h3>
        <div className="flex gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-500">
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-sm ${isPremium ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>
            <span>Poupado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-sm ${isPremium ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <span>Meta</span>
          </div>
        </div>
      </div>

      <div className="relative h-48 flex items-end gap-1 md:gap-2 px-2">
        {/* Y-Axis helper lines */}
        <div className={`absolute inset-0 flex flex-col justify-between pointer-events-none border-b ${isPremium ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className={`w-full border-t ${isPremium ? 'border-slate-700/50' : 'border-slate-50'}`}></div>
          <div className={`w-full border-t ${isPremium ? 'border-slate-700/50' : 'border-slate-50'}`}></div>
          <div className={`w-full border-t ${isPremium ? 'border-slate-700/50' : 'border-slate-50'}`}></div>
        </div>

        {entries.map((entry, idx) => {
          const heightPercent = (cumulativeTarget[idx] / maxVal) * 100;
          const isCompleted = entry.isSaved;
          
          return (
            <div key={entry.month} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Tooltip */}
              <div className={`absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] py-1 px-2 rounded whitespace-nowrap z-20 pointer-events-none ${isPremium ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-white'}`}>
                Mês {entry.month}: R$ {cumulativeTarget[idx].toLocaleString('pt-BR')}
              </div>
              
              {/* The Bar */}
              <div 
                className={`w-full rounded-t-md transition-all duration-500 ease-out relative ${
                  isCompleted 
                    ? (isPremium ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-lg shadow-amber-900/40' : 'bg-emerald-500 shadow-lg shadow-emerald-100') 
                    : (isPremium ? 'bg-slate-700' : 'bg-slate-100')
                }`}
                style={{ height: `${heightPercent}%` }}
              >
                {/* Visual marker for "completed" pulse */}
                {isCompleted && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/30 rounded-t-md"></div>
                )}
              </div>
              
              {/* X-Axis Label */}
              <span className="mt-2 text-[10px] font-bold text-slate-500 group-hover:text-slate-400 transition-colors">
                M{entry.month}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-between text-[10px] text-slate-500 font-medium italic">
        <span>Início (R$ 0)</span>
        <span>Objetivo Final (R$ {maxVal.toLocaleString('pt-BR')})</span>
      </div>
    </div>
  );
};

export default MonthlyChart;
