import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sun, Sunrise, MoonStar, Zap, Home, Briefcase, BookOpen, HeartPulse } from 'lucide-react';
import { cn } from './BottomNav';

export default function QuickAdd({ onAdd, isBrainDumpMode = false, placeholder = "Adicione algo à sua mente..." }) {
  const [title, setTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // States para a Fase 2
  const [timeBlock, setTimeBlock] = useState('any');
  const [energy, setEnergy] = useState('low'); // low, medium, high
  const [category, setCategory] = useState('none'); // none, home, work, study, health

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), timeBlock, energy, category);
    setTitle('');
    setTimeBlock('any');
    setEnergy('low');
    setCategory('none');
    setIsExpanded(false);
  };

  const timeBlocks = [
    { id: 'morning', label: 'Manhã', icon: Sunrise },
    { id: 'afternoon', label: 'Tarde', icon: Sun },
    { id: 'evening', label: 'Noite', icon: MoonStar }
  ];

  const energies = [
    { id: 'low', label: 'Leve', color: 'text-green-500', bg: 'bg-green-100', border: 'border-green-200' },
    { id: 'medium', label: 'Média', color: 'text-amber-500', bg: 'bg-amber-100', border: 'border-amber-200' },
    { id: 'high', label: 'Pesada', color: 'text-red-500', bg: 'bg-red-100', border: 'border-red-200' }
  ];

  const categories = [
    { id: 'home', label: 'Casa', icon: Home, colors: 'text-orange-500 bg-orange-100' },
    { id: 'work', label: 'Trabalho', icon: Briefcase, colors: 'text-blue-500 bg-blue-100' },
    { id: 'study', label: 'Estudo', icon: BookOpen, colors: 'text-purple-500 bg-purple-100' },
    { id: 'health', label: 'Saúde', icon: HeartPulse, colors: 'text-rose-500 bg-rose-100' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10"
    >
      <form id="tour-quick-add" onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder={placeholder}
          className={cn(
            "w-full px-6 py-5 text-xl bg-white dark:bg-zinc-900 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 shadow-sm outline-none transition-all placeholder:text-slate-400 dark:text-white",
            isExpanded ? "rounded-t-2xl rounded-b-none" : "rounded-2xl"
          )}
        />
        <button 
          type="submit"
          disabled={!title.trim()}
          className="absolute right-3 top-3 p-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-zinc-800 text-white rounded-xl transition-colors z-20"
        >
          <Plus size={24} />
        </button>
      </form>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute left-0 right-0 bg-white dark:bg-zinc-900 border border-t-0 border-slate-100 dark:border-zinc-800 rounded-b-2xl shadow-lg overflow-hidden flex flex-col gap-4 p-4"
          >
            {/* Linha 1: Horários (esconder se for brain dump mode) */}
            {!isBrainDumpMode && (
              <div className="flex gap-2">
                {timeBlocks.map(block => {
                  const Icon = block.icon;
                  const isSelected = timeBlock === block.id;
                  return (
                    <button
                      key={block.id}
                      type="button"
                      onClick={() => setTimeBlock(isSelected ? 'any' : block.id)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors border",
                        isSelected 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300" 
                          : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100 dark:bg-zinc-800"
                      )}
                    >
                      <Icon size={16} /> <span className="hidden sm:inline">{block.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Linha 2: Energia e Categoria */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Energia */}
              <div className="flex-1 flex gap-2">
                {energies.map(eng => {
                  const isSelected = energy === eng.id;
                  return (
                    <button
                      key={eng.id}
                      type="button"
                      onClick={() => setEnergy(eng.id)}
                      className={cn(
                        "flex-1 flex flex-col items-center justify-center py-2 rounded-xl text-xs font-bold transition-transform active:scale-95 border",
                        isSelected 
                          ? `${eng.bg} ${eng.border} ${eng.color} dark:bg-opacity-20` 
                          : "bg-slate-50 border-transparent text-slate-400 dark:bg-zinc-800"
                      )}
                    >
                      <Zap size={16} className={isSelected ? 'fill-current' : ''} />
                    </button>
                  );
                })}
              </div>

              {/* Categorias */}
              <div className="flex-1 flex gap-2">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(isSelected ? 'none' : cat.id)}
                      className={cn(
                        "flex-1 flex items-center justify-center py-2 rounded-xl transition-all border",
                        isSelected 
                          ? `${cat.colors} border-current border-opacity-30 dark:bg-opacity-20` 
                          : "bg-slate-50 border-transparent text-slate-400 dark:bg-zinc-800"
                      )}
                    >
                      <Icon size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
