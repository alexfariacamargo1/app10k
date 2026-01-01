
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SavingsPlan, MonthlyEntry, NotificationSettings } from './types';
import { DEFAULT_ENTRIES, APP_STORAGE_KEY } from './constants';
import GoalSummary from './components/GoalSummary';
import MonthlyTable from './components/MonthlyTable';
import MonthlyChart from './components/MonthlyChart';
import PremiumModal from './components/PremiumModal';
import TutorialOverlay from './components/TutorialOverlay';
import { getFinancialAdvice, generateCustomPlan } from './services/geminiService';

const TUTORIAL_STORAGE_KEY = 'poupanca_tutorial_done';

const App: React.FC = () => {
  const [plans, setPlans] = useState<SavingsPlan[]>(() => {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        return [{ ...parsed, id: parsed.id || 'default-plan', createdAt: Date.now() }];
      }
      return parsed;
    }
    return [{
      id: 'default-plan',
      title: 'Juntando 10K',
      target: 10000,
      entries: DEFAULT_ENTRIES,
      isCouple: true,
      isPremium: false,
      createdAt: Date.now()
    }];
  });

  const [activePlanId, setActivePlanId] = useState<string>(plans[0]?.id || 'default-plan');
  const activePlan = useMemo(() => plans.find(p => p.id === activePlanId) || plans[0], [plans, activePlanId]);

  const [aiAdvice, setAiAdvice] = useState<string>('Carregando dicas financeiras...');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const tutorialDone = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!tutorialDone) {
      setShowTutorial(true);
    }
  }, []);

  const activeReminders = activePlan.notificationSettings || {
    enabled: false,
    frequency: 'daily',
    time: '09:00'
  };

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    const checkReminders = () => {
      if (!activeReminders.enabled) return;
      const now = new Date();
      const currentHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (currentHHmm === activeReminders.time) {
        const todayDate = now.toDateString();
        const lastNotifiedDate = activeReminders.lastNotifiedAt ? new Date(activeReminders.lastNotifiedAt).toDateString() : '';
        if (todayDate !== lastNotifiedDate) {
          if (activeReminders.frequency === 'weekly' && now.getDay() !== 0) return;
          triggerNotification("Hora de Poupar! 🐷", `Não esqueça de registrar sua economia de hoje no plano: ${activePlan.title}`);
          setPlans(prev => prev.map(p => 
            p.id === activePlanId ? {
              ...p,
              notificationSettings: { ...activeReminders, lastNotifiedAt: Date.now() }
            } : p
          ));
        }
      }
    };
    const timer = setInterval(checkReminders, 60000);
    return () => clearInterval(timer);
  }, [activeReminders, activePlanId, activePlan.title]);

  const triggerNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: 'https://cdn-icons-png.flaticon.com/512/217/217853.png' });
    } else {
      alert(`${title}\n\n${body}`);
    }
  };

  const handleToggleReminders = async () => {
    if (!activeReminders.enabled && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert("As notificações estão bloqueadas no navegador. Usaremos alertas internos.");
      }
    }
    setPlans(prev => prev.map(p => 
      p.id === activePlanId ? {
        ...p,
        notificationSettings: { ...activeReminders, enabled: !activeReminders.enabled }
      } : p
    ));
  };

  const updateReminderSetting = (key: keyof NotificationSettings, value: any) => {
    setPlans(prev => prev.map(p => 
      p.id === activePlanId ? {
        ...p,
        notificationSettings: { ...activeReminders, [key]: value }
      } : p
    ));
  };

  const currentTotalTarget = useMemo(() => {
    const sumEntries = activePlan.entries.reduce((sum, e) => sum + e.value, 0);
    return activePlan.isCouple ? sumEntries * 2 : sumEntries;
  }, [activePlan.entries, activePlan.isCouple]);

  const calculateCurrentTotal = useCallback(() => {
    const multiplier = activePlan.isCouple ? 2 : 1;
    return activePlan.entries
      .filter(e => e.isSaved)
      .reduce((sum, e) => sum + (e.value * multiplier), 0);
  }, [activePlan.entries, activePlan.isCouple]);

  const totalCurrent = calculateCurrentTotal();

  // Fix: Calculate monthsCompleted based on entries marked as saved
  const monthsCompleted = useMemo(() => activePlan.entries.filter(e => e.isSaved).length, [activePlan.entries]);

  useEffect(() => {
    const fetchAdvice = async () => {
      const advice = await getFinancialAdvice(totalCurrent, currentTotalTarget, activePlan.isCouple, activePlan.isPremium);
      setAiAdvice(advice || 'Mantenha o foco!');
    };
    fetchAdvice();
  }, [activePlan.isPremium, activePlan.isCouple, currentTotalTarget, totalCurrent]);

  const handleToggleMode = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setPlans(prev => prev.map(p => 
        p.id === activePlanId ? { ...p, isCouple: !p.isCouple } : p
      ));
      setIsTransitioning(false);
    }, 150);
  };

  const handleToggleMonth = (month: number) => {
    setPlans(prev => prev.map(p => 
      p.id === activePlanId ? {
        ...p,
        entries: p.entries.map(e => e.month === month ? { ...e, isSaved: !e.isSaved } : e)
      } : p
    ));
  };

  const handleUnlockPremium = () => {
    setPlans(prev => prev.map(p => ({ ...p, isPremium: true })));
    setShowPremiumModal(false);
    alert("🎉 Parabéns! Você agora é um Investidor PREMIUM. Novos recursos desbloqueados!");
  };

  const handleDowngrade = () => {
    if (window.confirm("Deseja realmente voltar para a versão normal? Você perderá os recursos exclusivos do Premium.")) {
      setPlans(prev => prev.map(p => ({ ...p, isPremium: false })));
    }
  };

  const handleAddNewGoal = () => {
    if (!activePlan.isPremium && plans.length >= 1) {
      setShowPremiumModal(true);
      return;
    }
    const title = prompt("Dê um nome para sua nova meta (ex: Viagem, Carro):", "Nova Meta");
    if (!title) return;
    const newId = `plan-${Date.now()}`;
    const newPlan: SavingsPlan = {
      id: newId,
      title: title,
      target: 5000,
      entries: DEFAULT_ENTRIES,
      isCouple: false,
      isPremium: activePlan.isPremium,
      createdAt: Date.now()
    };
    setPlans(prev => [...prev, newPlan]);
    setActivePlanId(newId);
  };

  const handleDeletePlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (plans.length <= 1) return;
    if (window.confirm("Tem certeza que deseja excluir esta meta?")) {
      const newPlans = plans.filter(p => p.id !== id);
      setPlans(newPlans);
      if (activePlanId === id) setActivePlanId(newPlans[0].id);
    }
  };

  const handleExportData = () => {
    if (!activePlan.isPremium) { setShowPremiumModal(true); return; }
    const csvContent = "data:text/csv;charset=utf-8,Mes,Valor,Poupado\n" + activePlan.entries.map(e => `${e.month},${e.value},${e.isSaved ? 'Sim' : 'Não'}`).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `${activePlan.title.toLowerCase()}_poupanca.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const resetProgress = () => {
    if (window.confirm("Limpar todo o progresso desta meta?")) {
      setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, entries: p.entries.map(e => ({ ...e, isSaved: false })) } : p));
    }
  };

  const handleCreateCustomPlan = async () => {
    const newTargetStr = prompt("Qual o objetivo total (R$)?", currentTotalTarget.toString());
    if (!newTargetStr) return;
    setIsGenerating(true);
    const targetValue = parseFloat(newTargetStr);
    const multiplier = activePlan.isCouple ? 2 : 1;
    const suggestedValues = await generateCustomPlan(targetValue / multiplier);
    if (suggestedValues && suggestedValues.length === 12) {
      setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, target: targetValue, entries: suggestedValues.map((val, idx) => ({ month: idx + 1, value: val, isSaved: false })) } : p));
    } else {
      alert("Erro ao gerar plano. Tente novamente.");
    }
    setIsGenerating(false);
  };

  const tutorialSteps = [
    { targetId: 'step-mode', title: 'Modo de Economia', content: 'Alterne entre o modo Individual ou Casal. No modo Casal, o valor mensal é dobrado para atingir a meta juntos!', position: 'bottom' as const },
    { targetId: 'step-summary', title: 'Visão Geral', content: 'Acompanhe quanto você já acumulou, quanto falta e a porcentagem total da sua jornada.', position: 'bottom' as const },
    { targetId: 'step-table', title: 'Registro Mensal', content: 'Sua tabela de controle. Clique em cada mês para marcar como "Poupado" e ver o progresso real.', position: 'top' as const },
    { targetId: 'step-goals', title: 'Minhas Metas', content: 'Gerencie diferentes objetivos ao mesmo tempo. Na versão Premium, você pode criar metas ilimitadas!', position: 'left' as const },
    { targetId: 'step-reminders', title: 'Lembretes', content: 'Ative notificações para não esquecer de guardar seu dinheiro. Escolha entre diário ou semanal.', position: 'left' as const },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${activePlan.isPremium ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`max-w-4xl mx-auto px-4 py-8 md:py-12 transition-all duration-300 ${isTransitioning ? 'opacity-70 scale-[0.995]' : 'opacity-100 scale-100'}`}>
        
        <header className="flex justify-between items-center mb-8 animate-fade-slide">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg transition-transform hover:scale-110 ${activePlan.isPremium ? 'bg-gradient-to-tr from-amber-400 to-yellow-600 shadow-amber-900/40' : 'bg-emerald-500 shadow-emerald-200'}`}>
              <i className={`fas ${activePlan.isPremium ? 'fa-crown' : 'fa-piggy-bank'}`}></i>
            </div>
            <div>
              <h2 className={`text-xl font-bold leading-none transition-all duration-500 ${activePlan.isPremium ? 'text-amber-400' : 'text-slate-800'}`}>
                {activePlan.title} {activePlan.isPremium && <span className="text-[10px] bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">PRO</span>}
              </h2>
              <p className={`text-xs font-medium transition-all duration-500 ${activePlan.isPremium ? 'text-slate-400' : 'text-slate-400'}`}>
                {activePlan.isCouple ? 'Modo Casal Ativo' : 'Modo Individual Ativo'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2" id="step-mode">
            {!activePlan.isPremium && (
               <button onClick={() => setShowPremiumModal(true)} className="p-2 w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-600 text-white shadow-lg shadow-amber-200/50 hover:scale-110 active:scale-95 transition-all">
                <i className="fas fa-gem animate-pulse"></i>
              </button>
            )}
             <button 
              onClick={handleToggleMode}
              className={`p-2 w-10 h-10 rounded-lg border transition-all duration-300 transform hover:scale-105 active:scale-95 ${activePlan.isCouple ? (activePlan.isPremium ? 'bg-amber-400 text-slate-900 border-amber-400' : 'bg-blue-600 border-blue-600 text-white') : (activePlan.isPremium ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500')}`}
            >
              <i className={`fas ${activePlan.isCouple ? 'fa-users' : 'fa-user'} transition-transform duration-300 ${isTransitioning ? 'rotate-180' : 'rotate-0'}`}></i>
            </button>
            <button 
              onClick={resetProgress}
              className={`p-2 w-10 h-10 rounded-lg border transition-all hover:rotate-12 ${activePlan.isPremium ? 'bg-slate-800 border-slate-700 text-slate-500 hover:text-red-400' : 'bg-white border-slate-200 text-slate-400 hover:text-red-500'}`}
            >
              <i className="fas fa-undo"></i>
            </button>
          </div>
        </header>

        <div className={`transition-all-slow ${isGenerating ? 'opacity-50 pointer-events-none' : 'opacity-100'}`} id="step-summary">
          <GoalSummary current={totalCurrent} target={currentTotalTarget} monthsCompleted={monthsCompleted} isPremium={activePlan.isPremium} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className={`transition-all duration-700 ${isGenerating ? 'blur-sm' : 'blur-0'}`}>
              <MonthlyChart entries={activePlan.entries} isCouple={activePlan.isCouple} isPremium={activePlan.isPremium} />
            </div>
            <div className={`transition-all duration-700 ${isGenerating ? 'blur-sm' : 'blur-0'}`} id="step-table">
              <MonthlyTable entries={activePlan.entries} isCouple={activePlan.isCouple} onToggle={handleToggleMonth} isPremium={activePlan.isPremium} />
            </div>
          </div>

          <div className="space-y-6">
            <div id="step-reminders" className={`p-6 rounded-2xl shadow-xl border transition-all ${activePlan.isPremium ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-bold flex items-center gap-2 ${activePlan.isPremium ? 'text-slate-100' : 'text-slate-800'}`}>
                  <i className={`fas fa-bell ${activeReminders.enabled ? (activePlan.isPremium ? 'text-amber-400' : 'text-emerald-500') : 'text-slate-400'}`}></i>
                  Lembretes
                </h3>
                <button onClick={handleToggleReminders} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${activeReminders.enabled ? (activePlan.isPremium ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${activeReminders.enabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </button>
              </div>
              {activeReminders.enabled && (
                <div className="space-y-4 animate-fade-slide">
                  <div className="flex gap-2">
                    <button onClick={() => updateReminderSetting('frequency', 'daily')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-widest transition-all ${activeReminders.frequency === 'daily' ? (activePlan.isPremium ? 'bg-amber-400 text-slate-900' : 'bg-indigo-600 text-white') : (activePlan.isPremium ? 'bg-slate-900/50 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>Diário</button>
                    <button onClick={() => updateReminderSetting('frequency', 'weekly')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-widest transition-all ${activeReminders.frequency === 'weekly' ? (activePlan.isPremium ? 'bg-amber-400 text-slate-900' : 'bg-indigo-600 text-white') : (activePlan.isPremium ? 'bg-slate-900/50 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>Semanal</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Horário:</span>
                    <input type="time" value={activeReminders.time} onChange={(e) => updateReminderSetting('time', e.target.value)} className={`text-xs font-bold p-1 rounded border outline-none ${activePlan.isPremium ? 'bg-slate-900 border-slate-700 text-amber-400' : 'bg-white border-slate-200 text-slate-700'}`} />
                  </div>
                </div>
              )}
            </div>

            <div id="step-goals" className={`p-6 rounded-2xl shadow-xl border transition-all ${activePlan.isPremium ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-bold flex items-center gap-2 ${activePlan.isPremium ? 'text-slate-100' : 'text-slate-800'}`}>
                  <i className={`fas fa-layer-group ${activePlan.isPremium ? 'text-amber-400' : 'text-indigo-500'}`}></i>
                  Minhas Metas
                </h3>
                <button onClick={handleAddNewGoal} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${activePlan.isPremium ? 'bg-amber-400 text-slate-900 hover:scale-110' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}>
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {plans.map(p => (
                  <div key={p.id} onClick={() => setActivePlanId(p.id)} className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${activePlanId === p.id ? (activePlan.isPremium ? 'bg-amber-400/10 border-amber-400' : 'bg-indigo-50 border-indigo-200') : (activePlan.isPremium ? 'bg-slate-900/50 border-slate-700 hover:border-slate-500' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200')}`}>
                    <div className="flex flex-col overflow-hidden">
                      <span className={`text-xs font-bold truncate ${activePlanId === p.id ? (activePlan.isPremium ? 'text-amber-400' : 'text-indigo-700') : (activePlan.isPremium ? 'text-slate-400' : 'text-slate-600')}`}>{p.title}</span>
                      <span className="text-[10px] text-slate-500">R$ {p.target.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-6 rounded-2xl shadow-xl transition-all hover:scale-[1.02] ${activePlan.isPremium ? 'bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700' : 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white'}`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${activePlan.isPremium ? 'text-amber-400' : 'text-white'}`}>
                <i className={`fas ${activePlan.isPremium ? 'fa-brain' : 'fa-robot'} ${activePlan.isPremium ? 'text-amber-400' : 'text-blue-200'}`}></i>
                IA Consultor
              </h3>
              <p className={`text-sm italic leading-relaxed ${activePlan.isPremium ? 'text-slate-300' : 'text-white'}`}>"{aiAdvice}"</p>
            </div>
          </div>
        </div>

        <footer className={`mt-12 pt-8 border-t text-center text-sm ${activePlan.isPremium ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-400'}`}>
          <div className="flex flex-col items-center gap-2">
            <p>&copy; {new Date().getFullYear()} Poupança Elite</p>
            <button 
              onClick={() => { localStorage.removeItem(TUTORIAL_STORAGE_KEY); setShowTutorial(true); }}
              className="text-[10px] uppercase font-bold tracking-widest hover:text-indigo-500 transition-colors"
            >
              Ver Tutorial Novamente
            </button>
          </div>
        </footer>
      </div>

      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} onConfirm={handleUnlockPremium} />
      
      {showTutorial && (
        <TutorialOverlay 
          steps={tutorialSteps} 
          isPremium={activePlan.isPremium} 
          onComplete={() => {
            localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
            setShowTutorial(false);
          }} 
        />
      )}
    </div>
  );
};

export default App;
