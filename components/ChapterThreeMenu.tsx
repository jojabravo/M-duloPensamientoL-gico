import React from 'react';
import { playSound } from '../audio';
import { StudentProfile, AppConfig } from '../types';

interface Props {
  student: StudentProfile;
  config: AppConfig;
  onSelectModule: (moduleId: string) => void;
  onBack: () => void;
}

const ChapterThreeMenu: React.FC<Props> = ({ student, config, onSelectModule, onBack }) => {
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

  // Get Isometric Transformation progress directly from the progreso_transformaciones column
  const transformacionesProg = student.progreso_transformaciones || 0;

  const mosaicosProg = student.progreso_mosaicos || 0;
  const conteoProg = student.progreso_conteocubos || 0;
  const somacuboProg = student.progreso_cubosoma || 0;

  const modules = [
    {
      id: 'transformaciones',
      title: 'Bloque 1: Transformaciones Isométricas',
      icon: 'fa-vector-square',
      color: 'bg-pink-600',
      active: true, // Always active for chapter explore
      desc: 'Traslaciones, simetría axial y rotaciones en cuadrículas interactivas de pixel art.',
      progress: transformacionesProg,
      required: 'Habilitación inmediata'
    },
    {
      id: 'mosaicos',
      title: 'Bloque 2: Diseño de Mosaicos',
      icon: 'fa-border-all',
      color: 'bg-indigo-600',
      active: true,
      desc: 'Crea asombrosas teselaciones utilizando polígonos regulares y patrones simétricos.',
      progress: mosaicosProg,
      required: 'Habilitación inmediata'
    },
    {
      id: 'conteocubos',
      title: 'Bloque 3: Conteo de Cubos',
      icon: 'fa-cubes',
      color: 'bg-purple-600',
      active: true,
      desc: 'Desarrolla tu visión 3D contando bloques apilados e identificando estructuras tridimensionales.',
      progress: conteoProg,
      required: 'Habilitación inmediata'
    },
    {
      id: 'cubosoma',
      title: 'Bloque 4: Cubo de Soma',
      icon: 'fa-cube',
      color: 'bg-fuchsia-600',
      active: true,
      desc: 'Resuelve el clásico rompecabezas tridimensional uniendo las 7 piezas policúbicas de Piet Hein.',
      progress: somacuboProg,
      required: 'Habilitación inmediata'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn px-4 py-8">
      <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-pink-50 overflow-hidden mb-12">
        {/* Header Banner */}
        <div className="bg-pink-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl rotate-12">
            <i className="fas fa-cube"></i>
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => { playSound('pop'); onBack(); }}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/20 px-4 py-1.5 rounded-full mb-2 inline-block">
                  Fase de Entrenamiento • Espacial
                </span>
                <h3 className="text-3xl font-black tracking-tight">Capítulo 3: Pensamiento Espacial</h3>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-pink-100 font-black text-[10px] uppercase tracking-[0.2em]">Misión: Dimensión 3D</p>
              {config.capitulo_3_inicio && config.capitulo_3_fin && (
                <p className="text-white text-[9px] font-bold uppercase tracking-tight mt-1">
                  Abierto: {formatDate(config.capitulo_3_inicio)} - {formatDate(config.capitulo_3_fin)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Narrativa del Capítulo */}
        <div className="p-8 bg-pink-50/30">
          <div className="bg-pink-600/10 p-8 rounded-[2.5rem] border-2 border-pink-100 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-pink-600 rounded-3xl flex items-center justify-center text-4xl text-white shadow-lg shrink-0">
                <i className="fas fa-compass"></i>
              </div>
              <div>
                <p className="text-pink-900 font-medium leading-relaxed">
                  ¡Bienvenidos, futuros exploradores de mundos geométricos! Hoy damos inicio a una habilidad extraordinaria: el <strong className="text-pink-700 font-bold">Pensamiento Espacial</strong>. En este capítulo entrenarás a tu cerebro para visualizar dimensiones, manipular objetos mentales, deslizar figuras simétricas y construir ingeniosos complejos tridimensionales. ¡Conviértete en un arquitecto de la geometría!
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
            className={`group p-8 md:p-10 rounded-[2.5rem] border-4 transition-all relative ${m.active ? 'bg-white border-pink-50 hover:border-pink-400 hover:shadow-2xl cursor-pointer shadow-xl' : 'bg-gray-50 border-gray-100 grayscale opacity-60 cursor-not-allowed'}`}
          >
            <div className="flex flex-col gap-6 items-center text-center">
              <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-white text-4xl md:text-5xl shadow-lg shrink-0 ${m.color}`}>
                <i className={`fas ${m.icon}`}></i>
              </div>
              <div className="flex-grow w-full">
                <h3 className="font-black text-gray-800 text-xl md:text-2xl mb-1 tracking-tight leading-tight">{m.title}</h3>
                
                {/* Progress Bar */}
                {m.active && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progreso del Bloque</span>
                      <span className="text-[10px] font-black text-pink-600">{Math.round(m.progress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${m.color} transition-all duration-1000`} 
                        style={{ width: `${m.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-semibold">{m.desc}</p>
                
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
                  <div className="mt-4 flex items-center justify-center text-xs font-black text-pink-600 group-hover:translate-x-2 transition-transform">
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

export default ChapterThreeMenu;
