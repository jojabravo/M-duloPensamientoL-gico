
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
  RESULTS = 'RESULTS'
}

export interface StudentProfile {
  name: string;
  progress: {
    ordering: {
      examples: {
        horizontal: boolean;
        vertical: boolean;
        circular: boolean;
        table: boolean;
      };
      challengeScore: number;
    };
    logic: {
      examples: {
        intro: boolean;
        connectors: boolean;
        inference: boolean;
        quantifiers: boolean;
        microbit: boolean; // Nuevo
      };
      challengeScores: {
        identification: number;
        symbolization: number;
        inference: number;
        quantifiers: number;
        microbit: number; // Nuevo
      };
    };
  };
}

export interface Person {
  id: string;
  name: string;
  color: string;
}
