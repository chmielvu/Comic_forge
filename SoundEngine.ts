
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const SoundManager = {
    ctx: null as AudioContext | null,
    muted: false,
    droneOsc: null as OscillatorNode | null,
    droneGain: null as GainNode | null,
    lfo: null as OscillatorNode | null,

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

    // The "Symphony of Dread" - An infrasound hum
    startAmbience: () => {
        SoundManager.init();
        if (!SoundManager.ctx || SoundManager.droneOsc) return;

        const t = SoundManager.ctx.currentTime;
        const mainGain = SoundManager.ctx.createGain();
        mainGain.connect(SoundManager.ctx.destination);
        
        // 1. Deep Sub-Bass Drone (The Geothermal Vent)
        const drone = SoundManager.ctx.createOscillator();
        drone.type = 'sawtooth';
        drone.frequency.setValueAtTime(45, t); 
        
        const droneFilter = SoundManager.ctx.createBiquadFilter();
        droneFilter.type = 'lowpass';
        droneFilter.frequency.setValueAtTime(100, t);
        droneFilter.Q.value = 1;

        // 2. LFO to modulate the drone (breathing effect)
        const lfo = SoundManager.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // Very slow cycle (10 seconds)
        
        const lfoGain = SoundManager.ctx.createGain();
        lfoGain.gain.value = 20; // Modulate frequency by +/- 20Hz
        
        lfo.connect(lfoGain);
        lfoGain.connect(droneFilter.frequency);

        // Volume Envelope
        mainGain.gain.setValueAtTime(0, t);
        mainGain.gain.linearRampToValueAtTime(0.04, t + 3); // Slow fade in

        drone.connect(droneFilter);
        droneFilter.connect(mainGain);
        
        drone.start();
        lfo.start();

        SoundManager.droneOsc = drone;
        SoundManager.lfo = lfo;
        SoundManager.droneGain = mainGain;
    },

    stopAmbience: () => {
        if (SoundManager.droneOsc && SoundManager.droneGain && SoundManager.ctx) {
            const t = SoundManager.ctx.currentTime;
            SoundManager.droneGain.gain.exponentialRampToValueAtTime(0.001, t + 2);
            SoundManager.droneOsc.stop(t + 2);
            if (SoundManager.lfo) SoundManager.lfo.stop(t + 2);
            
            SoundManager.droneOsc = null;
            SoundManager.lfo = null;
            SoundManager.droneGain = null;
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
                // High crisp blip
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, t);
                osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
                break;

            case 'hover':
                // Subtle tick
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, t);
                gain.gain.setValueAtTime(0.05, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
                osc.start(t);
                osc.stop(t + 0.05);
                break;

            case 'flip':
                // Synthesized paper noise
                const bufferSize = ctx.sampleRate * 0.3; // 300ms
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
                noiseGain.gain.setValueAtTime(0.15, t);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

                noise.connect(noiseFilter);
                noiseFilter.connect(noiseGain);
                noiseGain.connect(ctx.destination);
                noise.start(t);
                break;

            case 'pow':
                // Impact hit
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, t);
                osc.frequency.exponentialRampToValueAtTime(20, t + 0.3);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.3);
                osc.start(t);
                osc.stop(t + 0.3);
                break;

            case 'success':
                // Ascending Arpeggio (Darker)
                osc.type = 'triangle';
                gain.gain.value = 0.05;
                
                [220, 277, 329, 440].forEach((freq, i) => { // Minor chord
                    const oscN = ctx.createOscillator();
                    const gainN = ctx.createGain();
                    oscN.type = 'triangle';
                    oscN.frequency.value = freq;
                    oscN.connect(gainN);
                    gainN.connect(ctx.destination);
                    
                    const start = t + (i * 0.1);
                    gainN.gain.setValueAtTime(0.05, start);
                    gainN.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
                    oscN.start(start);
                    oscN.stop(start + 0.4);
                });
                break;
        }
    }
};
