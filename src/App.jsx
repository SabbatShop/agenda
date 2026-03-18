import React, { useState, useEffect } from 'react';
import { addDays, isSameDay } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Siren, Layers } from 'lucide-react';
import QuickAdd from './QuickAdd';
import TaskFocus from './TaskFocus';
import TaskList from './TaskList';
import BottomNav from './BottomNav';
import CalendarView from './CalendarView';
import HistoryView from './HistoryView';
import BrainDumpView from './BrainDumpView';
import HabitTracker from './HabitTracker';
import WeeklyRoutineView from './WeeklyRoutineView';
import MoodWidget from './MoodWidget';
import DarkModeToggle from './DarkModeToggle';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// ----- Som de conclusão -----
function playSuccess() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.12 + 0.3);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch (_) {}
}

export default function App() {
  // --- DARK MODE ---
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('adhd-darkmode');
    return saved !== null ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('adhd-darkmode', JSON.stringify(isDark));
  }, [isDark]);

  // --- TAREFAS ---
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('adhd-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // --- HÁBITOS ---
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('adhd-habits');
    const defaultHabits = [
      { id: 'h1', title: 'Beber Água',    emoji: '💧', completed: false, lastDone: null, intervalMinutes: null },
      { id: 'h2', title: 'Tomar Remédio', emoji: '💊', completed: false, lastDone: null, intervalMinutes: null },
      { id: 'h3', title: '15 min de Sol', emoji: '☀️', completed: false, lastDone: null, intervalMinutes: null },
    ];
    return saved ? JSON.parse(saved) : defaultHabits;
  });

  // --- ROTINAS ---
  const [routines, setRoutines] = useState(() => {
    const saved = localStorage.getItem('adhd-routines');
    return saved ? JSON.parse(saved) : [];
  });

  // --- ESTRELA DO DIA ---
  const [starredTaskId, setStarredTaskId] = useState(() => {
    return localStorage.getItem('adhd-starred') || null;
  });

  // --- HUMOR DO DIA ---
  const [moodData, setMoodData] = useState(() => {
    const saved = localStorage.getItem('adhd-mood');
    return saved ? JSON.parse(saved) : null; // { date: string, mood: object }
  });

  // --- MODOS ESPECIAIS ---
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [currentTab, setCurrentTab] = useState('focus');
  const [oneThing, setOneThing] = useState(false);
  const [panicMode, setPanicMode] = useState(false);

  // --- PERSISTÊNCIA ---
  useEffect(() => { localStorage.setItem('adhd-tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('adhd-routines', JSON.stringify(routines)); }, [routines]);
  useEffect(() => { localStorage.setItem('adhd-starred', starredTaskId || ''); }, [starredTaskId]);

  useEffect(() => {
    const todayStr = new Date().toDateString();
    const reset = habits.map(h => h.completed && h.lastDone !== todayStr ? { ...h, completed: false } : h);
    if (JSON.stringify(reset) !== JSON.stringify(habits)) setHabits(reset);
    localStorage.setItem('adhd-habits', JSON.stringify(reset));
  }, [habits]);

  // --- HUMOR: verificar se é de hoje ---
  const todayStr = new Date().toDateString();
  const moodAnsweredToday = moodData?.date === todayStr;

  const handleMoodAnswer = (mood) => {
    const data = { date: todayStr, mood };
    setMoodData(data);
    localStorage.setItem('adhd-mood', JSON.stringify(data));
    toast(`${mood.emoji} ${mood.tip}`, { icon: null, duration: 4000 });
  };

  // --- HÁBITOS ---
  const handleToggleHabit = (id) => {
    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed, lastDone: !h.completed ? todayStr : null } : h));
  };
  const handleAddHabit = (title, intervalMinutes = null, emoji = '✨') => {
    setHabits([...habits, { id: crypto.randomUUID(), title, emoji, completed: false, lastDone: null, intervalMinutes }]);
  };
  const handleEditHabit = (id, newTitle, newIntervalMinutes, newEmoji) => {
    setHabits(habits.map(h => h.id === id ? { ...h, title: newTitle, intervalMinutes: newIntervalMinutes, emoji: newEmoji } : h));
  };
  const handleRemoveHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  // --- TAREFAS ---
  const handleAddTask = (title, timeBlock = 'any', energy = 'low', category = 'none', forceBrainDump = false) => {
    const isBrainDump = currentTab === 'braindump' || forceBrainDump === true;
    const newTask = {
      id: crypto.randomUUID(), title, completed: false, completedAt: null,
      dueDate: new Date().toISOString(), timeBlock, energy, category, isBrainDump, subtasks: [],
    };
    setTasks([newTask, ...tasks]);
  };

  const handleToggleComplete = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) playSuccess();
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null } : t));
    if (focusedTaskId === id) setFocusedTaskId(null);
  };

  const handleSnooze = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, dueDate: addDays(new Date(t.dueDate), 1).toISOString() } : t));
    if (focusedTaskId === id) setFocusedTaskId(null);
  };

  const handleDeleteTask = (id) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (focusedTaskId === id) setFocusedTaskId(null);
    toast((t) => (
      <div className="flex items-center gap-3">
        <span>Tarefa excluída</span>
        <button
          onClick={() => {
            setTasks(prev => [task, ...prev]);
            toast.dismiss(t.id);
          }}
          className="bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
        >
          Desfazer
        </button>
      </div>
    ), { duration: 4000 });
  };

  // Adicionar tarefa para um dia específico (aba Agenda)
  const handleAddForDate = (title, date) => {
    const newTask = {
      id: crypto.randomUUID(), title, completed: false, completedAt: null,
      dueDate: date.toISOString(), timeBlock: 'any', energy: 'low',
      category: 'none', isBrainDump: false, subtasks: [],
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleStarTask = (id) => {
    setStarredTaskId(prev => prev === id ? null : id);
  };

  // Promover Brain Dump → Hoje
  const handlePromoteToday = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isBrainDump: false, dueDate: new Date().toISOString() } : t));
    toast('📅 Tarefa movida para hoje!', { duration: 2500 });
  };

  // --- FILTROS ---
  const todayTasks = tasks.filter(t => !t.completed && !t.isBrainDump && isSameDay(new Date(t.dueDate), new Date()));
  const focusedTask = tasks.find(t => t.id === focusedTaskId);
  const highEnergyCount = todayTasks.filter(t => t.energy === 'high').length;
  const isOverloaded = highEnergyCount >= 3;

  // Modo Pânico: as 3 tarefas mais urgentes (pesadas primeiro, depois outras)
  const panicTasks = [...todayTasks]
    .sort((a, b) => {
      const energyOrder = { high: 0, medium: 1, low: 2 };
      return (energyOrder[a.energy] ?? 2) - (energyOrder[b.energy] ?? 2);
    })
    .slice(0, 3);

  const visibleTasks = panicMode ? panicTasks : todayTasks;

  const tabVariants = { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 10 } };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans flex justify-center overflow-x-hidden">
      <div className="w-full max-w-2xl px-4 sm:px-6 pt-[max(env(safe-area-inset-top),2rem)] pb-[calc(env(safe-area-inset-bottom)+5rem)] md:pb-12 relative min-h-screen bg-white dark:bg-zinc-950 md:shadow-2xl md:rounded-3xl md:border border-slate-100 dark:border-zinc-900">

        {/* HEADER da aba Hoje */}
        {!focusedTask && currentTab === 'focus' && (
          <header className="mb-6 pt-2 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Agora</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Foco no presente.</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {/* Modo Uma Coisa Só */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => { setOneThing(!oneThing); setPanicMode(false); }}
                title={oneThing ? 'Mostrar todas as tarefas' : 'Modo: Uma Coisa Só'}
                className={`p-2 rounded-xl transition-colors ${oneThing ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-300 hover:bg-slate-200'}`}
              >
                <Layers size={20} />
              </motion.button>
              {/* Modo Pânico */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => { setPanicMode(!panicMode); setOneThing(false); }}
                title={panicMode ? 'Sair do modo pânico' : 'Modo Pânico — mostrar só 3 tarefas'}
                className={`p-2 rounded-xl transition-colors ${panicMode ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-300 hover:bg-slate-200'}`}
              >
                <Siren size={20} />
              </motion.button>
              {/* Dark mode */}
              <DarkModeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
            </div>
          </header>
        )}

        {/* Header fora da aba focus */}
        {!focusedTask && currentTab !== 'focus' && (
          <div className="flex justify-end mb-4 pt-2">
            <DarkModeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
          </div>
        )}

        {/* Alerta de sobrecarga */}
        {!focusedTask && currentTab === 'focus' && isOverloaded && !panicMode && (
          <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-2xl text-sm">
            ⚠️ <strong>Alerta de Carga:</strong> {highEnergyCount} tarefas pesadas hoje. Tenta adiar algumas ou ative o 🚨 Modo Pânico.
          </div>
        )}

        {/* Banner modo pânico */}
        <AnimatePresence>
          {panicMode && !focusedTask && currentTab === 'focus' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-red-500/10 border border-red-400/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-semibold"
            >
              🚨 <strong>Modo Pânico ativado</strong> — mostrando só as {panicTasks.length} tarefas mais importantes. Respira. Uma de cada vez.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Banner modo uma coisa só */}
        <AnimatePresence>
          {oneThing && !focusedTask && currentTab === 'focus' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-indigo-500/10 border border-indigo-400/30 text-indigo-600 dark:text-indigo-400 p-4 rounded-2xl text-sm font-semibold"
            >
              🎯 <strong>Modo Uma Coisa Só</strong> — ignore o resto. Foco total nessa.
            </motion.div>
          )}
        </AnimatePresence>

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
                  {/* Widget de humor se ainda não respondeu hoje */}
                  <AnimatePresence>
                    {!moodAnsweredToday && (
                      <MoodWidget onAnswer={handleMoodAnswer} />
                    )}
                  </AnimatePresence>

                  <HabitTracker
                    habits={habits}
                    onToggle={handleToggleHabit}
                    onAdd={handleAddHabit}
                    onRemove={handleRemoveHabit}
                    onEdit={handleEditHabit}
                  />
                  <QuickAdd onAdd={handleAddTask} />
                  <TaskList
                    tasks={visibleTasks}
                    onFocus={setFocusedTaskId}
                    onComplete={handleToggleComplete}
                    onSnooze={handleSnooze}
                    onDelete={handleDeleteTask}
                    onStar={handleStarTask}
                    starredTaskId={starredTaskId}
                    oneThing={oneThing}
                  />
                </div>
              )}

              {currentTab === 'routine' && <WeeklyRoutineView routines={routines} setRoutines={setRoutines} />}
              {currentTab === 'calendar' && (
                <CalendarView
                tasks={tasks.filter(t => !t.isBrainDump)}
                onFocus={setFocusedTaskId}
                onComplete={handleToggleComplete}
                onSnooze={handleSnooze}
                onDelete={handleDeleteTask}
                onAddForDate={handleAddForDate}
              />
              )}
              {currentTab === 'braindump' && (
                <BrainDumpView
                  tasks={tasks}
                  onAdd={handleAddTask}
                  onFocus={setFocusedTaskId}
                  onComplete={handleToggleComplete}
                  onSnooze={handleSnooze}
                  onPromoteToday={handlePromoteToday}
                />
              )}
              {currentTab === 'history' && (
                <HistoryView tasks={tasks.filter(t => !t.isBrainDump)} onComplete={handleToggleComplete} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!focusedTask && <BottomNav currentTab={currentTab} onChange={setCurrentTab} />}
      </div>
    </div>
  );
}