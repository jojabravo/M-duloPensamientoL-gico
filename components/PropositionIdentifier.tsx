
import React, { useState } from 'react';
import { playSound } from '../audio';

interface Props {
  onFinish: (score: number) => void;
  onBack: () => void;
}

const ITEMS = [
  { text: "¡Limpia tu cuarto ahora mismo!", type: "NONE", explanation: "Es una orden, no se puede decir si es verdadera o falsa." },
  { text: "El número 15 es divisible por 3.", type: "SIMPLE", explanation: "Es una idea única y verificable." },
  { text: "Estudio en Tolú o en Cartagena.", type: "COMP", explanation: "Contiene el conector 'o', uniendo dos ideas." },
  { text: "¿A qué hora comienza la clase?", type: "NONE", explanation: "Es una pregunta, no es proposición." },
  { text: "Todos los carros contaminan.", type: "SIMPLE", explanation: "Enunciado declarativo simple." },
  { text: "Si me esfuerzo mucho, entonces ganaré el premio.", type: "COMP", explanation: "Estructura condicional 'Si... entonces'." },
  { text: "Ojalá pasemos el examen de lógica.", type: "NONE", explanation: "Es un deseo o anhelo." },
  { text: "La Luna es de queso y el Sol es de fuego.", type: "COMP", explanation: "Une dos ideas con el conector 'y'." }
];

const PropositionIdentifier: React.FC<Props> = ({ onFinish, onBack }) => {
  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState<{ msg: string; correct: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('source', 'card');
    playSound('pop');
  };

  const handleDrop = (e: React.DragEvent, targetType: string) => {
    e.preventDefault();
    setDragOver(null);
    const item = ITEMS[current];
    if (targetType === item.type) {
      playSound('success');
      setFeedback({ msg: `¡Bien hecho! ${item.explanation}`, correct: true });
      setScore(s => s + 1);
    } else {
      playSound('error');
      setFeedback({ msg: `Ups... ${item.explanation}`, correct: false });
    }
  };

  const nextItem = () => {
    playSound('pop');
    setFeedback(null);
    if (current < ITEMS.length - 1) {
      setCurrent(c => c + 1);
    } else {
      onFinish(score);
    }
  };

  const item = ITEMS[current];

  return (
    <div className="max-w-5xl mx-auto animate-slideIn px-4">
      <div className="bg-white p-8 md:p-12 rounded-[4rem] shadow-2xl border-4 border-purple-50">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-50 px-4 py-1.5 rounded-full mb-2 inline-block">Misión 1: Clasificación de Enunciados</span>
            <h2 className="text-3xl font-black text-gray-800">El Clasificador Lógico</h2>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Puntos</span>
             <span className="text-3xl font-black text-purple-600">{score}/{ITEMS.length}</span>
          </div>
        </header>

        <div className="grid md:grid-cols-4 gap-8">
           {/* Columna de la tarjeta actual */}
           <div className="md:col-span-1 flex flex-col items-center justify-start">
              <span className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest text-center">Enunciado a Clasificar</span>
              {!feedback ? (
                <div 
                  draggable="true"
                  onDragStart={handleDragStart}
                  className="w-full aspect-[4/5] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 flex items-center justify-center text-center shadow-2xl cursor-grab active:cursor-grabbing transform hover:scale-105 transition-all border-4 border-white/20 relative"
                >
                   <div className="absolute top-4 left-4 text-white/20 text-3xl"><i className="fas fa-quote-left"></i></div>
                   <p className="text-white font-bold text-lg leading-snug drop-shadow-md italic">
                     {item.text}
                   </p>
                   <div className="absolute bottom-4 flex flex-col items-center">
                      <i className="fas fa-hand-pointer text-white/40 text-xl animate-bounce mb-1"></i>
                      <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">Arrástrame</span>
                   </div>
                </div>
              ) : (
                <div className="w-full aspect-[4/5] bg-gray-100 rounded-3xl flex items-center justify-center border-4 border-dashed border-gray-200">
                   <i className="fas fa-check-circle text-gray-200 text-6xl"></i>
                </div>
              )}
           </div>

           {/* Zona de Drop Buckets */}
           <div className="md:col-span-3">
              {!feedback ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 h-full">
                   {[
                     { id: 'SIMPLE', title: 'Prop. Simples', icon: 'fa-atom', color: 'blue' },
                     { id: 'COMP', title: 'Prop. Compuestas', icon: 'fa-project-diagram', color: 'purple' },
                     { id: 'NONE', title: 'No Proposición', icon: 'fa-ban', color: 'red' }
                   ].map(bucket => (
                     <div 
                        key={bucket.id}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(bucket.id); }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={(e) => handleDrop(e, bucket.id)}
                        className={`p-8 rounded-[3rem] border-4 border-dashed flex flex-col items-center justify-center text-center transition-all min-h-[250px] ${dragOver === bucket.id ? `bg-${bucket.color}-50 border-${bucket.color}-400 scale-105 shadow-xl` : 'bg-gray-50 border-gray-200 opacity-60'}`}
                     >
                        <div className={`w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center text-2xl text-${bucket.color}-400 mb-4`}>
                           <i className={`fas ${bucket.icon}`}></i>
                        </div>
                        <h4 className={`text-sm font-black text-${bucket.color}-600 uppercase mb-2`}>{bucket.title}</h4>
                        <p className="text-[10px] text-gray-400 font-bold leading-tight">Suelta aquí si crees que es {bucket.title.toLowerCase()}</p>
                     </div>
                   ))}
                </div>
              ) : (
                <div className={`h-full flex flex-col items-center justify-center p-12 rounded-[3.5rem] animate-fadeIn border-8 ${feedback.correct ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                   <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-6 text-white shadow-xl ${feedback.correct ? 'bg-green-500' : 'bg-red-500'}`}>
                      <i className={`fas ${feedback.correct ? 'fa-check-double' : 'fa-info'}`}></i>
                   </div>
                   <h3 className={`text-2xl font-black mb-2 ${feedback.correct ? 'text-green-800' : 'text-red-800'}`}>
                     {feedback.correct ? '¡Exacto!' : '¡Análisis Lógico!'}
                   </h3>
                   <p className="text-gray-600 font-medium text-center mb-10 max-w-md leading-relaxed">
                     {feedback.msg}
                   </p>
                   <button 
                     onClick={nextItem}
                     className="px-16 py-5 bg-gray-800 text-white rounded-[2rem] font-black text-lg hover:bg-black transition-all shadow-xl active:scale-95"
                   >
                     {current === ITEMS.length - 1 ? 'FINALIZAR RETO' : 'CONTINUAR'} <i className="fas fa-arrow-right ml-2"></i>
                   </button>
                </div>
              )}
           </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
           <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
             <i className="fas fa-times mr-2"></i> Abortar Misión
           </button>
           <div className="flex gap-2">
             {ITEMS.map((_, i) => (
               <div key={i} className={`h-2 w-6 rounded-full transition-all ${i === current ? 'bg-purple-600 w-12 shadow-sm' : i < current ? 'bg-purple-200' : 'bg-gray-100'}`}></div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default PropositionIdentifier;
