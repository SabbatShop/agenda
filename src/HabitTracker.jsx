import React, { useState, useEffect } from 'react';
import { Check, Plus, Trash2, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestNotificationPermission, scheduleNextReminder, cancelReminder } from './NotificationService';

export default function HabitTracker({ habits, onToggle, onAdd, onRemove }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [intervalTime, setIntervalTime] = useState(''); // Em minutos

  // Pede permissão de notificação quando o componente montar
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newHabit.trim()) {
      onAdd(newHabit, intervalTime ? parseInt(intervalTime) : null);
      setNewHabit('');
      setIntervalTime('');
      setIsAdding(false);
    }
  };

  const handleToggleWrapper = (habit) => {
    onToggle(habit.id);
    
    // Se está a marcar como concluído e tem intervalo, agenda o próximo
    if (!habit.completed && habit.intervalMinutes) {
      scheduleNextReminder(habit.id, habit.title, habit.intervalMinutes);
    } 
    // Se desmarcou, cancela a notificação
    else if (habit.completed && habit.intervalMinutes) {
      cancelReminder(habit.id);
    }
  };

  const formatInterval = (mins) => {
    if (!mins) return null;
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h${m}m` : `${h}h`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
          Rotina Diária
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-2xl flex flex-col gap-3"
          >
            <input 
              type="text" 
              autoFocus
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="Ex: Beber água"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white text-sm"
            />
            <div className="flex gap-2">
              <input 
                type="number" 
                value={intervalTime}
                onChange={(e) => setIntervalTime(e.target.value)}
                placeholder="Avisar dnv a cada (minutos)?"
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white text-sm"
              />
              <button 
                type="submit"
                disabled={!newHabit.trim()}
                className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
            <p className="text-[10px] text-slate-400">Ex: Para 1h30 digite 90. Para 6h digite 360.</p>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {habits.map((habit) => (
          <div key={habit.id} className="relative group">
             <button
              onClick={() => handleToggleWrapper(habit)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${
                habit.completed 
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300' 
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-500/50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
                habit.completed ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'
              }`}>
                {habit.completed && <Check size={14} strokeWidth={3} />}
              </div>
              <div className="flex flex-col items-start text-left min-w-0">
                <span className={`text-sm font-semibold truncate w-full ${habit.completed ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                  {habit.title}
                </span>
                {habit.intervalMinutes && (
                  <span className="text-[10px] flex items-center gap-1 opacity-70 mt-0.5">
                    <Clock size={10} /> a cada {formatInterval(habit.intervalMinutes)}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => onRemove(habit.id)}
              className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}