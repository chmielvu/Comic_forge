
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ComicFace, GATE_PAGE } from './types';
import { LoadingFX } from './LoadingFX';

interface PanelProps {
    face?: ComicFace;
    allFaces: ComicFace[]; // Needed for cover "printing" status
    onChoice: (pageIndex: number, choice: string) => void;
    onOpenBook: () => void;
    onDownload: () => void;
    onReset: () => void;
}

export const Panel: React.FC<PanelProps> = ({ face, allFaces, onChoice, onOpenBook, onDownload, onReset }) => {
    if (!face) return <div className="w-full h-full bg-[#0a0a0a]" />; // Void color
    if (face.isLoading && !face.imageUrl) return <LoadingFX />;
    
    const isCover = face.type === 'cover';
    const isBackCover = face.type === 'back_cover';
    const isFullBleed = isCover || isBackCover;

    // --- Visual Filters (Vampire Noir / Renaissance Brutalism) ---
    const getImageStyle = () => {
        if (isCover) {
            // "The Mythic Façade": High contrast, rich saturation, slight sepia for an 'Old Master' oil painting feel.
            // Emphasizes the "Renaissance" aspect.
            return { filter: 'contrast(1.15) saturate(1.1) sepia(0.15)' };
        }
        if (isBackCover) {
            // "The Echo": Desaturated, cold, final.
            // Emphasizes the "Brutalist" and "Noir" tragedy.
            return { filter: 'grayscale(0.8) contrast(1.2) brightness(0.9)' };
        }
        // "The Reality" (Story Pages):
        // Slightly muted to emphasize the 'noir' shadows but keep the 'gaslamp' warmth visible.
        return { filter: 'contrast(1.05) saturate(0.95) sepia(0.05)' };
    };

    return (
        <div className={`panel-container relative group w-full h-full flex items-center justify-center overflow-hidden ${isFullBleed ? '!p-0 !bg-[#0a0a0a]' : 'bg-[#e3dac9]'}`}>
            
            {/* Authentic Gloss Overlay (The "Page" texture) */}
            <div className="gloss z-30 pointer-events-none absolute inset-0 mix-blend-screen opacity-40 bg-gradient-to-br from-white/10 to-transparent" />
            
            {/* Vignette for Atmosphere */}
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
            
            {/* --- UI LAYERS --- */}

            {/* Decision Overlay (Psychological Horror Tone) */}
            {face.isDecisionPage && face.choices.length > 0 && (
                <div className={`absolute bottom-0 inset-x-0 p-8 pb-16 flex flex-col gap-4 items-center justify-end transition-all duration-700 ${face.resolvedChoice ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100'} bg-gradient-to-t from-black via-black/90 to-transparent z-40`}>
                    <p className="text-[#d4af37] font-serif italic text-xl tracking-widest mb-2 drop-shadow-md animate-pulse text-center">
                        The moment of fracture...
                    </p>
                    {face.choices.map((choice, i) => (
                        <button 
                            key={i} 
                            onClick={(e) => { e.stopPropagation(); if(face.pageIndex) onChoice(face.pageIndex, choice); }}
                            className={`
                                w-full py-4 px-6 text-lg md:text-xl font-serif uppercase tracking-widest border transition-all duration-300
                                ${i === 0 
                                    ? 'bg-[#2a0a0a] border-[#7c0a0a] text-[#e3dac9] hover:bg-[#4a0a0a] hover:border-[#d4af37] hover:scale-[1.02]' // "Blood" Action
                                    : 'bg-[#0a0a0a] border-[#333] text-[#999] hover:bg-[#1a1a1a] hover:text-white hover:border-white hover:scale-[1.02]' // "Cold" Action
                                }
                                shadow-[0_10px_20px_rgba(0,0,0,0.8)] relative overflow-hidden
                            `}
                        >
                            {choice}
                        </button>
                    ))}
                </div>
            )}

            {/* Cover Action: Enter The Tome */}
            {isCover && (
                 <div className="absolute bottom-24 inset-x-0 flex justify-center z-40">
                     <button 
                        onClick={(e) => { e.stopPropagation(); onOpenBook(); }}
                        disabled={!allFaces.find(f => f.pageIndex === GATE_PAGE)?.imageUrl}
                        className="
                            group relative px-12 py-5 bg-black/60 backdrop-blur-sm border-2 border-[#d4af37] 
                            text-[#d4af37] font-serif text-2xl md:text-3xl tracking-[0.2em] uppercase
                            hover:bg-[#d4af37] hover:text-[#0a0a0a] transition-all duration-500
                            disabled:opacity-50 disabled:cursor-wait disabled:hover:bg-black/60 disabled:hover:text-[#d4af37]
                        "
                     >
                         <span className="relative z-10 drop-shadow-lg">
                             {(!allFaces.find(f => f.pageIndex === GATE_PAGE)?.imageUrl) 
                                ? `Manifesting...` 
                                : 'Open The Codex'}
                         </span>
                         {/* Glow effect */}
                         <div className="absolute inset-0 bg-[#d4af37] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 z-0" />
                     </button>
                 </div>
            )}

            {/* Back Cover: The Aftermath */}
            {isBackCover && (
                <div className="absolute bottom-32 inset-x-0 flex flex-col items-center gap-6 z-40 px-8">
                    <h3 className="text-[#7c0a0a] font-serif text-xl tracking-widest mb-2 uppercase">The Cycle Continues</h3>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDownload(); }} 
                        className="w-full max-w-md py-3 border border-[#666] bg-black/50 backdrop-blur-sm text-[#ccc] font-serif hover:border-white hover:text-white hover:bg-white/10 transition-all uppercase tracking-wider"
                    >
                        Preserve Record (PDF)
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onReset(); }} 
                        className="w-full max-w-md py-4 bg-[#d4af37] text-black font-serif font-bold hover:bg-[#fff] transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] uppercase tracking-widest"
                    >
                        Re-Enter The Forge
                    </button>
                </div>
            )}
        </div>
    );
}
