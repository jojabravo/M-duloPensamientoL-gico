import React, { useState, useEffect } from 'react';
import { playSound } from '../audio';
import { StudentProfile } from '../types';

interface Props {
  student: StudentProfile;
  onBack: () => void;
  onComplete: (column: string, newProg: number) => void;
}

interface Cube {
  x: number; // Left-back row axis (0 to N)
  y: number; // Right-back col axis (0 to M)
  z: number; // Vertical height axis (0 to H)
}

interface Challenge {
  id: number;
  title: string;
  desc: string;
  cubes: Cube[];
  correctCount: number;
  options: string[];
}

const CubeCounting: React.FC<Props> = ({ student, onBack, onComplete }) => {
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [activeLevel, setActiveLevel] = useState<number>(1); // Relative level in block: 1 to 4
  const [userInput, setUserInput] = useState<string>('');
  const [isXray, setIsXray] = useState<boolean>(false);
  const [peelLayer, setPeelLayer] = useState<number>(3); // 0 to maxZ, hides upper floors

  // Track completed blocks for persistent dashboard progress
  const [completedBlocks, setCompletedBlocks] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(`completed_blocks_cubes_${student.Usuario}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const allChallenges: Challenge[] = [
    // --- BLOCK 1 (PDF challenges 1-4) ---
    {
      id: 1,
      title: 'Reto 1: La Cúpula Escalonada',
      desc: 'Suma de cubos (PDF Pregunta 1). Cuenta los cubos considerando los cimientos invisibles que soportan la estructura superior.',
      correctCount: 15,
      options: ['15', '12', '17', '16', '14'],
      cubes: [
        // Level 0 (3x3 solid)
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 },
        { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 },
        { x: 2, y: 0, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 2, y: 2, z: 0 },
        // Level 1
        { x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 1 }, { x: 0, y: 2, z: 1 },
        { x: 1, y: 1, z: 1 }, { x: 2, y: 1, z: 1 },
        // Level 2 (top)
        { x: 0, y: 1, z: 2 }
      ]
    },
    {
      id: 2,
      title: 'Reto 2: El Altar de Bloques',
      desc: 'Construcción con niveles intermedios (PDF Pregunta 2). Rápido, localiza todos los bloques para obtener la suma precisa.',
      correctCount: 16,
      options: ['14', '16', '17', '15', '18'],
      cubes: [
        // Level 0 (3x3 solid)
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 },
        { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 },
        { x: 2, y: 0, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 2, y: 2, z: 0 },
        // Level 1
        { x: 0, y: 1, z: 1 }, { x: 0, y: 2, z: 1 },
        { x: 1, y: 1, z: 1 }, { x: 1, y: 2, z: 1 },
        { x: 2, y: 2, z: 1 },
        // Level 2
        { x: 0, y: 2, z: 2 }, { x: 1, y: 2, z: 2 }
      ]
    },
    {
      id: 3,
      title: 'Reto 3: El Monumento Simétrico',
      desc: 'Una pirámide con un pilar alto (PDF Pregunta 3). Observa detenidamente cada columna de cubos.',
      correctCount: 18,
      options: ['17', '18', '19', '20', '21'],
      cubes: [
        // Level 0
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 },
        { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 },
        { x: 2, y: 0, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 3, y: 2, z: 0 },
        // Level 1
        { x: 0, y: 1, z: 1 }, { x: 0, y: 2, z: 1 },
        { x: 1, y: 1, z: 1 }, { x: 1, y: 2, z: 1 },
        { x: 2, y: 2, z: 1 },
        // Level 2
        { x: 0, y: 2, z: 2 }, { x: 1, y: 2, z: 2 },
        // Level 3
        { x: 0, y: 2, z: 3 }
      ]
    },
    {
      id: 4,
      title: 'Reto 4: Torre de Escaleras Cruzadas',
      desc: 'Estructura asimétrica (PDF Pregunta 4). Las columnas traseras soportan las escaleras delanteras.',
      correctCount: 19,
      options: ['21', '20', '19', '18', '17'],
      cubes: [
        // Level 0
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 }, { x: 0, y: 3, z: 0 },
        { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 },
        { x: 2, y: 0, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 3, y: 2, z: 0 },
        // Level 1
        { x: 0, y: 1, z: 1 }, { x: 0, y: 2, z: 1 }, { x: 0, y: 3, z: 1 },
        { x: 1, y: 1, z: 1 }, { x: 1, y: 2, z: 1 },
        { x: 2, y: 2, z: 1 },
        // Level 2
        { x: 0, y: 2, z: 2 }, { x: 1, y: 2, z: 2 }
      ]
    },

    // --- BLOCK 2 (PDF challenges 5-8) ---
    {
      id: 5,
      title: 'Reto 5: Terraza Cuadrangular',
      desc: 'Estructura en terraza de varios pisos (PDF Pregunta 5). Las columnas de los extremos se elevan sobre otras.',
      correctCount: 25,
      options: ['23', '24', '25', '27', '26'],
      cubes: [
        // Level 0
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 }, { x: 0, y: 3, z: 0 },
        { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 1, y: 3, z: 0 },
        { x: 2, y: 0, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 2, y: 3, z: 0 },
        // Level 1
        { x: 0, y: 1, z: 1 }, { x: 0, y: 2, z: 1 }, { x: 0, y: 3, z: 1 },
        { x: 1, y: 1, z: 1 }, { x: 1, y: 2, z: 1 }, { x: 1, y: 3, z: 1 },
        { x: 2, y: 2, z: 1 }, { x: 2, y: 3, z: 1 },
        // Level 2
        { x: 0, y: 2, z: 2 }, { x: 0, y: 3, z: 2 },
        { x: 1, y: 2, z: 2 }, { x: 1, y: 3, z: 2 },
        // Level 3
        { x: 0, y: 3, z: 3 }
      ]
    },
    {
      id: 6,
      title: 'Reto 6: El Templo de la Sabiduría',
      desc: 'Estructura de terraza extendida con base reforzada (PDF Pregunta 6). No pierdas de vista los bloques invisibles de atrás.',
      correctCount: 28,
      options: ['27', '26', '28', '29', '30'],
      cubes: [
        // Level 0
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 }, { x: 0, y: 3, z: 0 },
        { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 1, y: 3, z: 0 },
        { x: 2, y: 0, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 2, y: 3, z: 0 },
        { x: 3, y: 2, z: 0 }, { x: 3, y: 3, z: 0 },
        // Level 1
        { x: 0, y: 1, z: 1 }, { x: 0, y: 2, z: 1 }, { x: 0, y: 3, z: 1 },
        { x: 1, y: 1, z: 1 }, { x: 1, y: 2, z: 1 }, { x: 1, y: 3, z: 1 },
        { x: 2, y: 2, z: 1 }, { x: 2, y: 3, z: 1 },
        { x: 3, y: 3, z: 1 },
        // Level 2
        { x: 0, y: 2, z: 2 }, { x: 0, y: 3, z: 2 },
        { x: 1, y: 2, z: 2 }, { x: 1, y: 3, z: 2 },
        { x: 2, y: 3, z: 2 }
      ]
    },
    {
      id: 7,
      title: 'Reto 7: La Torre Escalonada',
      desc: 'Un complejo geométrico con entrantes y salientes (PDF Pregunta 7). Cuenta con precisión y paciencia.',
      correctCount: 24,
      options: ['22', '23', '24', '25', '26'],
      cubes: [
        // Level 0
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 }, { x: 0, y: 3, z: 0 },
        { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 1, y: 3, z: 0 },
        { x: 2, y: 1, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 2, y: 3, z: 0 },
        { x: 3, y: 3, z: 0 },
        // Level 1
        { x: 0, y: 1, z: 1 }, { x: 0, y: 2, z: 1 }, { x: 0, y: 3, z: 1 },
        { x: 1, y: 1, z: 1 }, { x: 1, y: 2, z: 1 }, { x: 1, y: 3, z: 1 },
        { x: 2, y: 2, z: 1 }, { x: 2, y: 3, z: 1 },
        // Level 2
        { x: 0, y: 2, z: 2 }, { x: 0, y: 3, z: 2 },
        { x: 1, y: 2, z: 2 }, { x: 1, y: 3, z: 2 }
      ]
    },
    {
      id: 8,
      title: 'Reto 8: La Fortaleza Gigante',
      desc: 'Una masiva construcción de alta densidad y 5x5 de base (PDF Pregunta 8). ¡La joya de la visión espacial!',
      correctCount: 48,
      options: ['46', '47', '48', '49', '45'],
      cubes: [
        // Level 0
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 }, { x: 0, y: 3, z: 0 }, { x: 0, y: 4, z: 0 },
        { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 1, y: 3, z: 0 }, { x: 1, y: 4, z: 0 },
        { x: 2, y: 0, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 2, y: 3, z: 0 }, { x: 2, y: 4, z: 0 },
        { x: 3, y: 1, z: 0 }, { x: 3, y: 2, z: 0 }, { x: 3, y: 3, z: 0 }, { x: 3, y: 4, z: 0 },
        { x: 4, y: 2, z: 0 }, { x: 4, y: 3, z: 0 }, { x: 4, y: 4, z: 0 },
        // Level 1
        { x: 0, y: 1, z: 1 }, { x: 0, y: 2, z: 1 }, { x: 0, y: 3, z: 1 }, { x: 0, y: 4, z: 1 },
        { x: 1, y: 1, z: 1 }, { x: 1, y: 2, z: 1 }, { x: 1, y: 3, z: 1 }, { x: 1, y: 4, z: 1 },
        { x: 2, y: 1, z: 1 }, { x: 2, y: 2, z: 1 }, { x: 2, y: 3, z: 1 }, { x: 2, y: 4, z: 1 },
        { x: 3, y: 2, z: 1 }, { x: 3, y: 3, z: 1 }, { x: 3, y: 4, z: 1 },
        { x: 4, y: 4, z: 1 },
        // Level 2
        { x: 0, y: 2, z: 2 }, { x: 0, y: 3, z: 2 }, { x: 0, y: 4, z: 2 },
        { x: 1, y: 2, z: 2 }, { x: 1, y: 3, z: 2 }, { x: 1, y: 4, z: 2 },
        { x: 2, y: 2, z: 2 }, { x: 2, y: 3, z: 2 }, { x: 2, y: 4, z: 2 },
        // Level 3
        { x: 0, y: 3, z: 3 }, { x: 0, y: 4, z: 3 }
      ]
    },

    // --- BLOCK 3 (PDF challenges 9-12) ---
    {
      id: 9,
      title: 'Reto 9: La Torre Con Voladizos',
      desc: 'Construcción asimétrica con salientes (PDF Pregunta 9). Mira bien el lado izquierdo de la base.',
      correctCount: 22,
      options: ['24', '20', '21', '22', '23'],
      cubes: [
        // Level 0
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 },
        { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 },
        { x: 2, y: 0, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 2, y: 2, z: 0 },
        { x: 3, y: 1, z: 0 }, { x: 3, y: 2, z: 0 },
        // Level 1
        { x: 0, y: 1, z: 1 }, { x: 0, y: 2, z: 1 },
        { x: 1, y: 1, z: 1 }, { x: 1, y: 2, z: 1 },
        { x: 2, y: 1, z: 1 }, { x: 2, y: 2, z: 1 },
        { x: 3, y: 2, z: 1 },
        // Level 2
        { x: 0, y: 2, z: 2 }, { x: 1, y: 2, z: 2 }, { x: 2, y: 2, z: 2 }, { x: 3, y: 2, z: 2 }
      ]
    },
    {
      id: 10,
      title: 'Reto 10: La Fortaleza Escalonada',
      desc: 'Súper estructura con pendientes pronunciadas (PDF Pregunta 10). Hay columnas que ascienden hasta el cielo.',
      correctCount: 38,
      options: ['36', '37', '38', '39', '40'],
      cubes: [
        // Level 0
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 }, { x: 0, y: 3, z: 0 },
        { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 1, y: 3, z: 0 },
        { x: 2, y: 0, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 2, y: 3, z: 0 },
        { x: 3, y: 0, z: 0 }, { x: 3, y: 1, z: 0 }, { x: 3, y: 2, z: 0 }, { x: 3, y: 3, z: 0 },
        { x: 4, y: 2, z: 0 }, { x: 4, y: 3, z: 0 },
        // Level 1
        { x: 0, y: 1, z: 1 }, { x: 0, y: 2, z: 1 }, { x: 0, y: 3, z: 1 },
        { x: 1, y: 1, z: 1 }, { x: 1, y: 2, z: 1 }, { x: 1, y: 3, z: 1 },
        { x: 2, y: 1, z: 1 }, { x: 2, y: 2, z: 1 }, { x: 2, y: 3, z: 1 },
        { x: 3, y: 2, z: 1 }, { x: 3, y: 3, z: 1 },
        { x: 4, y: 3, z: 1 },
        // Level 2
        { x: 0, y: 2, z: 2 }, { x: 0, y: 3, z: 2 },
        { x: 1, y: 2, z: 2 }, { x: 1, y: 3, z: 2 },
        { x: 2, y: 2, z: 2 }, { x: 2, y: 3, z: 2 },
        // Level 3
        { x: 0, y: 3, z: 3 }, { x: 1, y: 3, z: 3 }
      ]
    },
    {
      id: 11,
      title: 'Reto 11: Torre Doble de Paseo',
      desc: 'Dos torres unidas con un canal central de escalones (PDF Pregunta 11). Identifica los bloques ocultos en la base central.',
      correctCount: 27,
      options: ['26', '27', '28', '29', '25'],
      cubes: [
        // Level 0
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 }, { x: 0, y: 3, z: 0 },
        { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 1, y: 3, z: 0 },
        { x: 2, y: 1, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 2, y: 3, z: 0 },
        { x: 3, y: 2, z: 0 }, { x: 3, y: 3, z: 0 },
        // Level 1
        { x: 0, y: 1, z: 1 }, { x: 0, y: 2, z: 1 }, { x: 0, y: 3, z: 1 },
        { x: 1, y: 1, z: 1 }, { x: 1, y: 2, z: 1 }, { x: 1, y: 3, z: 1 },
        { x: 2, y: 2, z: 1 }, { x: 2, y: 3, z: 1 },
        { x: 3, y: 3, z: 1 },
        // Level 2
        { x: 0, y: 2, z: 2 }, { x: 0, y: 3, z: 2 },
        { x: 1, y: 2, z: 2 }, { x: 1, y: 3, z: 2 },
        { x: 2, y: 3, z: 2 }
      ]
    },
    {
      id: 12,
      title: 'Reto 12: Unidad Mínima de Bloques',
      desc: 'Un pequeño pero engañoso trío de escalones (PDF Pregunta 12). ¡Excelente para culminar tu entrenamiento!',
      correctCount: 10,
      options: ['6', '7', '9', '10', '18'],
      cubes: [
        // Level 0
        { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 },
        { x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 2, z: 0 },
        // Level 1
        { x: 0, y: 1, z: 1 }, { x: 0, y: 2, z: 1 },
        { x: 1, y: 2, z: 1 },
        // Level 2
        { x: 0, y: 2, z: 2 }
      ]
    }
  ];

  // Get current challenges list for active block
  const getActiveBlockChallenges = (): Challenge[] => {
    if (selectedBlock === null) return [];
    const startIndex = (selectedBlock - 1) * 4;
    return allChallenges.slice(startIndex, startIndex + 4);
  };

  const blockChallenges = getActiveBlockChallenges();
  const currentCh = blockChallenges[activeLevel - 1];

  // Dynamically calculate structure bounds so it fits perfectly on canvas
  const maxX = currentCh ? Math.max(...currentCh.cubes.map(c => c.x)) : 2;
  const maxY = currentCh ? Math.max(...currentCh.cubes.map(c => c.y)) : 2;
  const maxZ = currentCh ? Math.max(...currentCh.cubes.map(c => c.z)) : 2;

  // Compute scale and offsets dynamically so standard 320 viewBox never clips elements
  const size = maxX >= 4 || maxY >= 4 ? 18 : 24;
  const originX = 160; // Center values
  const originY = maxX >= 4 || maxY >= 4 ? 140 : 180;

  // Sync peel slider on level change
  useEffect(() => {
    if (currentCh) {
      setPeelLayer(maxZ);
    }
  }, [currentCh?.id, maxZ]);

  // Sort cubes from back to front, bottom to top to respect painter's visualization algorithm
  const sortedCubes = currentCh
    ? [...currentCh.cubes].sort((a, b) => {
        if (a.z !== b.z) return a.z - b.z;
        if (a.x !== b.x) return b.x - a.x; // Render backmost elements first (x decreases goes frontwards)
        return a.y - b.y; // Render leftmost elements first (y increases goes rightwards)
      })
    : [];

  const handleVerify = (valToVerify?: string) => {
    const checkValue = valToVerify !== undefined ? valToVerify : userInput;
    const parsed = parseInt(checkValue.trim(), 10);
    if (isNaN(parsed)) {
      playSound('error');
      alert('Por favor, ingresa o selecciona un número válido.');
      return;
    }

    if (parsed === currentCh.correctCount) {
      playSound('success');
      alert('¡Súper correcto! Tu visión espacial está muy bien entrenada.');
      setUserInput('');

      if (activeLevel < 4) {
        setActiveLevel(prev => prev + 1);
      } else {
        // Block completed!
        if (selectedBlock !== null) {
          const updated = [...completedBlocks];
          if (!updated.includes(selectedBlock)) {
            updated.push(selectedBlock);
          }
          setCompletedBlocks(updated);
          try {
            localStorage.setItem(
              `completed_blocks_cubes_${student.Usuario}`,
              JSON.stringify(updated)
            );
          } catch (e) {
            console.error(e);
          }

          // Calculate global progress
          const progressPercent = Math.round((updated.length / 3) * 100);
          onComplete('progreso_conteocubos', progressPercent);

          alert(`🏆 ¡Increíble! Has superado el Bloque ${selectedBlock} con 100% de aciertos.`);
          setSelectedBlock(null);
          setActiveLevel(1);
        }
      }
    } else {
      playSound('error');
      alert('La cuenta no es precisa en esta ocasión. Recuerda que no puedes ver todos los cubos desde la perspectiva, utiliza las herramientas para guiarte.');
    }
  };

  if (selectedBlock === null) {
    // Selection screen
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
        <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-purple-50 overflow-hidden mb-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl rotate-12">
              <i className="fas fa-cubes"></i>
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
                    Pensamiento Espacial • Bloque 3
                  </span>
                  <h3 className="text-3xl font-black tracking-tight text-white uppercase">Conteo de Cubos 3D</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-purple-50/20 border-b border-purple-50 flex items-center gap-4 text-xs font-semibold text-purple-900">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold shrink-0">
              <i className="fas fa-info-circle"></i>
            </div>
            <p>
              ¡Para completar esta sección debes superar los tres bloques de retos! Cada bloque contiene 4 retos complejos extraídos directamente de tu guía escolar de razonamiento matemático.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((blockNum) => {
            const isCompleted = completedBlocks.includes(blockNum);
            let colors = '';
            let subtitle = '';
            let desc = '';
            
            if (blockNum === 1) {
              colors = 'from-emerald-400 to-teal-500';
              subtitle = 'Retos 1 a 4';
              desc = 'Perfecto para empezar. Escaleras modulares, pirámides y cimientos de alta visibilidad.';
            } else if (blockNum === 2) {
              colors = 'from-purple-500 to-indigo-600';
              subtitle = 'Retos 5 a 8';
              desc = 'Torres y terrazas complejas. Requiere buen uso del filtro volumétrico de pisos.';
            } else {
              colors = 'from-pink-500 to-rose-600';
              subtitle = 'Retos 9 a 12';
              desc = 'Voladizos y estructuras avanzadas. El reto definitivo de visión espacial en 3D.';
            }

            return (
              <div
                key={blockNum}
                className="bg-white rounded-3xl border border-slate-150 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div className={`h-24 bg-gradient-to-r ${colors} p-6 text-white relative`}>
                  <div className="absolute right-3 bottom-0 opacity-15 text-5xl font-black">
                    #{blockNum}
                  </div>
                  <span className="text-[9px] font-extrabold uppercase bg-white/20 px-2.5 py-1 rounded-full">
                    {subtitle}
                  </span>
                  <h4 className="font-extrabold text-base uppercase mt-1">Bloque {blockNum}</h4>
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6">
                    {desc}
                  </p>

                  <div className="space-y-3">
                    {isCompleted ? (
                      <div className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-wider">
                        <i className="fas fa-check-circle"></i> Superado
                      </div>
                    ) : (
                      <div className="text-center py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider border border-dashed">
                        Pendiente
                      </div>
                    )}

                    <button
                      onClick={() => {
                        playSound('pop');
                        setSelectedBlock(blockNum);
                        setActiveLevel(1);
                      }}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                    >
                      {isCompleted ? 'Volver a Jugar' : 'Iniciar Retos'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn px-4 py-8">
      {/* Header Info */}
      <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-purple-50 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl rotate-12">
            <i className="fas fa-cubes"></i>
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => { playSound('pop'); setSelectedBlock(null); }}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/20 px-4 py-1.5 rounded-full mb-1.5 inline-block">
                  Bloque {selectedBlock} • Actividad Activa
                </span>
                <h3 className="text-2xl font-black tracking-tight text-white uppercase">Reto {activeLevel} de 4</h3>
              </div>
            </div>
            
            <button
              onClick={() => { playSound('pop'); setSelectedBlock(null); }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all"
            >
              Cambiar de Bloque
            </button>
          </div>
        </div>

        <div className="p-6 bg-purple-50/20 border-b border-purple-50 flex items-center gap-4 text-xs font-semibold text-purple-900">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold shrink-0 animate-bounce">
            <i className="fas fa-cube"></i>
          </div>
          <p>
            Recuerda el <strong>Principio de Gravedad</strong> de los cubos tridimensionales: ningún bloque puede flotar suspendido en el aire sin cimientos. ¡Usa las herramientas de Rayos-X o el filtro de pisos para contar los ocultos!
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Isometric Render */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-150 shadow-xl flex flex-col items-center gap-6 relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => { playSound('pop'); setIsXray(!isXray); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                isXray
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-purple-600 border-purple-200'
              }`}
            >
              <i className="fas fa-eye mr-1.5"></i>
              {isXray ? 'Rayos-X Activados' : 'Separador de Bloques'}
            </button>
          </div>

          <div className="text-center w-full">
            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">
              Pregunta {currentCh.id} (PDF)
            </span>
            <h4 className="font-extrabold text-lg text-slate-800 uppercase mt-2 mb-1">
              {currentCh.title}
            </h4>
            <p className="text-xs text-slate-400 font-bold uppercase max-w-sm mx-auto leading-relaxed">
              {currentCh.desc}
            </p>
          </div>

          {/* SVG Canvas for Isometric Cubes */}
          <div className="w-full max-w-sm aspect-square bg-slate-50/50 rounded-[2rem] border border-slate-100 overflow-hidden flex items-center justify-center p-4">
            <svg
              viewBox="0 0 320 320"
              className="w-full h-full max-h-[300px] transition-transform duration-500 hover:scale-102 font-sans"
            >
              {/* Draw isometric blocks */}
              {sortedCubes.map((c, i) => {
                // Filter by peel layer (hide cubes on z levels larger than peelLayer)
                if (c.z > peelLayer) return null;

                // Screen projection logic:
                // screenX = center + (colOffset - rowOffset)
                // screenY = bottom - (colOffset + rowOffset) - verticalHeightOffset
                const sx = originX + (c.y - c.x) * size * 1.22;
                const sy = originY + (c.x + c.y) * size * 0.7 - c.z * size * 1.4;

                // Polygon Faces Coordinates
                const topFace = `${sx},${sy - size * 1.4} ${sx + size * 1.22},${sy - size * 0.7} ${sx},${sy} ${sx - size * 1.22},${sy - size * 0.7}`;
                const leftFace = `${sx - size * 1.22},${sy - size * 0.7} ${sx},${sy} ${sx},${sy + size * 1.4} ${sx - size * 1.22},${sy + size * 0.7}`;
                const rightFace = `${sx},${sy} ${sx + size * 1.22},${sy - size * 0.7} ${sx + size * 1.22},${sy + size * 0.7} ${sx},${sy + size * 1.4}`;

                // Dynamic colors reflecting ray-X status
                const topFill = isXray ? 'rgba(168, 85, 247, 0.25)' : '#e2e8f0';
                const leftFill = isXray ? 'rgba(147, 51, 234, 0.35)' : '#cbd5e1';
                const rightFill = isXray ? 'rgba(126, 34, 206, 0.45)' : '#94a3b8';
                const strokeColor = isXray ? '#a855f7' : '#475569';
                const strokeWidth = isXray ? 1.5 : 1.2;

                return (
                  <g key={i} className="cursor-pointer group">
                    <title>Bloque en X: {c.x}, Y: {c.y}, Piso: {c.z + 1}</title>
                    {/* Left Face */}
                    <polygon
                      points={leftFace}
                      fill={leftFill}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                    />
                    {/* Right Face */}
                    <polygon
                      points={rightFace}
                      fill={rightFill}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                    />
                    {/* Top Face */}
                    <polygon
                      points={topFace}
                      fill={topFill}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                    />
                    {/* Floating label inside only on hover */}
                    <text
                      x={sx}
                      y={sy - size * 0.5}
                      fill={isXray ? '#7e22ce' : '#334155'}
                      textAnchor="middle"
                      className="text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity font-mono pointer-events-none"
                    >
                      {c.z + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Peeling UI Selector */}
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
              <span>Filtro de Pisos</span>
              <span className="text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full text-[9px] font-black">
                Mostrando: Piso 1 a {peelLayer + 1}
              </span>
            </div>
            
            <input
              type="range"
              min="0"
              max={maxZ}
              value={peelLayer}
              onChange={(e) => { playSound('pop'); setPeelLayer(parseInt(e.target.value, 10)); }}
              className="w-full accent-purple-600 cursor-ew-resize"
            />
            
            <div className="flex justify-between text-[8px] text-slate-400 font-black uppercase tracking-wider">
              <span>Solo Base</span>
              {maxZ > 1 && <span>Filtros Medios</span>}
              <span>Estructura Completa</span>
            </div>
          </div>
        </div>

        {/* Right Side: Multiple Choice & Keyboard Answer Input */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-150 shadow-xl space-y-6">
            <h4 className="font-extrabold text-sm text-purple-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-purple-50 pb-3">
              <i className="fas fa-check-double"></i> Selecciona o Escribe tu Respuesta
            </h4>

            {/* Multiple Choice Options (matching the PDF format) */}
            <div className="grid grid-cols-5 gap-2 pb-2">
              {currentCh.options.map((opt, oIdx) => {
                const letter = ['a', 'b', 'c', 'd', 'e'][oIdx];
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      playSound('pop');
                      handleVerify(opt);
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer group"
                  >
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase group-hover:text-purple-600 mb-1">
                      {letter})
                    </span>
                    <span className="text-sm font-black text-slate-700">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative flex items-center gap-2 text-xs text-slate-400 font-bold uppercase py-2">
              <div className="flex-grow border-t border-slate-100"></div>
              <span>o escribe la cantidad</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="number"
                  placeholder="Ej. 15"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-purple-500 font-bold text-center text-lg focus:outline-none transition-all"
                />
                <button
                  onClick={() => handleVerify()}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  VERIFICAR
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-150 rounded-2xl text-[10px] text-slate-500 leading-relaxed font-semibold">
              <div className="flex gap-2 items-start mb-2 text-purple-700">
                <i className="fas fa-lightbulb mt-0.5"></i>
                <span className="font-bold uppercase tracking-wider text-[9px]">Sugerencia Lógica:</span>
              </div>
              Intenta contar fila por fila o columna por columna. No te olvides de contar los bloques invisibles de los cimientos que soportan los bloques que están a mayor altura. Puedes deslizar la barra de análisis de capas para aislarlos piso por piso.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CubeCounting;
