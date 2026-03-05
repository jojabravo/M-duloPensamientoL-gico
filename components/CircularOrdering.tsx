
import React, { useState } from 'react';
import { Person } from '../types';
import { playSound } from '../audio';

interface Props {
  mode: 'PAR' | 'IMPAR';
  setMode: React.Dispatch<React.SetStateAction<'PAR' | 'IMPAR'>>;
  seats: (Person | null)[];
  setSeats: React.Dispatch<React.SetStateAction<(Person | null)[]>>;
  available: Person[];
  setAvailable: React.Dispatch<React.SetStateAction<Person[]>>;
  onNext: () => void;
  onBack: () => void;
}

// Exported for initial state in App.tsx
export const PEOPLE_PAR: Person[] = [
  { id: 'w', name: 'W', color: 'bg-red-400' },
  { id: 'a', name: 'A', color: 'bg-blue-400' },
  { id: 'c', name: 'C', color: 'bg-green-400' },
  { id: 'f', name: 'F', color: 'bg-yellow-400' },
  { id: 'p', name: 'P', color: 'bg-purple-400' },
  { id: 'b', name: 'B', color: 'bg-pink-400' },
  { id: 'x', name: 'X', color: 'bg-orange-400' },
  { id: 's', name: 'S', color: 'bg-indigo-400' },
];

const PEOPLE_IMPAR: Person[] = [
  { id: 'w', name: 'W', color: 'bg-red-400' },
  { id: 'f', name: 'F', color: 'bg-green-400' },
  { id: 'p', name: 'P', color: 'bg-blue-400' },
  { id: 'x', name: 'X', color: 'bg-orange-400' },
  { id: 's', name: 'S', color: 'bg-indigo-400' },
];

const CircularOrdering: React.FC<Props> = ({ mode, setMode, seats, setSeats, available, setAvailable, onNext, onBack }) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const numSeats = mode === 'PAR' ? 8 : 5;

  const switchMode = (newMode: 'PAR' | 'IMPAR') => {
    playSound('pop');
    setMode(newMode);
    setSeats(Array(newMode === 'PAR' ? 8 : 5).fill(null));
    setAvailable(newMode === 'PAR' ? PEOPLE_PAR : PEOPLE_IMPAR);
    setFeedback(null);
  };

  const toggleSeat = (idx: number) => {
    playSound('pop');
    if (seats[idx]) {
      const person = seats[idx]!;
      setAvailable(prev => [...prev, person]);
      setSeats(prev => {
        const next = [...prev];
        next[idx] = null;
        return next;
      });
    } else if (available.length > 0) {
      const person = available[0];
      setSeats(prev => {
        const next = [...prev];
        next[idx] = person;
        return next;
      });
      setAvailable(prev => prev.slice(1));
    }
  };

  const check = () => {
    const names = seats.map(s => s?.name || '');
    if (names.includes('')) {
      playSound('error');
      setFeedback("Por favor, ubica a todas las personas en la mesa.");
      return;
    }

    if (mode === 'PAR') {
      const cIdx = names.indexOf('C');
      if (cIdx !== 0) { playSound('error'); setFeedback("Error: C debe ir en el Asiento 1."); return; }
      
      const idxW = names.indexOf('W');
      const idxP = names.indexOf('P');
      const idxS = names.indexOf('S');
      const idxF = names.indexOf('F');
      const idxX = names.indexOf('X');
      const idxB = names.indexOf('B');

      const wFrenteP = Math.abs(idxW - idxP) === 4;
      const sFrenteF = Math.abs(idxS - idxF) === 4;
      const sIzqX = idxS === (idxX + 1) % 8;
      const pEntreByF = 
        (idxB === (idxP + 1) % 8 && idxF === (idxP - 1 + 8) % 8) ||
        (idxF === (idxP + 1) % 8 && idxB === (idxP - 1 + 8) % 8);

      if (wFrenteP && sFrenteF && sIzqX && pEntreByF) {
        playSound('success');
        setFeedback("¡Excelente! Has resuelto la mesa de 8 asientos.");
      } else {
        playSound('error');
        setFeedback("Revisa las reglas: ¿W está frente a P? ¿S está a la izquierda de X?");
      }
    } else {
      const fIdx = names.indexOf('F');
      if (fIdx !== 0) { playSound('error'); setFeedback("Coloca a F arriba."); return; }
      
      const der = [names[4], names[3]];
      const izq = [names[1], names[2]];
      
      const isCorrect = 
        der.includes('W') && der.includes('S') && 
        izq.includes('P') && izq.includes('X');

      if (isCorrect) {
        playSound('success');
        setFeedback("¡Muy bien! Ordenamiento impar completado.");
      } else {
        playSound('error');
        setFeedback("A la derecha de F deben estar W y S.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-slideIn">
      <div className={`bg-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl border-4 ${mode === 'PAR' ? 'border-pink-100' : 'border-purple-100'}`}>
        
        {/* Header con Selector de Modo */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${mode === 'PAR' ? 'bg-pink-100 text-pink-600' : 'bg-purple-100 text-purple-600'}`}>
              Interactiva #3
            </span>
            <h2 className="text-2xl font-black text-gray-800 mt-1">Ordenamiento Circular</h2>
          </div>
          <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1 shadow-inner">
            <button 
              onClick={() => switchMode('PAR')} 
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${mode === 'PAR' ? 'bg-pink-500 text-white shadow-md scale-105' : 'text-gray-400 hover:text-gray-600'}`}
            >
              MESA PAR (8)
            </button>
            <button 
              onClick={() => switchMode('IMPAR')} 
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${mode === 'IMPAR' ? 'bg-purple-500 text-white shadow-md scale-105' : 'text-gray-400 hover:text-gray-600'}`}
            >
              MESA IMPAR (5)
            </button>
          </div>
        </header>

        {/* Panel de Reglas Específicas */}
        <div className={`mb-10 p-6 rounded-3xl border-2 border-dashed ${mode === 'PAR' ? 'bg-pink-50/50 border-pink-200' : 'bg-purple-50/50 border-purple-200'}`}>
          <h4 className={`text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${mode === 'PAR' ? 'text-pink-700' : 'text-purple-700'}`}>
            <i className="fas fa-scroll"></i> Instrucciones del Reto {mode}
          </h4>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {mode === 'PAR' ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-pink-200 rounded-full flex items-center justify-center text-[10px] text-pink-700 font-bold shrink-0 mt-0.5">1</div>
                    <p className="text-sm text-gray-700 font-medium">Ubica a <strong>C</strong> en el asiento 1 (Arriba).</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-pink-200 rounded-full flex items-center justify-center text-[10px] text-pink-700 font-bold shrink-0 mt-0.5">2</div>
                    <p className="text-sm text-gray-700 font-medium"><strong>W</strong> debe estar exactamente frente a <strong>P</strong>.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-pink-200 rounded-full flex items-center justify-center text-[10px] text-pink-700 font-bold shrink-0 mt-0.5">3</div>
                    <p className="text-sm text-gray-700 font-medium"><strong>S</strong> debe estar exactamente frente a <strong>F</strong>.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-[10px] text-purple-700 font-bold shrink-0 mt-0.5">1</div>
                    <p className="text-sm text-gray-700 font-medium">Coloca a <strong>F</strong> en la cabecera (Arriba).</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-[10px] text-purple-700 font-bold shrink-0 mt-0.5">2</div>
                    <p className="text-sm text-gray-700 font-medium">A su <strong>Derecha</strong> ubica a <strong>W</strong> y <strong>S</strong>.</p>
                  </div>
                </>
              )}
            </div>
            <div className="space-y-3">
              {mode === 'PAR' ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-pink-200 rounded-full flex items-center justify-center text-[10px] text-pink-700 font-bold shrink-0 mt-0.5">4</div>
                    <p className="text-sm text-gray-700 font-medium"><strong>S</strong> está a la <strong>IZQUIERDA</strong> de <strong>X</strong>.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-pink-200 rounded-full flex items-center justify-center text-[10px] text-pink-700 font-bold shrink-0 mt-0.5">5</div>
                    <p className="text-sm text-gray-700 font-medium"><strong>P</strong> está sentado entre <strong>B</strong> y <strong>F</strong>.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-[10px] text-purple-700 font-bold shrink-0 mt-0.5">3</div>
                    <p className="text-sm text-gray-700 font-medium">A su <strong>Izquierda</strong> ubica a <strong>P</strong> y <strong>X</strong>.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-[10px] text-purple-700 font-bold shrink-0 mt-0.5">4</div>
                    <p className="text-sm text-gray-700 font-medium">A la <strong>Izquierda</strong> de <strong>X</strong> está <strong>S</strong>.</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4 p-3 bg-white rounded-2xl border border-gray-100">
             <div className="flex items-center gap-2 text-[9px] font-black text-gray-400">
               <i className="fas fa-info-circle text-blue-400 text-base"></i>
               <span>TIPS DE LATERALIDAD:</span>
             </div>
             <div className="flex gap-4">
                <span className="text-[9px] font-bold text-gray-500 flex items-center gap-1">
                  <i className="fas fa-redo text-pink-400"></i> Izquierda = Sentido Horario
                </span>
                <span className="text-[9px] font-bold text-gray-500 flex items-center gap-1">
                  <i className="fas fa-undo text-purple-400"></i> Derecha = Sentido Antihorario
                </span>
             </div>
          </div>
        </div>

        {/* Área de Interacción Circular */}
        <div className="flex flex-col md:flex-row gap-12 items-center justify-center mb-10">
          <div className="relative">
            <div className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full border-[12px] shadow-2xl flex items-center justify-center transition-colors duration-500 ${mode === 'PAR' ? 'bg-pink-50/30 border-pink-100' : 'bg-purple-50/30 border-purple-100'}`}>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-inner flex items-center justify-center mx-auto mb-2 border-2 border-gray-50">
                   <i className={`fas fa-users text-2xl ${mode === 'PAR' ? 'text-pink-300' : 'text-purple-300'}`}></i>
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Centro de Mesa</span>
              </div>

              {Array.from({ length: numSeats }).map((_, i) => {
                const angle = i * (360 / numSeats) - 90;
                const radius = mode === 'PAR' ? 110 : 100;
                const x = Math.cos(angle * Math.PI / 180) * radius;
                const y = Math.sin(angle * Math.PI / 180) * radius;
                
                return (
                  <div 
                    key={i}
                    onClick={() => toggleSeat(i)}
                    className="absolute w-14 h-14 md:w-16 md:h-16 flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                  >
                    <div className={`w-full h-full rounded-full border-4 border-dashed flex items-center justify-center transition-all ${seats[i] ? 'border-solid border-white bg-white scale-110 shadow-xl' : 'border-gray-200 hover:border-blue-300 bg-white/50'}`}>
                      {seats[i] ? (
                        <div className={`${seats[i]?.color} w-full h-full rounded-full flex items-center justify-center text-white font-black text-xs shadow-inner animate-pop`}>
                          {seats[i]?.name}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] text-gray-300 font-black">{i + 1}</span>
                          <i className="fas fa-plus text-[8px] text-gray-200 group-hover:text-blue-400 transition-colors"></i>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personas Disponibles */}
          <div className="flex flex-wrap md:flex-col gap-3 justify-center">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-1">Por Ubicar:</span>
             {available.map(p => (
               <div 
                key={p.id} 
                className={`${p.color} text-white px-4 py-2 rounded-2xl shadow-lg font-black text-xs min-w-[90px] text-center transform hover:scale-105 transition-all border-b-4 border-black/10`}
               >
                 {p.name}
               </div>
             ))}
             {available.length === 0 && (
               <div className="text-[10px] font-bold text-green-500 animate-pulse">
                 <i className="fas fa-check-double mr-2"></i> Todos ubicados
               </div>
             )}
          </div>
        </div>

        {feedback && (
          <div className={`p-4 rounded-2xl text-center text-xs font-black mb-6 animate-fadeIn ${feedback.includes('¡') ? 'bg-green-100 text-green-700 border-2 border-green-200' : 'bg-red-100 text-red-700 border-2 border-red-200'}`}>
            <i className={`fas ${feedback.includes('¡') ? 'fa-medal' : 'fa-exclamation-circle'} mr-2`}></i>
            {feedback}
          </div>
        )}

        {/* Footer de Navegación */}
        <div className="flex justify-between items-center border-t border-gray-100 pt-6">
          <button 
            onClick={() => switchMode(mode)} 
            className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all"
            title="Reiniciar mesa"
          >
            <i className="fas fa-sync-alt text-lg"></i>
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={() => { playSound('pop'); onBack(); }} 
              className="px-6 py-3 border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-xs hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <i className="fas fa-arrow-left"></i> ATRÁS
            </button>
            <button 
              onClick={check} 
              className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg hover:bg-blue-700 hover:shadow-blue-200 transform active:scale-95 transition-all"
            >
              VALIDAR MESA
            </button>
            <button 
              onClick={() => { playSound('pop'); onNext(); }} 
              className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-black text-xs shadow-lg hover:bg-purple-700 hover:shadow-purple-200 transform active:scale-95 transition-all flex items-center gap-2"
            >
              SIGUIENTE <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircularOrdering;
