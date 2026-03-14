import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Plus } from 'lucide-react';
import TaskList from './TaskList';
import QuickAdd from './QuickAdd';

export default function BrainDumpView({ tasks, onAdd, onFocus, onComplete, onSnooze }) {
  // O backlog será qualquer tarefa do tipo 'braindump'
  const backlogTasks = tasks.filter(t => t.isBrainDump && !t.completed);

  return (
    <div className="pb-32">
      <header className="mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-3">
          <Lightbulb className="text-amber-400 hover:animate-pulse" size={32} fill="currentColor" /> Despejo de Ideias
        </h2>
        <p className="text-slate-500 dark:text-zinc-400 mt-2">
          Teve um pensamento aleatório ou lembrança? Jogue aqui pra não poluir o Hoje.
        </p>
      </header>

      {/* Input de Adição Específico para o Brain Dump */}
      <div className="mb-8">
        <QuickAdd 
          onAdd={onAdd}
          isBrainDumpMode={true} 
          placeholder="Tire da cabeça... (ex: Comprar prateleira)"
        />
      </div>

      {backlogTasks.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-zinc-500 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl">
           Nenhuma ideia perdida por enquanto!
        </div>
      ) : (
        <TaskList 
          tasks={backlogTasks} 
          onFocus={onFocus}
          onComplete={onComplete}
          onSnooze={onSnooze}
        />
      )}
    </div>
  );
}
