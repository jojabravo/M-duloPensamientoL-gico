import React, { useState } from 'react';
import { playSound } from '../audio';
import { StudentProfile } from '../types';
import { 
  RotateCw, 
  CheckCircle2, 
  ArrowLeft, 
  Image as ImageIcon, 
  Sparkles, 
  Undo2, 
  Trash2, 
  Compass,
  Lock,
  ExternalLink,
  Award,
  HelpCircle,
  Eye,
  RefreshCw,
  Printer,
  Scissors,
  FileText,
  Layers
} from 'lucide-react';

interface Props {
  student: StudentProfile;
  onBack: () => void;
  onComplete: (column: string, newProg: number) => void;
}

interface TargetSlot {
  id: number;
  cx: number;
  cy: number;
  // A list of allowed [rotation, flipped] states that will fit perfectly in this slot
  validOrientations: [number, boolean][]; 
}

interface Level {
  id: number;
  name: string;
  desc: string;
  shapePoints: [number, number][]; // Points centered at [0,0]
  targetSlots: TargetSlot[];
  colorTheme: string;
  shapeName: string;
  scale: number; // visual scale of the piece
}

const LEVELS: Level[] = [
  {
    id: 1,
    name: 'Mosaico 1: El Trapecio Isósceles',
    desc: 'Un trapecio hecho de 3 triángulos equiláteros. Rota y refleja las piezas para formar un hexágono cerrado perfecto de 6 piezas.',
    shapeName: 'Trapecio',
    scale: 0.9,
    shapePoints: [
      [-40, -15],
      [40, -15],
      [20, 15],
      [-20, 15]
    ],
    targetSlots: [
      { id: 1, cx: 200, cy: 135, validOrientations: [[0, false], [0, true]] },
      { id: 2, cx: 256, cy: 167, validOrientations: [[120, false], [120, true]] },
      { id: 3, cx: 256, cy: 233, validOrientations: [[240, false], [240, true]] },
      { id: 4, cx: 200, cy: 265, validOrientations: [[180, false], [180, true]] },
      { id: 5, cx: 144, cy: 233, validOrientations: [[300, false], [300, true]] },
      { id: 6, cx: 144, cy: 167, validOrientations: [[60, false], [60, true]] }
    ],
    colorTheme: 'from-blue-500 to-indigo-600'
  },
  {
    id: 2,
    name: 'Mosaico 2: La Cometa de Polypad',
    desc: 'Un hermoso cuadrilátero asimétrico (deltoide). Alinéalos en rotaciones de 45° para completar la estrella geométrica de 8 puntas.',
    shapeName: 'Cometa',
    scale: 1,
    shapePoints: [
      [0, -45],
      [22, -15],
      [0, 45],
      [-22, -15]
    ],
    targetSlots: [
      { id: 1, cx: 200, cy: 130, validOrientations: [[0, false], [0, true]] },
      { id: 2, cx: 249, cy: 151, validOrientations: [[45, false], [45, true]] },
      { id: 3, cx: 270, cy: 200, validOrientations: [[90, false], [90, true]] },
      { id: 4, cx: 249, cy: 249, validOrientations: [[135, false], [135, true]] },
      { id: 5, cx: 200, cy: 270, validOrientations: [[180, false], [180, true]] },
      { id: 6, cx: 151, cy: 249, validOrientations: [[225, false], [225, true]] },
      { id: 7, cx: 130, cy: 200, validOrientations: [[270, false], [270, true]] },
      { id: 8, cx: 151, cy: 151, validOrientations: [[315, false], [315, true]] }
    ],
    colorTheme: 'from-emerald-500 to-teal-600'
  },
  {
    id: 3,
    name: 'Mosaico 3: El Bloque Cairo',
    desc: 'El famoso pentágono equilátero del Cairo. Rota las baldosas en incrementos de 90° para formar un núcleo entrelazado de 4 pentágonos.',
    shapeName: 'Pentágono Cairo',
    scale: 0.95,
    shapePoints: [
      [0, -35],
      [35, -10],
      [22, 35],
      [-22, 35],
      [-35, -10]
    ],
    targetSlots: [
      { id: 1, cx: 165, cy: 165, validOrientations: [[0, false], [0, true]] },
      { id: 2, cx: 235, cy: 165, validOrientations: [[90, false], [90, true]] },
      { id: 3, cx: 235, cy: 235, validOrientations: [[180, false], [180, true]] },
      { id: 4, cx: 165, cy: 235, validOrientations: [[270, false], [270, true]] }
    ],
    colorTheme: 'from-amber-500 to-orange-600'
  },
  {
    id: 4,
    name: 'Mosaico 4: Teselación de El Cairo Completa',
    desc: 'Un arreglo más complejo y elegante de la teselación de El Cairo. Requiere 8 pentágonos con orientaciones horizontales, verticales y reflejadas.',
    shapeName: 'Pentágono Cairo',
    scale: 0.9,
    shapePoints: [
      [0, -35],
      [35, -10],
      [22, 35],
      [-22, 35],
      [-35, -10]
    ],
    targetSlots: [
      { id: 1, cx: 165, cy: 165, validOrientations: [[0, false], [0, true]] },
      { id: 2, cx: 235, cy: 165, validOrientations: [[90, false], [90, true]] },
      { id: 3, cx: 235, cy: 235, validOrientations: [[180, false], [180, true]] },
      { id: 4, cx: 165, cy: 235, validOrientations: [[270, false], [270, true]] },
      // Outer matching crown
      { id: 5, cx: 95, cy: 165, validOrientations: [[180, false], [180, true]] },
      { id: 6, cx: 305, cy: 165, validOrientations: [[270, false], [270, true]] },
      { id: 7, cx: 305, cy: 235, validOrientations: [[0, false], [0, true]] },
      { id: 8, cx: 95, cy: 235, validOrientations: [[90, false], [90, true]] }
    ],
    colorTheme: 'from-pink-500 to-rose-600'
  },
  {
    id: 5,
    name: 'Mosaico 5: El Sombrero de Einstein',
    desc: '¡El primer monotilo aperiódico de la historia! Un único sombrero que cubre el plano sin repetirse. Ubica los 5 sombreros teniendo en cuenta que la última pieza requiere simetría (reflejo).',
    shapeName: 'Sombrero de Einstein',
    scale: 0.75,
    shapePoints: [
      [0, -40],
      [15, -35],
      [25, -15],
      [45, -10],
      [35, 15],
      [10, 15],
      [0, 35],
      [-15, 30],
      [-25, 10],
      [-45, 10],
      [-35, -15],
      [-15, -15],
      [-10, -35]
    ],
    targetSlots: [
      { id: 1, cx: 150, cy: 140, validOrientations: [[0, false]] },
      { id: 2, cx: 240, cy: 140, validOrientations: [[120, false]] },
      { id: 3, cx: 150, cy: 240, validOrientations: [[240, false]] },
      { id: 4, cx: 240, cy: 240, validOrientations: [[60, false]] },
      { id: 5, cx: 200, cy: 190, validOrientations: [[180, true]] } // Reflected Hat (The "T-shirt")
    ],
    colorTheme: 'from-purple-600 to-fuchsia-700'
  }
];

const NATURE_IMAGES = [
  {
    title: 'Panales de Abejas',
    subtitle: 'Hexágonos Eficientes',
    desc: 'Las abejas construyen celdas de forma hexagonal perfecta. Es la estructura geométrica más eficiente para almacenar miel usando el mínimo de cera.',
    url: 'https://i.postimg.cc/PPCLnjnx/panel.jpg',
    credit: 'Tomada de: https://es.mathigon.org/course/polyhedra/tessellations'
  },
  {
    title: 'Piel de Serpiente',
    subtitle: 'Protección e Hidrodinámica',
    desc: 'Las escamas de las serpientes forman una teselación romboidal continua que les otorga una increíble flexibilidad muscular y protección física.',
    url: 'https://i.postimg.cc/qzNtHTHz/serpiente.jpg',
    credit: 'Tomada de: https://es.mathigon.org/course/polyhedra/tessellations'
  },
  {
    title: 'Estructura Celular de las Hojas',
    subtitle: 'Geometría del Transporte',
    desc: 'Las células vegetales se agrupan en redes de polígonos cerrados que recubren la hoja por completo, optimizando el transporte de nutrientes.',
    url: 'https://i.postimg.cc/hfXJRBRG/hojas.jpg',
    credit: 'Tomada de: https://es.mathigon.org/course/polyhedra/tessellations'
  },
  {
    title: 'Columnas de Basalto',
    subtitle: 'Prismas Volcánicos',
    desc: 'La Calzada del Gigante muestra cómo la lava, al enfriarse lentamente, se contrae de forma natural formando columnas geométricas prismáticas hexagonales.',
    url: 'https://i.postimg.cc/RNW3xBxZ/basalto.jpg',
    credit: 'Tomada de: https://es.mathigon.org/course/polyhedra/tessellations'
  },
  {
    title: 'Piel de Piña',
    subtitle: 'Sucesión y Espirales',
    desc: 'Las escamas de la piña están ordenadas en espirales perfectas siguiendo la sucesión de Fibonacci, cubriendo la fruta sin espacios vacíos.',
    url: 'https://i.postimg.cc/gnxwbWbj/pina.jpg',
    credit: 'Tomada de: https://es.mathigon.org/course/polyhedra/tessellations'
  },
  {
    title: 'Caparazón de Tortuga',
    subtitle: 'Escudos Poligonales',
    desc: 'El caparazón es una sólida estructura ósea compuesta por placas poligonales fusionadas que crecen simétricamente para proteger el cuerpo.',
    url: 'https://i.postimg.cc/xcBX049Y/tortuga.jpg',
    credit: 'Tomada de: https://i.pinimg.com/736x/7d/4d/39/7d4d39e2f8ca0d03946eea4d634a4132.jpg'
  },
  {
    title: 'Lodo Seco Agrietado',
    subtitle: 'Teselas de Deshidratación',
    desc: 'Cuando el lodo húmedo se seca bajo el sol, la pérdida de humedad genera grietas en polígonos regulares que cubren perfectamente el suelo.',
    url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=600&q=80',
    credit: 'Tomada de: https://stockcake.com/es/i/cracked-mud-texture_1062452_812812'
  }
];

export interface PentagonType {
  id: number;
  name: string;
  desc: string;
  points: [number, number][];
  color: string;
}

export const PENTAGON_TYPES: PentagonType[] = [
  { id: 1, name: 'Tipo 1 (Reinhardt, 1918)', desc: 'Ángulos paralelos: B + C = 180°, D + E = 180°. Admite infinitas variaciones.', points: [[0, -30], [30, -10], [20, 30], [-20, 30], [-30, -10]], color: '#10b981' },
  { id: 2, name: 'Tipo 2 (Reinhardt, 1918)', desc: 'Ángulos acoplados: A + B + D = 360°, lados a = d. Contiene la teselación del Cairo.', points: [[0, -35], [35, -10], [22, 35], [-22, 35], [-35, -10]], color: '#3b82f6' },
  { id: 3, name: 'Tipo 3 (Reinhardt, 1918)', desc: 'Ángulos fijos: A = C = D = 120°, lados e = a + c, d = b + c.', points: [[0, -35], [30, -15], [30, 20], [-25, 30], [-25, -15]], color: '#f59e0b' },
  { id: 4, name: 'Tipo 4 (Reinhardt, 1918)', desc: 'Ángulos ortogonales: A = C = 90°, lados a = b, c = d = e. Forma tipo "casita".', points: [[0, -40], [30, -10], [30, 30], [-30, 30], [-30, -10]], color: '#ec4899' },
  { id: 5, name: 'Tipo 5 (Reinhardt, 1918)', desc: 'Ángulos asimétricos: A = 60°, C = 120°, lados a = b, d = e.', points: [[0, -35], [40, -15], [20, 35], [-20, 20], [-30, -15]], color: '#8b5cf6' },
  { id: 6, name: 'Tipo 6 (Kershner, 1968)', desc: 'Ángulos fijos: A + B + D = 360°, lados a = b = c = d = e.', points: [[10, -35], [35, -5], [15, 35], [-25, 20], [-20, -20]], color: '#06b6d4' },
  { id: 7, name: 'Tipo 7 (Kershner, 1968)', desc: 'Ángulos acoplados: 2B + C = 360°, 2D + A = 360°, todos los lados iguales.', points: [[5, -40], [30, -10], [25, 30], [-15, 35], [-30, 0]], color: '#14b8a6' },
  { id: 8, name: 'Tipo 8 (Kershner, 1968)', desc: 'Ángulos acoplados: 2A + B = 360°, 2D + C = 360°, todos los lados iguales.', points: [[0, -35], [35, -15], [20, 30], [-20, 30], [-35, -5]], color: '#f97316' },
  { id: 9, name: 'Tipo 9 (Marjorie Rice, 1976)', desc: 'Descubierto por Marjorie Rice. 2A + C = 360°, lados iguales.', points: [[0, -35], [30, -20], [35, 15], [-15, 35], [-30, 5]], color: '#d946ef' },
  { id: 10, name: 'Tipo 10 (James, 1975)', desc: 'Descubierto por Richard James. A = 90°, B + C = 180°, etc.', points: [[0, -35], [30, -10], [15, 30], [-20, 25], [-25, -20]], color: '#6366f1' },
  { id: 11, name: 'Tipo 11 (Marjorie Rice, 1977)', desc: 'Descubierto por Marjorie Rice. A = 90°, B + C = 180°, d = e = a + b.', points: [[0, -35], [35, -15], [15, 30], [-15, 30], [-30, -15]], color: '#a855f7' },
  { id: 12, name: 'Tipo 12 (Marjorie Rice, 1977)', desc: 'Descubierto por Marjorie Rice. A = 90°, A + B + D = 360°, e = a + b.', points: [[0, -35], [30, -20], [25, 25], [-15, 35], [-35, 5]], color: '#0ea5e9' },
  { id: 13, name: 'Tipo 13 (Marjorie Rice, 1977)', desc: 'Descubierto por Marjorie Rice. A = 90°, e = a + b, b = c = d.', points: [[0, -35], [25, -20], [30, 20], [-10, 35], [-30, 10]], color: '#e11d48' },
  { id: 14, name: 'Tipo 14 (Stein, 1985)', desc: 'Descubierto por Rolf Stein. Proporciones y ángulos fijos exactos.', points: [[5, -35], [35, -10], [20, 25], [-15, 30], [-25, -15]], color: '#475569' },
  { id: 15, name: 'Tipo 15 (Mann et al., 2015)', desc: 'Descubierto mediante búsqueda por computadora en la Univ. de Washington.', points: [[0, -35], [35, -15], [15, 25], [-15, 30], [-30, -5]], color: '#22c55e' }
];

export interface PrintableChallenge {
  id: number;
  name: string;
  desc: string;
  materials: string;
  spaceToCover: string;
  piecesCount: string;
  piecesCountNum: number;
  difficulty: 'Fácil' | 'Medio' | 'Difícil' | 'Experto';
  difficultyColor: string;
  shapePoints: [number, number][];
  shapeScale: number;
  printScaleText: string;
  instructionStep: string;
}

export const PRINT_CHALLENGES: PrintableChallenge[] = [
  {
    id: 1,
    name: 'Desafío 1: El Cairo Pentagonal',
    desc: 'Usa pentágonos equiláteros para formar una red tejida de El Cairo continua sin dejar espacios vacíos.',
    materials: 'Tijeras de papel, lápices de colores o marcadores, pegamento de barra.',
    spaceToCover: 'Un rectángulo delimitado de exactamente 24 cm x 18 cm.',
    piecesCount: '16 piezas de Pentágono de El Cairo',
    piecesCountNum: 16,
    difficulty: 'Medio',
    difficultyColor: 'bg-amber-100 text-amber-800 border-amber-200',
    shapePoints: [
      [0, -32],
      [32, -9],
      [20, 32],
      [-20, 32],
      [-32, -9]
    ],
    shapeScale: 1.1,
    printScaleText: 'Satisface las simetrías duales de El Cairo',
    instructionStep: 'Imprime la plantilla. Colorea las 16 fichas del Cairo alternando dos colores. Recórtalas con precisión por la línea punteada (✂️) y ordénalas dentro del marco para cubrirlo completamente.'
  },
  {
    id: 2,
    name: 'Desafío 2: Flor del Trapecio Isósceles',
    desc: 'Agrupa trapecios idénticos para cubrir la superficie de un hexágono gigante.',
    materials: 'Tijeras, lápices de colores (colorea de 6 en 6 con patrones únicos), regla.',
    spaceToCover: 'Hexágono regular regular inscrito de 20 cm de diámetro.',
    piecesCount: '24 piezas de Trapecio Isósceles',
    piecesCountNum: 24,
    difficulty: 'Fácil',
    difficultyColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    shapePoints: [
      [-40, -15],
      [40, -15],
      [20, 15],
      [-20, 15]
    ],
    shapeScale: 1.1,
    printScaleText: 'Aproximadamente 4.5 cm de base larga',
    instructionStep: 'Recorta las 24 piezas de trapecio. Agrúpalas de 6 en 6 en forma de flor hexagonal. Al unirlas, cubrirán perfectamente el hexágono delimitado superior sin solaparse.'
  },
  {
    id: 3,
    name: 'Desafío 3: La Estrella de la Cometa',
    desc: 'Alinea deltoides asimétricos (cometas) para completar una gran corona estrellada de 8 puntas.',
    materials: 'Tijeras, cartulina o papel, pegamento en barra.',
    spaceToCover: 'Círculo delimitado de 15 cm de radio.',
    piecesCount: '16 cometas geométricas de Polypad',
    piecesCountNum: 16,
    difficulty: 'Difícil',
    difficultyColor: 'bg-rose-100 text-rose-800 border-rose-200',
    shapePoints: [
      [0, -45],
      [22, -15],
      [0, 45],
      [-22, -15]
    ],
    shapeScale: 1.0,
    printScaleText: 'Aproximadamente 6 cm de largo',
    instructionStep: 'Recorta los 16 deltoides. Organízalos de tal modo que las puntas más afiladas apunten hacia el centro del marco circular en grupos concéntricos para resolver la estrella.'
  },
  {
    id: 4,
    name: 'Desafío 4: El Monotilo Sombrero de Einstein',
    desc: 'Consigue armar un fragmento del primer monotilo que cubre el plano infinitamente sin repetirse de forma periódica.',
    materials: 'Tijeras de precisión, lápiz, colores.',
    spaceToCover: 'Marco de red guía triangular de fondo.',
    piecesCount: '12 Sombreros de Einstein (10 normales y 2 reflejados)',
    piecesCountNum: 12,
    difficulty: 'Experto',
    difficultyColor: 'bg-purple-100 text-purple-800 border-purple-200',
    shapePoints: [
      [0, -35],
      [13, -30],
      [22, -13],
      [39, -9],
      [30, 13],
      [9, 13],
      [0, 30],
      [-13, 26],
      [-22, 9],
      [-39, 9],
      [-30, -13],
      [-13, -13],
      [-9, -30]
    ],
    shapeScale: 0.9,
    printScaleText: 'Exclusiva simetría aperiodica "ein Stein"',
    instructionStep: '¡Cuidado! Las 2 piezas marcadas con líneas cruzadas internas son simétricas reflejadas ("camisetas"). Recórtalas todas y encájalas en el panel guía para lograr el mosaico del Sombrero.'
  }
];

interface PlacedPiece {
  slotId: number;
  color: string;
  rotation: number;
  flipped: boolean;
}

const MosaicDesign: React.FC<Props> = ({ student, onBack, onComplete }) => {
  const [viewMode, setViewMode] = useState<'education' | 'game' | 'printable'>('education');
  const [activePrintChallengeId, setActivePrintChallengeId] = useState<number>(1);
  const [zoomImage, setZoomImage] = useState<typeof NATURE_IMAGES[0] | null>(null);

  // Puzzle States
  const [maxUnlockedLevelId, setMaxUnlockedLevelId] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(`mosaic_max_unlocked_level_${student?.Usuario || 'default'}`);
      return stored ? parseInt(stored, 10) : 1;
    } catch {
      return 1;
    }
  });

  const [currentLevelId, setCurrentLevelId] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(`mosaic_current_level_${student?.Usuario || 'default'}`);
      const val = stored ? parseInt(stored, 10) : 1;
      return val <= 5 ? val : 1;
    } catch {
      return 1;
    }
  });

  const [rotationAngle, setRotationAngle] = useState<number>(0); // 0, 90, 180, 270 (or 60, 120, etc for Level 1)
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>('#6366f1'); // Indigo default
  const [placedPieces, setPlacedPieces] = useState<PlacedPiece[]>([]);

  const [gameCompleted, setGameCompleted] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(`mosaic_game_completed_${student?.Usuario || 'default'}`);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | null }>({
    text: 'Ajusta la rotación y simetría de la ficha de muestra, luego haz clic en una silueta del tablero para encajarla.',
    type: 'info'
  });

  const currentLevel = LEVELS.find(l => l.id === currentLevelId) || LEVELS[0];

  const colors = [
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#06b6d4', // Cyan
    '#8b5cf6'  // Purple
  ];

  // Rotate clockwise depending on the geometry of the active level
  const handleRotate = () => {
    playSound('pop');
    let increment = 90;
    if (currentLevelId === 1) {
      increment = 60; // Hexagonal symmetry
    } else if (currentLevelId === 2) {
      increment = 45; // Octagonal symmetry
    } else if (currentLevelId === 5) {
      increment = 30; // Hat symmetry has 12-fold rotation directions
    }
    setRotationAngle(prev => (prev + increment) % 360);
  };

  // Flip symmetry
  const handleFlip = () => {
    playSound('pop');
    setIsFlipped(prev => !prev);
  };

  // Reset the active board
  const handleResetLevel = () => {
    playSound('pop');
    setPlacedPieces([]);
    setRotationAngle(0);
    setIsFlipped(false);
    setFeedbackMessage({
      text: 'Tablero reiniciado. Comienza a colocar tus piezas.',
      type: 'info'
    });
  };

  // Undo last action
  const handleUndo = () => {
    if (placedPieces.length > 0) {
      playSound('pop');
      setPlacedPieces(prev => prev.slice(0, -1));
      setFeedbackMessage({
        text: 'Última pieza retirada del tablero.',
        type: 'info'
      });
    }
  };

  // Try to place piece in slot
  const handleSlotClick = (slot: TargetSlot) => {
    // Check if slot is already occupied
    if (placedPieces.some(p => p.slotId === slot.id)) {
      playSound('pop');
      // Remove piece if clicked again
      setPlacedPieces(prev => prev.filter(p => p.slotId !== slot.id));
      setFeedbackMessage({
        text: 'Pieza retirada de este espacio.',
        type: 'info'
      });
      return;
    }

    // Verify rotation and flipping match
    const isOrientationValid = slot.validOrientations.some(([r, f]) => {
      // Normalize rotations to handle floating precision or 360 wrapping
      const normalizedTarget = (r % 360 + 360) % 360;
      const normalizedActive = (rotationAngle % 360 + 360) % 360;
      return normalizedTarget === normalizedActive && f === isFlipped;
    });

    if (isOrientationValid) {
      playSound('success');
      const newPiece: PlacedPiece = {
        slotId: slot.id,
        color: selectedColor,
        rotation: rotationAngle,
        flipped: isFlipped
      };
      setPlacedPieces(prev => [...prev, newPiece]);
      setFeedbackMessage({
        text: '¡Excelente! La pieza encaja perfectamente.',
        type: 'success'
      });
    } else {
      playSound('error');
      // Give descriptive feedback
      let hint = 'La orientación es incorrecta. ';
      if (slot.validOrientations.some(([_, f]) => f !== isFlipped)) {
        hint += 'Este espacio requiere que reflejes (simetría ↔️) la pieza.';
      } else {
        hint += 'Intenta rotar (🔄) la pieza para alinearla con la silueta.';
      }
      setFeedbackMessage({
        text: hint,
        type: 'error'
      });
    }
  };

  // Verify if all slots are covered
  const handleVerifyLevel = () => {
    const allFilled = currentLevel.targetSlots.every(slot => 
      placedPieces.some(p => p.slotId === slot.id)
    );

    if (allFilled) {
      playSound('success');
      
      // Determine if we are completing the highest reached level or an already completed one
      if (currentLevelId === maxUnlockedLevelId) {
        if (maxUnlockedLevelId < LEVELS.length) {
          const nextLevel = maxUnlockedLevelId + 1;
          alert(`¡Fabuloso! Has completado el ${currentLevel.name}. ¡Siguiente desafío desbloqueado!`);
          
          setMaxUnlockedLevelId(nextLevel);
          setCurrentLevelId(nextLevel);
          setPlacedPieces([]);
          setRotationAngle(0);
          setIsFlipped(false);
          setFeedbackMessage({
            text: '¡Nuevo nivel desbloqueado! Explora la silueta del tablero.',
            type: 'info'
          });

          // Persist both maxUnlockedLevelId and currentLevelId
          try {
            localStorage.setItem(`mosaic_max_unlocked_level_${student?.Usuario || 'default'}`, nextLevel.toString());
            localStorage.setItem(`mosaic_current_level_${student?.Usuario || 'default'}`, nextLevel.toString());
          } catch (e) {
            console.error(e);
          }

          // Each level completed is 20% progress (since there are 5 levels)
          const progressPercent = Math.round((maxUnlockedLevelId / LEVELS.length) * 100);
          onComplete('progreso_mosaicos', progressPercent);
        } else {
          // Completed level 5!
          setGameCompleted(true);
          try {
            localStorage.setItem(`mosaic_game_completed_${student?.Usuario || 'default'}`, 'true');
          } catch (e) {
            console.error(e);
          }
          onComplete('progreso_mosaicos', 100);
          alert('¡Espectacular! Has completado el último nivel: ¡El Sombrero de Einstein! Has ganado la medalla de Maestro de las Teselaciones.');
        }
      } else {
        // Just re-completing an already unlocked level
        alert(`¡Excelente! Has vuelto a completar el ${currentLevel.name}.`);
        setPlacedPieces([]);
        setRotationAngle(0);
        setIsFlipped(false);
        setFeedbackMessage({
          text: 'Mosaico completado de nuevo. Puedes seleccionar otro nivel en la barra de progreso.',
          type: 'success'
        });
      }
    } else {
      playSound('error');
      setFeedbackMessage({
        text: 'Aún te faltan espacios por cubrir para completar el mosaico.',
        type: 'error'
      });
    }
  };

  // Convert shape points to SVG string
  const getPolygonPointsString = (points: [number, number][]) => {
    return points.map(([x, y]) => `${x},${y}`).join(' ');
  };

  // Render a highly detailed physical/digital blueprint SVG to guide the student on how to tile, rotate and orient the pieces.
  const renderWorkspaceGuideSVG = (challengeId: number, isPrint: boolean) => {
    const strokeColor = isPrint ? "rgba(0, 0, 0, 0.25)" : "rgba(147, 51, 234, 0.3)";
    const arrowColor = isPrint ? "rgba(0, 0, 0, 0.45)" : "rgba(147, 51, 234, 0.55)";
    const textColor = isPrint ? "rgba(0, 0, 0, 0.6)" : "rgba(107, 33, 168, 0.85)";
    
    if (challengeId === 1) {
      // Cairo Pentagons
      const ptsStr = "0,-32 32,-9 20,32 -20,32 -32,-9";
      return (
        <svg viewBox="0 0 540 380" className="w-full h-full max-h-[380px] select-none" id="svg-guide-cairo">
          <defs>
            <pattern id="grid-dots-cairo" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill={isPrint ? "rgba(0,0,0,0.1)" : "rgba(147,51,234,0.15)"} />
            </pattern>
            <marker id="arrow-cairo" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={arrowColor} />
            </marker>
          </defs>
          <rect width="540" height="380" fill="url(#grid-dots-cairo)" rx="16" />
          
          <rect x="8" y="8" width="524" height="364" fill="none" stroke={isPrint ? "#000" : "#a855f7"} strokeWidth="2" strokeDasharray="6,4" rx="12" />
          
          {/* Tiled guides */}
          <g transform="translate(270, 190) scale(1.35)">
            {/* Central clover structure */}
            <g transform="translate(0, -28) rotate(0)">
              <polygon points={ptsStr} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3,3" />
              <text x="0" y="8" fontSize="8" fill={textColor} textAnchor="middle" fontWeight="bold">0° (Giro)</text>
            </g>
            <g transform="translate(0, 28) rotate(180)">
              <polygon points={ptsStr} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3,3" />
              <text x="0" y="8" fontSize="8" fill={textColor} textAnchor="middle" fontWeight="bold">180°</text>
            </g>
            <g transform="translate(-28, 0) rotate(90)">
              <polygon points={ptsStr} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3,3" />
              <text x="0" y="8" fontSize="8" fill={textColor} textAnchor="middle" fontWeight="bold">90°</text>
            </g>
            <g transform="translate(28, 0) rotate(270)">
              <polygon points={ptsStr} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3,3" />
              <text x="0" y="8" fontSize="8" fill={textColor} textAnchor="middle" fontWeight="bold">270°</text>
            </g>

            {/* Surrounding secondary tiles */}
            <g transform="translate(-56, -56) rotate(45)">
              <polygon points={ptsStr} fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
            </g>
            <g transform="translate(56, -56) rotate(-45)">
              <polygon points={ptsStr} fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
            </g>
            <g transform="translate(-56, 56) rotate(135)">
              <polygon points={ptsStr} fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
            </g>
            <g transform="translate(56, 56) rotate(-135)">
              <polygon points={ptsStr} fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
            </g>
          </g>
          
          {/* Helpful annotated instruction arrows */}
          <path d="M 270 50 L 270 120" fill="none" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#arrow-cairo)" strokeDasharray="2,2" />
          <text x="270" y="40" fontSize="9" fill={textColor} textAnchor="middle" fontWeight="black" className="uppercase tracking-wider">
            💡 GUÍA DE ACOPLE: JALONA LAS PIEZAS UNIENDO LAS PUNTAS EN EL CENTRO
          </text>
          <text x="270" y="348" fontSize="9" fill={textColor} textAnchor="middle" fontWeight="bold" className="italic">
            Rota tus fichas a 90° o 180° para que encajen perfectamente en los costados
          </text>
        </svg>
      );
    } else if (challengeId === 2) {
      // Isosceles Trapezoid flower
      const ptsStr = "-40,-15 40,-15 20,15 -20,15";
      return (
        <svg viewBox="0 0 540 380" className="w-full h-full max-h-[380px] select-none" id="svg-guide-trapezoid">
          <defs>
            <pattern id="grid-hex-guide" width="30" height="30" patternTransform="rotate(30 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="30" y2="0" stroke={isPrint ? "rgba(0,0,0,0.06)" : "rgba(147,51,234,0.1)"} strokeWidth="1" />
              <line x1="0" y1="0" x2="0" y2="30" stroke={isPrint ? "rgba(0,0,0,0.06)" : "rgba(147,51,234,0.1)"} strokeWidth="1" />
            </pattern>
            <marker id="arrow-flower" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={arrowColor} />
            </marker>
          </defs>
          <rect width="540" height="380" fill="url(#grid-hex-guide)" rx="16" />
          
          <polygon 
            points="270,18 450,105 450,275 270,362 90,275 90,105" 
            fill="none" 
            stroke={isPrint ? "#000" : "#a855f7"} 
            strokeWidth="2" 
            strokeDasharray="6,4" 
          />
          
          <g transform="translate(270, 190) scale(1.35)">
            {/* Inner ring of 6 trapezoids */}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = i * 60;
              return (
                <g key={i} transform={`rotate(${angle}) translate(0, -15)`}>
                  <polygon points={ptsStr} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3,3" />
                  <text x="0" y="3" fontSize="8" fill={textColor} textAnchor="middle" fontWeight="bold" transform={`rotate(${-angle})`}>
                    {angle}°
                  </text>
                </g>
              );
            })}
            
            {/* Outer ring of 6 reversed/interspersed trapezoids */}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = i * 60 + 30;
              return (
                <g key={i} transform={`rotate(${angle}) translate(0, 42) rotate(180)`}>
                  <polygon points={ptsStr} fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="4,4" opacity="0.55" />
                </g>
              );
            })}
          </g>

          <path d="M 270 50 Q 230 110 250 160" fill="none" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#arrow-flower)" strokeDasharray="2,2" />
          <text x="270" y="42" fontSize="9" fill={textColor} textAnchor="middle" fontWeight="black" className="uppercase tracking-wider">
            🌸 GUÍA DE ORIENTACIÓN: ACOMODA LAS PIEZAS EN CÍRCULO GIRANDO 60°
          </text>
          <text x="270" y="348" fontSize="9" fill={textColor} textAnchor="middle" fontWeight="bold" className="italic">
            Alinea las bases menores hacia el centro para dar forma a los pétalos hexagonales
          </text>
        </svg>
      );
    } else if (challengeId === 3) {
      // Kite / Deltoid star
      const ptsStr = "0,-45 22,-15 0,45 -22,-15";
      return (
        <svg viewBox="0 0 540 380" className="w-full h-full max-h-[380px] select-none" id="svg-guide-kite">
          <defs>
            <pattern id="grid-polar-guide" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="18" fill="none" stroke={isPrint ? "rgba(0,0,0,0.06)" : "rgba(147,51,234,0.08)"} strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="540" height="380" fill="url(#grid-polar-guide)" rx="16" />
          
          <circle cx="270" cy="190" r="172" fill="none" stroke={isPrint ? "#000" : "#a855f7"} strokeWidth="2" strokeDasharray="6,4" />
          
          <g transform="translate(270, 190) scale(1.35)">
            {/* Inner ring of 8 kites */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = i * 45;
              return (
                <g key={i} transform={`rotate(${angle}) translate(0, -22)`}>
                  <polygon points={ptsStr} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3,3" />
                  <text x="0" y="12" fontSize="7" fill={textColor} textAnchor="middle" fontWeight="black" transform={`rotate(${-angle})`}>
                    {angle}°
                  </text>
                </g>
              );
            })}
            
            {/* Outer Ring of 8 inverse kites */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = i * 45 + 22.5;
              return (
                <g key={i} transform={`rotate(${angle}) translate(0, 36) rotate(180)`}>
                  <polygon points={ptsStr} fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="4,4" opacity="0.55" />
                </g>
              );
            })}
          </g>
          
          <text x="270" y="38" fontSize="9" fill={textColor} textAnchor="middle" fontWeight="black" className="uppercase tracking-wider">
            ⭐ GUÍA DE CONSTRUCCIÓN: ACOPLA LOS ÁNGULOS AGUDOS HACIA EL CENTRO
          </text>
          <text x="270" y="352" fontSize="9" fill={textColor} textAnchor="middle" fontWeight="bold" className="italic">
            Cada cometa se sitúa girada a 45°. Utiliza las cometas intermedias para fijar la corona
          </text>
        </svg>
      );
    } else {
      // Einstein hat
      const ptsStr = "0,-35 13,-30 22,-13 39,-9 30,13 9,13 0,30 -13,26 -22,9 -39,9 -30,-13 -13,-13 -9,-30";
      return (
        <svg viewBox="0 0 540 380" className="w-full h-full max-h-[380px] select-none" id="svg-guide-einstein">
          <defs>
            <pattern id="grid-iso-guide" width="28" height="16.16" patternUnits="userSpaceOnUse">
              <path d="M 0 0 L 14 8 L 28 0 M 14 8 L 14 16.16" fill="none" stroke={isPrint ? "rgba(0,0,0,0.1)" : "rgba(147,51,234,0.15)"} strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="540" height="380" fill="url(#grid-iso-guide)" rx="16" />
          
          <rect x="8" y="8" width="524" height="364" fill="none" stroke={isPrint ? "#000" : "#a855f7"} strokeWidth="2" strokeDasharray="6,4" rx="12" />
          
          <g transform="translate(270, 185) scale(1.15)">
            {/* Hat 1: Center normal */}
            <g transform="translate(0, 0) rotate(0)">
              <polygon points={ptsStr} fill="none" stroke={strokeColor} strokeWidth="1.8" strokeDasharray="3,3" />
              <text x="0" y="5" fontSize="7" fill={textColor} textAnchor="middle" fontWeight="black">CENTRO (0°)</text>
            </g>
            
            {/* Hat 2: Top-Left rotated 120 */}
            <g transform="translate(-55, -45) rotate(120)">
              <polygon points={ptsStr} fill="none" stroke={strokeColor} strokeWidth="1.2" strokeDasharray="4,4" />
              <text x="0" y="5" fontSize="6" fill={textColor} textAnchor="middle" fontWeight="bold">Giro 120°</text>
            </g>
            
            {/* Hat 3: Top-Right rotated -120 */}
            <g transform="translate(55, -45) rotate(-120)">
              <polygon points={ptsStr} fill="none" stroke={strokeColor} strokeWidth="1.2" strokeDasharray="4,4" />
              <text x="0" y="5" fontSize="6" fill={textColor} textAnchor="middle" fontWeight="bold">Giro -120°</text>
            </g>
            
            {/* Hat 4: Bottom Reflected/Flipped (shirts) */}
            <g transform="translate(0, 68) scale(-1, 1) rotate(60)">
              <polygon points={ptsStr} fill="none" stroke="rgba(225, 29, 72, 0.45)" strokeWidth="1.8" strokeDasharray="2,2" />
              <text x="0" y="5" fontSize="6" fill={isPrint ? "#000" : "#e11d48"} textAnchor="middle" fontWeight="black" transform="scale(-1, 1)">👕 REFLEJADO (Giro 60°)</text>
            </g>
          </g>
          
          <text x="270" y="42" fontSize="9" fill={textColor} textAnchor="middle" fontWeight="black" className="uppercase tracking-wider">
            🧩 GUÍA DE ACOPLE: MONOTILO APERIÓDICO "EL SOMBRERO"
          </text>
          <text x="270" y="345" fontSize="8" fill={textColor} textAnchor="middle" fontWeight="bold" className="italic">
            ⚠️ ¡ATENCIÓN! La pieza indicada con 👕 debe colocarse al revés (reflejada) para cerrar la red
          </text>
        </svg>
      );
    }
  };


  return (
    <>
      <div className="max-w-6xl mx-auto animate-fadeIn px-4 py-8 text-slate-800 font-sans print:hidden" id="mosaic-main-container">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 p-8 text-white rounded-[3rem] shadow-2xl overflow-hidden mb-8 relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-[10rem] rotate-12 pointer-events-none">
          <Compass />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => { playSound('pop'); onBack(); }}
              className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer border border-white/20"
              id="back-button"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/20 px-4 py-1.5 rounded-full mb-2 inline-block">
                Aventura de Pensamiento Espacial
              </span>
              <h3 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                Diseño de Mosaicos y Teselaciones
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { playSound('pop'); setViewMode('education'); }}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'education' 
                  ? 'bg-white text-purple-800 shadow-lg' 
                  : 'bg-white/10 text-white hover:bg-white/25 border border-white/15'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              1. En la Naturaleza
            </button>
            <button
              onClick={() => { playSound('pop'); setViewMode('game'); }}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'game' 
                  ? 'bg-white text-purple-800 shadow-lg' 
                  : 'bg-white/10 text-white hover:bg-white/25 border border-white/15'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              2. Rompecabezas ({LEVELS.length} Niveles)
            </button>
            <button
              onClick={() => { playSound('pop'); setViewMode('printable'); }}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'printable' 
                  ? 'bg-white text-purple-800 shadow-lg' 
                  : 'bg-white/10 text-white hover:bg-white/25 border border-white/15'
              }`}
            >
              <Printer className="w-4 h-4" />
              3. Taller Imprimible ✂️
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: EDUCATIONAL VIEW WITH SPECIFIED NATURAL TESSELLATIONS */}
      {viewMode === 'education' && (
        <div className="space-y-10 animate-fadeIn" id="education-section">
          {/* Definition Banner */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border-2 border-indigo-50 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  ¿Qué es una Teselación?
                </span>
                <h4 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 leading-tight">
                  La Geometría Infinita de los Planos
                </h4>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Una <strong>teselación</strong> (o embaldosado) es un patrón regular de figuras geométricas que cubre completamente una superficie plana 
                  <strong> sin dejar huecos vacíos ni solaparse</strong> entre sí.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Para lograr esto, las figuras deben experimentar tres movimientos lógicos en el espacio:
                </p>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 text-center">
                    <span className="text-2xl block mb-1">📐</span>
                    <span className="font-bold text-xs text-indigo-900 block">Traslación</span>
                    <span className="text-[10px] text-gray-400">Desplazar la figura</span>
                  </div>
                  <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/50 text-center">
                    <span className="text-2xl block mb-1">🔄</span>
                    <span className="font-bold text-xs text-purple-900 block">Rotación</span>
                    <span className="text-[10px] text-gray-400">Girar sobre un eje</span>
                  </div>
                  <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100/50 text-center">
                    <span className="text-2xl block mb-1">↔️</span>
                    <span className="font-bold text-xs text-pink-900 block">Simetría</span>
                    <span className="text-[10px] text-gray-400">Reflejar como espejo</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-4 bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-3xl border border-indigo-200 text-center flex flex-col justify-between h-full">
                <div>
                  <h5 className="font-black text-indigo-900 text-sm uppercase tracking-wide mb-2">Desafío Académico</h5>
                  <p className="text-xs text-indigo-700 leading-relaxed mb-4">
                    Explora las increíbles fotos de la naturaleza, aprende cómo se comporta la materia y luego pon a prueba tus habilidades de rotación y traslación.
                  </p>
                </div>
                <button
                  onClick={() => { playSound('pop'); setViewMode('game'); }}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:-translate-y-1"
                >
                  <Sparkles className="w-4 h-4" />
                  Ir al Rompecabezas
                </button>
              </div>
            </div>
          </div>

          {/* Nature Gallery */}
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <h4 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} />
                7 Teselaciones Asombrosas en la Naturaleza
              </h4>
              <p className="text-gray-500 text-xs">
                Haz clic en cualquier imagen para verla en pantalla completa, explorar sus asombrosos patrones y revisar los créditos correspondientes.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="nature-grid">
              {NATURE_IMAGES.map((img, i) => (
                <div 
                  key={i}
                  onClick={() => { playSound('pop'); setZoomImage(img); }}
                  className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <img 
                      src={img.url} 
                      alt={img.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-90"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-[9px] bg-white/20 text-white font-black uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md">
                        {img.subtitle}
                      </span>
                      <h5 className="font-black text-sm mt-1.5 leading-tight">{img.title}</h5>
                    </div>
                  </div>
                  <div className="p-4 flex-grow bg-white flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-2">
                        {img.desc}
                      </p>
                      <p className="text-[9px] text-slate-400 italic font-medium leading-none">
                        {img.credit}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 mt-3 inline-block group-hover:translate-x-1.5 transition-transform">
                      Ver pantalla completa &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE TILING GAME */}
      {viewMode === 'game' && (
        <div className="space-y-8 animate-fadeIn" id="game-section">
          
          {/* LEVEL SELECTOR NAVIGATION RAIL */}
          <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-md flex items-center justify-between gap-4 overflow-x-auto">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider shrink-0 pl-2">
              Progreso de los Mosaicos:
            </span>
            <div className="flex items-center gap-3 flex-grow justify-end">
              {LEVELS.map(lvl => {
                const isUnlocked = lvl.id <= maxUnlockedLevelId;
                const isActive = lvl.id === currentLevelId;
                const isPassed = lvl.id < maxUnlockedLevelId;

                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      if (isUnlocked) {
                        playSound('pop');
                        setCurrentLevelId(lvl.id);
                        setPlacedPieces([]);
                        setRotationAngle(0);
                        setIsFlipped(false);
                        setFeedbackMessage({
                          text: 'Tablero listo para resolver. Rota o refleja la pieza de muestra para rellenar la silueta.',
                          type: 'info'
                        });
                        try {
                          localStorage.setItem(`mosaic_current_level_${student?.Usuario || 'default'}`, lvl.id.toString());
                        } catch (e) {
                          console.error(e);
                        }
                      } else {
                        playSound('error');
                        alert('Resuelve los mosaicos anteriores para desbloquear este nivel.');
                      }
                    }}
                    className={`px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                      isActive 
                        ? 'bg-purple-600 border-purple-600 text-white shadow-md' 
                        : isPassed 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : !isUnlocked ? (
                      <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0"></span>
                    )}
                    Nivel {lvl.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE PUZZLE WORKSPACE */}
          {!gameCompleted ? (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT SIDE: VECTOR SVG GAME BOARD */}
              <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col items-center gap-6">
                <div className="text-center w-full">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${currentLevel.colorTheme}`}></span>
                    <h4 className="font-black text-xl text-slate-800 uppercase tracking-tight">
                      {currentLevel.name}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto">
                    {currentLevel.desc}
                  </p>
                </div>

                {/* FEEDBACK BANNER */}
                <div className={`w-full px-4 py-3 rounded-2xl text-xs font-medium text-center border transition-all ${
                  feedbackMessage.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : feedbackMessage.type === 'error'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {feedbackMessage.text}
                </div>

                {/* THE SVG VECTOR CANVAS */}
                <div className="border-4 border-dashed border-slate-200 p-4 rounded-[2rem] bg-slate-50/50 relative shadow-inner select-none w-full max-w-[360px] md:max-w-[400px] aspect-square flex items-center justify-center">
                  <svg 
                    viewBox="0 0 400 400" 
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Background decorative grids representing geometry patterns */}
                    <g opacity="0.15">
                      {currentLevelId === 1 && (
                        // Hexagonal grid hint lines
                        <path d="M 0 200 L 400 200 M 100 0 L 300 400 M 300 0 L 100 400" stroke="#6366f1" strokeWidth="1" />
                      )}
                      {currentLevelId === 2 && (
                        // Octagonal crown hint lines
                        <circle cx="200" cy="200" r="100" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4,4" />
                      )}
                    </g>

                    {/* TARGET SLOTS RENDERING */}
                    {currentLevel.targetSlots.map(slot => {
                      const placed = placedPieces.find(p => p.slotId === slot.id);

                      return (
                        <g 
                          key={slot.id}
                          className="cursor-pointer transition-all hover:brightness-105"
                          onClick={() => handleSlotClick(slot)}
                        >
                          {/* Main Outline representation */}
                          {placed ? (
                            // Render Placed and Aligned Tile Shape
                            <g transform={`translate(${slot.cx}, ${slot.cy}) rotate(${placed.rotation}) scale(${placed.flipped ? '-1, 1' : '1, 1'}) scale(${currentLevel.scale})`}>
                              <polygon 
                                points={getPolygonPointsString(currentLevel.shapePoints)} 
                                fill={placed.color}
                                stroke="#1e293b"
                                strokeWidth="2.5"
                                className="drop-shadow-md"
                              />
                              <circle cx="0" cy="0" r="4" fill="#ffffff" opacity="0.8" />
                            </g>
                          ) : (
                            // Render Empty Slot Outline (Rompecabezas Silhouette)
                            // We display the outline using the first valid orientation so they can visualize it!
                            (() => {
                              const [validRot, validFlip] = slot.validOrientations[0];
                              return (
                                <g transform={`translate(${slot.cx}, ${slot.cy}) rotate(${validRot}) scale(${validFlip ? '-1, 1' : '1, 1'}) scale(${currentLevel.scale})`}>
                                  <polygon 
                                    points={getPolygonPointsString(currentLevel.shapePoints)} 
                                    fill="#fef3c7"
                                    stroke="#f59e0b"
                                    strokeWidth="2"
                                    strokeDasharray="4,3"
                                    opacity="0.85"
                                    className="transition-colors hover:fill-amber-200"
                                  />
                                  {/* Center snapping helper dot */}
                                  <circle cx="0" cy="0" r="3" fill="#f59e0b" opacity="0.5" />
                                </g>
                              );
                            })()
                          )}
                          
                          {/* Label indicating Slot ID or help */}
                          {!placed && (
                            <text 
                              x={slot.cx} 
                              y={slot.cy + 4} 
                              textAnchor="middle" 
                              className="text-[10px] font-black text-amber-700/60 select-none pointer-events-none"
                            >
                              ?
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* BOARD STATISTICS */}
                <div className="flex justify-between items-center w-full px-4 border-t border-slate-100 pt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <div>
                    Cubiertas:{' '}
                    <span className="text-purple-600 font-black">{placedPieces.length} / {currentLevel.targetSlots.length}</span>
                  </div>
                  <div>
                    {placedPieces.length === currentLevel.targetSlots.length ? (
                      <span className="text-emerald-600 font-black">¡Mosaico Completo!</span>
                    ) : (
                      <span className="text-amber-600 font-black">Llenando mosaico...</span>
                    )}
                  </div>
                </div>

                {/* BOARD CONTROL ACTION BUTTONS */}
                <div className="grid grid-cols-3 gap-3 w-full">
                  <button
                    onClick={handleUndo}
                    disabled={placedPieces.length === 0}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl text-slate-700 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-200/50 shadow-sm"
                  >
                    <Undo2 className="w-4 h-4" />
                    Deshacer
                  </button>
                  <button
                    onClick={handleResetLevel}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-700 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-200/50 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpiar
                  </button>
                  <button
                    onClick={handleVerifyLevel}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Comprobar
                  </button>
                </div>
              </div>

              {/* RIGHT SIDE: PREVIEW & TRANSFORMATION STATS */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* PREVIEW SAMPLE ACTIVE PIECE */}
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                  <div className="border-b border-slate-50 pb-4 text-center lg:text-left">
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      Ficha de Muestra Activa
                    </span>
                    <h5 className="font-black text-base text-slate-800 mt-2">
                      Symmetry & Rotation Controller
                    </h5>
                    <p className="text-xs text-slate-400 mt-1">
                      Manipula la ficha para adaptarla a la silueta vacía del rompecabezas.
                    </p>
                  </div>

                  {/* ACTIVE TRANSFORM PREVIEW WINDOW */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-150 flex flex-col items-center justify-center relative min-h-[180px] overflow-hidden">
                    <svg 
                      viewBox="0 0 160 160" 
                      className="w-28 h-28 drop-shadow-md"
                    >
                      {/* Bounding rotation alignment helper circles */}
                      <circle cx="80" cy="80" r="50" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
                      <circle cx="80" cy="80" r="6" fill="#cbd5e1" />

                      {/* Transformed polygon visualization */}
                      <g transform={`translate(80, 80) rotate(${rotationAngle}) scale(${isFlipped ? '-1, 1' : '1, 1'})`}>
                        <polygon 
                          points={getPolygonPointsString(currentLevel.shapePoints)} 
                          fill={selectedColor}
                          stroke="#1e293b"
                          strokeWidth="2"
                        />
                      </g>
                    </svg>

                    <div className="text-center mt-3 space-y-1">
                      <span className="text-[10px] font-black text-purple-950 uppercase tracking-widest block">
                        {currentLevel.shapeName}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 block">
                        Rotación: {rotationAngle}° • Simetría: {isFlipped ? 'Reflejada (↔️)' : 'Normal'}
                      </span>
                    </div>
                  </div>

                  {/* ROTATE AND FLIP BUTTON CONTROLS */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleRotate}
                      className="py-4 bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-100 hover:border-purple-200 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                    >
                      <RotateCw className="w-4 h-4" />
                      Girar Ficha
                    </button>
                    <button
                      onClick={handleFlip}
                      className="py-4 bg-pink-50 hover:bg-pink-100 text-pink-700 border-2 border-pink-100 hover:border-pink-200 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                    >
                      Reflejar ↔️
                    </button>
                  </div>
                </div>

                {/* SELECTED BALDOSE COLOR PALETTE */}
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-4">
                  <h5 className="font-black text-sm text-slate-800 uppercase tracking-wider">
                    🎨 Color de Baldosa
                  </h5>
                  <p className="text-xs text-slate-400">
                    Establece un color para organizar e identificar tus piezas en la superficie.
                  </p>
                  <div className="flex gap-3 justify-center pt-1">
                    {colors.map(col => (
                      <button
                        key={col}
                        onClick={() => { playSound('pop'); setSelectedColor(col); }}
                        className={`w-10 h-10 rounded-full border-3 transition-all cursor-pointer shadow-sm ${
                          selectedColor === col ? 'border-indigo-950 scale-110 ring-4 ring-indigo-50' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: col }}
                      ></button>
                    ))}
                  </div>
                </div>

                {/* GOLDEN RULE WARNING BANNER */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-4 items-start">
                  <div className="text-xl shrink-0">💡</div>
                  <div className="text-xs text-amber-900 leading-relaxed space-y-1.5">
                    <p className="font-bold">Regla de Oro de las Teselaciones:</p>
                    <p>
                      Para cubrir perfectamente el espacio sin huecos, las piezas deben colocarse de modo que rodeen por completo cada vértice. 
                      ¡La suma de ángulos alrededor de cada vértice interior debe ser exactamente de <strong>360 grados</strong>!
                    </p>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            // CONGRATULATIONS AND COMPLETED FLOW (SABIO SUPREMO DE MOSAICOS)
            <div className="bg-white rounded-[3rem] p-12 text-center border-4 border-indigo-50 shadow-2xl relative overflow-hidden max-w-2xl mx-auto animate-bounceIn">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 space-y-6">
                <div className="text-7xl animate-bounce">🏆👑</div>
                <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider inline-block">
                  Aventura Completada con Éxito
                </span>
                <h4 className="text-3xl font-black text-slate-800">
                  ¡Maestro de las Teselaciones!
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
                  Has superado con honores excepcionales los {LEVELS.length} niveles del mosaico, incluyendo el mítico y complejo <strong>Sombrero de Einstein</strong>. 
                  Demostraste un dominio supremo de los movimientos espaciales de traslación, rotación y simetría.
                </p>
                
                {/* Interactive congrats banner details */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl p-5 text-left flex gap-4 items-center">
                  <div className="text-3xl">💡</div>
                  <div className="text-xs">
                    <p className="font-bold">¿Sabías qué?</p>
                    <p className="opacity-90 leading-relaxed mt-0.5">
                      El sombrero de Einstein es un monotilo aperiódico (denominado "Einstein" por la frase alemana "ein Stein" que significa "una piedra"). 
                      ¡Su descubrimiento en el año 2023 por David Smith revolucionó las matemáticas mundiales al resolver un problema abierto por décadas!
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => { playSound('pop'); onBack(); }}
                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:-translate-y-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Finalizar y Registrar Progreso (100%)
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de que deseas reiniciar todo tu progreso de los 5 niveles?')) {
                        playSound('pop');
                        setMaxUnlockedLevelId(1);
                        setCurrentLevelId(1);
                        setGameCompleted(false);
                        setPlacedPieces([]);
                        try {
                          localStorage.removeItem(`mosaic_max_unlocked_level_${student?.Usuario || 'default'}`);
                          localStorage.removeItem(`mosaic_current_level_${student?.Usuario || 'default'}`);
                          localStorage.removeItem(`mosaic_game_completed_${student?.Usuario || 'default'}`);
                        } catch (e) {
                          console.error(e);
                        }
                        onComplete('progreso_mosaicos', 0);
                        setFeedbackMessage({
                          text: 'Progreso reiniciado. Comienza con el Nivel 1.',
                          type: 'info'
                        });
                      }
                    }}
                    className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-wider shadow flex items-center justify-center gap-2 cursor-pointer transition-transform hover:-translate-y-1 border border-slate-200"
                  >
                    🔄 Reiniciar Progreso
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: PRINTABLE TALLER / PHYSICAL CHALLENGES */}
      {viewMode === 'printable' && (
        <div className="space-y-8 animate-fadeIn" id="printable-section">
          {/* Header Description Card */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border-2 border-purple-50 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-50 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Desafío Fuera de Pantalla ✂️
                </span>
                <h4 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 leading-tight">
                  Taller de Construcción y Recorte Físico
                </h4>
                <p className="text-gray-650 text-sm leading-relaxed">
                  ¡Levantemos la mirada de la pantalla! La mejor forma de comprender la geometría es manipulando las piezas con tus propias manos. Hemos diseñado **4 desafíos físicos con marcos delimitados** y **cantidades exactas de fichas** que el estudiante debe imprimir, pintar, recortar y colocar para resolver.
                </p>
                
                {/* Polypad interactive alternative */}
                <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
                  <div className="space-y-1">
                    <p className="text-indigo-950 font-black text-xs flex items-center gap-1.5">
                      <span className="text-base">🌐</span> ¿No puedes imprimir? ¡Hazlo digital!
                    </p>
                    <p className="text-indigo-700 text-[11px] leading-relaxed max-w-xl">
                      Si no cuentas con una impresora en este momento, puedes resolver y diseñar tus teselaciones y experimentar en línea de forma 100% interactiva utilizando el lienzo digital de Polypad.
                    </p>
                  </div>
                  <a
                    href="https://polypad.amplify.com/p/tf37YjRWjVTQzg#pentagons"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <span>Abrir Polypad ↗</span>
                  </a>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    ✂️ Tijeras de Papel
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    🎨 Lápices de Colores
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    📏 Regla de Medir
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    🖨️ Impresora Estándar
                  </span>
                </div>
              </div>
              <div className="md:col-span-4 bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-3xl border border-purple-200 text-center flex flex-col justify-between h-full space-y-4">
                <div>
                  <h5 className="font-black text-purple-900 text-xs uppercase tracking-wide">¿Cómo Funciona?</h5>
                  <p className="text-[11px] text-purple-700 leading-relaxed mt-2">
                    Selecciona un reto, haz clic en <strong>Imprimir Plantilla</strong> para mandar el taller directamente a tu impresora, recorta las fichas por el borde punteado y asume el reto espacial en el tablero físico.
                  </p>
                </div>
                <button
                  onClick={() => { playSound('success'); window.print(); }}
                  className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:-translate-y-1"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Reto Seleccionado
                </button>
              </div>
            </div>
          </div>

          {/* SECTION: 4 CHALLENGES SELECTION */}
          <div className="grid md:grid-cols-2 gap-6">
            {PRINT_CHALLENGES.map(ch => (
              <div 
                key={ch.id}
                onClick={() => { playSound('pop'); setActivePrintChallengeId(ch.id); }}
                className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  activePrintChallengeId === ch.id 
                    ? 'bg-white border-purple-500 shadow-xl ring-4 ring-purple-100' 
                    : 'bg-white hover:bg-slate-50/50 border-slate-100 shadow-md'
                }`}
              >
                {activePrintChallengeId === ch.id && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 text-[9px] font-black uppercase rounded-bl-xl tracking-wider">
                    Activo para Impresión
                  </div>
                )}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${ch.difficultyColor}`}>
                      Dificultad: {ch.difficulty}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Desafío #{ch.id}</span>
                  </div>
                  <div>
                    <h5 className="font-black text-lg text-slate-800 leading-tight">{ch.name}</h5>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{ch.desc}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5 text-xs text-slate-600">
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-800 text-xs">📏 Espacio a cubrir:</span>
                      <span>{ch.spaceToCover}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-800 text-xs">🧩 Fichas requeridas:</span>
                      <span className="text-purple-700 font-bold">{ch.piecesCount}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-slate-800 text-xs">🎨 Materiales:</span>
                      <span>{ch.materials}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-400 italic font-medium">
                    {ch.printScaleText}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playSound('success');
                      setActivePrintChallengeId(ch.id);
                      setTimeout(() => {
                        window.print();
                      }, 100);
                    }}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      activePrintChallengeId === ch.id
                        ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir Plantilla
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ACTIVE CHALLENGE LIVE PREVIEW SHEET */}
          {(() => {
            const activeCh = PRINT_CHALLENGES.find(c => c.id === activePrintChallengeId) || PRINT_CHALLENGES[0];
            return (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                  <div>
                    <h5 className="font-black text-sm text-slate-400 uppercase tracking-wider">Vista Previa Digital de la Hoja de Trabajo</h5>
                    <h4 className="font-black text-xl text-slate-800 mt-1">
                      {activeCh.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium">Formato de Página: Carta / A4</span>
                    <button
                      onClick={() => { playSound('success'); window.print(); }}
                      className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      Imprimir Fichas y Guía
                    </button>
                  </div>
                </div>

                {/* DIGITAL SIMULATION OF WORK SHEET */}
                <div className="border-4 border-double border-slate-300 rounded-3xl p-6 md:p-10 bg-slate-50/50 max-w-xl mx-auto flex flex-col items-center shadow-inner">
                  <div className="bg-white border border-slate-200 shadow-lg w-full aspect-[1/1.4] p-6 flex flex-col justify-between text-slate-800 text-[10px] font-sans relative">
                    
                    {/* Sheet Header */}
                    <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
                      <h4 className="font-black text-xs tracking-wider uppercase text-slate-900">Programa de Pensamiento Lógico & Geometría</h4>
                      <h3 className="font-bold text-sm text-indigo-900">Taller Práctico de Mosaicos y Teselas Físicas</h3>
                      <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold px-4 pt-1">
                        <span>Estudiante: ________________________</span>
                        <span>Desafío #{activeCh.id}</span>
                      </div>
                    </div>

                    {/* Sheet Instructions */}
                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 my-3 text-left">
                      <p className="font-black text-indigo-950 text-xs">Reto: {activeCh.name}</p>
                      <p className="leading-relaxed text-[9px] text-slate-650">
                        {activeCh.instructionStep}
                      </p>
                      
                      {/* Coloring invitation */}
                      <div className="bg-purple-50/70 p-2.5 rounded-lg border border-purple-100 text-[8px] text-purple-900 flex items-start gap-1.5 leading-relaxed">
                        <span className="text-sm select-none">🎨</span>
                        <div>
                          <strong className="text-purple-950 font-black">¡Momento de Crear!</strong> Pinta tus fichas recortadas con tus colores favoritos antes de pegarlas. ¡Así resaltarás las simetrías rotacionales de tu mosaico y quedará espectacular!
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[8px] text-slate-500 font-bold pt-1 border-t border-slate-100">
                        <div>📏 Espacio: {activeCh.spaceToCover}</div>
                        <div>🧩 Fichas: Cortar exactamente {activeCh.piecesCountNum} piezas</div>
                      </div>
                    </div>

                    {/* Dotted calibration scale */}
                    <div className="flex items-center justify-between border-2 border-dashed border-slate-300 p-2.5 rounded-lg my-2 bg-slate-50">
                      <span className="font-bold text-[8px] text-slate-400">📏 Regla de calibración:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-[100px] h-3 bg-white border border-slate-900 flex items-center justify-center text-[7px] font-bold">5 cm</div>
                        <span className="text-[7px] text-slate-400">(verifica al imprimir)</span>
                      </div>
                    </div>

                    {/* Outline of Workspace bounds */}
                    <div className="border-2 border-dashed border-purple-500 bg-purple-50/35 rounded-2xl p-1 my-3 overflow-hidden w-full relative">
                      <span className="absolute top-2 left-2 z-10 text-[7px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-black uppercase shadow-sm">
                        Área de Ensamblado (Pegar aquí)
                      </span>
                      {renderWorkspaceGuideSVG(activeCh.id, false)}
                    </div>

                    {/* Outlines of Shapes to cut (Sample representation) */}
                    <div className="border-t border-slate-200 pt-3 text-center space-y-2">
                      <p className="font-bold text-[8px] text-slate-400 flex items-center justify-center gap-1">
                        <Scissors className="w-3 h-3 text-purple-500" />
                        Muestra de Plantillas de Recorte (Fichas Idénticas Impresas abajo)
                      </p>
                      <div className="flex gap-4 justify-center py-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="border border-slate-300 border-dashed p-1 bg-slate-50 rounded flex flex-col items-center">
                            <svg viewBox="0 0 80 80" className="w-10 h-10">
                              <g transform={`translate(40, 40) scale(${activeCh.shapeScale * 0.7})`}>
                                <polygon 
                                  points={getPolygonPointsString(activeCh.shapePoints)} 
                                  fill="none" 
                                  stroke="#000000" 
                                  strokeWidth="2.5" 
                                />
                              </g>
                            </svg>
                            <span className="text-[6px] text-slate-400 font-bold uppercase mt-1">Ficha {i} ✂️</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2 text-center text-[7px] text-slate-400 font-bold">
                      Taller Físico interactivo desarrollado para fortalecer el pensamiento lógico-matemático.
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* HISTORICAL EXPLORER: THE 15 CONVEX PENTAGONS THAT TILE THE PLANE */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
            <div className="space-y-2">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                Galería Histórica de Polypad
              </span>
              <h4 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <Layers className="w-6 h-6 text-indigo-600" />
                Los 15 Tipos de Pentágonos Convexos que Teselan el Plano
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                En 1918, Karl Reinhardt descubrió los primeros 5 tipos de pentágonos que cubren el plano. Durante décadas, matemáticos aficionados y profesionales buscaron más familias. En 1976 y 1977, la ama de casa estadounidense **Marjorie Rice** asombró al mundo al descubrir 4 familias adicionales usando métodos propios de diagrama. Finalmente, en 2017, la búsqueda terminó al demostrarse por computadora que **solo existen exactamente 15 tipos**. ¡Aquí puedes explorar sus asombrosas geometrías!
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" id="pentagons-explorer-grid">
              {PENTAGON_TYPES.map(p => (
                <div 
                  key={p.id}
                  className="bg-slate-50 hover:bg-white rounded-2xl p-4 border border-slate-100 hover:shadow-lg transition-all flex flex-col justify-between items-center text-center space-y-3"
                >
                  <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">
                    {p.name.split(' (')[0]}
                  </span>

                  <div className="w-20 h-20 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden">
                    <svg viewBox="0 0 100 100" className="w-16 h-16">
                      <g transform="translate(50, 50) scale(1.1)">
                        <polygon 
                          points={getPolygonPointsString(p.points)} 
                          fill={`${p.color}25`} 
                          stroke={p.color} 
                          strokeWidth="2.5" 
                        />
                      </g>
                    </svg>
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-bold text-[11px] text-slate-800 leading-tight">
                      {p.name.includes('(') ? p.name.split(' (')[1].replace(')', '') : p.name}
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                      {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NATURE IMAGE LIGHTBOX / ZOOM MODAL */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-slate-900/85 flex items-center justify-center p-4 z-50 animate-fadeIn backdrop-blur-sm"
          onClick={() => setZoomImage(null)}
        >
          <div 
            className="bg-white rounded-[2.5rem] overflow-hidden max-w-2xl w-full shadow-2xl border-4 border-white/10 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] bg-slate-100">
              <img 
                src={zoomImage.url} 
                alt={zoomImage.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
              />
              <button
                onClick={() => setZoomImage(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/65 hover:bg-black/80 flex items-center justify-center text-white text-lg transition-all cursor-pointer shadow-lg font-bold"
              >
                &times;
              </button>
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  {zoomImage.subtitle}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">Patrón Natural</span>
              </div>
              <h4 className="text-xl md:text-2xl font-black text-slate-800">
                {zoomImage.title}
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {zoomImage.desc}
              </p>
              <div className="border-t border-slate-100 pt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <span className="text-[10px] text-slate-400 italic">
                  {zoomImage.credit}
                </span>
                <button
                  onClick={() => setZoomImage(null)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-all"
                >
                  Cerrar Ventana
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>

    {/* ==================== ONLY PRINTABLE WORKSHEETS SHEET (HIDDEN ON SCREEN, REVEALED ON PRINT) ==================== */}
    {(() => {
      const activeCh = PRINT_CHALLENGES.find(c => c.id === activePrintChallengeId) || PRINT_CHALLENGES[0];
      const shapesArray = Array.from({ length: activeCh.piecesCountNum });

      return (
        <div className="hidden print:block bg-white text-black min-h-screen p-6 font-sans" id="print-sheet-layout">
          <div className="border-4 border-double border-black p-6 flex flex-col justify-between min-h-[290mm] space-y-4 relative">
            
            {/* PRINT HEADER */}
            <div className="border-b-4 border-black pb-3 text-center space-y-1">
              <h4 className="text-[9px] tracking-widest font-black uppercase text-black">PENSAMIENTO LÓGICO Y ESPACIAL • TALLER PRÁCTICO EN EL HOGAR</h4>
              <h2 className="text-xl font-black text-black uppercase">TESELACIONES Y MOSAICOS GEOMÉTRICOS</h2>
              <div className="flex justify-between items-center text-[9px] font-bold px-8 pt-1 text-black">
                <span>Estudiante: __________________________________________________</span>
                <span>Fecha: _________________</span>
              </div>
            </div>

            {/* CHALLENGE INFO */}
            <div className="border border-black p-4 bg-slate-50 rounded-xl space-y-2 text-left">
              <h3 className="text-xs font-black uppercase text-black">DESAFÍO PRÁCTICO: {activeCh.name}</h3>
              <p className="text-[10px] leading-relaxed text-black">
                <strong>Instrucciones de Trabajo:</strong> {activeCh.instructionStep} Recorta con extremo cuidado cada una de las fichas por su contorno punteado (✂️) y utilízalas para llenar por completo el "Marco de Trabajo Delimitado" de abajo.
              </p>
              
              {/* Coloring invitation on physical printed sheet */}
              <div className="bg-white p-2.5 rounded-lg border border-dashed border-black text-[9px] text-black flex items-start gap-1.5 leading-relaxed">
                <span className="text-sm select-none">🎨</span>
                <div>
                  <strong>¡PINTA TUS FICHAS ANTES DE CORTARLAS!</strong> Te invitamos a colorear cada pieza con tus tonos favoritos. Puedes diseñar patrones de colores alternos, degradados creativos o simetrías cromáticas para que tu mosaico final cobre vida y sea totalmente único.
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[9px] font-bold border-t border-slate-300 pt-1.5 text-black">
                <div>📏 Espacio a cubrir: {activeCh.spaceToCover}</div>
                <div>🧩 Fichas requeridas: {activeCh.piecesCount}</div>
                <div>🔴 Dificultad: {activeCh.difficulty}</div>
              </div>
            </div>

            {/* CALIBRATION SCALE */}
            <div className="flex justify-between items-center border border-dashed border-black p-2 rounded-lg bg-white">
              <span className="font-bold text-[8px] text-black">📏 Regla de calibración (Para asegurar la escala geométrica exacta al imprimir):</span>
              <div className="flex items-center gap-2">
                <div className="w-[189px] h-3 bg-white border border-black flex items-center justify-center text-[8px] font-black">5.0 cm EXACTOS</div>
              </div>
            </div>

            {/* DEFINED WORKSPACE BOUNDS (THE "ESPACIO DELIMITADO" REQUESTED BY USER) */}
            <div className="border-4 border-dashed border-black bg-white rounded-[2rem] p-4 text-center flex flex-col items-center justify-center min-h-[380px] w-full relative overflow-hidden">
              <span className="absolute top-3 left-3 z-10 text-[9px] bg-black text-white px-3 py-1 rounded-full font-black uppercase tracking-wider shadow">
                MARCO DE TRABAJO DELIMITADO (Acomoda o pega tus fichas aquí)
              </span>
              
              <div className="w-full max-w-[540px] aspect-[1.4] mx-auto mt-4">
                {renderWorkspaceGuideSVG(activeCh.id, true)}
              </div>

              <p className="text-[8px] text-black mt-3 font-black uppercase tracking-widest">
                ⚠️ Las piezas recortadas deben rellenar este marco siguiendo las líneas de guía sutiles sin solaparse.
              </p>
            </div>

            {/* CUTOUT PIECES GRID */}
            <div className="border-t-4 border-black pt-4">
              <h4 className="font-black text-[9px] text-center uppercase tracking-widest flex items-center justify-center gap-2 mb-3 text-black">
                ✂️ SECCIÓN DE CORTE: FICHAS PARA RECORTAR (RECORTA EXACTAMENTE LAS {activeCh.piecesCountNum} PIEZAS)
              </h4>
              
              <div className="grid grid-cols-4 gap-4 justify-center">
                {shapesArray.map((_, index) => {
                  const isFlippedEinstein = activeCh.id === 4 && index >= 10;
                  
                  return (
                    <div 
                      key={index} 
                      className="border border-dashed border-slate-600 p-2 flex flex-col items-center justify-center bg-white rounded-lg relative"
                      style={{ minHeight: '110px' }}
                    >
                      <span className="absolute top-1 right-1 text-[7px] font-bold text-slate-400">✂️</span>
                      
                      <svg viewBox="0 0 120 120" className="w-16 h-16">
                        <circle cx="60" cy="60" r="40" fill="none" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
                        
                        <g transform={`translate(60, 60) scale(${activeCh.shapeScale}) ${isFlippedEinstein ? 'scale(-1, 1)' : ''}`}>
                          <polygon 
                            points={getPolygonPointsString(activeCh.shapePoints)} 
                            fill="none" 
                            stroke="#000000" 
                            strokeWidth="2.5" 
                          />
                          {activeCh.id === 4 && (
                            <line x1="0" y1="0" x2="0" y2="25" stroke="#000000" strokeWidth="1" strokeDasharray="2,2" />
                          )}
                        </g>
                      </svg>

                      <span className="text-[8px] font-black uppercase text-black mt-1">
                        Pieza {index + 1}
                      </span>
                      {isFlippedEinstein && (
                        <span className="text-[7px] font-black text-rose-600 uppercase bg-rose-50 px-1 rounded border border-rose-200 mt-0.5">
                          👕 Reflejada
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SHEET FOOTER */}
            <div className="border-t border-black pt-2 text-center text-[8px] text-black font-bold uppercase tracking-wider">
              Desarrollado para el desarrollo integral del Pensamiento Lógico-Espacial y la Geometría en el Aula de Primaria y Secundaria.
            </div>

          </div>
        </div>
      );
    })()}
    </>
  );
};

export default MosaicDesign;
