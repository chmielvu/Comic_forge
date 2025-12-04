
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
  narrative?: Beat;
  choices: string[];
  resolvedChoice?: string;
  isLoading: boolean;
  pageIndex?: number;
  isDecisionPage?: boolean;
}

export interface Beat {
  thought_chain?: string; // The AI's reasoning step (Graph of Thoughts / CoT)
  caption?: string;
  dialogue?: string;
  scene: string;
  choices: string[];
  focus_char: Archetype;
  location: string;
  mood?: string;
  intent?: string; // The Director's goal for this beat (e.g. "Break Spirit")
  ledger_impact?: Partial<YandereLedger>;
}

export interface Persona {
  base64: string;
  name: string;
  archetype: Archetype;
  coreFear?: string;
  desc?: string;
}
