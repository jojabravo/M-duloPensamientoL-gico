
import React, { useState, useEffect, useCallback } from 'react';
import { playSound } from '../audio';

interface Props {
  onCorrect?: () => void;
  onFinish: (score: number) => void;
  onBack: () => void;
}

enum MicrobitLevel {
  TUTORIAL,
  LEVEL1, 
  LEVEL2, 
  LEVEL3, 
  FINAL
}

const ICONS = {
  HEART: [
    0, 1, 0, 1, 0,
    1, 1, 1, 1, 1,
    1, 1, 1, 1, 1,
    0, 1, 1, 1, 0,
    0, 0, 1, 0, 0
  ],
  X: [
    1, 0, 0, 0, 1,
    0, 1, 0, 1, 0,
    0, 0, 1, 0, 0,
    0, 1, 0, 1, 0,
    1, 0, 0, 0, 1
  ],
  SMILE: [
    0, 0, 0, 0, 0,
    0, 1, 0, 1, 0,
    0, 0, 0, 0, 0,
    1, 0, 0, 0, 1,
    0, 1, 1, 1, 0
  ],
  EMPTY: Array(25).fill(0)
};

const MicrobitGame: React.FC<Props> = ({ onCorrect, onFinish, onBack }) => {
  const [level, setLevel] = useState<MicrobitLevel>(MicrobitLevel.TUTORIAL);
  const [isA, setIsA] = useState(false);
  const [isB, setIsB] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [score, setScore] = useState(0);
  const [blockSelection, setBlockSelection] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentIcon, setCurrentIcon] = useState<number[]>(ICONS.EMPTY);
  const [isOverDropZone, setIsOverDropZone] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'a') setIsA(true);
      if (e.key.toLowerCase() === 'b') setIsB(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'a') setIsA(false);
      if (e.key.toLowerCase() === 'b') setIsB(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const triggerShake = () => {
    playSound('pop');
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 800);
  };

  const checkLogic = useCallback(() => {
    if (showResult) return;
    
    let success = false;
    let icon = ICONS.EMPTY;

    switch (level) {
      case MicrobitLevel.LEVEL1:
        if (blockSelection === 'SHAKE' && isShaking) {
          success = true;
          icon = ICONS.X;
        }
        break;
      case MicrobitLevel.LEVEL2:
        if (blockSelection === 'A_AND_B' && isA && isB) {
          success = true;
          icon = ICONS.HEART;
        }
        break;
      case MicrobitLevel.LEVEL3:
        if (blockSelection === 'A_OR_SHAKE' && (isA || isShaking)) {
          success = true;
          icon = ICONS.SMILE;
        }
        break;
    }

    if (success) {
      playSound('success');
      setShowResult(true);
      setCurrentIcon(icon);
      setScore(s => s + 50);
      if (onCorrect) onCorrect();
    }
  }, [level, isA, isB, isShaking, blockSelection, showResult, onCorrect]);

  useEffect(() => {
    checkLogic();
  }, [checkLogic]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('blockId', id);
    playSound('pop');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverDropZone(false);
    const id = e.dataTransfer.getData('blockId');
    if (id) {
      setBlockSelection(id);
      playSound('pop');
    }
  };

  const nextLevel = () => {
    playSound('pop');
    setShowResult(false);
    setBlockSelection(null);
    setIsA(false);
    setIsB(false);
    setCurrentIcon(ICONS.EMPTY);
    if (level === MicrobitLevel.LEVEL1) setLevel(MicrobitLevel.LEVEL2);
    else if (level === MicrobitLevel.LEVEL2) setLevel(MicrobitLevel.LEVEL3);
    else setLevel(MicrobitLevel.FINAL);
  };

  const renderMicrobit = () => (
    <div className={`relative w-72 h-60 bg-gray-900 rounded-[2.5rem] border-8 border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center transition-all ${isShaking ? 'animate-bounce' : ''}`}>
      <div className="grid grid-cols-5 gap-2 p-4 bg-black/40 rounded-2xl border border-white/5">
        {currentIcon.map((lit, i) => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-sm transition-all duration-300 ${lit ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] scale-110' : 'bg-gray-800'}`}
          ></div>
        ))}
      </div>
      
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        <div className={`w-12 h-12 rounded-full border-4 font-black flex items-center justify-center transition-all ${isA ? 'bg-blue-600 border-blue-400 text-white scale-90 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>A</div>
        <span className="text-[7px] font-bold text-gray-500 uppercase">Teclado: A</span>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        <div className={`w-12 h-12 rounded-full border-4 font-black flex items-center justify-center transition-all ${isB ? 'bg-blue-600 border-blue-400 text-white scale-90 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-gray-700 border-gray-600 text-gray-400'}`}>B</div>
        <span className="text-[7px] font-bold text-gray-500 uppercase">Teclado: B</span>
      </div>

      <div className="absolute top-4 flex flex-col items-center">
        <button 
          onMouseDown={() => { setIsA(true); setIsB(true); }} 
          onMouseUp={() => { setIsA(false); setIsB(false); }}
          className={`px-4 py-1.5 rounded-full border-2 text-[9px] font-black transition-all ${isA && isB ? 'bg-indigo-600 border-indigo-400 text-white scale-110' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-white'}`}
        >
          PRESIONAR A + B
        </button>
      </div>

      <div className="absolute bottom-4 text-[9px] font-black text-gray-600 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
        IE JOSEFA CAMPOS - CPU
      </div>
    </div>
  );

  const renderTutorial = () => (
    <div className="text-center space-y-8 py-6 animate-fadeIn">
      <div className="relative">
        <div className="w-36 h-36 bg-gradient-to-tr from-emerald-500 to-blue-600 rounded-[3rem] flex items-center justify-center text-white text-6xl shadow-2xl mx-auto rotate-12 border-8 border-white animate-float">
          <i className="fas fa-microchip"></i>
        </div>
      </div>
      <h2 className="text-4xl font-black text-gray-800 tracking-tight">Misión: Reparación Manual</h2>
      <p className="text-gray-500 max-w-lg mx-auto font-medium leading-relaxed">
        ¡Novedad! Ahora puedes <strong>arrastrar los bloques lógicos</strong> directamente al núcleo del procesador. Debes encajarlos para que el robot responda a los sensores.
      </p>
      <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 max-w-sm mx-auto flex items-center gap-4">
        <i className="fas fa-mouse-pointer text-2xl text-blue-500 animate-bounce"></i>
        <p className="text-[10px] font-black text-blue-800 uppercase text-left">Arrastra los bloques de la derecha hacia el slot "IF" del código.</p>
      </div>
      <button onClick={() => setLevel(MicrobitLevel.LEVEL1)} className="px-16 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xl shadow-xl hover:bg-emerald-700 transition-all">
        ¡COMENZAR!
      </button>
    </div>
  );

  const renderLevel = (mission: string, blocks: { id: string, text: string }[]) => (
    <div className="space-y-10 animate-slideIn">
      <div className="bg-gray-900 p-3 rounded-full flex justify-between items-center px-8 shadow-inner">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nivel de Integración: {level}/3</span>
        <div className="flex gap-3">
           {[1, 2, 3].map(i => (
             <div key={i} className={`w-8 h-2 rounded-full transition-all ${level > i ? 'bg-emerald-500' : level === i ? 'bg-blue-500 animate-pulse' : 'bg-gray-800'}`}></div>
           ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="flex flex-col items-center gap-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-4 py-1 rounded-full border shadow-sm">Simulador Josefa-Bot</h4>
            {renderMicrobit()}
            <button onClick={triggerShake} className="px-10 py-3 bg-indigo-600 text-white rounded-full font-black text-[11px] shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
              <i className="fas fa-hand-sparkles"></i> AGITAR (Q)
            </button>
        </div>

        <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border-4 border-emerald-50 shadow-xl relative overflow-hidden">
                <span className="text-[10px] font-black text-emerald-600 uppercase mb-2 block tracking-widest">Desafío Técnico</span>
                <p className="text-gray-800 font-black italic leading-tight text-xl relative z-10">"{mission}"</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-[2.5rem] border-4 border-dashed border-gray-200">
                <span className="text-[10px] font-black text-gray-400 uppercase mb-4 block text-center tracking-[0.2em]">Bloques Lógicos (Arrástrame)</span>
                <div className="grid grid-cols-1 gap-3">
                    {blocks.map(b => (
                        <div
                            key={b.id}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, b.id)}
                            className={`p-5 rounded-2xl font-black text-xs cursor-grab active:cursor-grabbing transition-all flex items-center justify-between border-2 ${blockSelection === b.id ? 'bg-indigo-100 text-indigo-400 border-indigo-200 grayscale' : 'bg-white text-gray-600 border-gray-100 hover:border-indigo-200 shadow-sm hover:shadow-md'}`}
                        >
                            <span>{b.text}</span>
                            <i className="fas fa-grip-vertical text-gray-300"></i>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gray-900 p-8 rounded-3xl text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/5 relative">
                <div className="flex items-center gap-4">
                    <span className="bg-emerald-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg">IF</span>
                    <div 
                        onDragOver={(e) => { e.preventDefault(); setIsOverDropZone(true); }}
                        onDragLeave={() => setIsOverDropZone(false)}
                        onDrop={handleDrop}
                        className={`flex-grow h-16 rounded-2xl border-2 border-dashed flex items-center justify-center px-4 transition-all ${isOverDropZone ? 'bg-emerald-900/40 border-emerald-500 scale-105' : blockSelection ? 'bg-indigo-900/40 border-indigo-500' : 'border-gray-700'}`}
                    >
                        {blockSelection ? (
                          <div className="flex items-center gap-2 text-emerald-400 animate-pop">
                            <i className="fas fa-puzzle-piece"></i>
                            <span className="font-mono font-bold text-sm tracking-widest">{blockSelection}</span>
                          </div>
                        ) : (
                          <div className="text-gray-600 flex flex-col items-center">
                            <i className="fas fa-download text-xs mb-1 opacity-40"></i>
                            <span className="italic text-[9px] tracking-[0.2em]">SUELTA UN BLOQUE AQUÍ</span>
                          </div>
                        )}
                    </div>
                    <span className="bg-emerald-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg">THEN</span>
                </div>
            </div>
        </div>
      </div>

      {showResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-[4rem] p-12 max-w-md w-full text-center shadow-[0_30px_100px_rgba(0,0,0,0.5)] border-t-8 border-emerald-500 animate-slideIn">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-4xl mx-auto mb-8 shadow-inner">
                   <i className="fas fa-check"></i>
                </div>
                <h5 className="text-3xl font-black text-gray-800 mb-4 uppercase tracking-tighter">¡Reparación Exitosa!</h5>
                <p className="text-gray-500 font-medium mb-10 italic leading-relaxed">Has encajado la lógica correctamente en el procesador.</p>
                <button onClick={nextLevel} className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black text-lg hover:bg-emerald-700 hover:scale-[1.03] shadow-2xl transition-all flex items-center justify-center gap-3">
                    SIGUIENTE MISIÓN <i className="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
      )}
    </div>
  );

  const renderFinal = () => (
    <div className="text-center space-y-10 py-10 animate-fadeIn">
      <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[60px] opacity-20"></div>
          <div className="relative w-52 h-52 bg-gradient-to-tr from-indigo-600 to-purple-800 rounded-full flex items-center justify-center text-white text-8xl shadow-2xl border-8 border-white mx-auto animate-bounce">
            <i className="fas fa-robot"></i>
          </div>
      </div>
      <div>
        <h2 className="text-5xl font-black text-gray-800 tracking-tighter uppercase italic">¡Ingeniero de Élite!</h2>
        <p className="text-gray-500 font-medium text-lg max-w-md mx-auto">Has demostrado un gran dominio de la lógica física y el arrastre de componentes.</p>
      </div>
      <div className="bg-gray-900 p-12 rounded-[4rem] inline-block px-24 border-4 border-indigo-500/30 shadow-2xl">
        <span className="text-[12px] font-black uppercase text-indigo-400 block mb-3 tracking-[0.5em]">Hardware Score</span>
        <span className="text-8xl font-black text-white">{score} <span className="text-3xl text-emerald-500">pts</span></span>
      </div>
      <div>
        <button 
          onClick={() => { playSound('finish'); onFinish(score); }}
          className="px-20 py-7 bg-emerald-600 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:bg-emerald-700 transition-all flex items-center gap-6 mx-auto"
        >
          REGRESAR A LA BASE <i className="fas fa-home"></i>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn px-4">
      <div className="bg-white rounded-[4rem] shadow-2xl border-4 border-emerald-50 overflow-hidden min-h-[750px] flex flex-col relative">
        {level !== MicrobitLevel.TUTORIAL && level !== MicrobitLevel.FINAL && (
            <div className="bg-gray-900 p-6 px-12 flex justify-between items-center text-white border-b-4 border-white/5 shadow-2xl z-10">
                <div className="flex items-center gap-12">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Hardware Monitor</span>
                        <div className="flex gap-4">
                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${isA ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 text-gray-600'}`}>A</div>
                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${isB ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 text-gray-600'}`}>B</div>
                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${isShaking ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-800 text-gray-600'}`}>ACCEL</div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-12">
                    <div className="text-right">
                        <span className="text-[10px] font-black uppercase opacity-40 block mb-1 tracking-widest">Score Ingeniería</span>
                        <span className="text-4xl font-black text-emerald-400 tabular-nums">{score}</span>
                    </div>
                    <button onClick={onBack} className="w-14 h-14 bg-gray-800 rounded-[1.5rem] flex items-center justify-center text-gray-500 hover:text-white hover:bg-red-600 transition-all shadow-xl group">
                        <i className="fas fa-times group-hover:scale-125 transition-transform"></i>
                    </button>
                </div>
            </div>
        )}

        <div className="p-8 md:p-16 flex-grow flex flex-col justify-center z-10">
          {level === MicrobitLevel.TUTORIAL && renderTutorial()}
          {level === MicrobitLevel.LEVEL1 && renderLevel(
            "Mueve la lógica de movimiento (Q) al procesador para activar la alerta X.",
            [
              { id: 'A_PRESIONADO', text: 'IF Botón A (P)' },
              { id: 'SHAKE', text: 'IF Agitado (Q)' },
              { id: 'B_PRESIONADO', text: 'IF Botón B (R)' }
            ]
          )}
          {level === MicrobitLevel.LEVEL2 && renderLevel(
            "Crea la llave de AMOR: Arrastra el bloque (P ∧ R) para encender el corazón.",
            [
              { id: 'A_OR_B', text: 'P ∨ R (A o B)' },
              { id: 'A_AND_B', text: 'P ∧ R (A y B)' },
              { id: 'NOT_A', text: '¬P (No A)' }
            ]
          )}
          {level === MicrobitLevel.LEVEL3 && renderLevel(
            "Protocolo Amistad: Inserta la disyunción (Q ∨ P) para activar la sonrisa.",
            [
              { id: 'A_AND_SHAKE', text: 'Q ∧ P (Y)' },
              { id: 'A_OR_SHAKE', text: 'Q ∨ P (O)' },
              { id: 'ONLY_B', text: 'R (Solo B)' }
            ]
          )}
          {level === MicrobitLevel.FINAL && renderFinal()}
        </div>
      </div>
    </div>
  );
};

export default MicrobitGame;
