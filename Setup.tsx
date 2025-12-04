
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Persona } from './types';

interface SetupProps {
    show: boolean;
    isTransitioning: boolean;
    hero: Persona | null;
    friend: Persona | null;
    onHeroUpload: (file: File) => void;
    onFriendUpload: (file: File) => void;
    onLaunch: (name: string, fear: string) => void;
    soundEnabled: boolean;
    onSoundChange: (val: boolean) => void;
}

export const Setup: React.FC<SetupProps> = (props) => {
    const [subjectName, setSubjectName] = useState("Nico");
    const [coreFear, setCoreFear] = useState("Public Humiliation");

    if (!props.show && !props.isTransitioning) return null;

    return (
        <>
        <style>{`
             @keyframes gate-open {
                0% { transform: scale(1); filter: grayscale(100%); }
                100% { transform: scale(1.1); opacity: 0; filter: grayscale(0%); }
             }
          `}</style>
        
        <div className={`fixed inset-0 z-[200] overflow-y-auto bg-[#0a0a0a] text-[#d4af37] font-serif`}
             style={{
                 opacity: props.isTransitioning ? 0 : 1,
                 transition: 'opacity 1.5s ease-in-out',
                 pointerEvents: props.isTransitioning ? 'none' : 'auto'
             }}>
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="max-w-[800px] w-full border-[1px] border-[#4a3626] p-8 bg-[#1a1a1a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
                
                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#d4af37]"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#d4af37]"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#d4af37]"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#d4af37]"></div>

                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-6xl font-serif tracking-widest text-[#7c0a0a] uppercase mb-2" style={{textShadow: '0 4px 10px black'}}>The Forge's Loom</h1>
                    <p className="text-sm md:text-base text-gray-400 tracking-[0.2em] uppercase">Codex of the Corrupted Curriculum</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    
                    {/* Left: The Subject */}
                    <div className="flex flex-col gap-4">
                        <div className="border-b border-[#4a3626] pb-2 mb-2">
                            <h2 className="text-xl uppercase tracking-wider text-[#d4af37]">I. The Subject</h2>
                            <p className="text-xs text-gray-500 italic">"The raw ore to be refined."</p>
                        </div>
                        
                        {props.hero ? (
                            <div className="flex gap-4 items-center bg-[#0f0f0f] p-4 border border-[#333]">
                                 <img src={`data:image/jpeg;base64,${props.hero.base64}`} alt="Subject" className="w-24 h-24 object-cover grayscale opacity-80" />
                                 <div className="flex flex-col gap-2">
                                     <span className="text-green-800 font-bold text-xs uppercase tracking-widest">Identified</span>
                                     <label className="cursor-pointer text-xs text-[#d4af37] underline hover:text-white">
                                         CHANGE RECORD
                                         <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && props.onHeroUpload(e.target.files[0])} />
                                     </label>
                                 </div>
                            </div>
                        ) : (
                            <label className="h-32 border border-dashed border-[#4a3626] flex flex-col items-center justify-center cursor-pointer hover:bg-[#222] transition-colors group">
                                <span className="text-[#7c0a0a] font-bold uppercase tracking-widest group-hover:scale-105 transition-transform">Upload Portrait</span>
                                <span className="text-xs text-gray-600 mt-2">Front facing, neutral expression</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && props.onHeroUpload(e.target.files[0])} />
                            </label>
                        )}

                        <div className="space-y-3 mt-2">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Subject Name</label>
                                <input 
                                    type="text" 
                                    value={subjectName}
                                    onChange={(e) => setSubjectName(e.target.value)}
                                    className="w-full bg-[#0f0f0f] border border-[#333] text-[#d4af37] p-2 text-sm focus:border-[#7c0a0a] focus:outline-none placeholder-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Core Fear (Psychological Anchor)</label>
                                <input 
                                    type="text" 
                                    value={coreFear}
                                    onChange={(e) => setCoreFear(e.target.value)}
                                    className="w-full bg-[#0f0f0f] border border-[#333] text-[#d4af37] p-2 text-sm focus:border-[#7c0a0a] focus:outline-none placeholder-gray-700"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: The Ally */}
                    <div className="flex flex-col gap-4">
                        <div className="border-b border-[#4a3626] pb-2 mb-2">
                            <h2 className="text-xl uppercase tracking-wider text-[#d4af37]">II. Fragile Ally</h2>
                            <p className="text-xs text-gray-500 italic">"A weakness to be exploited."</p>
                        </div>

                        {props.friend ? (
                            <div className="flex gap-4 items-center bg-[#0f0f0f] p-4 border border-[#333]">
                                <img src={`data:image/jpeg;base64,${props.friend.base64}`} alt="Ally" className="w-24 h-24 object-cover grayscale opacity-80" />
                                <div className="flex flex-col gap-2">
                                    <span className="text-green-800 font-bold text-xs uppercase tracking-widest">Identified</span>
                                    <label className="cursor-pointer text-xs text-[#d4af37] underline hover:text-white">
                                        CHANGE RECORD
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && props.onFriendUpload(e.target.files[0])} />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <label className="h-32 border border-dashed border-[#4a3626] flex flex-col items-center justify-center cursor-pointer hover:bg-[#222] transition-colors group">
                                <span className="text-gray-500 font-bold uppercase tracking-widest group-hover:text-[#d4af37] transition-colors">Upload Ally (Optional)</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && props.onFriendUpload(e.target.files[0])} />
                            </label>
                        )}
                        
                        <div className="mt-auto p-4 bg-[#0f0f0f] border-l-2 border-[#7c0a0a]">
                            <p className="text-xs text-gray-400 leading-relaxed font-serif italic">
                                "The institution is not merely a prison; it is an elite Academy of Behavioral Reconstruction. We do not seek to kill the man, but to burn away the dross."
                                <br/><br/>
                                — Magistra Selene
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 border border-[#d4af37] flex items-center justify-center ${props.soundEnabled ? 'bg-[#d4af37]' : 'bg-transparent'}`}>
                            {props.soundEnabled && <span className="text-black font-bold text-xs">X</span>}
                        </div>
                        <input type="checkbox" checked={props.soundEnabled} onChange={(e) => props.onSoundChange(e.target.checked)} className="hidden" />
                        <span className="text-gray-400 uppercase text-xs tracking-widest group-hover:text-white transition-colors">Enable Auditory Hallucinations</span>
                    </label>

                    <button 
                        onClick={() => props.onLaunch(subjectName, coreFear)} 
                        disabled={!props.hero || props.isTransitioning}
                        className="w-full py-4 bg-[#7c0a0a] text-black hover:bg-[#900] disabled:bg-[#333] disabled:text-gray-600 disabled:cursor-not-allowed transition-all uppercase tracking-[0.25em] font-bold text-lg border border-black hover:border-[#d4af37] relative overflow-hidden"
                    >
                        {props.isTransitioning ? 'ENTERING THE FORGE...' : 'BEGIN CURRICULUM'}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </button>
                </div>
            </div>
          </div>
        </div>
        </>
    );
}
