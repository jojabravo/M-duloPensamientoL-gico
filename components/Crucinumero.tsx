
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

interface Challenge {
  id: number;
  equation: string;
  answer: string;
  clue: string;
  x: number;
  y: number;
  dir: 'H' | 'V';
}

const GRID_SIZE = 20;

const Crucinumero: React.FC<Props> = ({ student, onBack, onComplete }) => {
  const [grid, setGrid] = useState<(string | null)[][]>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
  const [answers, setAnswers] = useState<string[][]>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');

  // Clues with powers and roots as requested
  const proChallenges: Challenge[] = [
    // Horizontal
    { id: 3, equation: '2³ + 6', answer: 'CATORCE', clue: '3 Horizontal', x: 2, y: 0, dir: 'H' },
    { id: 6, equation: '7² - 2', answer: 'CUARENTAYSIETE', clue: '6 Horizontal', x: 5, y: 0, dir: 'H' },
    { id: 9, equation: '10² x 3 + 5', answer: 'TRECIENTOSCINCO', clue: '9 Horizontal', x: 8, y: 3, dir: 'H' },
    { id: 10, equation: '√225', answer: 'QUINCE', clue: '10 Horizontal', x: 13, y: 13, dir: 'H' },
    { id: 11, equation: '3²', answer: 'NUEVE', clue: '11 Horizontal', x: 15, y: 3, dir: 'H' },
    { id: 12, equation: '√36', answer: 'SEIS', clue: '12 Horizontal', x: 18, y: 10, dir: 'H' },
    
    // Vertical
    { id: 1, equation: '√144', answer: 'DOCE', clue: '1 Vertical', x: 0, y: 0, dir: 'V' },
    { id: 2, equation: '5² + 10', answer: 'TREINTAYCINCO', clue: '2 Vertical', x: 0, y: 6, dir: 'V' },
    { id: 4, equation: '11² - 2', answer: 'CIENTODIECINUEVE', clue: '4 Vertical', x: 3, y: 11, dir: 'V' },
    { id: 5, equation: '2⁵ + 8', answer: 'CUARENTA', clue: '5 Vertical', x: 4, y: 1, dir: 'V' },
    { id: 7, equation: '3³ + 2', answer: 'VEINTINUEVE', clue: '7 Vertical', x: 6, y: 14, dir: 'V' },
    { id: 8, equation: '√961', answer: 'TREINTAYUNO', clue: '8 Vertical', x: 7, y: 4, dir: 'V' },
  ];

  useEffect(() => {
    const newAnswers = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    proChallenges.forEach(c => {
      for (let i = 0; i < c.answer.length; i++) {
        const nx = c.dir === 'H' ? c.x : c.x + i;
        const ny = c.dir === 'H' ? c.y + i : c.y;
        if (nx < GRID_SIZE && ny < GRID_SIZE) {
          newAnswers[nx][ny] = c.answer[i];
        }
      }
    });
    setAnswers(newAnswers);
  }, []);

  const handleInputChange = (r: number, c: number, val: string) => {
    if (gameState === 'won') return;
    const char = val.slice(-1).toUpperCase();
    const newGrid = [...grid];
    newGrid[r][c] = char || null;
    setGrid(newGrid);
    checkWin(newGrid);
    
    // Auto-focus next cell if a character was entered
    if (char) {
      playSound('pop');
    }
  };

  const checkWin = (currentGrid: (string | null)[][]) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (answers[r][c] !== null && currentGrid[r][c] !== answers[r][c]) return;
      }
    }
    setGameState('won');
    playSound('success');
    onComplete(100);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn px-4 py-8">
      <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-orange-50 overflow-hidden mb-8">
        {/* Header Banner */}
        <div className="bg-orange-500 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl rotate-12">
            <i className="fas fa-plus-minus"></i>
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
                  Capítulo 2 • Bloque 3 • Crucinúmero
                </span>
                <h3 className="text-3xl font-black tracking-tight">CRUCINÚMERO PRO</h3>
              </div>
            </div>
            <button 
              onClick={() => setShowCalculator(!showCalculator)}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black shadow-lg transition-all flex items-center gap-3"
            >
              <i className="fas fa-calculator"></i> CALCULADORA PRO
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white p-6 rounded-[3rem] shadow-2xl border-8 border-orange-200 overflow-auto">
            <div 
              className="grid gap-px bg-gray-300 border-2 border-gray-300"
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                minWidth: '800px'
              }}
            >
              {grid.map((row, r) => row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`aspect-square flex items-center justify-center transition-all relative ${
                    answers[r][c] === null ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  {answers[r][c] !== null && (
                    <input
                      type="text"
                      maxLength={1}
                      value={grid[r][c] || ''}
                      onChange={(e) => handleInputChange(r, c, e.target.value)}
                      disabled={gameState === 'won'}
                      className={`w-full h-full text-center text-base font-black uppercase transition-all border-none focus:ring-2 focus:ring-orange-500 outline-none pt-3 ${
                        grid[r][c] === answers[r][c]
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-white text-gray-800'
                      }`}
                    />
                  )}
                  {proChallenges.find(ch => ch.x === r && ch.y === c) && (
                    <span className="absolute top-0.5 left-0.5 text-[11px] text-orange-700 font-black pointer-events-none leading-none z-10">
                      {proChallenges.find(ch => ch.x === r && ch.y === c)?.id}
                    </span>
                  )}
                </div>
              )))}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border-4 border-orange-100 max-h-[600px] overflow-y-auto">
              <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2 sticky top-0 bg-white py-2 z-10">
                <i className="fas fa-list-ol text-orange-500"></i> PISTAS CRIPTOGRÁFICAS
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-3">Horizontal</h4>
                  <div className="space-y-2">
                    {proChallenges.filter(c => c.dir === 'H').map(c => (
                      <div key={c.id} className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex items-center gap-3">
                        <span className="w-6 h-6 bg-orange-500 text-white rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">{c.id}</span>
                        <p className="font-black text-sm text-gray-700">{c.equation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-3">Vertical</h4>
                  <div className="space-y-2">
                    {proChallenges.filter(c => c.dir === 'V').map(c => (
                      <div key={c.id} className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex items-center gap-3">
                        <span className="w-6 h-6 bg-orange-500 text-white rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">{c.id}</span>
                        <p className="font-black text-sm text-gray-700">{c.equation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-600 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-black text-lg mb-2">Misión: Cripto-Analista</h3>
                <p className="text-orange-100 text-xs leading-relaxed font-medium">
                  Escribe la letra correcta en cada casilla para completar el Crucinúmero. ¡Usa la lógica y tus conocimientos de matemáticas!
                </p>
              </div>
              <i className="fas fa-keyboard absolute -right-4 -bottom-4 text-8xl text-white/10 rotate-12"></i>
            </div>
          </div>
        </div>

        <AnimatePresence>
        {gameState === 'won' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[300] bg-orange-600/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-md border-8 border-orange-200"
            >
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-5xl mx-auto mb-6">
                <i className="fas fa-award"></i>
              </div>
              <h2 className="text-4xl font-black text-gray-800 mb-4">¡MISIÓN CUMPLIDA!</h2>
              <p className="text-gray-500 font-medium mb-8">Has descifrado el Crucinúmero Pro utilizando tus habilidades de potenciación y radicación. ¡El sistema está a salvo!</p>
              <button 
                onClick={onBack}
                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-orange-700 transition-all"
              >
                CONTINUAR
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
    </div>
  );
};

export default Crucinumero;
