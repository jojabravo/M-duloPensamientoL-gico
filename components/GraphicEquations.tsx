
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../audio';
import { StudentProfile } from '../types';
import { supabase } from '../src/supabaseClient';
import Calculator from './Calculator';

interface Props {
  student: StudentProfile;
  onBack: () => void;
  onComplete: (newProgress: number) => void;
}

const DefinitionScreen = ({ title, text, onNext }: { title: string, text: string, onNext: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border-8 border-emerald-100 max-w-2xl text-center space-y-6"
  >
    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-4xl mx-auto">
      <i className="fas fa-book-open"></i>
    </div>
    <h2 className="text-3xl font-black text-gray-800 tracking-tighter">{title}</h2>
    <p className="text-lg text-gray-600 font-medium leading-relaxed italic">
      "{text}"
    </p>
    <button 
      onClick={() => { playSound('pop'); onNext(); }}
      className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-3 mx-auto"
    >
      <span>ENTENDIDO, ¡VAMOS!</span>
      <i className="fas fa-arrow-right"></i>
    </button>
  </motion.div>
);

const SuccessMessage = ({ studentName, onNext }: { studentName: string, onNext: () => void }) => (
  <motion.div 
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-emerald-600/20 backdrop-blur-sm"
  >
    <div className="bg-white p-8 rounded-[3rem] shadow-2xl text-center max-w-sm border-8 border-emerald-100">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-4xl mx-auto mb-6">
        <i className="fas fa-check-circle"></i>
      </div>
      <h3 className="text-2xl font-black text-gray-800 mb-2">¡Increíble, {studentName}!</h3>
      <p className="text-gray-600 font-medium mb-8">Has resuelto el sistema con éxito.</p>
      <button 
        onClick={() => { playSound('pop'); onNext(); }}
        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all"
      >
        SIGUIENTE NIVEL
      </button>
    </div>
  </motion.div>
);

const GraphicEquations: React.FC<Props> = ({ student, onBack, onComplete }) => {
  const initialProgress = student.progreso_ecuaciones_graficas || 0;
  const [view, setView] = useState<'intro' | 'game' | 'medal'>(
    initialProgress >= 100 ? 'medal' : (initialProgress === 0 ? 'intro' : 'game')
  );
  const [progress, setProgress] = useState(initialProgress);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateProgress = async (levelIndex: number) => {
    const calculatedProgress = (levelIndex + 1) * 20;
    if (calculatedProgress <= progress) return; // Ya superó este nivel o uno superior
    
    const newProgress = Math.min(100, calculatedProgress);
    setProgress(newProgress);
    onComplete(newProgress);
    
    if (newProgress >= 100) {
      setView('medal');
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn px-4 py-8">
      <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-emerald-50 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-emerald-500 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl rotate-12">
            <i className="fas fa-scale-balanced"></i>
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => { playSound('pop'); onBack(); }}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/20 px-4 py-1.5 rounded-full mb-2 inline-block">
                  Capítulo 2 • Bloque 2
                </span>
                <h3 className="text-3xl font-black tracking-tight">Ecuaciones Gráficas</h3>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Tiempo</span>
                <span className="text-xl font-black text-white font-mono">{formatTime(timer)}</span>
              </div>
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center border border-white/20">
                <span className="text-[10px] font-black text-white/60 uppercase">Progreso</span>
                <span className="text-xl font-black text-white">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 bg-emerald-50/30 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {view === 'intro' && (
              <DefinitionScreen 
                title="Reto: Ecuaciones Gráficas"
                text="Si sumas todos los valores de los objetos en una fila o columna obtendrás el total indicado. Tu misión es descubrir el valor de cada objeto usando tu razonamiento lógico. ¡A medida que avances, el desafío será mayor!"
                onNext={() => { setView('game'); setIsTimerActive(true); }}
              />
            )}

            {view === 'game' && (
              <GraphicEquationsActivity 
                studentName={student.Nombre || ''}
                progress={progress}
                updateProgress={updateProgress}
                onAllComplete={() => setView('medal')}
                initialLevel={Math.min(4, Math.floor(progress / 20))}
              />
            )}

            {view === 'medal' && (
              <MedalCelebration 
                studentName={student.Nombre || ''} 
                onBack={onBack} 
                onReview={() => setView('game')} 
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const GraphicEquationsActivity: React.FC<{ 
  studentName: string, 
  progress: number,
  updateProgress: (levelIndex: number) => void,
  onAllComplete: () => void,
  initialLevel: number
}> = ({ studentName, progress, updateProgress, onAllComplete, initialLevel }) => {
  const [level, setLevel] = useState(initialLevel);
  const [solved, setSolved] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [showCalculator, setShowCalculator] = useState(false);

  const levels = [
    {
      size: 3,
      objects: [
        { id: 'apple', icon: 'fa-apple-alt', color: 'text-red-500', value: 5 },
        { id: 'banana', icon: 'fa-pepper-hot', color: 'text-orange-500', value: 3 },
        { id: 'cherry', icon: 'fa-carrot', color: 'text-orange-600', value: 2 }
      ],
      grid: [
        ['apple', 'apple', 'apple'],
        ['apple', 'banana', 'banana'],
        ['cherry', 'banana', 'apple']
      ]
    },
    {
      size: 3,
      objects: [
        { id: 'pizza', icon: 'fa-pizza-slice', color: 'text-yellow-600', value: 10 },
        { id: 'burger', icon: 'fa-hamburger', color: 'text-amber-800', value: 7 },
        { id: 'fries', icon: 'fa-ice-cream', color: 'text-pink-400', value: 4 }
      ],
      grid: [
        ['burger', 'burger', 'burger'],
        ['pizza', 'burger', 'fries'],
        ['fries', 'pizza', 'fries']
      ]
    },
    {
      size: 4,
      objects: [
        { id: 'rocket', icon: 'fa-rocket', color: 'text-blue-500', value: 12 },
        { id: 'ufo', icon: 'fa-user-astronaut', color: 'text-gray-500', value: 9 },
        { id: 'planet', icon: 'fa-globe-americas', color: 'text-green-600', value: 6 },
        { id: 'star', icon: 'fa-star', color: 'text-yellow-400', value: 3 }
      ],
      grid: [
        ['star', 'star', 'star', 'star'],
        ['rocket', 'star', 'ufo', 'planet'],
        ['ufo', 'ufo', 'star', 'rocket'],
        ['planet', 'rocket', 'star', 'star']
      ]
    },
    {
      size: 4,
      objects: [
        { id: 'ghost', icon: 'fa-ghost', color: 'text-purple-400', value: 15 },
        { id: 'skull', icon: 'fa-skull', color: 'text-gray-400', value: 10 },
        { id: 'bat', icon: 'fa-spider', color: 'text-black', value: 5 },
        { id: 'cat', icon: 'fa-cat', color: 'text-orange-900', value: 2 }
      ],
      grid: [
        ['skull', 'skull', 'skull', 'skull'],
        ['ghost', 'cat', 'cat', 'cat'],
        ['bat', 'bat', 'ghost', 'skull'],
        ['cat', 'ghost', 'bat', 'skull']
      ]
    },
    {
      size: 5,
      objects: [
        { id: 'soccer', icon: 'fa-futbol', color: 'text-gray-800', value: 20 },
        { id: 'basket', icon: 'fa-basketball-ball', color: 'text-orange-600', value: 15 },
        { id: 'football', icon: 'fa-football-ball', color: 'text-amber-900', value: 10 },
        { id: 'baseball', icon: 'fa-baseball-ball', color: 'text-gray-400', value: 5 },
        { id: 'tennis', icon: 'fa-volleyball-ball', color: 'text-lime-500', value: 2 }
      ],
      grid: [
        ['baseball', 'baseball', 'baseball', 'baseball', 'baseball'],
        ['soccer', 'basket', 'football', 'baseball', 'tennis'],
        ['tennis', 'tennis', 'soccer', 'basket', 'football'],
        ['football', 'baseball', 'tennis', 'soccer', 'basket'],
        ['basket', 'soccer', 'football', 'tennis', 'baseball']
      ]
    }
  ];

  const currentLevel = levels[level];

  if (!currentLevel) return null;

  const getRowTotal = (rowIndex: number) => {
    return currentLevel.grid[rowIndex].reduce((sum, objId) => {
      const obj = currentLevel.objects.find(o => o.id === objId);
      return sum + (obj?.value || 0);
    }, 0);
  };

  const getColTotal = (colIndex: number) => {
    let sum = 0;
    for (let i = 0; i < currentLevel.size; i++) {
      const objId = currentLevel.grid[i][colIndex];
      const obj = currentLevel.objects.find(o => o.id === objId);
      sum += (obj?.value || 0);
    }
    return sum;
  };

  const checkLevel = () => {
    const isCorrect = currentLevel.objects.every(obj => {
      return parseInt(inputs[obj.id] || '0') === obj.value;
    });

    if (isCorrect) {
      playSound('pop');
      updateProgress(level);
      if (level < levels.length - 1) {
        setSolved(true);
      } else {
        onAllComplete();
      }
    } else {
      playSound('error');
    }
  };

  const handleNextLevel = () => {
    setSolved(false);
    setLevel(level + 1);
    setInputs({});
  };

  const handlePrevLevel = () => {
    setSolved(false);
    setLevel(level - 1);
    setInputs({});
  };

  const canGoForward = (level < levels.length - 1) && (solved || level < Math.floor(progress / 20));
  const canGoBack = level > 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border-4 border-emerald-100 flex flex-col items-center w-full max-w-5xl relative"
    >
      {/* Navigation Arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 md:-left-6 z-20">
        <button
          onClick={() => canGoBack && (playSound('pop'), handlePrevLevel())}
          disabled={!canGoBack}
          className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-xl transition-all border-4 ${
            canGoBack 
              ? 'bg-white border-emerald-100 text-emerald-600 hover:scale-110 active:scale-95 cursor-pointer' 
              : 'bg-gray-50 border-gray-100 text-gray-200 cursor-not-allowed'
          }`}
        >
          <i className="fas fa-chevron-left text-xl md:text-2xl"></i>
        </button>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-4 md:-right-6 z-20">
        <button
          onClick={() => canGoForward && (playSound('pop'), handleNextLevel())}
          disabled={!canGoForward}
          className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-xl transition-all border-4 ${
            canGoForward 
              ? 'bg-emerald-600 border-emerald-200 text-white hover:scale-110 active:scale-95 cursor-pointer' 
              : 'bg-gray-50 border-gray-100 text-gray-200 cursor-not-allowed'
          }`}
        >
          <i className="fas fa-chevron-right text-xl md:text-2xl"></i>
        </button>
      </div>

      <h3 className="text-2xl font-black text-gray-800 mb-2">Reto: Ecuaciones Gráficas</h3>
      <div className="flex gap-2 mb-6">
        {levels.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full ${level >= i ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
        ))}
      </div>
      <p className="text-gray-500 font-medium mb-8 text-center max-w-2xl">
        Nivel {level + 1}: Cuadrícula de {currentLevel.size}x{currentLevel.size}. 
        Descubre el valor de cada objeto para que las sumas de filas y columnas coincidan.
      </p>

      <div className="flex flex-col lg:flex-row gap-12 items-start w-full justify-center">
        {/* Grid */}
        <div className="relative bg-gray-50 p-4 rounded-3xl border-2 border-gray-100 shadow-inner">
          <div 
            className="grid gap-2"
            style={{ 
              gridTemplateColumns: `repeat(${currentLevel.size + 1}, minmax(0, 1fr))` 
            }}
          >
            {/* Grid Cells */}
            {currentLevel.grid.map((row, rIdx) => (
              <React.Fragment key={rIdx}>
                {row.map((objId, cIdx) => {
                  const obj = currentLevel.objects.find(o => o.id === objId);
                  return (
                    <div key={cIdx} className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100">
                      <i className={`fas ${obj?.icon} ${obj?.color} text-xl md:text-2xl`}></i>
                    </div>
                  );
                })}
                {/* Row Total */}
                <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center font-black text-emerald-600 text-lg md:text-xl border-l-2 border-emerald-100 ml-2">
                  {getRowTotal(rIdx)}
                </div>
              </React.Fragment>
            ))}
            
            {/* Column Totals */}
            {Array.from({ length: currentLevel.size }).map((_, cIdx) => (
              <div key={cIdx} className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center font-black text-emerald-600 text-lg md:text-xl border-t-2 border-emerald-100 mt-2">
                {getColTotal(cIdx)}
              </div>
            ))}
            <button 
              onClick={() => setShowCalculator(!showCalculator)}
              className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-gray-300 hover:text-emerald-500 hover:scale-110 transition-all active:scale-95"
            >
              <i className="fas fa-calculator text-2xl"></i>
            </button>
          </div>
        </div>

        {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}

        {/* Values Input */}
        <div className="flex flex-col gap-4 bg-emerald-50/50 p-6 rounded-3xl border-2 border-emerald-100 w-full lg:w-64">
          <h4 className="font-black text-gray-700 text-center mb-2 uppercase tracking-widest text-xs">Valores</h4>
          {currentLevel.objects.map(obj => (
            <div key={obj.id} className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-emerald-100">
              <div className="flex items-center gap-3">
                <i className={`fas ${obj.icon} ${obj.color} text-xl`}></i>
                <span className="font-black text-gray-400">=</span>
              </div>
              <input 
                type="number"
                value={inputs[obj.id] || ''}
                onChange={e => setInputs({...inputs, [obj.id]: e.target.value})}
                className="w-16 h-10 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-center font-black text-emerald-600 focus:border-emerald-500 outline-none"
              />
            </div>
          ))}
          <button 
            onClick={checkLevel}
            className="mt-4 w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all"
          >
            VERIFICAR
          </button>
        </div>
      </div>

      {solved && <SuccessMessage studentName={studentName} onNext={handleNextLevel} />}
    </motion.div>
  );
};

const MedalCelebration: React.FC<{ studentName: string, onBack: () => void, onReview: () => void }> = ({ studentName, onBack, onReview }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center relative"
    >
      {/* Confetti-like particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{ 
            scale: [0, 1, 0], 
            x: (Math.random() - 0.5) * 400, 
            y: (Math.random() - 0.5) * 400 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            delay: i * 0.2,
            ease: "easeOut"
          }}
          className={`absolute w-4 h-4 rounded-full ${i % 2 === 0 ? 'bg-emerald-400' : 'bg-yellow-400'} opacity-50`}
        />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 100 }}
        className="relative mb-12"
      >
        <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-30 animate-pulse"></div>
        <div className="w-72 h-72 bg-gradient-to-b from-emerald-300 to-emerald-600 rounded-full border-8 border-emerald-200 shadow-[0_0_60px_rgba(16,185,129,0.6)] flex flex-col items-center justify-center relative z-10 overflow-hidden">
          {/* Shine effect */}
          <motion.div 
            animate={{ x: [-200, 200] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
          />
          
          <i className="fas fa-award text-9xl text-white mb-4 drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]"></i>
          <div className="bg-white/20 backdrop-blur-md px-8 py-3 rounded-full border border-white/40 shadow-inner">
            <span className="text-white font-black tracking-[0.2em] text-sm uppercase">Insignia Obtenida</span>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4 mb-12">
        <h2 className="text-6xl font-black text-gray-800 tracking-tighter">
          ¡MAESTRO DEL <span className="text-emerald-600 uppercase">EQUILIBRIO</span>!
        </h2>
        <div className="inline-block bg-emerald-100 px-6 py-2 rounded-2xl border-2 border-emerald-200">
          <span className="text-emerald-700 font-black text-xl">EQUILIBRISTA LÓGICO DE ÉLITE</span>
        </div>
      </div>

      <p className="text-xl text-gray-600 font-medium max-w-lg mb-12 leading-relaxed">
        ¡Felicitaciones, <span className="font-black text-gray-800">{studentName.toUpperCase()}</span>! 
        Has demostrado una precisión matemática asombrosa resolviendo todos los sistemas gráficos. 
        ¡Tu mente es una balanza perfecta!
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => { playSound('pop'); onBack(); }}
          className="group relative px-12 py-5 bg-gray-800 text-white rounded-[2rem] font-black text-xl shadow-xl hover:bg-black hover:scale-105 transition-all overflow-hidden"
        >
          <span className="relative z-10">VOLVER AL MENÚ</span>
        </button>

        <button 
          onClick={() => { playSound('pop'); onReview(); }}
          className="group relative px-12 py-5 bg-white text-emerald-600 border-4 border-emerald-100 rounded-[2rem] font-black text-xl shadow-xl hover:border-emerald-200 hover:scale-105 transition-all overflow-hidden"
        >
          <span className="relative z-10">REPASAR RETOS</span>
        </button>
      </div>
    </motion.div>
  );
};

export default GraphicEquations;
