import React from 'react';
import { Target, Calendar as CalendarIcon, Trophy, Lightbulb, Repeat } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function BottomNav({ currentTab, onChange }) {
  const tabs = [
    { id: 'focus', label: 'Hoje', icon: Target },
    { id: 'routine', label: 'Rotina', icon: Repeat },
    { id: 'calendar', label: 'Agenda', icon: CalendarIcon },
    { id: 'braindump', label: 'Ideias', icon: Lightbulb },
    { id: 'history', label: 'Vitórias', icon: Trophy },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 pt-2 px-2 flex justify-between items-center z-50 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 flex-1 py-2 px-1 rounded-2xl transition-all duration-300",
              isActive 
                ? "text-indigo-600 dark:text-indigo-400" 
                : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-full transition-colors duration-300",
              isActive && "bg-indigo-50 dark:bg-indigo-900/30"
            )}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={cn(
              "text-[9px] sm:text-[10px] font-medium transition-all duration-300",
              isActive ? "opacity-100" : "opacity-0 -translate-y-1 h-0 overflow-hidden"
            )}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}