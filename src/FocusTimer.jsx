import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Plus, Minus, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PHASES = {
  focus:      { label: 'Foco',        defaultMin: 25, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/20' },
  shortBreak: { label: 'Pausa Curta', defaultMin: 5,  color: 'text-green-600 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-500/10',   border: 'border-green-100 dark:border-green-500/20'   },
  longBreak:  { label: 'Pausa Longa', defaultMin: 15, color: 'text-sky-600 dark:text-sky-400',       bg: 'bg-sky-50 dark:bg-sky-500/10',       border: 'border-sky-100 dark:border-sky-500/20'       },
};

function playDing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch (_) {}
}

export default function FocusTimer() {
  const [phase, setPhase] = useState('focus');
  const [sessionCount, setSessionCount] = useState(0); // sessões de foco completas
  const [baseMinutes, setBaseMinutes] = useState(PHASES.focus.defaultMin);
  const [timeLeft, setTimeLeft] = useState(PHASES.focus.defaultMin * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const wasRunningRef = useRef(false);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playDing();
      advancePhase();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const advancePhase = () => {
    setPhase(prev => {
      if (prev === 'focus') {
        const newCount = sessionCount + 1;
        setSessionCount(newCount);
        if (newCount % 4 === 0) {
          setTimeLeft(PHASES.longBreak.defaultMin * 60);
          return 'longBreak';
        } else {
          setTimeLeft(PHASES.shortBreak.defaultMin * 60);
          return 'shortBreak';
        }
      } else {
        setTimeLeft(PHASES.focus.defaultMin * 60);
        return 'focus';
      }
    });
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setPhase('focus');
    setSessionCount(0);
    setTimeLeft(baseMinutes * 60);
    setIsEditing(false);
  };

  const updateBaseTime = (newMinutes) => {
    if (newMinutes < 1) newMinutes = 1;
    if (newMinutes > 120) newMinutes = 120;
    setBaseMinutes(newMinutes);
    setTimeLeft(newMinutes * 60);
    setIsRunning(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const total   = (phase === 'focus' ? baseMinutes : PHASES[phase].defaultMin) * 60;
  const progress = total > 0 ? (total - timeLeft) / total : 0;

  const currentPhase = PHASES[phase];
  const pomodoroIcons = Array.from({ length: 4 }).map((_, i) => i < (sessionCount % 4 || (sessionCount > 0 && sessionCount % 4 === 0 && phase !== 'focus' ? 4 : 0)) ? '🍅' : '⬜');

  return (
    <div className={`${currentPhase.bg} border ${currentPhase.border} rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-500`}>

      {/* Cabeçalho: fase + sessões */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold uppercase tracking-widest ${currentPhase.color}`}>{currentPhase.label}</span>
            <button onClick={() => setIsEditing(!isEditing)} className={`${currentPhase.color} opacity-60 hover:opacity-100 transition-opacity`}>
              <Settings size={12} />
            </button>
          </div>
          <div className={`text-5xl font-mono font-bold ${currentPhase.color}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {!isEditing && (
            <button onClick={toggleTimer} className={`p-4 ${phase === 'focus' ? 'bg-indigo-500 hover:bg-indigo-600' : phase === 'shortBreak' ? 'bg-green-500 hover:bg-green-600' : 'bg-sky-500 hover:bg-sky-600'} text-white rounded-full transition-transform active:scale-90 shadow-md`}>
              {isRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
            </button>
          )}
          <button onClick={resetTimer} className={`p-2 ${currentPhase.color} opacity-60 hover:opacity-100 flex justify-center bg-white/50 dark:bg-black/20 rounded-full transition-colors`}>
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${phase === 'focus' ? 'bg-indigo-500' : phase === 'shortBreak' ? 'bg-green-500' : 'bg-sky-500'}`}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Contador de sessões */}
      <div className="flex items-center gap-2">
        <Coffee size={13} className={`${currentPhase.color} opacity-70`} />
        <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
          {sessionCount} {sessionCount === 1 ? 'sessão' : 'sessões'} completas
        </span>
        <span className="ml-auto text-base tracking-wide">
          {pomodoroIcons.join('')}
        </span>
      </div>

      {/* Painel de ajuste */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-black/10 dark:border-white/10 pt-4 mt-1 flex flex-col gap-3"
          >
            <p className={`text-xs uppercase tracking-widest font-bold ${currentPhase.color} opacity-70`}>Ajustar tempo de foco</p>
            <div className="flex gap-2 w-full">
              <button onClick={() => updateBaseTime(baseMinutes - 5)} className={`flex-1 p-2 ${currentPhase.bg} ${currentPhase.color} rounded flex items-center justify-center border ${currentPhase.border}`}>
                <Minus size={16} /> 5m
              </button>
              <div className={`flex-1 text-center font-bold ${currentPhase.color} py-1 border-b-2 border-current`}>
                {baseMinutes} min
              </div>
              <button onClick={() => updateBaseTime(baseMinutes + 5)} className={`flex-1 p-2 ${currentPhase.bg} ${currentPhase.color} rounded flex items-center justify-center border ${currentPhase.border}`}>
                <Plus size={16} /> 5m
              </button>
            </div>
            <div className="flex gap-2 mt-1">
              <button onClick={() => updateBaseTime(10)} className={`flex-1 text-xs py-1.5 rounded bg-white dark:bg-black/30 ${currentPhase.color} font-medium`}>10m</button>
              <button onClick={() => updateBaseTime(25)} className={`flex-1 text-xs py-1.5 rounded bg-white dark:bg-black/30 ${currentPhase.color} font-medium`}>25m (Pomo)</button>
              <button onClick={() => updateBaseTime(50)} className={`flex-1 text-xs py-1.5 rounded bg-white dark:bg-black/30 ${currentPhase.color} font-medium`}>50m</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
