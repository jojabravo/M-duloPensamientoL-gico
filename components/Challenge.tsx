
import React, { useState } from 'react';
import { playSound } from '../audio';
import { StudentProfile } from '../types';

interface Props {
  student: StudentProfile;
  onFinish: (score: number) => void;
  onBack: () => void;
}

const PROBLEMS = [
  {
    id: 1,
    title: "Reto 1: Escaladores",
    question: "Cinco amigos escalan una montaña: Arturo está más arriba que Paulo. Paulo está entre Hugo y Fernando. Walter está más abajo que Hugo. Si Arturo está en la cima, ¿quién está en el último lugar?",
    options: ["Paulo", "Hugo", "Walter", "Fernando"],
    answer: "Walter",
    explanation: "Arturo (cima) > Fernando/Hugo > Paulo > Hugo/Fernando > Walter (fondo)."
  },
  {
    id: 2,
    title: "Reto 2: Oficinas del Edificio",
    question: "En un edificio de 4 pisos funcionan las oficinas de Pedidos, Gestión, Comercial y Contabilidad. Pedidos está un piso arriba de Gestión. Comercial está un piso abajo de Gestión. Si Contabilidad está en el cuarto piso, ¿qué oficina está en el primer piso?",
    options: ["Pedidos", "Gestión", "Comercial", "Contabilidad"],
    answer: "Comercial",
    explanation: "4. Contabilidad, 3. Pedidos, 2. Gestión, 1. Comercial."
  },
  {
    id: 3,
    title: "Reto 3: Mesa Circular",
    question: "Cuatro amigos (A, B, C, D) se sientan en una mesa circular con 4 asientos distribuidos simétricamente. Si A se sienta frente a C y B se sienta a la izquierda de A, ¿quién se sienta a la derecha de A?",
    options: ["B", "C", "D", "Nadie"],
    answer: "D",
    explanation: "Frente a A: C. Izquierda: B. Derecha: D."
  },
  {
    id: 4,
    title: "Reto 4: Las Mascotas",
    question: "Luis, Ana y Beto tienen una mascota diferente cada uno: Perro, Gato y Loro. Luis tiene el gato. Beto no tiene el perro. ¿Qué mascota tiene Ana?",
    options: ["Loro", "Perro", "Gato", "Hámster"],
    answer: "Perro",
    explanation: "Luis: Gato. Beto: Loro. Ana: Perro."
  },
  {
    id: 5,
    title: "Reto 5: Globos de Colores",
    question: "Javi, Lola, Dani y Sol tienen globos de colores: Rojo, Azul, Verde y Amarillo. Sol tiene el verde. El globo de Dani no es ni rojo ni azul. Javi tiene el rojo. ¿De qué color es el globo de Lola?",
    options: ["Azul", "Amarillo", "Verde", "Rojo"],
    answer: "Azul",
    explanation: "Sol: Verde. Javi: Rojo. Dani: Amarillo. Lola: Azul."
  }
];

const Challenge: React.FC<Props> = ({ student, onFinish, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleVerify = () => {
    if (selectedOption === PROBLEMS[currentStep].answer) {
      playSound('success');
      setScore(s => s + 1);
    } else {
      playSound('error');
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    playSound('pop');
    if (currentStep < PROBLEMS.length - 1) {
      setCurrentStep(s => s + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      onFinish(score);
    }
  };

  const p = PROBLEMS[currentStep];

  return (
    <div className="max-w-2xl mx-auto animate-slideIn px-4">
      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-purple-50">
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-8 text-white text-center">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-4 py-1.5 rounded-full mb-4 inline-block">Evaluación: Ordenamiento</span>
          <h3 className="text-2xl font-black">{p.title}</h3>
        </div>

        <div className="p-8 md:p-10">
          <div className="bg-blue-50 p-6 rounded-3xl mb-8 border-l-8 border-blue-400">
            <p className="text-gray-700 font-bold italic leading-relaxed">"{p.question}"</p>
          </div>

          <div className="grid gap-3 mb-10">
            {p.options.map(opt => (
              <button
                key={opt}
                disabled={showFeedback}
                onClick={() => { playSound('pop'); setSelectedOption(opt); }}
                className={`w-full p-5 rounded-2xl border-2 text-left font-bold transition-all ${
                  selectedOption === opt 
                    ? 'border-purple-500 bg-purple-50 text-purple-700' 
                    : 'border-gray-100 bg-white hover:border-purple-200 text-gray-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {showFeedback && (
            <div className={`mb-8 p-6 rounded-3xl animate-fadeIn ${selectedOption === p.answer ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <p className="text-xs font-medium text-gray-600 leading-relaxed">
                <strong className="uppercase mr-2">{selectedOption === p.answer ? '¡Correcto!' : 'Respuesta:'}</strong> 
                {p.explanation}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <button onClick={onBack} className="text-gray-400 font-black text-xs uppercase tracking-widest">Salir</button>
            {!showFeedback ? (
              <button onClick={handleVerify} disabled={!selectedOption} className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg disabled:opacity-30 transition-all">
                VERIFICAR
              </button>
            ) : (
              <button onClick={handleNext} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg transition-all">
                {currentStep === PROBLEMS.length - 1 ? 'FINALIZAR RETO' : 'SIGUIENTE'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenge;
