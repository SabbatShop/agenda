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
import AuthView from './AuthView';
import WeeklyRoutineView from './WeeklyRoutineView';
import { supabase } from './supabaseClient';
import { LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [session, setSession] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('adhd-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('adhd-habits');
    const defaultHabits = [
      { id: 'h1', title: 'Beber Água', icon: 'water', completed: false, lastDone: null },
      { id: 'h2', title: 'Tomar Remédio', icon: 'pill', completed: false, lastDone: null },
      { id: 'h3', title: '15 min de Sol', icon: 'sun', completed: false, lastDone: null }
    ];
    return saved ? JSON.parse(saved) : defaultHabits;
  });

  const [routines, setRoutines] = useState(() => {
    const saved = localStorage.getItem('adhd-routines');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [currentTab, setCurrentTab] = useState('focus'); 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleToggleHabit = (id) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        return { 
          ...h, 
          completed: !h.completed, 
          lastDone: !h.completed ? new Date().toDateString() : null 
        };
      }
      return h;
    }));
  };

  const handleAddHabit = (title) => {
    const newHabit = {
      id: crypto.randomUUID(),
      title,
      icon: 'sun',
      completed: false,
      lastDone: null
    };
    setHabits([...habits, newHabit]);
  };

  const handleRemoveHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  useEffect(() => {
    let changed = false;
    const fixedTasks = tasks.map(t => {
      if (t.isBrainDump === 'low' || t.isBrainDump === 'medium' || t.isBrainDump === 'high') {
        changed = true;
        return { ...t, energy: t.isBrainDump, isBrainDump: false };
      }
      return t;
    });
    if (changed) setTasks(fixedTasks);
  }, [tasks]);

  const handleAddTask = (title, timeBlock = 'any', energy = 'low', category = 'none', forceBrainDump = false) => {
    const isBrainDump = currentTab === 'braindump' || forceBrainDump === true;
    
    const newTask = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      completedAt: null,
      dueDate: new Date().toISOString(),
      timeBlock,
      energy,
      category,
      isBrainDump,
      subtasks: []
    };
    setTasks([newTask, ...tasks]);
  };

  const handleToggleComplete = (id) => {
    setTasks(tasks.map(t => t.id === id ? { 
      ...t, 
      completed: !t.completed,
      completedAt: !t.completed ? new Date().toISOString() : null
    } : t));
    if (focusedTaskId === id) setFocusedTaskId(null);
  };

  const handleSnooze = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return { ...t, dueDate: addDays(new Date(t.dueDate), 1).toISOString() };
      }
      return t;
    }));
    if (focusedTaskId === id) setFocusedTaskId(null);
  };

  const handleAddSubtask = (taskId, subtaskTitle) => {
    setTasks(tasks.map(t => t.id === taskId ? {
      ...t, subtasks: [...t.subtasks, { id: crypto.randomUUID(), title: subtaskTitle, completed: false }]
    } : t));
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
        };
      }
      return t;
    }));
  };

  const todayTasks = tasks.filter(t => !t.completed && !t.isBrainDump && isSameDay(new Date(t.dueDate), new Date()));
  const focusedTask = tasks.find(t => t.id === focusedTaskId);
  
  const highEnergyCount = todayTasks.filter(t => t.energy === 'high').length;
  const isOverloaded = highEnergyCount >= 3;

  const tabVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-center items-center text-slate-500 font-medium">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        Autenticando...
      </div>
    );
  }

  if (!session) {
    return <AuthView onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans md:py-12 flex justify-center">
      {/* Alterado px-6 para px-4 sm:px-6 e pb-24 para pb-32 para dar espaço real à BottomNav no mobile */}
      <div className="w-full max-w-2xl px-4 sm:px-6 pt-6 pb-32 md:pb-6 relative min-h-[100dvh] md:min-h-0 bg-white dark:bg-zinc-950 md:shadow-2xl md:rounded-3xl md:border border-slate-100 dark:border-zinc-900 overflow-x-hidden">
        
        {!focusedTask && currentTab === 'focus' && (
          <header className="mb-6 pt-2 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                Agora
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                Coloque para fora da mente.
              </p>
            </div>
            
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 ml-4 group shadow-sm flex items-center justify-center gap-2"
              title="Sair da Conta"
            >
              <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Sair</span>
            </button>
          </header>
        )}

        {!focusedTask && currentTab === 'focus' && (
          <div className="mb-6 rounded-2xl relative">
            <AnimatePresence>
              {isOverloaded && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-2xl flex items-start gap-3 mt-4 text-left"
                >
                  <div className="mt-0.5 text-xl">⚠️</div>
                  <div>
                    <strong className="block text-sm font-bold uppercase tracking-wide">Alerta de Exaustão</strong>
                    <span className="text-sm block mt-1">Você planejou {highEnergyCount} ou mais tarefas pesadas para hoje. Que tal adiar algumas para amanhã e cuidar da sua energia?</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <Toaster position="bottom-center" toastOptions={{ className: 'dark:bg-zinc-800 dark:text-white' }} />
        
        <AnimatePresence mode="wait">
          {focusedTask ? (
            <TaskFocus 
              key="focus-view"
              task={focusedTask}
              onComplete={() => handleToggleComplete(focusedTask.id)}
              onSnooze={() => handleSnooze(focusedTask.id)}
              onClose={() => setFocusedTaskId(null)}
              onAddSubtask={handleAddSubtask}
              onToggleSubtask={handleToggleSubtask}
            />
          ) : (
            <motion.div 
              key={currentTab}
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {currentTab === 'focus' && (
                <div className="space-y-8 pb-10">
                  <HabitTracker 
                    habits={habits} 
                    onToggle={handleToggleHabit} 
                    onAdd={handleAddHabit}
                    onRemove={handleRemoveHabit}
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

              {currentTab === 'routine' && (
                <WeeklyRoutineView 
                  routines={routines}
                  setRoutines={setRoutines}
                />
              )}
              
              {currentTab === 'calendar' && (
                <CalendarView 
                  tasks={tasks.filter(t => !t.isBrainDump)} 
                  onFocus={setFocusedTaskId}
                  onComplete={handleToggleComplete}
                  onSnooze={handleSnooze}
                />
              )}

              {currentTab === 'braindump' && (
                <BrainDumpView 
                  tasks={tasks}
                  onAdd={handleAddTask}
                  onFocus={setFocusedTaskId}
                  onComplete={handleToggleComplete}
                  onSnooze={handleSnooze}
                />
              )}

              {currentTab === 'history' && (
                <HistoryView 
                  tasks={tasks.filter(t => !t.isBrainDump)} 
                  onComplete={handleToggleComplete}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!focusedTask && (
          <BottomNav currentTab={currentTab} onChange={setCurrentTab} />
        )}

      </div>
    </div>
  );
}