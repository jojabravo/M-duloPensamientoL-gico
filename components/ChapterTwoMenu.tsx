
import React from 'react';
import { playSound } from '../audio';
import { StudentProfile, AppConfig } from '../types';

interface Props {
  student: StudentProfile;
  config: AppConfig;
  onSelectModule: (moduleId: string) => void;
  onBack: () => void;
}

const ChapterTwoMenu: React.FC<Props> = ({ student, config, onSelectModule, onBack }) => {
  const isTestUser = student.Usuario === 'estudiante.prueba';

  const isAvailable = (active: boolean, start?: string, end?: string) => {
    if (isTestUser) return true;
    if (active === false) return false;
    
    const now = new Date();
    if (start) {
      const startDate = new Date(start);
      if (now < startDate) return false;
    }
    if (end) {
      const endDate = new Date(end);
      if (now > endDate) return false;
    }
    return true;
  };

  const modules = [
    {
      id: 'criptogramas',
      title: 'Bloque 1: Criptogramas',
      icon: 'fa-magnifying-glass',
      color: 'bg-orange-500',
      active: isAvailable(config.ch2_bloque1_activo !== false, config.ch2_bloque1_inicio, config.ch2_bloque1_fin),
      desc: 'Descifra números tras letras y símbolos en operaciones matemáticas.',
      progress: student.progreso_criptogramas || 0,
      required: 'Habilitación por fecha'
    },
    {
      id: 'ecuaciones',
      title: 'Bloque 2: Ecuaciones Gráficas',
      icon: 'fa-scale-balanced',
      color: 'bg-emerald-500',
      active: isAvailable(config.ch2_bloque2_activo !== false, config.ch2_bloque2_inicio, config.ch2_bloque2_fin) && (isTestUser || (student.progreso_criptogramas || 0) >= 60),
      desc: 'Determina el valor de figuras geométricas en sistemas visuales equilibrados.',
      required: (student.progreso_criptogramas || 0) < 60 ? 'Supera Criptogramas (60%)' : 'Habilitación por fecha',
      progress: student.progreso_ecuaciones_graficas || 0
    },
    {
      id: 'block3',
      title: 'Bloque 3: Crucinúmeros y Retos',
      icon: 'fa-puzzle-piece',
      color: 'bg-amber-500',
      active: isAvailable(config.ch2_bloque3_activo !== false, config.ch2_bloque3_inicio, config.ch2_bloque3_fin) && (isTestUser || (student.progreso_ecuaciones_graficas || 0) >= 60),
      desc: 'Crucinúmeros, Pirámides, Cuadrados Mágicos y Sudoku Detective.',
      required: (student.progreso_ecuaciones_graficas || 0) < 60 ? 'Supera Ecuaciones (60%)' : 'Habilitación por fecha',
      progress: ((student.progreso_crucinumeros || 0) + (student.progreso_sudoku || 0) + (student.progreso_magic_squares || 0) + (student.progreso_piramides || 0)) / 4
    },
    {
      id: 'mensaje_oculto',
      title: 'Bloque 4: Mensaje Oculto',
      icon: 'fa-envelope-open-text',
      color: 'bg-rose-500',
      active: isAvailable(config.ch2_bloque4_activo !== false, config.ch2_bloque4_inicio, config.ch2_bloque4_fin) && (isTestUser || (((student.progreso_crucinumeros || 0) + (student.progreso_sudoku || 0) + (student.progreso_magic_squares || 0) + (student.progreso_piramides || 0)) / 4) >= 60),
      desc: 'Crea y descifra códigos secretos utilizando lógica matemática.',
      required: (((student.progreso_crucinumeros || 0) + (student.progreso_sudoku || 0) + (student.progreso_magic_squares || 0) + (student.progreso_piramides || 0)) / 4) < 60 ? 'Supera Bloque 3 (60%)' : 'Habilitación por fecha',
      progress: student.progreso_mensaje_oculto || 0
    }
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn px-4 py-8">
      <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-orange-50 overflow-hidden mb-12">
        {/* Header Banner */}
        <div className="bg-orange-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl rotate-12">
            <i className="fas fa-brain"></i>
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
                <h3 className="text-3xl font-black tracking-tight">Capítulo 2: Pensamiento Lógico Matemático</h3>
              </div>
            </div>
            <div className="hidden md:block">
              <p className="text-orange-100 font-black text-xs uppercase tracking-[0.2em]">Misión: Desafío Numérico</p>
            </div>
          </div>
        </div>

        {/* Narrativa del Capítulo */}
        <div className="p-8 bg-orange-50/30">
          <div className="bg-orange-600/10 p-8 rounded-[2.5rem] border-2 border-orange-100 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center text-4xl text-white shadow-lg shrink-0">
                <i className="fas fa-calculator"></i>
              </div>
              <div>
                <p className="text-orange-900 font-medium leading-relaxed">
                  ¡Bienvenido al segundo nivel de tu formación como Agente Lógico! Aquí pondrás a prueba tu capacidad 
                  de razonamiento numérico y espacial. Desde descifrar mensajes ocultos hasta resolver complejos 
                  sistemas de ecuaciones gráficas. ¡Cada bloque superado te acerca más a la maestría matemática!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video de Motivación - YouTube Short */}
      <div className="mb-12 flex flex-col items-center">
        <div className="max-w-sm w-full bg-white p-4 rounded-[2.5rem] shadow-xl border-2 border-orange-100">
          <div className="text-center mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">¡Aceptamos el Reto!</span>
            <h4 className="text-lg font-black text-gray-800">Energía de Agentes</h4>
          </div>
          <div className="aspect-[9/16] rounded-3xl overflow-hidden shadow-inner bg-gray-100">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/b5yiNFVv7Tw" 
              title="Jóvenes aceptando el reto" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
          <p className="text-[10px] text-gray-400 mt-3 text-center font-bold uppercase tracking-tighter">
            Nuestros estudiantes listos para el Capítulo 2
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
        {modules.map(m => (
          <div 
            key={m.id}
            onClick={() => m.active && (playSound('pop'), onSelectModule(m.id))}
            className={`group p-8 md:p-10 rounded-[2.5rem] border-4 transition-all relative ${m.active ? 'bg-white border-orange-50 hover:border-orange-400 hover:shadow-2xl cursor-pointer shadow-xl' : 'bg-gray-50 border-gray-100 grayscale opacity-60 cursor-not-allowed'}`}
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
                      <span className="text-[10px] font-black text-orange-600">{Math.round(m.progress)}%</span>
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
                  <div className="mt-4 flex items-center justify-center text-xs font-black text-orange-600 group-hover:translate-x-2 transition-transform">
                    <span>{m.progress > 0 ? 'CONTINUAR RETO' : 'INICIAR RETO'}</span>
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

export default ChapterTwoMenu;
