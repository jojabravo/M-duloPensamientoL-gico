
import React, { useState } from 'react';
import { playSound } from '../audio';
import { StudentProfile } from '../types';

interface Props {
  student: StudentProfile;
  onBack: () => void;
  onComplete: (progress: number) => void;
}

const HiddenMessage: React.FC<Props> = ({ student, onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      const newCompleted = [...completedSteps, stepId];
      setCompletedSteps(newCompleted);
      playSound('success');
      
      // Calculate progress based on steps (3 main steps)
      const progress = Math.round((newCompleted.length / 3) * 100);
      onComplete(progress);
    }
    if (step < 3) setStep(step + 1);
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100">
        <h4 className="text-xl font-black text-blue-800 mb-2 flex items-center gap-2">
          <i className="fas fa-play-circle"></i> Fase 1: USA
        </h4>
        <p className="text-gray-600 font-medium">
          Primero, vamos a ver cómo funciona un mensaje básico en la micro:bit. 
          Entra a <a href="https://makecode.microbit.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">MakeCode micro:bit</a> y crea un nuevo proyecto.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Instrucciones:</p>
          <ul className="space-y-3">
            <li className="flex gap-3 text-sm font-medium text-gray-700">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[10px]">1</span>
              Busca el bloque <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-700 font-bold">al presionar el botón A</span>.
            </li>
            <li className="flex gap-3 text-sm font-medium text-gray-700">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[10px]">2</span>
              Dentro, coloca el bloque <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-700 font-bold">mostrar cadena "Hello!"</span>.
            </li>
            <li className="flex gap-3 text-sm font-medium text-gray-700">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[10px]">3</span>
              Prueba el simulador presionando el botón A.
            </li>
          </ul>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-blue-50">
          <img 
            src="https://i.postimg.cc/vBMMK32r/boton-A.png" 
            alt="Bloque Botón A" 
            className="rounded-lg w-full object-contain"
            referrerPolicy="no-referrer"
          />
          <p className="text-[10px] text-gray-400 mt-2 text-center font-bold uppercase tracking-widest">Referencia: Bloque de entrada</p>
        </div>
      </div>

      <button 
        onClick={() => handleStepComplete(1)}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all"
      >
        ¡LISTO, YA LO PROBÉ!
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-purple-50 p-6 rounded-3xl border-2 border-purple-100">
        <h4 className="text-xl font-black text-purple-800 mb-2 flex items-center gap-2">
          <i className="fas fa-edit"></i> Fase 2: MODIFICA
        </h4>
        <p className="text-gray-600 font-medium">
          Ahora vamos a darle un toque de misterio. Vamos a usar un <strong>Criptograma</strong> simple: cada letra será un número.
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Tu Clave Secreta:</p>
        <div className="flex flex-wrap gap-4 justify-center">
          {['H=1', 'O=2', 'L=3', 'A=4'].map(pair => (
            <div key={pair} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-black text-lg border-2 border-purple-200">
              {pair}
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-700">Reto de Modificación:</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Cambia el bloque para que al presionar el botón B, la micro:bit muestre los números: <span className="font-black text-purple-600">1 - 2 - 3 - 4</span>.
            ¡Solo quien tenga la clave sabrá que dice "HOLA"!
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-purple-50">
          <img 
            src="https://i.postimg.cc/8kHqbL2x/2Modifica.png" 
            alt="Reto Modifica" 
            className="rounded-lg w-full object-contain"
            referrerPolicy="no-referrer"
          />
          <p className="text-[10px] text-gray-400 mt-2 text-center font-bold uppercase tracking-widest">Referencia: Bloque de salida</p>
        </div>
      </div>

      <button 
        onClick={() => handleStepComplete(2)}
        className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg hover:bg-purple-700 transition-all"
      >
        ¡MODIFICACIÓN COMPLETADA!
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-100">
        <h4 className="text-xl font-black text-emerald-800 mb-2 flex items-center gap-2">
          <i className="fas fa-magic"></i> Fase 3: CREA
        </h4>
        <p className="text-gray-600 font-medium">
          ¡Es hora de crear tu propio sistema de espionaje!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border-2 border-emerald-50 shadow-sm space-y-4">
          <h5 className="font-black text-gray-800 text-sm uppercase tracking-tight">Tu Misión Final:</h5>
          <ol className="text-xs text-gray-600 space-y-2 list-decimal ml-4 font-medium">
            <li>Inventa un código para 3 palabras (ej: 1=SI, 2=NO, 3=TAL VEZ).</li>
            <li>Usa el bloque <span className="font-bold text-emerald-600">al agitar</span> para mostrar tu mensaje secreto.</li>
            <li>Si tienes una micro:bit física, ¡descarga el código y pruébalo!</li>
          </ol>
        </div>
        <div className="bg-emerald-600 p-6 rounded-3xl text-white flex flex-col items-center justify-center text-center">
          <i className="fas fa-user-secret text-4xl mb-4"></i>
          <p className="font-black text-sm uppercase tracking-widest">Agente Cripto-Lógico</p>
          <p className="text-[10px] opacity-80 mt-2">Usa la lógica para proteger tus mensajes.</p>
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
        <p className="text-[10px] text-amber-800 font-bold leading-tight">
          <i className="fas fa-info-circle mr-1"></i> 
          Tip: Puedes usar el bloque "mostrar icono" para enviar señales visuales secretas en lugar de texto.
        </p>
      </div>

      <button 
        onClick={() => { handleStepComplete(3); playSound('finish'); }}
        className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all text-lg"
      >
        ¡MISIÓN CUMPLIDA, SOY UN EXPERTO!
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-slideIn px-4 py-8">
      <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-rose-50 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-rose-500 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl rotate-12">
            <i className="fas fa-envelope-open-text"></i>
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => { playSound('pop'); onBack(); }}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/20 px-4 py-1.5 rounded-full mb-2 inline-block">
                  Capítulo 2 • Bloque 4
                </span>
                <h3 className="text-3xl font-black tracking-tight">Mensaje Oculto con micro:bit</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-gray-50 p-4 flex justify-center gap-4 border-b border-gray-100">
          {[1, 2, 3].map(i => (
            <div 
              key={i}
              onClick={() => i <= (completedSteps.length + 1) && setStep(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                step === i 
                  ? 'bg-rose-600 text-white shadow-lg scale-105' 
                  : completedSteps.includes(i)
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-200 text-gray-400 opacity-50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center ${step === i ? 'bg-white text-rose-600' : 'bg-current opacity-20'}`}>
                {completedSteps.includes(i) ? <i className="fas fa-check"></i> : i}
              </span>
              {i === 1 ? 'Usa' : i === 2 ? 'Modifica' : 'Crea'}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-8 md:p-12">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Entorno de trabajo: <span className="text-rose-500">MakeCode micro:bit</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HiddenMessage;
