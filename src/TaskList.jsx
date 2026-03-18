import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Sunrise, MoonStar } from 'lucide-react';
import TaskItem from './TaskItem';

export default function TaskList({ tasks, onFocus, onComplete, onSnooze, onStar, onDelete, onPromoteToday, starredTaskId, readonlyMode = false, hideEmptyState = false, oneThing = false }) {
  if (tasks.length === 0 && !hideEmptyState) {
    return (
      <div className="text-center py-12 text-slate-400 dark:text-zinc-500">
        <p className="text-xl">Tudo limpo por aqui! ✨</p>
      </div>
    );
  }

  // Modo "Uma Coisa Só": exibe apenas a tarefa estrela (ou a primeira)
  if (oneThing) {
    const featured = tasks.find(t => t.id === starredTaskId) || tasks[0];
    if (!featured) return null;
    return (
      <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <TaskItem
          key={featured.id}
          task={featured}
          onFocus={() => onFocus(featured.id)}
          onComplete={() => onComplete(featured.id)}
          onSnooze={() => onSnooze(featured.id)}
          onStar={onStar}
          onDelete={onDelete}
          isStarred={featured.id === starredTaskId}
          readonlyMode={readonlyMode}
        />
      </motion.ul>
    );
  }

  // Agrupamento por bloco de tempo; estrela sempre sobe ao topo
  const starred = tasks.filter(t => t.id === starredTaskId);
  const rest    = tasks.filter(t => t.id !== starredTaskId);

  const blocks = {
    morning:   { label: 'Manhã',          icon: Sunrise, tasks: [] },
    afternoon: { label: 'Tarde',          icon: Sun,     tasks: [] },
    evening:   { label: 'Noite',          icon: MoonStar, tasks: [] },
    any:       { label: 'A qualquer hora', icon: null,    tasks: [] },
  };

  rest.forEach(task => {
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
                onStar={onStar}
                onDelete={onDelete}
                onPromoteToday={onPromoteToday}
                isStarred={task.id === starredTaskId}
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
      {/* Tarefa Estrela fixada no topo */}
      {starred.length > 0 && (
        <div className="mb-6">
          <h4 className="flex items-center gap-2 text-sm font-bold tracking-wider text-amber-400 uppercase mb-3 pl-2">
            ⭐ Tarefa do Dia
          </h4>
          <ul className="space-y-4">
            <AnimatePresence>
              {starred.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onFocus={() => onFocus(task.id)}
                  onComplete={() => onComplete(task.id)}
                  onSnooze={() => onSnooze(task.id)}
                  onStar={onStar}
                  onDelete={onDelete}
                  onPromoteToday={onPromoteToday}
                  isStarred={true}
                  readonlyMode={readonlyMode}
                />
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
      {renderGroup('morning', blocks.morning)}
      {renderGroup('afternoon', blocks.afternoon)}
      {renderGroup('evening', blocks.evening)}
      {renderGroup('any', blocks.any)}
    </div>
  );
}
