
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

const FIGURES = [
  { id: 1, icon: 'fa-star', color: 'text-yellow-500' },
  { id: 2, icon: 'fa-heart', color: 'text-red-500' },
  { id: 3, icon: 'fa-moon', color: 'text-blue-500' },
  { id: 4, icon: 'fa-sun', color: 'text-orange-500' },
  { id: 5, icon: 'fa-cloud', color: 'text-gray-400' },
  { id: 6, icon: 'fa-bolt', color: 'text-purple-500' },
  { id: 7, icon: 'fa-leaf', color: 'text-green-500' },
  { id: 8, icon: 'fa-gem', color: 'text-cyan-500' },
  { id: 9, icon: 'fa-fire', color: 'text-rose-500' },
];

const Sudoku: React.FC<Props> = ({ student, onBack, onComplete }) => {
  const initialSize = student.progreso_sudoku === 100 ? 9 : (student.progreso_sudoku || 0) >= 66 ? 9 : (student.progreso_sudoku || 0) >= 33 ? 8 : 7;
  const [size, setSize] = useState<7 | 8 | 9>(initialSize as any);
  const [grid, setGrid] = useState<(number | null)[][]>([]);
  const [initialGrid, setInitialGrid] = useState<boolean[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');

  useEffect(() => {
    generatePuzzle(size);
  }, [size]);

  const generatePuzzle = (s: number) => {
    // Simple Latin Square generation for 7x7, 8x8
    // For 9x9 we could do standard Sudoku but Latin Square is easier for random figures
    const base = Array.from({ length: s }, (_, i) => i + 1);
    const newGrid: number[][] = [];
    
    // Shuffle base
    const shuffledBase = [...base].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < s; i++) {
      const row = [];
      for (let j = 0; j < s; j++) {
        row.push(shuffledBase[(j + i) % s]);
      }
      newGrid.push(row);
    }

    // Shuffle rows and columns to make it less predictable
    for (let i = 0; i < s; i++) {
      const r1 = Math.floor(Math.random() * s);
      const r2 = Math.floor(Math.random() * s);
      [newGrid[r1], newGrid[r2]] = [newGrid[r2], newGrid[r1]];
    }

    // Create puzzle by hiding cells
    const puzzle: (number | null)[][] = newGrid.map(row => row.map(val => (Math.random() > 0.4 ? val : null)));
    const initial = puzzle.map(row => row.map(val => val !== null));

    setGrid(puzzle);
    setInitialGrid(initial);
    setGameState('playing');
    setSelectedCell(null);
  };

  const handleCellClick = (r: number, c: number) => {
    if (initialGrid[r][c] || gameState === 'won') return;
    playSound('pop');
    setSelectedCell([r, c]);
  };

  const handleFigureSelect = (figId: number) => {
    if (!selectedCell) return;
    playSound('pop');
    const [r, c] = selectedCell;
    const newGrid = [...grid];
    newGrid[r][c] = figId;
    setGrid(newGrid);
    checkWin(newGrid);
  };

  const checkWin = (currentGrid: (number | null)[][]) => {
    // Check if full
    if (currentGrid.some(row => row.some(cell => cell === null))) return;

    // Check rows and columns
    for (let i = 0; i < size; i++) {
      const row = currentGrid[i];
      const col = currentGrid.map(r => r[i]);
      if (new Set(row).size !== size || new Set(col).size !== size) return;
    }

    setGameState('won');
    playSound('success');
    
    const progressMap: Record<number, number> = { 7: 33, 8: 66, 9: 100 };
    onComplete(progressMap[size] || 100);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn px-4 py-8">
      <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-amber-50 overflow-hidden mb-8">
        {/* Header Banner */}
        <div className="bg-amber-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl rotate-12">
            <i className="fas fa-user-secret"></i>
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
                  Capítulo 2 • Bloque 3 • Sudoku
                </span>
                <h3 className="text-3xl font-black tracking-tight uppercase">SUDOKU DETECTIVE</h3>
              </div>
            </div>
            <div className="flex bg-white/10 p-1 rounded-2xl border border-white/20 backdrop-blur-md">
              {[7, 8, 9].map(s => (
                <button
                  key={s}
                  onClick={() => setSize(s as any)}
                  className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${size === s ? 'bg-white text-amber-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
                >
                  {s}x{s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div 
              className="bg-white p-4 md:p-6 rounded-[2.5rem] shadow-2xl border-8 border-amber-200 aspect-square grid gap-1"
              style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
            >
              {grid.map((row, r) => row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xl md:text-2xl transition-all cursor-pointer border-2 ${
                    initialGrid[r][c] 
                      ? 'bg-gray-50 border-gray-100 text-gray-400' 
                      : selectedCell?.[0] === r && selectedCell?.[1] === c
                      ? 'bg-amber-100 border-amber-500 scale-95 shadow-inner'
                      : 'bg-white border-amber-50 hover:border-amber-200'
                  }`}
                >
                  {cell && (
                    <i className={`fas ${FIGURES.find(f => f.id === cell)?.icon} ${FIGURES.find(f => f.id === cell)?.color}`}></i>
                  )}
                </div>
              )))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border-4 border-amber-100">
              <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-shapes text-amber-500"></i> SELECCIONA FIGURA
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {FIGURES.slice(0, size).map(fig => (
                  <button
                    key={fig.id}
                    onClick={() => handleFigureSelect(fig.id)}
                    disabled={!selectedCell || gameState === 'won'}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all border-4 ${
                      !selectedCell || gameState === 'won'
                        ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                        : 'bg-white border-amber-50 hover:border-amber-500 hover:scale-105 shadow-sm'
                    }`}
                  >
                    <i className={`fas ${fig.icon} ${fig.color}`}></i>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-600 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-black text-lg mb-2">Misión: Cripto-Analista</h3>
                <p className="text-amber-100 text-xs leading-relaxed font-medium">
                  El virus está bloqueando el sistema. Completa la cuadrícula sin repetir figuras en filas ni columnas para obtener la Llave de Acceso.
                </p>
              </div>
              <i className="fas fa-shield-virus absolute -right-4 -bottom-4 text-8xl text-white/10 rotate-12"></i>
            </div>

            <button 
              onClick={() => setShowCalculator(!showCalculator)}
              className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
            >
              <i className="fas fa-calculator"></i> CALCULADORA PRO
            </button>
          </div>
        </div>

      <AnimatePresence>
        {gameState === 'won' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[300] bg-amber-600/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-md border-8 border-amber-200"
            >
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-5xl mx-auto mb-6">
                <i className="fas fa-key"></i>
              </div>
              <h2 className="text-4xl font-black text-gray-800 mb-4">¡SISTEMA DESBLOQUEADO!</h2>
              <p className="text-gray-500 font-medium mb-8">Has obtenido una Llave de Acceso para el Bloque 4. ¡Excelente trabajo, Cripto-Analista!</p>
              <button 
                onClick={onBack}
                className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-amber-700 transition-all"
              >
                CONTINUAR AVENTURA
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
    </div>
  );
};

export default Sudoku;
