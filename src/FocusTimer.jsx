import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FocusTimer() {
  const [baseMinutes, setBaseMinutes] = useState(15);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Aqui tocaria som (se tiver permissão de áudio)
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
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

  return (
    <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-6 flex flex-col gap-4">
      
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-indigo-800 dark:text-indigo-300 font-semibold mb-1 flex items-center gap-2">
            Mergulho de Foco 
            <button onClick={() => setIsEditing(!isEditing)} className="text-indigo-400 hover:text-indigo-600 transition-colors">
              <Settings size={14} />
            </button>
          </h4>
          <div className="text-5xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          {!isEditing && (
            <button onClick={toggleTimer} className="p-4 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-transform active:scale-90 shadow-md">
              {isRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
            </button>
          )}
          <button onClick={resetTimer} className="p-2 text-indigo-400 hover:text-indigo-600 flex justify-center bg-white/50 dark:bg-black/20 rounded-full">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-indigo-200 dark:border-indigo-500/30 pt-4 mt-2 flex flex-col gap-3"
          >
            <p className="text-xs text-indigo-600/80 dark:text-indigo-300 uppercase tracking-widest font-bold">Ajustar Tempo</p>
            <div className="flex gap-2 w-full">
              <button onClick={() => updateBaseTime(baseMinutes - 5)} className="flex-1 p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded flex items-center justify-center hover:bg-indigo-200 transition-colors">
                <Minus size={16} /> 5m
              </button>
              <div className="flex-1 text-center font-bold text-indigo-800 dark:text-indigo-300 py-1 border-b-2 border-indigo-300">
                {baseMinutes} min
              </div>
              <button onClick={() => updateBaseTime(baseMinutes + 5)} className="flex-1 p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded flex items-center justify-center hover:bg-indigo-200 transition-colors">
                 <Plus size={16} /> 5m
              </button>
            </div>
            
            <div className="flex gap-2 mt-2">
               <button onClick={() => updateBaseTime(10)} className="flex-1 text-xs py-1.5 rounded bg-white dark:bg-black/30 text-indigo-600 font-medium">10m</button>
               <button onClick={() => updateBaseTime(25)} className="flex-1 text-xs py-1.5 rounded bg-white dark:bg-black/30 text-indigo-600 font-medium">25m (Pomo)</button>
               <button onClick={() => updateBaseTime(60)} className="flex-1 text-xs py-1.5 rounded bg-white dark:bg-black/30 text-indigo-600 font-medium">60m</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
