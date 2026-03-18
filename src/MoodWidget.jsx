import React from 'react';
import { motion } from 'framer-motion';

const moods = [
  { id: 'tired', emoji: '😴', label: 'Cansado', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300', tip: 'Comece pelas tarefas mais leves hoje.' },
  { id: 'normal', emoji: '😐', label: 'Normal', color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300', tip: 'Ritmo moderado. Você consegue!' },
  { id: 'energized', emoji: '⚡', label: 'Animado', color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300', tip: 'Ótimo dia para tarefas pesadas!' },
];

export default function MoodWidget({ onAnswer }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="mb-6 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 shadow-sm"
    >
      <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
        Como você está hoje?
      </p>
      <div className="grid grid-cols-3 gap-3">
        {moods.map(mood => (
          <button
            key={mood.id}
            onClick={() => onAnswer(mood)}
            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all active:scale-95 font-semibold text-sm ${mood.color}`}
          >
            <span className="text-3xl">{mood.emoji}</span>
            <span>{mood.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
