
import React, { useState } from 'react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [copied, setCopied] = useState(false);
  const pixKey = "alexfaria.camargo@gmail.com";

  if (!isOpen) return null;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-slide">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-200">
        <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-8 text-center text-white relative">
          <div className="absolute top-4 right-4 cursor-pointer hover:scale-110 transition-transform" onClick={onClose}>
            <i className="fas fa-times"></i>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <i className="fas fa-crown text-4xl text-white animate-bounce"></i>
          </div>
          <h2 className="text-3xl font-bold mb-2">Seja Premium</h2>
          <p className="text-amber-50 text-sm">Desbloqueie o poder máximo da sua economia.</p>
        </div>
        
        <div className="p-8 space-y-6">
          <ul className="space-y-4">
            {[
              { icon: 'fa-chart-line', title: 'Análise Avançada', desc: 'Gráficos de projeção e histórico detalhado.' },
              { icon: 'fa-robot', title: 'IA Pro', desc: 'Consultoria financeira profunda com Gemini Pro.' },
              { icon: 'fa-layer-group', title: 'Metas Ilimitadas', desc: 'Crie quantas metas quiser ao mesmo tempo.' },
              { icon: 'fa-file-export', title: 'Exportação VIP', desc: 'Gere relatórios em PDF para seu banco.' }
            ].map((item, i) => (
              <li key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="pt-6 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-amber-300 mb-6 text-center">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Pague via PIX (Chave E-mail)</p>
              <div className="flex items-center justify-center gap-2 bg-white p-2 rounded-lg border border-slate-200 mb-2">
                <code className="text-xs font-mono text-slate-700 break-all">{pixKey}</code>
                <button 
                  onClick={handleCopyPix}
                  className={`p-2 rounded-md transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  title="Copiar Chave PIX"
                >
                  <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                </button>
              </div>
              {copied && <p className="text-[10px] text-emerald-600 font-bold animate-pop-in">Copiado para área de transferência!</p>}
            </div>

            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-slate-400 line-through text-xs block">De R$ 49,90</span>
                <span className="text-2xl font-bold text-slate-800">R$ 19,90<span className="text-xs text-slate-400 font-normal"> / único</span></span>
              </div>
              <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">
                60% OFF HOJE
              </div>
            </div>
            
            <button 
              onClick={onConfirm}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-2xl font-bold shadow-xl shadow-amber-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <i className="fas fa-bolt"></i>
              JÁ REALIZEI O PAGAMENTO
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-4">Liberação manual imediata após verificação.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
