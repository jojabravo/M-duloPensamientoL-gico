
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { playSound } from '../audio';

interface Props {
  onClose: () => void;
}

const Calculator: React.FC<Props> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (num: string) => {
    playSound('pop');
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    playSound('pop');
    const currentVal = display === '0' ? '' : display;
    setEquation(prev => prev + currentVal + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleParenthesis = (p: string) => {
    playSound('pop');
    const currentVal = display === '0' ? '' : display;
    setEquation(prev => prev + currentVal + p);
    setDisplay('0');
  };

  const calculate = () => {
    playSound('success');
    try {
      const currentVal = display === '0' ? '' : display;
      const fullEquation = equation + currentVal;
      // Clean up the equation for evaluation
      const cleanEquation = fullEquation
        .replace(/x/g, '*')
        .replace(/÷/g, '/')
        .replace(/√/g, 'Math.sqrt')
        .replace(/∛/g, 'Math.cbrt');
      
      const result = new Function(`return ${cleanEquation}`)();
      setDisplay(String(Number(result.toFixed(4))));
      setEquation('');
    } catch (e) {
      setDisplay('Error');
      setEquation('');
    }
  };

  const clear = () => {
    playSound('pop');
    setDisplay('0');
    setEquation('');
  };

  const handleScientific = (type: 'sq' | 'cb' | 'sqrt' | 'cbrt') => {
    playSound('pop');
    const val = Number(display);
    let result = 0;
    if (type === 'sq') result = Math.pow(val, 2);
    if (type === 'cb') result = Math.pow(val, 3);
    if (type === 'sqrt') result = Math.sqrt(val);
    if (type === 'cbrt') result = Math.cbrt(val);
    
    setDisplay(String(Number(result.toFixed(4))));
  };

  const buttons = [
    ['(', ')', 'x²', 'x³'],
    ['√', '∛', 'C', '÷'],
    ['7', '8', '9', 'x'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  return (
    <motion.div 
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed bottom-24 right-8 z-[200] bg-white rounded-[2rem] shadow-2xl border-4 border-emerald-200 w-72 overflow-hidden cursor-move"
    >
      <div className="bg-emerald-600 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white">
          <i className="fas fa-calculator"></i>
          <span className="font-black text-xs uppercase tracking-widest">Calculadora Pro</span>
        </div>
        <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="p-4 bg-gray-50">
        <div className="bg-white p-4 rounded-xl border-2 border-emerald-100 text-right mb-4 min-h-[80px] flex flex-col justify-end">
          <div className="text-gray-400 text-[10px] font-mono break-all leading-tight mb-1">{equation}</div>
          <div className="text-2xl font-black text-emerald-600 font-mono truncate">{display}</div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {buttons.flat().map((btn) => (
            <button
              key={btn}
              onClick={() => {
                if (btn === 'C') clear();
                else if (btn === '=') calculate();
                else if (['+', '-', 'x', '÷'].includes(btn)) handleOperator(btn);
                else if (['(', ')'].includes(btn)) handleParenthesis(btn);
                else if (btn === 'x²') handleScientific('sq');
                else if (btn === 'x³') handleScientific('cb');
                else if (btn === '√') handleScientific('sqrt');
                else if (btn === '∛') handleScientific('cbrt');
                else if (btn === '.') {
                  if (!display.includes('.')) setDisplay(display + '.');
                }
                else handleNumber(btn);
              }}
              className={`h-11 rounded-xl font-black text-base transition-all active:scale-90 ${
                btn === '=' 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : btn === 'C'
                  ? 'bg-red-100 text-red-600'
                  : ['+', '-', 'x', '÷', '(', ')'].includes(btn)
                  ? 'bg-emerald-100 text-emerald-600'
                  : ['x²', 'x³', '√', '∛'].includes(btn)
                  ? 'bg-orange-100 text-orange-600'
                  : btn === '0'
                  ? 'bg-white text-gray-600 border border-gray-100'
                  : 'bg-white text-gray-600 border border-gray-100'
              } ${btn === '0' ? 'col-span-1' : ''}`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-emerald-50 p-2 text-center">
        <span className="text-[10px] font-black text-emerald-300 uppercase tracking-tighter">¡Arrástrame donde quieras!</span>
      </div>
    </motion.div>
  );
};

export default Calculator;
