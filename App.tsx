
import React, { useState, useEffect } from 'react';
import { View, Person, StudentProfile, AppConfig } from './types';
import { supabase } from './src/supabaseClient';
import { playSound } from './audio';
import Welcome from './components/Welcome';
import CourseMenu from './components/CourseMenu';
import ChapterOneMenu from './components/ChapterOneMenu';
import ChapterTwoMenu from './components/ChapterTwoMenu';
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
import CryptoLab from './components/CryptoLab';
import GraphicEquations from './components/GraphicEquations';
import ChapterTwoBlockThreeMenu from './components/ChapterTwoBlockThreeMenu';
import NumericPyramids from './components/NumericPyramids';
import Sudoku from './components/Sudoku';
import MagicSquares from './components/MagicSquares';
import Crucinumero from './components/Crucinumero';
import HiddenMessage from './components/HiddenMessage';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.WELCOME);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<AppConfig>({
    capitulo_1_activo: true,
    capitulo_2_activo: false,
    capitulo_3_activo: false,
    capitulo_4_activo: false
  });
  const [hasUnread, setHasUnread] = useState(false);
  const [isAdminImpersonating, setIsAdminImpersonating] = useState(false);
  const studentRef = React.useRef<StudentProfile | null>(null);

  useEffect(() => {
    studentRef.current = student;
  }, [student]);

  // Simulation states
  const [hSlots, setHSlots] = useState<(Person | null)[]>(Array(5).fill(null));
  const [hAvailable, setHAvailable] = useState<Person[]>(INITIAL_PEOPLE);

  const fetchConfig = React.useCallback(async () => {
    const { data: configRows } = await supabase
      .from('configuracion_capitulos')
      .select('*')
      .order('capitulo_numero', { ascending: true });
    
    if (configRows && configRows.length > 0) {
      const getCap = (num: number) => configRows.find(r => r.capitulo_numero === num);
      
      const newConfig: AppConfig = {
        capitulo_1_activo: getCap(1)?.activo ?? true,
        capitulo_1_inicio: getCap(1)?.fecha_inicio,
        capitulo_1_fin: getCap(1)?.fecha_fin,

        capitulo_2_activo: getCap(2)?.activo ?? false,
        capitulo_2_inicio: getCap(2)?.fecha_inicio,
        capitulo_2_fin: getCap(2)?.fecha_fin,

        capitulo_3_activo: getCap(3)?.activo ?? false,
        capitulo_3_inicio: getCap(3)?.fecha_inicio,
        capitulo_3_fin: getCap(3)?.fecha_fin,

        capitulo_4_activo: getCap(4)?.activo ?? false,
        capitulo_4_inicio: getCap(4)?.fecha_inicio,
        capitulo_4_fin: getCap(4)?.fecha_fin,

        ch2_bloque1_activo: getCap(21)?.activo ?? true,
        ch2_bloque1_inicio: getCap(21)?.fecha_inicio,
        ch2_bloque1_fin: getCap(21)?.fecha_fin,

        ch2_bloque2_activo: getCap(22)?.activo ?? true,
        ch2_bloque2_inicio: getCap(22)?.fecha_inicio,
        ch2_bloque2_fin: getCap(22)?.fecha_fin,

        ch2_bloque3_activo: getCap(23)?.activo ?? true,
        ch2_bloque3_inicio: getCap(23)?.fecha_inicio,
        ch2_bloque3_fin: getCap(23)?.fecha_fin,

        ch2_bloque4_activo: getCap(24)?.activo ?? true,
        ch2_bloque4_inicio: getCap(24)?.fecha_inicio,
        ch2_bloque4_fin: getCap(24)?.fecha_fin,
      };
      setConfig(newConfig);
    }
  }, []);

  const [vFloors, setVFloors] = useState<(Person | null)[]>(Array(4).fill(null));
  const [vAvailable, setVAvailable] = useState<Person[]>(INITIAL_VERTICAL);

  const [cMode, setCMode] = useState<'PAR' | 'IMPAR'>('PAR');
  const [cSeats, setCSeats] = useState<(Person | null)[]>(Array(8).fill(null));
  const [cAvailable, setCAvailable] = useState<Person[]>(PEOPLE_PAR);

  const [tGrid, setTGrid] = useState<(string | null)[][]>(Array(4).fill(null).map(() => Array(4).fill(null)));

  // Persistence: Check for session on mount
  useEffect(() => {
    const checkSession = async () => {
      await fetchConfig();

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
            checkUnread(data.Usuario);
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

    const checkUnread = async (usuario: string) => {
      const { data } = await supabase
        .from('buzon')
        .select('id')
        .eq('Receptor', usuario)
        .eq('Leido', false)
        .limit(1);
      setHasUnread(data && data.length > 0 ? true : false);
    };

    checkSession();

    // Subscribe to config changes
    const configChannel = supabase
      .channel('config-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'configuracion_capitulos' }, () => {
        fetchConfig();
      })
      .subscribe();

    // Subscribe to mailbox changes for unread badge
    const buzonChannel = supabase
      .channel('buzon-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'buzon' 
      }, () => {
        if (student) checkUnread(student.Usuario);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(configChannel);
      supabase.removeChannel(buzonChannel);
    };
  }, [student?.Usuario, fetchConfig]);

  const getPerformanceLevel = (score: number): string => {
    if (score >= 90) return 'SUPERIOR';
    if (score >= 80) return 'ALTO';
    if (score >= 60) return 'BÁSICO';
    if (score >= 30) return 'EN PROGRESO';
    return 'BAJO';
  };

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

      console.log(`[LOGIN] User found: "${userData.Usuario}" (Length: ${userData.Usuario.length}) (Name: ${userData.Nombre || 'N/A'})`);
      
      // 2. Check password (case-sensitive)
      if (userData.Clave !== contrasena) {
        console.warn('Incorrect password for user:', usuario);
        throw new Error('Credenciales incorrectas');
      }

      const studentData: StudentProfile = userData;
      
      // Update last connection and sync chapter averages
      const ch1Modules = [
        studentData.progreso_ordenamiento || 0,
        studentData.progreso_proposiciones || 0,
        studentData.progreso_cuantificadores || 0,
        studentData.progreso_microbit || 0
      ];
      const avg1 = Math.round(ch1Modules.reduce((a, b) => a + b, 0) / ch1Modules.length);

      const block3Avg = (
        (studentData.progreso_sudoku || 0) +
        (studentData.progreso_magic_squares || 0) +
        (studentData.progreso_crucinumeros || 0) +
        (studentData.progreso_piramides || 0)
      ) / 4;

      const avg2 = Math.round((
        (studentData.progreso_criptogramas || 0) +
        (studentData.progreso_ecuaciones_graficas || 0) +
        block3Avg +
        (studentData.progreso_mensaje_oculto || 0)
      ) / 4);

      const performanceLevel = getPerformanceLevel(Math.max(avg1, avg2));

      console.log(`Logging in: Updating metadata for ${studentData.Usuario}`);
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('Estudiantes')
        .update({ 
          ultima_conexion: now,
          nota_capitulo_1: avg1,
          nota_capitulo_2: avg2
        })
        .eq('Usuario', studentData.Usuario);

      if (updateError) {
        console.error('Error updating login metadata:', updateError);
      }

      const updatedStudent = {
        ...studentData,
        ultima_conexion: now,
        nota_capitulo_1: avg1,
        nota_capitulo_2: avg2,
        nivel_desempeno: performanceLevel
      };

      setStudent(updatedStudent);
      localStorage.setItem('student_session', JSON.stringify(updatedStudent));
      setCurrentView(View.MENU);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const handleLogout = () => {
    setStudent(null);
    localStorage.removeItem('student_session');
    setIsAdminImpersonating(false);
    setCurrentView(View.WELCOME);
  };

  const handleViewAsStudent = (studentData: StudentProfile) => {
    setStudent(studentData);
    setIsAdminImpersonating(true);
    setCurrentView(View.MENU);
    playSound('success');
  };

  const handleReturnToAdmin = () => {
    setIsAdminImpersonating(false);
    setCurrentView(View.ADMIN);
    playSound('pop');
  };

  const updateSupabaseProgress = async (column: keyof StudentProfile, value: number = 5, mode: 'increment' | 'absolute' = 'increment') => {
    const currentStudent = studentRef.current;
    if (!currentStudent) {
      console.warn('[SUPABASE] No current student found in ref. Cannot update progress.');
      return;
    }

    if (isAdminImpersonating) {
      console.log('[PREVIEW MODE] Progress update skipped for impersonation.');
      // Update local state only so the UI reflects progress during preview
      const currentValue = (currentStudent[column] as number) || 0;
      const newValue = mode === 'absolute' ? Math.max(currentValue, Math.min(value, 100)) : Math.min(currentValue + value, 100);
      setStudent({ ...currentStudent, [column]: newValue });
      return;
    }

    const currentValue = (currentStudent[column] as number) || 0;
    const newValue = mode === 'absolute' ? Math.max(currentValue, Math.min(value, 100)) : Math.min(currentValue + value, 100);
    
    const nowLocal = new Date().toISOString();
    let updated = { ...currentStudent, [column]: newValue, ultima_conexion: nowLocal };
    
    // Calculate averages
    const ch1Modules = [
      updated.progreso_ordenamiento || 0,
      updated.progreso_proposiciones || 0,
      updated.progreso_cuantificadores || 0,
      updated.progreso_microbit || 0
    ];
    const avg1 = Math.round(ch1Modules.reduce((a, b) => a + b, 0) / ch1Modules.length);

    const block3Avg = (
      (updated.progreso_sudoku || 0) +
      (updated.progreso_magic_squares || 0) +
      (updated.progreso_crucinumeros || 0) +
      (updated.progreso_piramides || 0)
    ) / 4;

    const avg2 = Math.round((
      (updated.progreso_criptogramas || 0) +
      (updated.progreso_ecuaciones_graficas || 0) +
      block3Avg +
      (updated.progreso_mensaje_oculto || 0)
    ) / 4);

    updated.nota_capitulo_1 = avg1;
    updated.nota_capitulo_2 = avg2;
    updated.nivel_desempeno = getPerformanceLevel(Math.max(avg1, avg2));

    // Update state and local storage
    setStudent(updated);
    localStorage.setItem('student_session', JSON.stringify(updated));

    // Perform the DB update
    const userToUpdate = updated.Usuario.trim();
    console.log(`[SUPABASE] Attempting to update ${column} to ${newValue}% for user "${userToUpdate}" (Original length: ${updated.Usuario.length})`);
    
    try {
      // Use .filter with 'ilike' for the update to be extra safe about case/whitespace
      const { data, error } = await supabase
        .from('Estudiantes')
        .update({ 
          [column]: newValue,
          nota_capitulo_1: updated.nota_capitulo_1,
          nota_capitulo_2: updated.nota_capitulo_2,
          ultima_conexion: updated.ultima_conexion
        })
        .filter('Usuario', 'ilike', userToUpdate)
        .select();

      if (error) {
        console.error(`[SUPABASE] Error updating ${column}:`, error);
        alert(`Error al guardar progreso: ${error.message || 'Error desconocido'}. Por favor verifica tu conexión.`);
      } else if (!data || data.length === 0) {
        console.warn(`[SUPABASE] No row found to update for user "${userToUpdate}". Attempting fallback with exact match...`);
        
        // Fallback to exact match if ilike failed (unlikely but just in case)
        const { data: retryData, error: retryError } = await supabase
          .from('Estudiantes')
          .update({ 
            [column]: newValue,
            nota_capitulo_1: updated.nota_capitulo_1,
            nota_capitulo_2: updated.nota_capitulo_2,
            ultima_conexion: updated.ultima_conexion
          })
          .eq('Usuario', updated.Usuario)
          .select();

        if (retryError || !retryData || retryData.length === 0) {
          console.error(`[SUPABASE] Final failure to update user "${updated.Usuario}"`);
          alert(`Error Crítico: No se pudo encontrar al estudiante "${updated.Usuario}" en la base de datos para guardar su progreso. Por favor, verifica que el usuario sea correcto.`);
        } else {
          console.log(`[SUPABASE] Fallback update successful for ${updated.Usuario}`);
        }
      } else {
        console.log(`[SUPABASE] SUCCESS: Progress updated for ${column}: ${newValue}% (Rows affected: ${data.length})`);
      }
    } catch (err) {
      console.error('Exception during Supabase update:', err);
      alert(`Error inesperado al guardar progreso: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleCorrectAction = (module: 'ordering' | 'proposiciones' | 'cuantificadores' | 'microbit') => {
    const columnMap: Record<string, keyof StudentProfile> = {
      ordering: 'progreso_ordenamiento',
      proposiciones: 'progreso_proposiciones',
      cuantificadores: 'progreso_cuantificadores',
      microbit: 'progreso_microbit'
    };
    console.log(`Correct action in ${module}. Updating ${columnMap[module]} by 25%`);
    updateSupabaseProgress(columnMap[module], 25); 
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
        return <CourseMenu student={student!} config={config} onSelect={(id) => {
          if (id === 'verbal') setCurrentView(View.CHAPTER_1_MENU);
          else if (id === 'num') setCurrentView(View.CHAPTER_2_MENU);
        }} onShowResults={() => setCurrentView(View.RESULTS)} onShowCommunication={() => setCurrentView(View.COMMUNICATION)} />;
      case View.CHAPTER_1_MENU:
        return (
          <ChapterOneMenu 
            student={student!}
            config={config}
            onSelectModule={(id) => {
              if (id === 'ordering') {
                const prog = student?.progreso_ordenamiento || 0;
                if (prog >= 75) setCurrentView(View.CHALLENGE);
                else if (prog >= 60) setCurrentView(View.TABLE);
                else if (prog >= 45) setCurrentView(View.CIRCULAR);
                else if (prog >= 30) setCurrentView(View.VERTICAL);
                else if (prog >= 15) setCurrentView(View.HORIZONTAL);
                else setCurrentView(View.THEORY);
              }
              if (id === 'logic') {
                const prog = student?.progreso_proposiciones || 0;
                if (prog >= 75) setCurrentView(View.INFERENCE_ROOM);
                else if (prog >= 60) setCurrentView(View.LOGIC_CONNECTORS);
                else if (prog >= 45) setCurrentView(View.PROP_IDENTIFIER);
                else if (prog >= 30) setCurrentView(View.LOGIC_INFERENCE_THEORY);
                else if (prog >= 15) setCurrentView(View.LOGIC_CONNECTORS_THEORY);
                else setCurrentView(View.LOGIC_THEORY);
              }
              if (id === 'quantifiers') setCurrentView(View.QUANTIFIERS_GAME);
              if (id === 'microbit') setCurrentView(View.MICROBIT_GAME);
            }}
            onBack={() => setCurrentView(View.MENU)}
          />
        );
      case View.CHAPTER_2_MENU:
        return (
          <ChapterTwoMenu 
            student={student!}
            config={config}
            onSelectModule={(id) => {
              if (id === 'criptogramas') setCurrentView(View.CRYPTO_LAB);
              else if (id === 'ecuaciones') setCurrentView(View.GRAPHIC_EQUATIONS);
              else if (id === 'block3') setCurrentView(View.CH2_BLOCK3_MENU);
              else if (id === 'mensaje_oculto') setCurrentView(View.HIDDEN_MESSAGE);
            }}
            onBack={() => setCurrentView(View.MENU)}
          />
        );
      case View.CH2_BLOCK3_MENU:
        return (
          <ChapterTwoBlockThreeMenu
            student={student!}
            config={config}
            onSelectModule={(id) => {
              if (id === 'crucinumeros') setCurrentView(View.CRUCINUMERO);
              else if (id === 'pyramids') setCurrentView(View.NUMERIC_PYRAMIDS);
              else if (id === 'magic') setCurrentView(View.MAGIC_SQUARES);
              else if (id === 'sudoku') setCurrentView(View.SUDOKU);
            }}
            onBack={() => setCurrentView(View.CHAPTER_2_MENU)}
          />
        );
      case View.CRYPTO_LAB:
        return (
          <CryptoLab 
            student={student!} 
            onBack={() => setCurrentView(View.CHAPTER_2_MENU)}
            onComplete={(newProg) => {
              updateSupabaseProgress('progreso_criptogramas', newProg, 'absolute');
            }}
          />
        );
      case View.GRAPHIC_EQUATIONS:
        return (
          <GraphicEquations 
            student={student!} 
            onBack={() => setCurrentView(View.CHAPTER_2_MENU)}
            onComplete={(newProg) => {
              updateSupabaseProgress('progreso_ecuaciones_graficas', newProg, 'absolute');
            }}
          />
        );
      case View.NUMERIC_PYRAMIDS:
        return (
          <NumericPyramids
            student={student!}
            onBack={() => setCurrentView(View.CH2_BLOCK3_MENU)}
            onComplete={(newProg) => {
              updateSupabaseProgress('progreso_piramides', newProg, 'absolute');
            }}
          />
        );
      case View.SUDOKU:
        return (
          <Sudoku 
            student={student!} 
            onBack={() => setCurrentView(View.CH2_BLOCK3_MENU)}
            onComplete={(newProg) => {
              updateSupabaseProgress('progreso_sudoku', newProg, 'absolute');
            }}
          />
        );
      case View.MAGIC_SQUARES:
        return (
          <MagicSquares 
            student={student!} 
            onBack={() => setCurrentView(View.CH2_BLOCK3_MENU)}
            onComplete={(newProg) => {
              updateSupabaseProgress('progreso_magic_squares', newProg, 'absolute');
            }}
          />
        );
      case View.CRUCINUMERO:
        return (
          <Crucinumero 
            student={student!} 
            onBack={() => setCurrentView(View.CH2_BLOCK3_MENU)}
            onComplete={(newProg) => {
              updateSupabaseProgress('progreso_crucinumeros', newProg, 'absolute');
            }}
          />
        );
      case View.HIDDEN_MESSAGE:
        return (
          <HiddenMessage
            student={student!}
            onBack={() => setCurrentView(View.CHAPTER_2_MENU)}
            onComplete={(newProg) => {
              updateSupabaseProgress('progreso_mensaje_oculto', newProg, 'absolute');
            }}
          />
        );
      case View.THEORY:
        return <Theory onNext={() => { updateExampleProgress('ordering', 'theory'); setCurrentView(View.HORIZONTAL); }} />;
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
        return <ResultsDashboard student={student!} config={config} onBack={() => setCurrentView(View.MENU)} />;
      case View.ADMIN:
        return <AdminDashboard onBack={() => { console.log('Returning to WELCOME'); setCurrentView(View.WELCOME); }} onViewAsStudent={handleViewAsStudent} />;
      case View.COMMUNICATION:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => { playSound('pop'); setCurrentView(View.MENU); }}
                className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-all"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div>
                <h2 className="text-3xl font-black text-gray-800 tracking-tighter">Centro de Comunicación</h2>
                <p className="text-gray-500 font-medium">Avisos y Buzón de Mensajes</p>
              </div>
            </div>
            <CommunicationPanel student={student!} mode="all" />
          </div>
        );
      default:
        return <Welcome onLogin={handleLogin} onAdmin={handleAdminAccess} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden pb-10">
      <div className="absolute inset-0 bg-pattern -z-10"></div>
      {currentView !== View.WELCOME && currentView !== View.ADMIN && (
        <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-sm border-b border-purple-100">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => { playSound('pop'); setCurrentView(View.MENU); }} 
                className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
              >
                <i className="fas fa-home"></i>
              </button>
              <div className="flex-1">
                <h1 className="text-base md:text-lg font-black text-gray-800 leading-none">
                  Lógica <span className="text-purple-600">{student?.Grado || '6°/7°'}</span>
                </h1>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                  {student?.Nombre || student?.Usuario}
                  {(student?.nota_capitulo_1 || 0) >= 90 && (
                    <i className="fas fa-gem diamond-gradient text-[8px] animate-pulse"></i>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 md:gap-3 w-full md:w-auto">
              {isAdminImpersonating && (
                <button 
                  onClick={handleReturnToAdmin} 
                  className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 animate-pulse"
                >
                  <i className="fas fa-user-shield"></i>
                  <span>Volver a Panel</span>
                </button>
              )}
              <button 
                onClick={() => { playSound('pop'); setCurrentView(View.COMMUNICATION); }} 
                className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 relative"
              >
                <i className="fas fa-envelope"></i>
                <span>Buzón</span>
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </button>
              <button 
                onClick={() => { playSound('pop'); setCurrentView(View.RESULTS); }} 
                className="flex-1 md:flex-none px-4 py-2.5 bg-purple-50 text-purple-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <i className="fas fa-chart-bar"></i>
                <span>Notas</span>
              </button>
              <button 
                onClick={handleLogout} 
                className="flex-1 md:flex-none px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Salir</span>
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
      {currentView !== View.WELCOME && <Footer />}
    </div>
  );
};

export default App;
