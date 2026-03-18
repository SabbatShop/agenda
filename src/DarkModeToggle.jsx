import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DarkModeToggle({ isDark, onToggle }) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onToggle}
      title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </motion.button>
  );
}
