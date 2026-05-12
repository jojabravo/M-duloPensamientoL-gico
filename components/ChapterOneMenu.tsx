
import React from 'react';
import { playSound } from '../audio';
import { StudentProfile, AppConfig } from '../types';

interface Props {
  student: StudentProfile;
  config: AppConfig;
  onSelectModule: (moduleId: string) => void;
  onBack: () => void;
}

const ChapterOneMenu: React.FC<Props> = ({ student, config, onSelectModule, onBack }) => {
  const isTestUser = student.Usuario === 'estudiante.prueba';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch (e) {
      return null;
    }
  };

  const modules = [
    {
      id: 'ordering',
      title: 'Ordenamiento de la Información',
      icon: 'fa-layer-group',
      color: 'bg-purple-600',
      active: true,
      desc: 'Lineal (horizontal y vertical), circular y tablas de doble entrada.',
      progress: student.progreso_ordenamiento || 0,
      start: config.capitulo_1_inicio,
      end: config.capitulo_1_fin
    },
    {
      id: 'logic',
      title: 'Proposiciones Lógicas',
      icon: 'fa-project-diagram',
      color: 'bg-blue-500',
      active: isTestUser || (student.progreso_ordenamiento || 0) >= 60,
      desc: 'Definición, tipos, conectores, simbologías y reglas de inferencia.',
      required: 'Supera Ordenamiento (60%)',
      progress: student.progreso_proposiciones || 0,
      start: config.capitulo_1_inicio,
      end: config.capitulo_1_fin
    },
    {
      id: 'quantifiers',
      title: 'Cuantificadores Lógicos',
      icon: 'fa-infinity',
      color: 'bg-pink-500',
      active: isTestUser || (student.progreso_proposiciones || 0) >= 60,
      desc: 'Videojuego: Reconocimiento, simbolización y negación de cuantificadores.',
      required: 'Supera Proposiciones (60%)',
      progress: student.progreso_cuantificadores || 0,
      start: config.capitulo_1_inicio,
      end: config.capitulo_1_fin
    },
    {
      id: 'microbit',
      title: 'Microbit en Lógica',
      icon: 'fa-microchip',
      color: 'bg-emerald-500',
      active: isTestUser || (student.progreso_cuantificadores || 0) >= 60,
      desc: 'Programación lógica aplicada a dispositivos Microbit reales y virtuales.',
      required: 'Supera Cuantificadores (60%)',
      progress: student.progreso_microbit || 0,
      start: config.capitulo_1_inicio,
      end: config.capitulo_1_fin
    }
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn px-4 py-8">
      <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-purple-50 overflow-hidden mb-12">
        {/* Header Banner */}
        <div className="bg-purple-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl rotate-12">
            <i className="fas fa-book"></i>
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
                  Fase de Entrenamiento
                </span>
                <h3 className="text-3xl font-black tracking-tight">Capítulo 1: Pensamiento Verbal</h3>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-purple-100 font-black text-[10px] uppercase tracking-[0.2em]">Misión: Análisis de Información</p>
              {config.capitulo_1_inicio && config.capitulo_1_fin && (
                <p className="text-white text-[9px] font-bold uppercase tracking-tight mt-1">
                  Abierto: {formatDate(config.capitulo_1_inicio)} - {formatDate(config.capitulo_1_fin)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Narrativa del Capítulo */}
        <div className="p-8 bg-purple-50/30">
          <div className="bg-purple-600/10 p-8 rounded-[2.5rem] border-2 border-purple-100 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-purple-600 rounded-3xl flex items-center justify-center text-4xl text-white shadow-lg shrink-0">
                <i className="fas fa-project-diagram"></i>
              </div>
              <div>
                <p className="text-purple-900 font-medium leading-relaxed">
                  ¡Inicia tu camino como Agente Lógico! En este primer capítulo, exploraremos el poder de las palabras 
                  y la estructura del pensamiento. Aprenderás a ordenar información compleja, identificar proposiciones 
                  y dominar los cuantificadores. ¡Sienta las bases de tu razonamiento crítico!
                </p>
              </div>
            </div>
          </div>
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
                <h3 className="font-black text-gray-800 text-xl md:text-2xl mb-1 tracking-tight leading-tight">{m.title}</h3>
                
                {/* Fechas de disponibilidad */}
                {(m.start || m.end) && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase tracking-tighter">
                      <i className="far fa-calendar-alt mr-1"></i>
                      {m.start ? formatDate(m.start) : 'Abierto'} - {m.end ? formatDate(m.end) : 'Sinfín'}
                    </span>
                  </div>
                )}
                
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
