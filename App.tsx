
import React, { useState } from 'react';
import { View, Person, StudentProfile } from './types';
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
import Footer from './components/Footer';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.WELCOME);
  const [student, setStudent] = useState<StudentProfile | null>(null);

  // Simulation states
  const [hSlots, setHSlots] = useState<(Person | null)[]>(Array(5).fill(null));
  const [hAvailable, setHAvailable] = useState<Person[]>(INITIAL_PEOPLE);

  const [vFloors, setVFloors] = useState<(Person | null)[]>(Array(4).fill(null));
  const [vAvailable, setVAvailable] = useState<Person[]>(INITIAL_VERTICAL);

  const [cMode, setCMode] = useState<'PAR' | 'IMPAR'>('PAR');
  const [cSeats, setCSeats] = useState<(Person | null)[]>(Array(8).fill(null));
  const [cAvailable, setCAvailable] = useState<Person[]>(PEOPLE_PAR);

  const [tGrid, setTGrid] = useState<(string | null)[][]>(Array(4).fill(null).map(() => Array(4).fill(null)));

  const handleStart = (name: string) => {
    const newProfile: StudentProfile = {
      name,
      progress: {
        ordering: {
          examples: { horizontal: false, vertical: false, circular: false, table: false },
          challengeScore: 0
        },
        logic: {
          examples: { intro: false, connectors: false, inference: false, quantifiers: false, microbit: false },
          challengeScores: { identification: 0, symbolization: 0, inference: 0, quantifiers: 0, microbit: 0 }
        }
      }
    };
    setStudent(newProfile);
    setCurrentView(View.MENU);
  };

  const updateExampleProgress = (module: 'ordering' | 'logic', key: string) => {
    if (student) {
      const newProgress = { ...student.progress };
      if (module === 'ordering') {
        (newProgress.ordering.examples as any)[key] = true;
      } else {
        (newProgress.logic.examples as any)[key] = true;
      }
      setStudent({ ...student, progress: newProgress });
    }
  };

  const saveChallengeScore = (module: 'ordering' | 'logic', score: any) => {
    if (student) {
      const newProgress = { ...student.progress };
      if (module === 'ordering') {
        newProgress.ordering.challengeScore = score as number;
      } else {
        newProgress.logic.challengeScores = { ...newProgress.logic.challengeScores, ...score };
      }
      setStudent({ ...student, progress: newProgress });
    }
  };

  const renderView = () => {
    switch (currentView) {
      case View.WELCOME:
        return <Welcome onStart={handleStart} />;
      case View.MENU:
        return <CourseMenu onSelect={() => setCurrentView(View.CHAPTER_1_MENU)} onShowResults={() => setCurrentView(View.RESULTS)} />;
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
        return <HorizontalOrdering slots={hSlots} setSlots={setHSlots} available={hAvailable} setAvailable={setHAvailable} onNext={() => { updateExampleProgress('ordering', 'horizontal'); setCurrentView(View.VERTICAL); }} onBack={() => setCurrentView(View.CHAPTER_1_MENU)} />;
      case View.VERTICAL:
        return <VerticalOrdering floors={vFloors} setFloors={setVFloors} available={vAvailable} setAvailable={setVAvailable} onNext={() => { updateExampleProgress('ordering', 'vertical'); setCurrentView(View.CIRCULAR); }} onBack={() => setCurrentView(View.HORIZONTAL)} />;
      case View.CIRCULAR:
        return <CircularOrdering mode={cMode} setMode={setCMode} seats={cSeats} setSeats={setCSeats} available={cAvailable} setAvailable={setCAvailable} onNext={() => { updateExampleProgress('ordering', 'circular'); setCurrentView(View.TABLE); }} onBack={() => setCurrentView(View.VERTICAL)} />;
      case View.TABLE:
        return <TableOrdering grid={tGrid} setGrid={setTGrid} onNext={() => { updateExampleProgress('ordering', 'table'); setCurrentView(View.CHALLENGE); }} onBack={() => setCurrentView(View.CIRCULAR)} />;
      case View.LOGIC_THEORY:
        return <LogicTheory onNext={() => { updateExampleProgress('logic', 'intro'); setCurrentView(View.LOGIC_CONNECTORS_THEORY); }} onBack={() => setCurrentView(View.CHAPTER_1_MENU)} />;
      case View.LOGIC_CONNECTORS_THEORY:
        return <LogicConnectorsTheory onNext={() => { updateExampleProgress('logic', 'connectors'); setCurrentView(View.LOGIC_INFERENCE_THEORY); }} onBack={() => setCurrentView(View.LOGIC_THEORY)} />;
      case View.LOGIC_INFERENCE_THEORY:
        return <LogicInferenceTheory onNext={() => { updateExampleProgress('logic', 'inference'); setCurrentView(View.PROP_IDENTIFIER); }} onBack={() => setCurrentView(View.LOGIC_CONNECTORS_THEORY)} />;
      case View.PROP_IDENTIFIER:
        return <PropositionIdentifier onFinish={(score) => { saveChallengeScore('logic', { identification: score }); setCurrentView(View.LOGIC_CONNECTORS); }} onBack={() => setCurrentView(View.LOGIC_INFERENCE_THEORY)} />;
      case View.LOGIC_CONNECTORS:
        return <LogicConnectors onFinish={(score) => { saveChallengeScore('logic', { symbolization: score }); setCurrentView(View.INFERENCE_ROOM); }} onBack={() => setCurrentView(View.PROP_IDENTIFIER)} />;
      case View.INFERENCE_ROOM:
        return <InferenceRoom onFinish={(score) => { saveChallengeScore('logic', { inference: score }); setCurrentView(View.MENU); }} onBack={() => setCurrentView(View.LOGIC_CONNECTORS)} />;
      case View.QUANTIFIERS_GAME:
        return <QuantifiersGame onFinish={(score) => { updateExampleProgress('logic', 'quantifiers'); saveChallengeScore('logic', { quantifiers: score }); setCurrentView(View.RESULTS); }} onBack={() => setCurrentView(View.CHAPTER_1_MENU)} />;
      case View.MICROBIT_GAME:
        return <MicrobitGame onFinish={(score) => { updateExampleProgress('logic', 'microbit'); saveChallengeScore('logic', { microbit: score }); setCurrentView(View.RESULTS); }} onBack={() => setCurrentView(View.CHAPTER_1_MENU)} />;
      case View.CHALLENGE:
        return <Challenge student={student!} onFinish={(score) => { saveChallengeScore('ordering', score); setCurrentView(View.RESULTS); }} onBack={() => setCurrentView(View.TABLE)} />;
      case View.RESULTS:
        return <ResultsDashboard student={student!} onBack={() => setCurrentView(View.MENU)} />;
      default:
        return <Welcome onStart={handleStart} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden pb-10">
      <div className="absolute inset-0 bg-pattern -z-10"></div>
      {currentView !== View.WELCOME && (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-purple-100">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentView(View.MENU)} className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-all">
                <i className="fas fa-home"></i>
              </button>
              <div>
                <h1 className="text-lg font-black text-gray-800 leading-none">Lógica <span className="text-purple-600">6°/7°</span></h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Hola, {student?.name}</p>
              </div>
            </div>
            <button onClick={() => setCurrentView(View.RESULTS)} className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all">
              <i className="fas fa-chart-bar mr-2"></i> Mis Notas
            </button>
          </div>
        </header>
      )}
      <main className="flex-grow container mx-auto px-4 py-8 relative">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
