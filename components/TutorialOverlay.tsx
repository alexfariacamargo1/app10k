
import React, { useState, useEffect } from 'react';

interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
  position: 'bottom' | 'top' | 'left' | 'right';
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onComplete: () => void;
  isPremium?: boolean;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ steps, onComplete, isPremium }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const updateCoords = () => {
    const target = document.getElementById(steps[currentStep].targetId);
    if (target) {
      const rect = target.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    updateCoords();
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dark Overlay with "Hole" */}
      <div 
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px] transition-all duration-500"
        style={{
          clipPath: `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)`
        }}
      />

      {/* Spotlight Border */}
      <div 
        className={`absolute border-2 rounded-xl transition-all duration-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.1)] ${isPremium ? 'border-amber-400 shadow-amber-400/20' : 'border-emerald-400 shadow-emerald-400/20'}`}
        style={{
          top: coords.top - 4,
          left: coords.left - 4,
          width: coords.width + 8,
          height: coords.height + 8,
        }}
      />

      {/* Tooltip */}
      <div 
        className="absolute pointer-events-auto transition-all duration-500 flex flex-col items-center"
        style={{
          top: step.position === 'bottom' ? coords.top + coords.height + 20 : step.position === 'top' ? coords.top - 200 : coords.top,
          left: step.position === 'left' ? coords.left - 280 : step.position === 'right' ? coords.left + coords.width + 20 : coords.left + (coords.width / 2) - 140,
          width: 280
        }}
      >
        <div className={`p-5 rounded-2xl shadow-2xl border animate-pop-in ${isPremium ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isPremium ? 'text-amber-400' : 'text-emerald-500'}`}>
              Passo {currentStep + 1} de {steps.length}
            </span>
            <button onClick={onComplete} className="text-slate-400 hover:text-red-500 transition-colors">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <h4 className="handwritten text-xl font-bold mb-2">{step.title}</h4>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">{step.content}</p>
          <div className="flex gap-2">
            <button 
              onClick={nextStep}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${isPremium ? 'bg-amber-500 text-slate-900' : 'bg-emerald-500 text-white'}`}
            >
              {currentStep === steps.length - 1 ? 'Começar Agora!' : 'Próximo'}
            </button>
          </div>
        </div>
        {/* Pointer Arrow */}
        <div className={`w-4 h-4 rotate-45 border-l border-t -mt-2 ${isPremium ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`} />
      </div>
    </div>
  );
};

export default TutorialOverlay;
