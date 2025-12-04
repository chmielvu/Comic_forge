
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { create } from 'zustand';
import { Persona, YandereLedger, ComicFace } from './types';

interface GameState {
  // State
  hero: Persona | null;
  friend: Persona | null;
  soundEnabled: boolean;
  ledger: YandereLedger;
  comicFaces: ComicFace[];
  currentSheetIndex: number;
  isStarted: boolean;
  showSetup: boolean;
  isTransitioning: boolean;

  // Actions
  setHero: (hero: Persona | null) => void;
  setFriend: (friend: Persona | null) => void;
  setSoundEnabled: (enabled: boolean) => void;
  
  // Ledger actions
  setLedger: (ledger: YandereLedger) => void;
  updateLedger: (updates: Partial<YandereLedger>) => void;

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

export const useGameStore = create<GameState>((set) => ({
  hero: null,
  friend: null,
  soundEnabled: true,
  ledger: INITIAL_LEDGER,
  comicFaces: [],
  currentSheetIndex: 0,
  isStarted: false,
  showSetup: true,
  isTransitioning: false,

  setHero: (hero) => set({ hero }),
  setFriend: (friend) => set({ friend }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  
  setLedger: (ledger) => set({ ledger }),
  updateLedger: (updates) => set((state) => ({
    ledger: { ...state.ledger, ...updates }
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
    comicFaces: [],
    currentSheetIndex: 0,
    isStarted: false,
    showSetup: true,
    isTransitioning: false,
    // Note: soundEnabled persists
  })
}));
