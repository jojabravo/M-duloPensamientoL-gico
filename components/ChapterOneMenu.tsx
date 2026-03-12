
import React from 'react';
import { playSound } from '../audio';
import { StudentProfile } from '../types';

interface Props {
  student: StudentProfile;
  onSelectModule: (moduleId: string) => void;
  onBack: () => void;
}

const ChapterOneMenu: React.FC<Props> = ({ student, onSelectModule, onBack }) => {
  const modules = [
    {
      id: 'ordering',
      title: 'Ordenamiento de la Información',
      icon: 'fa-layer-group',
      color: 'bg-purple-600',
      active: true,
      desc: 'Lineal (horizontal y vertical), circular y tablas de doble entrada.',
      progress: student.progreso_ordenamiento || 0
    },
    {
      id: 'logic',
      title: 'Proposiciones Lógicas',
      icon: 'fa-project-diagram',
      color: 'bg-blue-500',
      active: (student.progreso_ordenamiento || 0) >= 60,
      desc: 'Definición, tipos, conectores, simbologías y reglas de inferencia.',
      required: 'Supera Ordenamiento (60%)',
      progress: student.progreso_proposiciones || 0
    },
    {
      id: 'quantifiers',
      title: 'Cuantificadores Lógicos',
      icon: 'fa-infinity',
      color: 'bg-pink-500',
      active: (student.progreso_proposiciones || 0) >= 60,
      desc: 'Videojuego: Reconocimiento, simbolización y negación de cuantificadores.',
      required: 'Supera Proposiciones (60%)',
      progress: student.progreso_cuantificadores || 0
    },
    {
      id: 'microbit',
      title: 'Microbit en Lógica',
      icon: 'fa-microchip',
      color: 'bg-emerald-500',
      active: (student.progreso_cuantificadores || 0) >= 60,
      desc: 'Programación lógica aplicada a dispositivos Microbit reales y virtuales.',
      required: 'Supera Cuantificadores (60%)',
      progress: student.progreso_microbit || 0
    }
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn px-4">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => { playSound('pop'); onBack(); }}
          className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-400 hover:text-purple-600 transition-all"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h2 className="text-2xl font-black text-gray-800">Capítulo 1: Pensamiento Verbal</h2>
          <p className="text-gray-500 text-sm font-medium">Selecciona un módulo de aprendizaje</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
        {modules.map(m => (
          <div 
            key={m.id}
            onClick={() => m.active && (playSound('pop'), onSelectModule(m.id))}
            className={`group p-8 md:p-10 rounded-[2.5rem] border-4 transition-all relative ${m.active ? 'bg-white border-purple-50 hover:border-purple-400 hover:shadow-2xl cursor-pointer shadow-xl' : 'bg-gray-50 border-gray-100 grayscale opacity-60 cursor-not-allowed'}`}
          >
            <div className="flex flex-col gap-6 items-center text-center">
              <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-white text-4xl md:text-5xl shadow-lg shrink-0 ${m.color}`}>
                <i className={`fas ${m.icon}`}></i>
              </div>
              <div className="flex-grow w-full">
                <h3 className="font-black text-gray-800 text-xl md:text-2xl mb-3 tracking-tight leading-tight">{m.title}</h3>
                
                {/* Progress Bar */}
                {m.active && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progreso General</span>
                      <span className="text-[10px] font-black text-purple-600">{Math.round(m.progress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${m.color} transition-all duration-1000`} 
                        style={{ width: `${m.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-medium">{m.desc}</p>
                
                {m.active && (
                  <div className="mt-4 flex justify-center">
                    <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                      Escala:
                    </span>
                  </div>
                )}
                {!m.active ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <span className="inline-block text-[9px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                      <i className="fas fa-lock mr-1"></i> Bloqueado
                    </span>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">
                      Requisito: {m.required}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center text-xs font-black text-purple-600 group-hover:translate-x-2 transition-transform">
                    <span>{m.progress > 0 ? 'CONTINUAR MÓDULO' : 'INICIAR MÓDULO'}</span>
                    <i className="fas fa-arrow-right ml-2"></i>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterOneMenu;
