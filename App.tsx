
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import jsPDF from 'jspdf';
import { MAX_STORY_PAGES, BACK_COVER_PAGE, TOTAL_PAGES, INITIAL_PAGES, BATCH_SIZE, DECISION_PAGES, ComicFace, Beat, Persona, YandereLedger, Archetype } from './types';
import { Setup } from './Setup';
import { Book } from './Book';
import { useApiKey } from './useApiKey';
import { ApiKeyDialog } from './ApiKeyDialog';
import { SoundManager } from './SoundEngine';
import { LoreEngine } from './LoreEngine';
import { VisualBible } from './VisualBible';

// --- Constants ---
const MODEL_V3 = "gemini-3-pro-image-preview";
const MODEL_IMAGE_GEN_NAME = MODEL_V3;
const MODEL_TEXT_NAME = MODEL_V3;

const App: React.FC = () => {
  // --- API Key Hook ---
  const { validateApiKey, setShowApiKeyDialog, showApiKeyDialog, handleApiKeyDialogContinue } = useApiKey();

  const [hero, setHeroState] = useState<Persona | null>(null); // "The Subject"
  const [friend, setFriendState] = useState<Persona | null>(null); // "The Ally"
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // New State: The Yandere Ledger
  const [ledger, setLedger] = useState<YandereLedger>({ hope: 50, trauma: 10, integrity: 90 });

  const heroRef = useRef<Persona | null>(null);
  const friendRef = useRef<Persona | null>(null);

  const setHero = (p: Persona | null) => { setHeroState(p); heroRef.current = p; };
  const setFriend = (p: Persona | null) => { setFriendState(p); friendRef.current = p; };
  
  const [comicFaces, setComicFaces] = useState<ComicFace[]>([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  
  // --- Transition States ---
  const [showSetup, setShowSetup] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const generatingPages = useRef(new Set<number>());
  const historyRef = useRef<ComicFace[]>([]);

  // --- AI Helpers ---
  const getAI = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  };

  const handleAPIError = (e: any) => {
    const msg = String(e);
    console.error("API Error:", msg);
    if (
      msg.includes('Requested entity was not found') || 
      msg.includes('API_KEY_INVALID') || 
      msg.toLowerCase().includes('permission denied')
    ) {
      setShowApiKeyDialog(true);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateBeat = async (history: ComicFace[], pageNum: number, isDecisionPage: boolean): Promise<Beat> => {
    if (!heroRef.current) throw new Error("No Subject");

    // Get context from LoreEngine (The Director)
    const sceneConfig = LoreEngine.getSceneConfig(pageNum);
    const systemInstruction = LoreEngine.getSystemInstruction(ledger);

    // Get relevant history
    const relevantHistory = history
        .filter(p => p.type === 'story' && p.narrative && (p.pageIndex || 0) < pageNum)
        .sort((a, b) => (a.pageIndex || 0) - (b.pageIndex || 0));

    const historyText = relevantHistory.map(p => 
      `[Page ${p.pageIndex}] [Location: ${p.narrative?.location}] [Focus: ${p.narrative?.focus_char}] (Caption: "${p.narrative?.caption || ''}") (Action: "${p.narrative?.scene}") ${p.resolvedChoice ? `-> SUBJECT CHOICE: "${p.resolvedChoice}"` : ''}`
    ).join('\n');

    const prompt = `
DIRECTOR ORDER: GENERATE PAGE ${pageNum}.
SCENE CONFIG: 
- Location: ${sceneConfig.location}
- Focus Archetype: ${sceneConfig.focus}
- Narrative Intent: "${sceneConfig.intent}"

PREVIOUS EVENTS:
${historyText.length > 0 ? historyText : "The Subject arrives at The Forge. The air smells of salt and dread."}

INSTRUCTIONS:
1. Write the narrative beat. Use the "Grammar of Suffering" for any pain/trauma.
2. DIALOGUE: Write concise, punchy dialogue (max 20 words). 
   - If Focus is SELENE: Use the 'Voice of Inevitability' (academic, bored).
   - If Focus is CALISTA: Use 'Weaponized Sexuality' (endearments like 'pet', 'darling' even when cruel).
   - If Focus is PETRA: Use 'Gleeful Cruelty'.
3. If this is a decision page (${isDecisionPage}), offer 2 psychological choices (e.g. Trust vs Isolate, Endure vs Defy).
4. VISUAL SCENE: Describe the scene focusing on "The Gaze" and "The Pose". It should be intimate and claustrophobic.

OUTPUT JSON:
{
  "caption": "Atmospheric narration (max 30 words).",
  "dialogue": "Character speech (max 20 words).",
  "scene": "Visual description for the artist. Focus on pose, lighting, and power dynamics.",
  "choices": ["Choice A", "Choice B"] (Only if decision page),
  "ledger_impact": {"hope": -5, "trauma": +10} (Estimated impact)
}
`;

    try {
        const ai = getAI();
        const res = await ai.models.generateContent({ 
            model: MODEL_TEXT_NAME, 
            contents: prompt, 
            config: { 
                responseMimeType: 'application/json',
                systemInstruction: systemInstruction 
            } 
        });
        
        let rawText = res.text || "{}";
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(rawText);
        
        if (parsed.dialogue) parsed.dialogue = parsed.dialogue.replace(/^[\w\s\-]+:\s*/i, '').replace(/["']/g, '').trim();
        if (parsed.caption) parsed.caption = parsed.caption.replace(/^[\w\s\-]+:\s*/i, '').trim();
        if (!isDecisionPage) parsed.choices = [];
        
        // Inject metadata for Visual Engine
        parsed.focus_char = sceneConfig.focus;
        parsed.location = sceneConfig.location;
        parsed.intent = sceneConfig.intent;

        // Apply ledger impact
        if (parsed.ledger_impact) {
            setLedger(prev => ({
                hope: Math.max(0, Math.min(100, prev.hope + (parsed.ledger_impact.hope || 0))),
                trauma: Math.max(0, Math.min(100, prev.trauma + (parsed.ledger_impact.trauma || 0))),
                integrity: Math.max(0, Math.min(100, prev.integrity + (parsed.ledger_impact.integrity || 0))),
            }));
        }

        return parsed as Beat;
    } catch (e) {
        console.error("Beat generation failed", e);
        handleAPIError(e);
        return { 
            caption: "The fog thickens...", 
            scene: "A dark figure looms in the shadows.", 
            focus_char: sceneConfig.focus, 
            location: sceneConfig.location,
            choices: [] 
        };
    }
  };

  const generateImage = async (beat: Beat, type: ComicFace['type']): Promise<string> => {
    const contents = [];
    
    // Inject References
    if (heroRef.current?.base64) {
        contents.push({ text: "REFERENCE 1 [SUBJECT]:" });
        contents.push({ inlineData: { mimeType: 'image/jpeg', data: heroRef.current.base64 } });
    }
    if (friendRef.current?.base64) {
        contents.push({ text: "REFERENCE 2 [ALLY]:" });
        contents.push({ inlineData: { mimeType: 'image/jpeg', data: friendRef.current.base64 } });
    }

    let promptText = "";
    if (type === 'cover') {
        promptText = VisualBible.getCoverPrompt();
    } else if (type === 'back_cover') {
        promptText = VisualBible.getBackCoverPrompt();
    } else {
        promptText = VisualBible.constructPrompt(beat, heroRef.current!, friendRef.current);
    }

    contents.push({ text: promptText });

    try {
        const ai = getAI();
        const res = await ai.models.generateContent({
          model: MODEL_IMAGE_GEN_NAME,
          contents: contents,
          config: { imageConfig: { aspectRatio: '2:3' } }
        });
        const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        return part?.inlineData?.data ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : '';
    } catch (e) { 
        handleAPIError(e);
        return ''; 
    }
  };

  const updateFaceState = (id: string, updates: Partial<ComicFace>) => {
      setComicFaces(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
      const idx = historyRef.current.findIndex(f => f.id === id);
      if (idx !== -1) historyRef.current[idx] = { ...historyRef.current[idx], ...updates };
  };

  const generateSinglePage = async (faceId: string, pageNum: number, type: ComicFace['type']) => {
      const isDecision = DECISION_PAGES.includes(pageNum);
      
      let beat: Beat = { scene: "", choices: [], focus_char: 'Subject', location: 'Void' };

      if (type === 'cover') {
          // Cover is visual only
      } else if (type === 'back_cover') {
          beat = { scene: "Teaser", choices: [], focus_char: 'Subject', location: 'Void' };
      } else {
          beat = await generateBeat(historyRef.current, pageNum, isDecision);
      }

      updateFaceState(faceId, { narrative: beat, choices: beat.choices, isDecisionPage: isDecision });
      const url = await generateImage(beat, type);
      updateFaceState(faceId, { imageUrl: url, isLoading: false });
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

      setComicFaces(prev => {
          const existing = new Set(prev.map(f => f.id));
          return [...prev, ...newFaces.filter(f => !existing.has(f.id))];
      });
      newFaces.forEach(f => { if (!historyRef.current.find(h => h.id === f.id)) historyRef.current.push(f); });

      try {
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

  const launchStory = async (name: string, fear: string) => {
    SoundManager.init();
    SoundManager.play('success');

    const hasKey = await validateApiKey();
    if (!hasKey) return;
    
    if (!heroRef.current) return;
    
    const updatedHero = { ...heroRef.current, name, coreFear: fear, archetype: 'Subject' as Archetype };
    setHero(updatedHero);

    setIsTransitioning(true);
    
    const coverFace: ComicFace = { id: 'cover', type: 'cover', choices: [], isLoading: true, pageIndex: 0 };
    setComicFaces([coverFace]);
    historyRef.current = [coverFace];
    generatingPages.current.add(0);

    generateSinglePage('cover', 0, 'cover').finally(() => generatingPages.current.delete(0));
    
    setTimeout(async () => {
        setIsStarted(true);
        setShowSetup(false);
        setIsTransitioning(false);
        await generateBatch(1, INITIAL_PAGES);
        generateBatch(3, 3);
    }, 2000);
  };

  const handleChoice = async (pageIndex: number, choice: string) => {
      SoundManager.play('click');
      updateFaceState(`page-${pageIndex}`, { resolvedChoice: choice });
      const maxPage = Math.max(...historyRef.current.map(f => f.pageIndex || 0));
      if (maxPage + 1 <= TOTAL_PAGES) {
          generateBatch(maxPage + 1, BATCH_SIZE);
      }
  }

  const resetApp = () => {
      SoundManager.play('click');
      setIsStarted(false);
      setShowSetup(true);
      setComicFaces([]);
      setCurrentSheetIndex(0);
      historyRef.current = [];
      generatingPages.current.clear();
      setHero(null);
      setFriend(null);
      setLedger({ hope: 50, trauma: 10, integrity: 90 });
  };

  const downloadPDF = () => {
    SoundManager.play('click');
    const PAGE_WIDTH = 480;
    const PAGE_HEIGHT = 720;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [PAGE_WIDTH, PAGE_HEIGHT] });
    const pagesToPrint = comicFaces.filter(face => face.imageUrl && !face.isLoading).sort((a, b) => (a.pageIndex || 0) - (b.pageIndex || 0));

    pagesToPrint.forEach((face, index) => {
        if (index > 0) doc.addPage([PAGE_WIDTH, PAGE_HEIGHT], 'portrait');
        if (face.imageUrl) doc.addImage(face.imageUrl, 'JPEG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    });
    doc.save('The-Forges-Loom.pdf');
  };

  const handleHeroUpload = async (file: File) => {
       try { 
         const base64 = await fileToBase64(file); 
         setHero({ base64, desc: "The Subject", name: "Nico", archetype: 'Subject' }); 
         SoundManager.play('success');
       } catch (e) { alert("Subject upload failed"); }
  };
  const handleFriendUpload = async (file: File) => {
       try { 
         const base64 = await fileToBase64(file); 
         setFriend({ base64, desc: "The Ally", name: "Darius", archetype: 'Ally' }); 
         SoundManager.play('success');
       } catch (e) { alert("Ally upload failed"); }
  };

  const handleSheetClick = (index: number) => {
      if (!isStarted) return;
      if (index === 0 && currentSheetIndex === 0) return;
      
      if (index < currentSheetIndex) {
         setCurrentSheetIndex(index);
         SoundManager.play('flip');
      }
      else if (index === currentSheetIndex && comicFaces.find(f => f.pageIndex === index)?.imageUrl) {
         setCurrentSheetIndex(prev => prev + 1);
         SoundManager.play('flip');
      }
  };

  const handleSoundToggle = (enabled: boolean) => {
      setSoundEnabled(enabled);
      SoundManager.setMuted(!enabled);
      if (enabled) SoundManager.play('click');
  };

  return (
    <div className="comic-scene">
      {showApiKeyDialog && <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />}
      
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
          onOpenBook={() => { setCurrentSheetIndex(1); SoundManager.play('flip'); }}
          onDownload={downloadPDF}
          onReset={resetApp}
      />
    </div>
  );
};

export default App;
