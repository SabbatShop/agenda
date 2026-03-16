import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Trash2, X } from 'lucide-react';
import { cn } from './BottomNav';

const WEEK_DAYS = [
  { id: 'segunda', label: 'Seg', full: 'Segunda-feira' },
  { id: 'terca', label: 'Ter', full: 'Terça-feira' },
  { id: 'quarta', label: 'Qua', full: 'Quarta-feira' },
  { id: 'quinta', label: 'Qui', full: 'Quinta-feira' },
  { id: 'sexta', label: 'Sex', full: 'Sexta-feira' },
  { id: 'sabado', label: 'Sáb', full: 'Sábado' },
  { id: 'domingo', label: 'Dom', full: 'Domingo' }
];

export default function WeeklyRoutineView({ routines, setRoutines }) {
  const [selectedDay, setSelectedDay] = useState('segunda');
  const [isAdding, setIsAdding] = useState(false);
  const [newRoutine, setNewRoutine] = useState({ title: '', startTime: '', endTime: '' });

  const handleAddRoutine = (e) => {
    e.preventDefault();
    if (!newRoutine.title || !newRoutine.startTime) return;

    const newItem = {
      id: crypto.randomUUID(),
      day: selectedDay,
      ...newRoutine
    };

    const updatedRoutines = [...routines, newItem].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );
    
    setRoutines(updatedRoutines);
    setNewRoutine({ title: '', startTime: '', endTime: '' });
    setIsAdding(false);
  };

  const removeRoutine = (id) => {
    setRoutines(routines.filter(r => r.id !== id));
  };

  const dayRoutines = routines.filter(r => r.day === selectedDay);

  return (
    <div className="pb-10">
      <header className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-3">
          <BookOpen className="text-indigo-500" size={32} /> Rotina Semanal
        </h2>
        <p className="text-slate-500 dark:text-zinc-400 mt-2 text-sm sm:text-base">
          Seu cronograma fixo de estudos e compromissos.
        </p>
      </header>

      {/* Seletor de Dias Edge-to-Edge no Mobile */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 mb-8">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar snap-x py-2 w-full">
          {WEEK_DAYS.map(day => {
            const isSelected = selectedDay === day.id;
            const hasItems = routines.some(r => r.day === day.id);
            
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={cn(
                  "flex-shrink-0 snap-center w-14 h-14 sm:w-16 sm:h-16 flex flex-col items-center justify-center rounded-2xl transition-all relative",
                  isSelected 
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20 scale-105" 
                    : "bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800"
                )}
              >
                <span className={cn("text-sm sm:text-base font-bold", isSelected ? "text-white" : "text-slate-600 dark:text-slate-300")}>
                  {day.label}
                </span>
                {hasItems && !isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 absolute bottom-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-300">
          {WEEK_DAYS.find(d => d.id === selectedDay)?.full}
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
          {isAdding ? 'Cancelar' : 'Novo Bloco'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddRoutine}
            className="mb-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">O que fazer?</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="Ex: Estudo TJCE - Dir. Administrativo"
                  value={newRoutine.title}
                  onChange={e => setNewRoutine({...newRoutine, title: e.target.value})}
                  className="w-full px-4 py-3 sm:py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Início</label>
                  <input 
                    type="time" 
                    required
                    value={newRoutine.startTime}
                    onChange={e => setNewRoutine({...newRoutine, startTime: e.target.value})}
                    className="w-full px-4 py-3 sm:py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white text-sm sm:text-base"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fim (Opcional)</label>
                  <input 
                    type="time" 
                    value={newRoutine.endTime}
                    onChange={e => setNewRoutine({...newRoutine, endTime: e.target.value})}
                    className="w-full px-4 py-3 sm:py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white text-sm sm:text-base"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-3.5 sm:py-3 mt-2 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
              >
                Salvar na Rotina
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {dayRoutines.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-zinc-500 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl">
          Nenhum bloco definido para este dia.
        </div>
      ) : (
        <div className="space-y-3">
          {dayRoutines.map(routine => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={routine.id}
              className="flex items-center gap-3 sm:gap-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-3 sm:p-4 rounded-2xl shadow-sm group"
            >
              <div className="flex flex-col items-center justify-center min-w-[3.5rem] sm:min-w-[4rem] text-indigo-600 dark:text-indigo-400">
                <span className="text-base sm:text-lg font-bold font-mono">{routine.startTime}</span>
                {routine.endTime && <span className="text-[10px] sm:text-xs font-medium text-slate-400">até {routine.endTime}</span>}
              </div>
              
              <div className="w-px h-10 bg-slate-200 dark:bg-zinc-800"></div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-zinc-200 truncate">{routine.title}</h4>
              </div>

              <button 
                onClick={() => removeRoutine(routine.id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}