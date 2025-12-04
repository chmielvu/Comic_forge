
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { create } from 'zustand';
import { Persona, YandereLedger, ComicFace, KnowledgeGraph } from './types';

interface GameState {
  // State
  hero: Persona | null;
  friend: Persona | null;
  soundEnabled: boolean;
  ledger: YandereLedger;
  graph: KnowledgeGraph; // The Neuro-Symbolic State
  comicFaces: ComicFace[];
  currentSheetIndex: number;
  isStarted: boolean;
  showSetup: boolean;
  isTransitioning: boolean;

  // Actions
  setHero: (hero: Persona | null) => void;
  setFriend: (friend: Persona | null) => void;
  setSoundEnabled: (enabled: boolean) => void;
  
  // Ledger/Graph actions
  setLedger: (ledger: YandereLedger) => void;
  updateLedger: (updates: Partial<YandereLedger>) => void;
  updateGraph: (updates: Partial<KnowledgeGraph>) => void;

  // Comic/Book actions
  setComicFaces: (faces: ComicFace[] | ((prev: ComicFace[]) => ComicFace[])) => void;
  updateFaceState: (id: string, updates: Partial<ComicFace>) => void;
  setCurrentSheetIndex: (index: number | ((prev: number) => number)) => void;
  
  // UI Flow actions
  setIsStarted: (isStarted: boolean) => void;
  setShowSetup: (show: boolean) => void;
  setIsTransitioning: (isTransitioning: boolean) => void;
  
  // Reset
  resetStore: () => void;
}

const INITIAL_LEDGER: YandereLedger = { hope: 50, trauma: 10, integrity: 90 };

const INITIAL_GRAPH: KnowledgeGraph = {
  nodes: [
    { id: 'Subject', type: 'character', label: 'Subject', properties: { state: 'defiant', injury: 'none' } },
    { id: 'Ally', type: 'character', label: 'Ally', properties: { state: 'anxious' } },
    { id: 'Authority', type: 'character', label: 'The Faculty', properties: { status: 'dominant' } },
    { id: 'The Forge', type: 'location', label: 'The Forge', properties: { atmosphere: 'oppressive' } }
  ],
  edges: [
    { source: 'Authority', target: 'Subject', relation: 'oppresses', weight: 80 },
    { source: 'Subject', target: 'Ally', relation: 'trusts', weight: 40 }
  ]
};

export const useGameStore = create<GameState>((set) => ({
  hero: null,
  friend: null,
  soundEnabled: true,
  ledger: INITIAL_LEDGER,
  graph: INITIAL_GRAPH,
  comicFaces: [],
  currentSheetIndex: 0,
  isStarted: false,
  showSetup: true,
  isTransitioning: false,

  setHero: (hero) => set((state) => {
    // Sync Hero to Graph
    const newNodes = state.graph.nodes.map(n => 
        n.id === 'Subject' && hero ? { ...n, label: hero.name, properties: { ...n.properties, bio: hero.bio } } : n
    );
    return { hero, graph: { ...state.graph, nodes: newNodes } };
  }),

  setFriend: (friend) => set((state) => {
    // Sync Ally to Graph
    const newNodes = state.graph.nodes.map(n => 
        n.id === 'Ally' && friend ? { ...n, label: friend.name, properties: { ...n.properties, bio: friend.bio } } : n
    );
    return { friend, graph: { ...state.graph, nodes: newNodes } };
  }),

  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  
  setLedger: (ledger) => set({ ledger }),
  updateLedger: (updates) => set((state) => ({
    ledger: { ...state.ledger, ...updates }
  })),

  updateGraph: (updates) => set((state) => ({
      graph: { ...state.graph, ...updates }
  })),

  setComicFaces: (input) => set((state) => ({
    comicFaces: typeof input === 'function' ? input(state.comicFaces) : input
  })),
  
  updateFaceState: (id, updates) => set((state) => ({
    comicFaces: state.comicFaces.map(f => f.id === id ? { ...f, ...updates } : f)
  })),

  setCurrentSheetIndex: (input) => set((state) => ({
    currentSheetIndex: typeof input === 'function' ? input(state.currentSheetIndex) : input
  })),

  setIsStarted: (isStarted) => set({ isStarted }),
  setShowSetup: (showSetup) => set({ showSetup }),
  setIsTransitioning: (isTransitioning) => set({ isTransitioning }),

  resetStore: () => set({
    hero: null,
    friend: null,
    ledger: INITIAL_LEDGER,
    graph: INITIAL_GRAPH,
    comicFaces: [],
    currentSheetIndex: 0,
    isStarted: false,
    showSetup: true,
    isTransitioning: false,
    // Note: soundEnabled persists
  })
}));
