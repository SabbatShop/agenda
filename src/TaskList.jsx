import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Sunrise, MoonStar } from 'lucide-react';
import TaskItem from './TaskItem';

export default function TaskList({ tasks, onFocus, onComplete, onSnooze, readonlyMode = false, hideEmptyState = false }) {
  if (tasks.length === 0 && !hideEmptyState) {
    return (
      <div className="text-center py-12 text-slate-400 dark:text-zinc-500">
        <p className="text-xl">Tudo limpo por aqui! ✨</p>
      </div>
    );
  }

  // Agrupar tarefas por bloco de tempo
  const blocks = {
    morning: { label: 'Manhã', icon: Sunrise, tasks: [] },
    afternoon: { label: 'Tarde', icon: Sun, tasks: [] },
    evening: { label: 'Noite', icon: MoonStar, tasks: [] },
    any: { label: 'A qualquer hora', icon: null, tasks: [] }
  };

  tasks.forEach(task => {
    const block = task.timeBlock || 'any';
    if (blocks[block]) blocks[block].tasks.push(task);
  });

  const renderGroup = (blockId, group) => {
    if (group.tasks.length === 0) return null;
    const Icon = group.icon;

    return (
      <div key={blockId} className="mb-6">
        {blockId !== 'any' && (
          <h4 className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-400 uppercase mb-3 pl-2">
            <Icon size={16} /> {group.label}
          </h4>
        )}
        <ul className="space-y-4">
          <AnimatePresence>
            {group.tasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onFocus={readonlyMode ? () => {} : () => onFocus(task.id)}
                onComplete={() => onComplete(task.id)}
                onSnooze={() => onSnooze(task.id)}
                readonlyMode={readonlyMode}
              />
            ))}
          </AnimatePresence>
        </ul>
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderGroup('morning', blocks.morning)}
      {renderGroup('afternoon', blocks.afternoon)}
      {renderGroup('evening', blocks.evening)}
      {renderGroup('any', blocks.any)}
    </div>
  );
}
