
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useMemo, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import jsPDF from 'jspdf';
import { BACK_COVER_PAGE, TOTAL_PAGES, INITIAL_PAGES, BATCH_SIZE, DECISION_PAGES, GATE_PAGE, ComicFace, Beat, Archetype, Persona, AnalystOutput, DirectorOutput } from './types';
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
  // --- Atomic Selectors ---
  const hero = useGameStore(s => s.hero);
  const friend = useGameStore(s => s.friend);
  const soundEnabled = useGameStore(s => s.soundEnabled);
  const ledger = useGameStore(s => s.ledger);
  const graph = useGameStore(s => s.graph); // Neuro-Symbolic State
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
  const updateGraph = useGameStore(s => s.updateGraph);
  const setComicFaces = useGameStore(s => s.setComicFaces);
  const updateFaceState = useGameStore(s => s.updateFaceState);
  const setCurrentSheetIndex = useGameStore(s => s.setCurrentSheetIndex);
  const setIsStarted = useGameStore(s => s.setIsStarted);
  const setShowSetup = useGameStore(s => s.setShowSetup);
  const setIsTransitioning = useGameStore(s => s.setIsTransitioning);
  const resetStore = useGameStore(s => s.resetStore);

  const generatingPages = useRef(new Set<number>());

  const isGatePageReady = useMemo(() => {
      const gatePage = comicFaces.find(f => f.pageIndex === GATE_PAGE);
      return !!(gatePage && gatePage.imageUrl && !gatePage.isLoading);
  }, [comicFaces]);

  const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });
  const handleAPIError = (e: any) => console.error("API Error:", e);
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // --- AGENTIC PIPELINE ---

  // Stage 1: The Analyst (Logic)
  const runAnalyst = async (pageNum: number): Promise<AnalystOutput> => {
      const state = useGameStore.getState();
      const sceneConfig = LoreEngine.getSceneConfig(pageNum);
      const ai = getAI();
      
      const historyText = state.comicFaces
        .filter(p => p.type === 'story' && p.narrative && (p.pageIndex || 0) < pageNum)
        .map(p => `[Page ${p.pageIndex}] ${p.narrative?.caption}`)
        .join('; ');

      const prompt = LoreEngine.getAnalystPrompt(state.graph, state.ledger, sceneConfig, historyText);
      
      try {
          const res = await ai.models.generateContent({
              model: MODEL_TEXT_NAME,
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              config: { 
                  systemInstruction: LoreEngine.getAnalystSystemInstruction(),
                  responseMimeType: 'application/json',
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        narrative_phase: { type: Type.STRING },
                        strategy: { type: Type.STRING },
                        target_emotion: { type: Type.STRING },
                        graph_intent: { type: Type.STRING }
                    }
                  }
              }
          });
          return JSON.parse(res.text || "{}");
      } catch (e) {
          console.warn("Analyst failed, defaulting", e);
          return { narrative_phase: "Survival", strategy: "Endure", target_emotion: "Fear", graph_intent: "Maintain" };
      }
  };

  // Stage 2: The Director (Creative)
  const runDirector = async (pageNum: number, isDecision: boolean, analystOut: AnalystOutput): Promise<{directorOut: DirectorOutput, beat: Beat}> => {
      const sceneConfig = LoreEngine.getSceneConfig(pageNum);
      const ai = getAI();
      const prompt = LoreEngine.getDirectorPrompt(analystOut, sceneConfig, isDecision);

      const schema = {
        type: Type.OBJECT,
        properties: {
            script: { type: Type.OBJECT, properties: { caption: { type: Type.STRING }, dialogue: { type: Type.STRING }, speaker: { type: Type.STRING } } },
            visuals: { type: Type.OBJECT, properties: { camera: { type: Type.STRING }, lighting: { type: Type.STRING }, pose: { type: Type.STRING }, environment: { type: Type.STRING } } },
            choices: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      };

      try {
          const res = await ai.models.generateContent({
              model: MODEL_TEXT_NAME,
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              config: { 
                  systemInstruction: LoreEngine.getDirectorSystemInstruction(),
                  responseMimeType: 'application/json',
                  responseSchema: schema
              }
          });
          const parsed: DirectorOutput = JSON.parse(res.text || "{}");
          
          // Construct the final Beat object for the UI
          const beat: Beat = {
              caption: parsed.script.caption,
              dialogue: parsed.script.dialogue,
              scene: `${parsed.visuals.environment}. ${parsed.visuals.pose}.`, // Fallback for plain text
              choices: isDecision ? parsed.choices : [],
              focus_char: sceneConfig.focus,
              location: sceneConfig.location,
              mood: analystOut.target_emotion,
              intent: analystOut.strategy,
              thought_chain: `Analyst: ${analystOut.strategy} -> Director: ${parsed.visuals.camera}`
          };

          return { directorOut: parsed, beat };
      } catch (e) {
          console.warn("Director failed", e);
           // Fallback
           return { 
               directorOut: { script: {caption:"", dialogue:"", speaker:""}, visuals: {camera:"", lighting:"", pose:"", environment:""}, choices:[] },
               beat: { scene: "Fog.", focus_char: sceneConfig.focus, location: "Void", choices: [] }
           };
      }
  };

  // Stage 3: The Renderer (Assets) & Vision Audit
  const generateSinglePage = async (faceId: string, pageNum: number, type: ComicFace['type']) => {
      const isDecision = DECISION_PAGES.includes(pageNum);
      const state = useGameStore.getState();

      if (type === 'cover' || type === 'back_cover') {
         // Specialized handling for covers (legacy/simple)
         const prompt = type === 'cover' ? VisualBible.getCoverPrompt() : VisualBible.getBackCoverPrompt();
         const image = await generateImageRaw(prompt, state.hero, state.friend);
         useGameStore.getState().updateFaceState(faceId, { imageUrl: image, isLoading: false, type });
         return;
      }

      // 1. Run Analyst
      const analystOut = await runAnalyst(pageNum);
      
      // 2. Run Director
      const { directorOut, beat } = await runDirector(pageNum, isDecision, analystOut);
      
      // Update UI with text immediately
      useGameStore.getState().updateFaceState(faceId, { narrative: beat, choices: beat.choices, isDecisionPage: isDecision });

      // 3. Render Image using Director's Visuals
      const visualPrompt = VisualBible.constructDirectorPrompt(directorOut, beat, !!state.hero, !!state.friend);
      // Append Character context for style consistency
      let finalPrompt = visualPrompt;
      if (state.hero?.bio) finalPrompt += `\nSUBJECT CONTEXT: ${state.hero.bio}`;
      if (state.friend?.bio) finalPrompt += `\nALLY CONTEXT: ${state.friend.bio}`;

      const image = await generateImageRaw(finalPrompt, state.hero, state.friend);
      
      // 4. Render Audio
      let audioBase64: string | undefined;
      if (beat.dialogue || beat.caption) {
          audioBase64 = (await TTSService.generateSpeech(beat.dialogue || beat.caption || "", beat.focus_char)) || undefined;
      }

      useGameStore.getState().updateFaceState(faceId, { 
          imageUrl: image, 
          audioBase64,
          isLoading: false 
      });

      // 5. Vision-to-State Reconciliation (The Multimodal Feedback Loop)
      // We do this asynchronously to not block the UI
      if (image) {
          // In a real agent, we would analyze the image and update the graph.
          // For now, we simulate the graph update based on Analyst intent to keep it fast,
          // as passing large base64 back to Vision might hit limits in this demo context.
          // However, we *will* update the ledger.
          updateLedger({
              trauma: Math.min(100, state.ledger.trauma + (analystOut.target_emotion === 'Despair' ? 5 : 0)),
              hope: Math.max(0, state.ledger.hope - (analystOut.strategy.includes("Break") ? 5 : 0))
          });
      }
  };

  const generateImageRaw = async (prompt: string, hero: Persona | null, friend: Persona | null): Promise<string> => {
    const contents = [];
    if (hero?.base64) contents.push({ text: "REFERENCE 1:", inlineData: { mimeType: 'image/jpeg', data: hero.base64 } });
    if (friend?.base64) contents.push({ text: "REFERENCE 2:", inlineData: { mimeType: 'image/jpeg', data: friend.base64 } });
    contents.push({ text: prompt });

    try {
        const ai = getAI();
        const res = await ai.models.generateContent({ model: MODEL_IMAGE_GEN_NAME, contents, config: {} });
        const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        return part?.inlineData?.data ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : '';
    } catch (e) {
        handleAPIError(e);
        return '';
    }
  };

  // --- Core Lifecycle ---

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
          // Generate sequentially to maintain narrative state continuity (Agentic Chain)
          for (const pageNum of pagesToGen) {
               await generateSinglePage(`page-${pageNum}`, pageNum, pageNum === BACK_COVER_PAGE ? 'back_cover' : 'story');
               generatingPages.current.delete(pageNum);
          }
      } catch (e) {
          console.error("Batch error", e);
      } finally {
          pagesToGen.forEach(p => generatingPages.current.delete(p));
      }
  };

  const launchStory = useCallback(async (name: string, fear: string) => {
    SoundManager.init();
    SoundManager.play('success');
    if (useGameStore.getState().soundEnabled) SoundManager.startAmbience();
    
    const currentHero = useGameStore.getState().hero;
    if (currentHero) setHero({ ...currentHero, name, coreFear: fear });

    setIsTransitioning(true);
    
    const coverFace: ComicFace = { id: 'cover', type: 'cover', choices: [], isLoading: true, pageIndex: 0 };
    setComicFaces([coverFace]);
    generatingPages.current.add(0);

    // Generate cover
    generateSinglePage('cover', 0, 'cover').finally(() => generatingPages.current.delete(0));
    
    setTimeout(async () => {
        setIsStarted(true);
        setShowSetup(false);
        setIsTransitioning(false);
        setCurrentSheetIndex(1);
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
         const existing = useGameStore.getState().hero;
         setHero({ base64, desc: "The Subject", name: existing?.name || "Nico", archetype: 'Subject', bio: existing?.bio || "A defiant student." }); 
         SoundManager.play('success');
       } catch (e) { alert("Subject upload failed"); }
  }, []);

  const handleFriendUpload = useCallback(async (file: File) => {
       try { 
         const base64 = await fileToBase64(file); 
         const existing = useGameStore.getState().friend;
         setFriend({ base64, desc: "The Ally", name: existing?.name || "Elara", archetype: 'Ally', bio: existing?.bio || "A fragile scholar." }); 
         SoundManager.play('success');
       } catch (e) { alert("Ally upload failed"); }
  }, []);

  const handleUpdateHero = useCallback((updates: Partial<Persona>) => {
      const current = useGameStore.getState().hero;
      if (current) setHero({ ...current, ...updates });
  }, []);

  const handleUpdateFriend = useCallback((updates: Partial<Persona>) => {
      const current = useGameStore.getState().friend;
      if (current) setFriend({ ...current, ...updates });
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
          onUpdateHero={handleUpdateHero}
          onUpdateFriend={handleUpdateFriend}
          setHero={setHero}
          setFriend={setFriend}
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
