
import React, { useState } from 'react';
import { playSound } from '../audio';

interface Props {
  onFinish: (score: number) => void;
  onBack: () => void;
}

const SCENARIOS = [
  {
    title: "El Caso de Mateo",
    p1: "Si Mateo aprueba el grado, entonces se irá de viaje.",
    p2: "Mateo aprobó el grado.",
    options: ["Mateo se fue de viaje.", "Mateo no se fue de viaje.", "Mateo repetirá el grado.", "No se puede saber."],
    answer: "Mateo se fue de viaje.",
    rule: "Modus Ponens: Si ocurre el antecedente, obligatoriamente ocurre el consecuente."
  },
  {
    title: "El Perro Guardian",
    p1: "Si la puerta está cerrada, el perro no entrará.",
    p2: "El perro entró a la casa.",
    options: ["La puerta estaba cerrada.", "La puerta estaba abierta.", "El perro rompió la puerta.", "No se puede concluir nada."],
    answer: "La puerta estaba abierta.",
    rule: "Modus Tollens: Si no ocurre el consecuente, es porque no ocurrió el antecedente (la puerta no estaba cerrada)."
  },
  {
    title: "Diego y Diana",
    p1: "Si llueve, Diego y Diana irán al cine.",
    p2: "Diego y Diana fueron al cine.",
    options: ["Llovió esa tarde.", "No llovió esa tarde.", "Hacía mucho frío.", "No se puede concluir."],
    answer: "No se puede concluir.",
    rule: "Falacia del Consecuente: Ellos pueden ir al cine por otras razones, no solo porque llueva."
  }
];

const InferenceRoom: React.FC<Props> = ({ onFinish, onBack }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showRule, setShowRule] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (opt: string) => {
    if (showRule) return;
    playSound('pop');
    setSelected(opt);
  };

  const handleVerify = () => {
    if (selected === SCENARIOS[current].answer) {
      playSound('success');
      setScore(s => s + 1);
    } else {
      playSound('error');
    }
    setShowRule(true);
  };

  const nextScenario = () => {
    playSound('pop');
    if (current < SCENARIOS.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowRule(false);
    } else {
      onFinish(score);
    }
  };

  const s = SCENARIOS[current];

  return (
    <div className="max-w-4xl mx-auto animate-slideIn px-4">
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border-4 border-emerald-50">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-4 py-1.5 rounded-full">Reto 3: El Oráculo</span>
            <h2 className="text-2xl font-black text-gray-800 mt-4">Inferencia Deductiva</h2>
          </div>
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-400 text-2xl shadow-inner border-2 border-emerald-100">
            <i className="fas fa-brain"></i>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-4">
             <div className="p-6 bg-emerald-50 rounded-3xl border-l-8 border-emerald-400">
               <span className="text-[10px] font-black uppercase text-emerald-600 block mb-2 tracking-widest">Premisa 1</span>
               <p className="text-gray-700 font-bold leading-relaxed">{s.p1}</p>
             </div>
             <div className="p-6 bg-blue-50 rounded-3xl border-l-8 border-blue-400">
               <span className="text-[10px] font-black uppercase text-blue-600 block mb-2 tracking-widest">Premisa 2</span>
               <p className="text-gray-700 font-bold leading-relaxed">{s.p2}</p>
             </div>
          </div>

          <div className="flex flex-col gap-3">
             <span className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest ml-1">¿Qué se concluye?</span>
             {s.options.map(opt => (
               <button
                 key={opt}
                 onClick={() => handleSelect(opt)}
                 disabled={showRule}
                 className={`p-4 rounded-2xl text-left text-sm font-bold border-2 transition-all transform active:scale-95 ${
                   selected === opt 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                    : 'border-gray-100 hover:border-emerald-200 text-gray-600'
                 } ${showRule && opt === s.answer ? 'border-green-500 bg-green-100 shadow-lg scale-105' : ''}`}
               >
                 <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${selected === opt ? 'bg-emerald-500 text-white' : 'border-gray-200'}`}>
                      {selected === opt && <i className="fas fa-check"></i>}
                    </div>
                    {opt}
                 </div>
               </button>
             ))}
          </div>
        </div>

        {showRule && (
          <div className={`p-8 rounded-[2rem] animate-fadeIn mb-8 border-4 border-dashed ${selected === s.answer ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <h4 className={`text-sm font-black uppercase tracking-widest mb-2 ${selected === s.answer ? 'text-green-700' : 'text-red-700'}`}>
              <i className="fas fa-lightbulb mr-2"></i> REGLA:
            </h4>
            <p className="text-gray-700 font-medium leading-relaxed italic">{s.rule}</p>
          </div>
        )}

        <div className="flex justify-between items-center">
           {!showRule ? (
             <button 
               onClick={handleVerify}
               disabled={!selected}
               className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-700 disabled:opacity-30 transition-all transform hover:-translate-y-1"
             >
               VERIFICAR
             </button>
           ) : (
             <button 
               onClick={nextScenario}
               className="px-12 py-4 bg-gray-800 text-white rounded-2xl font-black shadow-lg hover:bg-black transition-all transform hover:-translate-y-1"
             >
               {current === SCENARIOS.length -1 ? 'VER RESULTADOS' : 'SIGUIENTE CASO'}
             </button>
           )}
           <button onClick={onBack} className="text-gray-300 hover:text-gray-500 text-[10px] font-black uppercase tracking-widest">
             <i className="fas fa-undo mr-1"></i> Retroceder
           </button>
        </div>
      </div>
    </div>
  );
};

export default InferenceRoom;
