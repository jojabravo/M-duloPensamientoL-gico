
import React, { useState, useEffect } from 'react';
import { playSound } from '../audio';

interface Props {
  onFinish: (score: number) => void;
  onBack: () => void;
}

enum GameState {
  INTRO,
  TUTORIAL1, // Briefing Nivel 1
  LEVEL1,    // Identificación
  TUTORIAL2, // Briefing Nivel 2
  LEVEL2,    // Simbolización
  TUTORIAL3, // Briefing Nivel 3
  LEVEL3,    // Negación/Equivalencia
  SUMMARY
}

const LEVEL1_DATA = [
  { text: "Todos los planetas giran.", type: "U", hint: "La palabra 'Todos' abarca a la totalidad del conjunto." },
  { text: "Existe un alienígena azul.", type: "E", hint: "La palabra 'Existe' indica que al menos hay uno." },
  { text: "Cualquier estrella brilla.", type: "U", hint: "'Cualquier' es sinónimo de 'Todos' en este contexto." },
  { text: "Algunos cometas son de hielo.", type: "E", hint: "'Algunos' se refiere a una parte del conjunto, no a todos." },
  { text: "Ningún humano vive en Marte.", type: "U", hint: "'Ningún' es un Universal Negativo (Todos no viven)." },
  { text: "Hay al menos un astronauta perdido.", type: "E", hint: "'Hay al menos uno' es la marca clásica del existencial." }
];

const LEVEL2_DATA = [
  { phrase: "Todos los robots (R) son lentos (L)", correct: ["∀", "x", "R(x) → L(x)"], hint: "Los Universales suelen usar la flecha (→) de implicación." },
  { phrase: "Existe algún humano (H) que es sabio (S)", correct: ["∃", "x", "H(x) ∧ S(x)"], hint: "Los Existenciales suelen usar el conector (∧) de conjunción." }
];

const LEVEL3_DATA = [
  { q: "Niega: 'Todos los aliens son verdes'", options: ["Algunos aliens no son verdes", "Ningún alien es verde", "Todos los aliens son rojos"], correct: 0, hint: "Negar 'Todos son' equivale a 'Existe uno que NO es'." },
  { q: "Niega: 'Existe un planeta habitado'", options: ["Ningún planeta está habitado", "Todos los planetas están habitados", "Algunos planetas están habitados"], correct: 0, hint: "Negar 'Existe uno que es' equivale a 'Todos NO son' (Ninguno)." },
  { q: "Equivalente a: 'No todos los soles brillan'", options: ["Existe al menos un sol que no brilla", "Ningún sol brilla", "Todos los soles brillan"], correct: 0, hint: "Si no todos brillan, es porque al menos uno falta." }
];

const QuantifiersGame: React.FC<Props> = ({ onFinish, onBack }) => {
  const [state, setState] = useState<GameState>(GameState.INTRO);
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [assembledFormula, setAssembledFormula] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (energy <= 0) {
      playSound('error');
      alert("¡Energía agotada! La base te necesita con más entrenamiento.");
      onBack();
    }
  }, [energy]);

  const changeState = (s: GameState) => {
    playSound('pop');
    setState(s);
    setCurrentIdx(0);
    setShowHint(false);
  };

  const handleLevel1 = (choice: "U" | "E") => {
    const item = LEVEL1_DATA[currentIdx];
    if (choice === item.type) {
      playSound('success');
      setScore(s => s + 10);
      setShowHint(false);
    } else {
      playSound('error');
      setEnergy(e => e - 15);
      setShowHint(true);
      return; // No avanzar si falla para que vea la pista
    }

    if (currentIdx < LEVEL1_DATA.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      changeState(GameState.TUTORIAL2);
    }
  };

  const checkFormula = () => {
    const item = LEVEL2_DATA[currentIdx];
    const isCorrect = JSON.stringify(assembledFormula) === JSON.stringify(item.correct);
    
    if (isCorrect) {
      playSound('success');
      setScore(s => s + 20);
      setShowHint(false);
      if (currentIdx < LEVEL2_DATA.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setAssembledFormula([]);
      } else {
        changeState(GameState.TUTORIAL3);
      }
    } else {
      playSound('error');
      setEnergy(e => e - 20);
      setShowHint(true);
      setAssembledFormula([]);
    }
  };

  const handleLevel3 = (idx: number) => {
    const item = LEVEL3_DATA[currentIdx];
    if (idx === item.correct) {
      playSound('success');
      setScore(s => s + 30);
      setShowHint(false);
    } else {
      playSound('error');
      setEnergy(e => e - 25);
      setShowHint(true);
      return;
    }

    if (currentIdx < LEVEL3_DATA.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      changeState(GameState.SUMMARY);
    }
  };

  const renderBriefing = (title: string, content: React.ReactNode, next: GameState) => (
    <div className="space-y-8 py-6 animate-fadeIn">
      <div className="bg-gray-900 p-8 rounded-[2.5rem] border-4 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
        <header className="flex items-center gap-4 mb-6 border-b border-gray-800 pb-4">
          <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-satellite-dish"></i>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Briefing de Misión</span>
            <h3 className="text-xl font-black text-white">{title}</h3>
          </div>
        </header>
        <div className="text-gray-300 text-sm leading-relaxed space-y-4">
          {content}
        </div>
      </div>
      <button 
        onClick={() => changeState(next)}
        className="w-full py-5 bg-pink-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-pink-700 hover:scale-[1.02] transition-all"
      >
        ¡ENTENDIDO, A LA ACCIÓN!
      </button>
    </div>
  );

  const renderIntro = () => (
    <div className="text-center space-y-8 py-10 animate-fadeIn">
      <div className="relative inline-block">
        <div className="w-32 h-32 bg-pink-500 rounded-full flex items-center justify-center text-white text-5xl shadow-[0_0_50px_rgba(236,72,153,0.5)] animate-pulse">
          <i className="fas fa-infinity"></i>
        </div>
      </div>
      <h2 className="text-4xl font-black text-gray-800 tracking-tighter uppercase">Quantifier Quest</h2>
      <p className="text-gray-500 max-w-md mx-auto font-medium">
        ¡Bienvenido recluta! Tu misión es restaurar el orden lógico en la nebulosa de los cuantificadores. Supera los 3 niveles para ganar.
      </p>
      <button 
        onClick={() => changeState(GameState.TUTORIAL1)}
        className="px-12 py-5 bg-pink-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-pink-700 hover:scale-105 transition-all"
      >
        INICIAR MISIÓN
      </button>
    </div>
  );

  const renderLevel1 = () => (
    <div className="space-y-10 animate-slideIn">
      <header className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
        <span>Nivel 1: Radar Estelar</span>
        <span className="text-pink-500">Muestra: {currentIdx + 1}/{LEVEL1_DATA.length}</span>
      </header>
      
      <div className="bg-gray-900 p-12 rounded-[3rem] text-center shadow-inner border-4 border-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent opacity-50"></div>
        <p className="text-2xl md:text-4xl font-black text-white italic relative z-10 leading-relaxed animate-pop">
          "{LEVEL1_DATA[currentIdx].text}"
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <button 
          onClick={() => handleLevel1("U")}
          className="p-8 bg-white border-4 border-blue-100 hover:border-blue-500 rounded-[2.5rem] flex flex-col items-center gap-4 group transition-all shadow-sm active:scale-95"
        >
          <span className="text-6xl font-black text-blue-600 group-hover:scale-110 transition-transform">∀</span>
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Universal (Todos)</span>
        </button>
        <button 
          onClick={() => handleLevel1("E")}
          className="p-8 bg-white border-4 border-purple-100 hover:border-purple-500 rounded-[2.5rem] flex flex-col items-center gap-4 group transition-all shadow-sm active:scale-95"
        >
          <span className="text-6xl font-black text-purple-600 group-hover:scale-110 transition-transform">∃</span>
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Existencial (Existe)</span>
        </button>
      </div>

      {showHint && (
        <div className="bg-yellow-50 p-6 rounded-3xl border-2 border-yellow-200 animate-fadeIn text-center">
          <p className="text-sm font-bold text-yellow-800">
            <i className="fas fa-lightbulb mr-2"></i> Pista del Radar: {LEVEL1_DATA[currentIdx].hint}
          </p>
        </div>
      )}
    </div>
  );

  const renderLevel2 = () => {
    const symbols = ["∀", "∃", "x", "y", "R(x) → L(x)", "H(x) ∧ S(x)", "¬", "(", ")", "P(x)"];
    return (
      <div className="space-y-8 animate-slideIn">
        <header className="text-center">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Nivel 2: Traductor Galáctico</span>
          <h3 className="text-xl font-bold text-gray-800 mt-2">Simboliza la frase espacial</h3>
        </header>

        <div className="bg-pink-50 p-8 rounded-[2.5rem] border-4 border-pink-100 text-center shadow-sm">
          <p className="font-black text-pink-900 italic text-xl">"{LEVEL2_DATA[currentIdx].phrase}"</p>
        </div>

        <div className="bg-gray-900 min-h-[100px] p-6 rounded-[2rem] flex flex-wrap items-center justify-center gap-3 border-4 border-gray-800 shadow-inner">
          {assembledFormula.length === 0 && <span className="text-gray-600 font-mono text-xs uppercase tracking-widest">Esperando secuencia...</span>}
          {assembledFormula.map((f, i) => (
            <span key={i} className="bg-pink-600 text-white px-4 py-2 rounded-xl font-black text-lg animate-pop shadow-lg">{f}</span>
          ))}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {symbols.map(s => (
            <button 
              key={s} 
              onClick={() => { playSound('pop'); setAssembledFormula([...assembledFormula, s]); }}
              className="p-3 bg-white border-2 border-gray-100 rounded-2xl font-black text-gray-700 hover:border-pink-400 hover:text-pink-600 transition-all active:scale-95 shadow-sm"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4">
            <button onClick={() => setAssembledFormula([])} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-400"><i className="fas fa-trash mr-1"></i> Reiniciar</button>
            <button onClick={() => setShowHint(!showHint)} className="text-[10px] font-black text-pink-400 uppercase tracking-widest hover:text-pink-600"><i className="fas fa-question-circle mr-1"></i> ¿Ayuda?</button>
          </div>
          
          <button 
            onClick={checkFormula}
            disabled={assembledFormula.length === 0}
            className="w-full max-w-xs py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl disabled:opacity-20 transition-all transform hover:-translate-y-1"
          >
            ACTIVAR TRADUCCIÓN
          </button>
        </div>

        {showHint && (
          <div className="bg-pink-50 p-6 rounded-3xl border-2 border-pink-100 animate-fadeIn text-center">
            <p className="text-sm font-bold text-pink-800 italic">
              <i className="fas fa-microchip mr-2"></i> Pista Técnica: {LEVEL2_DATA[currentIdx].hint}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderLevel3 = () => (
    <div className="space-y-8 animate-slideIn">
       <header className="text-center">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Nivel 3: Escudo de Negación</span>
          <h3 className="text-xl font-bold text-gray-800 mt-2">Deduce la equivalencia correcta</h3>
        </header>

        <div className="bg-emerald-600 p-12 rounded-[3rem] text-white text-center shadow-xl border-b-8 border-emerald-800 relative">
          <div className="absolute -top-4 -left-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-lg border-2 border-emerald-100">
            <i className="fas fa-shield-alt"></i>
          </div>
          <p className="text-2xl font-black italic">"{LEVEL3_DATA[currentIdx].q}"</p>
        </div>

        <div className="grid gap-4">
          {LEVEL3_DATA[currentIdx].options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleLevel3(i)}
              className="p-6 bg-white border-2 border-gray-100 hover:border-emerald-500 rounded-[2rem] text-left font-black text-gray-700 transition-all hover:bg-emerald-50 active:scale-[0.98] flex items-center gap-5 shadow-sm"
            >
              <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400 shrink-0 group-hover:bg-emerald-500">{i+1}</div>
              <span className="flex-grow">{opt}</span>
            </button>
          ))}
        </div>

        {showHint && (
          <div className="bg-emerald-50 p-6 rounded-3xl border-2 border-emerald-100 animate-fadeIn text-center">
            <p className="text-sm font-bold text-emerald-800">
              <i className="fas fa-brain mr-2"></i> Escaneo de Negación: {LEVEL3_DATA[currentIdx].hint}
            </p>
          </div>
        )}
    </div>
  );

  const renderSummary = () => (
    <div className="text-center space-y-10 py-10 animate-fadeIn">
      <div className="w-44 h-44 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-7xl shadow-2xl border-8 border-white mx-auto animate-bounce">
        <i className="fas fa-trophy"></i>
      </div>
      <div>
        <h2 className="text-4xl font-black text-gray-800 tracking-tight">¡MISIÓN CUMPLIDA!</h2>
        <p className="text-gray-500 font-medium text-lg">Has restaurado la armonía lógica del cuadrante.</p>
      </div>
      <div className="bg-gray-900 p-8 rounded-[3rem] inline-block px-16 border-4 border-pink-500/30 shadow-2xl">
        <span className="text-[10px] font-black uppercase text-pink-400 block mb-2 tracking-[0.3em]">Puntaje Obtenido</span>
        <span className="text-6xl font-black text-white">{score} <span className="text-2xl text-pink-500">pts</span></span>
      </div>
      <div>
        <button 
          onClick={() => { playSound('finish'); onFinish(score); }}
          className="px-16 py-6 bg-gray-800 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-black hover:scale-105 transition-all"
        >
          REGRESAR A LA BASE
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(state) {
      case GameState.INTRO: return renderIntro();
      case GameState.TUTORIAL1: return renderBriefing(
        "Clasificación Lógica",
        <>
          <p>Existen dos tipos de cuantificadores principales:</p>
          <div className="grid grid-cols-2 gap-4 my-4">
            <div className="bg-blue-900/50 p-4 rounded-2xl border border-blue-500/30">
              <strong className="text-blue-400 block text-lg mb-1">∀ (Universal)</strong>
              <p className="text-xs">Usa palabras como: <strong>Todos</strong>, <strong>Cualquier</strong>, <strong>Cada</strong>, <strong>Ninguno</strong>.</p>
              <p className="text-[10px] mt-2 italic text-blue-200">"Todos los gatos maúllan."</p>
            </div>
            <div className="bg-purple-900/50 p-4 rounded-2xl border border-purple-500/30">
              <strong className="text-purple-400 block text-lg mb-1">∃ (Existencial)</strong>
              <p className="text-xs">Usa palabras como: <strong>Existe</strong>, <strong>Algunos</strong>, <strong>Hay al menos un</strong>.</p>
              <p className="text-[10px] mt-2 italic text-purple-200">"Algunos perros ladran."</p>
            </div>
          </div>
          <p>Tu misión: Identificar qué tipo de meteorito lógico se aproxima.</p>
        </>,
        GameState.LEVEL1
      );
      case GameState.LEVEL1: return renderLevel1();
      case GameState.TUTORIAL2: return renderBriefing(
        "Ingeniería de Símbolos",
        <>
          <p>Para traducir frases a lenguaje matemático usamos bloques:</p>
          <ul className="space-y-3 list-disc list-inside">
            <li><strong>∀x</strong>: Para todo x...</li>
            <li><strong>∃x</strong>: Existe un x...</li>
            <li><strong>R(x)</strong>: El objeto x tiene la propiedad R.</li>
            <li><strong>P → Q</strong>: Si es P, entonces es Q (Típico de Universales).</li>
            <li><strong>P ∧ Q</strong>: Es P y además es Q (Típico de Existenciales).</li>
          </ul>
          <p className="bg-white/10 p-4 rounded-xl text-xs">Ejemplo: "Todo hombre es mortal" → <strong>∀x: H(x) → M(x)</strong></p>
        </>,
        GameState.LEVEL2
      );
      case GameState.LEVEL2: return renderLevel2();
      case GameState.TUTORIAL3: return renderBriefing(
        "Escudos de Negación",
        <>
          <p>Negar un cuantificador cambia su naturaleza:</p>
          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-center gap-4 bg-emerald-900/40 p-3 rounded-xl">
               <span className="bg-emerald-500 text-white px-2 py-1 rounded">Regla 1</span>
               <span>Negar <strong>"Todos son"</strong> es igual a <strong>"Al menos uno NO es"</strong>.</span>
            </div>
            <div className="flex items-center gap-4 bg-emerald-900/40 p-3 rounded-xl">
               <span className="bg-emerald-500 text-white px-2 py-1 rounded">Regla 2</span>
               <span>Negar <strong>"Existe uno"</strong> es igual a <strong>"Todos NO son"</strong>.</span>
            </div>
          </div>
          <p>Detecta el ataque y usa el escudo opuesto para defenderte.</p>
        </>,
        GameState.LEVEL3
      );
      case GameState.LEVEL3: return renderLevel3();
      case GameState.SUMMARY: return renderSummary();
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn px-4">
      <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-pink-50 overflow-hidden min-h-[600px] flex flex-col">
        {/* Barra de Estado Superior */}
        {state !== GameState.INTRO && state !== GameState.SUMMARY && (
          <div className="bg-gray-900 p-5 px-8 flex justify-between items-center text-white border-b-4 border-pink-500/20 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-40 h-4 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-700 shadow-inner">
                <div 
                  className={`h-full transition-all duration-700 ease-out ${energy > 50 ? 'bg-emerald-500' : energy > 20 ? 'bg-yellow-500' : 'bg-red-600'}`}
                  style={{ width: `${energy}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Energía Vital</span>
            </div>
            <div className="flex items-center gap-8">
               <div className="text-right">
                  <span className="text-[10px] font-black uppercase opacity-40 block leading-none mb-1">Créditos de Misión</span>
                  <span className="text-2xl font-black text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">{score}</span>
               </div>
               <button onClick={onBack} className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-red-600 transition-all shadow-md">
                 <i className="fas fa-times"></i>
               </button>
            </div>
          </div>
        )}

        <div className="p-6 md:p-12 flex-grow overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default QuantifiersGame;
