import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Target, Moon, Zap, Home, Briefcase, BookOpen, HeartPulse, Star, CalendarCheck, Trash2 } from 'lucide-react';
import { cn } from './BottomNav';

export default function TaskItem({ task, onFocus, onComplete, onSnooze, onStar, onPromoteToday, onDelete, isStarred = false, readonlyMode = false }) {
  const [shrinking, setShrinking] = useState(false);

  const handleQuickComplete = (e) => {
    e.stopPropagation();
    if (!readonlyMode && !task.completed) {
      setShrinking(true);
      setTimeout(() => onComplete(), 400);
    } else {
      onComplete();
    }
  };

  const handleSnooze = (e) => {
    e.stopPropagation();
    setShrinking(true);
    setTimeout(() => onSnooze(), 400);
  };

  const isCompleted = task.completed;

  const renderEnergy = (level) => {
    if (!level || level === 'low') return null;
    const isHigh = level === 'high';
    return (
      <span className={cn("flex flex-shrink-0 items-center justify-center p-1 rounded-full", isHigh ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-500")} title={`Energia ${isHigh ? 'Alta' : 'Média'}`}>
        <Zap size={12} className="fill-current" />
      </span>
    );
  };

  const renderCategory = (cat) => {
    if (!cat || cat === 'none') return null;
    let Icon = Home;
    let colorClass = "";
    switch (cat) {
      case 'home':   Icon = Home;       colorClass = "text-orange-500 bg-orange-100"; break;
      case 'work':   Icon = Briefcase;  colorClass = "text-blue-500 bg-blue-100";    break;
      case 'study':  Icon = BookOpen;   colorClass = "text-purple-500 bg-purple-100"; break;
      case 'health': Icon = HeartPulse; colorClass = "text-rose-500 bg-rose-100";    break;
    }
    return (
      <span className={cn("flex flex-shrink-0 items-center justify-center p-1 rounded-full", colorClass)} title={cat}>
        <Icon size={12} />
      </span>
    );
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={shrinking ? { opacity: 0, scale: 0.9, x: isCompleted ? 0 : 50 } : { opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        `group bg-white dark:bg-zinc-900 border p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4`,
        isStarred && !isCompleted ? 'border-amber-300 dark:border-amber-500/50 shadow-amber-100 dark:shadow-amber-900/20' : isCompleted ? 'border-dashed border-slate-200 dark:border-zinc-800 opacity-60' : 'border-slate-100 dark:border-zinc-800',
        !readonlyMode ? 'cursor-pointer' : ''
      )}
      onClick={!readonlyMode ? onFocus : undefined}
    >
      <div className="flex w-full sm:w-auto items-center gap-4 flex-1">
        {/* Círculo de completar */}
        <button
          onClick={handleQuickComplete}
          className={cn(
            `w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0`,
            isCompleted ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-zinc-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
          )}
        >
          <Check size={16} strokeWidth={isCompleted ? 3 : 2} className={isCompleted ? 'text-white' : 'text-transparent group-hover:text-green-500 transition-colors'} />
        </button>

        {/* Título & badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isStarred && !isCompleted && (
              <span title="Tarefa Estrela do Dia">
                <Star size={14} className="text-amber-400 fill-current flex-shrink-0" />
              </span>
            )}
            <h3 className={cn(
              `text-lg font-medium truncate transition-colors`,
              isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
            )}>
              {task.title}
            </h3>
            {!isCompleted && (
              <div className="flex gap-1.5 ml-1">
                {renderEnergy(task.energy)}
                {renderCategory(task.category)}
              </div>
            )}
          </div>
          {task.subtasks?.length > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} micro-passos
            </p>
          )}
        </div>
      </div>

      {/* Ações */}
      {!readonlyMode && !isCompleted && (
        <div className="flex w-full sm:w-auto justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity mt-3 sm:mt-0">

          {/* Estrela */}
          {onStar && (
            <button
              onClick={(e) => { e.stopPropagation(); onStar(task.id); }}
              title={isStarred ? 'Remover estrela' : 'Definir como tarefa do dia'}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isStarred ? "text-amber-400 bg-amber-50 dark:bg-amber-900/20" : "text-slate-300 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              )}
            >
              <Star size={18} className={isStarred ? 'fill-current' : ''} />
            </button>
          )}

          {/* Promover para Hoje (brain dump) */}
          {onPromoteToday && (
            <button
              onClick={(e) => { e.stopPropagation(); onPromoteToday(task.id); }}
              title="Fazer hoje"
              className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
            >
              <CalendarCheck size={18} />
            </button>
          )}

          {/* Adiar */}
          <button
            onClick={handleSnooze}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg"
            title="Adiar para amanhã"
          >
            <Moon size={18} />
          </button>

          {/* Excluir */}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              title="Excluir tarefa"
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          )}

          {/* Focar */}
          <button
            onClick={(e) => { e.stopPropagation(); onFocus(); }}
            className="p-2 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-lg whitespace-nowrap flex items-center gap-2 px-3 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-500/30 w-full sm:w-auto justify-center"
          >
            <Target size={18} /> Focar
          </button>
        </div>
      )}
    </motion.li>
  );
}
