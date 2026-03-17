
import React, { useEffect, useState } from 'react';
import { StudentProfile } from '../types';
import { playSound } from '../audio';
import confetti from 'canvas-confetti';
import { supabase } from '../src/supabaseClient';

interface Props {
  student: StudentProfile;
  onBack: () => void;
}

const ResultsDashboard: React.FC<Props> = ({ student, onBack }) => {
  const [ranking, setRanking] = useState<StudentProfile[]>([]);
  const [showDiamondModal, setShowDiamondModal] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Use progress directly from Supabase columns
  const ordModuleAvg = student.progreso_ordenamiento;
  const logModuleAvg = student.progreso_proposiciones;
  const quantModuleAvg = student.progreso_cuantificadores;
  const microModuleAvg = student.progreso_microbit;

  // CAPÍTULO 2
  const cryptoModuleAvg = student.progreso_criptogramas || 0;
  const eqModuleAvg = student.progreso_ecuaciones_graficas || 0;
  const sudokuModuleAvg = student.progreso_sudoku || 0;
  const magicModuleAvg = student.progreso_magic_squares || 0;
  const crucModuleAvg = student.progreso_crucinumeros || 0;
  const pyrModuleAvg = student.progreso_piramides || 0;
  const targetModuleAvg = student.progreso_blanco_perfecto || 0;
  const msgModuleAvg = student.progreso_mensaje_oculto || 0;

  // PROMEDIO TOTAL CAPÍTULO 1
  const totalCap1 = (ordModuleAvg + logModuleAvg + quantModuleAvg + microModuleAvg) / 4;

  // PROMEDIO TOTAL CAPÍTULO 2
  const totalCap2 = (cryptoModuleAvg + eqModuleAvg + sudokuModuleAvg + magicModuleAvg + crucModuleAvg + pyrModuleAvg + targetModuleAvg + msgModuleAvg) / 8;

  useEffect(() => {
    const fetchRanking = async () => {
      if (!student.Grado) return;
      const { data, error } = await supabase
        .from('Estudiantes')
        .select('*')
        .eq('Grado', student.Grado)
        .order('nota_capitulo_1', { ascending: false });
      
      if (data) setRanking(data);
    };

    fetchRanking();

    // Trigger confetti based on progress
    const maxTotal = Math.max(totalCap1, totalCap2);
    if (maxTotal >= 100 && !hasCelebrated) {
      setHasCelebrated(true);
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
      
      setShowDiamondModal(true);
      playSound('victory');
    } else if (maxTotal >= 90) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500'] });
      playSound('pop');
    } else if (maxTotal >= 60) {
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 }, colors: ['#C0C0C0', '#E5E4E2'] });
      playSound('pop');
    } else if (maxTotal >= 30) {
      confetti({ particleCount: 80, spread: 50, origin: { y: 0.6 }, colors: ['#CD7F32', '#B87333'] });
      playSound('pop');
    }
  }, [totalCap1, totalCap2, student.Grado]);

  const getBadge = (score: number) => {
    if (score >= 90) return { icon: 'fa-gem', color: 'diamond-gradient diamond-shadow', label: 'DESEMPEÑO SUPERIOR' };
    if (score >= 80) return { icon: 'fa-trophy', color: 'text-yellow-400', label: 'DESEMPEÑO ALTO' };
    if (score >= 60) return { icon: 'fa-trophy', color: 'text-slate-400', label: 'DESEMPEÑO BÁSICO' };
    return { icon: 'fa-exclamation-circle', color: 'text-rose-500', label: 'DESEMPEÑO BAJO' };
  };

  const getStatusLabel = (score: number) => {
    if (score >= 90) return 'DESEMPEÑO SUPERIOR';
    if (score >= 80) return 'DESEMPEÑO ALTO';
    if (score >= 60) return 'DESEMPEÑO BÁSICO';
    return ''; // Hide 'DESEMPEÑO BAJO' for students
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
              <p className="text-gray-500 font-medium text-lg mt-1 flex items-center justify-center gap-2">
                Estudiante: <span className="text-purple-600 font-black uppercase tracking-tight flex items-center gap-1">
                  {student.Nombre || student.Usuario}
                  {totalCap1 >= 90 && <i className="fas fa-gem diamond-gradient text-sm animate-pulse"></i>}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="bg-gray-900 p-8 rounded-[3rem] text-white text-center shadow-2xl border-b-8 border-purple-500 relative group overflow-hidden min-w-[180px]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-[10px] font-black uppercase opacity-40 block mb-2 tracking-[0.3em] relative z-10">Nota Capítulo 1</span>
              <span className="text-5xl font-black relative z-10 tabular-nums">{Math.round(totalCap1)}<span className="text-2xl text-purple-400">%</span></span>
            </div>
            <div className="bg-gray-900 p-8 rounded-[3rem] text-white text-center shadow-2xl border-b-8 border-indigo-500 relative group overflow-hidden min-w-[180px]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-[10px] font-black uppercase opacity-40 block mb-2 tracking-[0.3em] relative z-10">Nota Capítulo 2</span>
              <span className="text-5xl font-black relative z-10 tabular-nums">{Math.round(totalCap2)}<span className="text-2xl text-indigo-400">%</span></span>
            </div>
          </div>
        </header>

        {/* BARRA DE PROGRESO GAMIFICADA CAPÍTULO 1 */}
        <div className="mb-16 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-black text-gray-800 tracking-tight">Camino al Maestro Lógico</h3>
              <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Capítulo 1: Pensamiento Verbal</p>
            </div>
            <div className="text-right">
              <span className="text-6xl font-black text-purple-600 tabular-nums">{Math.round(totalCap1)}%</span>
            </div>
          </div>
          
          <div className="relative pt-4 pb-8">
            {/* Hitos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-8 relative z-10">
              {[
                { pct: 30, icon: 'fa-trophy', color: 'text-orange-400', label: 'Bronce (30-59%)' },
                { pct: 60, icon: 'fa-trophy', color: 'text-slate-400', label: 'Plata (60-79%)' },
                { pct: 80, icon: 'fa-trophy', color: 'text-yellow-400', label: 'Oro (80-89%)' },
                { pct: 90, icon: 'fa-gem', color: 'diamond-gradient diamond-shadow', label: 'Diamante (90-100%)' }
              ].map((hito) => (
                <div 
                  key={hito.pct} 
                  className={`flex flex-col items-center transition-all duration-500 ${totalCap1 >= hito.pct ? 'scale-105 md:scale-110 opacity-100' : 'opacity-30 grayscale'}`}
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-2xl md:text-3xl mb-3 border-4 ${totalCap1 >= hito.pct ? 'border-purple-400 animate-bounce' : 'border-gray-100'}`}>
                    <i className={`fas ${hito.icon} ${hito.color}`}></i>
                  </div>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter text-gray-600 text-center leading-tight">{hito.label}</span>
                </div>
              ))}
            </div>

            {/* Barra de fondo */}
            <div className="h-6 bg-gray-100 rounded-full shadow-inner relative overflow-hidden border-4 border-white">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-1000 shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                style={{ width: `${totalCap1}%` }}
              >
                <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              </div>
            </div>
          </div>
        </div>

        {/* BARRA DE PROGRESO GAMIFICADA CAPÍTULO 2 */}
        <div className="mb-20 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-black text-gray-800 tracking-tight">Desafío Criptográfico</h3>
              <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Capítulo 2: Pensamiento Numérico</p>
            </div>
            <div className="text-right">
              <span className="text-6xl font-black text-indigo-600 tabular-nums">{Math.round(totalCap2)}%</span>
            </div>
          </div>
          
          <div className="relative pt-4 pb-8">
            {/* Hitos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-8 relative z-10">
              {[
                { pct: 30, icon: 'fa-trophy', color: 'text-orange-400', label: 'Bronce (30-59%)' },
                { pct: 60, icon: 'fa-trophy', color: 'text-slate-400', label: 'Plata (60-79%)' },
                { pct: 80, icon: 'fa-trophy', color: 'text-yellow-400', label: 'Oro (80-89%)' },
                { pct: 90, icon: 'fa-gem', color: 'diamond-gradient diamond-shadow', label: 'Diamante (90-100%)' }
              ].map((hito) => (
                <div 
                  key={hito.pct} 
                  className={`flex flex-col items-center transition-all duration-500 ${totalCap2 >= hito.pct ? 'scale-105 md:scale-110 opacity-100' : 'opacity-30 grayscale'}`}
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-2xl md:text-3xl mb-3 border-4 ${totalCap2 >= hito.pct ? 'border-indigo-400 animate-bounce' : 'border-gray-100'}`}>
                    <i className={`fas ${hito.icon} ${hito.color}`}></i>
                  </div>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter text-gray-600 text-center leading-tight">{hito.label}</span>
                </div>
              ))}
            </div>

            {/* Barra de fondo */}
            <div className="h-6 bg-gray-100 rounded-full shadow-inner relative overflow-hidden border-4 border-white">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 transition-all duration-1000 shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                style={{ width: `${totalCap2}%` }}
              >
                <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-2xl font-black text-gray-800 tracking-tight mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center"><i className="fas fa-book"></i></span>
            Módulos Capítulo 1
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
                <span className="bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(ordModuleAvg)}</span>
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
                <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(logModuleAvg)}</span>
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
                <span className="bg-pink-50 text-pink-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(quantModuleAvg)}</span>
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
                  <div className="text-center mt-2">
                    <span className="text-[9px] font-black text-indigo-600 bg-white px-3 py-1 rounded-full shadow-sm">Escala: {getStatusLabel(microModuleAvg)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h3 className="text-2xl font-black text-gray-800 tracking-tight mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center"><i className="fas fa-brain"></i></span>
            Módulos Capítulo 2
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* MÓDULO 1 CAP 2 */}
            <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <i className="fas fa-key"></i>
                </div>
                <h3 className="font-black text-gray-800 text-sm leading-tight">Criptogramas</h3>
              </div>
              <div className="space-y-8 flex-grow">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Progreso General</span>
                    <span className="text-indigo-600">{Math.round(cryptoModuleAvg)}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${cryptoModuleAvg}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(cryptoModuleAvg)}</span>
              </div>
            </div>

            {/* MÓDULO 2 CAP 2 */}
            <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <i className="fas fa-equals"></i>
                </div>
                <h3 className="font-black text-gray-800 text-sm leading-tight">Ecuaciones Gráficas</h3>
              </div>
              <div className="space-y-8 flex-grow">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Progreso General</span>
                    <span className="text-emerald-600">{Math.round(eqModuleAvg)}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${eqModuleAvg}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(eqModuleAvg)}</span>
              </div>
            </div>

            {/* MÓDULO 3 CAP 2 - SUDOKU */}
            <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <i className="fas fa-th"></i>
                </div>
                <h3 className="font-black text-gray-800 text-sm leading-tight">Sudoku Lógico</h3>
              </div>
              <div className="space-y-8 flex-grow">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Progreso General</span>
                    <span className="text-amber-600">{Math.round(sudokuModuleAvg)}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${sudokuModuleAvg}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <span className="bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(sudokuModuleAvg)}</span>
              </div>
            </div>

            {/* MÓDULO 4 CAP 2 - MAGIC SQUARES */}
            <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <i className="fas fa-square"></i>
                </div>
                <h3 className="font-black text-gray-800 text-sm leading-tight">Cuadrados Mágicos</h3>
              </div>
              <div className="space-y-8 flex-grow">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Progreso General</span>
                    <span className="text-purple-600">{Math.round(magicModuleAvg)}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${magicModuleAvg}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <span className="bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(magicModuleAvg)}</span>
              </div>
            </div>

            {/* MÓDULO 5 CAP 2 - CRUCINUMERO */}
            <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <i className="fas fa-plus-minus"></i>
                </div>
                <h3 className="font-black text-gray-800 text-sm leading-tight">Crucinúmero</h3>
              </div>
              <div className="space-y-8 flex-grow">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Progreso General</span>
                    <span className="text-orange-600">{Math.round(crucModuleAvg)}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${crucModuleAvg}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <span className="bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(crucModuleAvg)}</span>
              </div>
            </div>

            {/* MÓDULO 6 CAP 2 - PIRÁMIDES */}
            <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <i className="fas fa-mountain"></i>
                </div>
                <h3 className="font-black text-gray-800 text-sm leading-tight">Pirámides Numéricas</h3>
              </div>
              <div className="space-y-8 flex-grow">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Progreso General</span>
                    <span className="text-emerald-600">{Math.round(pyrModuleAvg)}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${pyrModuleAvg}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(pyrModuleAvg)}</span>
              </div>
            </div>

            {/* MÓDULO 7 CAP 2 - TARGET NUMBER */}
            <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 shadow-inner group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <i className="fas fa-bullseye"></i>
                </div>
                <h3 className="font-black text-gray-800 text-sm leading-tight">El Blanco Perfecto</h3>
              </div>
              <div className="space-y-8 flex-grow">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Progreso General</span>
                    <span className="text-rose-600">{Math.round(targetModuleAvg)}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${targetModuleAvg}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <span className="bg-rose-50 text-rose-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(targetModuleAvg)}</span>
              </div>
            </div>

            {/* MÓDULO 4 CAP 2 */}
            <div className="bg-rose-50 p-10 rounded-[4rem] border-4 border-white shadow-2xl flex flex-col group hover:scale-105 transition-all ring-8 ring-rose-50/50">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-rose-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform">
                  <i className="fas fa-user-secret"></i>
                </div>
                <div>
                  <h3 className="font-black text-rose-900 text-sm">Mensaje Oculto</h3>
                  <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Cripto-Análisis</span>
                </div>
              </div>
              <div className="space-y-8 flex-grow">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-rose-400">
                    <span>Progreso General</span>
                    <span className="bg-white px-3 py-1 rounded-full text-rose-700 shadow-sm">{Math.round(msgModuleAvg)}%</span>
                  </div>
                  <div className="h-5 bg-white rounded-full overflow-hidden shadow-inner border border-rose-100 p-1">
                    <div className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(225,29,72,0.4)]" style={{ width: `${msgModuleAvg}%` }}></div>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-[9px] font-black text-rose-600 bg-white px-3 py-1 rounded-full shadow-sm">Escala: {getStatusLabel(msgModuleAvg)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CUADRO DE HONOR DEL GRADO - 4 COLUMNAS */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-black text-gray-800 tracking-tighter mb-4">Galería de Logros y Excelencia <span className="text-purple-600">{student.Grado}</span></h3>
            <div className="inline-block bg-purple-50 px-8 py-3 rounded-full border border-purple-100 shadow-sm">
              <p className="text-purple-600 font-black text-xs uppercase tracking-[0.2em]">
                <i className="fas fa-star mr-2 animate-pulse"></i>
                Cada paso cuenta. ¡Sigue avanzando para alcanzar tus propias insignias!
              </p>
            </div>
          </div>

          {totalCap1 < 30 ? (
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-12 rounded-[3rem] text-center shadow-2xl animate-fade-up border-8 border-white">
              <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center text-white text-5xl mx-auto mb-8 animate-bounce">
                <i className="fas fa-rocket"></i>
              </div>
              <h4 className="text-3xl font-black text-white mb-4 tracking-tighter">¡TU LUGAR EN EL CUADRO DE HONOR TE ESPERA!</h4>
              <p className="text-purple-100 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                Alcanza el <span className="text-yellow-300 font-black">30%</span> de progreso total para obtener tu <span className="font-black">Copa de Bronce</span> y aparecer en la Galería de Logros de tu grado. ¡Tú puedes lograrlo!
              </p>
              <div className="mt-8 inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl border border-white/20">
                <div className="w-full h-3 bg-white/20 rounded-full w-48 overflow-hidden">
                  <div className="h-full bg-yellow-400" style={{ width: `${(totalCap1 / 30) * 100}%` }}></div>
                </div>
                <span className="text-white font-black text-sm">{Math.round(totalCap1)}% / 30%</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* COLUMNA BRONCE */}
            <div className="flex flex-col gap-4">
              <div className="bg-orange-50/50 p-4 rounded-[2rem] border-2 border-orange-100 text-center">
                <i className="fas fa-trophy text-orange-400 text-2xl mb-1"></i>
                <h4 className="font-black text-orange-800 text-[10px] uppercase tracking-widest">Bronce (30-59%)</h4>
                <p className="text-[8px] font-black text-orange-600 uppercase">En Progreso</p>
              </div>
              <div className="space-y-4">
                {ranking.filter(r => (r.nota_capitulo_1 || 0) >= 30 && (r.nota_capitulo_1 || 0) < 60).map((r, i) => {
                  const isMe = r.Usuario === student.Usuario;
                  return (
                    <div 
                      key={r.Usuario} 
                      className={`bg-white p-6 rounded-[1.5rem] border-2 shadow-[0_10px_30px_rgba(251,146,60,0.1)] animate-fade-up hover:scale-105 hover:brightness-110 hover:shadow-orange-200/40 transition-all duration-300 cursor-default group relative overflow-hidden ${isMe ? 'border-orange-400 bg-orange-50/30 ring-2 ring-orange-200' : 'border-orange-100'}`} 
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {isMe && (
                        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl shadow-md z-20 animate-pulse">
                          ¡TÚ!
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 font-black text-sm border border-orange-100 group-hover:scale-110 transition-transform">
                          {Math.round(r.nota_capitulo_1 || 0)}%
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-black text-sm tracking-tight leading-tight ${isMe ? 'text-orange-900' : 'text-gray-700'}`}>{r.Nombre || r.Usuario}</span>
                          <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-1">En Progreso</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMNA PLATA */}
            <div className="flex flex-col gap-4">
              <div className="bg-slate-50/50 p-4 rounded-[2rem] border-2 border-slate-200 text-center">
                <i className="fas fa-trophy text-slate-400 text-2xl mb-1"></i>
                <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-widest">Plata (60-79%)</h4>
                <p className="text-[8px] font-black text-slate-600 uppercase">Desempeño Básico</p>
              </div>
              <div className="space-y-4">
                {ranking.filter(r => (r.nota_capitulo_1 || 0) >= 60 && (r.nota_capitulo_1 || 0) < 80).map((r, i) => {
                  const isMe = r.Usuario === student.Usuario;
                  return (
                    <div 
                      key={r.Usuario} 
                      className={`bg-white p-6 rounded-[1.5rem] border-2 shadow-[0_10px_30px_rgba(148,163,184,0.15)] animate-fade-up hover:scale-105 hover:brightness-110 hover:shadow-slate-200/50 transition-all duration-300 cursor-default group relative overflow-hidden ${isMe ? 'border-slate-400 bg-slate-50/30 ring-2 ring-slate-200' : 'border-slate-200'}`} 
                      style={{ animationDelay: `${i * 0.1 + 0.2}s` }}
                    >
                      {isMe && (
                        <div className="absolute top-0 right-0 bg-slate-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl shadow-md z-20 animate-pulse">
                          ¡TÚ!
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 font-black text-sm border border-slate-200 group-hover:scale-110 transition-transform">
                          {Math.round(r.nota_capitulo_1 || 0)}%
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-black text-sm tracking-tight leading-tight ${isMe ? 'text-slate-900' : 'text-gray-700'}`}>{r.Nombre || r.Usuario}</span>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Desempeño Básico</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMNA ORO */}
            <div className="flex flex-col gap-4">
              <div className="bg-yellow-50/50 p-4 rounded-[2rem] border-2 border-yellow-200 text-center shadow-[0_0_20px_rgba(250,204,21,0.1)]">
                <i className="fas fa-trophy text-yellow-400 text-2xl mb-1 drop-shadow-sm"></i>
                <h4 className="font-black text-yellow-800 text-[10px] uppercase tracking-widest">Oro (80-89%)</h4>
                <p className="text-[8px] font-black text-yellow-600 uppercase">Desempeño Alto</p>
              </div>
              <div className="space-y-4">
                {ranking.filter(r => (r.nota_capitulo_1 || 0) >= 80 && (r.nota_capitulo_1 || 0) < 90).map((r, i) => {
                  const isMe = r.Usuario === student.Usuario;
                  return (
                    <div 
                      key={r.Usuario} 
                      className={`bg-white p-6 rounded-[1.5rem] border-2 shadow-[0_15px_40px_rgba(250,204,21,0.2)] animate-fade-up hover:scale-105 hover:brightness-110 hover:shadow-yellow-200/60 transition-all duration-300 cursor-default group ring-4 ${isMe ? 'border-yellow-500 bg-yellow-50/30 ring-yellow-200' : 'border-yellow-400 ring-yellow-50'} relative overflow-hidden`} 
                      style={{ animationDelay: `${i * 0.1 + 0.4}s` }}
                    >
                      {isMe && (
                        <div className="absolute top-0 right-0 bg-yellow-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl shadow-md z-20 animate-pulse">
                          ¡TÚ!
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 font-black text-sm border border-yellow-200 group-hover:scale-110 transition-transform">
                          {Math.round(r.nota_capitulo_1 || 0)}%
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-black text-sm tracking-tight leading-tight ${isMe ? 'text-yellow-900' : 'text-gray-800'}`}>{r.Nombre || r.Usuario}</span>
                          <span className="text-[9px] font-black text-yellow-600 uppercase tracking-widest mt-1">Desempeño Alto</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMNA DIAMANTE */}
            <div className="flex flex-col gap-4">
              <div className="diamond-bg-animated p-4 rounded-[2rem] text-center shadow-xl relative overflow-hidden">
                <div className="sparkle-effect top-2 left-4"></div>
                <div className="sparkle-effect bottom-2 right-4" style={{ animationDelay: '1s' }}></div>
                <i className="fas fa-gem text-white text-2xl mb-1 drop-shadow-md"></i>
                <h4 className="font-black text-white text-[10px] uppercase tracking-widest relative z-10">Diamante (90-100%)</h4>
                <p className="text-[8px] font-black text-white/80 uppercase relative z-10">Desempeño Superior</p>
              </div>
              <div className="space-y-4">
                {ranking.filter(r => (r.nota_capitulo_1 || 0) >= 90).map((r, i) => {
                  const isMe = r.Usuario === student.Usuario;
                  return (
                    <div 
                      key={r.Usuario} 
                      className={`diamond-bg-animated p-1 rounded-[1.6rem] shadow-[0_20px_50px_rgba(34,211,238,0.3)] animate-fade-up relative overflow-hidden group hover:scale-105 hover:brightness-110 hover:shadow-cyan-300/50 transition-all duration-500 cursor-default ${isMe ? 'ring-4 ring-cyan-400 ring-offset-2' : ''}`} 
                      style={{ animationDelay: `${i * 0.1 + 0.6}s` }}
                    >
                      {isMe && (
                        <div className="absolute top-0 right-0 bg-white text-cyan-600 text-[8px] font-black px-3 py-1 rounded-bl-xl shadow-md z-20 animate-pulse">
                          ¡TÚ!
                        </div>
                      )}
                      <div className="bg-white p-6 rounded-[1.3rem] flex flex-col items-center gap-3 relative z-10">
                        <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 font-black text-sm border border-cyan-100 group-hover:rotate-12 transition-transform">
                          100
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-black text-sm tracking-tight leading-tight flex items-center justify-center gap-1 ${isMe ? 'text-cyan-900' : 'text-gray-900'}`}>
                            {r.Nombre || r.Usuario}
                            <i className="fas fa-gem diamond-gradient text-[10px] animate-pulse"></i>
                          </span>
                          <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mt-1">Desempeño Superior</span>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <i className="fas fa-sparkles text-cyan-400 text-xs animate-ping"></i>
                        </div>
                      </div>
                      {/* Sparkles internos */}
                      <div className="sparkle-effect top-2 left-3 scale-75"></div>
                      <div className="sparkle-effect bottom-2 right-3 scale-75" style={{ animationDelay: '0.5s' }}></div>
                      <div className="sparkle-effect top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-50" style={{ animationDelay: '1.2s' }}></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
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
                     {totalCap1 >= 96 ? "¡Extraordinario! Has alcanzado el Nivel Superior. Tu razonamiento lógico es impecable." : 
                      totalCap1 >= 60 ? "¡Excelente trabajo! Estás en Nivel Alto. Sigue practicando para llegar a la excelencia total." :
                      totalCap1 >= 30 ? "Buen desempeño. Estás en Nivel Básico. Tienes las bases, pero puedes mejorar mucho más." :
                      "Nivel Bajo. Es importante que repases los conceptos y vuelvas a intentar los retos para fortalecer tu lógica."}
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

      {/* MODAL DIAMANTE 100% */}
      {showDiamondModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-2xl animate-fadeIn">
          <div className="bg-white rounded-[3rem] md:rounded-[4rem] p-8 md:p-16 max-w-3xl w-full text-center relative overflow-y-auto max-h-[90vh] shadow-[0_0_100px_rgba(34,211,238,0.3)] border-8 border-cyan-100">
            <button 
              onClick={() => setShowDiamondModal(false)}
              className="absolute top-6 right-8 text-gray-400 hover:text-cyan-500 transition-colors text-3xl"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 animate-pulse"></div>
            
            <div className="text-7xl md:text-9xl mb-8 md:mb-10 animate-float diamond-gradient diamond-shadow">
              <i className="fas fa-gem"></i>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-4 md:mb-6">¡FELICITACIONES MAESTRO!</h2>
            <p className="text-xl md:text-2xl font-black text-cyan-600 uppercase tracking-[0.2em] mb-8 md:mb-10">HAS ALCANZADO EL DIAMANTE LOGÍSTICO</p>
            
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed mb-10 md:mb-12">
              Has demostrado un dominio absoluto de todos los módulos del Capítulo 1. Tu capacidad de análisis y deducción te sitúa en la élite de los pensadores lógicos.
            </p>
            
            <button 
              onClick={() => { playSound('pop'); setShowDiamondModal(false); }}
              className="w-full md:w-auto px-12 py-6 bg-cyan-500 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-cyan-600 transition-all transform hover:scale-105 active:scale-95"
            >
              CONTINUAR MI CAMINO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDashboard;
