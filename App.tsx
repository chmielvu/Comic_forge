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
import { ImageCache } from './ImageCache';

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

  // Utility to split a single image into two halves (for 2-panel spreads)
  const splitGridImage = async (gridImageBase64: string, numPanels: number): Promise<string[]> => {
      return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (!ctx) { reject("Canvas not supported"); return; }

              const panelWidth = img.width / numPanels;
              canvas.height = img.height;

              const results: string[] = [];
              for (let i = 0; i < numPanels; i++) {
                  canvas.width = panelWidth;
                  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear before drawing
                  ctx.drawImage(img, i * panelWidth, 0, panelWidth, img.height, 0, 0, panelWidth, img.height);
                  results.push(canvas.toDataURL('image/jpeg', 0.95));
              }
              resolve(results);
          };
          img.onerror = reject;
          img.src = gridImageBase64;
      });
  };

  const generateImageRaw = async (prompt: string, hero: Persona | null, friend: Persona | null, styleRefBase64?: string): Promise<string> => {
    const contents: any[] = []; // Using 'any' for flexibility with mixed text/inlineData
    
    // CRITICAL: Parse the JSON prompt string back to object for proper handling
    let promptObj: any;
    try {
        promptObj = JSON.parse(prompt);
    } catch {
        // Fallback for legacy string prompts
        promptObj = { header: VisualBible.ZERO_DRIFT_HEADER, raw_prompt: prompt };
    }

    // REF UPLOAD STRATEGY (from your tricks doc: "Ref Upload for Char Preservation")
    if (hero?.base64) {
        contents.push({ 
            text: `REFERENCE_ID_1 (Subject/Hero): Lock 100% facial features, hair texture, build, skin tone, clothing details. Use for character consistency across ALL panels.`,
            inlineData: { mimeType: 'image/jpeg', data: hero.base64 } 
        });
    }
    
    if (friend?.base64) {
        contents.push({ 
            text: `REFERENCE_ID_2 (Ally/Friend): Lock 100% facial features, hair, proportions, clothing details. Secondary character consistency anchor.`,
            inlineData: { mimeType: 'image/jpeg', data: friend.base64 } 
        });
    }

    if (styleRefBase64) {
        contents.push({
            text: "STYLE_REFERENCE: Match EXACT style from this image: color grading, lighting logic, texture quality, line weight consistency. Apply to ALL elements.",
            inlineData: { mimeType: 'image/jpeg', data: styleRefBase64 }
        });
    }

    // CRITICAL: Meta-prompt wrapper for Nano Banana adherence (from tricks: "JSON Schemas for Panels")
    const metaPrompt = {
        schema_lock: "ENFORCE_ALL_PARAMETERS. Strictly adhere to provided JSON structure. DO NOT deviate.",
        identity_anchors: [
            hero ? "REFERENCE_ID_1" : null,
            friend ? "REFERENCE_ID_2" : null
        ].filter(Boolean),
        ...(styleRefBase64 ? { style_anchor: "STYLE_REFERENCE" } : {}),
        ...promptObj,
        // Add negative prompt enforcement
        critical_negatives: [
            ...(VisualBible.VISUAL_MANDATE.negative.split(',').map(n => n.trim())),
            "character drift", "face morph", "inconsistent anatomy", "extra limbs",
            "modern clothing", "smartphones", "cars", "neon signs", "text", "watermark",
            "ugly", "deformed", "blurry", "low res", "out of frame"
        ],
        quality_lock: ["masterpiece", "8k", "sharp focus", "anatomical accuracy", "professional comic art", "high detail", "cinematic"]
    };

    contents.push({ text: JSON.stringify(metaPrompt, null, 2) });

    try {
        const ai = getAI();
        const res = await ai.models.generateContent({ 
            model: MODEL_IMAGE_GEN_NAME, 
            contents, 
            config: {
                // CRITICAL: Set these for consistency (from GAIS KB)
                temperature: 0.4, // Lower for consistency, not 0 to allow creative interpretation
                topP: 0.95,
                topK: 40
            }
        });
        
        const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        return part?.inlineData?.data ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : '';
    } catch (e) {
        handleAPIError(e);
        return '';
    }
  };

  // Helper function to extract character face from an image (for consistency reset)
  const extractCharacterFace = useCallback(async (imageUrl: string): Promise<string> => {
      return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              // Assume face is in upper-center third of image
              const faceWidth = img.width * 0.4;
              const faceHeight = img.height * 0.35;
              const faceX = (img.width - faceWidth) / 2;
              const faceY = img.height * 0.15;
              
              canvas.width = faceWidth;
              canvas.height = faceHeight;
              const ctx = canvas.getContext('2d')!;
              
              ctx.drawImage(img, faceX, faceY, faceWidth, faceHeight, 0, 0, faceWidth, faceHeight);
              
              resolve(canvas.toDataURL('image/jpeg', 0.95).split(',')[1]);
          };
          img.onerror = () => resolve(''); // Resolve with empty string on error
          img.src = imageUrl;
      });
  }, []);

  // Stage 3: The Renderer (Assets) & Vision Audit for single page
  const generateSinglePage = async (faceId: string, pageNum: number, type: ComicFace['type'], styleRefBase64?: string) => {
      const isDecision = DECISION_PAGES.includes(pageNum);
      const state = useGameStore.getState();

      // Enforce consistency reset every 5 pages
      if (pageNum % 5 === 0 && pageNum > 0 && type === 'story') {
          const lastHeroPanel = state.comicFaces
              .filter(f => f.imageUrl && f.narrative?.focus_char === 'Subject' && (f.pageIndex || 0) < pageNum)
              .slice(-1)[0];
          
          if (lastHeroPanel?.imageUrl && state.hero) {
              const heroFaceRef = await extractCharacterFace(lastHeroPanel.imageUrl);
              if (heroFaceRef) {
                  setHero({ ...state.hero, base64: heroFaceRef });
                  console.log(`Hero face re-captured from page ${lastHeroPanel.pageIndex} for consistency.`);
              }
          }
      }

      if (type === 'cover' || type === 'back_cover') {
         // Specialized handling for covers (legacy/simple)
         const prompt = type === 'cover' ? VisualBible.getCoverPrompt() : VisualBible.getBackCoverPrompt();
         const image = await generateImageRaw(prompt, state.hero, state.friend, styleRefBase64);
         updateFaceState(faceId, { imageUrl: image, isLoading: false, type });
         if (image) ImageCache.preload(image);
         return;
      }

      // 1. Run Analyst
      const analystOut = await runAnalyst(pageNum);
      
      // 2. Run Director
      const { directorOut, beat } = await runDirector(pageNum, isDecision, analystOut);
      
      // Update UI with text immediately
      updateFaceState(faceId, { narrative: { ...beat, thought_chain: `Analyst: ${analystOut.strategy} -> Director: ${directorOut.visuals.camera}` }, choices: beat.choices, isDecisionPage: isDecision });

      // 3. Render Image using Director's Visuals
      let visualPrompt = VisualBible.constructDirectorPrompt(directorOut, beat, !!state.hero, !!state.friend);
      // Append Character context for style consistency
      // Note: constructDirectorPrompt now includes character bios if present.

      const image = await generateImageRaw(visualPrompt, state.hero, state.friend, styleRefBase64);
      
      // 4. Render Audio
      let audioBase64: string | undefined;
      if (beat.dialogue || beat.caption) {
          // Pass target emotion for nuanced TTS delivery, and faceId for audio management
          audioBase64 = (await TTSService.generateSpeech(beat.dialogue || beat.caption || "", beat.focus_char, analystOut.target_emotion, faceId)) || undefined;
      }

      updateFaceState(faceId, { 
          imageUrl: image, 
          audioBase64,
          isLoading: false 
      });

      // Preload image
      if (image) ImageCache.preload(image);

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

  // New: Generate a spread of two pages in one go for consistency
  const generatePageSpread = async (leftPageNum: number, rightPageNum: number) => {
      const state = useGameStore.getState();
      const leftFaceId = `page-${leftPageNum}`;
      const rightFaceId = `page-${rightPageNum}`;

      // Mark as loading
      updateFaceState(leftFaceId, { isLoading: true });
      updateFaceState(rightFaceId, { isLoading: true });
      
      const prevPage = state.comicFaces.find(f => f.pageIndex === leftPageNum - 1);
      let styleRefBase64: string | undefined;
      if (prevPage?.imageUrl) styleRefBase64 = prevPage.imageUrl.split(',')[1];

      // Enforce consistency reset for the left page, which sets the tone for the spread
      if (leftPageNum % 5 === 0 && leftPageNum > 0) {
          const lastHeroPanel = state.comicFaces
              .filter(f => f.imageUrl && f.narrative?.focus_char === 'Subject' && (f.pageIndex || 0) < leftPageNum)
              .slice(-1)[0];
          
          if (lastHeroPanel?.imageUrl && state.hero) {
              const heroFaceRef = await extractCharacterFace(lastHeroPanel.imageUrl);
              if (heroFaceRef) {
                  setHero({ ...state.hero, base64: heroFaceRef });
                  console.log(`Hero face re-captured from page ${lastHeroPanel.pageIndex} for consistency.`);
              }
          }
      }

      // 1. Run Analyst for both pages
      const analystLeft = await runAnalyst(leftPageNum);
      const analystRight = await runAnalyst(rightPageNum);
      
      // 2. Run Director for both pages
      const { directorOut: dirLeft, beat: beatLeft } = await runDirector(leftPageNum, DECISION_PAGES.includes(leftPageNum), analystLeft);
      const { directorOut: dirRight, beat: beatRight } = await runDirector(rightPageNum, DECISION_PAGES.includes(rightPageNum), analystRight);

      // Update UI with text immediately
      updateFaceState(leftFaceId, { narrative: { ...beatLeft, thought_chain: `Analyst: ${analystLeft.strategy} -> Director: ${dirLeft.visuals.camera}` }, choices: beatLeft.choices, isDecisionPage: DECISION_PAGES.includes(leftPageNum) });
      updateFaceState(rightFaceId, { narrative: { ...beatRight, thought_chain: `Analyst: ${analystRight.strategy} -> Director: ${dirRight.visuals.camera}` }, choices: beatRight.choices, isDecisionPage: DECISION_PAGES.includes(rightPageNum) });


      // 3. Generate a single grid image for the spread
      const gridPrompt = VisualBible.get2PanelSpreadPrompt(
        { director: dirLeft, beat: beatLeft, position: 'left', hero: state.hero, friend: state.friend },
        { director: dirRight, beat: beatRight, position: 'right', hero: state.hero, friend: state.friend }
      );
      const gridImage = await generateImageRaw(gridPrompt, state.hero, state.friend, styleRefBase64);
      const [leftImg, rightImg] = await splitGridImage(gridImage, 2);

      // 4. Render Audio for both pages
      const audioLeftPromise = (beatLeft.dialogue || beatLeft.caption) 
          ? TTSService.generateSpeech(beatLeft.dialogue || beatLeft.caption || "", beatLeft.focus_char, analystLeft.target_emotion, leftFaceId)
          : Promise.resolve(undefined);
      const audioRightPromise = (beatRight.dialogue || beatRight.caption) 
          ? TTSService.generateSpeech(beatRight.dialogue || beatRight.caption || "", beatRight.focus_char, analystRight.target_emotion, rightFaceId)
          : Promise.resolve(undefined);
      
      const [audioLeft, audioRight] = await Promise.all([audioLeftPromise, audioRightPromise]);

      updateFaceState(leftFaceId, { 
          imageUrl: leftImg, 
          audioBase64: audioLeft,
          isLoading: false 
      });
      updateFaceState(rightFaceId, { 
          imageUrl: rightImg, 
          audioBase64: audioRight,
          isLoading: false 
      });

      // Preload images
      if (leftImg) ImageCache.preload(leftImg);
      if (rightImg) ImageCache.preload(rightImg);

      // 5. Vision-to-State Reconciliation (Simulated)
      updateLedger({
          trauma: Math.min(100, state.ledger.trauma + (analystLeft.target_emotion === 'Despair' ? 5 : 0) + (analystRight.target_emotion === 'Despair' ? 5 : 0)),
          hope: Math.max(0, state.ledger.hope - (analystLeft.strategy.includes("Break") ? 5 : 0) - (analystRight.strategy.includes("Break") ? 5 : 0))
      });
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
      
      // Mark ALL pages as generating BEFORE creating faces
      pagesToGen.forEach(p => generatingPages.current.add(p));

      const newFaces: ComicFace[] = pagesToGen.map(pageNum => ({
          id: `page-${pageNum}`,
          type: pageNum === BACK_COVER_PAGE ? 'back_cover' : 'story',
          choices: [],
          isLoading: true,
          pageIndex: pageNum
      }));

      // ATOMIC UPDATE: Use functional setter to avoid race conditions
      setComicFaces((prev) => {
          const existing = new Set(prev.map(f => f.id));
          const toAdd = newFaces.filter(f => !existing.has(f.id));
          return [...prev, ...toAdd];
      });

      // Generate sequentially, prioritizing spreads
      for (let i = 0; i < pagesToGen.length; i++) {
          const pageNum = pagesToGen[i];
          const faceId = `page-${pageNum}`;
          const type = pageNum === BACK_COVER_PAGE ? 'back_cover' : 'story';
          
          try {
              if (type === 'story' && pageNum % 2 === 0 && (pageNum + 1) <= TOTAL_PAGES) { // Generate even page with next odd page as a spread
                  if (pagesToGen.includes(pageNum + 1)) { // Only if the next page is also in this batch
                      await generatePageSpread(pageNum, pageNum + 1);
                      generatingPages.current.delete(pageNum);
                      generatingPages.current.delete(pageNum + 1);
                      i++; // Skip next page as it's already generated
                  } else {
                      await generateSinglePage(faceId, pageNum, type);
                      generatingPages.current.delete(pageNum);
                  }
              } else { // Generate odd page alone, or covers/back covers
                  await generateSinglePage(faceId, pageNum, type);
                  generatingPages.current.delete(pageNum);
              }
          } catch (e) {
              console.error(`Failed to generate page ${pageNum}:`, e);
              // Mark as failed
              updateFaceState(faceId, { 
                  isLoading: false, 
                  imageUrl: '', // Could set to error placeholder image
                  narrative: { 
                      scene: "Generation failed", 
                      choices: [], 
                      focus_char: 'Subject', 
                      location: 'Error', 
                      caption: "The narrative thread frayed..." 
                  }
              });
          } finally {
              generatingPages.current.delete(pageNum);
          }
      }
      
      // Preload next batch after current batch is done
      const maxGeneratedPage = Math.max(...pagesToGen); // This might be problematic if pagesToGen is empty after filtering
      const nextBatchStart = maxGeneratedPage + 1;
      if (nextBatchStart <= TOTAL_PAGES) {
          const nextPages = Array.from({ length: Math.min(BATCH_SIZE, TOTAL_PAGES - nextBatchStart + 1) }, (_, i) => nextBatchStart + i);
          ImageCache.preloadBatch(nextPages.map(p => {
              const face = useGameStore.getState().comicFaces.find(f => f.pageIndex === p);
              return face?.imageUrl || '';
          }).filter(Boolean));
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
        // Generate page 1 (odd) and page 2 (even) as a spread
        await generateBatch(1, INITIAL_PAGES); 
        generateBatch(3, BATCH_SIZE); // Pre-generate next batch
    }, 2000);
  }, [extractCharacterFace, setHero, setIsTransitioning, setComicFaces, generateSinglePage, setIsStarted, setShowSetup, setCurrentSheetIndex, generateBatch]);

  const handleChoice = useCallback(async (pageIndex: number, choice: string) => {
      SoundManager.play('click');
      updateFaceState(`page-${pageIndex}`, { resolvedChoice: choice });
      
      const currentFaces = useGameStore.getState().comicFaces;
      const maxPage = Math.max(...currentFaces.map(f => f.pageIndex || 0));
      
      if (maxPage + 1 <= TOTAL_PAGES) {
          generateBatch(maxPage + 1, BATCH_SIZE);
      }
  }, [updateFaceState, generateBatch]);

  const resetApp = useCallback(() => {
      SoundManager.play('click');
      SoundManager.stopAmbience();
      SoundManager.stopAllVoices(); // Stop all playing voices on reset
      resetStore();
      generatingPages.current.clear();
      ImageCache.clear(); // Clear image cache on reset
  }, [resetStore]);

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
  }, [setHero]);

  const handleFriendUpload = useCallback(async (file: File) => {
       try { 
         const base64 = await fileToBase64(file); 
         const existing = useGameStore.getState().friend;
         setFriend({ base64, desc: "The Ally", name: existing?.name || "Elara", archetype: 'Ally', bio: existing?.bio || "A fragile scholar." }); 
         SoundManager.play('success');
       } catch (e) { alert("Ally upload failed"); }
  }, [setFriend]);

  const handleUpdateHero = useCallback((updates: Partial<Persona>) => {
      const current = useGameStore.getState().hero;
      if (current) setHero({ ...current, ...updates });
  }, [setHero]);

  const handleUpdateFriend = useCallback((updates: Partial<Persona>) => {
      const current = useGameStore.getState().friend;
      if (current) setFriend({ ...current, ...updates });
  }, [setFriend]);

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
  }, [setCurrentSheetIndex, comicFaces]);

  const handleSoundToggle = useCallback((enabled: boolean) => {
      setSoundEnabled(enabled);
      SoundManager.setMuted(!enabled);
      if (enabled) {
          SoundManager.play('click');
          if (useGameStore.getState().isStarted) SoundManager.startAmbience();
      } else {
          SoundManager.stopAmbience();
      }
  }, [setSoundEnabled]);

  const handleOpenBook = useCallback(() => {
      setCurrentSheetIndex(1); 
      SoundManager.play('flip');
  }, [setCurrentSheetIndex]);

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