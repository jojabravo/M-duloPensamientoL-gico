import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../audio';
import { StudentProfile } from '../types';
import Calculator from './Calculator';

interface Props {
  student: StudentProfile;
  onBack: () => void;
  onComplete: (newProg: number) => void;
}

const NumericPyramids: React.FC<Props> = ({ student, onBack, onComplete }) => {
  const initialLevel = student.progreso_piramides === 100 ? 4 : Math.max(1, Math.floor((student.progreso_piramides || 0) / 25) + 1);
  const [level, setLevel] = useState(initialLevel);
  const [unlockedLevel, setUnlockedLevel] = useState(initialLevel);
  const [pyramid, setPyramid] = useState<(number | null)[]>([]);
  const [solution, setSolution] = useState<number[]>([]);
  const [userInputs, setUserInputs] = useState<(string)[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');

  // Sync unlocked level whenever database progress updates
  useEffect(() => {
    const currentMax = student.progreso_piramides === 100 ? 4 : Math.max(1, Math.floor((student.progreso_piramides || 0) / 25) + 1);
    setUnlockedLevel(prev => Math.max(prev, currentMax));
  }, [student.progreso_piramides]);

  useEffect(() => {
    generatePyramid(level);
  }, [level]);

  const generatePyramid = (lvl: number) => {
    let flatSolution: number[] = [];
    let puzzle: (number | null)[] = [];
    let rows = lvl + 2;

    if (lvl === 1) {
      // Level 1: Blaise Pascal's Triangle - 20 rows
      rows = 20;
      let pascal: number[][] = [];
      for (let i = 0; i < rows; i++) {
        pascal[i] = new Array(i + 1);
        for (let j = 0; j < i + 1; j++) {
          if (j === 0 || j === i) {
            pascal[i][j] = 1;
          } else {
            pascal[i][j] = pascal[i - 1][j - 1] + pascal[i - 1][j];
          }
        }
      }
      flatSolution = pascal.flat();
      
      // Copy to puzzle and hide strategic indices so students discover the summation rules
      puzzle = [...flatSolution];
      
      // We specify key coordinates (row, col) (both 0-indexed) to hide
      const hideCoords = [
        { r: 2, c: 1 },  // Value 2 (sums 1 + 1)
        { r: 3, c: 1 },  // Value 3 (sums 1 + 2)
        { r: 3, c: 2 },  // Value 3 (sums 2 + 1)
        { r: 4, c: 2 },  // Value 6 (sums 3 + 3)
        { r: 5, c: 1 },  // Value 5 (sums 1 + 4)
        { r: 5, c: 3 },  // Value 10 (sums 6 + 4)
        { r: 6, c: 3 },  // Value 20 (sums 10 + 10)
        { r: 7, c: 2 },  // Value 21 (sums 6 + 15)
        { r: 8, c: 4 },  // Value 70 (sums 35 + 35)
        { r: 10, c: 2 }, // Value 45 (sums 9 + 36)
        { r: 12, c: 3 }, // Value 220 (sums 55 + 165)
        { r: 15, c: 2 }, // Value 105 (sums 14 + 91)
        { r: 19, c: 1 }, // Value 19 (sums 1 + 18)
        { r: 19, c: 2 }  // Value 171 (sums 18 + 153)
      ];

      hideCoords.forEach(coord => {
        const idx = (coord.r * (coord.r + 1)) / 2 + coord.c;
        puzzle[idx] = null;
      });
    } else {
      // Levels 2, 3, 4: rows = lvl + 2 (4, 5, and 6 rows respectively)
      // Generate a random bottom-up numeric pyramid
      const base = Array.from({ length: rows }, () => Math.floor(Math.random() * 10) + 1);
      
      let fullPyramid: number[][] = [base];
      for (let r = 1; r < rows; r++) {
        const nextRow = [];
        const prevRow = fullPyramid[r - 1];
        for (let i = 0; i < prevRow.length - 1; i++) {
          nextRow.push(prevRow[i] + prevRow[i + 1]);
        }
        fullPyramid.push(nextRow);
      }
      flatSolution = fullPyramid.reverse().flat();
      
      // Balanced hide counts for high-fidelity playability
      const numToHide = lvl === 2 ? 4 : lvl === 3 ? 6 : 9;
      puzzle = [...flatSolution];
      const hideableIndices = Array.from({ length: puzzle.length - 1 }, (_, i) => i + 1);
      
      // Shuffle indices
      for (let i = hideableIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [hideableIndices[i], hideableIndices[j]] = [hideableIndices[j], hideableIndices[i]];
      }
      
      for (let i = 0; i < numToHide; i++) {
        puzzle[hideableIndices[i]] = null;
      }
    }
    
    setSolution(flatSolution);
    setPyramid(puzzle);
    setUserInputs(puzzle.map(v => v !== null ? String(v) : ''));
    setGameState('playing');
  };

  const handleInputChange = (index: number, val: string) => {
    if (pyramid[index] !== null || gameState === 'won') return;
    const newInputs = [...userInputs];
    newInputs[index] = val;
    setUserInputs(newInputs);
    
    // Play quick feedback pop
    if (Number(val) === solution[index]) {
      playSound('pop');
      checkWin(newInputs);
    }
  };

  const checkWin = (currentInputs: string[]) => {
    const isComplete = currentInputs.every((val, idx) => {
      if (solution[idx] === null) return true;
      return Number(val) === solution[idx];
    });

    if (isComplete) {
      const newProgress = Math.round((level / 4) * 100);
      onComplete(newProgress);
      // Elevate maximum unlocked level locally
      setUnlockedLevel(prev => Math.max(prev, Math.min(4, level + 1)));
      
      if (level < 4) {
        playSound('success');
        setTimeout(() => {
          setLevel(prev => Math.min(4, prev + 1));
        }, 1500);
      } else {
        setGameState('won');
        playSound('success');
      }
    }
  };

  const renderPyramid = () => {
    const rows = level === 1 ? 20 : level + 2;
    let index = 0;
    const pyramidRows = [];

    // Calculate sizing to stay clean and highly mobile-responsive. Let's use 44px on mobile for level 1 (w-11)
    const inputSizeClass = level === 1
      ? 'w-11 h-11 md:w-14 md:h-14 text-[10px] md:text-xs border shadow-sm'
      : rows >= 5
      ? 'w-10 h-10 md:w-14 md:h-14 text-sm md:text-lg border-2 shadow-sm'
      : 'w-14 h-14 md:w-18 md:h-18 text-lg md:text-xl border-4 shadow-md';

    for (let r = 1; r <= rows; r++) {
      const blocks = [];
      for (let b = 0; b < r; b++) {
        const currentIdx = index++;
        const isInitial = pyramid[currentIdx] !== null;
        const isCorrect = Number(userInputs[currentIdx]) === solution[currentIdx];
        
        blocks.push(
          <div key={currentIdx} className="relative">
            <input
              type="text"
              value={userInputs[currentIdx] || ''}
              onChange={(e) => handleInputChange(currentIdx, e.target.value)}
              disabled={isInitial || gameState === 'won'}
              placeholder={isInitial ? "" : "?"}
              className={`rounded-xl text-center font-black transition-all outline-none ${inputSizeClass} ${
                isInitial 
                  ? 'bg-emerald-600 border-emerald-700 text-white' 
                  : isCorrect
                  ? 'bg-white border-emerald-500 text-emerald-600 font-bold focus:ring-4 focus:ring-emerald-100'
                  : 'bg-white border-emerald-100 text-slate-400 placeholder-slate-300 focus:border-emerald-400 focus:bg-slate-50/50'
              }`}
            />
          </div>
        );
      }
      pyramidRows.push(
        <div key={r} className="flex justify-center items-center gap-1 md:gap-1.5">
          {/* Row Number Identifier */}
          <div className="w-8 shrink-0 text-right pr-1.5 text-[9px] md:text-xs font-extrabold text-emerald-600 font-mono">
            {r}
          </div>
          {blocks}
        </div>
      );
    }

    return (
      <div className={`overflow-auto w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl ${level === 1 || level >= 3 ? 'max-h-[60vh]' : ''}`}>
        <div className="flex flex-col gap-1 md:gap-1.5 min-w-max mx-auto p-2">
          {pyramidRows}
        </div>
      </div>
    );
  };

  // Check if Level 1 (Pascal's Triangle) is solved
  const isPascalSolved = (student.progreso_piramides || 0) >= 25 || unlockedLevel > 1;

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn px-4 py-8">
      <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-emerald-50 overflow-hidden mb-8">
        {/* Header Banner */}
        <div className="bg-emerald-500 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl rotate-12">
            <i className="fas fa-mountain"></i>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => { playSound('pop'); onBack(); }}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/20 px-4 py-1.5 rounded-full mb-2 inline-block">
                  Capítulo 2 • Bloque 3 • Pirámides
                </span>
                <h3 className="text-3xl font-black tracking-tight uppercase">PIRÁMIDES NUMÉRICAS</h3>
              </div>
            </div>
            <button 
              onClick={() => { playSound('pop'); setShowCalculator(!showCalculator); }}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer self-start sm:self-auto"
            >
              <i className="fas fa-calculator"></i> CALCULADORA
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel / Navigation Hub */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white border border-slate-100 p-4.5 rounded-[2rem] shadow-lg shadow-slate-150/40 mb-8">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (level > 1) {
                playSound('pop');
                setLevel(level - 1);
              }
            }}
            disabled={level === 1}
            className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              level === 1
                ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 active:scale-95 cursor-pointer shadow-sm'
            }`}
          >
            <i className="fas fa-chevron-left text-[10px]"></i>
            Anterior
          </button>
          
          <button
            onClick={() => {
              if (level < unlockedLevel) {
                playSound('pop');
                setLevel(level + 1);
              }
            }}
            disabled={level === 4 || level >= unlockedLevel}
            className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              level === 4 || level >= unlockedLevel
                ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 cursor-pointer shadow-md'
            }`}
          >
            Siguiente
            <i className="fas fa-chevron-right text-[10px]"></i>
          </button>
        </div>

        {/* Level Badges Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[1, 2, 3, 4].map((num) => {
            const isCurrent = level === num;
            const isUnlocked = num <= unlockedLevel;
            let label = `Reto ${num}`;
            if (num === 1) label = "1. Pirámide de Pascal";
            else if (num === 2) label = "2. Pirámide Clásica";
            else if (num === 3) label = "3. Pirámide Desafío";
            else if (num === 4) label = "4. Gran Everest";

            return (
              <button
                key={num}
                onClick={() => {
                  if (isUnlocked) {
                    playSound('pop');
                    setLevel(num);
                  }
                }}
                disabled={!isUnlocked}
                className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border-2 ${
                  isCurrent
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                    : isUnlocked
                    ? 'bg-white border-emerald-100 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/20 cursor-pointer'
                    : 'bg-slate-100 border-slate-100 text-slate-350 cursor-not-allowed'
                }`}
              >
                {label}
                {!isUnlocked && <i className="fas fa-lock ml-1.5 text-[8px]"></i>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center mb-10 max-w-2xl mx-auto">
        {renderPyramid()}
      </div>

      {/* Conditionally Render Pascal Narrative if level 1 is completed/solved */}
      {level === 1 && isPascalSolved ? (
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] p-8 md:p-10 rounded-[2.5rem] shadow-xl border-4 border-[#312e81] text-white overflow-hidden animate-fade-up relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-pink-500/20 rounded-xl flex items-center justify-center text-pink-400 border border-pink-500/30">
                <i className="fas fa-scroll"></i>
              </div>
              <h3 className="font-extrabold text-xl tracking-tight text-pink-200">
                📜 La Maravillosa Historia del Triángulo de Pascal
              </h3>
            </div>
            
            <div className="space-y-4 text-slate-350 text-sm leading-relaxed font-semibold">
              <p>
                ¡Extraordinario! Has descifrado esta pirámide mágica. Este patrón es uno de los monumentos matemáticos más antiguos e increíbles del mundo. Fue popularizada en Europa por el joven filósofo y matemático francés <strong className="text-white">Blaise Pascal</strong> en 1653, quien no solo formuló sus secretos sino también diseñó <span className="text-white underline decoration-pink-500 decoration-2">una de las primeras calculadoras mecánicas del mundo (la Pascalina)</span> a la edad de 19 años para ayudar a su padre con la recaudación fiscal.
              </p>
              <p>
                Aunque matemáticos en China (como Yang Hui), India (como Pingala) y Persia (como Omar Khayyam) ya lo utilizaban siglos antes de Cristo, Pascal descubrió tantas leyes ocultas en él que hoy lleva su nombre.
              </p>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-4 space-y-3">
                <h4 className="font-bold text-pink-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fas fa-magic"></i> ¿Qué usos y secretos narrativos esconde?
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>
                      <strong className="text-white">El Oráculo de la Probabilidad:</strong> Si arrojas una moneda al aire 4 veces, ¿cuál es la probabilidad exacta de obtener 2 caras? La fila correspondiente de la pirámide te da la cantidad de combinaciones instanteamente de forma pura. ¡Es vital en estadística moderna y desarrollo de videojuegos!
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>
                      <strong className="text-white">Acelerador Algebraico:</strong> Al elevar el binomio <code className="bg-slate-900 px-1 py-0.5 rounded text-yellow-300 font-mono">(a + b)ⁿ</code> a cualquier potencia, los coeficientes resultantes coinciden dígito por dígito con los valores del triángulo. ¡Evita horas de aburridos cálculos rutinarios!
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>
                      <strong className="text-white">Patrones de la Naturaleza:</strong> Si sumas los números en diagonales inclinadas, ¡descubrirás la famosa <strong className="text-pink-300">Sucesión de Fibonacci</strong>! Además, si pintas únicamente los valores impares, se dibuja un fractal perfecto llamado el <strong className="text-pink-300">Triángulo de Sierpinski</strong>.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <i className="fas fa-brain absolute -right-6 -bottom-6 text-9xl text-white/5 rotate-12"></i>
        </div>
      ) : (
        <div className="max-w-md mx-auto bg-emerald-600 p-8 rounded-[2.5rem] shadow-xl border-4 border-emerald-100 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-black text-xl mb-2 flex items-center justify-center gap-2">
              <i className="fas fa-mountain"></i> REGLA DE LA PIRÁMIDE
            </h3>
            <p className="text-emerald-50 text-sm font-medium leading-relaxed">
              Cada bloque es la <strong>suma</strong> de los dos bloques que tiene justo debajo. 
              ¡Usa la lógica inversa para descubrir la base y llegar a la cima!
            </p>
          </div>
          <i className="fas fa-mountain absolute -right-4 -bottom-4 text-8xl text-white/10 rotate-12"></i>
        </div>
      )}

      <AnimatePresence>
        {gameState === 'won' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[300] bg-emerald-600/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-md border-8 border-emerald-200"
            >
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-5xl mx-auto mb-6">
                <i className="fas fa-mountain"></i>
              </div>
              <h2 className="text-3xl font-black text-gray-805 mb-4 tracking-tight">¡CUMBRE ALCANZADA!</h2>
              <p className="text-gray-500 font-medium mb-8">Has descifrado todas las pirámides y completado el Reto de Montañas Numéricas.</p>
              <button 
                onClick={onBack}
                className="w-full py-4.5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-700 transition-all cursor-pointer"
              >
                CONTINUAR CAMINO
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
    </div>
  );
};

export default NumericPyramids;
