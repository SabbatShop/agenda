import React from 'react';
import { format, isSameDay, isToday, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trophy, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import TaskList from './TaskList';
import { cn } from './BottomNav';

// Custom Tooltip para o Gráfico
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl border border-zinc-700">
        {payload[0].value} tarefas em {label}
      </div>
    );
  }
  return null;
};

export default function HistoryView({ tasks, onComplete }) {
  const completedTasks = tasks.filter(t => t.completed);
  const sortedTasks = [...completedTasks].sort((a, b) => {
    const dateA = a.completedAt ? new Date(a.completedAt) : new Date(a.dueDate);
    const dateB = b.completedAt ? new Date(b.completedAt) : new Date(b.dueDate);
    return dateB - dateA;
  });

  // Lógica do Gráfico de Barras dos últimos 7 dias
  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
  
  const weeklyStats = last7Days.map(date => {
    const count = completedTasks.filter(t => {
      const taskDate = t.completedAt ? new Date(t.completedAt) : new Date(t.dueDate);
      return isSameDay(taskDate, date);
    }).length;
    
    return { 
      fullDate: format(date, "d 'de' MMM", { locale: ptBR }),
      shortDay: format(date, 'EE', { locale: ptBR }).substring(0,3).toUpperCase(), 
      count,
      isToday: isToday(date)
    };
  });

  const totalWeeklyTasks = weeklyStats.reduce((sum, s) => sum + s.count, 0);

  // Agrupar tarefas do histórico
  const groupedTasks = sortedTasks.reduce((groups, task) => {
    const taskDate = task.completedAt ? new Date(task.completedAt) : new Date(task.dueDate);
    const dateKey = format(taskDate, 'yyyy-MM-dd');
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(task);
    return groups;
  }, {});

  return (
    <div className="space-y-8 pb-32">
      <header className="mb-4">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-100 flex items-center gap-3">
          <Trophy className="text-amber-400" size={32} /> Minhas Vitórias
        </h2>
        <p className="text-slate-500 dark:text-zinc-400 mt-2">
          Relembre o que você já conquistou e acompanhe seu ritmo.
        </p>
      </header>

      {/* Dashboard TDAH (Reforço Visual Premium) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-3xl shadow-sm mb-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-orange-100 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400 rounded-full flex items-center justify-center shadow-inner">
             <Flame size={24} className="fill-current" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Últimos 7 dias</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-zinc-100 flex items-baseline gap-2">
              {totalWeeklyTasks} <span className="text-sm font-semibold text-slate-400 dark:text-zinc-500">tarefas</span>
            </h3>
          </div>
        </div>

        {/* Gráfico Recharts Bonito */}
        <div className="h-40 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStats} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(168, 85, 247, 0.05)' }} // Hover da coluna
              />
              <XAxis 
                dataKey="shortDay" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                dy={10}
              />
              <Bar 
                dataKey="count" 
                radius={[6, 6, 6, 6]} // Barras arredondadas topo e base
                barSize={32}
              >
                {weeklyStats.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isToday ? '#fbbf24' : '#6366f1'} // Amarelo se for hoje, Indigo para o resto
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
          <p className="text-slate-500 dark:text-slate-400">Complete tarefas para encher sua lista de vitórias.</p>
        </div>
      ) : (
        Object.entries(groupedTasks).map(([dateKey, groupTasks]) => {
          const date = new Date(dateKey + 'T12:00:00');
          const dateLabel = isToday(date) ? 'Hoje' : format(date, "EEEE, d 'de' MMMM", { locale: ptBR });

          return (
            <div key={dateKey} className="mb-8">
              <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4 pl-2">
                {dateLabel}
              </h3>
              <TaskList 
                tasks={groupTasks} 
                onFocus={() => {}} 
                onComplete={onComplete} 
                onSnooze={() => {}}
                readonlyMode={true} 
              />
            </div>
          );
        })
      )}
    </div>
  );
}
