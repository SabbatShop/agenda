import React, { useState, useEffect } from 'react';
import { Check, Plus, Trash2, Clock, X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { setupNotifications, scheduleNextReminder, cancelReminder } from './NotificationService';

export default function HabitTracker({ habits, onToggle, onAdd, onRemove, onEdit }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [intervalTime, setIntervalTime] = useState(''); // Em minutos

  // Estados para edição
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editInterval, setEditInterval] = useState('');

  useEffect(() => {
    setupNotifications();
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

  const startEditing = (habit) => {
    setEditingId(habit.id);
    setEditTitle(habit.title);
    setEditInterval(habit.intervalMinutes || '');
  };

  const handleSaveEdit = (e, id) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onEdit(id, editTitle, editInterval ? parseInt(editInterval) : null);
      setEditingId(null);
    }
  };

  const handleToggleWrapper = (habit) => {
    onToggle(habit.id);
    
    if (!habit.completed && habit.intervalMinutes) {
      scheduleNextReminder(habit.id, habit.title, habit.intervalMinutes);
    } else if (habit.completed && habit.intervalMinutes) {
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
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingId(null);
          }}
          className="p-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg transition-colors"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* Formulário de Adicionar */}
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
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-green-500 dark:text-white text-sm"
            />
            <div className="flex gap-2">
              <input 
                type="number" 
                value={intervalTime}
                onChange={(e) => setIntervalTime(e.target.value)}
                placeholder="Avisar a cada (min)?"
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-green-500 dark:text-white text-sm"
              />
              <button 
                type="submit"
                disabled={!newHabit.trim()}
                className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {habits.map((habit) => (
          <div key={habit.id} className="relative group flex flex-col">
            {editingId === habit.id ? (
              // MODO DE EDIÇÃO DO HÁBITO
              <form onSubmit={(e) => handleSaveEdit(e, habit.id)} className="bg-white dark:bg-zinc-900 border border-green-300 dark:border-green-700 p-3 rounded-2xl flex flex-col gap-2 shadow-sm z-10">
                <input 
                  type="text" 
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Nome do hábito"
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg outline-none focus:border-green-500 dark:text-white text-sm"
                />
                <div className="flex gap-2 items-center">
                   <Clock size={14} className="text-slate-400" />
                   <input 
                    type="number" 
                    value={editInterval}
                    onChange={(e) => setEditInterval(e.target.value)}
                    placeholder="Minutos"
                    className="flex-1 px-2 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg outline-none focus:border-green-500 dark:text-white text-sm"
                  />
                </div>
                <div className="flex gap-2 mt-1">
                  <button type="button" onClick={() => setEditingId(null)} className="flex-1 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold">Cancelar</button>
                  <button type="submit" className="flex-1 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold">Salvar</button>
                </div>
              </form>
            ) : (
              // VISUALIZAÇÃO NORMAL DO HÁBITO
              <div className="flex-1 flex relative">
                <button
                  onClick={() => handleToggleWrapper(habit)}
                  className={`w-full flex items-center gap-3 p-3 pr-12 rounded-2xl border transition-all duration-300 ${
                    habit.completed 
                      ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-500 opacity-80' 
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-green-300 dark:hover:border-green-500/50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
                    habit.completed ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'
                  }`}>
                    {habit.completed && <Check size={14} strokeWidth={3} />}
                  </div>
                  
                  <div className="flex flex-col items-start text-left min-w-0">
                    <span className={`text-sm font-semibold truncate w-full transition-all ${habit.completed ? 'line-through decoration-2 decoration-green-500/40' : 'text-slate-700 dark:text-slate-300'}`}>
                      {habit.title}
                    </span>
                    {habit.intervalMinutes && (
                      <span className={`text-[10px] flex items-center gap-1 mt-0.5 ${habit.completed ? 'opacity-60' : 'text-slate-500 dark:text-slate-400'}`}>
                        <Clock size={10} /> {formatInterval(habit.intervalMinutes)}
                      </span>
                    )}
                  </div>
                </button>
                
                {/* Botões de Ação (Aparecem sempre no mobile para facilitar, ou no hover) */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                   <button
                    onClick={() => startEditing(habit)}
                    className="p-1.5 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onRemove(habit.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}