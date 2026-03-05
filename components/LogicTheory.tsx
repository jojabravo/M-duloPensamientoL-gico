
import React from 'react';
import { playSound } from '../audio';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const LogicTheory: React.FC<Props> = ({ onNext, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto animate-fadeIn px-4">
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border-4 border-blue-50">
        <header className="mb-10 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 bg-blue-50 px-4 py-1.5 rounded-full">Teoría Lógica</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-800 mt-4">Proposiciones Lógicas</h2>
          <p className="text-gray-500 mt-2 font-medium">El lenguaje de la verdad y la razón</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl transform hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl mb-4">
              <i className="fas fa-check-double"></i>
            </div>
            <h3 className="text-xl font-bold mb-3">¿Qué es una Proposición?</h3>
            <p className="text-blue-50 text-sm leading-relaxed">
              Es una oración o enunciado que tiene la propiedad de ser <strong>verdadero (V)</strong> o <strong>falso (F)</strong>, pero nunca ambos a la vez.
            </p>
            <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/20">
              <p className="text-[10px] font-black uppercase mb-2 tracking-widest text-blue-200">Ejemplo:</p>
              <p className="text-xs italic font-medium">"El número 7 es un número primo." (Es V)</p>
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200">
             <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
               <i className="fas fa-times-circle text-red-400"></i> ¿Qué NO es una Proposición?
             </h3>
             <ul className="space-y-4">
                <li className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs shrink-0 group-hover:bg-red-500 group-hover:text-white transition-all">
                    <i className="fas fa-question"></i>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">Preguntas: "¿Cómo estás?"</span>
                </li>
                <li className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs shrink-0 group-hover:bg-red-500 group-hover:text-white transition-all">
                    <i className="fas fa-exclamation"></i>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">Órdenes: "¡Limpia tu cuarto!"</span>
                </li>
                <li className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs shrink-0 group-hover:bg-red-500 group-hover:text-white transition-all">
                    <i className="fas fa-heart"></i>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">Deseos: "Ojalá llueva mañana."</span>
                </li>
             </ul>
          </div>
        </div>

        <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-3xl text-blue-500 shadow-inner shrink-0">
             <i className="fas fa-layer-group"></i>
          </div>
          <div>
            <h4 className="text-lg font-black text-blue-800 mb-1">Tipos de Proposiciones</h4>
            <p className="text-sm text-blue-600 leading-relaxed font-medium">
              <strong>Simples (Atómicas):</strong> Una sola idea sin conectores. <br/>
              <strong>Compuestas (Moleculares):</strong> Dos o más ideas unidas por conectores como "y", "o", "si... entonces".
            </p>
          </div>
        </div>

        <div className="mt-12 flex justify-between items-center">
          <button 
            onClick={() => { playSound('pop'); onBack(); }}
            className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i> Volver al menú
          </button>
          <button 
            onClick={() => { playSound('pop'); onNext(); }}
            className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-blue-700 hover:shadow-blue-200 transform hover:-translate-y-1 transition-all"
          >
            EMPEZAR RETOS <i className="fas fa-bolt ml-2 text-yellow-400"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogicTheory;
