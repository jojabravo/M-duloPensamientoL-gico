import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../audio';
import { jsPDF } from 'jspdf';
import { StudentProfile } from '../types';
import { IsometricWorkshop } from './IsometricWorkshop';

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

const getChallengeQuestionText = (id: number): string => {
  if (id === 1) return '¿Cuántos cubos se emplearon en la siguiente figura?';
  if (id === 2) return '¿Cuántos cubos se emplearon en la siguiente construcción?';
  if (id === 3) return '¿Cuántos cubos iguales se emplearon en la siguiente construcción?';
  if (id === 4) return '¿Cuántos cubos se emplearon en la siguiente construcción?';
  if (id === 5) return '¿Cuántos cubitos hay en la siguiente construcción?';
  if (id === 6) return '¿Cuántos cubitos hay en la siguiente construcción?';
  if (id === 7) return '¿Cuántos cubitos tiene la siguiente construcción?';
  if (id === 8) return '¿Cuántos cubitos tiene la siguiente construcción?';
  if (id === 9) return '¿Cuántos cubitos tiene la siguiente construcción?';
  if (id === 10) return '¿Cuántos cubitos hay en la siguiente construcción?';
  if (id === 11) return '¿Cuántos cubitos hay en la siguiente construcción?';
  if (id === 12) return '¿Cuántos cubitos hay en la siguiente construcción?';
  return '¿Cuántos cubos se emplearon en la siguiente construcción?';
};

const CubeCounting: React.FC<Props> = ({ student, onBack, onComplete }) => {
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [activeLevel, setActiveLevel] = useState<number>(1); // Relative level in block: 1 to 4
  const [userInput, setUserInput] = useState<string>('');
  const [isXray, setIsXray] = useState<boolean>(false);
  const [peelLayer, setPeelLayer] = useState<number>(3); // 0 to maxZ, hides upper floors
  const [showWorkshop, setShowWorkshop] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    title: string;
    message: string;
    isBlockComplete?: boolean;
    nextLevel?: number;
    blockId?: number;
  } | null>(null);

  // Viewpoint perspective state: 'isometric' | 'frontal' | 'lateral' | 'superior'
  const [viewpoint, setViewpoint] = useState<'isometric' | 'frontal' | 'lateral' | 'superior'>('isometric');
  const [showColumnHeights, setShowColumnHeights] = useState<boolean>(false);

  // Simulation state: how many cubes are currently placed/fallen
  const [simulatedCount, setSimulatedCount] = useState<number>(0);
  const [isPlayingSim, setIsPlayingSim] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(500); // ms per cube

  // Track completed blocks for persistent dashboard progress
  const [completedBlocks, setCompletedBlocks] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(`completed_blocks_cubes_${student.Usuario}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Track cube visual style
  const [cubeStyle, setCubeStyle] = useState<'textbook' | 'colorful' | 'neon'>(() => {
    try {
      const stored = localStorage.getItem(`cubecounting_style_${student.Usuario}`);
      return (stored as 'textbook' | 'colorful' | 'neon') || 'textbook';
    } catch {
      return 'textbook';
    }
  });

  const allChallenges: Challenge[] = [
    // --- BLOCK 1 (PDF challenges 1-4) ---
    {
      id: 1,
      title: 'Reto 1: Estructura Escalonada del Libro',
      desc: 'Suma de cubos (Pregunta 1 del Libro). Cuenta los cubos considerando los cimientos invisibles que soportan la estructura superior.',
      correctCount: 17,
      options: ['15', '12', '17', '16', '14'],
      cubes: [
        // Level 0 (solid 4x3 base of 12 cubes)
        { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 3, y: 1, z: 0 },
        { x: 0, y: 2, z: 0 }, { x: 1, y: 2, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 3, y: 2, z: 0 },
        // Level 1 (5 cubes on the second level)
        { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 2, y: 0, z: 1 },
        { x: 0, y: 1, z: 1 }, { x: 2, y: 1, z: 1 }
      ]
    },
    {
      id: 2,
      title: 'Reto 2: El Altar de Cubos',
      desc: 'Construcción con niveles intermedios (PDF Pregunta 2). Rápido, localiza todos los cubos para obtener la suma precisa.',
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
      title: 'Reto 12: Unidad Mínima de Cubos',
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

  // Check if all cubes in current challenge adhere to gravity rules
  const checkStability = (cubes: Cube[]): { stable: boolean; floating: Cube[] } => {
    const floating: Cube[] = [];
    cubes.forEach(c => {
      if (c.z > 0) {
        // Need a cube directly underneath it (same x, y, and z - 1)
        const hasSupport = cubes.some(other => other.x === c.x && other.y === c.y && other.z === c.z - 1);
        if (!hasSupport) {
          floating.push(c);
        }
      }
    });
    return { stable: floating.length === 0, floating };
  };

  const handleExportAllChallengesPDF = () => {
    playSound('success');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    // Page 1 Header
    doc.setFillColor(79, 70, 229); // Indigo
    doc.rect(15, 15, 185.9, 22, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text('GUIA DE TRABAJO • RAZONAMIENTO ESPACIAL Y CONTEO DE CUBOS 3D', 20, 21.5);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('12 Retos Isométricos Oficiales - Pensamiento Lógico y Estabilidad Tridimensional', 20, 26.5);

    // Student info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);
    doc.setFont('Helvetica', 'bold');
    doc.text('Estudiante:', 15, 45);
    doc.setFont('Helvetica', 'normal');
    doc.line(33, 45, 100, 45);
    doc.text(student.Nombre || student.Usuario || '___________________________', 35, 44);

    doc.setFont('Helvetica', 'bold');
    doc.text('Fecha:', 105, 45);
    doc.setFont('Helvetica', 'normal');
    const today = new Date().toLocaleDateString('es-ES');
    doc.text(today, 116, 44);
    doc.line(115, 45, 140, 45);

    doc.setFont('Helvetica', 'bold');
    doc.text('Institución:', 145, 45);
    doc.setFont('Helvetica', 'normal');
    doc.text('Institución Educativa Josefa Campos', 163, 44);
    doc.line(162, 45, 200, 45);

    // Rule explanation
    doc.setFillColor(243, 244, 246);
    doc.rect(15, 49, 185.9, 11, 'F');
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.1);
    doc.rect(15, 49, 185.9, 11, 'D');

    doc.setTextColor(75, 85, 99);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('REGLA DE ESTABILIDAD TRIDIMENSIONAL (GRAVEDAD):', 18, 53.5);
    doc.setFont('Helvetica', 'normal');
    doc.text('Todo bloque en el nivel 2 debe tener soporte en el nivel 1; y en el nivel 3 debe tener dos soportes debajo.', 18, 57);

    const colWidth = 88;
    const colGap = 9.9;
    const leftMargin = 15;
    
    const drawChallengeInBox = (chId: number, col: number, row: number, startY: number, rowHeight: number) => {
      const ch = allChallenges[chId - 1];
      if (!ch) return;

      const cx = leftMargin + col * (colWidth + colGap) + colWidth / 2;
      const cy = startY + row * rowHeight + 38;

      // Box border
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.2);
      doc.setFillColor(255, 255, 255);
      const bx = leftMargin + col * (colWidth + colGap);
      const by = startY + row * rowHeight;
      doc.roundedRect(bx, by, colWidth, rowHeight - 4, 3, 3, 'FD');

      // Box Header
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(bx, by, colWidth, 7, 3, 3, 'F');
      doc.rect(bx, by + 4, colWidth, 3, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.line(bx, by + 7, bx + colWidth, by + 7);

      // Box Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(79, 70, 229);
      doc.text(`RETO ${ch.id}: ${ch.title.toUpperCase()}`, bx + 4, by + 4.8);

      const sorted = [...ch.cubes].sort((a, b) => {
        if (a.z !== b.z) return a.z - b.z;
        if (a.x !== b.x) return b.x - a.x;
        return a.y - b.y;
      });

      const size = 3.6;
      const dx = size * 0.866;

      const projected = sorted.map(c => {
        const px = (c.y - c.x) * size * 0.866;
        const py = (c.x + c.y) * size * 0.5 - c.z * size;
        return { px, py };
      });

      const minX = Math.min(...projected.map(p => p.px));
      const maxX = Math.max(...projected.map(p => p.px));
      const minY = Math.min(...projected.map(p => p.py));
      const maxY = Math.max(...projected.map(p => p.py));

      const boxCenterX = (minX + maxX) / 2;
      const boxCenterY = (minY + maxY) / 2;

      sorted.forEach((c) => {
        const rawPx = (c.y - c.x) * size * 0.866;
        const rawPy = (c.x + c.y) * size * 0.5 - c.z * size;

        const px = cx - boxCenterX + rawPx;
        const py = cy - boxCenterY + rawPy - 2;

        const topFill = [255, 255, 255];
        const leftFill = [240, 240, 240];
        const rightFill = [210, 210, 210];

        doc.setLineWidth(0.18);
        doc.setDrawColor(17, 24, 39);

        // Top Face
        doc.setFillColor(topFill[0], topFill[1], topFill[2]);
        doc.triangle(px, py - size, px + dx, py - 0.5 * size, px, py, 'FD');
        doc.triangle(px, py - size, px, py, px - dx, py - 0.5 * size, 'FD');

        // Left Face
        doc.setFillColor(leftFill[0], leftFill[1], leftFill[2]);
        doc.triangle(px - dx, py - 0.5 * size, px, py, px, py + size, 'FD');
        doc.triangle(px - dx, py - 0.5 * size, px, py + size, px - dx, py + 0.5 * size, 'FD');

        // Right Face
        doc.setFillColor(rightFill[0], rightFill[1], rightFill[2]);
        doc.triangle(px, py, px + dx, py - 0.5 * size, px + dx, py + 0.5 * size, 'FD');
        doc.triangle(px, py, px + dx, py + 0.5 * size, px, py + size, 'FD');
      });

      // Options
      const optionsY = by + rowHeight - 16;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text('Opciones:', bx + 4, optionsY);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7);
      
      let optText = '';
      ch.options.forEach((opt, oIdx) => {
        const letter = ['a', 'b', 'c', 'd', 'e'][oIdx];
        optText += `   [  ]  ${letter}) ${opt}     `;
      });
      doc.text(optText, bx + 12, optionsY);

      // Justification line
      doc.setDrawColor(209, 213, 219);
      doc.line(bx + 4, by + rowHeight - 9, bx + colWidth - 4, by + rowHeight - 9);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(6.2);
      doc.setTextColor(100, 116, 139);
      doc.text('Respuesta: ______________  Justificación: _________________________________', bx + 4, by + rowHeight - 5.5);
    };

    // Page 1: 1, 2, 3, 4
    let rowHeightP1 = 98;
    for (let c = 0; c < 2; c++) {
      for (let r = 0; r < 2; r++) {
        const chId = r * 2 + c + 1;
        drawChallengeInBox(chId, c, r, 64, rowHeightP1);
      }
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text('Página 1 de 3 • Ficha Técnica de Razonamiento Isométrico', 15, 271);
    doc.text('Desarrollado con Tecnología de Simulación Física de Cubos 3D', 130, 271);

    // Page 2: 5, 6, 7, 8
    doc.addPage();
    doc.setFillColor(79, 70, 229);
    doc.rect(15, 12, 185.9, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('GUIA DE TRABAJO • RAZONAMIENTO ESPACIAL Y CONTEO DE CUBOS 3D', 20, 17.5);

    let rowHeightOthers = 114;
    for (let c = 0; c < 2; c++) {
      for (let r = 0; r < 2; r++) {
        const chId = r * 2 + c + 5;
        drawChallengeInBox(chId, c, r, 25, rowHeightOthers);
      }
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text('Página 2 de 3 • Ficha Técnica de Razonamiento Isométrico', 15, 271);
    doc.text('Desarrollado con Tecnología de Simulación Física de Cubos 3D', 130, 271);

    // Page 3: 9, 10, 11, 12
    doc.addPage();
    doc.setFillColor(79, 70, 229);
    doc.rect(15, 12, 185.9, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('GUIA DE TRABAJO • RAZONAMIENTO ESPACIAL Y CONTEO DE CUBOS 3D', 20, 17.5);

    for (let c = 0; c < 2; c++) {
      for (let r = 0; r < 2; r++) {
        const chId = r * 2 + c + 9;
        drawChallengeInBox(chId, c, r, 25, rowHeightOthers);
      }
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text('Página 3 de 3 • Ficha Técnica de Razonamiento Isométrico', 15, 271);
    doc.text('Desarrollado con Tecnología de Simulación Física de Cubos 3D', 130, 271);

    doc.save(`Ficha_Razonamiento_Espacial_12_Retos_${student.Usuario}.pdf`);
  };

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

  // Sync peel slider and simulation on level change
  useEffect(() => {
    if (currentCh) {
      setPeelLayer(maxZ);
      setSimulatedCount(currentCh.cubes.length);
      setIsPlayingSim(false);
    }
  }, [currentCh?.id, maxZ]);

  // Simulation play loop
  useEffect(() => {
    let timer: any = null;
    if (isPlayingSim && currentCh) {
      timer = setInterval(() => {
        setSimulatedCount((prev) => {
          if (prev >= currentCh.cubes.length) {
            setIsPlayingSim(false);
            return prev;
          }
          playSound('pop');
          return prev + 1;
        });
      }, simSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlayingSim, currentCh?.id, simSpeed]);

  // Sort cubes from back to front, bottom to top to respect painter's visualization algorithm
  const sortedCubes = currentCh
    ? [...currentCh.cubes].sort((a, b) => {
        if (a.z !== b.z) return a.z - b.z;
        if (a.x !== b.x) return b.x - a.x; // Render backmost elements first (x decreases goes frontwards)
        return a.y - b.y; // Render leftmost elements first (y increases goes rightwards)
      })
    : [];

  // For each (x, y) column, find the top visible cube on or below the peelLayer
  const visibleCubes = sortedCubes.slice(0, simulatedCount).filter(c => c.z <= peelLayer);
  const columnTopsMap = new Map<string, typeof sortedCubes[0]>();
  visibleCubes.forEach(c => {
    const key = `${c.x},${c.y}`;
    const existing = columnTopsMap.get(key);
    if (!existing || c.z > existing.z) {
      columnTopsMap.set(key, c);
    }
  });

  const triggerConfetti = () => {
    // Explosion from the center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    // Two side bursts for extra celebratory feels
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
    }, 150);
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 150);
  };

  const handleVerify = (valToVerify?: string) => {
    const checkValue = valToVerify !== undefined ? valToVerify : userInput;
    const parsed = parseInt(checkValue.trim(), 10);
    if (isNaN(parsed)) {
      playSound('error');
      setFeedback({
        show: true,
        isCorrect: false,
        title: 'Valor Inválido',
        message: 'Por favor, ingresa o selecciona un número válido de cubos.'
      });
      return;
    }

    if (parsed === currentCh.correctCount) {
      playSound('success');
      triggerConfetti();
      setUserInput('');

      if (activeLevel < 4) {
        setFeedback({
          show: true,
          isCorrect: true,
          title: '¡Respuesta Correcta!',
          message: '¡Súper correcto! Tu visión espacial está muy bien entrenada.',
          nextLevel: activeLevel + 1
        });
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

          setFeedback({
            show: true,
            isCorrect: true,
            isBlockComplete: true,
            title: '🏆 ¡Grupo de Retos Completado!',
            message: `¡Increíble! Has superado todo el Grupo ${selectedBlock} de retos con 100% de aciertos.`,
            blockId: selectedBlock
          });
        }
      }
    } else {
      playSound('error');
      setFeedback({
        show: true,
        isCorrect: false,
        title: 'Sigue Intentándolo',
        message: 'La cuenta no es precisa en esta ocasión. Recuerda que no puedes ver todos los cubos desde la perspectiva, utiliza las herramientas como la caída de bloques o la vista de rayos X para guiarte.'
      });
    }
  };

  if (showWorkshop) {
    return <IsometricWorkshop student={student} onClose={() => { playSound('pop'); setShowWorkshop(false); }} />;
  }

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
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

              <button
                onClick={handleExportAllChallengesPDF}
                className="px-5 py-3 bg-white hover:bg-purple-50 text-purple-700 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer border border-purple-100 shrink-0 self-stretch sm:self-auto justify-center"
              >
                <i className="fas fa-file-pdf text-red-500 animate-pulse text-sm"></i>
                <span>Descargar Ficha PDF (12 Retos)</span>
              </button>
            </div>
          </div>

          <div className="p-6 bg-purple-50/20 border-b border-purple-50 flex items-center gap-4 text-xs font-semibold text-purple-900">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold shrink-0">
              <i className="fas fa-info-circle"></i>
            </div>
            <p>
              ¡Para completar esta sección debes superar los tres grupos de retos! Cada grupo contiene 4 retos complejos extraídos directamente de tu guía escolar de razonamiento matemático.
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
                  <h4 className="font-extrabold text-base uppercase mt-1">Grupo {blockNum} de Retos</h4>
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

        {/* Banner Taller Imprimible de Dibujo Isométrico */}
        <div className="mt-8 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-[2.5rem] p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 text-[10rem] rotate-12 pointer-events-none">
            <i className="fas fa-print"></i>
          </div>
          <div className="space-y-2 max-w-xl relative z-10">
            <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              NUEVO • ACTIVIDAD PRÁCTICA
            </span>
            <h4 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              Taller de Dibujo en Red Isométrica (Puntos)
            </h4>
            <p className="text-xs md:text-sm text-white/95 font-medium leading-relaxed">
              ¿Quieres practicar tus habilidades de dibujo técnico y espacial en papel? Abre nuestro taller interactivo, explora las 12 figuras del libro, construye con bloques virtuales, y obtén una plantilla lista para imprimir con tu red isométrica de puntos.
            </p>
          </div>
          <button
            onClick={() => {
              playSound('success');
              setShowWorkshop(true);
            }}
            className="px-6 py-4 bg-white hover:bg-amber-50 text-orange-600 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer relative z-10"
          >
            <i className="fas fa-palette text-sm"></i>
            <span>Ver Taller e Imprimir</span>
          </button>
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
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => { playSound('pop'); setSelectedBlock(null); }}
                className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/20 px-4 py-1.5 rounded-full mb-1.5 inline-block">
                  Grupo {selectedBlock} de Retos • Actividad Activa
                </span>
                <h3 className="text-2xl font-black tracking-tight text-white uppercase">Reto {activeLevel} de 4</h3>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto self-stretch sm:self-auto">
              <button
                onClick={handleExportAllChallengesPDF}
                className="px-4 py-2.5 bg-white hover:bg-purple-50 text-purple-700 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <i className="fas fa-file-pdf text-red-500"></i>
                <span>Descargar Ficha PDF</span>
              </button>

              <button
                onClick={() => { playSound('pop'); setSelectedBlock(null); }}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all text-center justify-center flex"
              >
                Cambiar de Grupo
              </button>
            </div>
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
          <div className="text-center w-full space-y-3">
            <span className="text-[10px] bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full font-black uppercase tracking-widest border border-slate-200">
              Pregunta {currentCh.id} del Libro (PDF)
            </span>
            <h3 className="font-extrabold text-xl text-slate-900 leading-snug max-w-xl mx-auto mt-2">
              {getChallengeQuestionText(currentCh.id)}
            </h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {currentCh.title}
            </p>
          </div>



          {/* SVG Canvas for Isometric Cubes (Static textbook style) */}
          <div className="w-full max-w-sm aspect-square bg-white rounded-[2rem] border-2 border-slate-200 overflow-hidden flex items-center justify-center p-6 shadow-inner relative">
            <div className="absolute top-2 left-2 text-[9px] font-bold text-slate-300 font-mono">FIG. {currentCh.id}</div>
            <svg
              viewBox="0 0 320 320"
              className="w-full h-full max-h-[290px] font-sans"
            >

              {sortedCubes.map((c, idx) => {
                // Screen projection logic
                const sx = originX + (c.y - c.x) * size * 1.22;
                const sy = originY + (c.x + c.y) * size * 0.7 - c.z * size * 1.4;

                // Polygon Faces Coordinates
                const topFace = `${sx},${sy - size * 1.4} ${sx + size * 1.22},${sy - size * 0.7} ${sx},${sy} ${sx - size * 1.22},${sy - size * 0.7}`;
                const leftFace = `${sx - size * 1.22},${sy - size * 0.7} ${sx},${sy} ${sx},${sy + size * 1.4} ${sx - size * 1.22},${sy + size * 0.7}`;
                const rightFace = `${sx},${sy} ${sx + size * 1.22},${sy - size * 0.7} ${sx + size * 1.22},${sy + size * 0.7} ${sx},${sy + size * 1.4}`;

                // Standard textbook style - pure white faces with clean thick borders
                const topFill = '#ffffff';
                const leftFill = '#ffffff';
                const rightFill = '#ffffff';
                const strokeColor = '#111827';
                const strokeWidth = 2;

                const isNewest = idx === simulatedCount - 1;

                return (
                  <g key={idx} className={`cursor-pointer group ${isNewest ? 'animate-cube-fall' : ''}`}>
                    <title>Cubo en X: {c.x}, Y: {c.y}, Piso: {c.z + 1}</title>
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
                  </g>
                );
              })}

              {/* VIEWPOINT 2: FRONTAL (2D Front Elevation) */}
              {viewpoint === 'frontal' && (() => {
                const colsF = maxY + 1;
                const rowsF = maxZ + 1;
                const cellWF = Math.min(38, Math.floor(180 / Math.max(colsF, rowsF, 3)));
                const gridWF = colsF * cellWF;
                const gridHF = rowsF * cellWF;
                const startXF = 160 - gridWF / 2;
                const startYF = 160 + gridHF / 2;

                const visibleCubes = sortedCubes.slice(0, simulatedCount).filter(c => c.z <= peelLayer);
                const cells = [];
                for (let z = 0; z <= maxZ; z++) {
                  for (let y = 0; y <= maxY; y++) {
                    const matchingCubes = visibleCubes.filter(c => c.y === y && c.z === z);
                    if (matchingCubes.length > 0) {
                      const isNewest = matchingCubes.some(c => {
                        const latest = visibleCubes[visibleCubes.length - 1];
                        return latest && c.x === latest.x && c.y === latest.y && c.z === latest.z;
                      });
                      cells.push({ xPos: y, yPos: z, isNewest, cubesCount: matchingCubes.length });
                    }
                  }
                }

                return (
                  <g id="frontal-view-projection">
                    {/* Grid Guide Outline */}
                    <rect x={startXF} y={startYF - gridHF} width={gridWF} height={gridHF} fill="rgba(241, 245, 249, 0.4)" stroke="#cbd5e1" strokeWidth="2" rx="8" />
                    {Array.from({ length: colsF + 1 }).map((_, i) => (
                      <line
                        key={`col-${i}`}
                        x1={startXF + i * cellWF}
                        y1={startYF - gridHF}
                        x2={startXF + i * cellWF}
                        y2={startYF}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                        strokeDasharray="2,3"
                      />
                    ))}
                    {Array.from({ length: rowsF + 1 }).map((_, i) => (
                      <line
                        key={`row-${i}`}
                        x1={startXF}
                        y1={startYF - i * cellWF}
                        x2={startXF + gridWF}
                        y2={startYF - i * cellWF}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                        strokeDasharray="2,3"
                      />
                    ))}

                    {/* Projection Squares */}
                    {cells.map((cell, idx) => {
                      const rx = startXF + cell.xPos * cellWF + 2;
                      const ry = startYF - (cell.yPos + 1) * cellWF + 2;
                      const rw = cellWF - 4;
                      const rh = cellWF - 4;

                      return (
                        <g key={idx} className={cell.isNewest ? 'animate-cube-fall' : ''}>
                          <rect
                            x={rx}
                            y={ry}
                            width={rw}
                            height={rh}
                            fill={cubeStyle === 'textbook' ? '#ffffff' : 'url(#frontCubeGrad)'}
                            stroke={cubeStyle === 'textbook' ? '#111827' : '#312e81'}
                            strokeWidth={cubeStyle === 'textbook' ? '2' : '2'}
                            rx="6"
                          />
                          <text
                            x={rx + rw / 2}
                            y={ry + rh / 2 + 3}
                            textAnchor="middle"
                            fill={cubeStyle === 'textbook' ? '#111827' : '#ffffff'}
                            className="text-[9px] font-black font-sans"
                          >
                            {cell.cubesCount > 1 ? `x${cell.cubesCount}` : ''}
                          </text>
                        </g>
                      );
                    })}

                    <text x="160" y={startYF + 20} textAnchor="middle" fill="#64748b" className="text-[10px] font-black uppercase tracking-wider">
                      Ancho (Eje Y)
                    </text>
                    <text x={startXF - 15} y="160" textAnchor="middle" fill="#64748b" className="text-[10px] font-black uppercase tracking-wider" transform={`rotate(-90 ${startXF - 15} 160)`}>
                      Alto (Eje Z)
                    </text>
                  </g>
                );
              })()}

              {/* VIEWPOINT 3: LATERAL (2D Side Elevation) */}
              {viewpoint === 'lateral' && (() => {
                const colsL = maxX + 1;
                const rowsL = maxZ + 1;
                const cellWL = Math.min(38, Math.floor(180 / Math.max(colsL, rowsL, 3)));
                const gridWL = colsL * cellWL;
                const gridHL = rowsL * cellWL;
                const startXL = 160 - gridWL / 2;
                const startYL = 160 + gridHL / 2;

                const visibleCubes = sortedCubes.slice(0, simulatedCount).filter(c => c.z <= peelLayer);
                const cells = [];
                for (let z = 0; z <= maxZ; z++) {
                  for (let x = 0; x <= maxX; x++) {
                    const matchingCubes = visibleCubes.filter(c => c.x === x && c.z === z);
                    if (matchingCubes.length > 0) {
                      const isNewest = matchingCubes.some(c => {
                        const latest = visibleCubes[visibleCubes.length - 1];
                        return latest && c.x === latest.x && c.y === latest.y && c.z === latest.z;
                      });
                      cells.push({ xPos: x, yPos: z, isNewest, cubesCount: matchingCubes.length });
                    }
                  }
                }

                return (
                  <g id="lateral-view-projection">
                    {/* Grid Guide Outline */}
                    <rect x={startXL} y={startYL - gridHL} width={gridWL} height={gridHL} fill="rgba(241, 245, 249, 0.4)" stroke="#cbd5e1" strokeWidth="2" rx="8" />
                    {Array.from({ length: colsL + 1 }).map((_, i) => (
                      <line
                        key={`col-${i}`}
                        x1={startXL + i * cellWL}
                        y1={startYL - gridHL}
                        x2={startXL + i * cellWL}
                        y2={startYL}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                        strokeDasharray="2,3"
                      />
                    ))}
                    {Array.from({ length: rowsL + 1 }).map((_, i) => (
                      <line
                        key={`row-${i}`}
                        x1={startXL}
                        y1={startYL - i * cellWL}
                        x2={startXL + gridWL}
                        y2={startYL - i * cellWL}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                        strokeDasharray="2,3"
                      />
                    ))}

                    {/* Projection Squares */}
                    {cells.map((cell, idx) => {
                      const rx = startXL + cell.xPos * cellWL + 2;
                      const ry = startYL - (cell.yPos + 1) * cellWL + 2;
                      const rw = cellWL - 4;
                      const rh = cellWL - 4;

                      return (
                        <g key={idx} className={cell.isNewest ? 'animate-cube-fall' : ''}>
                          <rect
                            x={rx}
                            y={ry}
                            width={rw}
                            height={rh}
                            fill={cubeStyle === 'textbook' ? '#ffffff' : 'url(#sideCubeGrad)'}
                            stroke={cubeStyle === 'textbook' ? '#111827' : '#581c87'}
                            strokeWidth={cubeStyle === 'textbook' ? '2' : '2'}
                            rx="6"
                          />
                          <text
                            x={rx + rw / 2}
                            y={ry + rh / 2 + 3}
                            textAnchor="middle"
                            fill={cubeStyle === 'textbook' ? '#111827' : '#ffffff'}
                            className="text-[9px] font-black font-sans"
                          >
                            {cell.cubesCount > 1 ? `x${cell.cubesCount}` : ''}
                          </text>
                        </g>
                      );
                    })}

                    <text x="160" y={startYL + 20} textAnchor="middle" fill="#64748b" className="text-[10px] font-black uppercase tracking-wider">
                      Profundidad (Eje X)
                    </text>
                    <text x={startXL - 15} y="160" textAnchor="middle" fill="#64748b" className="text-[10px] font-black uppercase tracking-wider" transform={`rotate(-90 ${startXL - 15} 160)`}>
                      Alto (Eje Z)
                    </text>
                  </g>
                );
              })()}

              {/* VIEWPOINT 4: SUPERIOR (2D Plan View / Height Grid) */}
              {viewpoint === 'superior' && (() => {
                const colsS = maxY + 1;
                const rowsS = maxX + 1;
                const cellWS = Math.min(38, Math.floor(180 / Math.max(colsS, rowsS, 3)));
                const gridWS = colsS * cellWS;
                const gridHS = rowsS * cellWS;
                const startXS = 160 - gridWS / 2;
                const startYS = 160 - gridHS / 2;

                const visibleCubes = sortedCubes.slice(0, simulatedCount).filter(c => c.z <= peelLayer);
                const cells = [];
                for (let x = 0; x <= maxX; x++) {
                  for (let y = 0; y <= maxY; y++) {
                    const matchingCubes = visibleCubes.filter(c => c.x === x && c.y === y);
                    if (matchingCubes.length > 0) {
                      const isNewest = matchingCubes.some(c => {
                        const latest = visibleCubes[visibleCubes.length - 1];
                        return latest && c.x === latest.x && c.y === latest.y && c.z === latest.z;
                      });
                      cells.push({ xPos: y, yPos: x, isNewest, heightVal: matchingCubes.length });
                    }
                  }
                }

                // Shading helper based on height
                const getHeightColor = (val: number) => {
                  if (cubeStyle === 'textbook') {
                    if (val === 1) return '#ffffff';
                    if (val === 2) return '#f1f5f9';
                    if (val === 3) return '#cbd5e1';
                    return '#94a3b8';
                  }
                  if (val === 1) return '#fecdd3'; // rose-200
                  if (val === 2) return '#fda4af'; // rose-300
                  if (val === 3) return '#fb7185'; // rose-400
                  return '#f43f5e'; // rose-500
                };

                return (
                  <g id="superior-view-projection">
                    {/* Grid Guide Outline */}
                    <rect x={startXS} y={startYS} width={gridWS} height={gridHS} fill="rgba(241, 245, 249, 0.4)" stroke="#cbd5e1" strokeWidth="2" rx="8" />
                    {Array.from({ length: colsS + 1 }).map((_, i) => (
                      <line
                        key={`col-${i}`}
                        x1={startXS + i * cellWS}
                        y1={startYS}
                        x2={startXS + i * cellWS}
                        y2={startYS + gridHS}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                        strokeDasharray="2,3"
                      />
                    ))}
                    {Array.from({ length: rowsS + 1 }).map((_, i) => (
                      <line
                        key={`row-${i}`}
                        x1={startXS}
                        y1={startYS + i * cellWS}
                        x2={startXS + gridWS}
                        y2={startYS + i * cellWS}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                        strokeDasharray="2,3"
                      />
                    ))}

                    {/* Projection Squares */}
                    {cells.map((cell, idx) => {
                      const rx = startXS + cell.xPos * cellWS + 2;
                      const ry = startYS + cell.yPos * cellWS + 2;
                      const rw = cellWS - 4;
                      const rh = cellWS - 4;

                      return (
                        <g key={idx} className={cell.isNewest ? 'animate-cube-fall' : ''}>
                          <rect
                            x={rx}
                            y={ry}
                            width={rw}
                            height={rh}
                            fill={getHeightColor(cell.heightVal)}
                            stroke={cubeStyle === 'textbook' ? '#111827' : '#be123c'}
                            strokeWidth={cubeStyle === 'textbook' ? '1.8' : '2'}
                            rx="6"
                          />
                          <text
                            x={rx + rw / 2}
                            y={ry + rh / 2 + 4}
                            textAnchor="middle"
                            fill={cubeStyle === 'textbook' ? '#111827' : '#881337'}
                            className="text-xs font-extrabold font-sans"
                          >
                            {cell.heightVal}
                          </text>
                        </g>
                      );
                    })}

                    <text x="160" y={startYS - 15} textAnchor="middle" fill="#64748b" className="text-[10px] font-black uppercase tracking-wider">
                      Ancho (Eje Y)
                    </text>
                    <text x={startXS - 15} y="160" textAnchor="middle" fill="#64748b" className="text-[10px] font-black uppercase tracking-wider" transform={`rotate(-90 ${startXS - 15} 160)`}>
                      Profundidad (Eje X)
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
          <div className="w-full bg-slate-50 border border-slate-150 p-4 rounded-2xl text-center text-[11px] text-slate-500 font-medium mt-2">
            <p className="italic leading-relaxed">
              Estás observando una reproducción digital exacta tridimensional del libro escolar. Cuenta todos los cubos, incluyendo aquellos que no se pueden ver a simple vista pero sirven de apoyo para sostener los niveles superiores.
            </p>
          </div>
        </div>

        {/* Right Side: Multiple Choice Answer Selection */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-150 shadow-xl space-y-6">
            <h4 className="font-extrabold text-sm text-purple-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-purple-50 pb-3">
              <i className="fas fa-check-double text-purple-600"></i> Selecciona la Respuesta Correcta
            </h4>

            <p className="text-xs text-slate-500 font-bold uppercase">
              Observa con atención la estructura isométrica y marca una de las siguientes opciones:
            </p>

            {/* Multiple Choice Options (matching the PDF format) */}
            <div className="grid grid-cols-5 gap-2 pb-2">
              {currentCh.options.map((opt, oIdx) => {
                const letter = ['a', 'b', 'c', 'd', 'e'][oIdx];
                return (
                  <button
                    key={opt}
                    id={`opt-btn-${letter}`}
                    onClick={() => {
                      playSound('pop');
                      handleVerify(opt);
                    }}
                    className="flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                  >
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase group-hover:text-purple-600 mb-1">
                      {letter})
                    </span>
                    <span className="text-base font-black text-slate-800">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-50 p-4 border border-slate-150 rounded-2xl text-[10px] text-slate-500 leading-relaxed font-semibold space-y-3">
              <div className="space-y-1">
                <div className="flex gap-2 items-start text-purple-700">
                  <i className="fas fa-lightbulb mt-0.5"></i>
                  <span className="font-bold uppercase tracking-wider text-[9px]">Sugerencia Lógica:</span>
                </div>
                <p>
                  Intenta contar fila por fila o columna por columna. No te olvides de contar los bloques invisibles de los cimientos que soportan los bloques que están a mayor altura. Puedes deslizar la barra de análisis de capas para aislarlos piso por piso.
                </p>
              </div>

              <div className="border-t border-slate-200/60 pt-2 space-y-1">
                <div className="flex gap-2 items-start text-amber-600">
                  <i className="fas fa-cube mt-0.5"></i>
                  <span className="font-bold uppercase tracking-wider text-[9px]">Regla de Estabilidad Tridimensional:</span>
                </div>
                <p>
                  <strong>¡Atención!</strong> No puede quedar un cubo en el nivel 2 sin tener uno debajo en el nivel 1; de igual manera, para el nivel o piso 3, debe tener dos cubos de soporte debajo en la misma columna. ¡Úsalo para deducir los cubos que no ves!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl border-4 border-slate-100 max-w-md w-full p-8 text-center relative overflow-hidden"
            >
              {/* Decorative top colored lines */}
              {feedback.isCorrect ? (
                <div className="absolute top-0 inset-x-0 h-2.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
              ) : (
                <div className="absolute top-0 inset-x-0 h-2.5 bg-gradient-to-r from-rose-400 to-orange-500" />
              )}

              {/* Status icon with bounce */}
              <div className="flex justify-center mb-6">
                {feedback.isCorrect ? (
                  <motion.div
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: [1, 1.1, 1], rotate: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
                      feedback.isBlockComplete 
                        ? 'bg-amber-100 text-amber-600 border-2 border-amber-300' 
                        : 'bg-emerald-100 text-emerald-600 border-2 border-emerald-300'
                    }`}
                  >
                    <i className={`fas ${feedback.isBlockComplete ? 'fa-trophy text-3xl' : 'fa-check text-3xl'}`}></i>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.5, rotate: 20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 border-2 border-rose-300 flex items-center justify-center shadow-lg"
                  >
                    <i className="fas fa-lightbulb text-3xl"></i>
                  </motion.div>
                )}
              </div>

              {/* Title & description */}
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-3">
                {feedback.title}
              </h3>
              
              <p className="text-sm text-slate-600 leading-relaxed font-semibold mb-8">
                {feedback.message}
              </p>

              {/* Primary action buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    playSound('pop');
                    if (feedback.isCorrect) {
                      if (feedback.nextLevel) {
                        setActiveLevel(feedback.nextLevel);
                      } else if (feedback.isBlockComplete) {
                        setSelectedBlock(null);
                        setActiveLevel(1);
                      }
                    }
                    setFeedback(null);
                  }}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                    feedback.isCorrect
                      ? feedback.isBlockComplete
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-xl hover:opacity-90'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-xl hover:opacity-90'
                      : 'bg-slate-800 hover:bg-slate-900 text-white hover:shadow-xl'
                  }`}
                >
                  {feedback.isCorrect 
                    ? feedback.isBlockComplete 
                      ? 'Volver a los Grupos' 
                      : 'Siguiente Desafío' 
                    : 'Entendido'}
                </button>

                {!feedback.isCorrect && (
                  <button
                    onClick={() => setFeedback(null)}
                    className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all border border-slate-200 cursor-pointer"
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CubeCounting;
