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
    'Penitent': 'Charon',    // Low

    // Expanded from Imagery
    'EnigmaticBob': 'Kore', // Mysterious, soft
    'TavernInquisitor': 'Fenrir', // Fierce, rough
    'RusticDissident': 'Aoife', // Haunted, vulnerable
    'VictorianLogician': 'Puck', // Pensive, cold
    'SmirkingSiren': 'Kore' // Alluring, manipulative
};

// Helper function to add emotional direction based on archetype and desired emotion
function addEmotionalDirection(text: string, archetype: Archetype, emotion?: string): string {
    let baseDirection = '';
    switch (archetype) {
        case 'Provost': baseDirection = 'Speaking with bored superiority, each word deliberate, slight echo as if in stone chamber.'; break;
        case 'Inquisitor': baseDirection = 'With breathless excitement, words tumbling out rapidly, occasional manic laugh.'; break;
        case 'Confessor': baseDirection = 'In a whispered intimacy, breathy, every word dripping with false empathy.'; break;
        case 'Logician': baseDirection = 'With a monotone clinical delivery, slight pauses as if consulting notes.'; break;
        case 'Custodian': baseDirection = 'In a soft maternal tone with an underlying tremor of guilt.'; break;
        case 'Subject': baseDirection = 'With strained defiance, voice cracking slightly from pain and fear.'; break;
        case 'Ally': baseDirection = 'In a frightened whisper, rapid breathing between words, full of anxiety.'; break;
        case 'Loyalist': baseDirection = 'Trying to sound authoritative, but with a slight waver of fear.'; break;
        case 'Siren': baseDirection = 'Alluring and seductive, with a hint of menace.'; break;
        case 'Dissident': baseDirection = 'Rough and rebellious, with urgency in the tone.'; break;
        default: baseDirection = ''; // No specific direction
    }

    let emotionalNuance = '';
    if (emotion) {
        switch (emotion.toLowerCase()) {
            case 'despair': emotionalNuance = 'Sounding utterly broken and without hope.'; break;
            case 'fear': emotionalNuance = 'With a clear sense of terror.'; break;
            case 'arousal': emotionalNuance = 'With an undertone of unwilling excitement.'; break;
            case 'amusement': emotionalNuance = 'With a cruel, mocking enjoyment.'; break;
            case 'defiance': emotionalNuance = 'Strong and resistant, despite the circumstances.'; break;
            // Add more specific emotional nuances as needed
        }
    }
    
    // Combine base direction and emotional nuance
    const finalDirection = baseDirection || emotionalNuance ? `[${baseDirection} ${emotionalNuance}]` : '';
    return `${finalDirection.trim()} ${text}`;
}

export const TTSService = {
    /**
     * Generates speech audio from text using Gemini 2.5 Flash TTS.
     * Returns a Base64 encoded audio string.
     * @param text The text to convert to speech.
     * @param archetype The archetype of the speaker, used for voice selection and emotional direction.
     * @param emotion An optional emotion hint for more nuanced delivery.
     * @param audioId An optional unique ID for audio playback management (e.g., page ID).
     */
    generateSpeech: async (text: string, archetype: Archetype, emotion?: string, audioId?: string): Promise<string | null> => {
        if (!text) return null;

        const voiceName = VOICE_MAP[archetype] || 'Puck';
        
        // CRITICAL: Add SSML-like emotional direction for Gemini TTS
        const directedText = addEmotionalDirection(text, archetype, emotion);
        
        try {
            // Re-instantiate locally to ensure we catch the latest env var if it changes, 
            // though usually process.env is static. Ideally pass this in.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: {
                    parts: [{ text: directedText }]
                },
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { 
                                voiceName: voiceName 
                            }
                        },
                        // NEW: Add prosody hints for character-specific delivery
                        audioConfig: {
                            speakingRate: archetype === 'Provost' ? 0.85 : (archetype === 'Ally' ? 1.1 : 1.0), // Provost slower, Ally faster due to anxiety
                            pitch: archetype === 'Ally' ? 2.0 : (archetype === 'Subject' ? -1.0 : 0), // Ally higher, Subject slightly lower
                            volumeGainDb: archetype === 'Inquisitor' ? 3.0 : (archetype === 'Ally' ? -2.0 : 0) // Inquisitor louder, Ally softer
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