
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

const TargetNumber: React.FC<Props> = ({ student, onBack, onComplete }) => {
  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState(0);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [expression, setExpression] = useState<string[]>([]);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');

  useEffect(() => {
    generateGame(level);
  }, [level]);

  const generateGame = (lvl: number) => {
    let count = 4;
    let maxNum = 10;
    if (lvl === 2) { count = 5; maxNum = 15; }
    if (lvl === 3) { count = 6; maxNum = 20; }

    const availableNumbers = Array.from({ length: count }, () => Math.floor(Math.random() * maxNum) + 1);
    
    // Generate a possible target
    let current = availableNumbers[0];
    let usedMultiplication = false;
    let usedDivision = false;

    for (let i = 1; i < availableNumbers.length; i++) {
      const op = Math.random();
      
      if (lvl === 1) {
        // Easy: Only + and -
        if (op > 0.5) current += availableNumbers[i];
        else current = Math.abs(current - availableNumbers[i]);
      } else if (lvl === 2) {
        // Intermediate: +, -, *
        // Force at least one multiplication if we haven't used one yet and it's the last chance
        if ((op > 0.6 || (i === availableNumbers.length - 1 && !usedMultiplication)) && current * availableNumbers[i] < 200) {
          current *= availableNumbers[i];
          usedMultiplication = true;
        } else if (op > 0.3) {
          current += availableNumbers[i];
        } else {
          current = Math.abs(current - availableNumbers[i]);
        }
      } else {
        // Superior: +, -, *, /
        if (op > 0.7) {
          current += availableNumbers[i];
        } else if (op > 0.4) {
          if (current * availableNumbers[i] < 500) {
            current *= availableNumbers[i];
            usedMultiplication = true;
          } else {
            current += availableNumbers[i];
          }
        } else if (op > 0.2) {
          current = Math.abs(current - availableNumbers[i]);
        } else {
          // Try division
          if (current % availableNumbers[i] === 0 && availableNumbers[i] !== 1) {
            current /= availableNumbers[i];
            usedDivision = true;
          } else {
            current += availableNumbers[i];
          }
        }
      }
    }

    // Final check to avoid 0 or negative targets
    if (current <= 0) current = availableNumbers.reduce((a, b) => a + b, 0);

    setTarget(current);
    setNumbers(availableNumbers);
    setExpression([]);
    setUsedIndices([]);
    setGameState('playing');
  };

  const addToken = (token: string, index?: number) => {
    if (gameState === 'won') return;
    playSound('pop');
    setExpression([...expression, token]);
    if (index !== undefined) {
      setUsedIndices([...usedIndices, index]);
    }
  };

  const clear = () => {
    playSound('pop');
    setExpression([]);
    setUsedIndices([]);
  };

  const calculate = () => {
    try {
      // Replace symbols for eval
      const evalStr = expression.join('')
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
      
      const result = eval(evalStr);
      
      if (result === target) {
        if (level < 3) {
          playSound('success');
          setLevel(level + 1);
        } else {
          setGameState('won');
          playSound('success');
          onComplete(100);
        }
      } else {
        playSound('error');
      }
    } catch (e) {
      playSound('error');
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 p-4 md:p-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-rose-600 hover:bg-rose-600 hover:text-white transition-all"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight uppercase">EL BLANCO PERFECTO</h1>
              <p className="text-rose-600 font-bold text-sm uppercase tracking-widest">
                {level === 1 ? 'Nivel Fácil' : level === 2 ? 'Nivel Intermedio' : 'Nivel Superior'}
              </p>
            </div>
          </div>

          <button 
            onClick={() => setShowCalculator(!showCalculator)}
            className="px-8 py-3 bg-white border-2 border-rose-100 text-rose-600 rounded-2xl font-black shadow-sm hover:shadow-xl transition-all flex items-center gap-3"
          >
            <i className="fas fa-calculator"></i> CALCULADORA
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-white border-8 border-rose-200 flex flex-col items-center justify-center shadow-2xl">
                <span className="text-xs font-black text-rose-400 uppercase tracking-widest mb-1">Objetivo</span>
                <span className="text-6xl md:text-8xl font-black text-rose-600">{target}</span>
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg animate-bounce">
                <i className="fas fa-bullseye"></i>
              </div>
            </div>

            <div className="w-full bg-white p-6 rounded-[2rem] shadow-xl border-4 border-rose-100 min-h-[120px] flex flex-wrap items-center justify-center gap-2">
              {expression.length === 0 ? (
                <span className="text-gray-300 font-black text-xl uppercase tracking-widest">Construye tu operación...</span>
              ) : (
                expression.map((t, i) => (
                  <span key={i} className={`text-3xl font-black ${isNaN(Number(t)) ? 'text-rose-400' : 'text-gray-800'}`}>{t}</span>
                ))
              )}
            </div>
          </div>

          <div className="bg-white/50 p-8 rounded-[3rem] border-4 border-white shadow-inner">
            <div className="grid grid-cols-3 gap-4 mb-8">
              {numbers.map((n, i) => (
                <button
                  key={i}
                  disabled={usedIndices.includes(i)}
                  onClick={() => addToken(String(n), i)}
                  className={`h-20 rounded-2xl font-black text-3xl shadow-md transition-all ${
                    usedIndices.includes(i) 
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                      : 'bg-white text-gray-800 hover:bg-rose-600 hover:text-white hover:scale-105'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
              {['+', '-', '×', '÷', '(', ')'].map(op => (
                <button
                  key={op}
                  onClick={() => addToken(op)}
                  className="h-16 bg-rose-100 text-rose-600 rounded-2xl font-black text-2xl hover:bg-rose-200 transition-all"
                >
                  {op}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={clear}
                className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                Limpiar
              </button>
              <button
                onClick={calculate}
                className="py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-rose-700 transition-all"
              >
                Comprobar
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {gameState === 'won' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[300] bg-rose-600/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-md border-8 border-rose-200"
            >
              <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-5xl mx-auto mb-6">
                <i className="fas fa-bullseye"></i>
              </div>
              <h2 className="text-4xl font-black text-gray-800 mb-4">¡TIRO PERFECTO!</h2>
              <p className="text-gray-500 font-medium mb-8">Has alcanzado todos los objetivos. El virus está perdiendo terreno frente a tu precisión matemática.</p>
              <button 
                onClick={onBack}
                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-rose-700 transition-all"
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

export default TargetNumber;
