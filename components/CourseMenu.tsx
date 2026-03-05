
import React from 'react';
import { playSound } from '../audio';

interface Props {
  onSelect: () => void;
  onShowResults: () => void;
}

const CourseMenu: React.FC<Props> = ({ onSelect, onShowResults }) => {
  const sections = [
    { 
      id: 'verbal', 
      title: 'CAPÍTULO 1: PENSAMIENTO VERBAL', 
      icon: 'fa-font', 
      color: 'bg-purple-600', 
      active: true,
      desc: 'Ordenamiento de la información, lógica verbal y deducción.'
    },
    { 
      id: 'num', 
      title: 'CAPÍTULO 2: PENSAMIENTO NUMÉRICO', 
      icon: 'fa-arrow-up-9-1', 
      color: 'bg-blue-500', 
      active: false,
      desc: 'Sucesiones, series numéricas y razonamiento matemático.'
    },
    { 
      id: 'esp', 
      title: 'CAPÍTULO 3: PENSAMIENTO ESPACIAL', 
      icon: 'fa-cube', 
      color: 'bg-pink-500', 
      active: false,
      desc: 'Rotaciones, vistas de sólidos y ubicación en el espacio.'
    },
    { 
      id: 'abs', 
      title: 'CAPÍTULO 4: PENSAMIENTO ABSTRACTO', 
      icon: 'fa-shapes', 
      color: 'bg-emerald-500', 
      active: false,
      desc: 'Patrones visuales, analogías gráficas y matrices.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-black text-gray-800">Unidades de Aprendizaje</h2>
          <p className="text-gray-500 font-medium text-sm">Selecciona la unidad para continuar tu formación</p>
        </div>
        <button 
          onClick={() => { playSound('pop'); onShowResults(); }}
          className="px-6 py-3 bg-white border-2 border-purple-100 rounded-2xl font-black text-purple-600 shadow-sm hover:shadow-xl hover:bg-purple-50 transition-all flex items-center gap-2"
        >
          <i className="fas fa-file-invoice"></i> VER MI REPORTE
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {sections.map(s => (
          <div 
            key={s.id}
            onClick={() => s.active && (playSound('pop'), onSelect())}
            className={`group p-6 rounded-[2.5rem] border-4 transition-all relative ${s.active ? 'bg-white border-purple-50 hover:border-purple-400 hover:shadow-2xl cursor-pointer shadow-xl' : 'bg-gray-50 border-gray-100 grayscale opacity-60 cursor-not-allowed'}`}
          >
            <div className="flex gap-6 items-center">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white text-3xl shadow-lg shrink-0 ${s.color}`}>
                <i className={`fas ${s.icon}`}></i>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-gray-800 text-lg">{s.title}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-snug">{s.desc}</p>
                {!s.active ? (
                  <span className="inline-block mt-3 text-[9px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                    <i className="fas fa-clock mr-1"></i> Muy pronto habilitaremos este espacio
                  </span>
                ) : (
                  <div className="mt-4 flex items-center text-xs font-black text-purple-600 group-hover:translate-x-2 transition-transform">
                    <span>EXPLORAR MÓDULOS</span>
                    <i className="fas fa-arrow-right ml-2"></i>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 bg-white/50 border border-purple-100 p-6 rounded-3xl text-center">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">Metodología de Evaluación</p>
        <p className="text-sm text-gray-600 mt-2">
          Los resultados se muestran por cada capítulo y subcontenido, discriminado por <strong>Ejemplos</strong> (Simulaciones) y <strong>Retos</strong> (Evaluación Final).
        </p>
      </div>
    </div>
  );
};

export default CourseMenu;
