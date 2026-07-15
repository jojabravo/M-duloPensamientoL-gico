import React, { useState, useEffect } from 'react';
import { playSound } from '../audio';
import { StudentProfile } from '../types';
import { 
  Printer, 
  Palette, 
  Trash2, 
  ArrowLeft, 
  Compass, 
  Plus, 
  Minus, 
  Layers, 
  Sparkles,
  Award,
  BookOpen,
  Info,
  FileDown,
  X
} from 'lucide-react';

interface Props {
  student: StudentProfile;
  onClose: () => void;
}

interface Cube {
  x: number;
  y: number;
  z: number;
}

interface WorkshopFigure {
  id: number;
  name: string;
  cubes: Cube[];
}

const workshopFigures: WorkshopFigure[] = [
  {
    id: 1,
    name: "Cubo Sencillo",
    cubes: [{ x: 0, y: 0, z: 0 }]
  },
  {
    id: 2,
    name: "Dúo en Fila",
    cubes: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }]
  },
  {
    id: 3,
    name: "Trío Horizontal",
    cubes: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 }]
  },
  {
    id: 4,
    name: "Codos en L (Plano)",
    cubes: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 0, z: 0 }]
  },
  {
    id: 5,
    name: "Torre de 3 con Apoyo",
    cubes: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 2 }, { x: 0, y: 1, z: 0 }]
  },
  {
    id: 6,
    name: "Trípode Alto",
    cubes: [
      { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 2 },
      { x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: -1, y: 0, z: 0 }
    ]
  },
  {
    id: 7,
    name: "Trípode Bajo",
    cubes: [
      { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 },
      { x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: -1, y: 0, z: 0 }
    ]
  },
  {
    id: 8,
    name: "Base Plana 2x2",
    cubes: [
      { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 },
      { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }
    ]
  },
  {
    id: 9,
    name: "Mini Pirámide 3D",
    cubes: [
      { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 0, z: 0 },
      { x: 0, y: 0, z: 1 }
    ]
  },
  {
    id: 10,
    name: "Línea Escalonada",
    cubes: [
      { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 },
      { x: 0, y: 2, z: 1 }
    ]
  },
  {
    id: 11,
    name: "Muro Compacto 3x3",
    cubes: [
      { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 2 },
      { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 }, { x: 0, y: 1, z: 2 },
      { x: 0, y: 2, z: 0 }, { x: 0, y: 2, z: 1 }, { x: 0, y: 2, z: 2 }
    ]
  },
  {
    id: 12,
    name: "Bloque Sólido 2x2",
    cubes: [
      { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 1, y: 1, z: 1 }
    ]
  }
];

export const IsometricWorkshop: React.FC<Props> = ({ student, onClose }) => {
  const [activeTab, setActiveTab] = useState<'explore' | 'sandbox'>('explore');
  const [showPrintGuide, setShowPrintGuide] = useState<boolean>(false);
  const [selectedFigure, setSelectedFigure] = useState<WorkshopFigure>(workshopFigures[0]);
  const [sandboxHeights, setSandboxHeights] = useState<number[][]>([
    [1, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 0]
  ]);

  // Convert heights grid to flat list of Cubes
  const getSandboxCubes = (): Cube[] => {
    const cubes: Cube[] = [];
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        const height = sandboxHeights[x][y];
        for (let z = 0; z < height; z++) {
          cubes.push({ x, y, z });
        }
      }
    }
    return cubes;
  };

  const handleAdjustSandboxHeight = (r: number, c: number, delta: number) => {
    playSound('pop');
    setSandboxHeights(prev => {
      const copy = prev.map(row => [...row]);
      copy[r][c] = Math.max(0, Math.min(4, copy[r][c] + delta));
      return copy;
    });
  };

  const handleClearSandbox = () => {
    playSound('pop');
    setSandboxHeights([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]);
  };

  const handlePresetSandbox = (type: 'pyramid' | 'stairs' | 'castle') => {
    playSound('success');
    if (type === 'pyramid') {
      setSandboxHeights([
        [1, 1, 1, 0],
        [1, 2, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0]
      ]);
    } else if (type === 'stairs') {
      setSandboxHeights([
        [3, 2, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]);
    } else {
      setSandboxHeights([
        [2, 0, 0, 2],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [2, 0, 0, 2]
      ]);
    }
  };

  const triggerPrint = () => {
    playSound('success');
    setShowPrintGuide(true);
  };

  const executePrint = () => {
    setShowPrintGuide(false);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Helper to draw isometric cubes inside any SVG element
  const renderCubesSVG = (
    cubes: Cube[], 
    viewBoxSize: number = 220, 
    customSize: number = 14, 
    style: 'textbook' | 'colorful' = 'textbook'
  ) => {
    if (cubes.length === 0) {
      return (
        <text x={viewBoxSize / 2} y={viewBoxSize / 2} textAnchor="middle" className="text-[10px] fill-slate-400 font-bold uppercase tracking-wider">
          Haz clic en la cuadrícula para construir
        </text>
      );
    }

    // Determine bounds
    const maxX = Math.max(...cubes.map(c => c.x), 1);
    const maxY = Math.max(...cubes.map(c => c.y), 1);
    const maxZ = Math.max(...cubes.map(c => c.z), 1);

    const size = customSize;
    const originX = viewBoxSize / 2;
    // Lower origin slightly based on dimensions
    const originY = viewBoxSize / 2 + 10;

    // Sorting to draw back-to-front correctly in isometric space
    const sorted = [...cubes].sort((a, b) => {
      if (a.z !== b.z) return a.z - b.z; // Bottom to top
      const distA = a.x + a.y;
      const distB = b.x + b.y;
      return distB - distA; // Back to front
    });

    return (
      <>
        {/* Underlay isometric dots */}
        {(() => {
          const dots = [];
          for (let gX = -3; gX <= maxX + 3; gX++) {
            for (let gY = -3; gY <= maxY + 3; gY++) {
              const dotX = originX + (gY - gX) * size * 0.61;
              const dotY = originY + (gX + gY) * size * 0.35;
              if (dotX >= 5 && dotX <= viewBoxSize - 5 && dotY >= 5 && dotY <= viewBoxSize - 5) {
                dots.push(
                  <circle
                    key={`dot-${gX}-${gY}`}
                    cx={dotX}
                    cy={dotY}
                    r="1"
                    fill="#334155"
                    opacity="0.25"
                  />
                );
              }
            }
          }
          return <g>{dots}</g>;
        })()}

        {/* Cubes */}
        {sorted.map((c, idx) => {
          const sx = originX + (c.y - c.x) * size * 1.22;
          const sy = originY + (c.x + c.y) * size * 0.7 - c.z * size * 1.4;

          const topFace = `${sx},${sy - size * 1.4} ${sx + size * 1.22},${sy - size * 0.7} ${sx},${sy} ${sx - size * 1.22},${sy - size * 0.7}`;
          const leftFace = `${sx - size * 1.22},${sy - size * 0.7} ${sx},${sy} ${sx},${sy + size * 1.4} ${sx - size * 1.22},${sy + size * 0.7}`;
          const rightFace = `${sx},${sy} ${sx + size * 1.22},${sy - size * 0.7} ${sx + size * 1.22},${sy + size * 0.7} ${sx},${sy + size * 1.4}`;

          let topFill = '#ffffff';
          let leftFill = '#fcfcfc';
          let rightFill = '#e5e5e5'; // textbook shadow
          let strokeColor = '#111827';
          let strokeWidth = 1.5;

          if (style === 'colorful') {
            const hue = (c.x * 40 + c.y * 60 + c.z * 80) % 360;
            topFill = `hsl(${hue}, 80%, 85%)`;
            leftFill = `hsl(${hue}, 70%, 75%)`;
            rightFill = `hsl(${hue}, 60%, 60%)`;
            strokeColor = `hsl(${hue}, 80%, 25%)`;
            strokeWidth = 1.2;
          }

          return (
            <g key={idx}>
              <polygon points={leftFace} fill={leftFill} stroke={strokeColor} strokeWidth={strokeWidth} />
              <polygon points={rightFace} fill={rightFill} stroke={strokeColor} strokeWidth={strokeWidth} />
              <polygon points={topFace} fill={topFill} stroke={strokeColor} strokeWidth={strokeWidth} />
            </g>
          );
        })}
      </>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
      
      {/* SCREEN VIEWER (HIDDEN IN PRINT) */}
      <div className="print:hidden space-y-8">
        
        {/* Header Block */}
        <div className="bg-white rounded-[3rem] shadow-xl border-4 border-amber-50 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl rotate-12 pointer-events-none">
              <i className="fas fa-palette"></i>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <button
                  onClick={onClose}
                  className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/20 px-4 py-1.5 rounded-full mb-1.5 inline-block">
                    Laboratorio Creativo • Taller Técnico
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
                    Dibujo Isométrico en Red de Puntos
                  </h3>
                </div>
              </div>

              <button
                onClick={triggerPrint}
                className="px-6 py-3.5 bg-white hover:bg-amber-50 text-orange-600 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Printer className="w-4 h-4" />
                Imprimir Taller Físico
              </button>
            </div>
          </div>

          <div className="p-6 bg-amber-50/30 border-b border-amber-100 flex items-center gap-4 text-xs font-semibold text-slate-700 leading-relaxed">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 font-bold shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <p>
              ¡Excelente técnica! Esta actividad digital está conectada a una <strong>Ficha de Trabajo Imprimible</strong>. Puedes explorar las 12 figuras diseñadas en tu libro de texto, construir tus propias estructuras en el lienzo 3D, y luego imprimir una plantilla perfecta con tu red de puntos isométrica para dibujar en papel y compartir con tu profesor.
            </p>
          </div>
        </div>

        {/* View Selection Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md mx-auto shadow-sm">
          <button
            onClick={() => { playSound('pop'); setActiveTab('explore'); }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'explore' 
                ? 'bg-white text-orange-600 shadow-md' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Figuras del Taller
          </button>
          <button
            onClick={() => { playSound('pop'); setActiveTab('sandbox'); }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'sandbox' 
                ? 'bg-white text-orange-600 shadow-md' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            Lienzo Libre (Lego)
          </button>
        </div>

        {/* VIEW 1: EXPLORER AND REFERENCE CARDS */}
        {activeTab === 'explore' && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: 12 Figures Grid */}
            <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-150 shadow-lg space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h4 className="font-extrabold text-base text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-500" />
                  Galería de Construcciones Isométricas
                </h4>
                <span className="text-[10px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                  12 Diseños Oficiales
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {workshopFigures.map((fig) => {
                  const isSelected = selectedFigure.id === fig.id;
                  return (
                    <button
                      key={fig.id}
                      onClick={() => {
                        playSound('pop');
                        setSelectedFigure(fig);
                      }}
                      className={`group p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-between gap-3 text-center cursor-pointer ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-50/30 shadow-md' 
                          : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      {/* Isometric Mini Preview */}
                      <div className="w-24 h-24 flex items-center justify-center bg-white rounded-2xl border border-slate-100 overflow-hidden group-hover:scale-105 transition-transform">
                        <svg viewBox="0 0 140 140" className="w-full h-full">
                          {renderCubesSVG(fig.cubes, 140, 11, 'textbook')}
                        </svg>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-amber-600 block uppercase tracking-wider">
                          Figura {fig.id}
                        </span>
                        <span className="text-[11px] font-black text-slate-700 group-hover:text-amber-600 transition-colors line-clamp-1">
                          {fig.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Dynamic Inspector */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-150 shadow-lg flex flex-col items-center text-center space-y-6">
                <div className="w-full">
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                    Análisis de Estructura {selectedFigure.id}
                  </span>
                  <h4 className="font-black text-xl text-slate-800 uppercase mt-3 mb-1">
                    {selectedFigure.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-bold uppercase">
                    Total Cubos en Columna: {selectedFigure.cubes.length} {selectedFigure.cubes.length === 1 ? 'Cubo' : 'Cubos'}
                  </p>
                </div>

                {/* Big Beautiful Preview with Grid Underlay */}
                <div className="w-full max-w-xs aspect-square bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
                  <svg viewBox="0 0 200 200" className="w-full h-full font-sans transition-transform hover:scale-105 duration-300">
                    {renderCubesSVG(selectedFigure.cubes, 200, 16, 'textbook')}
                  </svg>
                </div>

                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 text-left text-[11px] text-slate-600 leading-relaxed font-semibold">
                  <div className="flex gap-2 items-start text-amber-700 font-black uppercase tracking-wider text-[10px] mb-1.5">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Recomendación de Trazo:</span>
                  </div>
                  Para dibujar esta figura en tu papel, comienza marcando los puntos del cubo que está más abajo y al fondo, y luego avanza capa por capa (hacia el frente y arriba) uniendo los puntos con líneas rectas limpias.
                </div>

                <button
                  onClick={triggerPrint}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir esta Guía y Red de Dibujo
                </button>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: INTERACTIVE SANDBOX PLAYGROUND */}
        {activeTab === 'sandbox' && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Height matrix controls */}
            <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-150 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div>
                  <h4 className="font-extrabold text-base text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <Palette className="w-5 h-5 text-amber-500" />
                    Matriz de Alturas 2D (Base 4x4)
                  </h4>
                  <p className="text-[11px] text-slate-400 font-bold uppercase mt-1">
                    Ajusta los niveles para esculpir en 3D
                  </p>
                </div>

                <button
                  onClick={handleClearSandbox}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer text-slate-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Vaciar Matriz
                </button>
              </div>

              {/* Grid cell buttons with levels */}
              <div className="grid grid-cols-4 gap-3 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                {sandboxHeights.map((row, rIdx) => 
                  row.map((val, cIdx) => (
                    <div 
                      key={`${rIdx}-${cIdx}`}
                      className={`aspect-square rounded-2xl p-2 border flex flex-col justify-between items-center transition-all ${
                        val > 0 
                          ? 'bg-amber-50 border-amber-300 shadow-sm' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[9px] font-black text-slate-400 uppercase">
                        X{rIdx}, Y{cIdx}
                      </span>
                      
                      <span className={`text-xl font-black ${val > 0 ? 'text-amber-600 scale-110' : 'text-slate-300'} transition-all`}>
                        {val}
                      </span>

                      <div className="flex gap-1 w-full mt-1.5">
                        <button
                          onClick={() => handleAdjustSandboxHeight(rIdx, cIdx, -1)}
                          disabled={val === 0}
                          className="flex-1 py-1 bg-white hover:bg-slate-100 disabled:opacity-30 border border-slate-200 rounded-lg flex items-center justify-center transition-all cursor-pointer text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleAdjustSandboxHeight(rIdx, cIdx, 1)}
                          disabled={val === 4}
                          className="flex-1 py-1 bg-white hover:bg-slate-100 disabled:opacity-30 border border-slate-200 rounded-lg flex items-center justify-center transition-all cursor-pointer text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Presets and template triggers */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Plantillas de Construcción Rápida
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handlePresetSandbox('pyramid')}
                    className="px-4 py-2 bg-slate-50 border border-slate-150 hover:bg-amber-50 hover:border-amber-200 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    🗻 Pirámide Escalonada
                  </button>
                  <button
                    onClick={() => handlePresetSandbox('stairs')}
                    className="px-4 py-2 bg-slate-50 border border-slate-150 hover:bg-amber-50 hover:border-amber-200 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    📶 Escalera Gigante
                  </button>
                  <button
                    onClick={() => handlePresetSandbox('castle')}
                    className="px-4 py-2 bg-slate-50 border border-slate-150 hover:bg-amber-50 hover:border-amber-200 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    🏰 Castillo de Cuatro Torres
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Isometric render preview */}
            <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-150 shadow-lg flex flex-col items-center text-center space-y-6">
              <div className="w-full">
                <span className="text-[10px] bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                  Visualizador Isométrico en Tiempo Real
                </span>
                <h4 className="font-black text-lg text-slate-800 uppercase mt-3 mb-1">
                  Tu Estructura Tridimensional
                </h4>
                <p className="text-xs text-slate-400 font-bold uppercase">
                  Cantidad total de cubos: {getSandboxCubes().length}
                </p>
              </div>

              {/* Canvas renderer */}
              <div className="w-full aspect-square bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
                <svg viewBox="0 0 240 240" className="w-full h-full font-sans">
                  {renderCubesSVG(getSandboxCubes(), 240, 16, 'colorful')}
                </svg>
              </div>

              <div className="text-left text-[11px] text-slate-500 leading-relaxed font-semibold bg-slate-50 p-4 rounded-2xl border border-slate-150 w-full space-y-2">
                <p>
                  Esta estructura interactiva se proyecta en una <strong>red isométrica tridimensional</strong>. ¡Cada cubo de color que agregas se dibuja de forma automática con profundidad espacial! Puedes usarla para idear tus propios retos y luego dibujarlos a lápiz en tu guía impresa.
                </p>
                <p className="border-t border-slate-200/60 pt-2 text-slate-600">
                  <span className="text-amber-600 font-extrabold uppercase text-[9px] tracking-wider block mb-1">
                    ⚠️ Regla de Gravedad e Isométricos:
                  </span>
                  No puede quedar un cubo en el nivel 2 sin tener uno debajo en el nivel 1; de igual manera, para el nivel o piso 3, debe tener dos cubos de soporte debajo en la misma columna. La matriz de alturas previene esto de forma natural al apilar los bloques verticalmente.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>

      {showPrintGuide && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in print:hidden">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 relative space-y-6 animate-scale-up">
            <button
              onClick={() => { playSound('pop'); setShowPrintGuide(false); }}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
                <Printer className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Preparando PDF para Impresión
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Para que tu guía con los 12 retos isométricos se guarde de forma óptima a tamaño <strong>Carta Estándar (Letter)</strong>, por favor verifica estos ajustes en la ventana de impresión:
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-150 text-left">
              <div className="flex gap-3 items-start text-xs font-semibold text-slate-700 leading-normal">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                <div>
                  <p className="font-bold text-slate-900">Destino / Impresora:</p>
                  <p className="text-slate-500">Selecciona <strong className="text-indigo-600">"Guardar como PDF"</strong> o "Save as PDF".</p>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs font-semibold text-slate-700 leading-normal border-t border-slate-200/60 pt-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                <div>
                  <p className="font-bold text-slate-900">Tamaño de Papel:</p>
                  <p className="text-slate-500">Selecciona <strong className="text-indigo-600">Carta / Letter</strong> (8.5" x 11") para un ajuste perfecto sin desborde.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs font-semibold text-slate-700 leading-normal border-t border-slate-200/60 pt-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                <div>
                  <p className="font-bold text-slate-900">Gráficos de Fondo (Requerido):</p>
                  <p className="text-slate-500">
                    Marca la opción <strong className="text-indigo-600">"Gráficos de fondo"</strong> (Background graphics) en "Más Ajustes" para que aparezcan la red de puntos y los cubos.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start text-xs font-semibold text-slate-700 leading-normal border-t border-slate-200/60 pt-3">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
                <div>
                  <p className="font-bold text-slate-900">Márgenes y Escala:</p>
                  <p className="text-slate-500">Márgenes en <strong className="text-indigo-600">"Ninguno"</strong> o "Predeterminados" y Escala al <strong className="text-indigo-600">100%</strong>.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { playSound('pop'); setShowPrintGuide(false); }}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                onClick={() => { playSound('success'); executePrint(); }}
                className="flex-[2] py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Descargar Ficha PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY WORKVIEW: PERFECT FOR SCHOOL PRINTING AND A4 PAPER SHARING */}
      <div className="hidden print:block text-slate-900 font-sans p-2">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background-color: white !important;
              color: black !important;
              font-family: 'Inter', sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print\\:block {
              display: block !important;
            }
            @page {
              size: letter portrait;
              margin: 0.6cm 0.8cm;
            }
          }
        `}} />

        {/* School Document Header */}
        <div className="border-b border-slate-950 pb-2 mb-3 text-left">
          <h1 className="text-xl font-black uppercase tracking-wide text-slate-950 text-center mb-1">
            INSTITUCIÓN EDUCATIVA JOSEFA CAMPOS
          </h1>
          <div className="space-y-0.5 text-[10px] text-slate-950 font-bold">
            <div>Asignatura: Pensamiento lógico.</div>
            <div>Dibujando Isométricos.</div>
            <div>docente: Jorge Armando Jaramillo Bravo.</div>
            <div className="flex items-end gap-1.5 pt-1">
              <span>Estudiante/</span>
              <div className="flex-grow border-b border-slate-950 h-3"></div>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-1">
              <div className="flex items-end gap-1.5">
                <span>Grado:</span>
                <div className="flex-grow border-b border-slate-950 h-3"></div>
              </div>
              <div className="flex items-end gap-1.5">
                <span>Fecha:</span>
                <div className="flex-grow border-b border-slate-950 h-3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid & Figures Section aligned exactly like the photograph */}
        <div className="flex gap-4 items-start">
          
          {/* Left Side: Dense Dot Grid & its 4 bottom-left figures */}
          <div className="w-[58%] flex flex-col gap-3">
            <div className="border border-slate-350 p-2.5 bg-white relative">
              <svg viewBox="0 0 320 380" className="w-full h-auto">
                {(() => {
                  const printDots = [];
                  const size = 11.2;
                  const originX = 160;
                  const originY = 15;

                  for (let gX = -15; gX <= 22; gX++) {
                    for (let gY = -15; gY <= 22; gY++) {
                      const dotX = originX + (gY - gX) * size * 0.61;
                      const dotY = originY + (gX + gY) * size * 0.35;

                      if (dotX >= 6 && dotX <= 314 && dotY >= 6 && dotY <= 374) {
                        printDots.push(
                          <circle
                            key={`p-dot-${gX}-${gY}`}
                            cx={dotX}
                            cy={dotY}
                            r="1.4"
                            fill="#000000"
                          />
                        );
                      }
                    }
                  }
                  return <g>{printDots}</g>;
                })()}
              </svg>
            </div>

            {/* 4 Bottom Figures under the dot grid (Figures 7, 8, 9, 10) */}
            <div className="grid grid-cols-4 gap-1.5">
              {[6, 7, 8, 9].map((idx) => {
                const fig = workshopFigures[idx];
                return (
                  <div key={fig.id} className="border border-slate-300 rounded-lg p-1 bg-white flex flex-col items-center justify-between text-center h-[100px]">
                    <div className="w-full h-[72px] flex items-center justify-center overflow-hidden">
                      <svg viewBox="0 0 110 90" className="w-full h-full">
                        {renderCubesSVG(fig.cubes, 110, 8.5, 'textbook')}
                      </svg>
                    </div>
                    <span className="text-[6.5px] font-black text-slate-800 uppercase leading-none pb-0.5">
                      Reto {fig.id}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: 6 Top Figures and 2 Bottom Figures */}
          <div className="w-[42%] flex flex-col gap-3">
            
            {/* 6 Figures (Figures 1, 2, 3, 4, 5, 6) in 3 rows of 2 */}
            <div className="grid grid-cols-2 gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const fig = workshopFigures[idx];
                return (
                  <div key={fig.id} className="border border-slate-300 rounded-lg p-1 bg-white flex flex-col items-center justify-between text-center h-[100px]">
                    <div className="w-full h-[72px] flex items-center justify-center overflow-hidden">
                      <svg viewBox="0 0 110 90" className="w-full h-full">
                        {renderCubesSVG(fig.cubes, 110, 8.5, 'textbook')}
                      </svg>
                    </div>
                    <span className="text-[6.5px] font-black text-slate-800 uppercase leading-none pb-0.5">
                      Reto {fig.id}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 2 Bottom Figures (Figures 11, 12) */}
            <div className="grid grid-cols-2 gap-1.5">
              {[10, 11].map((idx) => {
                const fig = workshopFigures[idx];
                return (
                  <div key={fig.id} className="border border-slate-300 rounded-lg p-1 bg-white flex flex-col items-center justify-between text-center h-[100px]">
                    <div className="w-full h-[72px] flex items-center justify-center overflow-hidden">
                      <svg viewBox="0 0 110 90" className="w-full h-full">
                        {renderCubesSVG(fig.cubes, 110, 8.5, 'textbook')}
                      </svg>
                    </div>
                    <span className="text-[6.5px] font-black text-slate-800 uppercase leading-none pb-0.5">
                      Reto {fig.id}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
