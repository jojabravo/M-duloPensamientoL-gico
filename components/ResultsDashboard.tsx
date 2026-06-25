
import React, { useEffect, useState } from 'react';
import { StudentProfile, AppConfig } from '../types';
import { playSound } from '../audio';
import confetti from 'canvas-confetti';
import { supabase } from '../src/supabaseClient';

interface Props {
  student: StudentProfile;
  config: AppConfig;
  onBack: () => void;
}

const ResultsDashboard: React.FC<Props> = ({ student, config, onBack }) => {
  const [ranking, setRanking] = useState<StudentProfile[]>([]);
  const [showChapter3Modal, setShowChapter3Modal] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(() => {
    return localStorage.getItem(`celebrated_cap3_${student.Usuario}`) === 'true';
  });
  
  // Determine the default chapter for the gallery (highest active one)
  const defaultChapter = config.capitulo_4_activo ? 4 : 
                         config.capitulo_3_activo ? 3 : 
                         config.capitulo_2_activo ? 2 : 1;
  
  const [selectedGalleryChapter, setSelectedGalleryChapter] = useState(defaultChapter);

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
  const msgModuleAvg = student.progreso_mensaje_oculto || 0;

  // CAPÍTULO 3
  const transformacionesProg = student.progreso_transformaciones || 0;
  const mosaicosProg = student.progreso_mosaicos || 0;
  const conteoProg = student.progreso_conteocubos || 0;
  const somacuboProg = student.progreso_cubosoma || 0;

  // CAPÍTULO 4
  const secGraficasProg = student.progreso_secuencias_graficas || 0;
  const secNumericasProg = student.progreso_secuencias_numericas || 0;
  const lateralProg = student.progreso_lateral || 0;
  const historiaProg = student.progreso_historia_final || 0;

  // PROMEDIO TOTAL CAPÍTULO 1
  const totalCap1 = Math.round((ordModuleAvg + logModuleAvg + quantModuleAvg + microModuleAvg) / 4);

  // PROMEDIO TOTAL CAPÍTULO 2
  const block3Avg = (sudokuModuleAvg + magicModuleAvg + crucModuleAvg + pyrModuleAvg) / 4;
  const totalCap2 = student.nota_capitulo_2 || (cryptoModuleAvg + eqModuleAvg + block3Avg + msgModuleAvg) / 4;

  // PROMEDIO TOTAL CAPÍTULO 3
  const totalCap3 = student.nota_capitulo_3 || (transformacionesProg + mosaicosProg + conteoProg + somacuboProg) / 4;

  // PROMEDIO TOTAL CAPÍTULO 4
  const totalCap4 = student.nota_capitulo_4 || (secGraficasProg + secNumericasProg + lateralProg + historiaProg) / 4;

  useEffect(() => {
    const fetchRanking = async () => {
      if (!student.Grado) return;
      const { data } = await supabase
        .from('Estudiantes')
        .select('*')
        .eq('Grado', student.Grado);
      
      if (data) {
        const processedData = data.map(s => {
          // Chapter 1 Progress
          const avg1 = s.nota_capitulo_1 || 0;
          
          // Chapter 2 Progress
          const block3 = ((s.progreso_sudoku || 0) + (s.progreso_magic_squares || 0) + (s.progreso_crucinumeros || 0) + (s.progreso_piramides || 0)) / 4;
          const avg2 = s.nota_capitulo_2 || ((s.progreso_criptogramas || 0) + (s.progreso_ecuaciones_graficas || 0) + block3 + (s.progreso_mensaje_oculto || 0)) / 4;

          // Chapter 3 Progress
          const avg3 = s.nota_capitulo_3 || ((s.progreso_transformaciones || 0) + (s.progreso_mosaicos || 0) + (s.progreso_conteocubos || 0) + (s.progreso_cubosoma || 0)) / 4;

          // Chapter 4 Progress
          const avg4 = s.nota_capitulo_4 || ((s.progreso_secuencias_graficas || 0) + (s.progreso_secuencias_numericas || 0) + (s.progreso_lateral || 0) + (s.progreso_historia_final || 0)) / 4;
          
          let currentProgress = avg1;
          if (selectedGalleryChapter === 2) currentProgress = avg2;
          else if (selectedGalleryChapter === 3) currentProgress = avg3;
          else if (selectedGalleryChapter === 4) currentProgress = avg4;

          return { 
            ...s, 
            maxProgress: Math.max(avg1, avg2, avg3, avg4),
            galleryProgress: currentProgress 
          };
        });
        
        const sortedData = processedData.sort((a, b) => (b as any).galleryProgress - (a as any).galleryProgress);
        setRanking(sortedData);
      }
    };

    fetchRanking();
  }, [selectedGalleryChapter, student.Grado]);

  useEffect(() => {
    // Trigger confetti and modal specifically for Chapter 3 when having superior grade (>= 90%) AND the 4 insignias of Chapter 3
    if (totalCap3 >= 90 && transformacionesProg >= 100 && mosaicosProg >= 100 && conteoProg >= 100 && somacuboProg >= 100 && !hasCelebrated) {
      setHasCelebrated(true);
      localStorage.setItem(`celebrated_cap3_${student.Usuario}`, 'true');
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 110 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#ec4899', '#8b5cf6', '#06b6d4', '#eab308'] });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#ec4899', '#8b5cf6', '#06b6d4', '#eab308'] });
      }, 250);
      
      setShowChapter3Modal(true);
      playSound('victory');
    } else {
      // General non-blocking pop confetti on first load based on highest progress, excluding Chapter 1's general load pop
      const maxTotal = Math.max(totalCap2, totalCap3, totalCap4);
      if (maxTotal >= 90) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500'] });
        playSound('pop');
      } else if (maxTotal >= 60) {
        confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 }, colors: ['#C0C0C0', '#E5E4E2'] });
        playSound('pop');
      } else if (maxTotal >= 30) {
        confetti({ particleCount: 80, spread: 50, origin: { y: 0.6 }, colors: ['#CD7F32', '#B87333'] });
        playSound('pop');
      }
    }
  }, [totalCap1, totalCap2, totalCap3, totalCap4, transformacionesProg, mosaicosProg, conteoProg, somacuboProg, student.Grado, hasCelebrated]);

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

  // MEDALLA Y RECONOCIMIENTO (Based on selected gallery chapter)
  const galleryScore = selectedGalleryChapter === 1 ? totalCap1 : 
                       selectedGalleryChapter === 2 ? totalCap2 : 
                       selectedGalleryChapter === 3 ? totalCap3 : 
                       selectedGalleryChapter === 4 ? totalCap4 : 0;
  const badge = getBadge(galleryScore);
  const maxTotal = Math.max(totalCap1, totalCap2, totalCap3, totalCap4); // Still used for overall victory modal

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
          <div className="flex flex-wrap sm:flex-row justify-center lg:justify-end gap-6">
            {/* Card Chapter 1 */}
            <div 
              onClick={() => { setSelectedGalleryChapter(1); playSound('pop'); }}
              className={`bg-gray-900 p-8 rounded-[3rem] text-white text-center shadow-2xl border-b-8 relative group overflow-hidden min-w-[150px] sm:min-w-[180px] cursor-pointer transition-all duration-300 ${
                selectedGalleryChapter === 1 
                  ? 'border-purple-500 scale-105 ring-4 ring-purple-500/30 opacity-100' 
                  : 'border-purple-950 opacity-65 hover:opacity-100 hover:scale-102 saturate-75 hover:saturate-100'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-[10px] font-black uppercase opacity-40 block mb-2 tracking-[0.3em] relative z-10">Nota Capítulo 1</span>
              <span className="text-5xl font-black relative z-10 tabular-nums">{Math.round(totalCap1)}<span className="text-2xl text-purple-400">%</span></span>
              {selectedGalleryChapter === 1 && (
                <div className="absolute top-3 right-5 w-2 h-2 rounded-full bg-purple-400 animate-ping"></div>
              )}
            </div>

            {/* Card Chapter 2 */}
            <div 
              onClick={() => { setSelectedGalleryChapter(2); playSound('pop'); }}
              className={`bg-gray-900 p-8 rounded-[3rem] text-white text-center shadow-2xl border-b-8 relative group overflow-hidden min-w-[150px] sm:min-w-[180px] cursor-pointer transition-all duration-300 ${
                selectedGalleryChapter === 2 
                  ? 'border-indigo-500 scale-105 ring-4 ring-indigo-500/30 opacity-100' 
                  : 'border-indigo-950 opacity-65 hover:opacity-100 hover:scale-102 saturate-75 hover:saturate-100'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-[10px] font-black uppercase opacity-40 block mb-2 tracking-[0.3em] relative z-10">Nota Capítulo 2</span>
              <span className="text-5xl font-black relative z-10 tabular-nums">{Math.round(totalCap2)}<span className="text-2xl text-indigo-400">%</span></span>
              {selectedGalleryChapter === 2 && (
                <div className="absolute top-3 right-5 w-2 h-2 rounded-full bg-indigo-400 animate-ping"></div>
              )}
            </div>

            {/* Card Chapter 3 */}
            <div 
              onClick={() => { setSelectedGalleryChapter(3); playSound('pop'); }}
              className={`bg-gray-900 p-8 rounded-[3rem] text-white text-center shadow-2xl border-b-8 relative group overflow-hidden min-w-[150px] sm:min-w-[180px] cursor-pointer transition-all duration-300 ${
                selectedGalleryChapter === 3 
                  ? 'border-pink-500 scale-105 ring-4 ring-pink-500/30 opacity-100' 
                  : 'border-pink-950 opacity-65 hover:opacity-100 hover:scale-102 saturate-75 hover:saturate-100'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-[10px] font-black uppercase opacity-40 block mb-2 tracking-[0.3em] relative z-10">Nota Capítulo 3</span>
              <span className="text-5xl font-black relative z-10 tabular-nums">{Math.round(totalCap3)}<span className="text-2xl text-pink-400">%</span></span>
              {selectedGalleryChapter === 3 && (
                <div className="absolute top-3 right-5 w-2 h-2 rounded-full bg-pink-400 animate-ping"></div>
              )}
            </div>

            {/* Card Chapter 4 */}
            <div 
              onClick={() => { setSelectedGalleryChapter(4); playSound('pop'); }}
              className={`bg-gray-900 p-8 rounded-[3rem] text-white text-center shadow-2xl border-b-8 relative group overflow-hidden min-w-[150px] sm:min-w-[180px] cursor-pointer transition-all duration-300 ${
                selectedGalleryChapter === 4 
                  ? 'border-emerald-500 scale-105 ring-4 ring-emerald-500/30 opacity-100' 
                  : 'border-emerald-950 opacity-65 hover:opacity-100 hover:scale-102 saturate-75 hover:saturate-100'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-[10px] font-black uppercase opacity-40 block mb-2 tracking-[0.3em] relative z-10">Nota Capítulo 4</span>
              <span className="text-5xl font-black relative z-10 tabular-nums">{Math.round(totalCap4)}<span className="text-2xl text-emerald-400">%</span></span>
              {selectedGalleryChapter === 4 && (
                <div className="absolute top-3 right-5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
              )}
            </div>
          </div>
        </header>

        {/* NAVEGACIÓN DE CAPÍTULOS POR PESTAÑAS */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-16 bg-white/70 p-3 rounded-[2.5rem] shadow-xl border border-gray-100 backdrop-blur-md max-w-5xl mx-auto">
          {[
            { id: 1, name: 'Capítulo 1', desc: 'Pensamiento Verbal', icon: 'fa-book', color: 'border-purple-500 bg-purple-50 text-purple-600' },
            { id: 2, name: 'Capítulo 2', desc: 'Pensamiento Numérico', icon: 'fa-brain', color: 'border-indigo-500 bg-indigo-50 text-indigo-600' },
            { id: 3, name: 'Capítulo 3', desc: 'Pensamiento Espacial', icon: 'fa-cube', color: 'border-pink-500 bg-pink-50 text-pink-600' },
            { id: 4, name: 'Capítulo 4', desc: 'Secuencias e Historias', icon: 'fa-flag-checkered', color: 'border-emerald-500 bg-emerald-50 text-emerald-600' },
          ].map((tab) => {
            const isSelected = selectedGalleryChapter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedGalleryChapter(tab.id);
                  playSound('pop');
                }}
                className={`flex-1 min-w-[150px] flex items-center gap-3 px-5 py-4 rounded-[2rem] font-black transition-all duration-300 relative overflow-hidden group text-left ${
                  isSelected
                    ? 'bg-gray-900 text-white shadow-xl scale-105'
                    : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 shadow-sm hover:scale-102 border border-gray-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-transform group-hover:scale-105 ${
                  isSelected ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                }`}>
                  <i className={`fas ${tab.icon}`}></i>
                </div>
                <div className="flex-grow min-w-0">
                  <span className="text-[10px] block leading-none font-black tracking-wider uppercase opacity-80">{tab.name}</span>
                  <span className={`text-[9px] block font-bold truncate mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>{tab.desc}</span>
                </div>
                {isSelected && (
                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${
                    tab.id === 1 ? 'bg-purple-500' : tab.id === 2 ? 'bg-indigo-500' : tab.id === 3 ? 'bg-pink-500' : 'bg-emerald-500'
                  }`}></div>
                )}
              </button>
            );
          })}
        </div>

        {/* CONTENIDO CONDICIONAL DEL CAPÍTULO SELECCIONADO */}
        {selectedGalleryChapter === 1 && (
          <div className="animate-fade-in duration-500">
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

            {/* MÓDULOS CAPÍTULO 1 */}
            <div className="mb-16">
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
          </div>
        )}

        {selectedGalleryChapter === 2 && (
          <div className="animate-fade-in duration-500">
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

            {/* MÓDULOS CAPÍTULO 2 */}
            <div className="mb-16">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center"><i className="fas fa-brain"></i></span>
                Módulos Capítulo 2
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* BLOQUE 1 CAP 2 */}
                <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <i className="fas fa-key"></i>
                    </div>
                    <h3 className="font-black text-gray-800 text-sm leading-tight">Bloque 1: Criptogramas</h3>
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

                {/* BLOQUE 2 CAP 2 */}
                <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <i className="fas fa-equals"></i>
                    </div>
                    <h3 className="font-black text-gray-800 text-sm leading-tight">Bloque 2: Ecuaciones Gráficas</h3>
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

                {/* BLOQUE 3 CAP 2 - CRUCINÚMEROS Y RETOS */}
                <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <i className="fas fa-puzzle-piece"></i>
                    </div>
                    <h3 className="font-black text-gray-800 text-sm leading-tight">Bloque 3: Crucinúmeros y Retos</h3>
                  </div>
                  <div className="space-y-8 flex-grow">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">Progreso General</span>
                        <span className="text-amber-600">{Math.round(block3Avg)}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${block3Avg}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                    <span className="bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(block3Avg)}</span>
                  </div>
                </div>

                {/* BLOQUE 4 CAP 2 - MENSAJE OCULTO */}
                <div className="bg-rose-50 p-10 rounded-[4rem] border-4 border-white shadow-2xl flex flex-col group hover:scale-105 transition-all ring-8 ring-rose-50/50">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-rose-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform">
                      <i className="fas fa-user-secret"></i>
                    </div>
                    <div>
                      <h3 className="font-black text-rose-900 text-sm leading-tight">Bloque 4: Mensaje Oculto</h3>
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
          </div>
        )}

        {selectedGalleryChapter === 3 && (
          <div className="animate-fade-in duration-500">
            {/* BARRA DE PROGRESO GAMIFICADA CAPÍTULO 3 */}
            <div className="mb-20 px-4">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-3xl font-black text-gray-800 tracking-tight">Misión Espacial Isométrica</h3>
                  <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Capítulo 3: Pensamiento Espacial</p>
                </div>
                <div className="text-right">
                  <span className="text-6xl font-black text-pink-600 tabular-nums">{Math.round(totalCap3)}%</span>
                </div>
              </div>
              
              <div className="relative pt-4 pb-8">
                {/* Hitos */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-8 relative z-10">
                  {[
                    { pct: 30, icon: 'fa-trophy', color: 'text-orange-400', label: 'Bronce (30-59%)' },
                    { pct: 60, icon: 'fa-trophy', color: 'text-slate-400', label: 'Plata (60-79%)' },
                    { pct: 80, icon: 'fa-trophy', color: 'text-yellow-400', label: 'Oro (80-89%)' },
                    { pct: 90, icon: 'fa-gem', color: 'pink-gradient pink-shadow', label: 'Diamante (90-100%)' }
                  ].map((hito) => (
                    <div 
                      key={hito.pct} 
                      className={`flex flex-col items-center transition-all duration-500 ${totalCap3 >= hito.pct ? 'scale-105 md:scale-110 opacity-100' : 'opacity-30 grayscale'}`}
                    >
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-2xl md:text-3xl mb-3 border-4 ${totalCap3 >= hito.pct ? 'border-pink-400 animate-bounce' : 'border-gray-100'}`}>
                        <i className={`fas ${hito.icon} ${hito.pct === 90 ? 'text-pink-500' : hito.color}`}></i>
                      </div>
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter text-gray-600 text-center leading-tight">{hito.label}</span>
                    </div>
                  ))}
                </div>

                {/* Barra de fondo */}
                <div className="h-6 bg-gray-100 rounded-full shadow-inner relative overflow-hidden border-4 border-white">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-400 transition-all duration-1000 shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                    style={{ width: `${totalCap3}%` }}
                  >
                    <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* MÓDULOS CAPÍTULO 3 */}
            <div className="mb-16">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center"><i className="fas fa-cube"></i></span>
                Módulos Capítulo 3
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* BLOQUE 1 CAP 3 */}
                <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shadow-inner group-hover:bg-pink-600 group-hover:text-white transition-colors">
                      <i className="fas fa-vector-square"></i>
                    </div>
                    <h3 className="font-black text-gray-800 text-sm leading-tight">Bloque 1: Transformaciones</h3>
                  </div>
                  <div className="space-y-8 flex-grow">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">Progreso General</span>
                        <span className="text-pink-600">{Math.round(transformacionesProg)}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-pink-500 transition-all duration-1000" style={{ width: `${transformacionesProg}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                    <span className="bg-pink-50 text-pink-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(transformacionesProg)}</span>
                  </div>
                </div>

                {/* BLOQUE 2 CAP 3 */}
                <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <i className="fas fa-border-all"></i>
                    </div>
                    <h3 className="font-black text-gray-800 text-sm leading-tight">Bloque 2: Diseño Mosaicos</h3>
                  </div>
                  <div className="space-y-8 flex-grow">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">Progreso General</span>
                        <span className="text-indigo-600">{Math.round(mosaicosProg)}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${mosaicosProg}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                    <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(mosaicosProg)}</span>
                  </div>
                </div>

                {/* BLOQUE 3 CAP 3 */}
                <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <i className="fas fa-cubes"></i>
                    </div>
                    <h3 className="font-black text-gray-800 text-sm leading-tight">Bloque 3: Conteo Cubos</h3>
                  </div>
                  <div className="space-y-8 flex-grow">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">Progreso General</span>
                        <span className="text-purple-600">{Math.round(conteoProg)}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${conteoProg}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                    <span className="bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(conteoProg)}</span>
                  </div>
                </div>

                {/* BLOQUE 4 CAP 3 */}
                <div className="bg-fuchsia-50 p-10 rounded-[4rem] border-4 border-white shadow-2xl flex flex-col group hover:scale-105 transition-all ring-8 ring-fuchsia-50/50">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-fuchsia-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform">
                      <i className="fas fa-cube"></i>
                    </div>
                    <div>
                      <h3 className="font-black text-fuchsia-900 text-sm leading-tight">Bloque 4: Cubo Soma</h3>
                      <span className="text-[8px] font-black text-fuchsia-400 uppercase tracking-widest">Policubos 3D</span>
                    </div>
                  </div>
                  <div className="space-y-8 flex-grow">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-fuchsia-400">
                        <span>Progreso General</span>
                        <span className="bg-white px-3 py-1 rounded-full text-fuchsia-700 shadow-sm">{Math.round(somacuboProg)}%</span>
                      </div>
                      <div className="h-5 bg-white rounded-full overflow-hidden shadow-inner border border-fuchsia-100 p-1">
                        <div className="h-full bg-gradient-to-r from-fuchsia-400 to-fuchsia-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(217,70,239,0.4)]" style={{ width: `${somacuboProg}%` }}></div>
                      </div>
                      <div className="text-center mt-2">
                        <span className="text-[9px] font-black text-fuchsia-600 bg-white px-3 py-1 rounded-full shadow-sm">Escala: {getStatusLabel(somacuboProg)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedGalleryChapter === 4 && (
          <div className="animate-fade-in duration-500">
            {/* BARRA DE PROGRESO GAMIFICADA CAPÍTULO 4 */}
            <div className="mb-20 px-4">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-3xl font-black text-gray-800 tracking-tight">Frontera Final de Secuencias</h3>
                  <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Capítulo 4: Desafío de Secuencias e Historias</p>
                </div>
                <div className="text-right">
                  <span className="text-6xl font-black text-emerald-600 tabular-nums">{Math.round(totalCap4)}%</span>
                </div>
              </div>
              
              <div className="relative pt-4 pb-8">
                {/* Hitos */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-8 relative z-10">
                  {[
                    { pct: 30, icon: 'fa-trophy', color: 'text-orange-400', label: 'Bronce (30-59%)' },
                    { pct: 60, icon: 'fa-trophy', color: 'text-slate-400', label: 'Plata (60-79%)' },
                    { pct: 80, icon: 'fa-trophy', color: 'text-yellow-400', label: 'Oro (80-89%)' },
                    { pct: 90, icon: 'fa-gem', color: 'emerald-gradient emerald-shadow', label: 'Diamante (90-100%)' }
                  ].map((hito) => (
                    <div 
                      key={hito.pct} 
                      className={`flex flex-col items-center transition-all duration-500 ${totalCap4 >= hito.pct ? 'scale-105 md:scale-110 opacity-100' : 'opacity-30 grayscale'}`}
                    >
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-2xl md:text-3xl mb-3 border-4 ${totalCap4 >= hito.pct ? 'border-emerald-400 animate-bounce' : 'border-gray-100'}`}>
                        <i className={`fas ${hito.icon} ${hito.pct === 90 ? 'text-emerald-500' : hito.color}`}></i>
                      </div>
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter text-gray-600 text-center leading-tight">{hito.label}</span>
                    </div>
                  ))}
                </div>

                {/* Barra de fondo */}
                <div className="h-6 bg-gray-100 rounded-full shadow-inner relative overflow-hidden border-4 border-white">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 transition-all duration-1000 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                    style={{ width: `${totalCap4}%` }}
                  >
                    <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* MÓDULOS CAPÍTULO 4 */}
            <div className="mb-16">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><i className="fas fa-flag-checkered"></i></span>
                Módulos Capítulo 4
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* BLOQUE 1 CAP 4 */}
                <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <i className="fas fa-shapes"></i>
                    </div>
                    <h3 className="font-black text-gray-800 text-sm leading-tight">Bloque 1: Secuencias Gráficas</h3>
                  </div>
                  <div className="space-y-8 flex-grow">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">Progreso General</span>
                        <span className="text-emerald-600">{Math.round(secGraficasProg)}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${secGraficasProg}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                    <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(secGraficasProg)}</span>
                  </div>
                </div>

                {/* BLOQUE 2 CAP 4 */}
                <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 shadow-inner group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      <i className="fas fa-sort-numeric-down"></i>
                    </div>
                    <h3 className="font-black text-gray-800 text-sm leading-tight">Bloque 2: Secuencias Numéricas</h3>
                  </div>
                  <div className="space-y-8 flex-grow">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">Progreso General</span>
                        <span className="text-teal-600">{Math.round(secNumericasProg)}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${secNumericasProg}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                    <span className="bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(secNumericasProg)}</span>
                  </div>
                </div>

                {/* BLOQUE 3 CAP 4 */}
                <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col group hover:-translate-y-2 transition-all">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600 shadow-inner group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                      <i className="fas fa-arrows-alt"></i>
                    </div>
                    <h3 className="font-black text-gray-800 text-sm leading-tight">Bloque 3: Lateralidad</h3>
                  </div>
                  <div className="space-y-8 flex-grow">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">Progreso General</span>
                        <span className="text-cyan-600">{Math.round(lateralProg)}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${lateralProg}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                    <span className="bg-cyan-50 text-cyan-700 px-4 py-1.5 rounded-full text-[10px] font-black">Escala: {getStatusLabel(lateralProg)}</span>
                  </div>
                </div>

                {/* BLOQUE 4 CAP 4 */}
                <div className="bg-emerald-50 p-10 rounded-[4rem] border-4 border-white shadow-2xl flex flex-col group hover:scale-105 transition-all ring-8 ring-emerald-50/50">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-emerald-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform">
                      <i className="fas fa-book-reader"></i>
                    </div>
                    <div>
                      <h3 className="font-black text-emerald-900 text-sm leading-tight">Bloque 4: Desafío de Historia</h3>
                      <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Cierre de Aventura</span>
                    </div>
                  </div>
                  <div className="space-y-8 flex-grow">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        <span>Progreso General</span>
                        <span className="bg-white px-3 py-1 rounded-full text-emerald-700 shadow-sm">{Math.round(historiaProg)}%</span>
                      </div>
                      <div className="h-5 bg-white rounded-full overflow-hidden shadow-inner border border-emerald-100 p-1">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.4)]" style={{ width: `${historiaProg}%` }}></div>
                      </div>
                      <div className="text-center mt-2">
                        <span className="text-[9px] font-black text-emerald-600 bg-white px-3 py-1 rounded-full shadow-sm">Escala: {getStatusLabel(historiaProg)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CUADRO DE HONOR DEL GRADO - 4 COLUMNAS */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-black text-gray-800 tracking-tighter mb-4">Galería de Logros y Excelencia <span className="text-purple-600">{student.Grado}</span></h3>
            
            {/* Chapter Selector for Gallery */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[1, 2, 3, 4].map((cap) => {
                const isActive = (config as any)[`capitulo_${cap}_activo`];
                const isSelected = selectedGalleryChapter === cap;
                
                return (
                  <button
                    key={cap}
                    onClick={() => {
                      if (isActive || cap < defaultChapter) {
                        playSound('pop');
                        setSelectedGalleryChapter(cap);
                      }
                    }}
                    disabled={!isActive && cap > defaultChapter}
                    className={`px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                      isSelected 
                        ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200 scale-105' 
                        : isActive || cap < defaultChapter
                          ? 'bg-white border-purple-100 text-purple-400 hover:border-purple-300'
                          : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {cap < defaultChapter ? `Histórico Cap. ${cap}` : `Capítulo ${cap}`}
                    {!isActive && cap > defaultChapter && <i className="fas fa-lock ml-2 text-[8px]"></i>}
                  </button>
                );
              })}
            </div>

            <div className="inline-block bg-purple-50 px-8 py-3 rounded-full border border-purple-100 shadow-sm">
              <p className="text-purple-600 font-black text-xs uppercase tracking-[0.2em]">
                <i className="fas fa-star mr-2 animate-pulse"></i>
                Mostrando resultados del <span className="font-black underline">Capítulo {selectedGalleryChapter}</span>
              </p>
            </div>
          </div>

          {ranking.filter(r => ((r as any).galleryProgress || 0) >= 30).length === 0 ? (
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-12 rounded-[3rem] text-center shadow-2xl animate-fade-up border-8 border-white">
              <div className="w-24 h-24 bg-white/20 rounded-[2rem] flex items-center justify-center text-white text-5xl mx-auto mb-8 animate-bounce">
                <i className="fas fa-rocket"></i>
              </div>
              <h4 className="text-3xl font-black text-white mb-4 tracking-tighter">¡EL CUADRO DE HONOR ESTÁ ESPERANDO!</h4>
              <p className="text-purple-100 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                Aún no hay estudiantes con el <span className="text-yellow-300 font-black">30%</span> de progreso en el <span className="font-black">Capítulo {selectedGalleryChapter}</span>. ¡Sé el primero en aparecer aquí!
              </p>
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
                {ranking.filter(r => ((r as any).galleryProgress || 0) >= 30 && ((r as any).galleryProgress || 0) < 60).map((r, i) => {
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
                          {Math.round((r as any).galleryProgress || 0)}%
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-black text-sm tracking-tight leading-tight ${isMe ? 'text-orange-900' : 'text-gray-700'}`}>{r.Nombre || r.Usuario}</span>
                          <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest mt-1">Cap. {selectedGalleryChapter}</span>
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
                {ranking.filter(r => ((r as any).galleryProgress || 0) >= 60 && ((r as any).galleryProgress || 0) < 80).map((r, i) => {
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
                          {Math.round((r as any).galleryProgress || 0)}%
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-black text-sm tracking-tight leading-tight ${isMe ? 'text-slate-900' : 'text-gray-700'}`}>{r.Nombre || r.Usuario}</span>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Cap. {selectedGalleryChapter}</span>
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
                {ranking.filter(r => ((r as any).galleryProgress || 0) >= 80 && ((r as any).galleryProgress || 0) < 90).map((r, i) => {
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
                          {Math.round((r as any).galleryProgress || 0)}%
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-black text-sm tracking-tight leading-tight ${isMe ? 'text-yellow-900' : 'text-gray-800'}`}>{r.Nombre || r.Usuario}</span>
                          <span className="text-[9px] font-black text-yellow-600 uppercase tracking-widest mt-1">Cap. {selectedGalleryChapter}</span>
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
                {ranking.filter(r => ((r as any).galleryProgress || 0) >= 90).map((r, i) => {
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
                          {Math.round((r as any).galleryProgress || 0)}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-black text-sm tracking-tight leading-tight flex items-center justify-center gap-1 ${isMe ? 'text-cyan-900' : 'text-gray-900'}`}>
                            {r.Nombre || r.Usuario}
                            <i className="fas fa-gem diamond-gradient text-[10px] animate-pulse"></i>
                          </span>
                          <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mt-1">Cap. {selectedGalleryChapter}</span>
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
           <div className={`text-8xl ${badge.color} animate-float drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] relative z-10`}>
             <i className={`fas ${badge.icon}`}></i>
           </div>
           <div className="text-center md:text-left flex-grow relative z-10">
             <h4 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">{badge.label}</h4>
             <p className="text-indigo-200 font-medium text-lg leading-relaxed italic max-w-2xl">
               {galleryScore >= 96 ? "¡Extraordinario! Has alcanzado el Nivel Superior. Tu razonamiento lógico es impecable." : 
                galleryScore >= 60 ? "¡Excelente trabajo! Estás en Nivel Alto. Sigue practicando para llegar a la excelencia total." :
                galleryScore >= 30 ? "Buen desempeño. Estás en Nivel Básico. Tienes las bases, pero puedes mejorar mucho más." :
                "Nivel Bajo. Es importante que repases los conceptos y vuelvas a intentar los retos para fortalecer tu lógica."}
             </p>
           </div>
           <div className="shrink-0 relative z-10">
              <div className="bg-white text-indigo-950 px-8 py-3 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-50 transition-colors cursor-default">
                {galleryScore >= 100 ? `Capítulo ${selectedGalleryChapter} Completado` : `Progreso Capítulo ${selectedGalleryChapter}`}
              </div>
           </div>
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

      {/* MODAL DIAMANTE CAPÍTULO 3 - DESEMPEÑO SUPERIOR CON 4 INSIGNIAS */}
      {showChapter3Modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-2xl animate-fadeIn">
          <div className="bg-white rounded-[3rem] md:rounded-[4rem] p-8 md:p-16 max-w-3xl w-full text-center relative overflow-y-auto max-h-[90vh] shadow-[0_0_100px_rgba(236,72,153,0.4)] border-8 border-pink-100">
            <button 
              onClick={() => setShowChapter3Modal(false)}
              className="absolute top-6 right-8 text-gray-400 hover:text-pink-500 transition-colors text-3xl cursor-pointer"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-400 to-pink-500 animate-pulse"></div>
            
            <div className="text-7xl md:text-9xl mb-8 md:mb-10 animate-float text-pink-500 drop-shadow-[0_0_25px_rgba(236,72,153,0.5)]">
              <i className="fas fa-cubes"></i>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4 md:mb-6 uppercase">¡MAGNÍFICO ARQUITECTO!</h2>
            <p className="text-xl md:text-2xl font-black text-pink-600 uppercase tracking-[0.2em] mb-8 md:mb-10">PENSAMIENTO ESPACIAL SUPERIOR</p>
            
            <p className="text-gray-500 text-lg md:text-xl font-semibold leading-relaxed mb-10 md:mb-12">
              ¡Felicitaciones! Has alcanzado un <span className="text-pink-600 font-black">Desempeño Superior {"(>=90%)"}</span> en el Capítulo 3 de Pensamiento Espacial y has ganado las <span className="text-purple-600 font-black">4 insignias de la aventura isométrica</span>:
              <br />
              🧭 <strong>Brújula Isométrica</strong>, 🚀 <strong>Vectores de Vuelo</strong>, 🦋 <strong>Alquimista del Espejo</strong> y 🌀 <strong>Guardián del Giro</strong>.
              <br /><br />
              Tu gran visión espacial y destreza lógica te sitúan en el más alto nivel. ¡Sigue transformando el mundo, maestro de la geometría!
            </p>
            
            <button 
              onClick={() => { playSound('pop'); setShowChapter3Modal(false); }}
              className="w-full md:w-auto px-12 py-6 bg-pink-500 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-pink-600 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
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
