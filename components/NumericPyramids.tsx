
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
  const [level, setLevel] = useState(1);
  const [pyramid, setPyramid] = useState<(number | null)[]>([]);
  const [solution, setSolution] = useState<number[]>([]);
  const [userInputs, setUserInputs] = useState<(string)[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');

  useEffect(() => {
    generatePyramid(level);
  }, [level]);

  const generatePyramid = (lvl: number) => {
    // Level 1: 3 rows (6 blocks)
    // Level 2: 4 rows (10 blocks)
    // Level 3: 5 rows (15 blocks)
    const rows = lvl + 2;
    const totalBlocks = (rows * (rows + 1)) / 2;
    
    // Generate base
    const base = Array.from({ length: rows }, () => Math.floor(Math.random() * 10) + 1);
    
    // Build full pyramid solution
    let fullPyramid: number[][] = [base];
    for (let r = 1; r < rows; r++) {
      const nextRow = [];
      const prevRow = fullPyramid[r - 1];
      for (let i = 0; i < prevRow.length - 1; i++) {
        nextRow.push(prevRow[i] + prevRow[i + 1]);
      }
      fullPyramid.push(nextRow);
    }

    // Flatten solution (from top to bottom)
    const flatSolution = fullPyramid.reverse().flat();
    
    // Create puzzle by hiding some blocks
    const puzzle = flatSolution.map(val => (Math.random() > 0.4 ? val : null));
    
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
    const isComplete = currentInputs.every((val, idx) => Number(val) === solution[idx]);
    if (isComplete) {
      if (level < 3) {
        playSound('success');
        setTimeout(() => setLevel(level + 1), 1500);
      } else {
        setGameState('won');
        playSound('success');
        onComplete(100);
      }
    }
  };

  const renderPyramid = () => {
    const rows = level + 2;
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
              value={userInputs[currentIdx]}
              onChange={(e) => handleInputChange(currentIdx, e.target.value)}
              disabled={isInitial || gameState === 'won'}
              className={`w-14 h-14 md:w-20 md:h-20 rounded-xl text-center font-black text-xl md:text-2xl shadow-lg transition-all border-4 ${
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
        <div key={r} className="flex justify-center gap-2 md:gap-4">
          {blocks}
        </div>
      );
    }

    return <div className="flex flex-col gap-2 md:gap-4">{pyramidRows}</div>;
  };

  return (
    <div className="min-h-screen bg-emerald-50 p-4 md:p-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">PIRÁMIDES NUMÉRICAS</h1>
              <p className="text-emerald-600 font-bold text-sm uppercase tracking-widest">Nivel {level} de 3</p>
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

        <div className="max-w-md mx-auto bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-emerald-100 text-center">
          <h3 className="font-black text-gray-800 mb-2">Regla de la Pirámide</h3>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">
            Cada bloque es la <strong>suma</strong> de los dos bloques que tiene justo debajo. 
            ¡Usa la lógica inversa para descubrir la base!
          </p>
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
