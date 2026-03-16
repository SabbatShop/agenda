import React, { useState } from 'react';
import { format, addDays, subDays, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import TaskList from './TaskList';

export default function CalendarView({ tasks, onFocus, onComplete, onSnooze }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getWeekDays = (baseDate) => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
        days.push(addDays(baseDate, i));
    }
    return days;
  };

  const weekDays = getWeekDays(selectedDate);

  const dayTasks = tasks.filter(task => {
    return isSameDay(new Date(task.dueDate), selectedDate) && !task.completed;
  });

  return (
    <div className="pb-10">
      <header className="mb-6 flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-3">
             Agenda
           </h2>
           <p className="text-slate-500 dark:text-zinc-400 mt-1 capitalize text-sm sm:text-base">
             {format(selectedDate, "MMM, yyyy", { locale: ptBR })}
           </p>
        </div>
        <button 
           onClick={() => setSelectedDate(new Date())}
           className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${isToday(selectedDate) ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-300 hover:bg-slate-200'}`}
        >
          Hoje
        </button>
      </header>

      {/* Navegador de Dias Horizontais com Edge-to-Edge no Mobile */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 mb-8">
        <div className="flex items-center w-full gap-1 sm:gap-2">
           <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-1 sm:p-2 flex-shrink-0 text-slate-400 hover:text-indigo-500 transition-colors">
              <ChevronLeft size={20} />
           </button>

           <div className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar snap-x py-2">
              {weekDays.map(date => {
                  const isSelected = isSameDay(date, selectedDate);
                  const hasTask = tasks.some(t => isSameDay(new Date(t.dueDate), date) && !t.completed);
                  return (
                      <button
                          key={date.toISOString()}
                          onClick={() => setSelectedDate(date)}
                          className={`flex-shrink-0 snap-center w-12 h-14 sm:w-16 sm:h-16 flex flex-col items-center justify-center rounded-2xl transition-all relative ${isSelected ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20 scale-105' : 'bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}
                      >
                          <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-widest ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                              {format(date, 'EEE', { locale: ptBR }).substring(0,3)}
                          </span>
                          <span className={`text-lg sm:text-xl font-medium mt-0.5 ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                              {format(date, 'dd')}
                          </span>
                          {hasTask && !isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 absolute bottom-1 sm:bottom-2" />
                          )}
                      </button>
                  )
              })}
           </div>

           <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-1 sm:p-2 flex-shrink-0 text-slate-400 hover:text-indigo-500 transition-colors">
              <ChevronRight size={20} />
           </button>
        </div>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-300 mb-6">
        {isToday(selectedDate) ? 'O que fazer hoje' : `Tarefas para ${format(selectedDate, "EEEE", { locale: ptBR }).split('-')[0]}`}
      </h3>

      <TaskList 
        tasks={dayTasks} 
        onFocus={onFocus}
        onComplete={onComplete}
        onSnooze={onSnooze}
        hideEmptyState={false}
      />
    </div>
  );
}