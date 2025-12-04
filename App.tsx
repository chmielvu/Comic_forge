
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useMemo, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import jsPDF from 'jspdf';
import { BACK_COVER_PAGE, TOTAL_PAGES, INITIAL_PAGES, BATCH_SIZE, DECISION_PAGES, GATE_PAGE, ComicFace, Beat, Archetype } from './types';
import { Setup } from './Setup';
import { Book } from './Book';
import { SoundManager } from './SoundEngine';
import { LoreEngine } from './LoreEngine';
import { VisualBible } from './VisualBible';
import { useGameStore } from './store';
import { TTSService } from './TTSService';

// --- Constants ---
const MODEL_IMAGE_GEN_NAME = "gemini-2.5-flash-image"; 
const MODEL_TEXT_NAME = "gemini-2.5-flash"; 

const App: React.FC = () => {
  // --- Atomic Selectors (Prevents Render Thrashing) ---
  const hero = useGameStore(s => s.hero);
  const friend = useGameStore(s => s.friend);
  const soundEnabled = useGameStore(s => s.soundEnabled);
  const ledger = useGameStore(s => s.ledger);
  const comicFaces = useGameStore(s => s.comicFaces);
  const currentSheetIndex = useGameStore(s => s.currentSheetIndex);
  const isStarted = useGameStore(s => s.isStarted);
  const showSetup = useGameStore(s => s.showSetup);
  const isTransitioning = useGameStore(s => s.isTransitioning);

  // --- Actions ---
  const setHero = useGameStore(s => s.setHero);
  const setFriend = useGameStore(s => s.setFriend);
  const setSoundEnabled = useGameStore(s => s.setSoundEnabled);
  const updateLedger = useGameStore(s => s.updateLedger);
  const setComicFaces = useGameStore(s => s.setComicFaces);
  const updateFaceState = useGameStore(s => s.updateFaceState);
  const setCurrentSheetIndex = useGameStore(s => s.setCurrentSheetIndex);
  const setIsStarted = useGameStore(s => s.setIsStarted);
  const setShowSetup = useGameStore(s => s.setShowSetup);
  const setIsTransitioning = useGameStore(s => s.setIsTransitioning);
  const resetStore = useGameStore(s => s.resetStore);

  // Local refs for generation tracking only (not state)
  const generatingPages = useRef(new Set<number>());

  // --- Derived State (Memoized) ---
  // Check if the "Gate Page" (usually page 2, where the story starts) has an image.
  // This boolean is passed down instead of the whole array to prevent Panel re-renders.
  const isGatePageReady = useMemo(() => {
      const gatePage = comicFaces.find(f => f.pageIndex === GATE_PAGE);
      return !!(gatePage && gatePage.imageUrl && !gatePage.isLoading);
  }, [comicFaces]);

  // --- AI Helpers ---
  const getAI = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  };

  const handleAPIError = (e: any) => {
    const msg = String(e);
    console.error("API Error:", msg);
    // Alert removed for smoother UX, rely on console/UI fallback
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateBeat = async (pageNum: number, isDecisionPage: boolean): Promise<Beat> => {
    // Access state directly via getState to avoid stale closures in async functions
    const state = useGameStore.getState();
    const currentHero = state.hero;
    const currentLedger = state.ledger;
    const currentFaces = state.comicFaces;

    if (!currentHero) throw new Error("No Subject");

    // Get context from LoreEngine (The Director)
    const sceneConfig = LoreEngine.getSceneConfig(pageNum);
    const systemInstruction = LoreEngine.getSystemInstruction(currentLedger);

    // Get relevant history
    const relevantHistory = currentFaces
        .filter(p => p.type === 'story' && p.narrative && (p.pageIndex || 0) < pageNum)
        .sort((a, b) => (a.pageIndex || 0) - (b.pageIndex || 0));

    const historyText = relevantHistory.map(p => 
      `[Page ${p.pageIndex}] [Location: ${p.narrative?.location}] [Focus: ${p.narrative?.focus_char}] (Action: "${p.narrative?.scene}") ${p.resolvedChoice ? `-> SUBJECT CHOICE: "${p.resolvedChoice}"` : ''}`
    ).join('\n');

    // Graph of Thoughts injection
    const prompt = `
DIRECTOR ORDER: GENERATE PAGE ${pageNum}.
SCENE CONFIG: 
- Location: ${sceneConfig.location}
- Focus Archetype: ${sceneConfig.focus}
- Narrative Intent: "${sceneConfig.intent}"
- Decision Page: ${isDecisionPage}

PREVIOUS EVENTS:
${historyText.length > 0 ? historyText : "The Subject arrives at The Forge. The air smells of salt and dread."}

EXECUTE GRAPH OF THOUGHTS:
1. Analyze the Subject's current Ledger (Hope: ${currentLedger.hope}, Trauma: ${currentLedger.trauma}).
2. Determine the Focus Character's strategy (e.g. Gaslighting, Kinetic Violence).
3. Generate the Beat JSON with rich, atmospheric dialogue and detailed visual descriptions.
`;

    // Strict Schema to prevent JSON errors
    const beatSchema = {
      type: Type.OBJECT,
      properties: {
        thought_chain: { type: Type.STRING },
        caption: { type: Type.STRING },
        dialogue: { type: Type.STRING },
        scene: { type: Type.STRING },
        choices: { type: Type.ARRAY, items: { type: Type.STRING } },
        ledger_impact: {
          type: Type.OBJECT,
          properties: {
            hope: { type: Type.NUMBER },
            trauma: { type: Type.NUMBER },
            integrity: { type: Type.NUMBER },
          }
        }
      },
      required: ["thought_chain", "caption", "dialogue", "scene"]
    };

    try {
        const ai = getAI();
        const res = await ai.models.generateContent({ 
            model: MODEL_TEXT_NAME, 
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { 
                responseMimeType: 'application/json',
                responseSchema: beatSchema,
                systemInstruction: systemInstruction 
            } 
        });
        
        // With schema, we can safely parse the text
        const parsed = JSON.parse(res.text || "{}");
        
        if (!isDecisionPage) parsed.choices = [];
        
        // Inject metadata for Visual Engine
        parsed.focus_char = sceneConfig.focus;
        parsed.location = sceneConfig.location;
        parsed.intent = sceneConfig.intent;

        if (parsed.ledger_impact) {
            updateLedger({
                hope: Math.max(0, Math.min(100, currentLedger.hope + (parsed.ledger_impact.hope || 0))),
                trauma: Math.max(0, Math.min(100, currentLedger.trauma + (parsed.ledger_impact.trauma || 0))),
                integrity: Math.max(0, Math.min(100, currentLedger.integrity + (parsed.ledger_impact.integrity || 0))),
            });
        }

        return parsed as Beat;
    } catch (e) {
        console.error("Beat generation failed", e);
        handleAPIError(e);
        return { 
            caption: "The fog thickens...", 
            scene: "A dark figure looms in the shadows.", 
            dialogue: "...",
            focus_char: sceneConfig.focus, 
            location: sceneConfig.location,
            choices: [] 
        };
    }
  };

  const generateImage = async (beat: Beat, type: ComicFace['type']): Promise<string> => {
    const state = useGameStore.getState();
    const currentHero = state.hero;
    const currentFriend = state.friend;

    const contents = [];
    
    // Inject References
    if (currentHero?.base64) {
        contents.push({ text: "REFERENCE 1 [SUBJECT]:" });
        contents.push({ inlineData: { mimeType: 'image/jpeg', data: currentHero.base64 } });
    }
    if (currentFriend?.base64) {
        contents.push({ text: "REFERENCE 2 [ALLY]:" });
        contents.push({ inlineData: { mimeType: 'image/jpeg', data: currentFriend.base64 } });
    }

    let promptText = "";
    if (type === 'cover') {
        promptText = VisualBible.getCoverPrompt();
    } else if (type === 'back_cover') {
        promptText = VisualBible.getBackCoverPrompt();
    } else {
        // Pass full Persona objects for better identity construction in VisualBible
        promptText = VisualBible.constructPrompt(beat, !!currentHero, !!currentFriend);
    }

    contents.push({ text: promptText });

    try {
        const ai = getAI();
        const res = await ai.models.generateContent({
          model: MODEL_IMAGE_GEN_NAME,
          contents: contents,
          config: {}
        });
        const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        return part?.inlineData?.data ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : '';
    } catch (e) { 
        handleAPIError(e);
        return ''; 
    }
  };

  const generateSinglePage = async (faceId: string, pageNum: number, type: ComicFace['type']) => {
      const isDecision = DECISION_PAGES.includes(pageNum);
      
      let beat: Beat = { scene: "", choices: [], focus_char: 'Subject', location: 'Void' };

      // 1. Generate Narrative Text First
      if (type === 'cover') {
          // Cover is visual only
      } else if (type === 'back_cover') {
          beat = { scene: "Teaser", choices: [], focus_char: 'Subject', location: 'Void' };
      } else {
          // Pass null for history, it will be fetched from store inside generateBeat
          beat = await generateBeat(pageNum, isDecision);
      }

      useGameStore.getState().updateFaceState(faceId, { narrative: beat, choices: beat.choices, isDecisionPage: isDecision });

      // 2. Generate Image AND Audio in Parallel (Efficiency Boost)
      const imagePromise = generateImage(beat, type);
      
      // Only generate audio for story pages with actual text
      let audioPromise: Promise<string | null> = Promise.resolve(null);
      if (type === 'story' && (beat.dialogue || beat.caption)) {
          // Prioritize dialogue for the voice acting, fallback to caption
          const textToSpeak = beat.dialogue || beat.caption || "";
          if (textToSpeak) {
              audioPromise = TTSService.generateSpeech(textToSpeak, beat.focus_char);
          }
      }

      const [url, audioData] = await Promise.all([imagePromise, audioPromise]);

      useGameStore.getState().updateFaceState(faceId, { 
          imageUrl: url, 
          audioBase64: audioData || undefined,
          isLoading: false 
      });
  };

  const generateBatch = async (startPage: number, count: number) => {
      const pagesToGen: number[] = [];
      for (let i = 0; i < count; i++) {
          const p = startPage + i;
          if (p <= TOTAL_PAGES && !generatingPages.current.has(p)) {
              pagesToGen.push(p);
          }
      }
      
      if (pagesToGen.length === 0) return;
      pagesToGen.forEach(p => generatingPages.current.add(p));

      const newFaces: ComicFace[] = [];
      pagesToGen.forEach(pageNum => {
          const type = pageNum === BACK_COVER_PAGE ? 'back_cover' : 'story';
          newFaces.push({ id: `page-${pageNum}`, type, choices: [], isLoading: true, pageIndex: pageNum });
      });

      setComicFaces((prev) => {
          const existing = new Set(prev.map(f => f.id));
          return [...prev, ...newFaces.filter(f => !existing.has(f.id))];
      });

      try {
          // Sequential generation for narrative continuity, but could be parallelized if history is pre-calculated
          // We keep it sequential here to ensure Ledger updates correctly propagate
          for (const pageNum of pagesToGen) {
               await generateSinglePage(`page-${pageNum}`, pageNum, pageNum === BACK_COVER_PAGE ? 'back_cover' : 'story');
               generatingPages.current.delete(pageNum);
          }
      } catch (e) {
          console.error("Batch generation error", e);
      } finally {
          pagesToGen.forEach(p => generatingPages.current.delete(p));
      }
  }

  // --- Memoized Handlers to prevent re-renders in children ---

  const launchStory = useCallback(async (name: string, fear: string) => {
    SoundManager.init();
    SoundManager.play('success');
    if (useGameStore.getState().soundEnabled) SoundManager.startAmbience();
    
    const currentHero = useGameStore.getState().hero;
    if (!currentHero) return;
    
    const updatedHero = { ...currentHero, name, coreFear: fear, archetype: 'Subject' as Archetype };
    setHero(updatedHero);

    setIsTransitioning(true);
    
    const coverFace: ComicFace = { id: 'cover', type: 'cover', choices: [], isLoading: true, pageIndex: 0 };
    setComicFaces([coverFace]);
    generatingPages.current.add(0);

    // Initial generation sequence
    generateSinglePage('cover', 0, 'cover').finally(() => generatingPages.current.delete(0));
    
    setTimeout(async () => {
        setIsStarted(true);
        setShowSetup(false);
        setIsTransitioning(false);
        setCurrentSheetIndex(1); // Open book
        await generateBatch(1, INITIAL_PAGES);
        generateBatch(3, 3);
    }, 2000);
  }, []);

  const handleChoice = useCallback(async (pageIndex: number, choice: string) => {
      SoundManager.play('click');
      updateFaceState(`page-${pageIndex}`, { resolvedChoice: choice });
      
      const currentFaces = useGameStore.getState().comicFaces;
      const maxPage = Math.max(...currentFaces.map(f => f.pageIndex || 0));
      
      if (maxPage + 1 <= TOTAL_PAGES) {
          generateBatch(maxPage + 1, BATCH_SIZE);
      }
  }, []);

  const resetApp = useCallback(() => {
      SoundManager.play('click');
      SoundManager.stopAmbience();
      resetStore();
      generatingPages.current.clear();
  }, []);

  const downloadPDF = useCallback(() => {
    SoundManager.play('click');
    const PAGE_WIDTH = 480;
    const PAGE_HEIGHT = 720;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [PAGE_WIDTH, PAGE_HEIGHT] });
    const pagesToPrint = useGameStore.getState().comicFaces
        .filter(face => face.imageUrl && !face.isLoading)
        .sort((a, b) => (a.pageIndex || 0) - (b.pageIndex || 0));

    pagesToPrint.forEach((face, index) => {
        if (index > 0) doc.addPage([PAGE_WIDTH, PAGE_HEIGHT], 'portrait');
        if (face.imageUrl) doc.addImage(face.imageUrl, 'JPEG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    });
    doc.save('The-Forges-Loom.pdf');
  }, []);

  const handleHeroUpload = useCallback(async (file: File) => {
       try { 
         const base64 = await fileToBase64(file); 
         setHero({ base64, desc: "The Subject", name: "Nico", archetype: 'Subject' }); 
         SoundManager.play('success');
       } catch (e) { alert("Subject upload failed"); }
  }, []);

  const handleFriendUpload = useCallback(async (file: File) => {
       try { 
         const base64 = await fileToBase64(file); 
         setFriend({ base64, desc: "The Ally", name: "Darius", archetype: 'Ally' }); 
         SoundManager.play('success');
       } catch (e) { alert("Ally upload failed"); }
  }, []);

  const handleSheetClick = useCallback((index: number) => {
      const state = useGameStore.getState();
      if (!state.isStarted) return;
      if (index === 0 && state.currentSheetIndex === 0) return;
      
      if (index < state.currentSheetIndex) {
         setCurrentSheetIndex(index);
         SoundManager.play('flip');
      }
      else if (index === state.currentSheetIndex && state.comicFaces.find(f => f.pageIndex === index)?.imageUrl) {
         setCurrentSheetIndex(prev => prev + 1);
         SoundManager.play('flip');
      }
  }, []);

  const handleSoundToggle = useCallback((enabled: boolean) => {
      setSoundEnabled(enabled);
      SoundManager.setMuted(!enabled);
      if (enabled) {
          SoundManager.play('click');
          if (useGameStore.getState().isStarted) SoundManager.startAmbience();
      } else {
          SoundManager.stopAmbience();
      }
  }, []);

  const handleOpenBook = useCallback(() => {
      setCurrentSheetIndex(1); 
      SoundManager.play('flip');
  }, []);

  return (
    <div className="comic-scene">
      <Setup 
          show={showSetup}
          isTransitioning={isTransitioning}
          hero={hero}
          friend={friend}
          soundEnabled={soundEnabled}
          onHeroUpload={handleHeroUpload}
          onFriendUpload={handleFriendUpload}
          onLaunch={launchStory}
          onSoundChange={handleSoundToggle}
      />
      <Book 
          comicFaces={comicFaces}
          currentSheetIndex={currentSheetIndex}
          isStarted={isStarted}
          isSetupVisible={showSetup && !isTransitioning}
          onSheetClick={handleSheetClick}
          onChoice={handleChoice}
          onOpenBook={handleOpenBook}
          onDownload={downloadPDF}
          onReset={resetApp}
          isGatePageReady={isGatePageReady} 
      />
    </div>
  );
};

export default App;
