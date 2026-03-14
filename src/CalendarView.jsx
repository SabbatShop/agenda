import React, { useState } from 'react';
import { format, addDays, subDays, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import TaskList from './TaskList';

export default function CalendarView({ tasks, onFocus, onComplete, onSnooze }) {
  // Estado para o dia que o usuário está olhando no calendário
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Gerar um array com 7 dias ao redor do dia selecionado (para a visão semanal)
  const getWeekDays = (baseDate) => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
        days.push(addDays(baseDate, i));
    }
    return days;
  };

  const weekDays = getWeekDays(selectedDate);

  // Filtrar tarefas DO DIA selecionado E que NÃO estão completas
  const dayTasks = tasks.filter(task => {
    return isSameDay(new Date(task.dueDate), selectedDate) && !task.completed;
  });

  return (
    <div className="pb-32">
      <header className="mb-6 flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-3">
             Agenda
           </h2>
           <p className="text-slate-500 dark:text-zinc-400 mt-1 capitalize">
             {format(selectedDate, "MMM, yyyy", { locale: ptBR })}
           </p>
        </div>
        <button 
           onClick={() => setSelectedDate(new Date())}
           className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isToday(selectedDate) ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-300 hover:bg-slate-200'}`}
        >
          Hoje
        </button>
      </header>

      {/* Navegador de Dias Horizontais (Fácil Cognitivamente) */}
      <div className="flex items-center justify-between gap-2 mb-10 overflow-x-auto pb-4 snap-x hide-scrollbar">
         <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
            <ChevronLeft />
         </button>

         <div className="flex gap-2 flex-1 justify-center min-w-max">
            {weekDays.map(date => {
                const isSelected = isSameDay(date, selectedDate);
                const hasTask = tasks.some(t => isSameDay(new Date(t.dueDate), date) && !t.completed);
                return (
                    <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center justify-center w-14 h-16 rounded-2xl snap-center transition-all ${isSelected ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20 scale-105' : 'bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-slate-500 hover:bg-slate-50'}`}
                    >
                        <span className={`text-[10px] uppercase font-bold tracking-widest ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                            {format(date, 'EEE', { locale: ptBR }).substring(0,3)}
                        </span>
                        <span className={`text-xl font-medium mt-0.5 ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                            {format(date, 'dd')}
                        </span>
                        {/* Indicador sutil de que há tarefa neste dia */}
                        {hasTask && !isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 absolute bottom-2" />
                        )}
                    </button>
                )
            })}
         </div>

         <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
            <ChevronRight />
         </button>
      </div>

      {/* Título do Dia Selecionado */}
      <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-6">
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
