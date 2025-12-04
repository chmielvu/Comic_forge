
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI } from '@google/genai';
import { Archetype } from './types';

// Map Archetypes to Gemini TTS Voices
// Voices: 'Puck' (Neutral), 'Charon' (Deep), 'Kore' (Soft), 'Fenrir' (Rough), 'Aoife' (Clear), 'Zephyr' (Steady)
const VOICE_MAP: Record<Archetype, string> = {
    // Faculty
    'Provost': 'Zephyr',   // Authoritative, steady, "The Voice of Inevitability"
    'Inquisitor': 'Fenrir', // Aggressive, rough, "The Voice of Kinetic Glee"
    'Confessor': 'Kore',    // Soft, manipulative, "The Voice of Corrupted Intimacy"
    'Logician': 'Puck',     // Neutral, analytical, "The Voice of Cold Data"
    'Custodian': 'Charon',  // Deep, imposing
    'Veteran': 'Charon',    // Deep, rough
    
    // Prefects
    'Loyalist': 'Zephyr',   // Trying to mimic authority
    'Pragmatist': 'Puck',   // Efficient
    'Siren': 'Kore',        // Alluring
    'Dissident': 'Fenrir',  // Rougher, rebellious
    
    // Subjects
    'Subject': 'Charon',    // Tired, deep (The Player)
    'Ally': 'Aoife',        // Softer, vulnerable
    'Guardian': 'Fenrir',   // Rough
    'Archivist': 'Puck',    // Quiet
    'Ghost': 'Kore',        // Faint
    'Jester': 'Puck',       // Erratic
    'Penitent': 'Charon'    // Low
};

export const TTSService = {
    /**
     * Generates speech audio from text using Gemini 2.5 Flash TTS.
     * Returns a Base64 encoded audio string.
     */
    generateSpeech: async (text: string, archetype: Archetype): Promise<string | null> => {
        if (!text) return null;

        const voiceName = VOICE_MAP[archetype] || 'Puck';
        
        try {
            // Re-instantiate locally to ensure we catch the latest env var if it changes, 
            // though usually process.env is static. Ideally pass this in.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: {
                    parts: [{ text: text }]
                },
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: voiceName }
                        }
                    }
                }
            });

            const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            
            if (audioPart?.inlineData?.data) {
                return audioPart.inlineData.data;
            }
            return null;

        } catch (error) {
            console.error("TTS Generation failed:", error);
            // Non-blocking error - return null so the app continues without audio
            return null;
        }
    }
};
