
import React, { useState } from 'react';
import { playSound } from '../audio';
import { StudentProfile, AppConfig } from '../types';
import CommunicationPanel from './CommunicationPanel';
import { BookOpen, Brain, Trophy, Award, Sparkles, Star, ChevronRight, Scale, Percent } from 'lucide-react';

interface Props {
  student: StudentProfile;
  config: AppConfig;
  onSelect: (chapterId: string) => void;
  onShowResults: () => void;
  onShowCommunication: () => void;
}

const CourseMenu: React.FC<Props> = ({ student, config, onSelect, onShowResults, onShowCommunication }) => {
  const [activeTab, setActiveTab] = useState<'formativo' | 'evaluativo' | 'reconocimiento'>('formativo');
  const [simulatedScore, setSimulatedScore] = useState<number>(75);
  const isTestUser = student.Usuario === 'estudiante.prueba';

  const isAvailable = (active: boolean, start?: string, end?: string) => {
    if (isTestUser) return true;
    if (!active) return false;
    
    const now = new Date();
    if (start) {
      const startDate = new Date(start);
      if (now < startDate) return false;
    }
    if (end) {
      const endDate = new Date(end);
      if (now > endDate) return false;
    }
    return true;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch (e) {
      return null;
    }
  };

  const sections = [
    { 
      id: 'verbal', 
      title: 'CAPÍTULO 1: PENSAMIENTO VERBAL', 
      icon: 'fa-font', 
      color: 'bg-purple-600', 
      active: isAvailable(config.capitulo_1_activo, config.capitulo_1_inicio, config.capitulo_1_fin),
      desc: 'Ordenamiento de la información, lógica verbal y deducción.',
      start: config.capitulo_1_inicio,
      end: config.capitulo_1_fin
    },
    { 
      id: 'num', 
      title: 'CAPÍTULO 2: PENSAMIENTO LÓGICO MATEMÁTICO', 
      icon: 'fa-magnifying-glass', 
      color: 'bg-orange-500', 
      active: isAvailable(config.capitulo_2_activo, config.capitulo_2_inicio, config.capitulo_2_fin),
      desc: 'Criptogramas, Ecuaciones Gráficas, Crucinúmeros y Mensaje Oculto.',
      start: config.capitulo_2_inicio,
      end: config.capitulo_2_fin
    },
    { 
      id: 'esp', 
      title: 'CAPÍTULO 3: PENSAMIENTO ESPACIAL', 
      icon: 'fa-cube', 
      color: 'bg-pink-500', 
      active: isAvailable(config.capitulo_3_activo, config.capitulo_3_inicio, config.capitulo_3_fin),
      desc: 'Transformaciones Isométricas (traslación, rotación, simetría), uso de GeoGebra y diseño de mosaicos.',
      start: config.capitulo_3_inicio,
      end: config.capitulo_3_fin
    },
    { 
      id: 'abs', 
      title: 'CAPÍTULO 4: PENSAMIENTO ABSTRACTO', 
      icon: 'fa-shapes', 
      color: 'bg-emerald-500', 
      active: isAvailable(config.capitulo_4_activo, config.capitulo_4_inicio, config.capitulo_4_fin),
      desc: 'Patrones visuales, analogías gráficas y matrices.',
      start: config.capitulo_4_inicio,
      end: config.capitulo_4_fin
    }
  ];

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-black text-gray-800">Capítulos de Aprendizaje</h2>
          <p className="text-gray-500 font-medium text-sm">Selecciona el capítulo para continuar tu formación</p>
        </div>
        <div className="flex flex-wrap justify-center md:justify-end items-center gap-3">
          <button 
            onClick={() => { playSound('pop'); onShowResults(); }}
            className="px-6 py-3 bg-white border-2 border-purple-100 rounded-2xl font-black text-purple-600 shadow-sm hover:shadow-xl hover:bg-purple-50 transition-all flex items-center gap-2"
          >
            <i className="fas fa-file-invoice"></i> VER MI REPORTE
          </button>
          <button 
            onClick={() => { playSound('pop'); onShowCommunication(); }}
            className="px-6 py-3 bg-white border-2 border-indigo-100 rounded-2xl font-black text-indigo-600 shadow-sm hover:shadow-xl hover:bg-indigo-50 transition-all flex items-center gap-2"
          >
            <i className="fas fa-envelope"></i> BUZÓN Y AVISOS
          </button>
        </div>
      </div>

      {/* Video de Experiencia */}
      <div className="mb-10 bg-white rounded-[2.5rem] overflow-hidden shadow-xl border-2 border-purple-100">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 mb-2">Nuestra Experiencia</span>
            <h3 className="text-2xl font-black mb-4 text-gray-800">El Proyecto en Acción</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Observa a los estudiantes interactuando con la plataforma y desarrollando sus habilidades de pensamiento lógico en el aula.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-600">
              <i className="fas fa-users"></i>
              <span>INTERACCIÓN Y APRENDIZAJE DIGITAL</span>
            </div>
          </div>
          <div className="md:w-1/2 aspect-video overflow-hidden">
            <img 
              src="https://i.postimg.cc/xdM6pD4V/Diseno-sin-titulo.gif" 
              alt="Experiencia de Aprendizaje Lógico"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {sections.map(s => (
          <div 
            key={s.id}
            onClick={() => s.active && (playSound('pop'), onSelect(s.id))}
            className={`group p-6 rounded-[2.5rem] border-4 transition-all relative ${s.active ? 'bg-white border-purple-50 hover:border-purple-400 hover:shadow-2xl cursor-pointer shadow-xl' : 'bg-gray-50 border-gray-100 grayscale opacity-60 cursor-not-allowed'}`}
          >
            <div className="flex gap-6 items-center">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white text-3xl shadow-lg shrink-0 ${s.color}`}>
                <i className={`fas ${s.icon}`}></i>
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-gray-800 text-lg">{s.title}</h3>
                </div>
                
                {/* Fechas de disponibilidad */}
                {(s.start || s.end) && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[9px] font-black ${s.id === 'num' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'} px-3 py-1 rounded-full uppercase tracking-tighter`}>
                      <i className="far fa-calendar-alt mr-1"></i>
                      {s.start ? formatDate(s.start) : 'Inicia'} - {s.end ? formatDate(s.end) : 'Sinfín'}
                    </span>
                  </div>
                )}

                <p className="text-sm text-gray-500 leading-snug">{s.desc}</p>
                {!s.active ? (
                  <span className="inline-block mt-3 text-[9px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                    <i className="fas fa-clock mr-1"></i> Muy pronto habilitaremos este espacio
                  </span>
                ) : (
                  <div className="mt-4 flex items-center text-xs font-black text-purple-600 group-hover:translate-x-2 transition-transform">
                    <span>EXPLORAR MÓDULOS</span>
                    <i className="fas fa-arrow-right ml-2"></i>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-16 bg-gradient-to-b from-white to-purple-50/30 rounded-[3rem] p-8 md:p-12 border-2 border-purple-100/80 shadow-2xl relative overflow-hidden">
        {/* Decorative background lights */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-200/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="text-center mb-10 relative z-10">
          <span className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            SISTEMA ACADÉMICO INTEGRAL
          </span>
          <h3 className="text-3xl font-black text-gray-800 mt-3 tracking-tight">
            Metodología de Evaluación y Progreso
          </h3>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto mt-2 leading-relaxed">
            Nuestro curso de Pensamiento Lógico promueve el aprendizaje constructivo y gamificado a través de dos dimensiones complementarias.
          </p>
        </div>

        {/* 3 Pillars layout */}
        <div className="grid md:grid-cols-3 gap-6 relative z-10 mb-10">
          {/* Card 1 */}
          <div 
            onClick={() => { playSound('pop'); setActiveTab('formativo'); }}
            className={`cursor-pointer p-6 rounded-[2rem] border-2 transition-all group ${
              activeTab === 'formativo' 
                ? 'bg-white border-purple-500 shadow-xl scale-[1.02]' 
                : 'bg-white/60 border-purple-100/50 hover:bg-white hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                activeTab === 'formativo' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100'
              }`}>
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-gray-800 text-sm uppercase leading-none">Ejemplos Prácticos</h4>
                <span className="text-[10px] text-purple-500 font-bold uppercase tracking-wider">Formativo</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Explora modelos dinámicos, simulaciones e interacciones guiadas. Diseñados para que pruebes, falles y comprendas sin la presión de una calificación.
            </p>
            <div className="mt-4 flex items-center text-[10px] font-black text-purple-600">
              <span>Ver detalles</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => { playSound('pop'); setActiveTab('evaluativo'); }}
            className={`cursor-pointer p-6 rounded-[2rem] border-2 transition-all group ${
              activeTab === 'evaluativo' 
                ? 'bg-white border-pink-500 shadow-xl scale-[1.02]' 
                : 'bg-white/60 border-purple-100/50 hover:bg-white hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                activeTab === 'evaluativo' ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-600 group-hover:bg-pink-100'
              }`}>
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-gray-800 text-sm uppercase leading-none">Retos de Ingenio</h4>
                <span className="text-[10px] text-pink-500 font-bold uppercase tracking-wider">Evaluativo</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Resuelve acertijos reales, juegos matemáticos, diagramas lógicos y construcciones espaciales que evalúan tus competencias directas.
            </p>
            <div className="mt-4 flex items-center text-[10px] font-black text-pink-600">
              <span>Ver detalles</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => { playSound('pop'); setActiveTab('reconocimiento'); }}
            className={`cursor-pointer p-6 rounded-[2rem] border-2 transition-all group ${
              activeTab === 'reconocimiento' 
                ? 'bg-white border-indigo-500 shadow-xl scale-[1.02]' 
                : 'bg-white/60 border-purple-100/50 hover:bg-white hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                activeTab === 'reconocimiento' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
              }`}>
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-gray-800 text-sm uppercase leading-none">Insignias y Logros</h4>
                <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Gamificación</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Tu constancia, nivel de progreso y acierto se transforman en copas de Bronce, Plata u Oro, e ingreso oficial al Cuadro de Honor escolar.
            </p>
            <div className="mt-4 flex items-center text-[10px] font-black text-indigo-600">
              <span>Ver detalles</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>

        {/* Dynamic Detail Panel from activeTab */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-purple-100 shadow-sm relative z-10 mb-12">
          {activeTab === 'formativo' && (
            <div className="animate-fadeIn">
              <h4 className="text-lg font-black text-purple-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Dimensión Exploratoria: Ejemplos Prácticos
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                En esta fase, cada unidad te presenta escenarios interactivos o simulaciones (como el simulador de hardware Microbit, diagramas de ordenamiento de Josefa-Bot, o tableros de traslaciones). El objetivo aquí es el <strong>aprendizaje por descubrimiento</strong>.
              </p>
              <ul className="grid md:grid-cols-2 gap-3 text-xs text-gray-500">
                <li className="flex items-start gap-2 bg-purple-50/50 p-3 rounded-xl border border-purple-100/50">
                  <span className="text-purple-600 font-black">✔️ Intento Libre:</span>
                  <span>No hay penalización por respuestas incorrectas. Experimenta tantas veces como sea necesario.</span>
                </li>
                <li className="flex items-start gap-2 bg-purple-50/50 p-3 rounded-xl border border-purple-100/50">
                  <span className="text-purple-600 font-black">✔️ Feedback Dinámico:</span>
                  <span>La plataforma te guía con pistas explicativas e instrucciones lógicas paso a paso.</span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'evaluativo' && (
            <div className="animate-fadeIn">
              <h4 className="text-lg font-black text-pink-900 mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-pink-600" />
                Dimensión Evaluativa: Retos y Desafíos
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Una vez dominada la teoría en los Ejemplos, es hora de poner a prueba tu ingenio. Los Retos calculan un porcentaje exacto de acierto (0 a 100%) en cada capítulo, determinando tu nivel final de desempeño.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl text-center">
                  <span className="block text-xs font-black text-rose-700">BAJO</span>
                  <span className="text-[10px] text-rose-500 block">Menos del 60%</span>
                  <span className="text-[10px] text-gray-400 mt-1 block">Requiere refuerzo</span>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl text-center">
                  <span className="block text-xs font-black text-blue-700">BÁSICO</span>
                  <span className="text-[10px] text-blue-500 block">60% a 79%</span>
                  <span className="text-[10px] text-gray-400 mt-1 block">Habilidad lograda</span>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl text-center">
                  <span className="block text-xs font-black text-indigo-700">ALTO</span>
                  <span className="text-[10px] text-indigo-500 block">80% a 89%</span>
                  <span className="text-[10px] text-gray-400 mt-1 block">Razonamiento ágil</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl text-center">
                  <span className="block text-xs font-black text-emerald-700">SUPERIOR</span>
                  <span className="text-[10px] text-emerald-500 block">90% a 100%</span>
                  <span className="text-[10px] text-gray-400 mt-1 block">Pensamiento de Élite</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reconocimiento' && (
            <div className="animate-fadeIn">
              <h4 className="text-lg font-black text-indigo-900 mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-indigo-600" />
                Gamificación, Copas y Cuadro de Honor Escolar
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Valoramos tu dedicación. El sistema evalúa tu progreso general a lo largo del curso y otorga premios virtuales de alto prestigio:
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-xs text-gray-600">
                <div className="flex gap-3 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="text-3xl">🥉</div>
                  <div>
                    <span className="font-black text-gray-800 block">Copa de Bronce</span>
                    <span className="text-gray-400">Progreso entre 60% y 79%</span>
                  </div>
                </div>
                <div className="flex gap-3 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="text-3xl">🥈</div>
                  <div>
                    <span className="font-black text-gray-800 block">Copa de Plata</span>
                    <span className="text-gray-400">Progreso entre 80% y 89%</span>
                  </div>
                </div>
                <div className="flex gap-3 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="text-3xl">🥇</div>
                  <div>
                    <span className="font-black text-gray-800 block">Copa de Oro</span>
                    <span className="text-gray-400">Progreso entre 90% y 94%</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-3">
                <div className="text-3xl animate-bounce">💎</div>
                <div className="text-xs">
                  <span className="font-black text-purple-900 block">El Gran Diamante de la Lógica</span>
                  <span className="text-purple-700">Reservado exclusivamente para estudiantes con un avance extraordinario del 95% o superior en todo el curso.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Grade Simulator */}
        {(() => {
          const getSimulationResult = (score: number) => {
            if (score < 30) {
              return {
                label: 'BAJO',
                color: 'text-rose-600 bg-rose-50 border-rose-200',
                barColor: 'bg-rose-500',
                trophy: 'Bloqueado',
                trophyIcon: <Star className="w-8 h-8 text-gray-300 animate-pulse" />,
                honorStatus: 'Pendiente (Mínimo 30% de progreso)',
                honorColor: 'text-gray-500 bg-gray-100',
                desc: 'Fase de inicio. Dedícate a explorar los Ejemplos interactivos para consolidar las bases conceptuales.',
                tip: '💡 Consejo: Completa las simulaciones iniciales del Capítulo 1 para superar el umbral del 30%.'
              };
            } else if (score < 60) {
              return {
                label: 'BAJO (En Progreso)',
                color: 'text-amber-600 bg-amber-50 border-amber-200',
                barColor: 'bg-amber-500',
                trophy: 'Medalla de Iniciación 🎖️',
                trophyIcon: <Award className="w-8 h-8 text-amber-500 animate-pulse" />,
                honorStatus: '¡Ingreso Permitido al Cuadro de Honor! 🎉',
                honorColor: 'text-amber-700 bg-amber-50 border-amber-200',
                desc: '¡Buen inicio! Ya figuras en el sistema académico. Ahora el objetivo es alcanzar el 60% para lograr el Desempeño Básico.',
                tip: '💡 Consejo: Resuelve los retos evaluativos para comenzar a sumar puntaje real.'
              };
            } else if (score < 80) {
              return {
                label: 'BÁSICO',
                color: 'text-blue-600 bg-blue-50 border-blue-200',
                barColor: 'bg-blue-500',
                trophy: 'Copa de Bronce 🥉',
                trophyIcon: <Trophy className="w-8 h-8 text-amber-600" />,
                honorStatus: '¡Ingreso Permitido al Cuadro de Honor! 🎉',
                honorColor: 'text-blue-700 bg-blue-50 border-blue-200',
                desc: '¡Competencia lograda! Entiendes los conceptos básicos y sabes aplicarlos en problemas estructurados.',
                tip: '💡 Consejo: Presta atención a los detalles en los acertijos más complejos para subir a nivel Alto.'
              };
            } else if (score < 90) {
              return {
                label: 'ALTO',
                color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
                barColor: 'bg-indigo-500',
                trophy: 'Copa de Plata 🥈',
                trophyIcon: <Trophy className="w-8 h-8 text-slate-400" />,
                honorStatus: '¡Ingreso Permitido al Cuadro de Honor! 🎉',
                honorColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
                desc: '¡Excelente nivel! Demuestras gran agilidad mental, pensamiento algorítmico y destreza espacial.',
                tip: '💡 Consejo: Revisa los retos que te causaron dificultad; ¡estás a un paso del nivel de excelencia!'
              };
            } else if (score < 95) {
              return {
                label: 'SUPERIOR',
                color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
                barColor: 'bg-emerald-500',
                trophy: 'Copa de Oro 🥇',
                trophyIcon: <Trophy className="w-8 h-8 text-yellow-500 animate-bounce" />,
                honorStatus: '¡Ingreso Permitido al Cuadro de Honor! 🎉',
                honorColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                desc: '¡Desempeño sobresaliente! Eres un estratega lógico de primer nivel. Tu razonamiento es rápido, preciso y sumamente ordenado.',
                tip: '💡 Consejo: Mantén este ritmo en todos los capítulos para desbloquear el reconocimiento de leyenda.'
              };
            } else {
              return {
                label: 'MÁXIMO (Leyenda)',
                color: 'text-purple-600 bg-purple-50 border-purple-200',
                barColor: 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500',
                trophy: 'Diamante Multicolor 💎✨',
                trophyIcon: <Sparkles className="w-8 h-8 text-purple-500 animate-spin" style={{ animationDuration: '3s' }} />,
                honorStatus: '¡Cuadro de Honor de Elite! 🌟🏆',
                honorColor: 'text-purple-700 bg-purple-100 border-purple-300 ring-4 ring-purple-200',
                desc: '¡Maestro Supremo de la Lógica! Has conquistado el curso con un puntaje casi impecable. Tu capacidad de abstracción es legendaria.',
                tip: '💡 Consejo: ¡Felicitaciones! Has completado el viaje con honores excepcionales.'
              };
            }
          };

          const sim = getSimulationResult(simulatedScore);

          return (
            <div className="bg-purple-900/5 text-purple-900 border-2 border-dashed border-purple-200 rounded-3xl p-6 md:p-8 relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                <div>
                  <span className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 inline-block">
                    ¡Pruébalo Tú Mismo!
                  </span>
                  <h4 className="text-xl font-black text-purple-950 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                    Simulador Interactivo de Desempeño
                  </h4>
                  <p className="text-purple-700 text-xs mt-1">
                    Arrastra el control para proyectar tu nivel de desempeño, copa ganada y estatus en el Cuadro de Honor de la Institución.
                  </p>
                </div>
                
                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-purple-100 shadow-sm shrink-0">
                  <div className="text-right">
                    <span className="text-[9px] font-black text-gray-400 block uppercase">Porcentaje Simulado</span>
                    <span className="text-3xl font-black text-purple-950">{simulatedScore}%</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-black">
                    %
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Range slider */}
                <div className="relative">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={simulatedScore}
                    onChange={(e) => {
                      playSound('pop');
                      setSimulatedScore(parseInt(e.target.value));
                    }}
                    className="w-full h-3 bg-purple-200 rounded-full appearance-none cursor-pointer accent-purple-600 outline-none transition-all focus:ring-4 focus:ring-purple-200"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-purple-400 mt-2 uppercase tracking-widest px-1">
                    <span>0% Bajo</span>
                    <span>30% Honor</span>
                    <span>60% Básico</span>
                    <span>80% Alto</span>
                    <span>90% Superior</span>
                    <span>95% Diamante</span>
                  </div>
                </div>

                {/* Dynamic Results Grid */}
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-between">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Desempeño Académico</span>
                    <span className={`px-4 py-2 rounded-xl font-black text-xs text-center border uppercase tracking-wider ${sim.color}`}>
                      {sim.label}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Premio Desbloqueado</span>
                      <span className="font-black text-xs text-purple-950">{sim.trophy}</span>
                    </div>
                    <div className="shrink-0 p-2 bg-purple-50 rounded-xl">
                      {sim.trophyIcon}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Estatus Cuadro de Honor</span>
                      <span className="font-black text-[11px] leading-tight block text-gray-700">{sim.honorStatus}</span>
                    </div>
                    <div className="text-xl shrink-0">
                      {simulatedScore >= 30 ? '👑' : '🔒'}
                    </div>
                  </div>
                </div>

                {/* Simulated message banner */}
                <div className="bg-white/60 p-4 rounded-2xl border border-purple-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-purple-950 font-medium leading-relaxed">
                      {sim.desc}
                    </p>
                    <p className="text-purple-600 font-bold">
                      {sim.tip}
                    </p>
                  </div>
                  <div className="shrink-0 text-center bg-purple-100 text-purple-700 font-black px-4 py-2 rounded-xl border border-purple-200">
                    {simulatedScore >= 60 ? '¡APROBADO!' : 'FALTA POCO'}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default CourseMenu;
