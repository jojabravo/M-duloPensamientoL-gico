
import React, { useState, useEffect } from 'react';
import { View, Person, StudentProfile } from './types';
import { supabase } from './src/supabaseClient';
import Welcome from './components/Welcome';
import CourseMenu from './components/CourseMenu';
import ChapterOneMenu from './components/ChapterOneMenu';
import Theory from './components/Theory';
import HorizontalOrdering, { INITIAL_PEOPLE } from './components/HorizontalOrdering';
import VerticalOrdering, { INITIAL_VERTICAL } from './components/VerticalOrdering';
import CircularOrdering, { PEOPLE_PAR } from './components/CircularOrdering';
import TableOrdering from './components/TableOrdering';
import LogicTheory from './components/LogicTheory';
import LogicConnectorsTheory from './components/LogicConnectorsTheory';
import LogicInferenceTheory from './components/LogicInferenceTheory';
import PropositionIdentifier from './components/PropositionIdentifier';
import LogicConnectors from './components/LogicConnectors';
import InferenceRoom from './components/InferenceRoom';
import QuantifiersGame from './components/QuantifiersGame';
import MicrobitGame from './components/MicrobitGame';
import Challenge from './components/Challenge';
import ResultsDashboard from './components/ResultsDashboard';
import AdminDashboard from './components/AdminDashboard';
import CommunicationPanel from './components/CommunicationPanel';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.WELCOME);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulation states
  const [hSlots, setHSlots] = useState<(Person | null)[]>(Array(5).fill(null));
  const [hAvailable, setHAvailable] = useState<Person[]>(INITIAL_PEOPLE);

  const [vFloors, setVFloors] = useState<(Person | null)[]>(Array(4).fill(null));
  const [vAvailable, setVAvailable] = useState<Person[]>(INITIAL_VERTICAL);

  const [cMode, setCMode] = useState<'PAR' | 'IMPAR'>('PAR');
  const [cSeats, setCSeats] = useState<(Person | null)[]>(Array(8).fill(null));
  const [cAvailable, setCAvailable] = useState<Person[]>(PEOPLE_PAR);

  const [tGrid, setTGrid] = useState<(string | null)[][]>(Array(4).fill(null).map(() => Array(4).fill(null)));

  // Persistence: Check for session on mount
  useEffect(() => {
    const checkSession = async () => {
      // Check for admin route (pathname or hash for better compatibility in iframes)
      if (window.location.pathname === '/profesor-jorge' || window.location.hash === '#profesor-jorge') {
        setCurrentView(View.ADMIN);
        setLoading(false);
        return;
      }

      const savedStudent = localStorage.getItem('student_session');
      if (savedStudent) {
        try {
          const parsed = JSON.parse(savedStudent);
          // Fetch fresh data from Supabase to ensure synchronization
          const { data, error } = await supabase
            .from('Estudiantes')
            .select('*')
            .eq('Usuario', parsed.Usuario)
            .single();
          if (!error && data) {
            setStudent(data);
            localStorage.setItem('student_session', JSON.stringify(data));
            setCurrentView(View.MENU);
          } else {
            // If error or not found, clear session
            localStorage.removeItem('student_session');
          }
        } catch (e) {
          console.error('Error parsing session', e);
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const handleLogin = async (usuario: string, contrasena: string) => {
    try {
      // 1. Check if user exists (case-insensitive)
      const { data: userData, error: userError } = await supabase
        .from('Estudiantes')
        .select('*')
        .ilike('Usuario', usuario.trim())
        .maybeSingle();

      if (userError) {
        console.error('Supabase connection error details:', {
          message: userError.message,
          details: userError.details,
          hint: userError.hint,
          code: userError.code,
          table: 'Estudiantes',
          column: 'Usuario'
        });
        throw new Error('Error de conexión');
      }

      if (!userData) {
        console.warn('User not found in table Estudiantes:', usuario);
        throw new Error('Credenciales incorrectas');
      }

      // 2. Check password (case-sensitive)
      if (userData.Clave !== contrasena) {
        console.warn('Incorrect password for user:', usuario);
        throw new Error('Credenciales incorrectas');
      }

      const studentData: StudentProfile = userData;
      
      // Update last connection and sync chapter 1 grade
      const modules = [
        studentData.progreso_ordenamiento || 0,
        studentData.progreso_proposiciones || 0,
        studentData.progreso_cuantificadores || 0,
        studentData.progreso_microbit || 0
      ];
      const average = Math.round(modules.reduce((a, b) => a + b, 0) / modules.length);

      console.log(`Logging in: Updating ultima_conexion (DB side) and nota_capitulo_1 for ${studentData.Usuario}`);
      const { error: updateError } = await supabase
        .from('Estudiantes')
        .update({ 
          ultima_conexion: 'now', // Use Postgres 'now' literal to let DB handle timezone
          nota_capitulo_1: average
        })
        .eq('Usuario', studentData.Usuario);

      if (updateError) {
        console.error('Error updating login metadata:', updateError);
      }

      setStudent(studentData);
      localStorage.setItem('student_session', JSON.stringify(studentData));
      setCurrentView(View.MENU);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const handleLogout = () => {
    setStudent(null);
    localStorage.removeItem('student_session');
    setCurrentView(View.WELCOME);
  };

  const updateSupabaseProgress = async (column: keyof StudentProfile, increment: number = 5) => {
    if (!student) return;

    const currentValue = (student[column] as number) || 0;
    const newValue = Math.min(currentValue + increment, 100);
    
    // Optimistic update (local UI still uses browser time for immediate feedback)
    const nowLocal = new Date().toISOString();
    let updatedStudent = { ...student, [column]: newValue, ultima_conexion: nowLocal };
    
    // Calculate nota_capitulo_1 as the average of the 4 modules
    const modules = [
      updatedStudent.progreso_ordenamiento || 0,
      updatedStudent.progreso_proposiciones || 0,
      updatedStudent.progreso_cuantificadores || 0,
      updatedStudent.progreso_microbit || 0
    ];
    const average = Math.round(modules.reduce((a, b) => a + b, 0) / modules.length);
    updatedStudent.nota_capitulo_1 = average;

    setStudent(updatedStudent);
    localStorage.setItem('student_session', JSON.stringify(updatedStudent));

    console.log(`Updating Supabase: ${column}=${newValue}, nota_capitulo_1=${average}, ultima_conexion=now() for user ${student.Usuario}`);

    const { error } = await supabase
      .from('Estudiantes')
      .update({ 
        [column]: newValue,
        nota_capitulo_1: average,
        ultima_conexion: 'now' // Use Postgres 'now' literal to let DB handle timezone
      })
      .eq('Usuario', student.Usuario);

    if (error) {
      console.error('Error updating progress', error);
      // Rollback if needed, but for progress it's usually fine to stay optimistic
    }
  };

  const handleCorrectAction = (module: 'ordering' | 'proposiciones' | 'cuantificadores' | 'microbit') => {
    const columnMap: Record<string, keyof StudentProfile> = {
      ordering: 'progreso_ordenamiento',
      proposiciones: 'progreso_proposiciones',
      cuantificadores: 'progreso_cuantificadores',
      microbit: 'progreso_microbit'
    };
    updateSupabaseProgress(columnMap[module], 5); // Increased from 2
  };

  const updateExampleProgress = (module: 'ordering' | 'logic', key: string) => {
    // We'll map these to the new Supabase columns
    if (module === 'ordering') {
      updateSupabaseProgress('progreso_ordenamiento', 15); // Increased from 5
    } else {
      updateSupabaseProgress('progreso_proposiciones', 15); // Increased from 5
    }
  };

  const saveChallengeScore = (module: 'ordering' | 'logic', score: any) => {
    if (module === 'ordering') {
      updateSupabaseProgress('progreso_ordenamiento', 40); // Increased from 10
    } else if (module === 'logic') {
      // Logic has multiple sub-challenges, we'll increment based on the type
      if (score.identification || score.symbolization || score.inference) {
        updateSupabaseProgress('progreso_proposiciones', 35); // Increased from 10
      } else if (score.quantifiers) {
        updateSupabaseProgress('progreso_cuantificadores', 100); // Increased from 10
      } else if (score.microbit) {
        updateSupabaseProgress('progreso_microbit', 100); // Increased from 10
      }
    }
  };

  const handleAdminAccess = () => {
    console.log('Transitioning to ADMIN view');
    setCurrentView(View.ADMIN);
  };

  const renderView = () => {
    switch (currentView) {
      case View.WELCOME:
        return <Welcome onLogin={handleLogin} onAdmin={handleAdminAccess} />;
      case View.MENU:
        return <CourseMenu student={student!} onSelect={() => setCurrentView(View.CHAPTER_1_MENU)} onShowResults={() => setCurrentView(View.RESULTS)} />;
      case View.CHAPTER_1_MENU:
        return (
          <ChapterOneMenu 
            onSelectModule={(id) => {
              if (id === 'ordering') setCurrentView(View.THEORY);
              if (id === 'logic') setCurrentView(View.LOGIC_THEORY);
              if (id === 'quantifiers') setCurrentView(View.QUANTIFIERS_GAME);
              if (id === 'microbit') setCurrentView(View.MICROBIT_GAME);
            }}
            onBack={() => setCurrentView(View.MENU)}
          />
        );
      case View.THEORY:
        return <Theory onNext={() => setCurrentView(View.HORIZONTAL)} />;
      case View.HORIZONTAL:
        return <HorizontalOrdering onCorrect={() => handleCorrectAction('ordering')} slots={hSlots} setSlots={setHSlots} available={hAvailable} setAvailable={setHAvailable} onNext={() => { updateExampleProgress('ordering', 'horizontal'); setCurrentView(View.VERTICAL); }} onBack={() => setCurrentView(View.CHAPTER_1_MENU)} />;
      case View.VERTICAL:
        return <VerticalOrdering onCorrect={() => handleCorrectAction('ordering')} floors={vFloors} setFloors={setVFloors} available={vAvailable} setAvailable={setVAvailable} onNext={() => { updateExampleProgress('ordering', 'vertical'); setCurrentView(View.CIRCULAR); }} onBack={() => setCurrentView(View.HORIZONTAL)} />;
      case View.CIRCULAR:
        return <CircularOrdering onCorrect={() => handleCorrectAction('ordering')} mode={cMode} setMode={setCMode} seats={cSeats} setSeats={setCSeats} available={cAvailable} setAvailable={setCAvailable} onNext={() => { updateExampleProgress('ordering', 'circular'); setCurrentView(View.TABLE); }} onBack={() => setCurrentView(View.VERTICAL)} />;
      case View.TABLE:
        return <TableOrdering onCorrect={() => handleCorrectAction('ordering')} grid={tGrid} setGrid={setTGrid} onNext={() => { updateExampleProgress('ordering', 'table'); setCurrentView(View.CHALLENGE); }} onBack={() => setCurrentView(View.CIRCULAR)} />;
      case View.LOGIC_THEORY:
        return <LogicTheory onNext={() => { updateExampleProgress('logic', 'intro'); setCurrentView(View.LOGIC_CONNECTORS_THEORY); }} onBack={() => setCurrentView(View.CHAPTER_1_MENU)} />;
      case View.LOGIC_CONNECTORS_THEORY:
        return <LogicConnectorsTheory onNext={() => { updateExampleProgress('logic', 'connectors'); setCurrentView(View.LOGIC_INFERENCE_THEORY); }} onBack={() => setCurrentView(View.LOGIC_THEORY)} />;
      case View.LOGIC_INFERENCE_THEORY:
        return <LogicInferenceTheory onNext={() => { updateExampleProgress('logic', 'inference'); setCurrentView(View.PROP_IDENTIFIER); }} onBack={() => setCurrentView(View.LOGIC_CONNECTORS_THEORY)} />;
      case View.PROP_IDENTIFIER:
        return <PropositionIdentifier onCorrect={() => handleCorrectAction('proposiciones')} onFinish={(score) => { saveChallengeScore('logic', { identification: score }); setCurrentView(View.LOGIC_CONNECTORS); }} onBack={() => setCurrentView(View.LOGIC_INFERENCE_THEORY)} />;
      case View.LOGIC_CONNECTORS:
        return <LogicConnectors onCorrect={() => handleCorrectAction('proposiciones')} onFinish={(score) => { saveChallengeScore('logic', { symbolization: score }); setCurrentView(View.INFERENCE_ROOM); }} onBack={() => setCurrentView(View.PROP_IDENTIFIER)} />;
      case View.INFERENCE_ROOM:
        return <InferenceRoom onCorrect={() => handleCorrectAction('proposiciones')} onFinish={(score) => { saveChallengeScore('logic', { inference: score }); setCurrentView(View.MENU); }} onBack={() => setCurrentView(View.LOGIC_CONNECTORS)} />;
      case View.QUANTIFIERS_GAME:
        return <QuantifiersGame onCorrect={() => handleCorrectAction('cuantificadores')} onFinish={(score) => { updateExampleProgress('logic', 'quantifiers'); saveChallengeScore('logic', { quantifiers: score }); setCurrentView(View.RESULTS); }} onBack={() => setCurrentView(View.CHAPTER_1_MENU)} />;
      case View.MICROBIT_GAME:
        return <MicrobitGame onCorrect={() => handleCorrectAction('microbit')} onFinish={(score) => { updateExampleProgress('logic', 'microbit'); saveChallengeScore('logic', { microbit: score }); setCurrentView(View.RESULTS); }} onBack={() => setCurrentView(View.CHAPTER_1_MENU)} />;
      case View.CHALLENGE:
        return <Challenge student={student!} onFinish={(score) => { saveChallengeScore('ordering', score); setCurrentView(View.RESULTS); }} onBack={() => setCurrentView(View.TABLE)} />;
      case View.RESULTS:
        return <ResultsDashboard student={student!} onBack={() => setCurrentView(View.MENU)} />;
      case View.ADMIN:
        return <AdminDashboard onBack={() => { console.log('Returning to WELCOME'); setCurrentView(View.WELCOME); }} />;
      default:
        return <Welcome onLogin={handleLogin} onAdmin={handleAdminAccess} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden pb-10">
      <div className="absolute inset-0 bg-pattern -z-10"></div>
      {currentView !== View.WELCOME && currentView !== View.ADMIN && (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-purple-100">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentView(View.MENU)} className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-all">
                <i className="fas fa-home"></i>
              </button>
              <div>
                <h1 className="text-lg font-black text-gray-800 leading-none">Lógica <span className="text-purple-600">6°/7°</span></h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  Estudiante: {student?.Nombre || student?.Usuario}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CommunicationPanel student={student!} mode="mailbox" compact={true} />
              <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                <i className="fas fa-sign-out-alt mr-2"></i> Salir
              </button>
              <button onClick={() => setCurrentView(View.RESULTS)} className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all">
                <i className="fas fa-chart-bar mr-2"></i> Mis Notas
              </button>
            </div>
          </div>
        </header>
      )}
      <main className="flex-grow container mx-auto px-4 py-8 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : renderView()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
