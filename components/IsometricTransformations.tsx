import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../audio';
import { StudentProfile } from '../types';

interface Props {
  student: StudentProfile;
  onBack: () => void;
  onComplete: (column: string, newProg: number) => void;
}

type SubTab = 'intro' | 'traslacion' | 'simetria' | 'rotacion';

interface SymChallenge {
  id: number;
  title: string;
  description: string;
  color: string;
  leftPixels: { x: number; y: number }[];
}

interface RotChallenge {
  id: number;
  title: string;
  description: string;
  instruction: string;
  color: string;
  originalPoints: { x: number; y: number }[];
  targetAngle: number;
}

const IsometricTransformations: React.FC<Props> = ({ student, onBack, onComplete }) => {
  const [activeTab, setActiveTab] = useState<SubTab>('intro');

  // Success Navigation Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    buttonText: '',
    nextTab: null as SubTab | null,
    isFinal: false,
    badge: null as { name: string; icon: string; color: string; desc: string } | null,
  });

  const [isAnimating, setIsAnimating] = useState(false);

  // Sub-activity 1: Intro State
  const [introAnswers, setIntroAnswers] = useState<Record<number, boolean>>({});
  const [introPassed, setIntroPassed] = useState(
    student.progreso_transformaciones && student.progreso_transformaciones >= 25 ? true : false
  );

  const introQuestions = [
    {
      id: 1,
      title: 'Par de Osos 🐻🐻',
      desc: 'Uno más grande al lado de uno más pequeño (distintas dimensiones).',
      isIsometric: false,
      reason: 'No mantiene el tamaño (es una homotecia o escala, no una isometría).'
    },
    {
      id: 2,
      title: 'Sillas de Madera 🪑🪑',
      desc: 'Tienen diferente estructura o diseño en el respaldo.',
      isIsometric: false,
      reason: 'Tienen diferente estructura interna, por lo tanto cambia la forma.'
    },
    {
      id: 3,
      title: 'Autos Antiguos 🚗🚗',
      desc: 'Dos autos idénticos en la misma forma y tamaño, uno arriba y otro abajo.',
      isIsometric: true,
      reason: 'Es una traslación perfecta, conserva perfectamente la forma y el tamaño.'
    },
    {
      id: 4,
      title: 'Transbordadores Espaciales 🚀🚀',
      desc: 'Dos aeronaves perfectamente idénticas en tamaño y forma, solo desplazadas.',
      isIsometric: true,
      reason: 'Los dos son idénticos en forma y tamaño, es una traslación pura.'
    },
    {
      id: 5,
      title: 'Cerditos de Pie 🐷🐷',
      desc: 'Cerditos parados con diferente color de ropa y diferente posición de los brazos.',
      isIsometric: false,
      reason: 'Tienen distinta ropa y postura de brazos, no son idénticos.'
    },
    {
      id: 6,
      title: 'Conos de Tránsito 📐📐',
      desc: 'Un cono grande al lado de un cono mucho más chico.',
      isIsometric: false,
      reason: 'Tienen tamaños diferentes.'
    },
    {
      id: 7,
      title: 'Limas o Formones de Metal 🛠️🛠️',
      desc: 'Tienen diferentes longitudes.',
      isIsometric: false,
      reason: 'Tienen diferentes tamaños (longitud cambiada).'
    },
    {
      id: 8,
      title: 'Alcancías de Cerdito 🐖🐖',
      desc: 'Cerditos rosados enfrentados cara a cara. Son un calco idéntico pero invertido.',
      isIsometric: true,
      reason: 'Conserva forma y tamaño mediante una simetría axial (efecto espejo).'
    },
    {
      id: 9,
      title: 'Taladros Eléctricos 🔌🔌',
      desc: 'Dos taladros verdes idénticos, uno de ellos simplemente girado.',
      isIsometric: true,
      reason: 'Es una rotación perfecta, conserva forma y tamaño.'
    },
    {
      id: 10,
      title: 'Guitarras Acústicas 🎸🎸',
      desc: 'Una acostada y otra levantada, de idéntico tamaño y forma.',
      isIsometric: true,
      reason: 'Es una rotación, conserva forma y tamaño.'
    },
    {
      id: 11,
      title: 'Notas Musicales 🎵🎵',
      desc: 'Tienen diferente estructura (una es una pareja de corcheas con barra de unión y la otra es una semicorchea suelta con dos corchetes).',
      isIsometric: false,
      reason: 'No conservan la misma estructura ni la misma forma, por lo que no es una isometría.'
    },
    {
      id: 12,
      title: 'Abejas de Miel 🐝🐝',
      desc: 'Una abeja es visiblemente más grande que la otra.',
      isIsometric: false,
      reason: 'Tienen tamaños diferentes (distinta escala o proporción).'
    }
  ];

  const handleSelectIntroAnswer = (qid: number, isIso: boolean) => {
    playSound('pop');
    setIntroAnswers(prev => ({ ...prev, [qid]: isIso }));
  };

  const checkIntroAnswers = () => {
    let allCorrect = true;
    introQuestions.forEach(q => {
      if (introAnswers[q.id] !== q.isIsometric) {
        allCorrect = false;
      }
    });

    if (allCorrect) {
      playSound('success');
      setIntroPassed(true);
      onComplete('progreso_transformaciones', 25);
      setModalConfig({
        title: '¡Excelente Introducción! 🐻🚗🚀',
        message: '¡Increíble! Has comprendido perfectamente el principio fundamental de las Isometrías: la forma y el tamaño se mantienen intactos. Ahora haz clic en el botón de abajo para pasar a la pestaña de Traslaciones.',
        buttonText: '¡Ir a las Traslaciones! ➡️',
        nextTab: 'traslacion',
        isFinal: false,
        badge: {
          name: 'Insignia 1: Brújula Isométrica 🧭',
          icon: 'fa-compass',
          color: 'from-emerald-400 to-teal-600 shadow-emerald-200',
          desc: '¡Has calibrado tu brújula espacial! Ahora distingues de forma perfecta entre figuras con traslación/giro real y aquellas con escala alterada.'
        }
      });
      setShowSuccessModal(true);
    } else {
      playSound('error');
      alert('Algunas respuestas son incorrectas. ¡Revisa con paciencia el tamaño, la forma y el sentido de las figuras!');
    }
  };

  // Sub-activity 2: Translation State
  const [translationChallenge, setTranslationChallenge] = useState<number>(1);
  const [tx, setTx] = useState<number>(0);
  const [ty, setTy] = useState<number>(0);
  const [translationPassed, setTranslationPassed] = useState(
    student.progreso_transformaciones && student.progreso_transformaciones >= 50 ? true : false
  );

  const tChallenges = [
    {
      id: 1,
      title: 'Reto A: Flor de Viento 🌸',
      instruction: 'Traslada la figura 15 cuadritos a la derecha (Horizontal X = +15) y 2 cuadritos hacia arriba (Vertical Y = +2).',
      targetX: 15,
      targetY: 2,
      gridWidth: 20,
      gridHeight: 12,
      shape: [
        { x: 3, y: 5 }, { x: 3, y: 4 }, { x: 3, y: 6 },
        { x: 2, y: 5 }, { x: 4, y: 5 },
        { x: 2, y: 4 }, { x: 4, y: 6 }, { x: 4, y: 4 }, { x: 2, y: 6 }
      ],
      color: 'bg-emerald-500'
    },
    {
      id: 2,
      title: 'Reto B: El Futbolista Pixel ⚽',
      instruction: 'Mueve el jugador 14 cuadritos a la izquierda (Horizontal X = -14) and 2 cuadritos hacia abajo (Vertical Y = -2).',
      targetX: -14,
      targetY: -2,
      gridWidth: 20,
      gridHeight: 12,
      shape: [
        { x: 16, y: 3 }, { x: 16, y: 4 }, { x: 15, y: 4 }, { x: 17, y: 4 },
        { x: 16, y: 5 }, { x: 14, y: 5 }, { x: 18, y: 5 },
        { x: 15, y: 6 }, { x: 17, y: 6 },
        { x: 15, y: 7 }, { x: 18, y: 7 },
        { x: 14, y: 8 }
      ],
      color: 'bg-indigo-500'
    },
    {
      id: 3,
      title: 'Reto C: Monitor Retro Gamer 🎮',
      instruction: 'Aplica una secuencia combinada: 12 derecha, luego 9 arriba, luego 2 abajo y 2 izquierda. (Neto: Horizontal X = +10, Vertical Y = +7).',
      targetX: 10,
      targetY: 7,
      gridWidth: 20,
      gridHeight: 12,
      shape: [
        { x: 2, y: 9 }, { x: 3, y: 9 }, { x: 4, y: 9 }, { x: 5, y: 9 }, { x: 6, y: 9 },
        { x: 2, y: 8 }, { x: 6, y: 8 }, 
        { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 },
        { x: 4, y: 10 }, { x: 3, y: 11 }, { x: 4, y: 11 }, { x: 5, y: 11 }
      ],
      color: 'bg-rose-500'
    },
    {
      id: 4,
      title: 'Reto D: Cohete Espacial 🚀',
      instruction: '¡Haz despegar el cohete! Trasládalo 12 cuadritos a la izquierda (Horizontal X = -12) y 6 cuadritos hacia arriba (Vertical Y = +6).',
      targetX: -12,
      targetY: 6,
      gridWidth: 20,
      gridHeight: 12,
      shape: [
        { x: 16, y: 7 }, { x: 15, y: 8 }, { x: 16, y: 8 }, { x: 17, y: 8 }, 
        { x: 14, y: 9 }, { x: 15, y: 9 }, { x: 16, y: 9 }, { x: 17, y: 9 }, { x: 18, y: 9 },
        { x: 15, y: 10 }, { x: 16, y: 10 }, { x: 17, y: 10 },
        { x: 14, y: 11 }, { x: 18, y: 11 }
      ],
      color: 'bg-pink-500'
    },
    {
      id: 5,
      title: 'Reto E: La Corona Dorada 👑',
      instruction: 'Traslada la corona de oro de vuelta al pedestal del rey: 11 cuadritos a la derecha (Horizontal X = +11) y 5 cuadritos hacia abajo (Vertical Y = -5).',
      targetX: 11,
      targetY: -5,
      gridWidth: 20,
      gridHeight: 12,
      shape: [
        { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
        { x: 3, y: 4 }, { x: 5, y: 4 }, { x: 7, y: 4 },
        { x: 3, y: 3 }, { x: 7, y: 3 }, { x: 5, y: 3 }
      ],
      color: 'bg-amber-500'
    }
  ];

  const currentTCh = tChallenges[translationChallenge - 1];

  const handleMoveTranslation = (dx: number, dy: number) => {
    playSound('pop');
    setTx(prev => Math.max(-18, Math.min(18, prev + dx)));
    setTy(prev => Math.max(-10, Math.min(10, prev + dy)));
  };

  const handleCheckTranslation = () => {
    if (tx === currentTCh.targetX && ty === currentTCh.targetY) {
      playSound('success');
      if (translationChallenge < 5) {
        alert(`¡Excelente! Has completado el Reto ${translationChallenge}. ¡Pasas al siguiente!`);
        setTranslationChallenge(prev => prev + 1);
        setTx(0);
        setTy(0);
      } else {
        setTranslationPassed(true);
        onComplete('progreso_transformaciones', 50);
        setModalConfig({
          title: '¡Magnífico Piloto de Vectores! 🚀👑',
          message: '¡Excelente! Has dominado los 5 retos de traslación en el plano cartesiano. Has comprendido a la perfección cómo desplazar cada punto del dibujo. Ahora haz clic en el botón de abajo para ir a la pestaña de Simetría Axial.',
          buttonText: '¡Ir a Simetría Axial! 🎨',
          nextTab: 'simetria',
          isFinal: false,
          badge: {
            name: 'Insignia 2: Vectores de Vuelo 🚀',
            icon: 'fa-paper-plane',
            color: 'from-indigo-400 to-blue-600 shadow-indigo-200',
            desc: '¡Dominas las coordenadas de viaje! Has trasladado figuras pixeladas con la precisión de un piloto estelar sin perder la forma original.'
          }
        });
        setShowSuccessModal(true);
      }
    } else {
      playSound('error');
      alert(`¡Casi! Te encuentras en la posición X: ${tx >= 0 ? '+' + tx : tx}, Y: ${ty >= 0 ? '+' + ty : ty}. Revisa las instrucciones.`);
    }
  };

  // Sub-activity 3: Symmetry State (5 Levels of Pixel Art Drawing)
  const [symmetryLevel, setSymmetryLevel] = useState<number>(1);
  const [gridReflectCells, setGridReflectCells] = useState<Record<string, boolean>>({});
  const [symmetryPassed, setSymmetryPassed] = useState(
    student.progreso_transformaciones && student.progreso_transformaciones >= 75 ? true : false
  );

  const symChallenges: SymChallenge[] = [
    {
      id: 1,
      title: 'Nivel 1: La Mariposa Colorida 🦋',
      description: 'El lado izquierdo muestra el ala de una mariposa. ¡Dibuja su reflejo exacto en el lado derecho para darle vida!',
      color: 'bg-indigo-500',
      leftPixels: [
        { x: 5, y: 1 },
        { x: 4, y: 2 }, { x: 5, y: 2 },
        { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
        { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 },
        { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 },
        { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
        { x: 4, y: 7 }, { x: 5, y: 7 },
        { x: 5, y: 8 }
      ]
    },
    {
      id: 2,
      title: 'Nivel 2: El Súper Corazón ❤️',
      description: 'Une las mitades pintando el reflejo exacto. El corazón late por tu gran visión geométrica.',
      color: 'bg-rose-500',
      leftPixels: [
        { x: 3, y: 1 }, { x: 4, y: 1 },
        { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 },
        { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
        { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 },
        { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 },
        { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
        { x: 4, y: 7 }, { x: 5, y: 7 },
        { x: 5, y: 8 }
      ]
    },
    {
      id: 3,
      title: 'Nivel 3: El Marcianito Espacial 👾',
      description: 'Un explorador pixel de otra galaxia está incompleto. Refleja su forma para que pueda comunicarse con su nave.',
      color: 'bg-emerald-500',
      leftPixels: [
        { x: 4, y: 1 }, { x: 5, y: 1 },
        { x: 3, y: 2 }, { x: 5, y: 2 },
        { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
        { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 },
        { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 },
        { x: 1, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
        { x: 1, y: 7 }, { x: 5, y: 7 },
        { x: 2, y: 8 }, { x: 3, y: 8 }
      ]
    },
    {
      id: 4,
      title: 'Nivel 4: El Hongo del Bosque 🍄',
      description: 'Pinta la otra mitad del hongo mágico. Las matemáticas y la simetría están presentes en toda la naturaleza.',
      color: 'bg-amber-500',
      leftPixels: [
        { x: 4, y: 1 }, { x: 5, y: 1 },
        { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 },
        { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
        { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 },
        { x: 4, y: 5 }, { x: 5, y: 5 },
        { x: 4, y: 6 }, { x: 5, y: 6 },
        { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 },
        { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 }
      ]
    },
    {
      id: 5,
      title: 'Nivel 5: La Espada del Héroe ⚔️',
      description: '¡El reto definitivo de simetría! Forja la espada de doble filo reflejando la hoja perfectamente a la misma distancia del eje L.',
      color: 'bg-sky-500',
      leftPixels: [
        { x: 5, y: 0 },
        { x: 5, y: 1 },
        { x: 5, y: 2 },
        { x: 5, y: 3 },
        { x: 4, y: 4 }, { x: 5, y: 4 },
        { x: 4, y: 5 }, { x: 5, y: 5 },
        { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
        { x: 5, y: 7 },
        { x: 5, y: 8 }
      ]
    }
  ];

  const currentSymCh = symChallenges[symmetryLevel - 1];

  const handleToggleReflectPixel = (x: number, y: number) => {
    playSound('pop');
    const key = `${x},${y}`;
    setGridReflectCells(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const checkSymmetryGrid = () => {
    let match = true;

    // 1. Check if all required mirrored pixels are toggled
    currentSymCh.leftPixels.forEach(p => {
      const mirroredX = 11 - p.x;
      const key = `${mirroredX},${p.y}`;
      if (!gridReflectCells[key]) {
        match = false;
      }
    });

    // 2. Check if there are any extra toggled pixels on the right side
    for (let x = 6; x < 12; x++) {
      for (let y = 0; y < 10; y++) {
        const key = `${x},${y}`;
        const isToggled = !!gridReflectCells[key];
        const mirrorOfX = 11 - x;
        const isRequired = currentSymCh.leftPixels.some(p => p.x === mirrorOfX && p.y === y);
        if (isToggled && !isRequired) {
          match = false;
        }
      }
    }

    if (match) {
      playSound('success');
      if (symmetryLevel < 5) {
        alert(`¡Nivel ${symmetryLevel} Superado con éxito! ¡Sigamos con el siguiente dibujo pixel!`);
        setSymmetryLevel(prev => prev + 1);
        setGridReflectCells({});
      } else {
        setSymmetryPassed(true);
        onComplete('progreso_transformaciones', 75);
        setModalConfig({
          title: '¡Maestro de la Simetría! 🦋❤️👾',
          message: '¡Excelente! Has completado los 5 niveles de simetría axial. Tu sentido de la distancia y el efecto espejo está muy bien desarrollado. Ahora haz clic abajo para ir al reto final de Rotaciones.',
          buttonText: '¡Ir a las Rotaciones! 🔄',
          nextTab: 'rotacion',
          isFinal: false,
          badge: {
            name: 'Insignia 3: Alquimista del Espejo 🦋',
            icon: 'fa-magic',
            color: 'from-pink-400 to-rose-600 shadow-pink-200',
            desc: '¡Tu mirada ve en doble reflejo! Forjaste la mariposa, el corazón y la espada calculando distancias milimétricas con respecto al Eje L.'
          }
        });
        setShowSuccessModal(true);
      }
    } else {
      playSound('error');
      alert('El reflejo no está perfecto aún. Asegúrate de verificar que cada punto pintado en la derecha esté a la misma distancia del eje central L que su contraparte izquierda.');
    }
  };

  // Sub-activity 4: Rotation State (3 Levels of Pixel Art Rotation)
  const [rotationLevel, setRotationLevel] = useState<number>(1);
  const [rotationAngle, setRotationAngle] = useState<number>(0); // 0, 90, 180, 270
  const [rotationPassed, setRotationPassed] = useState(
    student.progreso_transformaciones && student.progreso_transformaciones >= 100 ? true : false
  );

  const rotChallenges: RotChallenge[] = [
    {
      id: 1,
      title: 'Reto 1: La Flecha Mágica ➡️',
      description: 'Rota la flecha de fuego exactamente 90° en sentido de las agujas del reloj alrededor del punto O.',
      instruction: 'Usa los botones de giro abajo para encontrar la posición correcta que calce con la silueta fantasma.',
      color: 'bg-fuchsia-500',
      originalPoints: [
        { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, 
        { x: 3, y: 2 }, { x: 5, y: 2 }
      ],
      targetAngle: 90
    },
    {
      id: 2,
      title: 'Reto 2: El Barquito de Papel ⛵',
      description: 'Gira el barquito 180° (media vuelta completa) alrededor del punto de anclaje O (dejarlo de cabeza).',
      instruction: 'Pruébalo con los botones y comprueba cuando la figura calce perfectamente con el destino.',
      color: 'bg-indigo-500',
      originalPoints: [
        { x: 4, y: 1 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, 
        { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }
      ],
      targetAngle: 180
    },
    {
      id: 3,
      title: 'Reto 3: La Llave Antigua 🔑',
      description: 'La llave secreta de la fortaleza debe girarse exactamente 270° en sentido horario.',
      instruction: 'Calcula el ángulo de giro correcto y comprueba el alineamiento con la silueta destino.',
      color: 'bg-teal-500',
      originalPoints: [
        { x: 4, y: 1 }, { x: 3, y: 1 }, { x: 5, y: 1 }, { x: 4, y: 2 }, 
        { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 3, y: 3 }
      ],
      targetAngle: 270
    }
  ];

  const currentRotCh = rotChallenges[rotationLevel - 1];

  // Rotate points around center O (4, 4) on a 10x10 grid (indices 0 to 9)
  const getRotatedPoints = (points: { x: number; y: number }[], angle: number) => {
    const cx = 4, cy = 4;
    return points.map(p => {
      const rx = p.x - cx;
      const ry = p.y - cy;
      let nx = rx, ny = ry;
      if (angle === 90) {
        nx = -ry;
        ny = rx;
      } else if (angle === 180) {
        nx = -rx;
        ny = -ry;
      } else if (angle === 270) {
        nx = ry;
        ny = -rx;
      }
      return { x: nx + cx, y: ny + cy };
    });
  };

  const handleSelectAngle = async (targetAngle: number) => {
    if (isAnimating) return;
    playSound('pop');

    let current = rotationAngle;
    if (current === targetAngle) return;

    setIsAnimating(true);

    // Determine intermediate clockwise 90-degree steps to reach the target
    let steps: number[] = [];
    let temp = current;
    while (temp !== targetAngle) {
      temp = (temp + 90) % 360;
      steps.push(temp);
    }

    // Sequence through the steps
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 550));
      setRotationAngle(steps[i]);
      playSound('pop');
    }

    setIsAnimating(false);
  };

  const handleCheckRotation = () => {
    if (rotationAngle === currentRotCh.targetAngle) {
      playSound('success');
      if (rotationLevel < 3) {
        alert(`¡Reto ${rotationLevel} correcto! Has rotado la figura perfectamente.`);
        setRotationLevel(prev => prev + 1);
        setRotationAngle(0);
      } else {
        setRotationPassed(true);
        onComplete('progreso_transformaciones', 100);
        setModalConfig({
          title: '🏆 ¡Aventura Geométrica Completada!',
          message: '¡Excelente trabajo! Has completado con éxito todo el taller interactivo de Transformaciones Isométricas. Has demostrado dominar los traslados por vectores, simetrías de espejo, y rotaciones en el plano.',
          buttonText: '¡Volver al Mapa de Aprendizaje! ⭐',
          nextTab: null,
          isFinal: true,
          badge: {
            name: 'Insignia 4: Guardián Cósmico del Giro 🌀',
            icon: 'fa-redo-alt',
            color: 'from-amber-400 to-orange-600 shadow-amber-200',
            desc: '¡Señor del Espacio y los Ángulos! Hiciste girar barquitos, llaves y flechas con absoluta fluidez espacial y destreza cartesiana.'
          }
        });
        setShowSuccessModal(true);
      }
    } else {
      playSound('error');
      alert(`¡Giro incorrecto! Has rotado la figura ${rotationAngle}°. El reto de nivel ${rotationLevel} requiere rotarla exactamente ${currentRotCh.targetAngle}° para calzar con el fantasma.`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn px-4 py-8">
      {/* Upper Title Area */}
      <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-pink-50 overflow-hidden mb-8">
        <div className="bg-pink-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl rotate-12">
            <i className="fas fa-vector-square"></i>
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
                  Aventura Geométrica • Grados 6° y 7°
                </span>
                <h3 className="text-3xl font-black tracking-tight text-white uppercase">Transformaciones Isométricas</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-tabs inside Transformaciones Isométricas */}
        <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50 p-2.5 gap-2">
          {[
            { id: 'intro', label: '1. Introducción', icon: 'fa-book-open', unlocked: true },
            { id: 'traslacion', label: '2. Traslaciones', icon: 'fa-arrows-alt', unlocked: introPassed },
            { id: 'simetria', label: '3. Simetría Axial', icon: 'fa-arrows-alt-h', unlocked: introPassed && translationPassed },
            { id: 'rotacion', label: '4. Rotaciones', icon: 'fa-redo', unlocked: introPassed && translationPassed && symmetryPassed }
          ].map(t => (
            <button
              key={t.id}
              disabled={!t.unlocked}
              onClick={() => { playSound('pop'); setActiveTab(t.id as SubTab); }}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shrink-0 transition-all ${
                activeTab === t.id
                  ? 'bg-pink-600 text-white shadow-xl'
                  : t.unlocked
                  ? 'bg-white border border-slate-200 text-slate-700 hover:border-pink-300 hover:text-pink-600 cursor-pointer'
                  : 'bg-slate-100/50 text-slate-400 cursor-not-allowed border border-transparent'
              }`}
            >
              <i className={`fas ${t.icon}`}></i>
              {t.label}
              {!t.unlocked && <i className="fas fa-lock text-[9px] ml-1"></i>}
            </button>
          ))}
        </div>
      </div>

      {/* Muro de Insignias de la Aventura */}
      <div className="bg-gradient-to-r from-pink-50/70 to-indigo-50/70 border-2 border-pink-100 rounded-[2.5rem] p-6 mb-8 shadow-sm">
        <h4 className="text-center font-black text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
          <i className="fas fa-award text-pink-500 animate-bounce"></i> Muro de Insignias de la Aventura Geométrica
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              id: 1,
              name: 'Brújula Isométrica 🧭',
              unlocked: introPassed,
              color: 'from-emerald-400 to-teal-500 text-emerald-600',
              icon: 'fa-compass',
              desc: 'Comprende el principio de las isometrías (forma y tamaño intactos).'
            },
            {
              id: 2,
              name: 'Vectores de Vuelo 🚀',
              unlocked: translationPassed,
              color: 'from-indigo-400 to-blue-500 text-indigo-600',
              icon: 'fa-paper-plane',
              desc: 'Domina los traslados y vectores de desplazamiento en el plano.'
            },
            {
              id: 3,
              name: 'Alquimista del Espejo 🦋',
              unlocked: symmetryPassed,
              color: 'from-pink-400 to-rose-500 text-pink-600',
              icon: 'fa-magic',
              desc: 'Refleja figuras de forma axial con distancias perfectas al Eje L.'
            },
            {
              id: 4,
              name: 'Guardián del Giro 🌀',
              unlocked: rotationPassed,
              color: 'from-amber-400 to-orange-500 text-amber-600',
              icon: 'fa-redo-alt',
              desc: 'Rota figuras alrededor del pivote O observando el sentido horario.'
            }
          ].map(badge => (
            <div 
              key={badge.id}
              className={`p-4 rounded-3xl border transition-all duration-300 text-center flex flex-col items-center justify-between h-full group ${
                badge.unlocked 
                  ? 'bg-white border-pink-200 shadow-md hover:scale-[1.03]' 
                  : 'bg-slate-100/60 border-slate-200 opacity-60'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-2 transition-all ${
                badge.unlocked 
                  ? `bg-gradient-to-br ${badge.color} text-white shadow-lg` 
                  : 'bg-slate-200 text-slate-400'
              }`}>
                <i className={`fas ${badge.icon}`}></i>
              </div>
              <div>
                <h5 className={`font-black text-xs ${badge.unlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                  {badge.name}
                </h5>
                <p className="text-[10px] text-slate-400 font-semibold leading-tight mt-1 transition-all">
                  {badge.unlocked ? badge.desc : '🔒 Completa esta sección para ganar'}
                </p>
              </div>
              {badge.unlocked && (
                <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-2 block">
                  ✨ Ganada
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Render Subview Content */}
      <div className="bg-white border border-slate-150 p-6 md:p-8 rounded-[2.5rem] shadow-xl relative">
        {activeTab === 'intro' && (
          <div className="space-y-6">
            <div className="bg-pink-50 text-pink-900 border border-pink-100 rounded-3xl p-6">
              <h4 className="font-extrabold text-lg mb-2 flex items-center gap-2">
                <i className="fas fa-question-circle"></i> ¿Qué es una Isometría?
              </h4>
              <p className="text-sm leading-relaxed font-semibold">
                Del griego <em>"iso"</em> (igual) y <em>"metría"</em> (medida). Las transformaciones isométricas son 
                movimientos en los que la figura original <strong>conserva de manera absoluta su forma y tamaño</strong>. 
                Solo cambia de posición, orientación o sentido.
              </p>
            </div>

            <div className="text-center md:text-left">
              <h4 className="font-black text-xl text-gray-800 uppercase tracking-tight mb-2">
                Actividad: Clasificador de Transformaciones
              </h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
                Indica en qué parejas de figuras se ha mantenido intacta la forma y el tamaño
              </p>
            </div>

            {/* Reference Image Container */}
            <div className="flex flex-col items-center bg-slate-50 border border-slate-150 p-6 rounded-[2rem] max-w-2xl mx-auto overflow-hidden shadow-sm">
              <span className="text-[10px] font-black uppercase text-pink-600 bg-pink-50 px-3 py-1 rounded-full mb-3 tracking-wider">
                Imágenes de Referencia para el Ejercicio
              </span>
              <img 
                id="img_transformaciones_referencia"
                src="https://i.postimg.cc/BQdYWxJD/act1-transformaciones-removebg-preview.png" 
                alt="Parejas de figuras de transformaciones" 
                className="max-h-56 md:max-h-64 object-contain drop-shadow-md hover:scale-[1.03] transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {introQuestions.map(q => {
                return (
                  <div key={q.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4">
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm mb-1">{q.title}</h5>
                      <p className="text-xs text-slate-500 font-semibold">{q.desc}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectIntroAnswer(q.id, true)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          introAnswers[q.id] === true
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-white border border-slate-300 text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/20'
                        }`}
                      >
                        ✅ Sí es Isometría
                      </button>
                      <button
                        onClick={() => handleSelectIntroAnswer(q.id, false)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          introAnswers[q.id] === false
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-white border border-slate-300 text-slate-700 hover:border-rose-500 hover:bg-rose-50/20'
                        }`}
                      >
                        ❌ No es Isometría
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={checkIntroAnswers}
                className="px-8 py-3.5 bg-pink-600 text-white rounded-[1.5rem] font-black tracking-wide text-sm shadow-lg hover:bg-pink-700 cursor-pointer"
              >
                VALIDAR MIS RESPUESTAS
              </button>
            </div>
          </div>
        )}

        {activeTab === 'traslacion' && (
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-black bg-pink-100 text-pink-600 px-3 py-1 rounded-full uppercase">
                TALLER DE TRASLACIONES • RETO {translationChallenge} de 5
              </span>
              <h4 className="font-black text-xl text-gray-800 uppercase tracking-tight mt-3 mb-1">
                {currentTCh.title}
              </h4>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed max-w-2xl bg-slate-50 p-4 border border-slate-100 rounded-2xl mb-4">
                <strong>Instrucción de vuelo:</strong> {currentTCh.instruction}
              </p>
            </div>

            {/* Translation grid game workspace */}
            <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
              {/* Grid board */}
              <div className="border border-slate-200 p-2 rounded-2xl bg-white shadow-inner overflow-auto max-w-full">
                <div 
                  className="grid gap-px bg-slate-100 border border-slate-200"
                  style={{ 
                    gridTemplateColumns: `repeat(${currentTCh.gridWidth}, minmax(18px, 1fr))`,
                    width: `${currentTCh.gridWidth * 20}px` 
                  }}
                >
                  {Array.from({ length: currentTCh.gridHeight }).map((_, r) => (
                    <React.Fragment key={r}>
                      {Array.from({ length: currentTCh.gridWidth }).map((_, c) => {
                        // Check if pixel is in original shape
                        const isOrig = currentTCh.shape.some(p => p.x === c && p.y === r);
                        // Check if pixel is in active translated shape (apply tx, ty)
                        const isTrans = currentTCh.shape.some(p => p.x + tx === c && p.y - ty === r);
                        // Check if pixel is in the destination target position
                        const isTarget = currentTCh.shape.some(p => p.x + currentTCh.targetX === c && p.y - currentTCh.targetY === r);

                        let cellClass = '';
                        if (isTrans && isTarget) {
                          cellClass = 'bg-emerald-600 text-white font-bold shadow-md animate-pulse';
                        } else if (isTrans) {
                          cellClass = `${currentTCh.color} text-white font-bold shadow-md`;
                        } else if (isTarget) {
                          cellClass = 'bg-emerald-50 border-2 border-dashed border-emerald-300';
                        } else if (isOrig) {
                          cellClass = 'bg-slate-300 text-slate-700 font-bold';
                        } else {
                          cellClass = 'bg-slate-50 hover:bg-slate-100';
                        }

                        return (
                          <div 
                            key={c} 
                            className={`w-5 h-5 transition-all text-[9px] flex items-center justify-center ${cellClass}`}
                          >
                            {isOrig && "•"}
                            {isTarget && !isTrans && <span className="text-[7px] text-emerald-400">🎯</span>}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Offset Vector controller keypads */}
              <div className="w-full lg:w-72 bg-slate-50 p-6 rounded-[2rem] border border-slate-150 flex flex-col justify-between gap-6">
                <div>
                  <h5 className="font-black text-sm text-slate-800 uppercase mb-4 flex items-center gap-1.5 justify-center">
                    <i className="fas fa-arrows-alt"></i> Panel de Vectores
                  </h5>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Horizontal (X)</span>
                      <strong className="text-xl font-bold font-mono text-slate-700">{tx >= 0 ? `+${tx}` : tx}</strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Vertical (Y)</span>
                      <strong className="text-xl font-bold font-mono text-slate-700">{ty >= 0 ? `+${ty}` : ty}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-center">
                    <button 
                      onClick={() => handleMoveTranslation(0, 1)}
                      className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:border-pink-500 hover:text-pink-600 shadow-sm cursor-pointer"
                    >
                      <i className="fas fa-chevron-up"></i>
                    </button>
                  </div>
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleMoveTranslation(-1, 0)}
                      className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:border-pink-500 hover:text-pink-600 shadow-sm cursor-pointer"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <button 
                      onClick={() => handleMoveTranslation(0, -1)}
                      className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:border-pink-500 hover:text-pink-600 shadow-sm cursor-pointer"
                    >
                      <i className="fas fa-chevron-down"></i>
                    </button>
                    <button 
                      onClick={() => handleMoveTranslation(1, 0)}
                      className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:border-pink-500 hover:text-pink-600 shadow-sm cursor-pointer"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCheckTranslation}
                  className="w-full py-4.5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg hover:bg-emerald-700 cursor-pointer"
                >
                  COMPROBAR TRASLACIÓN
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'simetria' && (
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-black bg-pink-100 text-pink-600 px-3 py-1 rounded-full uppercase">
                TALLER DE SIMETRÍA AXIAL • NIVEL {symmetryLevel} de 5
              </span>
              <h4 className="font-black text-xl text-gray-800 uppercase tracking-tight mt-3 mb-1">
                {currentSymCh.title}
              </h4>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed max-w-2xl bg-slate-50 p-4 border border-slate-100 rounded-2xl mb-4">
                {currentSymCh.description}
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start justify-center">
              {/* Left Column: Pixilart-inspired draw canvas (8 columns wide on lg) */}
              <div className="lg:col-span-8 flex flex-col items-center gap-4">
                <div className="border-4 border-slate-200 p-2.5 rounded-3xl bg-white shadow-xl relative overflow-auto max-w-full">
                  <div className="grid grid-cols-12 gap-px bg-slate-200">
                    {Array.from({ length: 10 }).map((_, r) => (
                      <React.Fragment key={r}>
                        {Array.from({ length: 12 }).map((_, c) => {
                          const isLeftShape = currentSymCh.leftPixels.some(p => p.x === c && p.y === r);
                          const isRightToggled = !!gridReflectCells[`${c},${r}`];
                          
                          // Styling the central vertical axis L (right border of column 5)
                          const isAxisBoundary = c === 5;

                          return (
                            <div
                              key={c}
                              onClick={() => c >= 6 && handleToggleReflectPixel(c, r)}
                              className={`w-8 h-8 transition-all relative flex items-center justify-center ${
                                c >= 6 ? 'cursor-crosshair' : 'pointer-events-none'
                              } ${
                                isLeftShape
                                  ? 'bg-slate-400'
                                  : isRightToggled
                                  ? currentSymCh.color
                                  : 'bg-white hover:bg-slate-50'
                              } ${
                                isAxisBoundary 
                                  ? 'border-r-4 border-r-pink-500 animate-pulse' 
                                  : ''
                              }`}
                            >
                              {/* Eje text indicator */}
                              {isAxisBoundary && r === 0 && (
                                <span className="absolute right-[-6px] top-[-14px] text-[10px] font-black text-pink-600 bg-white px-1 shadow border border-pink-100 rounded">
                                  EJE L
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 w-full justify-center">
                  <button
                    onClick={() => { playSound('pop'); setGridReflectCells({}); }}
                    className="px-6 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-bold rounded-2xl text-xs uppercase tracking-wider"
                  >
                    LIMPIAR DIBUJO 🧹
                  </button>
                  <button
                    onClick={checkSymmetryGrid}
                    className="px-8 py-3 bg-pink-600 text-white rounded-2xl font-black tracking-wide text-xs uppercase shadow-lg hover:bg-pink-700 cursor-pointer"
                  >
                    COMPROBAR SIMETRÍA ✅
                  </button>
                </div>
              </div>

              {/* Right Column: Reference Target Card (4 columns wide on lg) */}
              <div className="lg:col-span-4 bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                <div className="text-center">
                  <span className="text-[9px] font-black bg-pink-100 text-pink-600 px-3 py-1 rounded-full uppercase tracking-wider">
                    Lienzo de Inspiración Pixilart
                  </span>
                  <h5 className="font-extrabold text-sm text-slate-800 mt-2">🔍 Imagen de Referencia</h5>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                    Así debe quedar tu dibujo final una vez que reflejes el lado izquierdo sobre el derecho. ¡Úsala como guía!
                  </p>
                </div>

                {/* Miniature reference preview grid of fully symmetrical shape */}
                <div className="flex justify-center p-2 bg-white rounded-2xl border border-slate-150 shadow-inner">
                  <div className="grid grid-cols-12 gap-px bg-slate-150">
                    {Array.from({ length: 10 }).map((_, r) => (
                      <React.Fragment key={r}>
                        {Array.from({ length: 12 }).map((_, c) => {
                          const isLeftShape = currentSymCh.leftPixels.some(p => p.x === c && p.y === r);
                          
                          // For preview, right side is also pre-rendered to show the target!
                          const mirrorOfX = 11 - c;
                          const isRightShape = c >= 6 && currentSymCh.leftPixels.some(p => p.x === mirrorOfX && p.y === r);

                          const isAxisBoundary = c === 5;

                          return (
                            <div
                              key={c}
                              className={`w-4 h-4 ${
                                isLeftShape || isRightShape
                                  ? currentSymCh.color
                                  : 'bg-slate-50'
                              } ${
                                isAxisBoundary ? 'border-r border-r-pink-500' : ''
                              }`}
                            />
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-3.5 border border-slate-150 rounded-2xl text-[10px] text-slate-500 leading-relaxed font-semibold">
                  <span className="font-bold text-pink-600 uppercase block mb-1">💡 Tips para Sexto y Séptimo:</span>
                  Cuenta los cuadritos desde el <strong className="text-pink-500">Eje L</strong> hacia la izquierda, y pinta un cuadro de color a la misma distancia hacia la derecha. ¡Por ejemplo, si un cuadro gris está a 1 espacio del eje, su contraparte de color debe estar a exactamente 1 espacio a la derecha!
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rotacion' && (
          <div className="space-y-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-black bg-pink-100 text-pink-600 px-3 py-1 rounded-full uppercase">
                TALLER DE ROTACIONES • RETO {rotationLevel} de 3
              </span>
              <h4 className="font-black text-xl text-gray-800 uppercase tracking-tight mt-3 mb-1">
                {currentRotCh.title}
              </h4>
              <p className="text-sm font-semibold text-slate-600 max-w-xl bg-slate-50 p-4 border border-slate-100 rounded-2xl mb-4 leading-relaxed">
                {currentRotCh.description}
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
              {/* Left area: Active grid */}
              <div className="bg-slate-100 p-4 rounded-3xl border border-slate-200 shadow-xl">
                <div className="grid grid-cols-10 gap-px bg-white border border-slate-200">
                  {Array.from({ length: 10 }).map((_, r) => (
                    <React.Fragment key={r}>
                      {Array.from({ length: 10 }).map((_, c) => {
                        // Center is O (4, 4)
                        const isCenter = c === 4 && r === 4;

                        // Is inside original ghost shadow/reference points
                        const isOrig = currentRotCh.originalPoints.some(p => p.x === c && p.y === r);

                        // Is inside rotated state
                        const rotatedPoints = getRotatedPoints(currentRotCh.originalPoints, rotationAngle);
                        const isRotated = rotatedPoints.some(p => p.x === c && p.y === r);

                        // Target shadow (ghost target silhouette)
                        const targetPoints = getRotatedPoints(currentRotCh.originalPoints, currentRotCh.targetAngle);
                        const isTargetGhost = targetPoints.some(p => p.x === c && p.y === r);

                        let cellClass = 'bg-white';
                        if (isCenter) {
                          cellClass = 'bg-pink-100';
                        } else if (isRotated) {
                          cellClass = `${currentRotCh.color} shadow-md`;
                        } else if (isTargetGhost) {
                          cellClass = 'bg-pink-50 border-2 border-dashed border-pink-300';
                        } else if (isOrig) {
                          cellClass = 'bg-slate-50 text-slate-400';
                        }

                        return (
                          <div
                            key={c}
                            className={`w-9 h-9 border border-slate-100 transition-all flex items-center justify-center relative ${cellClass}`}
                          >
                            {isCenter && (
                              <div className="w-5 h-5 rounded-full bg-pink-600 text-white font-black text-[9px] flex items-center justify-center animate-pulse shadow-md z-10">
                                O
                              </div>
                            )}
                            {isTargetGhost && !isRotated && !isCenter && (
                              <span className="text-[10px] text-pink-400 font-extrabold">🎯</span>
                            )}
                            {isOrig && !isRotated && !isTargetGhost && !isCenter && (
                              <span className="text-[9px] text-slate-350">•</span>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Right area: Dial selector & Target Image references */}
              <div className="w-full lg:w-80 flex flex-col gap-4">
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-3xl text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide block mb-2">
                    Ángulo de Giro de tu Figura
                  </span>

                  {isAnimating && (
                    <div className="text-center py-2 bg-fuchsia-50 border border-fuchsia-100 rounded-2xl text-fuchsia-700 font-extrabold text-[10px] uppercase animate-pulse mb-3 flex items-center justify-center gap-1.5">
                      <i className="fas fa-spinner animate-spin"></i>
                      <span>Girando en sentido horario... 🕒</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {[0, 90, 180, 270].map((ang) => (
                      <button
                        key={ang}
                        disabled={isAnimating}
                        onClick={() => handleSelectAngle(ang)}
                        className={`py-3 rounded-2xl font-black text-xs transition-all border ${
                          rotationAngle === ang
                            ? 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white border-fuchsia-600 shadow-md'
                            : 'bg-white text-slate-700 hover:border-fuchsia-300'
                        } ${isAnimating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        Giro de {ang}°
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                  <h6 className="font-extrabold text-xs text-slate-800 uppercase flex items-center gap-1">
                    <i className="fas fa-lightbulb text-pink-600"></i> ¿Cómo girar en el plano?
                  </h6>
                  <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                    El punto rosa <strong className="text-pink-600">O</strong> es el pivote de tu figura. Observa la silueta con iconos <strong className="text-pink-500 font-bold">🎯</strong> que representa el destino deseado. Presiona los botones de giro hasta alinear tu figura de color con ese destino y valida.
                  </p>
                </div>

                <button
                  onClick={handleCheckRotation}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg hover:bg-emerald-700 cursor-pointer"
                >
                  VALIDAR RETO DE GIRO
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Congrats & Navigation Popup Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-emerald-400 rounded-[2.5rem] p-6 max-w-sm w-full shadow-2xl text-center space-y-4 max-h-[92vh] overflow-y-auto relative scrollbar-thin"
            >
              {/* Confetti particles effect overlay background */}
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/20 to-white pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 text-2xl mx-auto shadow-inner border border-emerald-100">
                  <i className="fas fa-medal animate-bounce"></i>
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight leading-snug">
                    {modalConfig.title}
                  </h4>
                  <p className="text-[11px] md:text-xs text-slate-500 font-semibold leading-relaxed">
                    {modalConfig.message}
                  </p>
                </div>

                {/* Newly earned badge showcase */}
                {modalConfig.badge && (
                  <motion.div 
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="p-4 rounded-2xl border border-pink-100 bg-gradient-to-r from-pink-50 to-indigo-50 shadow-inner flex flex-col items-center gap-2"
                  >
                    <span className="text-[9px] font-black uppercase text-pink-600 tracking-widest bg-white px-2.5 py-0.5 rounded-full border border-pink-100">
                      ¡Insignia Ganada! 🎉
                    </span>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${modalConfig.badge.color} text-white shadow-md animate-pulse`}>
                      <i className={`fas ${modalConfig.badge.icon}`}></i>
                    </div>
                    <div className="text-center">
                      <h5 className="font-black text-xs text-slate-800 uppercase">
                        {modalConfig.badge.name}
                      </h5>
                      <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5 max-w-[240px]">
                        {modalConfig.badge.desc}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="pt-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                    👉 PRESIONA AQUÍ PARA CONTINUAR:
                  </span>
                  <button
                    onClick={() => {
                      playSound('pop');
                      setShowSuccessModal(false);
                      if (modalConfig.nextTab) {
                        setActiveTab(modalConfig.nextTab);
                      } else if (modalConfig.isFinal) {
                        onBack();
                      }
                    }}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer relative z-20 flex items-center justify-center gap-2"
                  >
                    <span>{modalConfig.buttonText}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IsometricTransformations;
