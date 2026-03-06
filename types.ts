
export enum View {
  WELCOME = 'WELCOME',
  MENU = 'MENU',
  CHAPTER_1_MENU = 'CHAPTER_1_MENU',
  THEORY = 'THEORY',
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
  CIRCULAR = 'CIRCULAR',
  TABLE = 'TABLE',
  LOGIC_THEORY = 'LOGIC_THEORY',
  LOGIC_CONNECTORS_THEORY = 'LOGIC_CONNECTORS_THEORY',
  LOGIC_INFERENCE_THEORY = 'LOGIC_INFERENCE_THEORY',
  PROP_IDENTIFIER = 'PROP_IDENTIFIER',
  LOGIC_CONNECTORS = 'LOGIC_CONNECTORS',
  INFERENCE_ROOM = 'INFERENCE_ROOM',
  QUANTIFIERS_GAME = 'QUANTIFIERS_GAME',
  MICROBIT_GAME = 'MICROBIT_GAME',
  CHALLENGE = 'CHALLENGE',
  RESULTS = 'RESULTS',
  ADMIN = 'ADMIN'
}

export interface StudentProfile {
  Usuario: string;
  Nombre?: string;
  Clave: string;
  Grado?: string;
  progreso_ordenamiento: number;
  progreso_proposiciones: number;
  progreso_cuantificadores: number;
  progreso_microbit: number;
  nota_capitulo_1?: number;
  progreso_criptogramas?: number;
  progreso_ecuaciones_graficas?: number;
  progreso_crucinumeros?: number;
  progreso_mensaje_oculto?: number;
  nota_periodo_2?: number;
  progreso_transformaciones?: number;
  progreso_geogebra?: number;
  progreso_mosaicos?: number;
  nota_periodo_3?: number;
  nota_periodo_4?: number;
  progreso_secuencias_graficas?: number;
  progreso_secuencias_numericas?: number;
  progreso_lateral?: number;
  progreso_historia_final?: number;
  ultima_conexion?: string;
}

export interface Person {
  id: string;
  name: string;
  color: string;
}
