import React, { useState, useEffect } from 'react';
import { addDays, isSameDay } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import QuickAdd from './QuickAdd';
import TaskFocus from './TaskFocus';
import TaskList from './TaskList';
import BottomNav from './BottomNav';
import CalendarView from './CalendarView';
import HistoryView from './HistoryView';
import BrainDumpView from './BrainDumpView';
import HabitTracker from './HabitTracker';
import WeeklyRoutineView from './WeeklyRoutineView';
import { Toaster } from 'react-hot-toast';

export default function App() {
  // --- ESTADOS LOCAIS ---
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('adhd-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('adhd-habits');
    const defaultHabits = [
      { id: 'h1', title: 'Beber Água', icon: 'water', completed: false, lastDone: null, intervalMinutes: null },
      { id: 'h2', title: 'Tomar Remédio', icon: 'pill', completed: false, lastDone: null, intervalMinutes: null },
      { id: 'h3', title: '15 min de Sol', icon: 'sun', completed: false, lastDone: null, intervalMinutes: null }
    ];
    return saved ? JSON.parse(saved) : defaultHabits;
  });

  const [routines, setRoutines] = useState(() => {
    const saved = localStorage.getItem('adhd-routines');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [currentTab, setCurrentTab] = useState('focus'); 

  // --- PERSISTÊNCIA ---
  useEffect(() => {
    localStorage.setItem('adhd-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('adhd-routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    const todayStr = new Date().toDateString();
    const resetHabits = habits.map(h => {
      if (h.completed && h.lastDone !== todayStr) {
        return { ...h, completed: false };
      }
      return h;
    });

    if (JSON.stringify(resetHabits) !== JSON.stringify(habits)) {
      setHabits(resetHabits);
    }
    localStorage.setItem('adhd-habits', JSON.stringify(resetHabits));
  }, [habits]);

  // --- FUNÇÕES DE MANIPULAÇÃO ---
  const handleToggleHabit = (id) => {
    setHabits(habits.map(h => h.id === id ? { 
      ...h, 
      completed: !h.completed, 
      lastDone: !h.completed ? new Date().toDateString() : null 
    } : h));
  };

  const handleAddHabit = (title, intervalMinutes = null) => {
    const newHabit = {
      id: crypto.randomUUID(),
      title,
      icon: 'sun',
      completed: false,
      lastDone: null,
      intervalMinutes
    };
    setHabits([...habits, newHabit]);
  };

  const handleEditHabit = (id, newTitle, newIntervalMinutes) => {
    setHabits(habits.map(h => h.id === id ? { 
      ...h, title: newTitle, intervalMinutes: newIntervalMinutes 
    } : h));
  };

  const handleRemoveHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const handleAddTask = (title, timeBlock = 'any', energy = 'low', category = 'none', forceBrainDump = false) => {
    const isBrainDump = currentTab === 'braindump' || forceBrainDump === true;
    const newTask = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      completedAt: null,
      dueDate: new Date().toISOString(),
      timeBlock, energy, category, isBrainDump,
      subtasks: []
    };
    setTasks([newTask, ...tasks]);
  };

  const handleToggleComplete = (id) => {
    setTasks(tasks.map(t => t.id === id ? { 
      ...t, completed: !t.completed,
      completedAt: !t.completed ? new Date().toISOString() : null
    } : t));
    if (focusedTaskId === id) setFocusedTaskId(null);
  };

  const handleSnooze = (id) => {
    setTasks(tasks.map(t => t.id === id ? { 
      ...t, dueDate: addDays(new Date(t.dueDate), 1).toISOString() 
    } : t));
    if (focusedTaskId === id) setFocusedTaskId(null);
  };

  // --- FILTROS E LÓGICA ---
  const todayTasks = tasks.filter(t => !t.completed && !t.isBrainDump && isSameDay(new Date(t.dueDate), new Date()));
  const focusedTask = tasks.find(t => t.id === focusedTaskId);
  const highEnergyCount = todayTasks.filter(t => t.energy === 'high').length;
  const isOverloaded = highEnergyCount >= 3;

  const tabVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans flex justify-center overflow-x-hidden">
      
      {/* Container Principal com Safe Area Top e Bottom */}
      <div className="w-full max-w-2xl px-4 sm:px-6 pt-[max(env(safe-area-inset-top),2rem)] pb-[calc(env(safe-area-inset-bottom)+5rem)] md:pb-12 relative min-h-screen bg-white dark:bg-zinc-950 md:shadow-2xl md:rounded-3xl md:border border-slate-100 dark:border-zinc-900">
        
        {!focusedTask && currentTab === 'focus' && (
          <header className="mb-6 pt-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
              Agora
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Foco no presente.
            </p>
          </header>
        )}

        {!focusedTask && currentTab === 'focus' && isOverloaded && (
          <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-2xl text-sm">
            ⚠️ <strong>Alerta de Carga:</strong> {highEnergyCount} tarefas pesadas hoje. Tenta adiar algumas.
          </div>
        )}

        <Toaster position="bottom-center" toastOptions={{ className: 'dark:bg-zinc-800 dark:text-white mb-20' }} />
        
        <AnimatePresence mode="wait">
          {focusedTask ? (
            <TaskFocus 
              task={focusedTask}
              onComplete={() => handleToggleComplete(focusedTask.id)}
              onSnooze={() => handleSnooze(focusedTask.id)}
              onClose={() => setFocusedTaskId(null)}
              onAddSubtask={(taskId, title) => {
                setTasks(tasks.map(t => t.id === taskId ? { ...t, subtasks: [...t.subtasks, { id: crypto.randomUUID(), title, completed: false }] } : t));
              }}
              onToggleSubtask={(taskId, subId) => {
                setTasks(tasks.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s) } : t));
              }}
            />
          ) : (
            <motion.div 
              key={currentTab}
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {currentTab === 'focus' && (
                <div className="space-y-8">
                  <HabitTracker 
                    habits={habits} 
                    onToggle={handleToggleHabit} 
                    onAdd={handleAddHabit}
                    onRemove={handleRemoveHabit}
                    onEdit={handleEditHabit} 
                  />
                  <QuickAdd onAdd={handleAddTask} />
                  <TaskList 
                    tasks={todayTasks} 
                    onFocus={setFocusedTaskId}
                    onComplete={handleToggleComplete}
                    onSnooze={handleSnooze}
                  />
                </div>
              )}

              {currentTab === 'routine' && <WeeklyRoutineView routines={routines} setRoutines={setRoutines} />}
              {currentTab === 'calendar' && <CalendarView tasks={tasks.filter(t => !t.isBrainDump)} onFocus={setFocusedTaskId} onComplete={handleToggleComplete} onSnooze={handleSnooze} />}
              {currentTab === 'braindump' && <BrainDumpView tasks={tasks} onAdd={handleAddTask} onFocus={setFocusedTaskId} onComplete={handleToggleComplete} onSnooze={handleSnooze} />}
              {currentTab === 'history' && <HistoryView tasks={tasks.filter(t => !t.isBrainDump)} onComplete={handleToggleComplete} />}
            </motion.div>
          )}
        </AnimatePresence>

        {!focusedTask && <BottomNav currentTab={currentTab} onChange={setCurrentTab} />}
      </div>
    </div>
  );
}