
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ComicFace, Archetype } from './types';
import { LoadingFX } from './LoadingFX';
import { SoundManager } from './SoundEngine';

interface PanelProps {
    face?: ComicFace;
    onChoice: (pageIndex: number, choice: string) => void;
    onOpenBook: () => void;
    onDownload: () => void;
    onReset: () => void;
    isGatePageReady: boolean; // Replaces allFaces to fix memoization
}

const PanelComponent: React.FC<PanelProps> = ({ face, onChoice, onOpenBook, onDownload, onReset, isGatePageReady }) => {
    if (!face) return <div className="w-full h-full bg-[#0a0a0a]" />; // Void color
    if (face.isLoading && !face.imageUrl) return <LoadingFX />;
    
    const isCover = face.type === 'cover';
    const isBackCover = face.type === 'back_cover';
    const isFullBleed = isCover || isBackCover;
    const narrative = face.narrative;

    // --- Visual Filters (Vampire Noir / Renaissance Brutalism) ---
    const getImageStyle = () => {
        if (isCover) {
            return { filter: 'contrast(1.15) saturate(1.1) sepia(0.15)' };
        }
        if (isBackCover) {
            return { filter: 'grayscale(0.8) contrast(1.2) brightness(0.9)' };
        }
        return { filter: 'contrast(1.05) saturate(0.95) sepia(0.05)' };
    };

    // --- Dynamic Vocal Styling (Bubble Logic) ---
    const getVoiceStyle = (archetype: Archetype) => {
        switch (archetype) {
            case 'Provost':
            case 'Loyalist':
                // "The Voice of Inevitability": Regal, Dark, Serif
                return {
                    container: "bg-[#1a0505] border-[3px] border-[#d4af37] rounded-sm shadow-[0_5px_15px_rgba(0,0,0,0.8)]",
                    text: "text-[#d4af37] font-serif tracking-wide leading-relaxed",
                    anim: "animate-in fade-in zoom-in-95 duration-1000"
                };
            
            case 'Inquisitor':
            case 'Custodian':
                // "The Voice of Kinetic Glee": Sharp, Aggressive, Loud
                return {
                    container: "bg-white border-4 border-[#7c0a0a] rounded-none transform -rotate-2 skew-x-3 shadow-[5px_5px_0px_#000]",
                    text: "text-black font-comic uppercase font-bold tracking-tighter leading-tight",
                    anim: "animate-in slide-in-from-right-10 duration-300 bounce-in"
                };

            case 'Confessor':
            case 'Siren':
                // "The Voice of Corrupted Intimacy": Soft, Rounded, Whispery
                return {
                    container: "bg-[#fff0f5] border border-pink-900/30 rounded-[30px] shadow-lg backdrop-blur-sm bg-opacity-90",
                    text: "text-pink-950 font-serif italic leading-relaxed",
                    anim: "animate-in fade-in slide-in-from-bottom-2 duration-1000 ease-out"
                };

            case 'Logician':
            case 'Pragmatist':
                // "The Voice of Cold Data": Mechanical, Boxy, Monotone
                return {
                    container: "bg-[#f0fdf4] border-l-8 border-[#166534] rounded-r-md shadow-md",
                    text: "text-[#14532d] font-mono text-sm leading-snug",
                    anim: "animate-in fade-in slide-in-from-left-4 duration-500"
                };

            default: // Subject, Ally, etc.
                // "The Voice of Survival": Traditional Comic, Distressed
                return {
                    container: "bg-white border-2 border-black rounded-[50%_50%_50%_50%_/_10%_10%_10%_10%] shadow-lg",
                    text: "text-black font-comic leading-tight",
                    anim: "animate-in fade-in zoom-in-50 duration-500"
                };
        }
    };

    const voice = narrative ? getVoiceStyle(narrative.focus_char) : null;

    return (
        <div className={`panel-container relative group w-full h-full flex items-center justify-center overflow-hidden ${isFullBleed ? '!p-0 !bg-[#0a0a0a]' : 'bg-[#e3dac9]'}`}>
            
            {/* Authentic Gloss Overlay */}
            <div className="gloss z-30 pointer-events-none absolute inset-0 mix-blend-screen opacity-40 bg-gradient-to-br from-white/10 to-transparent" />
            
            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />

            {/* The Image */}
            {face.imageUrl && (
                <img 
                    src={face.imageUrl} 
                    alt="Narrative visualization" 
                    className={`panel-image w-full h-full ${isFullBleed ? 'object-cover' : 'object-contain border-4 border-[#1a1a1a]'}`} 
                    style={getImageStyle()}
                />
            )}
            
            {/* --- AUDIO CONTROL (Global) --- */}
            {face?.audioBase64 && !isFullBleed && (
                <div className="absolute top-4 right-4 z-50">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (face.audioBase64) SoundManager.playVoice(face.audioBase64);
                        }}
                        className="bg-black/60 hover:bg-[#7c0a0a] text-[#d4af37] border border-[#d4af37] rounded-full p-3 transition-all transform hover:scale-110 backdrop-blur-sm shadow-lg group-hover:opacity-100 opacity-80"
                        title="Play Narration"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                    </button>
                </div>
            )}

            {/* --- NARRATIVE LAYERS --- */}
            {!isFullBleed && narrative && voice && (
                <>
                    {/* Caption Box (Narration) - Always Top/Corner */}
                    {narrative.caption && (
                        <div className="absolute top-0 inset-x-0 p-4 z-40 pointer-events-none">
                            <div className="bg-[#e3dac9] border-2 border-black p-2 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] max-w-[90%] mx-auto transform -rotate-1 animate-in fade-in slide-in-from-top-4 duration-700">
                                <p className="text-black font-serif text-xs md:text-sm uppercase tracking-widest leading-relaxed text-center">
                                    {narrative.caption}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Dialogue Bubble - Dynamic Style */}
                    {narrative.dialogue && (
                        <div className="absolute bottom-32 inset-x-0 px-6 z-40 pointer-events-none flex justify-center">
                            <div className={`${voice.container} p-4 max-w-[85%] ${voice.anim} relative`}>
                                <p className={`${voice.text} text-base md:text-lg`}>
                                    "{narrative.dialogue}"
                                </p>
                                
                                {/* Pulsing Audio Indicator Next to Dialogue */}
                                {face?.audioBase64 && (
                                    <div className="absolute -right-3 -top-3 w-6 h-6 flex items-center justify-center bg-black/80 rounded-full border border-[#d4af37] animate-pulse cursor-pointer pointer-events-auto"
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             if (face.audioBase64) SoundManager.playVoice(face.audioBase64);
                                         }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                        </svg>
                                    </div>
                                )}

                                {/* Tail triangle */}
                                <svg className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-6 h-4" viewBox="0 0 100 100" preserveAspectRatio="none">
                                   <path d="M0,0 L50,100 L100,0 Z" fill={voice.container.includes('bg-[#1a0505]') ? '#1a0505' : (voice.container.includes('bg-[#fff0f5]') ? '#fff0f5' : (voice.container.includes('bg-[#f0fdf4]') ? '#f0fdf4' : 'white'))} stroke={voice.container.includes('border') ? 'transparent' : 'black'} />
                                </svg>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Decision Overlay */}
            {face.isDecisionPage && face.choices.length > 0 && (
                <div className={`absolute bottom-0 inset-x-0 p-8 pb-16 flex flex-col gap-3 items-center justify-end transition-all duration-700 ${face.resolvedChoice ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100'} bg-gradient-to-t from-black via-black/90 to-transparent z-40`}>
                    <p className="text-[#d4af37] font-serif italic text-lg tracking-widest mb-1 drop-shadow-md animate-pulse text-center">
                        The moment of fracture...
                    </p>
                    {face.choices.map((choice, i) => (
                        <button 
                            key={i} 
                            onClick={(e) => { e.stopPropagation(); if(face.pageIndex) onChoice(face.pageIndex, choice); }}
                            className={`
                                w-full py-3 px-4 text-base md:text-lg font-title uppercase tracking-widest border transition-all duration-300
                                ${i === 0 
                                    ? 'bg-[#2a0a0a] border-[#7c0a0a] text-[#e3dac9] hover:bg-[#4a0a0a] hover:border-[#d4af37] hover:scale-[1.02]' 
                                    : 'bg-[#0a0a0a] border-[#333] text-[#999] hover:bg-[#1a1a1a] hover:text-white hover:border-white hover:scale-[1.02]' 
                                }
                                shadow-[0_10px_20px_rgba(0,0,0,0.8)] relative overflow-hidden
                            `}
                        >
                            {choice}
                        </button>
                    ))}
                </div>
            )}

            {/* Cover Action */}
            {isCover && (
                 <div className="absolute bottom-24 inset-x-0 flex justify-center z-40">
                     <button 
                        onClick={(e) => { e.stopPropagation(); onOpenBook(); }}
                        disabled={!isGatePageReady}
                        className="
                            group relative px-10 py-4 bg-black/60 backdrop-blur-sm border-2 border-[#d4af37] 
                            text-[#d4af37] font-title text-xl md:text-2xl tracking-[0.2em] uppercase
                            hover:bg-[#d4af37] hover:text-[#0a0a0a] transition-all duration-500
                            disabled:opacity-50 disabled:cursor-wait disabled:hover:bg-black/60 disabled:hover:text-[#d4af37]
                        "
                     >
                         <span className="relative z-10 drop-shadow-lg">
                             {(!isGatePageReady) 
                                ? `Manifesting...` 
                                : 'Open The Codex'}
                         </span>
                         <div className="absolute inset-0 bg-[#d4af37] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 z-0" />
                     </button>
                 </div>
            )}

            {/* Back Cover */}
            {isBackCover && (
                <div className="absolute bottom-32 inset-x-0 flex flex-col items-center gap-4 z-40 px-8">
                    <h3 className="text-[#7c0a0a] font-title text-lg tracking-widest mb-1 uppercase">The Cycle Continues</h3>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDownload(); }} 
                        className="w-full max-w-md py-3 border border-[#666] bg-black/50 backdrop-blur-sm text-[#ccc] font-serif hover:border-white hover:text-white hover:bg-white/10 transition-all uppercase tracking-wider text-sm"
                    >
                        Preserve Record (PDF)
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onReset(); }} 
                        className="w-full max-w-md py-3 bg-[#d4af37] text-black font-title font-bold hover:bg-[#fff] transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] uppercase tracking-widest text-sm"
                    >
                        Re-Enter The Forge
                    </button>
                </div>
            )}
        </div>
    );
};

export const Panel = React.memo(PanelComponent, (prevProps, nextProps) => {
    // Custom Comparator for React.memo
    // Returns true if props are equal (do NOT re-render)
    // Returns false if props are different (DO re-render)

    // 1. Check simple booleans/references that come from parent
    if (prevProps.isGatePageReady !== nextProps.isGatePageReady) return false;
    
    // 2. Check Face integrity
    const pFace = prevProps.face;
    const nFace = nextProps.face;

    if (pFace === nFace) return true; // Same reference
    if (!pFace || !nFace) return pFace === nFace; // Handle undefined/nulls

    // Deep check specific fields that affect rendering
    if (pFace.id !== nFace.id) return false;
    if (pFace.isLoading !== nFace.isLoading) return false;
    if (pFace.imageUrl !== nFace.imageUrl) return false;
    if (pFace.resolvedChoice !== nFace.resolvedChoice) return false;
    if (pFace.audioBase64 !== nFace.audioBase64) return false;
    
    // Check narrative content (dialogue/caption changes)
    if (pFace.narrative?.dialogue !== nFace.narrative?.dialogue) return false;
    if (pFace.narrative?.caption !== nFace.narrative?.caption) return false;

    return true; 
});
