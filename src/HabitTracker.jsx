import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Sun, Pill, Dumbbell, BookOpen, Coffee, Plus, X } from 'lucide-react';
import { cn } from './BottomNav';

export default function HabitTracker({ habits, onToggle, onAdd, onRemove }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'water': return <Droplet size={18} />;
      case 'sun': return <Sun size={18} />;
      case 'pill': return <Pill size={18} />;
      case 'workout': return <Dumbbell size={18} />;
      case 'read': return <BookOpen size={18} />;
      default: return <Coffee size={18} />;
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if(newTitle.trim()) {
      onAdd(newTitle.trim());
      setNewTitle('');
      setIsEditing(false); // opcional ficar editando
    }
  };

  if (!habits) return null;

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4 pl-1 pr-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
          Rotina Diária
        </h3>
        <button onClick={() => setIsEditing(!isEditing)} className="text-xs text-indigo-500 font-medium hover:underline p-1">
          {isEditing ? 'Concluir' : 'Editar'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {habits.map((habit) => (
            <motion.div
              layout
              key={habit.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group block"
            >
              <button
                onClick={() => !isEditing && onToggle(habit.id)}
                disabled={isEditing}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all",
                  !isEditing && "active:scale-95",
                  habit.completed && !isEditing
                    ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-transparent"
                    : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300 shadow-sm",
                  !isEditing && !habit.completed && "hover:border-indigo-300",
                  isEditing && "opacity-70 grayscale-0 border-dashed"
                )}
              >
                <span className={habit.completed && !isEditing ? 'opacity-100' : 'opacity-60 grayscale'}>
                  {getIcon(habit.icon)}
                </span>
                <span className={habit.completed && !isEditing ? 'line-through opacity-80' : ''}>
                  {habit.title}
                </span>
              </button>
              
              {isEditing && (
                <button 
                  onClick={() => onRemove(habit.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-10"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              )}
            </motion.div>
          ))}
          
          {isEditing && (
            <motion.form 
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onSubmit={handleAdd} 
              className="flex items-center gap-2"
            >
              <input 
                type="text" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Novo hábito"
                className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm outline-none w-36 shadow-sm focus:border-indigo-400"
                autoFocus
                maxLength={20}
              />
              <button type="submit" disabled={!newTitle.trim()} className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-indigo-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors disabled:opacity-50 shadow-sm disabled:hover:border-transparent">
                <Plus size={18} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
