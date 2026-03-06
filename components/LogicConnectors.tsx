
import React, { useState } from 'react';
import { playSound } from '../audio';

interface Props {
  onCorrect?: () => void;
  onFinish: (score: number) => void;
  onBack: () => void;
}

const CONNECTORS = [
  { symbol: '¬', name: 'Negación', hint: 'no, no es cierto que', color: 'bg-red-500' },
  { symbol: '∧', name: 'Conjunción', hint: 'y, además, pero', color: 'bg-blue-500' },
  { symbol: '∨', name: 'Disyunción', hint: 'o, a menos que', color: 'bg-purple-500' },
  { symbol: '→', name: 'Condicional', hint: 'si... entonces', color: 'bg-emerald-500' },
  { symbol: '↔', name: 'Bicondicional', hint: 'si y solo si', color: 'bg-orange-500' }
];

const TASKS = [
  { phrase: "Estudio en Tolú o en Cartagena.", correct: '∨', desc: "La palabra 'o' indica una opción entre dos alternativas." },
  { phrase: "No es cierto que sea un buen estudiante.", correct: '¬', desc: "La frase 'No es cierto que' es una negación." },
  { phrase: "Si me esfuerzo, entonces ganaré.", correct: '→', desc: "Estructura causa-efecto indicada por 'Si... entonces'." },
  { phrase: "Canto y bailo en la fiesta.", correct: '∧', desc: "La palabra 'y' une dos acciones simultáneas." },
  { phrase: "Iré al cine si y solo si termino la tarea.", correct: '↔', desc: "Indica una condición necesaria y suficiente en ambos sentidos." }
];

const LogicConnectors: React.FC<Props> = ({ onCorrect, onFinish, onBack }) => {
  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const handleMatch = (symbol: string) => {
    if (symbol === TASKS[current].correct) {
      playSound('success');
      setFeedback(`¡Correcto! ${TASKS[current].desc}`);
      setScore(s => s + 1);
      if (onCorrect) onCorrect();
    } else {
      playSound('error');
      setFeedback("Incorrecto. Mira las pistas de ayuda abajo.");
    }
  };

  const nextTask = () => {
    playSound('pop');
    setFeedback(null);
    if (current < TASKS.length - 1) {
      setCurrent(c => c + 1);
    } else {
      onFinish(score);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-slideIn px-4">
      <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-2xl border-4 border-blue-50">
        <header className="mb-10 text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-50 px-4 py-1.5 rounded-full">Reto 2: Simbolización</span>
          <h2 className="text-2xl font-black text-gray-800 mt-4">Traductor Simbólico</h2>
          <p className="text-gray-500 text-sm font-medium">Asocia cada frase con su símbolo lógico.</p>
        </header>

        <div className="bg-blue-600 p-8 md:p-10 rounded-[2.5rem] mb-10 text-white shadow-xl relative overflow-hidden text-center">
           <p className="text-lg md:text-2xl font-black italic relative z-10 leading-relaxed">
             "{TASKS[current].phrase}"
           </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-12">
          {CONNECTORS.map(c => (
            <button
              key={c.symbol}
              onClick={() => handleMatch(c.symbol)}
              disabled={!!feedback}
              className={`p-3 sm:p-6 rounded-3xl flex flex-col items-center justify-center transition-all transform active:scale-95 group shadow-sm hover:shadow-lg border-2 ${c.color.replace('bg-', 'border-')} hover:bg-gray-50 disabled:opacity-50`}
            >
              <span className={`text-xl sm:text-3xl font-black mb-1 sm:mb-2 ${c.color.replace('bg-', 'text-')}`}>{c.symbol}</span>
              <span className="text-[7px] sm:text-[8px] font-black uppercase text-gray-400 tracking-tighter text-center">{c.name}</span>
            </button>
          ))}
        </div>

        {feedback && (
          <div className={`p-6 sm:p-8 rounded-[2rem] text-center animate-fadeIn border-2 ${feedback.includes('Incorrecto') ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
            <p className={`font-black text-xs sm:text-sm mb-4 ${feedback.includes('Incorrecto') ? 'text-red-700' : 'text-green-700'}`}>
              {feedback}
            </p>
            <button 
              onClick={nextTask}
              className="px-8 py-3 bg-gray-800 text-white rounded-2xl font-black text-xs hover:bg-black transition-all"
            >
              {current === TASKS.length - 1 ? 'FINALIZAR TRADUCCIÓN' : 'SIGUIENTE FRASE'}
            </button>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
           <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-[10px] font-black transition-all uppercase tracking-widest order-2 sm:order-1">
             <i className="fas fa-arrow-left mr-1"></i> Reto anterior
           </button>
           <div className="flex gap-1 order-1 sm:order-2">
             {TASKS.map((_, i) => (
               <div key={i} className={`h-1.5 w-4 rounded-full transition-all ${i === current ? 'bg-blue-600 w-8' : i < current ? 'bg-blue-200' : 'bg-gray-100'}`}></div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default LogicConnectors;
