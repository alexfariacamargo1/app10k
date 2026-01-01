
import React from 'react';

interface GoalSummaryProps {
  current: number;
  target: number;
  monthsCompleted: number;
  isPremium?: boolean;
}

const GoalSummary: React.FC<GoalSummaryProps> = ({ current, target, monthsCompleted, isPremium = false }) => {
  const percentage = Math.min(Math.round((current / target) * 100), 100);

  const handleShare = async () => {
    const text = `🚀 Meu progresso na Poupança Progressiva: Já guardei R$ ${current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de uma meta de R$ ${target.toLocaleString('pt-BR')}! \n\n${monthsCompleted} meses concluídos (${percentage}%). \n\n#Finanças #Poupança #Metas`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Progresso - Poupança',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert('Progresso copiado para a área de transferência!');
      } catch (err) {
        console.error('Erro ao copiar:', err);
      }
    }
  };
  
  return (
    <div className={`p-8 rounded-2xl shadow-xl border mb-8 relative overflow-hidden group transition-all-slow hover:shadow-2xl ${isPremium ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-16 -mt-16 z-0 opacity-50 transition-transform duration-700 group-hover:scale-110 ${isPremium ? 'bg-amber-400/10' : 'bg-emerald-50'}`}></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
               {isPremium && <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter">Premium</span>}
               <span className={`${isPremium ? 'text-slate-400' : 'text-slate-400'} font-medium`}>
                {target >= 10000 ? 'Plano de Casal.' : 'Plano Individual.'}
              </span>
            </div>
            <h1 className={`handwritten text-4xl font-bold transition-all duration-500 ${isPremium ? 'text-slate-100' : 'text-slate-800'}`}>
              Juntando <span className={`px-2 rounded inline-block transition-all duration-500 ${isPremium ? 'bg-amber-400/20 text-amber-400' : 'bg-emerald-200'}`}>R$ {target.toLocaleString('pt-BR')}</span>
            </h1>
          </div>
          
          <button 
            onClick={handleShare}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all transform active:scale-95 shadow-lg ${isPremium ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-amber-900/40' : 'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-200'}`}
          >
            <i className="fas fa-share-nodes"></i>
            Compartilhar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-4 rounded-xl border transition-all ${isPremium ? 'bg-slate-900/50 border-slate-700 hover:border-amber-400/40' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-emerald-100'}`}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Acumulado</p>
            <p className={`handwritten text-3xl font-bold transition-all duration-500 ${isPremium ? 'text-amber-400' : 'text-emerald-600'}`}>R$ {current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={`p-4 rounded-xl border transition-all ${isPremium ? 'bg-slate-900/50 border-slate-700 hover:border-slate-500' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200'}`}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Faltam</p>
            <p className={`handwritten text-3xl font-bold transition-all duration-500 ${isPremium ? 'text-slate-300' : 'text-slate-500'}`}>R$ {(target - current).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={`p-4 rounded-xl border transition-all ${isPremium ? 'bg-slate-900/50 border-slate-700 hover:border-blue-400/40' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-100'}`}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Meses Concluídos</p>
            <p className={`handwritten text-3xl font-bold transition-all duration-500 ${isPremium ? 'text-blue-400' : 'text-blue-600'}`}>{monthsCompleted} / 12</p>
          </div>
        </div>

        <div className="animate-fade-slide" key={percentage}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-bold ${isPremium ? 'text-slate-400' : 'text-slate-600'}`}>Progresso Geral</span>
            <span className={`text-sm font-bold transition-all duration-500 ${isPremium ? 'text-amber-400' : 'text-emerald-600'}`}>{percentage}%</span>
          </div>
          <div className={`w-full h-4 rounded-full overflow-hidden border ${isPremium ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
            <div 
              className={`h-full transition-all duration-1000 ease-out shadow-inner ${isPremium ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-emerald-500'}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalSummary;
