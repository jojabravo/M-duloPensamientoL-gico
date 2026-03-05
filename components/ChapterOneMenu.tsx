
import React from 'react';
import { playSound } from '../audio';

interface Props {
  onSelectModule: (moduleId: string) => void;
  onBack: () => void;
}

const ChapterOneMenu: React.FC<Props> = ({ onSelectModule, onBack }) => {
  const modules = [
    {
      id: 'ordering',
      title: 'Ordenamiento de la Información',
      icon: 'fa-layer-group',
      color: 'bg-purple-600',
      active: true,
      desc: 'Lineal (horizontal y vertical), circular y tablas de doble entrada.'
    },
    {
      id: 'logic',
      title: 'Proposiciones Lógicas',
      icon: 'fa-project-diagram',
      color: 'bg-blue-500',
      active: true,
      desc: 'Definición, tipos, conectores, simbologías y reglas de inferencia.'
    },
    {
      id: 'quantifiers',
      title: 'Cuantificadores Lógicos',
      icon: 'fa-infinity',
      color: 'bg-pink-500',
      active: true,
      desc: 'Videojuego: Reconocimiento, simbolización y negación de cuantificadores.'
    },
    {
      id: 'microbit',
      title: 'Microbit en Lógica',
      icon: 'fa-microchip',
      color: 'bg-emerald-500',
      active: true,
      desc: 'Programación lógica aplicada a dispositivos Microbit reales y virtuales.'
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

      <div className="grid md:grid-cols-2 gap-6">
        {modules.map(m => (
          <div 
            key={m.id}
            onClick={() => m.active && (playSound('pop'), onSelectModule(m.id))}
            className={`group p-6 rounded-[2.5rem] border-4 transition-all relative ${m.active ? 'bg-white border-purple-50 hover:border-purple-400 hover:shadow-2xl cursor-pointer shadow-xl' : 'bg-gray-50 border-gray-100 grayscale opacity-60 cursor-not-allowed'}`}
          >
            <div className="flex gap-6 items-center">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white text-3xl shadow-lg shrink-0 ${m.color}`}>
                <i className={`fas ${m.icon}`}></i>
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-gray-800 text-lg mb-1">{m.title}</h3>
                <p className="text-sm text-gray-500 leading-snug">{m.desc}</p>
                {!m.active ? (
                  <span className="inline-block mt-3 text-[9px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                    <i className="fas fa-tools mr-1"></i> En mantenimiento
                  </span>
                ) : (
                  <div className="mt-4 flex items-center text-xs font-black text-purple-600 group-hover:translate-x-2 transition-transform">
                    <span>INICIAR MÓDULO</span>
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
