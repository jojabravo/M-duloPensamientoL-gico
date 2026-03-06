
import React, { useState } from 'react';
import { Person } from '../types';
import { playSound } from '../audio';

interface Props {
  onCorrect?: () => void;
  slots: (Person | null)[];
  setSlots: React.Dispatch<React.SetStateAction<(Person | null)[]>>;
  available: Person[];
  setAvailable: React.Dispatch<React.SetStateAction<Person[]>>;
  onNext: () => void;
  onBack: () => void;
}

// Exported for initial state in App.tsx
export const INITIAL_PEOPLE: Person[] = [
  { id: '1', name: 'María', color: 'bg-red-400' },
  { id: '2', name: 'Juana', color: 'bg-blue-400' },
  { id: '3', name: 'Ana', color: 'bg-green-400' },
  { id: '4', name: 'Inés', color: 'bg-yellow-400' },
  { id: '5', name: 'Enma', color: 'bg-pink-400' },
];

const HorizontalOrdering: React.FC<Props> = ({ onCorrect, slots, setSlots, available, setAvailable, onNext, onBack }) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handlePlace = (person: Person, index: number) => {
    playSound('pop');
    const newSlots = [...slots];
    const oldPerson = newSlots[index];
    
    newSlots[index] = person;
    setSlots(newSlots);
    
    setAvailable(prev => {
      const filtered = prev.filter(p => p.id !== person.id);
      if (oldPerson) return [...filtered, oldPerson];
      return filtered;
    });
  };

  const handleRemove = (index: number) => {
    const s = slots[index];
    if (s) {
      playSound('pop');
      setSlots(prev => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
      setAvailable(prev => [...prev, s]);
    }
  };

  const reset = () => {
    playSound('pop');
    setSlots(Array(5).fill(null));
    setAvailable(INITIAL_PEOPLE);
    setFeedback(null);
  };

  const check = () => {
    const correctNames = ['Inés', 'Enma', 'Ana', 'Juana', 'María'];
    const currentNames = slots.map(s => s?.name);
    
    if (currentNames.every((name, i) => name === correctNames[i])) {
      playSound('success');
      setFeedback("¡Excelente! Has ordenado correctamente de menor a mayor.");
      if (onCorrect) onCorrect();
    } else {
      playSound('error');
      setFeedback("Revisa: María es la mayor, Inés la menor, y Enma es menor que Ana.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-slideIn">
      <div className="bg-white p-5 md:p-8 rounded-3xl shadow-xl border-4 border-purple-100">
        <header className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Interactiva #1</span>
          <h2 className="text-xl md:text-2xl font-bold text-purple-700">Ordenamiento Horizontal</h2>
          <div className="bg-purple-50 border-l-4 border-purple-400 p-3 mt-3 text-[11px] italic text-gray-700 rounded-r-xl">
            "María es la mayor. Enma es menor que Ana. Juana es mayor que Ana. Inés es la más joven."
          </div>
        </header>

        <div className="flex flex-wrap gap-2 justify-center mb-8 min-h-[50px]">
          {available.map(p => (
            <button
              key={p.id}
              onClick={() => {
                const emptyIdx = slots.findIndex(s => s === null);
                if (emptyIdx !== -1) handlePlace(p, emptyIdx);
                else playSound('pop'); // Feedback even if full
              }}
              className={`${p.color} text-white px-3 py-1.5 rounded-xl shadow-md font-bold text-xs hover:scale-105 transition-transform active:scale-95`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="relative mb-10 px-4">
          <div className="h-1 bg-gray-200 w-full rounded-full absolute top-1/2 -translate-y-1/2 left-0"></div>
          <div className="flex justify-between relative z-10">
            {slots.map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div 
                  onClick={() => handleRemove(i)}
                  className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-dashed border-purple-200 flex items-center justify-center cursor-pointer transition-all ${s ? 'border-solid border-purple-500 bg-white shadow-sm scale-110' : 'hover:border-purple-300'}`}
                >
                  {s ? (
                    <div className={`${s.color} w-full h-full rounded-full flex items-center justify-center text-white font-bold text-[9px] md:text-xs animate-pop`}>
                      {s.name}
                    </div>
                  ) : (
                    <span className="text-gray-300 text-[7px] md:text-[8px]">?</span>
                  )}
                </div>
                <span className="mt-2 text-[7px] md:text-[8px] uppercase font-bold text-gray-400">
                  {i === 0 ? 'Menor' : i === 4 ? 'Mayor' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {feedback && (
          <div className={`p-3 rounded-xl mb-6 text-center text-[10px] md:text-xs font-bold animate-fadeIn ${feedback.includes('Excelente') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {feedback}
          </div>
        )}

        <div className="flex justify-between items-center border-t pt-4">
          <button 
            onClick={reset} 
            className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-purple-600 font-bold text-lg transition-colors"
            title="Reiniciar"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => { playSound('pop'); onBack(); }} 
              className="w-10 h-10 flex items-center justify-center border-2 border-gray-100 text-gray-400 rounded-xl hover:bg-gray-50 transition-all"
              title="Volver"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <button 
              onClick={check} 
              className="px-6 py-2 bg-blue-500 text-white rounded-xl font-bold text-xs hover:bg-blue-600 shadow-md transform active:scale-95 transition-all"
            >
              Validar
            </button>
            <button 
              onClick={() => { playSound('pop'); onNext(); }} 
              className="w-10 h-10 flex items-center justify-center bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-md transition-all active:scale-95"
              title="Siguiente"
            >
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalOrdering;
