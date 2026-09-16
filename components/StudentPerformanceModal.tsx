import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  student: StudentProfile;
  allStudents?: StudentProfile[];
  onClose: () => void;
  onViewAsStudent?: (student: StudentProfile) => void;
}

export const StudentPerformanceModal: React.FC<Props> = ({
  student,
  allStudents = [],
  onClose,
  onViewAsStudent
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'cap1' | 'cap2' | 'cap3' | 'cap4'>('overview');

  // Chapter 1 calculations
  const cap1Modules = [
    { name: 'Ordenamiento de Información', value: student.progreso_ordenamiento || 0, icon: 'fa-sort-amount-down' },
    { name: 'Proposiciones Lógicas', value: student.progreso_proposiciones || 0, icon: 'fa-project-diagram' },
    { name: 'Cuantificadores Lógicos', value: student.progreso_cuantificadores || 0, icon: 'fa-filter' },
    { name: 'Programación Micro:bit', value: student.progreso_microbit || 0, icon: 'fa-microchip' }
  ];
  const avg1 = Math.round(cap1Modules.reduce((acc, m) => acc + m.value, 0) / 4);

  // Chapter 2 calculations
  const block3Avg = Math.round((
    (student.progreso_sudoku || 0) +
    (student.progreso_magic_squares || 0) +
    (student.progreso_crucinumeros || 0) +
    (student.progreso_piramides || 0)
  ) / 4);

  const cap2Modules = [
    { name: 'Criptogramas', value: student.progreso_criptogramas || 0, icon: 'fa-key' },
    { name: 'Ecuaciones Gráficas', value: student.progreso_ecuaciones_graficas || 0, icon: 'fa-shapes' },
    { name: 'Acertijos y Lógica Numérica', value: block3Avg, icon: 'fa-puzzle-piece' },
    { name: 'Mensaje Oculto', value: student.progreso_mensaje_oculto || 0, icon: 'fa-envelope-open-text' }
  ];
  const avg2 = Math.round(cap2Modules.reduce((acc, m) => acc + m.value, 0) / 4);

  // Chapter 3 calculations
  const cap3Modules = [
    { name: 'Transformaciones Isométricas', value: student.progreso_transformaciones || 0, icon: 'fa-arrows-alt' },
    { name: 'Trazado de Mosaicos', value: student.progreso_mosaicos || 0, icon: 'fa-th' },
    { name: 'Conteo de Cubos', value: student.progreso_conteocubos || 0, icon: 'fa-cubes' },
    { name: 'Cubo de Soma', value: student.progreso_cubosoma || 0, icon: 'fa-cube' }
  ];
  const avg3 = Math.round(cap3Modules.reduce((acc, m) => acc + m.value, 0) / 4);

  // Chapter 4 calculations
  const cap4Modules = [
    { name: 'Secuencias Gráficas', value: student.progreso_secuencias_graficas || 0, icon: 'fa-bezier-curve' },
    { name: 'Secuencias Numéricas', value: student.progreso_secuencias_numericas || 0, icon: 'fa-sort-numeric-up' },
    { name: 'Pensamiento Lateral', value: student.progreso_lateral || 0, icon: 'fa-lightbulb' },
    { name: 'Historia Final Evaluativa', value: student.progreso_historia_final || 0, icon: 'fa-book-open' }
  ];
  const avg4 = Math.round(cap4Modules.reduce((acc, m) => acc + m.value, 0) / 4);

  // General Average
  const generalAverage = Math.round((avg1 + avg2 + avg3 + avg4) / 4);

  // Grade benchmark
  const gradeStudents = allStudents.filter(s => s.Grado === student.Grado);
  const gradeAverage = gradeStudents.length > 0
    ? Math.round(
        gradeStudents.reduce((acc, s) => {
          const sAvg1 = ((s.progreso_ordenamiento || 0) + (s.progreso_proposiciones || 0) + (s.progreso_cuantificadores || 0) + (s.progreso_microbit || 0)) / 4;
          const sB3 = ((s.progreso_sudoku || 0) + (s.progreso_magic_squares || 0) + (s.progreso_crucinumeros || 0) + (s.progreso_piramides || 0)) / 4;
          const sAvg2 = ((s.progreso_criptogramas || 0) + (s.progreso_ecuaciones_graficas || 0) + sB3 + (s.progreso_mensaje_oculto || 0)) / 4;
          const sAvg3 = ((s.progreso_transformaciones || 0) + (s.progreso_mosaicos || 0) + (s.progreso_conteocubos || 0) + (s.progreso_cubosoma || 0)) / 4;
          const sAvg4 = ((s.progreso_secuencias_graficas || 0) + (s.progreso_secuencias_numericas || 0) + (s.progreso_lateral || 0) + (s.progreso_historia_final || 0)) / 4;
          return acc + ((sAvg1 + sAvg2 + sAvg3 + sAvg4) / 4);
        }, 0) / gradeStudents.length
      )
    : null;

  const getLevelInfo = (score: number) => {
    if (score >= 90) return { label: 'SUPERIOR', color: 'bg-emerald-500', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 80) return { label: 'ALTO', color: 'bg-blue-500', text: 'text-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (score >= 60) return { label: 'BÁSICO', color: 'bg-amber-500', text: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'BAJO', color: 'bg-rose-500', text: 'text-rose-600', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const currentLevel = getLevelInfo(generalAverage);

  // Pie chart data: contribution of the 4 chapters
  const chapterPieData = [
    { name: 'Capítulo 1: Lógico', value: Math.max(avg1, 1), actual: avg1, color: '#9333ea' },
    { name: 'Capítulo 2: Matemático', value: Math.max(avg2, 1), actual: avg2, color: '#ec4899' },
    { name: 'Capítulo 3: Visoespacial', value: Math.max(avg3, 1), actual: avg3, color: '#4f46e5' },
    { name: 'Capítulo 4: Creatividad', value: Math.max(avg4, 1), actual: avg4, color: '#06b6d4' }
  ];

  const currentModuleList = 
    selectedTab === 'cap1' ? { title: 'Capítulo 1: Pensamiento Lógico', avg: avg1, modules: cap1Modules, color: 'purple' } :
    selectedTab === 'cap2' ? { title: 'Capítulo 2: Razonamiento Matemático', avg: avg2, modules: cap2Modules, color: 'pink' } :
    selectedTab === 'cap3' ? { title: 'Capítulo 3: Habilidades Visoespaciales', avg: avg3, modules: cap3Modules, color: 'indigo' } :
    selectedTab === 'cap4' ? { title: 'Capítulo 4: Pensamiento Lateral', avg: avg4, modules: cap4Modules, color: 'cyan' } :
    null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl border-4 border-purple-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white p-6 md:p-8 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center text-xl text-white backdrop-blur-md"
            title="Cerrar"
          >
            <i className="fas fa-times"></i>
          </button>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-purple-700 font-black text-3xl shadow-xl shrink-0">
              {(student.Nombre || student.Usuario).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase">
                  Grado {student.Grado || 'N/A'}
                </span>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-mono">
                  @{student.Usuario}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white ${currentLevel.text}`}>
                  Nivel {currentLevel.label}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">{student.Nombre || student.Usuario}</h2>
              <p className="text-white/80 text-xs mt-1">
                Ficha Gráfica Integral de Desempeño Escolar
              </p>
            </div>

            {onViewAsStudent && (
              <button
                onClick={() => onViewAsStudent(student)}
                className="mt-4 md:mt-0 px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <i className="fas fa-eye"></i>
                Ver como estudiante
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 px-6 pt-3 gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-5 py-3 font-black text-xs uppercase tracking-wider rounded-t-2xl transition-all flex items-center gap-2 shrink-0 ${
              selectedTab === 'overview'
                ? 'bg-white text-purple-700 border-t-2 border-x border-gray-200 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-chart-pie"></i>
            Resumen General
          </button>
          <button
            onClick={() => setSelectedTab('cap1')}
            className={`px-4 py-3 font-black text-xs uppercase tracking-wider rounded-t-2xl transition-all flex items-center gap-2 shrink-0 ${
              selectedTab === 'cap1'
                ? 'bg-white text-purple-700 border-t-2 border-x border-gray-200 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            Capítulo 1 ({avg1}%)
          </button>
          <button
            onClick={() => setSelectedTab('cap2')}
            className={`px-4 py-3 font-black text-xs uppercase tracking-wider rounded-t-2xl transition-all flex items-center gap-2 shrink-0 ${
              selectedTab === 'cap2'
                ? 'bg-white text-pink-600 border-t-2 border-x border-gray-200 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
            Capítulo 2 ({avg2}%)
          </button>
          <button
            onClick={() => setSelectedTab('cap3')}
            className={`px-4 py-3 font-black text-xs uppercase tracking-wider rounded-t-2xl transition-all flex items-center gap-2 shrink-0 ${
              selectedTab === 'cap3'
                ? 'bg-white text-indigo-600 border-t-2 border-x border-gray-200 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            Capítulo 3 ({avg3}%)
          </button>
          <button
            onClick={() => setSelectedTab('cap4')}
            className={`px-4 py-3 font-black text-xs uppercase tracking-wider rounded-t-2xl transition-all flex items-center gap-2 shrink-0 ${
              selectedTab === 'cap4'
                ? 'bg-white text-cyan-600 border-t-2 border-x border-gray-200 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            Capítulo 4 ({avg4}%)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {selectedTab === 'overview' ? (
            <div className="space-y-6">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-purple-50/70 border-2 border-purple-100 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">Capítulo 1</span>
                  <div className="text-2xl font-black text-purple-900 mt-1">{avg1}%</div>
                  <div className="w-full bg-purple-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${avg1}%` }}></div>
                  </div>
                </div>

                <div className="bg-pink-50/70 border-2 border-pink-100 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-pink-700">Capítulo 2</span>
                  <div className="text-2xl font-black text-pink-900 mt-1">{avg2}%</div>
                  <div className="w-full bg-pink-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-pink-500 h-full rounded-full" style={{ width: `${avg2}%` }}></div>
                  </div>
                </div>

                <div className="bg-indigo-50/70 border-2 border-indigo-100 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Capítulo 3</span>
                  <div className="text-2xl font-black text-indigo-900 mt-1">{avg3}%</div>
                  <div className="w-full bg-indigo-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${avg3}%` }}></div>
                  </div>
                </div>

                <div className="bg-cyan-50/70 border-2 border-cyan-100 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-700">Capítulo 4</span>
                  <div className="text-2xl font-black text-cyan-900 mt-1">{avg4}%</div>
                  <div className="w-full bg-cyan-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${avg4}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Main Chart and Benchmark Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-gray-50/70 p-6 rounded-3xl border border-gray-200/80">
                {/* Donut Chart */}
                <div className="flex flex-col items-center justify-center relative">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                    Balance entre Capítulos
                  </h4>
                  <div className="w-64 h-64 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chapterPieData}
                          innerRadius={70}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {chapterPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any, name: any, item: any) => [
                            `${item.payload.actual}%`,
                            item.payload.name
                          ]}
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            borderRadius: '1rem',
                            border: 'none',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Central Score Badge */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-black text-gray-800 leading-none">
                        {generalAverage}%
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Promedio
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 mt-1 rounded-full ${currentLevel.badge}`}>
                        {currentLevel.label}
                      </span>
                    </div>
                  </div>

                  {/* Chart Legend */}
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs font-bold w-full max-w-xs">
                    {chapterPieData.map((c) => (
                      <div key={c.name} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }}></span>
                        <span className="text-gray-600 truncate text-[11px]">{c.name.split(':')[0]}:</span>
                        <span className="text-gray-900 font-black text-[11px] ml-auto">{c.actual}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benchmark and Insights */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                      Comparativa con el Grupo ({student.Grado})
                    </h4>
                    {gradeAverage !== null ? (
                      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-gray-600">Promedio del Estudiante:</span>
                          <span className="font-black text-gray-900 text-base">{generalAverage}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-gray-600">Promedio Grado {student.Grado}:</span>
                          <span className="font-black text-indigo-600 text-base">{gradeAverage}%</span>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                            generalAverage >= gradeAverage ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            <i className={`fas ${generalAverage >= gradeAverage ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                          </div>
                          <div className="text-xs">
                            <span className="font-black text-gray-800">
                              {generalAverage >= gradeAverage ? '+' : ''}
                              {generalAverage - gradeAverage}%
                            </span>{' '}
                            <span className="text-gray-500">
                              respecto a la media de su grado escolar.
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-white rounded-2xl text-xs text-gray-400">
                        No hay suficientes datos del grado para comparar.
                      </div>
                    )}
                  </div>

                  {/* Recommendations */}
                  <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-2 text-purple-700 text-xs font-black uppercase tracking-wider mb-1">
                      <i className="fas fa-bullseye"></i>
                      Estado Pedagógico
                    </div>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      {generalAverage >= 90
                        ? 'El estudiante muestra un dominio sobresaliente en los 4 capítulos evaluados, demostrando alta competencia lógica, matemática y visoespacial.'
                        : generalAverage >= 80
                        ? 'Buen rendimiento general con avances sólidos. Se recomienda consolidar los submódulos donde el progreso sea inferior al 80%.'
                        : generalAverage >= 60
                        ? 'El estudiante alcanza los objetivos básicos. Requiere refuerzo específico y mayor tiempo de práctica en actividades prácticas.'
                        : 'Atención prioritaria: Rendimiento por debajo del promedio. Se sugiere acompañamiento guiado y revisión individualizada de talleres.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : currentModuleList ? (
            /* Detailed Chapter View */
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div>
                  <h3 className="text-lg font-black text-gray-800">{currentModuleList.title}</h3>
                  <p className="text-xs text-gray-500">Desglose de los 4 bloques temáticos del período</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-gray-900">{currentModuleList.avg}%</span>
                  <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">Promedio Capítulo</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentModuleList.modules.map((mod, idx) => {
                  const modLevel = getLevelInfo(mod.value);
                  return (
                    <div key={idx} className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm hover:border-purple-200 transition-all">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-base shrink-0">
                            <i className={`fas ${mod.icon}`}></i>
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Bloque {idx + 1}</span>
                            <h5 className="text-sm font-black text-gray-800 leading-tight">{mod.name}</h5>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${modLevel.badge}`}>
                          {mod.value}%
                        </span>
                      </div>

                      <div className="space-y-1.5 mt-2">
                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${modLevel.color}`}
                            style={{ width: `${mod.value}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                          <span>
                            {mod.value === 100 ? '✅ Completado al 100%' : mod.value > 0 ? '⚡ En progreso' : '⏳ Pendiente'}
                          </span>
                          <span>{mod.value}/100</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-400 font-medium">
            Institución Educativa Josefa Campos • Año 2026
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-800 text-white hover:bg-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
