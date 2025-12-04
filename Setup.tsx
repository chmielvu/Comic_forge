/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Persona } from './types';
import { SoundManager } from './SoundEngine';

interface SetupProps {
    show: boolean;
    isTransitioning: boolean;
    hero: Persona | null;
    friend: Persona | null;
    onHeroUpload: (file: File) => void;
    onFriendUpload: (file: File) => void;
    onUpdateHero: (updates: Partial<Persona>) => void;
    onUpdateFriend: (updates: Partial<Persona>) => void;
    setHero: (p: Persona | null) => void;
    setFriend: (p: Persona | null) => void;
    onLaunch: (name: string, fear: string) => void;
    soundEnabled: boolean;
    onSoundChange: (val: boolean) => void;
}

// Optimization: Memoize to prevent re-renders when parent generates pages in background
const SetupComponent: React.FC<SetupProps> = React.memo((props) => {
    const [subjectName, setSubjectName] = useState("Nico");
    const [coreFear, setCoreFear] = useState("Public Humiliation");

    // Sync local state when hero changes externally (e.g. upload)
    useEffect(() => {
        if (props.hero?.name) setSubjectName(props.hero.name);
        if (props.hero?.coreFear) setCoreFear(props.hero.coreFear);
    }, [props.hero]);

    const loadPresets = () => {
        SoundManager.play('click');
        // Preset Subject (Hero)
        props.setHero({
            base64: undefined, // No image, rely on bio
            name: "Nico",
            archetype: "Subject",
            coreFear: "Failure",
            bio: "A defiant student refusing to break, hiding a deep fear of inadequacy behind arrogance. He has bruises on his ribs and a defiant sneer."
        });
        setSubjectName("Nico");
        setCoreFear("Failure");

        // Preset Ally (Female, Fragile Scholar, based on provided image)
        props.setFriend({
            base64: undefined,
            name: "Elara",
            archetype: "Ally",
            bio: "A fragile female scholar with long, light brown curly hair, fair skin, and striking green eyes, wearing a simple black ribbed crop top and a plaid mini-skirt. She carries an air of anxious intelligence, hinting at secrets she knows about the Forge.",
            desc: "The Ally"
        });
    };

    if (!props.show && !props.isTransitioning) return null;

    return (
        <div className={`fixed inset-0 z-[200] overflow-y-auto bg-[#0a0a0a] text-[#d4af37] font-serif`}
             style={{
                 opacity: props.isTransitioning ? 0 : 1,
                 transition: 'opacity 1.5s ease-in-out',
                 pointerEvents: props.isTransitioning ? 'none' : 'auto'
             }}>
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="max-w-[900px] w-full border-[1px] border-[#4a3626] p-6 md:p-8 bg-[#1a1a1a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
                
                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#d4af37]"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#d4af37]"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#d4af37]"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#d4af37]"></div>

                <div className="text-center mb-8 relative">
                     <button 
                        onClick={loadPresets}
                        className="absolute right-0 top-0 text-[10px] md:text-xs text-[#4a3626] hover:text-[#d4af37] uppercase tracking-widest border border-[#4a3626] hover:border-[#d4af37] px-2 py-1 transition-colors"
                        title="Load Default Characters"
                    >
                        Load Presets
                    </button>
                    <h1 className="text-4xl md:text-6xl font-title tracking-widest text-[#7c0a0a] uppercase mb-2" style={{textShadow: '0 4px 10px black'}}>The Forge's Loom</h1>
                    <p className="text-sm md:text-base text-gray-400 tracking-[0.2em] uppercase font-comic">Codex of the Corrupted Curriculum</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    
                    {/* Left: The Subject */}
                    <div className="flex flex-col gap-4 bg-[#0f0f0f] p-4 border border-[#333]">
                        <div className="border-b border-[#4a3626] pb-2 mb-2">
                            <h2 className="text-xl uppercase tracking-wider text-[#d4af37] font-title">I. The Subject</h2>
                            <p className="text-xs text-gray-500 italic">"The raw ore to be refined."</p>
                        </div>
                        
                        <div className="flex gap-4 items-start">
                             {props.hero?.base64 ? (
                                <img src={`data:image/jpeg;base64,${props.hero.base64}`} alt="Subject" className="w-24 h-24 object-cover grayscale opacity-80 border border-[#333]" />
                             ) : (
                                <div className="w-24 h-24 bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[#333] font-bold text-2xl">?</div>
                             )}
                             <div className="flex flex-col gap-2 w-full">
                                 {props.hero ? <span className="text-green-800 font-bold text-[10px] uppercase tracking-widest">Identified</span> : <span className="text-red-900 font-bold text-[10px] uppercase tracking-widest">Missing</span>}
                                 <label className="cursor-pointer text-xs text-[#d4af37] underline hover:text-white">
                                     {props.hero ? 'REPLACE VISUAL' : 'UPLOAD PORTRAIT'}
                                     <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && props.onHeroUpload(e.target.files[0])} />
                                 </label>
                             </div>
                        </div>

                        <div className="space-y-3 mt-2">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Name</label>
                                    <input 
                                        type="text" 
                                        value={subjectName}
                                        onChange={(e) => setSubjectName(e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-[#333] text-[#d4af37] p-2 text-sm focus:border-[#7c0a0a] focus:outline-none font-serif"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Core Fear</label>
                                    <input 
                                        type="text" 
                                        value={coreFear}
                                        onChange={(e) => setCoreFear(e.target.value)}
                                        className="w-full bg-[#0a0a0a] border border-[#333] text-[#d4af37] p-2 text-sm focus:border-[#7c0a0a] focus:outline-none font-serif"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Character Bio (Appearance & Psyche)</label>
                                <textarea 
                                    value={props.hero?.bio || ""}
                                    onChange={(e) => props.onUpdateHero({ bio: e.target.value })}
                                    placeholder="Describe the subject's appearance and mental state..."
                                    className="w-full bg-[#0a0a0a] border border-[#333] text-gray-400 p-2 text-sm focus:border-[#7c0a0a] focus:outline-none h-24 resize-none font-serif italic leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: The Ally */}
                    <div className="flex flex-col gap-4 bg-[#0f0f0f] p-4 border border-[#333]">
                        <div className="border-b border-[#4a3626] pb-2 mb-2">
                            <h2 className="text-xl uppercase tracking-wider text-[#d4af37] font-title">II. The Ally</h2>
                            <p className="text-xs text-gray-500 italic">"A weakness to be exploited."</p>
                        </div>

                        <div className="flex gap-4 items-start">
                            {props.friend?.base64 ? (
                                <img src={`data:image/jpeg;base64,${props.friend.base64}`} alt="Ally" className="w-24 h-24 object-cover grayscale opacity-80 border border-[#333]" />
                            ) : (
                                <div className="w-24 h-24 bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[#333] font-bold text-2xl">?</div>
                            )}
                            <div className="flex flex-col gap-2 w-full">
                                {props.friend ? <span className="text-green-800 font-bold text-[10px] uppercase tracking-widest">Identified</span> : <span className="text-gray-600 font-bold text-[10px] uppercase tracking-widest">Optional</span>}
                                <label className="cursor-pointer text-xs text-[#d4af37] underline hover:text-white">
                                    {props.friend ? 'REPLACE VISUAL' : 'UPLOAD VISUAL'}
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && props.onFriendUpload(e.target.files[0])} />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-3 mt-2">
                             <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Name</label>
                                <input 
                                    type="text" 
                                    value={props.friend?.name || ""}
                                    onChange={(e) => props.onUpdateFriend({ name: e.target.value })}
                                    placeholder="Ally Name"
                                    className="w-full bg-[#0a0a0a] border border-[#333] text-[#d4af37] p-2 text-sm focus:border-[#7c0a0a] focus:outline-none font-serif"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Bio / Relation (Appearance & Psyche)</label>
                                <textarea 
                                    value={props.friend?.bio || ""}
                                    onChange={(e) => props.onUpdateFriend({ bio: e.target.value })}
                                    placeholder="Describe the ally's appearance and relationship to the Subject..."
                                    className="w-full bg-[#0a0a0a] border border-[#333] text-gray-400 p-2 text-sm focus:border-[#7c0a0a] focus:outline-none h-24 resize-none font-serif italic leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 items-center">
                    {/* Visual Checkbox */}
                    <label className="flex items-center gap-4 cursor-pointer group select-none">
                        <div className={`relative w-6 h-6 border-2 border-[#d4af37] bg-transparent transition-all duration-300 ${props.soundEnabled ? 'shadow-[0_0_15px_rgba(124,10,10,0.6)] border-[#7c0a0a]' : ''}`}>
                            <div className={`absolute inset-0 bg-[#7c0a0a] transition-transform duration-300 origin-center ${props.soundEnabled ? 'scale-100' : 'scale-0'}`}></div>
                            {props.soundEnabled && (
                                <span className="absolute inset-0 flex items-center justify-center text-[#d4af37] font-bold text-lg animate-in zoom-in duration-300">X</span>
                            )}
                        </div>
                        <input type="checkbox" checked={props.soundEnabled} onChange={(e) => props.onSoundChange(e.target.checked)} className="hidden" />
                        <span className={`text-sm uppercase tracking-[0.2em] transition-colors font-comic ${props.soundEnabled ? 'text-[#d4af37] shadow-glow' : 'text-gray-500 group-hover:text-gray-300'}`}>
                            Enable Auditory Hallucinations
                        </span>
                    </label>

                    <button 
                        onClick={() => props.onLaunch(subjectName, coreFear)} 
                        disabled={!props.hero || props.isTransitioning}
                        className="w-full py-4 bg-[#7c0a0a] text-black hover:bg-[#900] disabled:bg-[#333] disabled:text-gray-600 disabled:cursor-not-allowed transition-all uppercase tracking-[0.25em] font-bold text-xl border border-black hover:border-[#d4af37] relative overflow-hidden font-title shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                    >
                        {props.isTransitioning ? 'ENTERING THE FORGE...' : 'BEGIN CURRICULUM'}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </button>
                </div>
            </div>
          </div>
        </div>
    );
});

export const Setup = SetupComponent; // Export memoized component