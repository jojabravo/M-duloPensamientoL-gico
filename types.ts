
export interface AppConfig {
  capitulo_1_activo: boolean;
  capitulo_1_inicio?: string;
  capitulo_1_fin?: string;

  capitulo_2_activo: boolean;
  capitulo_2_inicio?: string;
  capitulo_2_fin?: string;

  capitulo_3_activo: boolean;
  capitulo_3_inicio?: string;
  capitulo_3_fin?: string;

  capitulo_4_activo: boolean;
  capitulo_4_inicio?: string;
  capitulo_4_fin?: string;

  // Bloques del Capítulo 2
  ch2_bloque1_activo?: boolean;
  ch2_bloque1_inicio?: string;
  ch2_bloque1_fin?: string;

  ch2_bloque2_activo?: boolean;
  ch2_bloque2_inicio?: string;
  ch2_bloque2_fin?: string;

  ch2_bloque3_activo?: boolean;
  ch2_bloque3_inicio?: string;
  ch2_bloque3_fin?: string;

  ch2_bloque4_activo?: boolean;
  ch2_bloque4_inicio?: string;
  ch2_bloque4_fin?: string;
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
  CH2_BLOCK3_MENU = 'CH2_BLOCK3_MENU',
  HIDDEN_MESSAGE = 'HIDDEN_MESSAGE'
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
  nota_capitulo_2?: number;
  progreso_transformaciones?: number;
  progreso_geogebra?: number;
  progreso_mosaicos?: number;
  nota_capitulo_3?: number;
  nota_capitulo_4?: number;
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
