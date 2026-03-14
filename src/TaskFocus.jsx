import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Moon, Plus } from 'lucide-react';
import FocusTimer from './FocusTimer';

export default function TaskFocus({ task, onComplete, onSnooze, onClose, onAddSubtask, onToggleSubtask }) {
  const [subtaskInput, setSubtaskInput] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // Hit de Dopamina! Efeito de saída e celebração antes de fechar
  const handleComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      onComplete();
    }, 800); // Dá tempo da animação de sucesso rodar
  };

  const handleSubtaskSubmit = (e) => {
    e.preventDefault();
    if (!subtaskInput.trim()) return;
    onAddSubtask(task.id, subtaskInput.trim());
    setSubtaskInput('');
  };

  const progress = task.subtasks.length > 0 
    ? task.subtasks.filter(s => s.completed).length / task.subtasks.length 
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isCompleted ? { scale: 1.05, opacity: 0, y: -50 } : { opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border ${isCompleted ? 'border-green-400 shadow-green-500/20' : 'border-slate-100 dark:border-zinc-800'}`}
    >
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-6 flex items-center gap-2">
        <X size={20} /> <span className="text-sm font-medium">Sair do Foco</span>
      </button>

      <h2 className="text-4xl font-extrabold text-slate-800 dark:text-zinc-100 leading-tight mb-8">
        {task.title}
      </h2>

      {/* Temporizador Pomodoro Flexível */}
      <FocusTimer /> 

      {/* Micro-steps (Sub-tarefas) */}
      <div className="mt-8 mb-8">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Divisão (Micro-passos)</h3>
        
        {/* Barra de progresso */}
        {task.subtasks.length > 0 && (
          <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full mb-4 overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        <div className="space-y-3 mb-4">
          {task.subtasks.map(sub => (
            <div key={sub.id} className="flex items-center gap-3">
              <button 
                onClick={() => onToggleSubtask(task.id, sub.id)}
                className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-colors ${sub.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-zinc-700'}`}
              >
                {sub.completed && <Check size={14} strokeWidth={3} />}
              </button>
              <span className={`text-lg transition-all ${sub.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {sub.title}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubtaskSubmit} className="flex gap-2">
          <input 
            type="text" 
            value={subtaskInput}
            onChange={(e) => setSubtaskInput(e.target.value)}
            placeholder="Qual é o primeiro micro-passo?"
            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-zinc-800 rounded-lg outline-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/50"
          />
          <button type="submit" className="p-2 bg-slate-200 dark:bg-zinc-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-300">
            <Plus size={20} />
          </button>
        </form>
      </div>

      <div className="flex gap-4 mt-12">
        <button 
          onClick={handleComplete}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl text-xl font-bold transition-transform active:scale-95 shadow-lg shadow-green-500/30"
        >
          <Check size={28} /> {isCompleted ? 'Feito!' : 'Concluir Tarefa'}
        </button>
        
        {/* Botão Adiar Sem Culpa */}
        <button 
          onClick={onSnooze}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 py-4 rounded-2xl text-xl font-medium transition-transform active:scale-95"
        >
          <Moon size={24} /> Adiar sem culpa
        </button>
      </div>
    </motion.div>
  );
}
