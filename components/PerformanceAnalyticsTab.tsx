import React, { useState, useMemo } from 'react';
import { StudentProfile } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

interface Props {
  students: StudentProfile[];
  onSelectStudent: (student: StudentProfile) => void;
  onViewAsStudent?: (student: StudentProfile) => void;
}

export const PerformanceAnalyticsTab: React.FC<Props> = ({
  students,
  onSelectStudent,
  onViewAsStudent
}) => {
  const [selectedScope, setSelectedScope] = useState<'all' | '1' | '2' | '3' | '4'>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('Todos');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'ALL' | 'SUPERIOR' | 'ALTO' | 'BASICO' | 'BAJO'>('ALL');
  const [drillSearch, setDrillSearch] = useState('');

  // Extract available grades
  const grades = useMemo(() => {
    const list = Array.from(new Set(students.map(s => s.Grado).filter(Boolean))) as string[];
    return ['Todos', ...list.sort()];
  }, [students]);

  // Compute student scores with exact formula
  const processedStudents = useMemo(() => {
    return students.map(s => {
      // Cap 1
      const avg1 = Math.round((
        (s.progreso_ordenamiento || 0) +
        (s.progreso_proposiciones || 0) +
        (s.progreso_cuantificadores || 0) +
        (s.progreso_microbit || 0)
      ) / 4);

      // Cap 2
      const block3 = (
        (s.progreso_sudoku || 0) +
        (s.progreso_magic_squares || 0) +
        (s.progreso_crucinumeros || 0) +
        (s.progreso_piramides || 0)
      ) / 4;
      const avg2 = Math.round((
        (s.progreso_criptogramas || 0) +
        (s.progreso_ecuaciones_graficas || 0) +
        block3 +
        (s.progreso_mensaje_oculto || 0)
      ) / 4);

      // Cap 3
      const avg3 = Math.round((
        (s.progreso_transformaciones || 0) +
        (s.progreso_mosaicos || 0) +
        (s.progreso_conteocubos || 0) +
        (s.progreso_cubosoma || 0)
      ) / 4);

      // Cap 4
      const avg4 = Math.round((
        (s.progreso_secuencias_graficas || 0) +
        (s.progreso_secuencias_numericas || 0) +
        (s.progreso_lateral || 0) +
        (s.progreso_historia_final || 0)
      ) / 4);

      const general = Math.round((avg1 + avg2 + avg3 + avg4) / 4);

      let currentScore = general;
      if (selectedScope === '1') currentScore = avg1;
      else if (selectedScope === '2') currentScore = avg2;
      else if (selectedScope === '3') currentScore = avg3;
      else if (selectedScope === '4') currentScore = avg4;

      let level: 'SUPERIOR' | 'ALTO' | 'BASICO' | 'BAJO' = 'BAJO';
      if (currentScore >= 90) level = 'SUPERIOR';
      else if (currentScore >= 80) level = 'ALTO';
      else if (currentScore >= 60) level = 'BASICO';
      else level = 'BAJO';

      return {
        ...s,
        avg1,
        avg2,
        avg3,
        avg4,
        general,
        currentScore,
        level
      };
    });
  }, [students, selectedScope]);

  // Filter by grade
  const filteredStudents = useMemo(() => {
    return processedStudents.filter(s => {
      if (selectedGrade !== 'Todos' && s.Grado !== selectedGrade) return false;
      return true;
    });
  }, [processedStudents, selectedGrade]);

  // Compute distribution for Pie Chart
  const pieData = useMemo(() => {
    const counts = {
      SUPERIOR: 0,
      ALTO: 0,
      BASICO: 0,
      BAJO: 0
    };

    filteredStudents.forEach(s => {
      counts[s.level]++;
    });

    const total = filteredStudents.length || 1;

    return [
      {
        id: 'SUPERIOR',
        name: 'Superior (90-100%)',
        shortName: 'Superior',
        count: counts.SUPERIOR,
        percentage: Math.round((counts.SUPERIOR / total) * 100),
        color: '#10b981', // Emerald
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      },
      {
        id: 'ALTO',
        name: 'Alto (80-89%)',
        shortName: 'Alto',
        count: counts.ALTO,
        percentage: Math.round((counts.ALTO / total) * 100),
        color: '#3b82f6', // Blue
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200'
      },
      {
        id: 'BASICO',
        name: 'Básico (60-79%)',
        shortName: 'Básico',
        count: counts.BASICO,
        percentage: Math.round((counts.BASICO / total) * 100),
        color: '#f59e0b', // Amber
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200'
      },
      {
        id: 'BAJO',
        name: 'Bajo (< 60%)',
        shortName: 'Bajo',
        count: counts.BAJO,
        percentage: Math.round((counts.BAJO / total) * 100),
        color: '#f43f5e', // Rose
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200'
      }
    ];
  }, [filteredStudents]);

  // Grade comparison Bar Chart data
  const gradeBarData = useMemo(() => {
    const validGrades = grades.filter(g => g !== 'Todos');
    return validGrades.map(gradeName => {
      const inGrade = processedStudents.filter(s => s.Grado === gradeName);
      const avg = inGrade.length > 0
        ? Math.round(inGrade.reduce((acc, s) => acc + s.currentScore, 0) / inGrade.length)
        : 0;
      return {
        grade: `Grado ${gradeName}`,
        promedio: avg,
        total: inGrade.length
      };
    });
  }, [grades, processedStudents]);

  // Overall KPIs
  const groupAverage = useMemo(() => {
    if (filteredStudents.length === 0) return 0;
    const sum = filteredStudents.reduce((acc, s) => acc + s.currentScore, 0);
    return Math.round(sum / filteredStudents.length);
  }, [filteredStudents]);

  const approvalRate = useMemo(() => {
    if (filteredStudents.length === 0) return 0;
    const approved = filteredStudents.filter(s => s.currentScore >= 60).length;
    return Math.round((approved / filteredStudents.length) * 100);
  }, [filteredStudents]);

  // Students list filtered by level drill-down and search
  const drillDownList = useMemo(() => {
    return filteredStudents.filter(s => {
      if (selectedLevelFilter !== 'ALL' && s.level !== selectedLevelFilter) return false;
      if (drillSearch.trim()) {
        const query = drillSearch.toLowerCase();
        const matchName = (s.Nombre || '').toLowerCase().includes(query);
        const matchUser = (s.Usuario || '').toLowerCase().includes(query);
        if (!matchName && !matchUser) return false;
      }
      return true;
    }).sort((a, b) => b.currentScore - a.currentScore);
  }, [filteredStudents, selectedLevelFilter, drillSearch]);

  const scopeTitles = {
    all: 'Promedio General (Acumulado de los 4 Capítulos)',
    '1': 'Capítulo 1: Pensamiento Lógico y Proposicional',
    '2': 'Capítulo 2: Razonamiento Matemático y Criptografía',
    '3': 'Capítulo 3: Habilidades Visoespaciales y Geometría',
    '4': 'Capítulo 4: Pensamiento Lateral y Creativo'
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Scope and Grade Control Bar */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border-4 border-purple-50 p-6 md:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <span className="text-xs font-black tracking-widest uppercase text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              Módulo de Analítica Docente
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight mt-2">
              Distribución y Rendimiento Escolar
            </h2>
            <p className="text-gray-500 text-xs md:text-sm font-medium mt-0.5">
              Analiza el desempeño de tus estudiantes de forma global o capítulo por capítulo.
            </p>
          </div>

          {/* Grade Selector */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <span className="text-xs font-black uppercase tracking-wider text-gray-500 shrink-0">
              <i className="fas fa-filter mr-1 text-purple-500"></i> Grado:
            </span>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedLevelFilter('ALL');
              }}
              className="bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-2.5 font-black text-xs md:text-sm text-gray-700 outline-none focus:border-purple-500 transition-all cursor-pointer shadow-sm w-full lg:w-48"
            >
              {grades.map(g => (
                <option key={g} value={g}>
                  {g === 'Todos' ? 'Todos los Grados' : `Grado ${g}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scope Pill Tabs (General vs Cap 1 vs Cap 2 vs Cap 3 vs Cap 4) */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => {
              setSelectedScope('all');
              setSelectedLevelFilter('ALL');
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              selectedScope === 'all'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200 scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className="fas fa-globe"></i>
            Promedio General
          </button>
          <button
            onClick={() => {
              setSelectedScope('1');
              setSelectedLevelFilter('ALL');
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              selectedScope === '1'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200 scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Capítulo 1
          </button>
          <button
            onClick={() => {
              setSelectedScope('2');
              setSelectedLevelFilter('ALL');
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              selectedScope === '2'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-200 scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-pink-400"></span>
            Capítulo 2
          </button>
          <button
            onClick={() => {
              setSelectedScope('3');
              setSelectedLevelFilter('ALL');
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              selectedScope === '3'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            Capítulo 3
          </button>
          <button
            onClick={() => {
              setSelectedScope('4');
              setSelectedLevelFilter('ALL');
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              selectedScope === '4'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-200 scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Capítulo 4
          </button>
        </div>

        {/* Selected Scope Banner */}
        <div className="bg-purple-50/60 px-4 py-3 rounded-2xl flex items-center gap-3 text-purple-900 text-xs font-bold">
          <i className="fas fa-info-circle text-purple-600 text-base"></i>
          <span>
            Visualizando:{' '}
            <strong className="text-purple-950 font-black">{scopeTitles[selectedScope]}</strong>
            {selectedGrade !== 'Todos' && ` • Filtrado para Grado ${selectedGrade}`}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-purple-100 text-center">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2 text-base">
            <i className="fas fa-user-graduate"></i>
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Total Estudiantes</span>
          <div className="text-3xl font-black text-gray-800 mt-1">{filteredStudents.length}</div>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5">En el grado seleccionado</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-indigo-100 text-center">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-2 text-base">
            <i className="fas fa-chart-line"></i>
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Promedio del Grupo</span>
          <div className="text-3xl font-black text-indigo-700 mt-1">{groupAverage}%</div>
          <p className="text-[10px] font-bold text-indigo-400 mt-0.5">Calificación promedio</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-emerald-100 text-center">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2 text-base">
            <i className="fas fa-check-circle"></i>
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Tasa de Aprobación</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">{approvalRate}%</div>
          <p className="text-[10px] font-bold text-emerald-400 mt-0.5">Nota ≥ 60% (Básico o más)</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-amber-100 text-center">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-2 text-base">
            <i className="fas fa-medal"></i>
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Nivel Superior</span>
          <div className="text-3xl font-black text-amber-600 mt-1">
            {pieData.find(p => p.id === 'SUPERIOR')?.count || 0}
          </div>
          <p className="text-[10px] font-bold text-amber-500 mt-0.5">
            {pieData.find(p => p.id === 'SUPERIOR')?.percentage || 0}% de los alumnos
          </p>
        </div>
      </div>

      {/* Main Charts Grid: Donut Chart on Left, Bar Chart on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Torta / Donut por Desempeño */}
        <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-[3rem] shadow-xl border-4 border-purple-50 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                <i className="fas fa-chart-pie text-purple-600"></i>
                Distribución por Niveles de Desempeño
              </h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                Diagrama de Torta interactivo
              </p>
            </div>
            {selectedLevelFilter !== 'ALL' && (
              <button
                onClick={() => setSelectedLevelFilter('ALL')}
                className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1 rounded-full transition-all"
              >
                Limpiar Filtro
              </button>
            )}
          </div>

          <div className="relative w-full h-64 md:h-72 flex items-center justify-center">
            {filteredStudents.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="count"
                      cursor="pointer"
                      onClick={(data: any) => {
                        const levelId = (data?.id || data?.payload?.id) as 'SUPERIOR' | 'ALTO' | 'BASICO' | 'BAJO';
                        if (levelId) {
                          setSelectedLevelFilter(prev => prev === levelId ? 'ALL' : levelId);
                        }
                      }}
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.id}
                          fill={entry.color}
                          stroke="#ffffff"
                          strokeWidth={selectedLevelFilter === entry.id ? 4 : 2}
                          className="transition-all hover:opacity-80"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any, item: any) => [
                        `${value} estudiantes (${item.payload.percentage}%)`,
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

                {/* Central donut label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-gray-800 leading-none">
                    {filteredStudents.length}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    Alumnos
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400 text-xs font-bold">
                No hay datos de estudiantes para mostrar.
              </div>
            )}
          </div>

          {/* Interactive Legend / Level Slices */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-gray-100">
            {pieData.map((item) => {
              const isSelected = selectedLevelFilter === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedLevelFilter(prev => prev === item.id ? 'ALL' : item.id as any)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50 shadow-md scale-105'
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-[11px] font-black text-gray-700">{item.shortName}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-black text-gray-800">{item.count}</span>
                    <span className="text-[10px] font-black text-gray-400">{item.percentage}%</span>
                  </div>
                  <span className="text-[9px] text-gray-400 font-medium">
                    {isSelected ? 'Filtrando ▼' : 'Clic para ver'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparativa por Grados (Bar Chart) */}
        <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-[3rem] shadow-xl border-4 border-purple-50 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
              <i className="fas fa-chart-bar text-indigo-600"></i>
              Comparativa de Rendimiento por Grado
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Promedio según el filtro de capítulo activo
            </p>
          </div>

          <div className="w-full h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="grade" tick={{ fontSize: 11, fontWeight: 'bold' }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontWeight: 'bold' }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value}% de promedio (${item.payload.total} estudiantes)`,
                    item.payload.grade
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
                <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Aprobación (60%)', fill: '#f59e0b', fontSize: 10, position: 'insideBottomRight' }} />
                <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Meta Alta (80%)', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
                <Bar
                  dataKey="promedio"
                  radius={[12, 12, 0, 0]}
                  fill="#6366f1"
                  className="transition-all hover:opacity-80"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-900">
              <i className="fas fa-lightbulb mr-2 text-indigo-600"></i>
              Referencia Pedagógica:
            </span>
            <div className="flex gap-4">
              <span className="text-amber-700 font-bold">Línea Ámbar: Básico (60%)</span>
              <span className="text-emerald-700 font-bold">Línea Verde: Alto (80%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drill-down Students List */}
      <div className="bg-white rounded-[3rem] shadow-xl border-4 border-purple-50 p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
              <i className="fas fa-list-ul text-purple-600"></i>
              Estudiantes ({drillDownList.length})
              {selectedLevelFilter !== 'ALL' && (
                <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-black uppercase">
                  Nivel {selectedLevelFilter}
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-400 font-bold mt-0.5">
              Haz clic en "Ver Ficha Gráfica" para desplegar el análisis individual de cada alumno
            </p>
          </div>

          {/* Search bar within drill down */}
          <div className="w-full md:w-72 relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input
              type="text"
              value={drillSearch}
              onChange={(e) => setDrillSearch(e.target.value)}
              placeholder="Buscar estudiante..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Students Cards / Mini Grid */}
        {drillDownList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drillDownList.map((s) => {
              const levelBadge = 
                s.level === 'SUPERIOR' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                s.level === 'ALTO' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                s.level === 'BASICO' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-rose-50 text-rose-700 border-rose-200';

              const progressColor =
                s.level === 'SUPERIOR' ? 'bg-emerald-500' :
                s.level === 'ALTO' ? 'bg-blue-500' :
                s.level === 'BASICO' ? 'bg-amber-500' :
                'bg-rose-500';

              return (
                <div
                  key={s.Usuario}
                  className="bg-gray-50/70 hover:bg-white p-5 rounded-2xl border-2 border-gray-100 hover:border-purple-200 shadow-sm transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white text-purple-700 font-black flex items-center justify-center shadow-sm border border-gray-100 text-sm">
                        {(s.Nombre || s.Usuario).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-800 text-sm leading-tight group-hover:text-purple-700 transition-colors">
                          {s.Nombre || s.Usuario}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-gray-400">@{s.Usuario}</span>
                          <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-md border border-gray-200 text-gray-600">
                            Grado {s.Grado}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${levelBadge}`}>
                      {s.level}
                    </span>
                  </div>

                  {/* Score bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-black">
                      <span className="text-gray-400 text-[10px] uppercase tracking-wider">
                        {selectedScope === 'all' ? 'Promedio General' : `Capítulo ${selectedScope}`}
                      </span>
                      <span className="text-gray-900 text-sm">{s.currentScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
                        style={{ width: `${s.currentScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Chapter Mini Badges */}
                  <div className="grid grid-cols-4 gap-1 text-center pt-2 border-t border-gray-200/60 text-[10px] font-black">
                    <div className="bg-white py-1 rounded-lg border border-gray-100">
                      <span className="text-[8px] text-gray-400 block">C1</span>
                      <span className="text-purple-700">{s.avg1}%</span>
                    </div>
                    <div className="bg-white py-1 rounded-lg border border-gray-100">
                      <span className="text-[8px] text-gray-400 block">C2</span>
                      <span className="text-pink-600">{s.avg2}%</span>
                    </div>
                    <div className="bg-white py-1 rounded-lg border border-gray-100">
                      <span className="text-[8px] text-gray-400 block">C3</span>
                      <span className="text-indigo-600">{s.avg3}%</span>
                    </div>
                    <div className="bg-white py-1 rounded-lg border border-gray-100">
                      <span className="text-[8px] text-gray-400 block">C4</span>
                      <span className="text-cyan-600">{s.avg4}%</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => onSelectStudent(s)}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <i className="fas fa-chart-pie"></i>
                      Ficha Gráfica
                    </button>
                    {onViewAsStudent && (
                      <button
                        onClick={() => onViewAsStudent(s)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-black text-xs transition-all"
                        title="Ver como este estudiante"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <i className="fas fa-user-slash text-3xl text-gray-300 mb-2"></i>
            <p className="text-sm font-bold text-gray-500">No se encontraron estudiantes con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
};
