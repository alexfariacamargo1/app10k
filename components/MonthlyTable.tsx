
import React from 'react';
import { MonthlyEntry } from '../types';

interface MonthlyTableProps {
  entries: MonthlyEntry[];
  isCouple: boolean;
  onToggle: (month: number) => void;
  isPremium?: boolean;
}

const MonthlyTable: React.FC<MonthlyTableProps> = ({ entries, isCouple, onToggle, isPremium = false }) => {
  return (
    <div className={`rounded-2xl shadow-xl overflow-hidden border transition-all duration-500 hover:shadow-2xl ${isPremium ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className={`${isPremium ? '' : 'grid-bg'} p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`handwritten text-3xl font-bold border-b-4 inline-block px-2 transition-all duration-500 ${isPremium ? 'text-slate-100 border-amber-400' : 'text-slate-800 border-blue-400'}`}>
            Plano Mensal
          </h2>
          <div className="transition-all duration-500 transform overflow-hidden flex gap-2">
            {isCouple && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pop-in ${isPremium ? 'bg-amber-400/10 text-amber-400' : 'bg-blue-100 text-blue-700'}`}>
                Modo Casal (2x)
              </span>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className={`border-b-2 text-slate-500 uppercase text-xs font-bold tracking-widest ${isPremium ? 'border-slate-700 text-slate-400' : 'border-slate-200'}`}>
                <th className="py-3 px-4 text-left">Mês</th>
                <th className="py-3 px-4 text-left">Valor {isCouple ? '(p/ pessoa)' : ''}</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr 
                  key={entry.month} 
                  onClick={() => onToggle(entry.month)}
                  className={`border-b cursor-pointer transition-all duration-300 group ${isPremium ? 'border-slate-700 hover:bg-amber-400/5' : 'border-slate-100 hover:bg-blue-50/50'} ${entry.isSaved ? (isPremium ? 'bg-amber-400/10' : 'bg-emerald-50/30') : ''}`}
                >
                  <td className={`py-4 px-4 font-bold ${isPremium ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className="handwritten text-xl">{entry.month}º</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className={`handwritten text-2xl font-bold transition-all duration-500 ${entry.isSaved ? (isPremium ? 'text-slate-600 line-through' : 'text-slate-400 line-through') : (isPremium ? 'text-slate-100' : 'text-slate-800')}`}>
                        R$ {entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <div className="h-4 transition-all duration-500">
                        {isCouple && !entry.isSaved && (
                          <span className={`text-[10px] font-medium animate-fade-slide ${isPremium ? 'text-amber-400/60' : 'text-slate-400'}`}>Total Casal: R$ {(entry.value * 2).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center transition-all duration-300 transform group-active:scale-90 ${
                      entry.isSaved 
                        ? (isPremium ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-900/40' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200') 
                        : (isPremium ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-300 hover:bg-slate-200')
                    }`}>
                      <i 
                        key={entry.isSaved ? 'saved' : 'pending'} 
                        className={`fas ${entry.isSaved ? 'fa-check animate-pop-in' : 'fa-circle-notch'} transition-all duration-300`}
                      ></i>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className={`mt-8 p-4 rounded-xl border-2 border-dashed transition-all ${isPremium ? 'bg-slate-900/50 border-amber-400/20 text-slate-400 hover:bg-slate-900' : 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100/50'}`}>
          <p className="text-sm italic flex items-start gap-3">
            <i className={`fas fa-lightbulb mt-1 animate-bounce ${isPremium ? 'text-amber-400' : 'text-yellow-500'}`}></i>
            <span>Dica: Clique em qualquer linha para marcar como "poupado". Mantenha a constância!</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTable;
