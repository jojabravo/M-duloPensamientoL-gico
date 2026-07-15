import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../audio';
import { StudentProfile } from '../types';
import { 
  Sparkles, 
  BookOpen, 
  Award, 
  Mail, 
  TrendingUp, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  HelpCircle,
  Play
} from 'lucide-react';

interface Props {
  student: StudentProfile;
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  title: string;
  description: string;
  badge: string;
  target?: string;
  icon: React.ReactNode;
  colorClass: string;
  bgLightClass: string;
  iconBgClass: string;
}

export const OnboardingTour: React.FC<Props> = ({ student, isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TourStep[] = [
    {
      title: `¡Hola ${student.Nombre || student.Usuario}! 👋`,
      description: 'Te damos una gran bienvenida a tu plataforma de Pensamiento Lógico. Hemos preparado un recorrido súper rápido para mostrarte cómo navegar por tus menús y lograr los mejores resultados. ¡Empecemos!',
      badge: 'BIENVENIDA',
      icon: <Sparkles className="w-8 h-8 text-amber-500" />,
      colorClass: 'text-amber-600 border-amber-200',
      bgLightClass: 'bg-amber-50',
      iconBgClass: 'bg-amber-100',
    },
    {
      title: 'Capítulos de Aprendizaje 📚',
      description: 'Aquí encontrarás tus módulos de estudio divididos en 4 capítulos principales: Pensamiento Verbal, Pensamiento Lógico Matemático, Espacial y Abstracto. Cada uno tiene fechas especiales de inicio y fin.',
      badge: 'CAPÍTULOS',
      target: '#tour-chapter-grid',
      icon: <BookOpen className="w-8 h-8 text-purple-600" />,
      colorClass: 'text-purple-600 border-purple-200',
      bgLightClass: 'bg-purple-50',
      iconBgClass: 'bg-purple-100',
    },
    {
      title: 'Consulta tus Notas y Reportes 📊',
      description: 'Haz clic en "Notas" o "Ver mi reporte" para analizar en tiempo real tu nivel de desempeño académico (Bajo, Básico, Alto, Superior), tus aciertos y el detalle de tus respuestas.',
      badge: 'CALIFICACIONES',
      target: '#tour-btn-report',
      icon: <TrendingUp className="w-8 h-8 text-pink-600" />,
      colorClass: 'text-pink-600 border-pink-200',
      bgLightClass: 'bg-pink-50',
      iconBgClass: 'bg-pink-100',
    },
    {
      title: 'Buzón de Mensajes y Avisos ✉️',
      description: 'En el buzón de la parte superior o en el botón "Buzón y Avisos" recibirás notas directas y mensajes personalizados de apoyo de tu profesor Jorge para ayudarte en cada reto.',
      badge: 'COMUNICACIÓN',
      target: '#tour-btn-mailbox',
      icon: <Mail className="w-8 h-8 text-indigo-600" />,
      colorClass: 'text-indigo-600 border-indigo-200',
      bgLightClass: 'bg-indigo-50',
      iconBgClass: 'bg-indigo-100',
    },
    {
      title: 'Simulador de Desempeño 🌟',
      description: '¿Quieres saber cuánto progreso necesitas para ganar la Copa de Bronce, Plata, Oro o el Gran Diamante de la Lógica? Prueba arrastrando la barra del simulador para proyectar tus metas.',
      badge: 'METAS',
      target: '#tour-simulator',
      icon: <Award className="w-8 h-8 text-emerald-600" />,
      colorClass: 'text-emerald-600 border-emerald-200',
      bgLightClass: 'bg-emerald-50',
      iconBgClass: 'bg-emerald-100',
    },
    {
      title: '¡Todo Listo para Triunfar! 🏆',
      description: 'Ya conoces lo esencial. Recuerda que puedes interactuar con los Ejemplos Formativos sin miedo a fallar, y luego demostrar tu nivel de destreza en los Retos de Ingenio. ¡Mucho éxito en tu camino!',
      badge: 'COMENZAR',
      icon: <CheckCircle className="w-8 h-8 text-purple-600" />,
      colorClass: 'text-purple-600 border-purple-200',
      bgLightClass: 'bg-purple-50',
      iconBgClass: 'bg-purple-100',
    }
  ];

  useEffect(() => {
    if (!isOpen) return;

    const currentStepData = steps[currentStep];

    // Clean up previous highlights
    const highlightedElements = document.querySelectorAll('.tour-highlight');
    highlightedElements.forEach((el) => {
      el.classList.remove(
        'tour-highlight',
        'ring-4',
        'ring-purple-600',
        'ring-offset-4',
        'relative',
        'z-[60]',
        'bg-white',
        'shadow-2xl'
      );
    });

    if (currentStepData && currentStepData.target) {
      const targetEl = document.querySelector(currentStepData.target);
      if (targetEl) {
        // Scroll target element to view cleanly
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add spotlight styling
        targetEl.classList.add(
          'tour-highlight',
          'ring-4',
          'ring-purple-600',
          'ring-offset-4',
          'relative',
          'z-[60]',
          'bg-white',
          'shadow-2xl'
        );
      }
    }

    return () => {
      // Cleanup on change or unmount
      const highlightedElements = document.querySelectorAll('.tour-highlight');
      highlightedElements.forEach((el) => {
        el.classList.remove(
          'tour-highlight',
          'ring-4',
          'ring-purple-600',
          'ring-offset-4',
          'relative',
          'z-[60]',
          'bg-white',
          'shadow-2xl'
        );
      });
    };
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    playSound('pop');
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    playSound('pop');
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    playSound('pop');
    handleFinish();
  };

  const handleFinish = () => {
    playSound('success');
    // Save completion state for this student
    try {
      localStorage.setItem(`logica_onboarding_completed_${student.Usuario}`, 'true');
    } catch (e) {
      console.error('Error saving onboarding state', e);
    }
    onClose();
    setCurrentStep(0);
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dimmed backdrop background */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleSkip}
      />

      {/* Tour Card dialog container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="bg-white rounded-[2.5rem] border-2 border-purple-100 shadow-2xl overflow-hidden w-full max-w-lg relative z-[110] flex flex-col"
      >
        {/* Top Accent bar */}
        <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 w-full" />

        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 w-10 h-10 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Content */}
        <div className="p-8 md:p-10 flex flex-col items-center text-center space-y-6">
          <span className={`text-[10px] font-black uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full ${currentStepData.colorClass} ${currentStepData.bgLightClass}`}>
            {currentStepData.badge} • Paso {currentStep + 1} de {steps.length}
          </span>

          {/* Animated Icon Circle */}
          <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-md relative ${currentStepData.iconBgClass}`}>
            <div className="absolute inset-0 rounded-[2rem] bg-current opacity-5 animate-pulse" />
            {currentStepData.icon}
          </div>

          <div className="space-y-3">
            <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-snug">
              {currentStepData.title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              {currentStepData.description}
            </p>
          </div>

          {/* Step Dots Indicators */}
          <div className="flex gap-1.5 justify-center py-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playSound('pop');
                  setCurrentStep(idx);
                }}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  currentStep === idx 
                    ? 'w-7 bg-purple-600' 
                    : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer controls */}
        <div className="bg-slate-50 p-6 md:px-10 border-t border-slate-100 flex items-center justify-between gap-4">
          <button
            onClick={handleSkip}
            className="text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-wider cursor-pointer"
          >
            Saltar Guía
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Atrás</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-purple-700 transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>{currentStep === steps.length - 1 ? 'Terminar' : 'Siguiente'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
