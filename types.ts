
export interface AppConfig {
  capitulo_1_activo: boolean;
  capitulo_2_activo: boolean;
  capitulo_3_activo: boolean;
  capitulo_4_activo: boolean;
}

export enum View {
  WELCOME = 'WELCOME',
  MENU = 'MENU',
  CHAPTER_1_MENU = 'CHAPTER_1_MENU',
  CHAPTER_2_MENU = 'CHAPTER_2_MENU',
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
  ADMIN = 'ADMIN',
  CRYPTO_LAB = 'CRYPTO_LAB',
  GRAPHIC_EQUATIONS = 'GRAPHIC_EQUATIONS',
  COMMUNICATION = 'COMMUNICATION',
  SUDOKU = 'SUDOKU',
  MAGIC_SQUARES = 'MAGIC_SQUARES',
  CRUCINUMERO = 'CRUCINUMERO',
  NUMERIC_PYRAMIDS = 'NUMERIC_PYRAMIDS',
  CH2_BLOCK3_MENU = 'CH2_BLOCK3_MENU'
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
  progreso_sudoku?: number;
  progreso_magic_squares?: number;
  progreso_crucinumeros?: number;
  progreso_piramides?: number;
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
  nivel_desempeno?: string;
}

export interface Person {
  id: string;
  name: string;
  color: string;
}

export interface Announcement {
  id: string;
  mensaje: string;
  Grado: string; // '6.1', '7.3', etc. or 'TODOS'
  grado?: string; // Keep for backward compatibility
  fecha: string;
  autor: string;
}

export interface MailMessage {
  id: string;
  Emisor: string;
  Receptor: string;
  Contenido: string;
  Grado: string;
  fecha: string;
  Leido: boolean;
}
