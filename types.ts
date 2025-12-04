
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const MAX_STORY_PAGES = 12;
export const BACK_COVER_PAGE = 13;
export const TOTAL_PAGES = 13;
export const INITIAL_PAGES = 2;
export const GATE_PAGE = 2;
export const BATCH_SIZE = 6;
export const DECISION_PAGES = [3, 6, 9];

export type StatKey = 'hope' | 'trauma' | 'integrity';

export interface YandereLedger {
  hope: number;      // 0-100: Will to resist vs Learned Helplessness
  trauma: number;    // 0-100: Fragmentation of self
  integrity: number; // 0-100: Physical endurance
}

// --- Neuro-Symbolic Graph Architecture ---
export interface GraphNode {
  id: string; // e.g., "Subject", "Ally", "Provost"
  type: 'character' | 'location' | 'concept';
  label: string;
  properties: Record<string, any>; // e.g. { mood: "defiant", injury: "ribs" }
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string; // e.g. "fears", "trusts", "obsessed_with"
  weight: number; // 0-100
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// --- Agentic Pipeline Types ---

export interface AnalystOutput {
  narrative_phase: string;
  strategy: string; // e.g. "Isolate and Gaslight"
  target_emotion: string; // e.g. "Despair"
  graph_intent: string; // Text description of intended state change
}

export interface DirectorOutput {
  script: {
    caption: string;
    dialogue: string;
    speaker: string;
  };
  visuals: {
    camera: string; // "Low angle, 50mm"
    lighting: string; // "Chiaroscuro, rim light"
    pose: string; // "Subject kneeling"
    environment: string; // "Damp stone walls"
  };
  choices: string[];
}

// Expanded Archetypes based on Narrative Bible 5.0
export type Archetype = 
  // Faculty
  | 'Provost' 
  | 'Inquisitor' 
  | 'Confessor' 
  | 'Logician' 
  | 'Custodian' 
  | 'Veteran'
  // Prefects
  | 'Loyalist'
  | 'Pragmatist'
  | 'Siren'
  | 'Dissident'
  // Subjects
  | 'Subject' // The Player/Newcomer
  | 'Ally'    // The Fragile Bond
  | 'Guardian'
  | 'Archivist'
  | 'Ghost'
  | 'Jester'
  | 'Penitent';

export interface ComicFace {
  id: string;
  type: 'cover' | 'story' | 'back_cover';
  imageUrl?: string;
  narrative?: Beat; // Kept for UI compatibility, derived from DirectorOutput
  choices: string[];
  resolvedChoice?: string;
  isLoading: boolean;
  pageIndex?: number;
  isDecisionPage?: boolean;
  audioBase64?: string; // Stored audio data
}

export interface Beat {
  thought_chain?: string; 
  caption?: string;
  dialogue?: string;
  scene: string;
  choices: string[];
  focus_char: Archetype;
  location: string;
  mood?: string;
  intent?: string; 
  ledger_impact?: Partial<YandereLedger>;
}

export interface Persona {
  base64?: string; // Optional: If missing, we rely on bio/text description
  name: string;
  archetype: Archetype;
  coreFear?: string;
  desc?: string;
  bio?: string; // User-defined backstory
}
