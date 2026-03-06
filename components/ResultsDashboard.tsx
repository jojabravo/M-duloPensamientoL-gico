
import React from 'react';
import { StudentProfile } from '../types';
import { playSound } from '../audio';

interface Props {
  student: StudentProfile;
  onBack: () => void;
}

const ResultsDashboard: React.FC<Props> = ({ student, onBack }) => {
  // Use progress directly from Supabase columns
  const ordModuleAvg = student.progreso_ordenamiento;
  const logModuleAvg = student.progreso_proposiciones;
  const quantModuleAvg = student.progreso_cuantificadores;
  const microModuleAvg = student.progreso_microbit;

  // PROMEDIO TOTAL CAPÍTULO 1
  const totalCap1 = (ordModuleAvg + logModuleAvg + quantModuleAvg + microModuleAvg) / 4;

  const getBadge = (score: number) => {
    if (score >= 90) return { icon: 'fa-trophy', color: 'text-yellow-500', label: 'Oro - Maestro Lógico' };
    if (score >= 60) return { icon: 'fa-medal', color: 'text-gray-400', label: 'Plata - Avanzado' };
    return { icon: 'fa-award', color: 'text-orange-400', label: 'Bronce - Iniciado' };
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn px-4 pb-20">
      <div className="bg-white rounded-[4rem] shadow-[0_25px_100px_rgba(0,0,0,0.1)] border-8 border-purple-50 p-10 md:p-16 overflow-hidden relative">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full translate-y-1/2 -translate-x-1/2 -z-10 opacity-60"></div>
        
        <header className="mb-16 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="w-24 h-24 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-2xl animate-float">
               <i className="fas fa-file-invoice"></i>
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-purple-400 mb-2 block">Certificación de Pensamiento Lógico</span>
              <h2 className="text-5xl font-black text-gray-800 tracking-tighter">Tu Progreso Académico</h2>
              <p className="text-gray-500 font-medium text-lg mt-1">
                Estudiante: <span className="text-purple-600 font-black uppercase tracking-tight">
                  {student.Usuario}
                </span>
              </p>
            </div>
          </div>
          <div className="bg-gray-900 p-10 rounded-[3.5rem] text-white text-center shadow-2xl border-b-8 border-purple-500 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-[11px] font-black uppercase opacity-40 block mb-2 tracking-[0.4em] relative z-10">Nota Capítulo 1</span>
            <span className="text-7xl font-black relative z-10 tabular-nums">{Math.round(totalCap1)}<span className="text-3xl text-purple-400">%</span></span>
          </div>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* MÓDULO 1 */}
          <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <i className="fas fa-layer-group"></i>
              </div>
              <h3 className="font-black text-gray-800 text-sm leading-tight">Ordenamiento Info.</h3>
            </div>
            <div className="space-y-8 flex-grow">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Progreso General</span>
                  <span className="text-purple-600">{Math.round(ordModuleAvg)}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${ordModuleAvg}%` }}></div>
                </div>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-gray-100 text-center">
               <span className="bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-[10px] font-black">Estado: {ordModuleAvg >= 100 ? 'Completado' : 'En curso'}</span>
            </div>
          </div>

          {/* MÓDULO 2 */}
          <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <i className="fas fa-project-diagram"></i>
              </div>
              <h3 className="font-black text-gray-800 text-sm leading-tight">Proposiciones Lógicas</h3>
            </div>
            <div className="space-y-8 flex-grow">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Progreso General</span>
                  <span className="text-blue-600">{Math.round(logModuleAvg)}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${logModuleAvg}%` }}></div>
                </div>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-gray-100 text-center">
               <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black">Estado: {logModuleAvg >= 100 ? 'Completado' : 'En curso'}</span>
            </div>
          </div>

          {/* MÓDULO 3 */}
          <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shadow-inner group-hover:bg-pink-600 group-hover:text-white transition-colors">
                <i className="fas fa-infinity"></i>
              </div>
              <h3 className="font-black text-gray-800 text-sm leading-tight">Cuantificadores Quest</h3>
            </div>
            <div className="space-y-8 flex-grow">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Progreso General</span>
                  <span className="text-pink-600">{Math.round(quantModuleAvg)}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-pink-500 transition-all duration-1000" style={{ width: `${quantModuleAvg}%` }}></div>
                </div>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-gray-100 text-center">
               <span className="bg-pink-50 text-pink-700 px-4 py-1.5 rounded-full text-[10px] font-black">Estado: {quantModuleAvg >= 100 ? 'Completado' : 'En curso'}</span>
            </div>
          </div>

          {/* MÓDULO 4 */}
          <div className="bg-indigo-50 p-10 rounded-[4rem] border-4 border-white shadow-2xl flex flex-col group hover:scale-105 transition-all ring-8 ring-indigo-50/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform">
                <i className="fas fa-microchip"></i>
              </div>
              <div>
                <h3 className="font-black text-indigo-900 text-sm">Microbit Lógica</h3>
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Integración Hardware</span>
              </div>
            </div>
            <div className="space-y-8 flex-grow">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  <span>Progreso General</span>
                  <span className="bg-white px-3 py-1 rounded-full text-indigo-700 shadow-sm">{Math.round(microModuleAvg)}%</span>
                </div>
                <div className="h-5 bg-white rounded-full overflow-hidden shadow-inner border border-indigo-100 p-1">
                  <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.4)]" style={{ width: `${microModuleAvg}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MEDALLA Y RECONOCIMIENTO */}
        <div className="mt-12 p-12 bg-gradient-to-br from-gray-900 to-indigo-950 border-8 border-white rounded-[4rem] flex flex-col md:flex-row items-center gap-12 shadow-[0_30px_80px_rgba(0,0,0,0.3)] relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
           {(() => {
             const badge = getBadge(totalCap1);
             return (
               <>
                 <div className={`text-8xl ${badge.color} animate-float drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] relative z-10`}>
                   <i className={`fas ${badge.icon}`}></i>
                 </div>
                 <div className="text-center md:text-left flex-grow relative z-10">
                   <h4 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">{badge.label}</h4>
                   <p className="text-indigo-200 font-medium text-lg leading-relaxed italic max-w-2xl">
                     {totalCap1 >= 90 ? "¡Extraordinario! Has demostrado que la lógica y la ingeniería fluyen por tus venas. Eres un orgullo para la Institución Josefa Campos." : 
                      totalCap1 >= 60 ? "¡Muy buen trabajo! Tienes las herramientas para pensar con claridad y programar soluciones. Sigue así para llegar al nivel Maestro." :
                      "¡Buen comienzo! La lógica es un camino de práctica constante. Vuelve a los retos de Microbit para fortalecer tus habilidades deductivas."}
                   </p>
                 </div>
                 <div className="shrink-0 relative z-10">
                    <div className="bg-white text-indigo-950 px-8 py-3 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-50 transition-colors cursor-default">Nivel 1 Superado</div>
                 </div>
               </>
             )
           })()}
        </div>

        <div className="mt-16 flex flex-col md:flex-row justify-center gap-6">
          <button 
            onClick={() => { playSound('pop'); onBack(); }}
            className="group px-16 py-6 bg-gray-800 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-black transition-all transform hover:-translate-y-2 active:scale-95 flex items-center justify-center gap-4"
          >
            <i className="fas fa-home group-hover:scale-125 transition-transform text-purple-400"></i>
            VOLVER AL PANEL
          </button>
          <button 
            onClick={() => window.print()}
            className="px-10 py-6 bg-white border-4 border-gray-100 text-gray-400 rounded-[2rem] font-black text-sm hover:border-purple-400 hover:text-purple-600 transition-all flex items-center justify-center gap-3"
          >
            <i className="fas fa-print"></i> IMPRIMIR REPORTE
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
