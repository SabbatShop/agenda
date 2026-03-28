import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Siren, CalendarDays, ArrowRight, Check, Sparkles } from 'lucide-react';

const slides = [
  {
    id: 'welcome',
    title: 'Sua nova mente, organizada.',
    description: 'Uma agenda pensada para quem tem TDAH. Simples, sem poluição visual e projetada para manter seu foco no que importa.',
    icon: <Sparkles className="w-24 h-24 text-indigo-500 mb-6" strokeWidth={1.2} />,
    color: 'from-indigo-500/20 to-indigo-500/5'
  },
  {
    id: 'habits',
    title: 'Domine sua Rotina',
    description: 'Acompanhe beber água, tomar remédios e exercícios. Seus pequenos hábitos diários a apenas um toque de distância na tela principal.',
    icon: <CalendarDays className="w-24 h-24 text-emerald-500 mb-6" strokeWidth={1.2} />,
    color: 'from-emerald-500/20 to-emerald-500/5'
  },
  {
    id: 'focus',
    title: 'Modo: Uma Coisa Só',
    description: 'A lista enorme de tarefas está te paralisando? Ative este modo mágico para focar em apenas UMA tarefa por vez e esconder todo o resto. 🤫',
    icon: <Zap className="w-24 h-24 text-amber-500 mb-6" strokeWidth={1.2} />,
    color: 'from-amber-500/20 to-amber-500/5'
  },
  {
    id: 'panic',
    title: 'Modo Pânico',
    description: 'Bateu o desespero e o prazo estourou? Ative a Sirene 🚨 e nós filtraremos apenas as 3 tarefas mais urgentes e pesadas do dia.',
    icon: <Siren className="w-24 h-24 text-red-500 mb-6" strokeWidth={1.2} />,
    color: 'from-red-500/20 to-red-500/5'
  }
];

export default function OnboardingTutorial({ onFinish }) {
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      onFinish();
    }
  };

  const slide = slides[current];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xl"
    >
      <motion.div 
        key={current}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[500px] flex flex-col"
      >
        {/* Background gradient effect */}
        <div className={`absolute inset-0 bg-gradient-to-b ${slide.color} opacity-50 dark:opacity-20 pointer-events-none transition-colors duration-500`} />
        
        {/* Skip button container */}
        <div className="absolute top-6 right-6 z-20">
          <button 
            onClick={onFinish}
            className="text-xs font-semibold text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors tracking-wider uppercase"
          >
            Pular
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10 pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 1.1, opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              {slide.icon}
              <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 mb-4">
                {slide.title}
              </h2>
              <p className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                {slide.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer controls */}
        <div className="p-8 pt-0 relative z-10 w-full flex flex-col items-center gap-6">
          {/* Dots */}
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  current === idx 
                    ? 'w-8 bg-indigo-500' 
                    : 'w-2 bg-slate-200 dark:bg-zinc-800'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl py-4 font-bold text-lg hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all active:scale-95 shadow-xl shadow-slate-900/20 dark:shadow-indigo-600/20"
          >
            {current === slides.length - 1 ? (
              <>
                Começar Agora <Check size={20} strokeWidth={2.5} />
              </>
            ) : (
              <>
                Continuar <ArrowRight size={20} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
