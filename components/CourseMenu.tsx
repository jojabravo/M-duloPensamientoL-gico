
import React from 'react';
import { playSound } from '../audio';
import { StudentProfile, AppConfig } from '../types';
import CommunicationPanel from './CommunicationPanel';

interface Props {
  student: StudentProfile;
  config: AppConfig;
  onSelect: (chapterId: string) => void;
  onShowResults: () => void;
  onShowCommunication: () => void;
}

const CourseMenu: React.FC<Props> = ({ student, config, onSelect, onShowResults, onShowCommunication }) => {
  const isTestUser = student.Usuario === 'estudiante.prueba';

  const isAvailable = (active: boolean, start?: string, end?: string) => {
    if (isTestUser) return true;
    if (!active) return false;
    
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

  const sections = [
    { 
      id: 'verbal', 
      title: 'CAPÍTULO 1: PENSAMIENTO VERBAL', 
      icon: 'fa-font', 
      color: 'bg-purple-600', 
      active: isAvailable(config.capitulo_1_activo, config.capitulo_1_inicio, config.capitulo_1_fin),
      desc: 'Ordenamiento de la información, lógica verbal y deducción.'
    },
    { 
      id: 'num', 
      title: 'CAPÍTULO 2: PENSAMIENTO LÓGICO MATEMÁTICO', 
      icon: 'fa-magnifying-glass', 
      color: 'bg-orange-500', 
      active: isAvailable(config.capitulo_2_activo, config.capitulo_2_inicio, config.capitulo_2_fin),
      desc: 'Criptogramas, Ecuaciones Gráficas, Crucinúmeros y Mensaje Oculto.'
    },
    { 
      id: 'esp', 
      title: 'CAPÍTULO 3: PENSAMIENTO ESPACIAL', 
      icon: 'fa-cube', 
      color: 'bg-pink-500', 
      active: isAvailable(config.capitulo_3_activo, config.capitulo_3_inicio, config.capitulo_3_fin),
      desc: 'Transformaciones Isométricas (traslación, rotación, simetría), uso de GeoGebra y diseño de mosaicos.'
    },
    { 
      id: 'abs', 
      title: 'CAPÍTULO 4: PENSAMIENTO ABSTRACTO', 
      icon: 'fa-shapes', 
      color: 'bg-emerald-500', 
      active: isAvailable(config.capitulo_4_activo, config.capitulo_4_inicio, config.capitulo_4_fin),
      desc: 'Patrones visuales, analogías gráficas y matrices.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-black text-gray-800">Capítulos de Aprendizaje</h2>
          <p className="text-gray-500 font-medium text-sm">Selecciona el capítulo para continuar tu formación</p>
        </div>
        <div className="flex flex-wrap justify-center md:justify-end items-center gap-3">
          <button 
            onClick={() => { playSound('pop'); onShowResults(); }}
            className="px-6 py-3 bg-white border-2 border-purple-100 rounded-2xl font-black text-purple-600 shadow-sm hover:shadow-xl hover:bg-purple-50 transition-all flex items-center gap-2"
          >
            <i className="fas fa-file-invoice"></i> VER MI REPORTE
          </button>
          <button 
            onClick={() => { playSound('pop'); onShowCommunication(); }}
            className="px-6 py-3 bg-white border-2 border-indigo-100 rounded-2xl font-black text-indigo-600 shadow-sm hover:shadow-xl hover:bg-indigo-50 transition-all flex items-center gap-2"
          >
            <i className="fas fa-envelope"></i> BUZÓN Y AVISOS
          </button>
        </div>
      </div>

      {/* Video de Experiencia */}
      <div className="mb-10 bg-white rounded-[2.5rem] overflow-hidden shadow-xl border-2 border-purple-100">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 mb-2">Nuestra Experiencia</span>
            <h3 className="text-2xl font-black mb-4 text-gray-800">El Proyecto en Acción</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Observa a los estudiantes interactuando con la plataforma y desarrollando sus habilidades de pensamiento lógico en el aula.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-600">
              <i className="fas fa-users"></i>
              <span>INTERACCIÓN Y APRENDIZAJE DIGITAL</span>
            </div>
          </div>
          <div className="md:w-1/2 aspect-video">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/zjGdDiIHWqI" 
              title="Experiencia de Aprendizaje Lógico" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {sections.map(s => (
          <div 
            key={s.id}
            onClick={() => s.active && (playSound('pop'), onSelect(s.id))}
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
      
      <div className="mt-12 bg-white/50 border border-purple-100 p-8 rounded-[2.5rem] text-center shadow-sm">
        <p className="text-xs text-purple-400 font-black uppercase tracking-[0.3em] mb-4">Metodología de Evaluación</p>
        <p className="text-sm text-gray-600 leading-relaxed max-w-3xl mx-auto">
          Tu éxito se mide por una <strong>Progresión por Insignias</strong> basada en tu porcentaje total de progreso. 
          A medida que avances, obtendrás las Copas de <strong>Bronce, Plata y Oro</strong>, culminando con el prestigioso <strong>Diamante Multicolor</strong>. 
          <br /><br />
          <span className="bg-purple-50 text-purple-700 px-4 py-1 rounded-full text-[10px] font-black uppercase">
            Importante: El ingreso al Cuadro de Honor requiere un umbral mínimo del 30% (En Progreso). El Desempeño Básico se alcanza al 60%.
          </span>
        </p>
      </div>
    </div>
  );
};

export default CourseMenu;
