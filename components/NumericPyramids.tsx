
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
  const [pyramid, setPyramid] = useState<(number | null)[]>([]);
  const [solution, setSolution] = useState<number[]>([]);
  const [userInputs, setUserInputs] = useState<(string)[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');

  useEffect(() => {
    generatePyramid(level);
  }, [level]);

  const generatePyramid = (lvl: number) => {
    let flatSolution: number[] = [];
    let puzzle: (number | null)[] = [];
    let rows = lvl + 2;

    if (lvl === 4) {
      // Pascal's Triangle - 20 rows
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
      // For Pascal, we'll render it top-down in the solution array
      flatSolution = pascal.flat();
    } else {
      // Generate base
      const base = Array.from({ length: rows }, () => Math.floor(Math.random() * 10) + 1);
      
      // Build full pyramid solution (bottom-up)
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
    }
    
    // Create puzzle by hiding some blocks
    // Ensure at least one per row is hidden
    let hiddenCount = 0;
    puzzle = flatSolution.map((val, idx) => {
      // For levels 1-3, always show the top block
      if (lvl < 4 && idx === 0) return val;
      
      // For Pascal (lvl 4), hide specific strategic blocks
      if (lvl === 4) {
        // Hide 1s on the edges sometimes, and middle values
        const isEdge = val === 1;
        const hideChance = isEdge ? 0.2 : 0.6;
        const hidden = Math.random() < hideChance;
        if (hidden) hiddenCount++;
        return hidden ? null : val;
      }

      const hidden = Math.random() > 0.5;
      if (hidden) hiddenCount++;
      return hidden ? null : val;
    });

    // Safety check: if no blocks are hidden, force hide at least 5
    if (hiddenCount < 3) {
      const indices = Array.from({ length: puzzle.length }, (_, i) => i);
      for (let i = 0; i < 5; i++) {
        const randomIdx = indices.splice(Math.floor(Math.random() * indices.length), 1)[0];
        puzzle[randomIdx] = null;
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
    
    // Check if correct
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
      
      if (level < 4) {
        playSound('success');
        setTimeout(() => setLevel(level + 1), 1500);
      } else {
        setGameState('won');
        playSound('success');
      }
    }
  };

  const renderPyramid = () => {
    const rows = level === 4 ? 20 : level + 2;
    let index = 0;
    const pyramidRows = [];

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
              className={`rounded-lg text-center font-black transition-all border-2 shadow-sm ${
                level === 4 
                  ? 'w-8 h-8 md:w-12 md:h-12 text-[10px] md:text-sm' 
                  : 'w-14 h-14 md:w-20 md:h-20 text-xl md:text-2xl border-4 shadow-lg'
              } ${
                isInitial 
                  ? 'bg-emerald-600 border-emerald-700 text-white' 
                  : isCorrect
                  ? 'bg-white border-emerald-500 text-emerald-600'
                  : 'bg-white border-emerald-100 text-gray-400 focus:border-emerald-400'
              }`}
            />
          </div>
        );
      }
      pyramidRows.push(
        <div key={r} className="flex justify-center gap-0.5 md:gap-1">
          {blocks}
        </div>
      );
    }

    return (
      <div className={`flex flex-col gap-0.5 md:gap-1 ${level === 4 ? 'overflow-auto max-h-[60vh] p-4 bg-white/30 rounded-3xl' : ''}`}>
        {pyramidRows}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-emerald-50 p-4 md:p-8 animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">PIRÁMIDES NUMÉRICAS</h1>
              <p className="text-emerald-600 font-bold text-sm uppercase tracking-widest">
                {level === 4 ? 'Reto Final: Triángulo de Pascal (20 Filas)' : `Nivel ${level} de 4`}
              </p>
            </div>
          </div>

          <button 
            onClick={() => setShowCalculator(!showCalculator)}
            className="px-8 py-3 bg-white border-2 border-emerald-100 text-emerald-600 rounded-2xl font-black shadow-sm hover:shadow-xl transition-all flex items-center gap-3"
          >
            <i className="fas fa-calculator"></i> CALCULADORA
          </button>
        </div>

        <div className="flex justify-center mb-12">
          {renderPyramid()}
        </div>

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
      </div>

      <AnimatePresence>
        {gameState === 'won' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[300] bg-emerald-600/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-md border-8 border-emerald-200"
            >
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-5xl mx-auto mb-6">
                <i className="fas fa-mountain"></i>
              </div>
              <h2 className="text-4xl font-black text-gray-800 mb-4">¡CUMBRE ALCANZADA!</h2>
              <p className="text-gray-500 font-medium mb-8">Has descifrado todas las pirámides y recuperado un fragmento vital del código del servidor.</p>
              <button 
                onClick={onBack}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-700 transition-all"
              >
                CONTINUAR MISIÓN
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
