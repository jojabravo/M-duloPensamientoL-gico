
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../src/supabaseClient';
import { StudentProfile } from '../types';
import { playSound } from '../audio';

interface Props {
  onBack: () => void;
}

const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD || 'Perla2026*';

const AdminDashboard: React.FC<Props> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);
  
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Todos');

  // Handle blocking logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBlocked && blockTimer > 0) {
      timer = setInterval(() => {
        setBlockTimer((prev) => prev - 1);
      }, 1000);
    } else if (blockTimer === 0) {
      setIsBlocked(false);
      setAttempts(0);
    }
    return () => clearInterval(timer);
  }, [isBlocked, blockTimer]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) return;

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      playSound('pop');
      fetchStudents();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError('Acceso Denegado: Esta área es exclusiva para el docente Jorge Armando Jaramillo Bravo');
      playSound('error');
      
      if (newAttempts >= 3) {
        setIsBlocked(true);
        setBlockTimer(30);
      }
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Estudiantes')
      .select('*')
      .order('Usuario', { ascending: true });

    if (!error && data) {
      setStudents(data);
    }
    setLoading(false);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.Usuario.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = selectedGrade === 'Todos' || s.Grado === selectedGrade;
      return matchesSearch && matchesGrade;
    });
  }, [students, searchTerm, selectedGrade]);

  const grades = useMemo(() => {
    const uniqueGrades = Array.from(new Set(students.map(s => s.Grado).filter(Boolean)));
    return ['Todos', ...uniqueGrades.sort()];
  }, [students]);

  const exportToCSV = () => {
    if (filteredStudents.length === 0) return;

    const headers = [
      'Usuario',
      'Nombre',
      'Grado',
      'Ultima Conexion (Colombia)',
      'Ordenamiento %',
      'Proposiciones %',
      'Cuantificadores %',
      'Microbit %',
      'Promedio Capitulo 1',
      'Estado Academico'
    ];

    const rows = filteredStudents.map(s => {
      const avg = s.nota_capitulo_1 || 0;
      let estado = 'En Proceso';
      if (avg < 30) estado = 'ALERTA: Refuerzo Urgente';
      else if (avg > 80) estado = 'Nivel Avanzado';

      return [
        `"${s.Usuario}"`,
        `"${s.Nombre || ''}"`,
        `"${s.Grado || 'N/A'}"`,
        `"${formatColombiaTime(s.ultima_conexion)}"`,
        s.progreso_ordenamiento || 0,
        s.progreso_proposiciones || 0,
        s.progreso_cuantificadores || 0,
        s.progreso_microbit || 0,
        avg,
        `"${estado}"`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Reporte_Notas_${selectedGrade}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSound('pop');
  };

  const formatColombiaTime = (dateStr?: string) => {
    if (!dateStr || dateStr === 'now') return 'Nunca';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        dateStyle: 'short',
        timeStyle: 'short',
        hour12: false
      }).format(date);
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return 'bg-emerald-500'; // Superior
    if (value >= 80) return 'bg-blue-500';    // Alto
    if (value >= 60) return 'bg-amber-500';   // Básico
    return 'bg-rose-500';                    // Bajo
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 border-4 border-purple-100 animate-fadeIn">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-rose-600 rounded-[2rem] flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-xl animate-float">
              <i className="fas fa-lock"></i>
            </div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Zona Privada</h2>
            <p className="text-gray-500 font-medium mt-2">Acceso exclusivo para el docente</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Clave de Administrador"
                disabled={isBlocked}
                className="w-full px-8 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-bold text-center text-xl"
              />
            </div>

            {error && (
              <p className="text-rose-600 text-sm font-bold text-center animate-shake">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isBlocked}
              className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all transform active:scale-95 ${
                isBlocked 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 text-white hover:bg-purple-700 hover:-translate-y-1'
              }`}
            >
              {isBlocked ? `Bloqueado (${blockTimer}s)` : 'ACCEDER AL TABLERO'}
            </button>
          </form>

          <button 
            onClick={onBack}
            className="w-full mt-8 text-gray-400 font-bold hover:text-purple-600 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fadeIn pb-20">
      <div className="bg-white rounded-[4rem] shadow-2xl border-8 border-purple-50 p-8 md:p-12">
        <header className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white text-3xl shadow-xl">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-800 tracking-tighter">Control de Estudiantes</h1>
              <p className="text-gray-500 font-medium">Docente: Jorge Armando Jaramillo Bravo</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 w-full lg:w-auto">
            <div className="relative flex-grow lg:flex-grow-0">
              <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-8 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none w-full lg:w-64 font-bold"
              />
            </div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none font-bold cursor-pointer"
            >
              {grades.map(g => (
                <option key={g} value={g}>{g === 'Todos' ? 'Todos los Grados' : `Grado ${g}`}</option>
              ))}
            </select>
            <button 
              onClick={exportToCSV}
              disabled={filteredStudents.length === 0}
              className="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:scale-95"
            >
              <i className="fas fa-download"></i>
              <span className="hidden sm:inline">Descargar Reporte de Notas</span>
            </button>
            <button 
              onClick={onBack}
              className="px-8 py-4 bg-gray-800 text-white rounded-2xl font-black hover:bg-black transition-all shadow-lg"
            >
              SALIR
            </button>
          </div>
        </header>

        <div className="overflow-x-auto -mx-8 md:mx-0">
          <table className="w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <th className="px-6 py-4 text-left">Estudiante</th>
                <th className="px-6 py-4 text-center">Grado</th>
                <th className="px-6 py-4 text-center">Última Conexión</th>
                <th className="px-6 py-4 text-center">Cap. 1: Orden.</th>
                <th className="px-6 py-4 text-center">Cap. 1: Lógica</th>
                <th className="px-6 py-4 text-center">Cap. 1: Cuant.</th>
                <th className="px-6 py-4 text-center">Cap. 1: Micro.</th>
                <th className="px-6 py-4 text-center">Nota Final</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-20">
                    <div className="animate-spin text-4xl text-purple-600 mb-4">
                      <i className="fas fa-circle-notch"></i>
                    </div>
                    <p className="font-black text-gray-400 uppercase tracking-widest">Cargando Alumnos...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-20">
                    <p className="font-black text-gray-400 uppercase tracking-widest">No se encontraron estudiantes</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.Usuario} className="group">
                    <td className="bg-gray-50 px-6 py-5 rounded-l-[2rem] border-y-2 border-l-2 border-transparent group-hover:border-purple-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm font-black">
                          {(student.Nombre || student.Usuario).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800">{student.Nombre || student.Usuario}</span>
                          {student.Nombre && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">@{student.Usuario}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="bg-gray-50 px-6 py-5 text-center border-y-2 border-transparent group-hover:border-purple-200 transition-all">
                      <span className="bg-white px-4 py-1.5 rounded-full text-xs font-black text-gray-500 shadow-sm border border-gray-100">
                        {student.Grado || 'N/A'}
                      </span>
                    </td>
                    <td className="bg-gray-50 px-6 py-5 text-center border-y-2 border-transparent group-hover:border-purple-200 transition-all">
                      <span className="text-xs font-bold text-gray-400">
                        {formatColombiaTime(student.ultima_conexion)}
                      </span>
                    </td>
                    
                    {/* Progress Columns */}
                    {[
                      student.progreso_ordenamiento,
                      student.progreso_proposiciones,
                      student.progreso_cuantificadores,
                      student.progreso_microbit
                    ].map((val, idx) => (
                      <td key={idx} className="bg-gray-50 px-4 py-5 text-center border-y-2 border-transparent group-hover:border-purple-200 transition-all">
                        <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                          <span className="text-[10px] font-black text-gray-400">{val || 0}%</span>
                          <div className="w-full h-2 bg-white rounded-full overflow-hidden shadow-inner border border-gray-100">
                            <div 
                              className={`h-full transition-all duration-1000 ${getProgressColor(val || 0)}`}
                              style={{ width: `${val || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    ))}

                    <td className="bg-gray-50 px-6 py-5 rounded-r-[2rem] text-center border-y-2 border-r-2 border-transparent group-hover:border-purple-200 transition-all">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-xl font-black text-gray-800 leading-none">
                          {student.nota_capitulo_1 || 0}
                          <span className="text-[10px] text-purple-400 ml-0.5">%</span>
                        </span>
                        <div className={`w-12 h-1 mt-1 rounded-full ${getProgressColor(student.nota_capitulo_1 || 0)}`}></div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400 font-bold text-sm">
          <p>Total Estudiantes: {filteredStudents.length} / {students.length}</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Superior (90-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Alto (80-89)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Básico (60-79)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span>Bajo (0-59)</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
