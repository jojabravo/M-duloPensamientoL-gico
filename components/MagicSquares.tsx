
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

const MagicSquares: React.FC<Props> = ({ student, onBack, onComplete }) => {
  const [size, setSize] = useState<3 | 4>(3);
  const [grid, setGrid] = useState<(number | null)[][]>([]);
  const [initialGrid, setInitialGrid] = useState<boolean[][]>([]);
  const [targetSum, setTargetSum] = useState(0);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');

  useEffect(() => {
    generateSquare(size);
  }, [size]);

  const generateSquare = (s: number) => {
    // Basic magic square generation
    let newGrid: number[][] = [];
    let sum = 0;

    if (s === 3) {
      // Siamese method for 3x3
      newGrid = Array(3).fill(0).map(() => Array(3).fill(0));
      let n = 1;
      let i = 0, j = 1;
      while (n <= 9) {
        newGrid[i][j] = n++;
        let ni = (i - 1 + 3) % 3;
        let nj = (j + 1) % 3;
        if (newGrid[ni][nj] !== 0) {
          i = (i + 1) % 3;
        } else {
          i = ni;
          j = nj;
        }
      }
      sum = 15;
    } else {
      // 4x4 magic square (Dürer's method)
      newGrid = [
        [16, 2, 3, 13],
        [5, 11, 10, 8],
        [9, 7, 6, 12],
        [4, 14, 15, 1]
      ];
      sum = 34;
    }

    // Add a random offset to make it "modern" and different
    const offset = Math.floor(Math.random() * 10);
    newGrid = newGrid.map(row => row.map(val => val + offset));
    sum = sum + (s * offset);

    // Hide cells
    const puzzle: (number | null)[][] = newGrid.map(row => row.map(val => (Math.random() > 0.5 ? val : null)));
    const initial = puzzle.map(row => row.map(val => val !== null));

    setGrid(puzzle);
    setInitialGrid(initial);
    setTargetSum(sum);
    setGameState('playing');
    setSelectedCell(null);
  };

  const handleCellClick = (r: number, c: number) => {
    if (initialGrid[r][c] || gameState === 'won') return;
    playSound('pop');
    setSelectedCell([r, c]);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    playSound('pop');
    const [r, c] = selectedCell;
    const newGrid = [...grid];
    newGrid[r][c] = num;
    setGrid(newGrid);
    checkWin(newGrid);
  };

  const checkWin = (currentGrid: (number | null)[][]) => {
    if (currentGrid.some(row => row.some(cell => cell === null))) return;

    // Check rows
    for (let i = 0; i < size; i++) {
      if (currentGrid[i].reduce((a, b) => (a || 0) + (b || 0), 0) !== targetSum) return;
    }

    // Check cols
    for (let i = 0; i < size; i++) {
      let colSum = 0;
      for (let j = 0; j < size; j++) colSum += currentGrid[j][i] || 0;
      if (colSum !== targetSum) return;
    }

    // Check diagonals
    let d1 = 0, d2 = 0;
    for (let i = 0; i < size; i++) {
      d1 += currentGrid[i][i] || 0;
      d2 += currentGrid[i][size - 1 - i] || 0;
    }
    if (d1 !== targetSum || d2 !== targetSum) return;

    setGameState('won');
    playSound('success');
    onComplete(100);
  };

  return (
    <div className="min-h-screen bg-purple-50 p-4 md:p-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-all"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight text-center md:text-left">CUADRADOS MÁGICOS</h1>
              <p className="text-purple-600 font-bold text-sm uppercase tracking-widest text-center md:text-left">El Código del Servidor</p>
            </div>
          </div>

          <div className="flex bg-white p-1 rounded-2xl shadow-md border-2 border-purple-100">
            {[3, 4].map(s => (
              <button
                key={s}
                onClick={() => setSize(s as any)}
                className={`px-8 py-2 rounded-xl font-black text-sm transition-all ${size === s ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-purple-600'}`}
              >
                {s}x{s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-8 border-purple-200 relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-6 py-2 rounded-full font-black text-sm shadow-lg">
                SUMA MÁGICA: {targetSum}
              </div>
              
              <div 
                className="grid gap-4 aspect-square"
                style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
              >
                {grid.map((row, r) => row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`aspect-square rounded-3xl flex items-center justify-center text-2xl md:text-4xl font-black transition-all cursor-pointer border-4 ${
                      initialGrid[r][c] 
                        ? 'bg-purple-50 border-purple-100 text-purple-900' 
                        : selectedCell?.[0] === r && selectedCell?.[1] === c
                        ? 'bg-purple-100 border-purple-600 scale-95 shadow-inner text-purple-600'
                        : 'bg-white border-purple-50 hover:border-purple-200 text-gray-400'
                    }`}
                  >
                    {cell !== null ? cell : '?'}
                  </div>
                )))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border-4 border-purple-100">
              <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-keyboard text-purple-500"></i> TECLADO NUMÉRICO
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
                  <button
                    key={n}
                    onClick={() => handleNumberInput(n)}
                    disabled={!selectedCell || gameState === 'won'}
                    className="h-12 rounded-xl bg-purple-50 text-purple-700 font-black hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => {
                    if (!selectedCell) return;
                    const [r, c] = selectedCell;
                    const newGrid = [...grid];
                    newGrid[r][c] = null;
                    setGrid(newGrid);
                  }}
                  className="col-span-2 h-12 rounded-xl bg-red-50 text-red-600 font-black hover:bg-red-600 hover:text-white transition-all"
                >
                  BORRAR
                </button>
              </div>
            </div>

            <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-black text-lg mb-2">Misión: Cripto-Analista</h3>
                <p className="text-indigo-100 text-xs leading-relaxed font-medium">
                  El virus ha desordenado los registros. Completa el cuadrado para que todas las filas, columnas y diagonales sumen {targetSum}.
                </p>
              </div>
              <i className="fas fa-microchip absolute -right-4 -bottom-4 text-8xl text-white/10 rotate-12"></i>
            </div>

            <button 
              onClick={() => setShowCalculator(!showCalculator)}
              className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
            >
              <i className="fas fa-calculator"></i> CALCULADORA PRO
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {gameState === 'won' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[300] bg-purple-600/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-md border-8 border-purple-200"
            >
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-5xl mx-auto mb-6">
                <i className="fas fa-key"></i>
              </div>
              <h2 className="text-4xl font-black text-gray-800 mb-4">¡LLAVE OBTENIDA!</h2>
              <p className="text-gray-500 font-medium mb-8">Has resuelto el Cuadrado Mágico y asegurado otra Llave de Acceso. ¡Eres imparable!</p>
              <button 
                onClick={onBack}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-purple-700 transition-all"
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

export default MagicSquares;
