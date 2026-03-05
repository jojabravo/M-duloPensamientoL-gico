
import React, { useState } from 'react';
import { playSound } from '../audio';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const INFERENCE_DATA = [
  {
    name: 'Modus Ponens (Afirmando)',
    p1: 'Si estudio, entonces apruebo.',
    p2: 'Estudio.',
    conclusion: 'Apruebo',
    hint: 'A____o',
    explanation: 'Si ocurre la causa (P), entonces ocurre el efecto (Q). Es una deducción directa.',
    color: 'border-emerald-400'
  },
  {
    name: 'Modus Tollens (Negando)',
    p1: 'Si llueve, la calle se moja.',
    p2: 'La calle NO está mojada.',
    conclusion: 'No llovió',
    hint: 'N_ l____ó',
    explanation: 'Si el efecto no ocurrió (Q es falso), entonces la causa tampoco ocurrió.',
    color: 'border-blue-400'
  }
];

const LogicInferenceTheory: React.FC<Props> = ({ onNext, onBack }) => {
  const [step, setStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const current = INFERENCE_DATA[step];

  const handleVerify = () => {
    if (userInput.toLowerCase().trim() === current.conclusion.toLowerCase()) {
      playSound('success');
      setShowFeedback(true);
    } else {
      playSound('error');
      alert(`Pista: La conclusión lógica es "${current.conclusion}"`);
    }
  };

  const nextStep = () => {
    playSound('pop');
    if (step < INFERENCE_DATA.length - 1) {
      setStep(s => s + 1);
      setUserInput('');
      setShowFeedback(false);
    } else {
      onNext();
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn px-2 sm:px-4">
      <div className="bg-white p-5 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border-4 border-emerald-50">
        <header className="mb-8 text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-4 py-1.5 rounded-full">Deducción Interactiva</span>
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 mt-4">Reglas de Inferencia</h2>
          <p className="text-gray-500 mt-2 font-medium text-sm">Completa el razonamiento lógico</p>
        </header>

        <div className="bg-gray-50 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 border-dashed border-gray-200 mb-8 overflow-hidden">
          <h3 className="text-lg md:text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0">
              <i className="fas fa-brain"></i>
            </div>
            <span className="truncate">{current.name}</span>
          </h3>

          <div className="space-y-4 mb-8">
            <div className={`p-4 md:p-5 bg-white rounded-2xl border-l-8 ${current.color} shadow-sm`}>
              <span className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Regla General</span>
              <p className="text-base md:text-lg font-bold text-gray-700">{current.p1}</p>
            </div>
            <div className={`p-4 md:p-5 bg-white rounded-2xl border-l-8 ${current.color} shadow-sm`}>
              <span className="text-[9px] font-black text-gray-400 uppercase mb-1 block">Hecho Observado</span>
              <p className="text-base md:text-lg font-bold text-gray-700">{current.p2}</p>
            </div>
            
            <div className="flex items-center justify-center py-2">
               <div className="h-1 w-12 bg-gray-200 rounded-full"></div>
            </div>

            <div className="p-5 md:p-6 bg-emerald-600 rounded-2xl text-white shadow-lg text-center min-w-0">
              <span className="text-[9px] font-black uppercase opacity-70 mb-2 block">¿Qué concluyes tú?</span>
              {!showFeedback ? (
                <div className="flex flex-col items-center gap-3">
                  <input 
                    type="text" 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={`Pista: ${current.hint}`}
                    className="w-full max-w-xs px-4 py-3 rounded-xl bg-emerald-800 text-white font-bold text-center outline-none focus:ring-4 focus:ring-emerald-300"
                  />
                  <button 
                    onClick={handleVerify} 
                    className="w-full max-w-[150px] bg-white text-emerald-600 px-6 py-2.5 rounded-xl font-black text-sm hover:bg-emerald-50 transition-all active:scale-95 shadow-md"
                  >
                    VERIFICAR
                  </button>
                </div>
              ) : (
                <div className="animate-pop">
                  <p className="text-xl md:text-2xl font-black uppercase tracking-tight">∴ {current.conclusion}</p>
                  <p className="text-[10px] md:text-xs mt-4 bg-white/20 p-3 rounded-xl italic leading-relaxed">
                    {current.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <button onClick={onBack} className="text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-600 order-3 sm:order-1">
            <i className="fas fa-arrow-left mr-2"></i> Anterior
          </button>
          <div className="flex gap-2 order-1 sm:order-2">
            {INFERENCE_DATA.map((_, i) => (
              <div key={i} className={`h-1.5 w-6 md:w-8 rounded-full transition-all ${i === step ? 'bg-emerald-500' : 'bg-gray-100'}`}></div>
            ))}
          </div>
          <button 
            onClick={showFeedback ? nextStep : undefined}
            disabled={!showFeedback}
            className="w-full sm:w-auto px-10 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-[10px] shadow-lg disabled:opacity-30 hover:bg-emerald-700 transition-all order-2 sm:order-3"
          >
            {step === INFERENCE_DATA.length - 1 ? '¡FINALIZAR TEORÍA!' : 'SIGUIENTE REGLA'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogicInferenceTheory;
