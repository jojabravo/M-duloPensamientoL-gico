
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../audio';
import { StudentProfile } from '../types';
import { supabase } from '../src/supabaseClient';
import Calculator from './Calculator';

interface Props {
  student: StudentProfile;
  onBack: () => void;
  onComplete: (newProgress: number) => void;
}

type SubActivity = 'intro' | 'star' | 'caesar' | 'arithmetic_intro' | 'arithmetic_sum' | 'arithmetic_mul' | 'arithmetic_div' | 'medal';

// --- SHARED COMPONENTS ---

const DefinitionScreen = ({ title, text, onNext }: { title: string, text: string, onNext: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border-8 border-orange-100 max-w-2xl text-center space-y-6"
  >
    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-4xl mx-auto">
      <i className="fas fa-book-open"></i>
    </div>
    <h2 className="text-3xl font-black text-gray-800 tracking-tighter">{title}</h2>
    <p className="text-lg text-gray-600 font-medium leading-relaxed italic">
      "{text}"
    </p>
    <button 
      onClick={() => { playSound('pop'); onNext(); }}
      className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-black shadow-lg hover:bg-orange-700 transition-all flex items-center gap-3 mx-auto"
    >
      <span>ENTENDIDO, ¡VAMOS!</span>
      <i className="fas fa-arrow-right"></i>
    </button>
  </motion.div>
);

const SuccessMessage = ({ studentName, onNext }: { studentName: string, onNext: () => void }) => (
  <motion.div 
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-orange-600/20 backdrop-blur-sm"
  >
    <div className="bg-white p-8 rounded-[3rem] shadow-2xl text-center max-w-sm border-8 border-orange-100">
      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-4xl mx-auto mb-6">
        <i className="fas fa-check-circle"></i>
      </div>
      <h3 className="text-2xl font-black text-gray-800 mb-2">¡Increíble, {studentName}!</h3>
      <p className="text-gray-600 font-medium mb-8">Has descifrado el código con éxito.</p>
      <button 
        onClick={() => { playSound('pop'); onNext(); }}
        className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black shadow-lg hover:bg-orange-700 transition-all"
      >
        SIGUIENTE RETO
      </button>
    </div>
  </motion.div>
);

const CryptoLab: React.FC<Props> = ({ student, onBack, onComplete }) => {
  const [currentActivity, setCurrentActivity] = useState<SubActivity>(
    (student.progreso_criptogramas || 0) >= 100 ? 'medal' : 'intro'
  );
  const [progress, setProgress] = useState(student.progreso_criptogramas || 0);
  const [showMatrix, setShowMatrix] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateProgress = async (levelIndex: number) => {
    const calculatedProgress = (levelIndex + 1) * 20;
    if (calculatedProgress <= progress) return;
    
    const newProgress = Math.min(100, calculatedProgress);
    setProgress(newProgress);
    onComplete(newProgress);
    
    if (newProgress >= 100) {
      setCurrentActivity('medal');
    }
  };

  const gameActivities: SubActivity[] = ['star', 'caesar', 'arithmetic_sum', 'arithmetic_mul', 'arithmetic_div'];
  const currentIndex = gameActivities.indexOf(currentActivity);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex !== -1 && currentIndex < gameActivities.length - 1 && progress >= (currentIndex + 1) * 20;

  const handlePrev = () => {
    if (canGoBack) {
      playSound('pop');
      setCurrentActivity(gameActivities[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      playSound('pop');
      setCurrentActivity(gameActivities[currentIndex + 1]);
    }
  };

  const startMatrixEffect = (next: SubActivity) => {
    setShowMatrix(true);
    playSound('pop');
    setTimeout(() => {
      setShowMatrix(false);
      setCurrentActivity(next);
      setIsTimerActive(true);
    }, 2000);
  };

  const MatrixOverlay = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -100 }}
            animate={{ y: 1000 }}
            transition={{ 
              duration: Math.random() * 2 + 1, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 2
            }}
            className="absolute text-orange-500 font-mono text-xs whitespace-nowrap"
            style={{ left: `${i * 5}%` }}
          >
            {Array.from({ length: 30 }).map(() => String.fromCharCode(0x30A0 + Math.random() * 96)).join('\n')}
          </motion.div>
        ))}
      </div>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center z-10"
      >
        <h2 className="text-4xl font-black text-orange-500 tracking-widest mb-4">INICIANDO PROTOCOLO</h2>
        <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5 }}
            className="h-full bg-orange-500"
          />
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn px-4 py-8">
      <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-orange-50 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-orange-500 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl rotate-12">
            <i className="fas fa-magnifying-glass"></i>
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => { playSound('pop'); onBack(); }}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/20 px-4 py-1.5 rounded-full mb-2 inline-block">
                  Capítulo 2 • Bloque 1
                </span>
                <h3 className="text-3xl font-black tracking-tight">Laboratorio Cripto</h3>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowCalculator(!showCalculator)}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95"
              >
                <i className="fas fa-calculator text-xl"></i>
              </button>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Cronómetro</span>
                <span className="text-xl font-black text-white font-mono">{formatTime(timer)}</span>
              </div>
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center border border-white/20">
                <span className="text-[10px] font-black text-white/60 uppercase">Progreso</span>
                <span className="text-xl font-black text-white">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 bg-orange-50/30">
          <AnimatePresence>
            {showMatrix && <MatrixOverlay />}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {currentActivity === 'intro' && (
                <motion.div 
                  key="intro"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                >
                  <div className="space-y-6">
                    <div className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-xs font-black uppercase tracking-widest">
                      Bienvenido, Agente {student.Nombre}
                    </div>
                    <h2 className="text-5xl font-black text-gray-800 leading-none tracking-tighter">
                      ¡El mundo de los <span className="text-orange-600">Criptogramas</span> te espera!
                    </h2>
                    <div className="bg-orange-100/50 p-4 rounded-2xl border-l-4 border-orange-500 italic text-sm text-gray-700">
                      "Un criptograma es un mensaje cifrado o encriptado, de modo que para descifrarlo y conocer su contenido hay que modificarlo averiguando un determinado patrón. En general, se descifra reemplazando cada letra por otra letra diferente, o por un número."
                    </div>
                    <p className="text-lg text-gray-600 font-medium leading-relaxed">
                      Tu misión es descifrar los códigos ocultos utilizando la lógica y las matemáticas. 
                      Supera los niveles para obtener tu medalla de Cripto-Analista.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={() => startMatrixEffect('star')}
                        className="px-10 py-5 bg-orange-600 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-orange-700 hover:-translate-y-1 transition-all flex items-center gap-4"
                      >
                        <span>COMENZAR MISIÓN</span>
                        <i className="fas fa-play"></i>
                      </button>
                      {progress > 0 && (
                        <button 
                          onClick={() => {
                            if (progress >= 100) setCurrentActivity('medal');
                            else if (progress >= 80) setCurrentActivity('arithmetic_div');
                            else if (progress >= 60) setCurrentActivity('arithmetic_mul');
                            else if (progress >= 40) setCurrentActivity('arithmetic_sum');
                            else if (progress >= 20) setCurrentActivity('caesar');
                            else setCurrentActivity('star');
                          }}
                          className="px-10 py-5 bg-white text-orange-600 border-4 border-orange-100 rounded-[2rem] font-black text-xl shadow-xl hover:bg-orange-50 transition-all"
                        >
                          CONTINUAR
                        </button>
                      )}
                    </div>
                  </div>
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.05, rotate: 0 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ rotate: 3 }}
                  >
                    <div className="absolute inset-0 bg-orange-200 rounded-[4rem] rotate-3 -z-10"></div>
                    <div className="relative overflow-hidden rounded-[4rem] shadow-2xl border-8 border-white aspect-video group">
                      <img 
                        src="https://picsum.photos/seed/human-brain-logic/800/600" 
                        alt="Cerebro Lógico" 
                        className="object-cover h-full w-full transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-orange-600/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                        <span className="text-white font-black text-2xl tracking-tighter drop-shadow-lg">¡ACTIVA TU MENTE!</span>
                      </div>
                      {/* Floating numbers effect on hover */}
                      <div className="absolute inset-0 pointer-events-none hidden group-hover:block">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <motion.span
                            key={n}
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: -100 }}
                            transition={{ duration: 2, repeat: Infinity, delay: n * 0.4 }}
                            className="absolute text-white font-black text-4xl opacity-50"
                            style={{ left: `${n * 20}%` }}
                          >
                            {Math.floor(Math.random() * 9)}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {currentActivity !== 'intro' && currentActivity !== 'medal' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-6 relative"
                >
                  {/* Navigation Arrows */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-4 md:-left-12 z-20">
                    <button
                      onClick={handlePrev}
                      disabled={!canGoBack}
                      className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-xl transition-all border-4 ${
                        canGoBack 
                          ? 'bg-white border-orange-100 text-orange-600 hover:scale-110 active:scale-95 cursor-pointer' 
                          : 'bg-gray-50 border-gray-100 text-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <i className="fas fa-chevron-left text-xl md:text-2xl"></i>
                    </button>
                  </div>

                  <div className="absolute top-1/2 -translate-y-1/2 right-4 md:-right-12 z-20">
                    <button
                      onClick={handleNext}
                      disabled={!canGoForward}
                      className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-xl transition-all border-4 ${
                        canGoForward 
                          ? 'bg-orange-600 border-orange-200 text-white hover:scale-110 active:scale-95 cursor-pointer' 
                          : 'bg-gray-50 border-gray-100 text-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <i className="fas fa-chevron-right text-xl md:text-2xl"></i>
                    </button>
                  </div>

                  {currentActivity === 'star' && (
                    <LogicStarActivity 
                      studentName={student.Nombre || ''}
                      onNext={() => {
                        updateProgress(0);
                        startMatrixEffect('caesar');
                      }}
                    />
                  )}

                  {currentActivity === 'caesar' && (
                    <CaesarCipherActivity 
                      studentName={student.Nombre || ''}
                      onNext={() => {
                        updateProgress(1);
                        setCurrentActivity('arithmetic_intro');
                      }}
                    />
                  )}

                  {currentActivity === 'arithmetic_intro' && (
                    <DefinitionScreen 
                      title="Criptogramas Numéricos"
                      text="Un criptograma numérico es una forma de escritura con la que se emplea símbolos (incluso letras) o recuadros vacíos para ocultar dígitos que forman un número o una operación. Cuando resolvemos un criptograma numérico buscamos determinar los valores ocultos, para ello debemos usar las propiedades que conocemos sobre las 4 operaciones básicas."
                      onNext={() => startMatrixEffect('arithmetic_sum')}
                    />
                  )}

                  {currentActivity === 'arithmetic_sum' && (
                    <ArithmeticActivity 
                      studentName={student.Nombre || ''}
                      type="sum"
                      onNext={() => {
                        updateProgress(2);
                        startMatrixEffect('arithmetic_mul');
                      }}
                    />
                  )}

                  {currentActivity === 'arithmetic_mul' && (
                    <ArithmeticActivity 
                      studentName={student.Nombre || ''}
                      type="mul"
                      onNext={() => {
                        updateProgress(3);
                        startMatrixEffect('arithmetic_div');
                      }}
                    />
                  )}

                  {currentActivity === 'arithmetic_div' && (
                    <ArithmeticActivity 
                      studentName={student.Nombre || ''}
                      type="div"
                      onNext={() => {
                        updateProgress(4);
                        setCurrentActivity('medal');
                      }} 
                    />
                  )}
                </motion.div>
              )}

              {currentActivity === 'medal' && (
                <MedalCelebration 
                  studentName={student.Nombre || ''} 
                  onBack={onBack} 
                  onReview={() => setCurrentActivity('star')} 
                />
              )}
            </AnimatePresence>
            {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const LogicStarActivity: React.FC<{ studentName: string, onNext: () => void }> = ({ studentName, onNext }) => {
  const [solved, setSolved] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
  
  // Full phrase from document (normalized for matching)
  const rows = [
    { text: "JAMAS", nums: [10, 18, 12, 15, 19] },
    { text: "EL", nums: [12, 7] },
    { text: "FRACASO", nums: [21, 13, 9, 2, 25, 19, 23] },
    { text: "ME", nums: [24, 19] },
    { text: "SOBRECOGERA", nums: [15, 23, 13, 17, 13, 25, 13, 18, 25, 14, 9] },
    { text: "SI", nums: [19, 16] },
    { text: "MI", nums: [4, 23] },
    { text: "DETERMINACION", nums: [22, 1, 16, 11, 14, 21, 23, 5, 14, 2, 6, 7, 25] },
    { text: "POR", nums: [3, 26, 3] },
    { text: "ALCANZAR", nums: [9, 11, 18, 25, 13, 13, 1, 18] },
    { text: "EL", nums: [13, 7] },
    { text: "EXITO", nums: [20, 20, 11, 12, 22] },
    { text: "ES", nums: [16, 15] },
    { text: "LO", nums: [19, 4] },
    { text: "SUFICIENTEMENTE", nums: [4, 2, 11, 3, 21, 6, 23, 9, 7, 11, 8, 19, 9, 7, 11] },
    { text: "PODEROSA", nums: [12, 26, 15, 1, 14, 24, 4, 8] }
  ];

  // Flatten for logic
  const targetPhrase = rows.map(r => r.text).join("").split("");
  const [currentGuess, setCurrentGuess] = useState<string[]>(Array(targetPhrase.length).fill(""));

  const handleDrop = (letter: string, index: number) => {
    if (letter === targetPhrase[index]) {
      const newGuess = [...currentGuess];
      newGuess[index] = letter;
      setCurrentGuess(newGuess);
      playSound('pop');
      setSelectedLetter(null);
      
      if (newGuess.join("") === targetPhrase.join("")) {
        setSolved(true);
      }
    } else {
      playSound('error');
    }
  };

  // Helper to get flat index from row and char index
  const getFlatIndex = (rowIndex: number, charIndex: number) => {
    let index = 0;
    for (let i = 0; i < rowIndex; i++) {
      index += rows[i].text.length;
    }
    return index + charIndex;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="bg-white p-4 md:p-6 rounded-[3rem] shadow-xl border-4 border-orange-100 flex flex-col items-center w-full max-w-5xl"
    >
      <h3 className="text-xl md:text-2xl font-black text-gray-800 mb-1">Reto: Letras y números en las estrellas</h3>
      <p className="text-gray-500 font-medium mb-3 text-center max-w-2xl text-[10px] md:text-xs leading-tight">
        Observa detenidamente la estrella de letras y los números. Para descubrir la frase oculta:
        1. Empieza a contar 1 por la letra <span className="text-orange-600 font-black">"A"</span>.
        2. Para continuar, inicia el conteo en 1 desde la letra siguiente a la última encontrada.
        <br/>
        <span className="text-orange-600 font-black">(Toca una letra y luego un espacio para colocarla)</span>
      </p>

      <div className="relative w-40 h-40 md:w-56 md:h-56 mb-4 md:mb-6 shrink-0">
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fas fa-star text-[8rem] md:text-[11rem] text-orange-100"></i>
        </div>
        {alphabet.map((letter, i) => {
          const angle = (i / alphabet.length) * 2 * Math.PI - Math.PI / 2;
          const radius = window.innerWidth < 768 ? 70 : 90;
          const center = window.innerWidth < 768 ? 80 : 112;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const isSelected = selectedLetter === letter;

          return (
            <motion.div
              key={letter}
              drag
              dragSnapToOrigin
              onDragEnd={(_, info) => {
                const slots = document.querySelectorAll('.star-slot');
                slots.forEach((slot) => {
                  const rect = slot.getBoundingClientRect();
                  if (
                    info.point.x > rect.left && info.point.x < rect.right &&
                    info.point.y > rect.top && info.point.y < rect.bottom
                  ) {
                    const flatIdx = parseInt(slot.getAttribute('data-index') || '0');
                    handleDrop(letter, flatIdx);
                  }
                });
              }}
              onClick={() => {
                setSelectedLetter(letter);
                playSound('pop');
              }}
              className={`absolute w-5 h-5 md:w-7 md:h-7 rounded-lg flex items-center justify-center font-black cursor-grab active:cursor-grabbing shadow-md z-20 text-[8px] md:text-[10px] transition-all ${
                isSelected ? 'bg-orange-700 text-white scale-125 ring-4 ring-orange-300' : 'bg-orange-50 text-orange-900'
              }`}
              style={{ left: x, top: y }}
            >
              {letter}
            </motion.div>
          );
        })}
      </div>

      <div className="w-full space-y-2 md:space-y-3 overflow-x-auto pb-2">
        {/* Optimized Rows: Combining for space */}
        {[
          [0, 1, 2, 3],       // Row 1: JAMAS EL FRACASO ME
          [4, 5, 6],          // Row 2: SOBRECOGERA SI MI
          [7],                // Row 3: DETERMINACION
          [8, 9, 10, 11],     // Row 4: POR ALCANZAR EL EXITO
          [12, 13, 14, 15]    // Row 5: ES LO SUFICIENTEMENTE PODEROSA
        ].map((rowGroup, gIdx) => (
          <div key={gIdx} className="flex flex-wrap justify-center gap-2 md:gap-4">
            {rowGroup.map(rIdx => (
              <div key={rIdx} className="flex gap-0.5 md:gap-1">
                {rows[rIdx].text.split("").map((_, cIdx) => {
                  const flatIdx = getFlatIndex(rIdx, cIdx);
                  return (
                    <div key={cIdx} className="flex flex-col items-center gap-0.5">
                      <div 
                        data-index={flatIdx}
                        onClick={() => {
                          if (selectedLetter) {
                            handleDrop(selectedLetter, flatIdx);
                          }
                        }}
                        className={`star-slot w-5 h-5 md:w-7 md:h-7 bg-gray-50 border border-dashed rounded-md flex items-center justify-center text-[8px] md:text-xs font-black transition-all cursor-pointer ${
                          selectedLetter ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                        } ${currentGuess[flatIdx] ? 'text-orange-600 border-solid border-orange-500' : ''}`}
                      >
                        {currentGuess[flatIdx]}
                      </div>
                      <span className="text-[6px] md:text-[7px] font-black text-gray-400">#{rows[rIdx].nums[cIdx]}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      {solved && <SuccessMessage studentName={studentName} onNext={onNext} />}
    </motion.div>
  );
};

const CaesarCipherActivity: React.FC<{ studentName: string, onNext: () => void }> = ({ studentName, onNext }) => {
  const [rotation, setRotation] = useState(0);
  const [solved, setSolved] = useState(false);
  const [userText, setUserText] = useState("");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  
  // Phrase: "En la Josefa Campos pensamos con lógica"
  const targetPhrase = "EN LA JOSEFA CAMPOS PENSAMOS CON LOGICA";
  const encrypted = "HQ OD MRVHID FDPSRV SHQVDPRV FRQ ORJLFD";
  
  const handleRotate = (dir: 'left' | 'right') => {
    setRotation(prev => prev + (dir === 'right' ? 1 : -1));
    playSound('pop');
  };

  const checkSolution = () => {
    const normalizedInput = userText.toUpperCase().trim().replace(/[ÁÉÍÓÚ]/g, (m) => ({'Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U'}[m] || m));
    const normalizedTarget = targetPhrase.toUpperCase().trim();
    
    const normalizedRotation = ((rotation % 26) + 26) % 26;
    if (normalizedRotation === 3 && normalizedInput === normalizedTarget) {
      setSolved(true);
    } else {
      playSound('error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="bg-white p-6 md:p-8 rounded-[3rem] shadow-xl border-4 border-orange-100 flex flex-col items-center w-full max-w-4xl"
    >
      <h3 className="text-2xl font-black text-gray-800 mb-2">Reto: Cifrado César</h3>
      <p className="text-gray-500 font-medium mb-6 text-center max-w-2xl text-sm">
        Gira el disco para hallar la clave (K=3) y descifra la frase: <br/>
        <span className="font-black text-orange-600 text-lg tracking-wider">{encrypted}</span>
      </p>

      <div className="flex flex-col lg:flex-row items-center gap-12 mb-10">
        <div className="relative w-64 h-64 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100">
            {alphabet.map((l, i) => (
              <div 
                key={l} 
                className="absolute w-5 h-5 flex items-center justify-center font-black text-gray-600 text-[10px]"
                style={{ 
                  left: '50%', top: '50%', 
                  transform: `translate(-50%, -50%) rotate(${i * (360/26)}deg) translateY(-115px)` 
                }}
              >
                {l}
              </div>
            ))}
          </div>

          <motion.div 
            animate={{ rotate: rotation * (360/26) }}
            className="w-44 h-44 rounded-full bg-orange-500 shadow-2xl flex items-center justify-center relative border-4 border-white"
          >
            {alphabet.map((l, i) => (
              <div 
                key={l} 
                className="absolute w-5 h-5 flex items-center justify-center font-black text-white text-[10px]"
                style={{ 
                  left: '50%', top: '50%', 
                  transform: `translate(-50%, -50%) rotate(${i * (360/26)}deg) translateY(-75px)` 
                }}
              >
                {l}
              </div>
            ))}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-600 font-black text-xs">
              K={((rotation % 26) + 26) % 26}
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-md">
          <div className="flex gap-4 justify-center">
            <button onClick={() => handleRotate('left')} className="w-12 h-12 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-all">
              <i className="fas fa-undo"></i>
            </button>
            <button onClick={() => handleRotate('right')} className="w-12 h-12 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-all">
              <i className="fas fa-redo"></i>
            </button>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Tu Traducción</label>
            <textarea 
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Escribe la frase descifrada aquí..."
              className="w-full p-4 bg-orange-50 border-2 border-orange-100 rounded-2xl text-gray-700 font-bold focus:border-orange-500 outline-none transition-all resize-none h-24"
            />
          </div>
          
          <button 
            onClick={checkSolution}
            className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black shadow-lg hover:bg-orange-700 transition-all"
          >
            VERIFICAR FRASE
          </button>
        </div>
      </div>

      {solved && <SuccessMessage studentName={studentName} onNext={onNext} />}
    </motion.div>
  );
};

const ArithmeticActivity: React.FC<{ studentName: string, type: 'sum' | 'mul' | 'div', onNext: () => void }> = ({ studentName, type, onNext }) => {
  const [solved, setSolved] = useState(false);
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [cleaned, setCleaned] = useState<Record<string, boolean>>({});

  const checkSolution = () => {
    const numA = parseInt(inputs.A || '0');
    const numB = parseInt(inputs.B || '0');
    const numC = parseInt(inputs.C || '0');
    const numD = parseInt(inputs.D || '0');
    const numE = parseInt(inputs.E || '0');

    if (type === 'sum') {
      if (step === 0) {
        if (numA === 4 && numB === 3) {
          playSound('pop');
          setStep(1);
          setInputs({});
        } else playSound('error');
      } else if (step === 1) {
        if (numA + numB === 9 && inputs.A && inputs.B) {
          playSound('pop');
          setStep(2);
          setInputs({});
        } else playSound('error');
      } else if (step === 2) {
        if (numA === 15) {
          setSolved(true);
        } else playSound('error');
      }
    } else if (type === 'mul') {
      if (inputs.A && inputs.B && inputs.C) {
        const val1 = 170 + numA;
        const res = numB * 100 + 20 + numC;
        if (val1 * 3 === res) {
          setSolved(true);
        } else playSound('error');
      } else playSound('error');
    } else if (type === 'div') {
      const {A, B, C, D, F, E, G} = inputs;
      if (A && B && C && D && F && E && G) {
        // Validation based on the specific problem: 89 / 7 = 12 r 5
        if (A==='8' && B==='9' && C==='7' && D==='7' && F==='9' && E==='1' && G==='9') {
          setSolved(true);
        } else playSound('error');
      } else playSound('error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-orange-100 flex flex-col items-center w-full max-w-4xl"
    >
      <h3 className="text-2xl font-black text-gray-800 mb-2">
        Reto: Cripto-Aritmética {type === 'sum' ? 'Suma' : type === 'mul' ? 'Multiplicación' : 'División'}
      </h3>
      <div className="flex gap-2 mb-4">
        {type === 'sum' && [0, 1, 2].map(i => (
          <div key={i} className={`w-3 h-3 rounded-full ${step >= i ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
        ))}
      </div>
      <p className="text-gray-500 font-medium mb-8 text-center max-w-md">
        {type === 'sum' ? (
          step === 0 ? 'Si A86A + 5B1 = 5B95, halla A y B.' :
          step === 1 ? 'Si 3A2 + B4 = 396, halla A y B.' :
          'Si bca + cab + abc = 1665, ¿cuánto es a + b + c?'
        ) : 
         type === 'mul' ? 'Halla los valores de los recuadros: 1 7 [ ] x 3 = [ ] 2 [ ]' : 
         'Completa la división colombiana: [ ][ ] ÷ [ ] = 12 con residuo 5.'}
      </p>

      <div className="text-4xl font-black text-gray-800 font-mono space-y-4">
        {type === 'sum' && (
          <div className="flex flex-col items-center gap-6">
            {step === 0 && (
              <div className="flex flex-col items-end gap-2 border-2 border-orange-100 p-6 rounded-2xl bg-orange-50/30">
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">A</span>
                  <span>8</span>
                  <span>6</span>
                  <span className="text-orange-600">A</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-2xl">+</span>
                  <span>5</span>
                  <span className="text-orange-600">B</span>
                  <span>1</span>
                </div>
                <div className="w-full h-1 bg-gray-800"></div>
                <div className="flex items-center gap-2">
                  <span>5</span>
                  <span className="text-orange-600">B</span>
                  <span>9</span>
                  <span>5</span>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400">A</span>
                    <input maxLength={1} value={inputs.A || ''} onChange={e => setInputs({...inputs, A: e.target.value})} className="w-12 h-12 bg-white border-2 border-orange-200 rounded-xl text-center text-orange-600" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400">B</span>
                    <input maxLength={1} value={inputs.B || ''} onChange={e => setInputs({...inputs, B: e.target.value})} className="w-12 h-12 bg-white border-2 border-orange-200 rounded-xl text-center text-orange-600" />
                  </div>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="flex flex-col items-end gap-2 border-2 border-orange-100 p-6 rounded-2xl bg-orange-50/30">
                <div className="flex items-center gap-2">
                  <span>3</span>
                  <span className="text-orange-600">A</span>
                  <span>2</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-2xl">+</span>
                  <span className="text-orange-600">B</span>
                  <span>4</span>
                </div>
                <div className="w-full h-1 bg-gray-800"></div>
                <div className="flex items-center gap-2">
                  <span>3</span>
                  <span>9</span>
                  <span>6</span>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400">A</span>
                    <input maxLength={1} value={inputs.A || ''} onChange={e => setInputs({...inputs, A: e.target.value})} className="w-12 h-12 bg-white border-2 border-orange-200 rounded-xl text-center text-orange-600" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400">B</span>
                    <input maxLength={1} value={inputs.B || ''} onChange={e => setInputs({...inputs, B: e.target.value})} className="w-12 h-12 bg-white border-2 border-orange-200 rounded-xl text-center text-orange-600" />
                  </div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="flex flex-col items-center gap-4">
                <div className="text-2xl text-center bg-orange-50 p-4 rounded-xl border border-orange-100">
                  bca + cab + abc = 1665
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm text-gray-500 mb-2">¿Cuánto es a + b + c?</span>
                  <input maxLength={2} value={inputs.A || ''} onChange={e => setInputs({...inputs, A: e.target.value})} className="w-20 h-20 bg-white border-4 border-orange-400 rounded-2xl text-center text-3xl text-orange-600" />
                </div>
              </div>
            )}
          </div>
        )}

        {type === 'mul' && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-end gap-2 border-2 border-orange-100 p-8 rounded-2xl bg-orange-50/30">
              <div className="flex items-center gap-2">
                <span>1</span>
                <span>7</span>
                <input maxLength={1} value={inputs.A || ''} onChange={e => setInputs({...inputs, A: e.target.value})} className="w-14 h-14 bg-white border-2 border-orange-300 rounded-xl text-center text-orange-600" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-2xl">x</span>
                <span className="w-14 text-center">3</span>
              </div>
              <div className="w-full h-1 bg-gray-800"></div>
              <div className="flex items-center gap-2">
                <input maxLength={1} value={inputs.B || ''} onChange={e => setInputs({...inputs, B: e.target.value})} className="w-14 h-14 bg-white border-2 border-orange-300 rounded-xl text-center text-orange-600" />
                <span>2</span>
                <input maxLength={1} value={inputs.C || ''} onChange={e => setInputs({...inputs, C: e.target.value})} className="w-14 h-14 bg-white border-2 border-orange-300 rounded-xl text-center text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {type === 'div' && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative p-8 bg-white rounded-3xl border-2 border-orange-100 shadow-inner font-mono text-2xl">
              <div className="grid grid-cols-[40px_40px_20px_60px] gap-y-2 items-center">
                {/* Dividend & Divisor */}
                <div className="flex justify-center"><input maxLength={1} value={inputs.A || ''} onChange={e => setInputs({...inputs, A: e.target.value})} className="w-10 h-10 bg-orange-50 border border-orange-200 rounded text-center text-orange-600" /></div>
                <div className="flex justify-center"><input maxLength={1} value={inputs.B || ''} onChange={e => setInputs({...inputs, B: e.target.value})} className="w-10 h-10 bg-orange-50 border border-orange-200 rounded text-center text-orange-600" /></div>
                <div></div>
                <div className="border-l-2 border-b-2 border-gray-800 pl-2 pb-1">
                  <input maxLength={1} value={inputs.C || ''} onChange={e => setInputs({...inputs, C: e.target.value})} className="w-10 h-10 bg-orange-50 border border-orange-200 rounded text-center text-orange-600" />
                </div>

                {/* 1st Sub & Quotient */}
                <div className="flex justify-center"><input maxLength={1} value={inputs.D || ''} onChange={e => setInputs({...inputs, D: e.target.value})} className="w-10 h-10 bg-orange-50 border border-orange-200 rounded text-center text-orange-600" /></div>
                <div></div>
                <div></div>
                <div className="pl-2 pt-1">1 2</div>

                {/* Line 1 */}
                <div className="col-span-2 h-0.5 bg-gray-800"></div>
                <div></div>
                <div></div>

                {/* Intermediate */}
                <div className="flex justify-center">1</div>
                <div className="flex justify-center"><input maxLength={1} value={inputs.F || ''} onChange={e => setInputs({...inputs, F: e.target.value})} className="w-10 h-10 bg-orange-50 border border-orange-200 rounded text-center text-orange-600" /></div>
                <div></div>
                <div></div>

                {/* 2nd Sub */}
                <div className="flex justify-center"><input maxLength={1} value={inputs.E || ''} onChange={e => setInputs({...inputs, E: e.target.value})} className="w-10 h-10 bg-orange-50 border border-orange-200 rounded text-center text-orange-600" /></div>
                <div className="flex justify-center">4</div>
                <div></div>
                <div></div>

                {/* Line 2 */}
                <div className="col-span-2 h-0.5 bg-gray-800"></div>
                <div></div>
                <div></div>

                {/* Residue */}
                <div></div>
                <div className="flex justify-center">5</div>
                <div></div>
                <div></div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 mt-4">
              <span className="text-sm font-bold text-gray-600">Cifra mayor:</span>
              <input maxLength={1} value={inputs.G || ''} onChange={e => setInputs({...inputs, G: e.target.value})} className="w-14 h-14 bg-white border-4 border-orange-400 rounded-2xl text-center text-2xl text-orange-600" />
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={checkSolution}
        className="mt-12 px-12 py-4 bg-orange-600 text-white rounded-2xl font-black shadow-lg hover:bg-orange-700 transition-all"
      >
        {step < 2 && type === 'sum' ? 'SIGUIENTE PASO' : 'COMPROBAR'}
      </button>

      {solved && <SuccessMessage studentName={studentName} onNext={onNext} />}
    </motion.div>
  );
};

// --- SUB-COMPONENTS ---

const MedalCelebration: React.FC<{ studentName: string, onBack: () => void, onReview: () => void }> = ({ studentName, onBack, onReview }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12 }}
        className="relative mb-12"
      >
        <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-30 animate-pulse"></div>
        <div className="w-64 h-64 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-full border-8 border-yellow-200 shadow-[0_0_50px_rgba(234,179,8,0.5)] flex flex-col items-center justify-center relative z-10">
          <i className="fas fa-medal text-8xl text-white mb-4 drop-shadow-lg"></i>
          <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/30">
            <span className="text-white font-black tracking-widest text-sm uppercase">Cripto-Analista</span>
          </div>
        </div>
      </motion.div>

      <h2 className="text-5xl font-black text-gray-800 mb-4 tracking-tighter">
        ¡FELICITACIONES, <span className="text-orange-600">{studentName.toUpperCase()}</span>!
      </h2>
      <p className="text-xl text-gray-600 font-medium max-w-lg mb-12">
        Has demostrado una mente brillante descifrando todos los enigmas del laboratorio. 
        ¡Eres oficialmente un Cripto-Analista de élite!
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => { playSound('pop'); onBack(); }}
          className="px-12 py-5 bg-gray-800 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-black transition-all"
        >
          VOLVER AL MENÚ
        </button>

        <button 
          onClick={() => { playSound('pop'); onReview(); }}
          className="px-12 py-5 bg-white text-orange-600 border-4 border-orange-100 rounded-[2rem] font-black text-xl shadow-xl hover:bg-orange-50 transition-all"
        >
          REPASAR RETOS
        </button>
      </div>
    </motion.div>
  );
};

export default CryptoLab;
