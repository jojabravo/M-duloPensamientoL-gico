import React, { useState } from 'react';
import { playSound } from '../audio';
import { StudentProfile } from '../types';

interface Props {
  student: StudentProfile;
  onBack: () => void;
  onComplete: (column: string, newProg: number) => void;
}

interface SomaPiece {
  id: string;
  name: string;
  color: string;
  description: string;
  unitCubes: number;
  cubes: { x: number; y: number; z: number }[];
}

const SomaCube: React.FC<Props> = ({ student, onBack, onComplete }) => {
  const [activeTab, setActiveTab] = useState<'pieces' | 'puzzle'>('pieces');
  const [selectedPieceId, setSelectedPieceId] = useState<string>('V');
  const [puzzleStep, setPuzzleStep] = useState<number>(1);
  const [numUnitCubesInput, setNumUnitCubesInput] = useState<string>('');
  const [triviaAnswers, setTriviaAnswers] = useState<Record<number, string>>({});

  // The 7 pieces of the Soma Cube (6 tetracubes, 1 tricube)
  const somaPieces: SomaPiece[] = [
    {
      id: 'V',
      name: 'Pieza V (Tricubo)',
      color: '#ef4444', // Red
      description: 'La única pieza formada por 3 cubos. Tiene forma de letra V en un ángulo recto.',
      unitCubes: 3,
      cubes: [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 }
      ]
    },
    {
      id: 'L',
      name: 'Pieza L (Tetracubo)',
      color: '#f97316', // Orange
      description: 'Una fila de tres cubos con un cubo adicional fijado en un extremo. Forma de letra L.',
      unitCubes: 4,
      cubes: [
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 },
        { x: 1, y: 0, z: 0 }
      ]
    },
    {
      id: 'T',
      name: 'Pieza T (Tetracubo)',
      color: '#eab308', // Yellow
      description: 'Una fila de tres cubos con un cubo en el centro. Forma de letra T.',
      unitCubes: 4,
      cubes: [
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 },
        { x: 1, y: 1, z: 0 }
      ]
    },
    {
      id: 'Z',
      name: 'Pieza Z (Tetracubo)',
      color: '#10b981', // Emerald
      description: 'Forma de letra Z plana. Dos cubos escalonados.',
      unitCubes: 4,
      cubes: [
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 },
        { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 }
      ]
    },
    {
      id: 'A',
      name: 'Pieza A (Tetracubo Quirúrgico Izquierdo)',
      color: '#3b82f6', // Blue
      description: 'Pieza tridimensional de esquina. Giro helicoidal a la izquierda.',
      unitCubes: 4,
      cubes: [
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 0, z: 0 },
        { x: 0, y: 0, z: 1 }
      ]
    },
    {
      id: 'B',
      name: 'Pieza B (Tetracubo Quirúrgico Derecho)',
      color: '#8b5cf6', // Violet
      description: 'Pieza tridimensional de esquina. Imagen de espejo de la pieza A (giro helicoidal derecho).',
      unitCubes: 4,
      cubes: [
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 },
        { x: 0, y: 1, z: 1 }
      ]
    },
    {
      id: 'P',
      name: 'Pieza P (Tetracubo de Rama)',
      color: '#ec4899', // Pink
      description: 'Formada por un tripode o rama de tres cubos con un cubo colocado encima en su vértice.',
      unitCubes: 4,
      cubes: [
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 1 }
      ]
    }
  ];

  const selectedPiece = somaPieces.find(p => p.id === selectedPieceId) || somaPieces[0];

  // Render variables
  const size = 35;
  const originX = 130;
  const originY = 160;

  const handleVerifyStep1 = () => {
    const totalUnitCubes = somaPieces.reduce((acc, p) => acc + p.unitCubes, 0); // 27 cubes
    const parsed = parseInt(numUnitCubesInput.trim(), 10);
    
    if (parsed === totalUnitCubes) {
      playSound('success');
      setPuzzleStep(2);
      alert('¡Excelente deducción matemática! Las 7 piezas suman exactamente 27 cubos individuales, lo cual coincide de manera perfecta con el volumen de un cubo grande de 3x3x3.');
    } else {
      playSound('error');
      alert(`Vuelve a sumar: 6 piezas de 4 bloques (tetracubos) y 1 pieza de 3 bloques (tricubo). ¿Cuánto suma en total?`);
    }
  };

  const handleVerifyTrivia = (questionId: number, answer: string, correct: string) => {
    playSound('pop');
    setTriviaAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    if (answer === correct) {
      playSound('success');
      if (questionId === 1) {
        alert('¡Magnífico! Piet Hein inventó este rompecabezas durante una conferencia de física cuántica de Werner Heisenberg.');
      } else {
        onComplete('progreso_cubosoma', 100);
        alert('🏆 ¡FELICITACIONES! Has completado con éxito la aventura del Cubo de Soma y desbloqueado la nota mental de Pensamiento Espacial.');
      }
    } else {
      playSound('error');
      alert('Respuesta incorrecta. ¡Inténtalo de nuevo con lógica!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn px-4 py-8">
      <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-fuchsia-50 overflow-hidden mb-8">
        {/* Header Banner */}
        <div className="bg-fuchsia-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl rotate-12">
            <i className="fas fa-cube"></i>
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => { playSound('pop'); onBack(); }}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/20 px-4 py-1.5 rounded-full mb-2 inline-block">
                  Aventura Geométrica • Bloque 4
                </span>
                <h3 className="text-3xl font-black tracking-tight text-white uppercase">El Legendario Cubo de Soma</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-fuchsia-100 bg-fuchsia-50/50 p-2">
          <button
            onClick={() => { playSound('pop'); setActiveTab('pieces'); }}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer ${
              activeTab === 'pieces' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-fuchsia-800 hover:bg-fuchsia-100/50'
            }`}
          >
            <i className="fas fa-puzzle-piece mr-2"></i>
            1. Laboratorio de Piezas
          </button>
          <button
            onClick={() => { playSound('pop'); setActiveTab('puzzle'); }}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer ${
              activeTab === 'puzzle' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-fuchsia-800 hover:bg-fuchsia-100/50'
            }`}
          >
            <i className="fas fa-brain mr-2"></i>
            2. Desafío SOMA
          </button>
        </div>
      </div>

      {activeTab === 'pieces' && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: 3D Render of selected SOMA Piece */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-150 shadow-xl flex flex-col items-center gap-6">
            <div className="text-center">
              <h4 className="font-extrabold text-lg text-slate-800 uppercase">
                {selectedPiece.name}
              </h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Visualización Tridimensional del Bloque
              </p>
            </div>

            {/* SVG Render box */}
            <div className="w-full max-w-sm aspect-square bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center">
              <svg viewBox="0 0 280 280" className="w-full h-full p-4">
                {selectedPiece.cubes.map((c, i) => {
                  const sx = originX + (c.y - c.x) * size * 1.05;
                  const sy = originY + (c.x + c.y) * size * 0.6 - c.z * size * 1.2;

                  const topFace = `${sx},${sy - size * 1.2} ${sx + size * 1.05},${sy - size * 0.6} ${sx},${sy} ${sx - size * 1.05},${sy - size * 0.6}`;
                  const leftFace = `${sx - size * 1.05},${sy - size * 0.6} ${sx},${sy} ${sx},${sy + size * 1.2} ${sx - size * 1.05},${sy + size * 0.6}`;
                  const rightFace = `${sx},${sy} ${sx + size * 1.05},${sy - size * 0.6} ${sx + size * 1.05},${sy + size * 0.6} ${sx},${sy + size * 1.2}`;

                  return (
                    <g key={i}>
                      {/* Left Wall */}
                      <polygon points={leftFace} fill={selectedPiece.color} opacity="0.7" stroke="#4a044e" strokeWidth="1.5" />
                      {/* Right Wall */}
                      <polygon points={rightFace} fill={selectedPiece.color} opacity="0.85" stroke="#4a044e" strokeWidth="1.5" />
                      {/* Top Cap */}
                      <polygon points={topFace} fill={selectedPiece.color} opacity="0.95" stroke="#4a044e" strokeWidth="1.5" />
                    </g>
                  );
                })}
              </svg>
            </div>

            <p className="text-sm font-semibold text-slate-500 text-center leading-relaxed">
              {selectedPiece.description}
            </p>
          </div>

          {/* Right Side: Pieces Select Grid */}
          <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-150 shadow-xl space-y-6">
            <h4 className="font-extrabold text-sm text-fuchsia-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-fuchsia-50 pb-3">
              <i className="fas fa-shapes"></i> Catálogo SOMA
            </h4>

            <div className="flex flex-col gap-3">
              {somaPieces.map(piece => (
                <button
                  key={piece.id}
                  onClick={() => { playSound('pop'); setSelectedPieceId(piece.id); }}
                  className={`p-4 rounded-2xl border text-left font-semibold text-xs transition-all cursor-pointer flex items-center justify-between ${
                    selectedPieceId === piece.id 
                      ? 'bg-fuchsia-50 border-fuchsia-300 text-fuchsia-900 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-700 hover:border-fuchsia-250 hover:bg-fuchsia-50/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: piece.color }}></span>
                    <h5 className="font-bold">{piece.name}</h5>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {piece.unitCubes} cubos
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'puzzle' && (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-150 shadow-xl space-y-8 animate-fadeIn">
          {puzzleStep === 1 ? (
            <div className="space-y-6">
              <div className="p-5 border border-fuchsia-100 bg-fuchsia-50/50 rounded-2xl text-xs font-semibold leading-relaxed text-fuchsia-950">
                🚀 <strong>Reto de Iniciación SOMA:</strong> El gran enigma matemático del rompecabezas. Si realizamos la suma de todos los cubos unitarios que forman cada una de las 7 piezas de Soma, ¿cuántos cubos individuales tendremos en total?
              </div>

              <div className="space-y-4 max-w-sm mx-auto">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest text-center">
                  Introduce tu suma calculada:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={numUnitCubesInput}
                    onChange={(e) => setNumUnitCubesInput(e.target.value)}
                    placeholder="Total de cubos..."
                    className="w-full px-5 py-3.5 border-2 border-slate-200 focus:border-fuchsia-500 text-center rounded-xl font-bold text-lg focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleVerifyStep1}
                  className="w-full py-3.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
                >
                  VALIDAR SUMA
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="p-4 border border-indigo-100 bg-indigo-50/50 rounded-2xl text-xs font-semibold leading-relaxed text-indigo-950">
                🎉 <strong>¡Paso 2 Desbloqueado: Trivia Espacial!</strong> Resuelve las preguntas lógicas para dominar la geometría SOMA.
              </div>

              {/* Question 1 */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
                <h5 className="font-bold text-slate-800 text-sm">
                  1) ¿Quién fue el genio filósofo y matemático danés que diseñó el Cubo de Soma en 1936?
                </h5>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { key: 'A', text: 'Albert Einstein' },
                    { key: 'B', text: 'Piet Hein' },
                    { key: 'C', text: 'Isaac Newton' }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => handleVerifyTrivia(1, opt.key, 'B')}
                      className={`p-3.5 rounded-xl text-left border text-xs font-black transition-all cursor-pointer ${
                        triviaAnswers[1] === opt.key
                          ? opt.key === 'B'
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-rose-600 border-rose-600 text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              {triviaAnswers[1] === 'B' && (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
                  <h5 className="font-bold text-slate-800 text-sm">
                    2) Si unimos las 7 piezas irregularmente para formar un cubo perfecto tridimensional, ¿cuáles serán las dimensiones finales exactas del cubo (X x Y x Z)?
                  </h5>
                  <div className="grid md:grid-cols-3 gap-3">
                    {[
                      { key: 'A', text: 'Cubo de 2x2x2' },
                      { key: 'B', text: 'Cubo de 3x3x3' },
                      { key: 'C', text: 'Cubo de 4x4x4' }
                    ].map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => handleVerifyTrivia(2, opt.key, 'B')}
                        className={`p-3.5 rounded-xl text-left border text-xs font-black transition-all cursor-pointer ${
                          triviaAnswers[2] === opt.key
                            ? opt.key === 'B'
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-rose-600 border-rose-600 text-white'
                            : 'bg-white border-slate-205 text-slate-700 hover:border-indigo-400'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SomaCube;
