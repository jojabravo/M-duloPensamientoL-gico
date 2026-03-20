
import React from 'react';
import { playSound } from '../audio';
import { StudentProfile } from '../types';

interface Props {
  student: StudentProfile;
  onSelectModule: (moduleId: string) => void;
  onBack: () => void;
}

const ChapterTwoBlockThreeMenu: React.FC<Props> = ({ student, onSelectModule, onBack }) => {
  const isTestUser = student.Usuario === 'estudiante.prueba';
  const modules = [
    {
      id: 'crucinumeros',
      title: 'Crucinúmero',
      subtitle: '(Operaciones Cruzadas)',
      icon: 'fa-plus-minus',
      color: 'bg-orange-500',
      active: true,
      desc: 'Resuelve el crucigrama numérico con potencias y raíces.',
      progress: student.progreso_crucinumeros || 0
    },
    {
      id: 'pyramids',
      title: 'Pirámides Numéricas',
      subtitle: '(Lógica de Base)',
      icon: 'fa-mountain',
      color: 'bg-emerald-500',
      active: isTestUser || (student.progreso_crucinumeros || 0) >= 60,
      desc: 'Completa las pirámides sumando y restando desde la base.',
      required: 'Supera Crucinúmero (60%)',
      progress: student.progreso_piramides || 0
    },
    {
      id: 'magic',
      title: 'Cuadrados Mágicos',
      subtitle: 'Modernos',
      icon: 'fa-square',
      color: 'bg-purple-500',
      active: isTestUser || (student.progreso_piramides || 0) >= 60,
      desc: 'Completa la cuadrícula para que todas las líneas sumen lo mismo.',
      required: 'Supera Pirámides (60%)',
      progress: student.progreso_magic_squares || 0
    },
    {
      id: 'sudoku',
      title: 'Sudoku Detective',
      subtitle: '(El Gran Final)',
      icon: 'fa-user-secret',
      color: 'bg-indigo-600',
      active: isTestUser || (student.progreso_magic_squares || 0) >= 60,
      desc: 'El desafío final: descifra el código del servidor con lógica pura.',
      required: 'Supera Cuadrados (60%)',
      progress: student.progreso_sudoku || 0
    }
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => { playSound('pop'); onBack(); }}
          className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-amber-600 hover:bg-amber-600 hover:text-white transition-all"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Bloque 3: Crucinúmeros y Retos</h2>
          <p className="text-amber-600 font-bold text-sm uppercase tracking-widest">Misión: Recuperación de Datos</p>
        </div>
      </div>

      {/* Narrativa del Bloque - Moved to Top */}
      <div className="mb-12 bg-amber-600 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl shrink-0">
            <i className="fas fa-user-secret"></i>
          </div>
          <div>
            <p className="text-amber-100 font-medium leading-relaxed">
              El servidor central ha sido infectado por un virus que ha fragmentado los archivos de seguridad. 
              Como <strong>Cripto-Analista</strong>, tu misión es resolver estos retos numéricos para reconstruir 
              los fragmentos de código. Cada reto superado te otorga una <strong>Llave de Acceso</strong>. 
              ¡El Sudoku Detective es la prueba final para erradicar el virus!
            </p>
          </div>
        </div>
        <i className="fas fa-shield-virus absolute -right-8 -bottom-8 text-[12rem] text-white/10 rotate-12"></i>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map(m => (
          <div 
            key={m.id}
            onClick={() => m.active && (playSound('pop'), onSelectModule(m.id))}
            className={`group p-6 rounded-[2rem] border-4 transition-all relative flex flex-col ${m.active ? 'bg-white border-amber-50 hover:border-amber-400 hover:shadow-2xl cursor-pointer shadow-xl' : 'bg-gray-50 border-gray-100 grayscale opacity-60 cursor-not-allowed'}`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg mb-4 ${m.color}`}>
              <i className={`fas ${m.icon}`}></i>
            </div>
            
            <h3 className="font-black text-gray-800 text-xl leading-tight">{m.title}</h3>
            <p className="text-xs font-bold text-gray-400 mb-3">{m.subtitle}</p>
            
            <p className="text-xs text-gray-500 mb-6 flex-grow">{m.desc}</p>

            {m.active ? (
              <div className="space-y-3">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${m.color} transition-all duration-1000`} style={{ width: `${m.progress}%` }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progreso</span>
                  <span className="text-[10px] font-black text-amber-600">{Math.round(m.progress)}%</span>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-tight">
                  <i className="fas fa-lock mr-1"></i> Requisito: {m.required}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterTwoBlockThreeMenu;
