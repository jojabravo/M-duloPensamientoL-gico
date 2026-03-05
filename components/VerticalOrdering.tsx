
import React, { useState } from 'react';
import { Person } from '../types';
import { playSound } from '../audio';

interface Props {
  floors: (Person | null)[];
  setFloors: React.Dispatch<React.SetStateAction<(Person | null)[]>>;
  available: Person[];
  setAvailable: React.Dispatch<React.SetStateAction<Person[]>>;
  onNext: () => void;
  onBack: () => void;
}

// Exported for initial state in App.tsx
export const INITIAL_VERTICAL: Person[] = [
  { id: 'p1', name: 'Raúl', color: 'bg-orange-400' },
  { id: 'p2', name: 'Pedro', color: 'bg-indigo-400' },
  { id: 'p3', name: 'Carlos', color: 'bg-emerald-400' },
  { id: 'p4', name: 'Julio', color: 'bg-rose-400' },
];

const VerticalOrdering: React.FC<Props> = ({ floors, setFloors, available, setAvailable, onNext, onBack }) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const handlePlace = (person: Person, floorIdx: number) => {
    playSound('pop');
    const newFloors = [...floors];
    const oldPerson = newFloors[floorIdx];
    newFloors[floorIdx] = person;
    setFloors(newFloors);
    setAvailable(prev => {
      const filtered = prev.filter(p => p.id !== person.id);
      if (oldPerson) return [...filtered, oldPerson];
      return filtered;
    });
  };

  const handleRemove = (idx: number) => {
    if (floors[idx]) {
      playSound('pop');
      setAvailable(prev => [...prev, floors[idx]!]);
      setFloors(prev => {
        const next = [...prev];
        next[idx] = null;
        return next;
      });
    }
  };

  const check = () => {
    const correctNames = ['Raúl', 'Pedro', 'Julio', 'Carlos'];
    const currentNames = floors.map(f => f?.name);
    
    if (currentNames.every((name, i) => name === correctNames[i])) {
      playSound('success');
      setFeedback("¡Correcto! Julio vive en el 3er piso.");
    } else {
      playSound('error');
      setFeedback("Revisa bien: Raúl va en el primero, y Julio vive justo arriba de Pedro.");
    }
  };

  const reset = () => {
    playSound('pop');
    setFloors(Array(4).fill(null)); 
    setAvailable(INITIAL_VERTICAL); 
    setFeedback(null);
  };

  return (
    <div className="max-w-4xl mx-auto animate-slideIn">
      <div className="bg-white p-5 md:p-8 rounded-3xl shadow-xl border-4 border-blue-100">
        <header className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Interactiva #2</span>
          <h2 className="text-xl md:text-2xl font-bold text-blue-700">Ordenamiento Vertical</h2>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-3 text-[11px] italic text-gray-700 rounded-r-xl">
            "Raúl en el 1er piso. Carlos arriba de todos. Julio un piso arriba de Pedro."
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="w-40 bg-gray-100 p-3 rounded-2xl border-4 border-gray-200">
            {[3, 2, 1, 0].map(idx => (
              <div 
                key={idx} 
                onClick={() => handleRemove(idx)}
                className={`h-12 md:h-16 mb-2 last:mb-0 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${floors[idx] ? 'bg-white border-blue-400 shadow-sm' : 'border-gray-300 hover:border-blue-200'}`}
              >
                {floors[idx] ? (
                  <div className={`flex items-center gap-2 ${floors[idx]?.color} text-white px-2 py-1 rounded-lg font-bold text-[10px] w-full mx-1 justify-center`}>
                    {floors[idx]?.name}
                  </div>
                ) : (
                  <span className="text-gray-300 font-bold text-[9px]">Piso {idx + 1}</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 justify-center">
            {available.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  const emptyIdx = floors.findIndex(f => f === null);
                  if (emptyIdx !== -1) handlePlace(p, emptyIdx);
                }}
                className={`${p.color} text-white px-3 py-1.5 rounded-xl shadow-md font-bold text-[10px] flex items-center gap-2 hover:scale-105 transition-all`}
              >
                <span>{p.name}</span>
                <i className="fas fa-plus-circle opacity-50"></i>
              </button>
            ))}
          </div>
        </div>

        {feedback && (
          <div className={`mt-6 p-2 rounded-xl text-center text-[10px] font-bold ${feedback.includes('¡Correcto!') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {feedback}
          </div>
        )}

        <div className="flex justify-between items-center mt-8 border-t pt-4">
          <button onClick={reset} className="text-gray-300 hover:text-blue-600 font-bold text-[10px]">
            <i className="fas fa-sync-alt"></i>
          </button>
          <div className="flex gap-2">
            <button onClick={() => { playSound('pop'); onBack(); }} className="w-10 h-10 flex items-center justify-center border-2 border-gray-100 text-gray-400 rounded-xl hover:bg-gray-50 transition-all">
              <i className="fas fa-arrow-left"></i>
            </button>
            <button onClick={check} className="px-5 py-2 bg-blue-500 text-white rounded-xl font-bold text-xs hover:bg-blue-600 shadow-md">
              Validar
            </button>
            <button onClick={() => { playSound('pop'); onNext(); }} className="w-10 h-10 flex items-center justify-center bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-md transition-all">
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalOrdering;
