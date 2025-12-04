/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const SoundManager = {
    ctx: null as AudioContext | null,
    muted: false,
    oscillators: [] as AudioNode[], // Store any playing ambience nodes to stop them later
    gainNode: null as GainNode | null,
    activeVoices: new Map<string, AudioBufferSourceNode>(), // Track playing voices by ID

    init: () => {
        if (!SoundManager.ctx) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                SoundManager.ctx = new AudioContextClass();
            }
        }
    },

    setMuted: (mute: boolean) => {
        SoundManager.muted = mute;
        if (SoundManager.ctx) {
            if (mute) {
                SoundManager.ctx.suspend();
            } else {
                SoundManager.ctx.resume();
            }
        }
    },

    /**
     * Decodes and plays a Base64 audio string (Gemini TTS output).
     * @param base64Data The Base64 encoded audio data.
     * @param id An optional unique ID to manage concurrent voice playback (e.g., page ID).
     */
    playVoice: async (base64Data: string, id?: string) => {
        // Stop previous voice with the same ID if still playing (prevent overlap)
        if (id && SoundManager.activeVoices.has(id)) {
            const prev = SoundManager.activeVoices.get(id);
            prev?.stop();
            SoundManager.activeVoices.delete(id);
        }

        if (SoundManager.muted) return;
        SoundManager.init();
        const ctx = SoundManager.ctx;
        if (!ctx) return;

        if (ctx.state === 'suspended') await ctx.resume();

        try {
            // Convert Base64 to ArrayBuffer
            const binaryString = window.atob(base64Data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Decode and play
            const buffer = await ctx.decodeAudioData(bytes.buffer);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            
            // Clean up when finished
            source.onended = () => {
                if (id) SoundManager.activeVoices.delete(id);
            };
            
            source.start(0);
            
            if (id) SoundManager.activeVoices.set(id, source);
        } catch (e) {
            console.error("Failed to play voice:", e);
        }
    },

    /**
     * Stops all currently playing voice audio.
     */
    stopAllVoices: () => {
        SoundManager.activeVoices.forEach(source => source.stop());
        SoundManager.activeVoices.clear();
        console.log("All active voices stopped and cleared.");
    },

    // The "Halls of the Forge" - Subdued, Creaking, Atmospheric
    startAmbience: () => {
        SoundManager.init();
        // Clear previous if any
        SoundManager.stopAmbience();
        
        if (!SoundManager.ctx) return;

        const ctx = SoundManager.ctx;
        const t = ctx.currentTime;
        
        // Master Ambience Gain
        const mainGain = ctx.createGain();
        mainGain.connect(ctx.destination);
        mainGain.gain.setValueAtTime(0, t);
        mainGain.gain.linearRampToValueAtTime(0.3, t + 4); // Slow fade in

        const nodes: AudioNode[] = [];

        // 1. Low Rumble (The Geothermal Vents) - Pink Noise through Lowpass
        const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0; // Defined before usage loop
        for (let i = 0; i < bufferSize; i++) {
            // Pink noise approximation
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; 
        }

        const rumbleSource = ctx.createBufferSource();
        rumbleSource.buffer = buffer;
        rumbleSource.loop = true;

        const rumbleFilter = ctx.createBiquadFilter();
        rumbleFilter.type = 'lowpass';
        rumbleFilter.frequency.value = 80; // Very deep

        const rumbleGain = ctx.createGain();
        rumbleGain.gain.value = 0.5;

        rumbleSource.connect(rumbleFilter);
        rumbleFilter.connect(rumbleGain);
        rumbleGain.connect(mainGain);
        rumbleSource.start();
        nodes.push(rumbleSource);

        // 2. The "Creak" / Wind (Bandpass filtered noise sweeping slowly)
        const windSource = ctx.createBufferSource();
        windSource.buffer = buffer; // Reuse noise buffer
        windSource.loop = true;

        const windFilter = ctx.createBiquadFilter();
        windFilter.type = 'bandpass';
        windFilter.Q.value = 5; // Narrow band for a "whistling" or "creaking" tone

        // LFO to modulate the wind frequency slightly
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // Very slow cycle (10s)
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 200; // Sweep range

        lfo.connect(lfoGain);
        lfoGain.connect(windFilter.frequency);
        windFilter.frequency.value = 400; // Center freq

        const windGain = ctx.createGain();
        windGain.gain.value = 0.05; // Very subtle

        windSource.connect(windFilter);
        windFilter.connect(windGain);
        windGain.connect(mainGain);
        
        lfo.start();
        windSource.start();
        nodes.push(lfo, windSource);

        SoundManager.oscillators = nodes;
        SoundManager.gainNode = mainGain;
    },

    stopAmbience: () => {
        if (SoundManager.oscillators.length > 0 && SoundManager.gainNode && SoundManager.ctx) {
            const t = SoundManager.ctx.currentTime;
            // Fade out
            SoundManager.gainNode.gain.exponentialRampToValueAtTime(0.001, t + 2);
            
            SoundManager.oscillators.forEach(node => {
                if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
                    node.stop(t + 2);
                }
            });
            
            // Cleanup references after fade
            setTimeout(() => {
                SoundManager.oscillators = [];
                SoundManager.gainNode = null;
            }, 2100);
        }
    },

    play: (type: 'click' | 'flip' | 'pow' | 'success' | 'hover') => {
        if (SoundManager.muted) return;
        SoundManager.init();
        const ctx = SoundManager.ctx;
        if (!ctx) return;
        
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});

        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);

        switch (type) {
            case 'click':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, t);
                osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
                gain.gain.setValueAtTime(0.05, t); 
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
                break;

            case 'hover':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, t);
                gain.gain.setValueAtTime(0.02, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
                osc.start(t);
                osc.stop(t + 0.05);
                break;

            case 'flip':
                // Synthesized paper noise
                const bufferSize = ctx.sampleRate * 0.3;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;
                const noiseFilter = ctx.createBiquadFilter();
                noiseFilter.type = 'lowpass';
                noiseFilter.frequency.setValueAtTime(800, t);
                noiseFilter.frequency.linearRampToValueAtTime(100, t + 0.3);
                
                const noiseGain = ctx.createGain();
                noiseGain.gain.setValueAtTime(0.1, t);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

                noise.connect(noiseFilter);
                noiseFilter.connect(noiseGain);
                noiseGain.connect(ctx.destination);
                noise.start(t);
                break;

            case 'pow':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, t);
                osc.frequency.exponentialRampToValueAtTime(20, t + 0.3);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.3);
                osc.start(t);
                osc.stop(t + 0.3);
                break;

            case 'success':
                osc.type = 'triangle';
                gain.gain.value = 0.05;
                // A minor triad arpeggio
                [220, 261.63, 329.63].forEach((freq, i) => { 
                    const oscN = ctx.createOscillator();
                    const gainN = ctx.createGain();
                    oscN.type = 'triangle';
                    oscN.frequency.value = freq;
                    oscN.connect(gainN);
                    gainN.connect(ctx.destination);
                    
                    const start = t + (i * 0.1);
                    gainN.gain.setValueAtTime(0.05, start);
                    gainN.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
                    oscN.start(start);
                    oscN.stop(start + 0.5);
                });
                break;
        }
    }
};