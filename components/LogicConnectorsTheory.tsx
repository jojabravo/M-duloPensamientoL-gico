
import React, { useState } from 'react';
import { playSound } from '../audio';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const CONNECTOR_DATA = [
  {
    symbol: '¬',
    name: 'Negación',
    key: 'No',
    example: '____ es cierto que el sol es frío.',
    correct: 'No',
    explanation: 'Invierte el valor de verdad. Si algo es verdadero, su negación es falsa.',
    color: 'bg-red-500'
  },
  {
    symbol: '∧',
    name: 'Conjunción',
    key: 'Y',
    example: 'Estudio matemáticas ____ física.',
    correct: 'Y',
    explanation: 'Ambas proposiciones deben ser verdaderas para que el resultado sea verdadero.',
    color: 'bg-blue-500'
  },
  {
    symbol: '∨',
    name: 'Disyunción',
    key: 'O',
    example: 'Voy al cine ____ al parque.',
    correct: 'O',
    explanation: 'Basta con que una sea verdadera para que todo sea verdadero.',
    color: 'bg-purple-500'
  },
  {
    symbol: '→',
    name: 'Condicional',
    key: 'Entonces',
    example: 'Si llueve, ____ me mojo.',
    correct: 'Entonces',
    explanation: 'Indica una consecuencia. Solo es falso si el primero es verdadero y el segundo es falso.',
    color: 'bg-emerald-500'
  }
];

const LogicConnectorsTheory: React.FC<Props> = ({ onNext, onBack }) => {
  const [step, setStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const current = CONNECTOR_DATA[step];

  const handleVerify = () => {
    if (userInput.toLowerCase().trim() === current.correct.toLowerCase()) {
      playSound('success');
      setShowFeedback(true);
    } else {
      playSound('error');
      alert(`Pista: La palabra clave es "${current.key}"`);
    }
  };

  const nextStep = () => {
    playSound('pop');
    if (step < CONNECTOR_DATA.length - 1) {
      setStep(s => s + 1);
      setUserInput('');
      setShowFeedback(false);
    } else {
      onNext();
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn px-2 sm:px-4">
      <div className="bg-white p-5 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border-4 border-purple-50">
        <header className="mb-8 text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-50 px-4 py-1.5 rounded-full">Ejemplos Interactivos</span>
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 mt-4">Conectores Lógicos</h2>
          <p className="text-gray-500 mt-2 font-medium text-sm">Completa los ejemplos para aprender</p>
        </header>

        <div className="flex flex-col md:flex-row gap-6 items-stretch mb-8">
          <div className={`${current.color} w-full md:w-1/3 p-6 rounded-[2rem] md:rounded-[2.5rem] text-white flex flex-col items-center justify-center shadow-lg transition-all`}>
            <span className="text-5xl md:text-6xl font-black mb-2 animate-pop">{current.symbol}</span>
            <h3 className="text-xl md:text-2xl font-black text-center">{current.name}</h3>
          </div>

          <div className="flex-grow bg-gray-50 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col justify-center min-w-0">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Actividad: Completa</h4>
            <p className="text-lg md:text-xl font-bold text-gray-700 leading-relaxed mb-6 italic break-words">
              "{current.example.replace('____', '______')}"
            </p>
            
            {!showFeedback ? (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <input 
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Escribe aquí..."
                  className="w-full flex-grow min-w-0 px-5 py-3 md:py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-400 outline-none font-bold bg-gray-800 text-white text-center sm:text-left"
                />
                <button 
                  onClick={handleVerify}
                  className="w-full sm:w-auto px-8 py-3 md:py-4 bg-gray-800 text-white rounded-2xl font-black hover:bg-black transition-all shadow-md shrink-0 active:scale-95"
                >
                  LISTO
                </button>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <div className="bg-green-100 text-green-700 p-4 rounded-2xl mb-4 font-bold text-xs sm:text-sm shadow-sm">
                  <i className="fas fa-check-circle mr-2"></i> ¡Genial! "{current.example.replace('____', current.correct)}"
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  <strong>Función:</strong> {current.explanation}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-100 gap-4">
          <button onClick={onBack} className="text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-600 transition-colors order-3 sm:order-1">
            <i className="fas fa-arrow-left mr-2"></i> Anterior
          </button>
          <div className="flex gap-2 order-1 sm:order-2">
            {CONNECTOR_DATA.map((_, i) => (
              <div key={i} className={`h-1.5 w-6 md:w-8 rounded-full transition-all ${i === step ? 'bg-purple-600' : 'bg-gray-100'}`}></div>
            ))}
          </div>
          <button 
            onClick={showFeedback ? nextStep : undefined}
            disabled={!showFeedback}
            className="w-full sm:w-auto px-8 py-3 bg-purple-600 text-white rounded-2xl font-black text-[10px] shadow-lg disabled:opacity-30 hover:bg-purple-700 transition-all order-2 sm:order-3"
          >
            {step === CONNECTOR_DATA.length - 1 ? 'CONTINUAR' : 'SIGUIENTE'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogicConnectorsTheory;
