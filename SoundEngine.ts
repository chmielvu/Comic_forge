
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const SoundManager = {
    ctx: null as AudioContext | null,
    muted: false,
    oscillators: [] as OscillatorNode[],
    gainNode: null as GainNode | null,
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

    // The "Symphony of Dread" - Subdued Dark Pad
    startAmbience: () => {
        SoundManager.init();
        if (!SoundManager.ctx || SoundManager.oscillators.length > 0) return;

        const ctx = SoundManager.ctx;
        const t = ctx.currentTime;
        const mainGain = ctx.createGain();
        mainGain.connect(ctx.destination);
        
        // Use a minor triad cluster in low register for tension
        const freqs = [55, 65.41, 82.41]; // A1, C2, E2 (A Minorish)
        const oscs: OscillatorNode[] = [];

        freqs.forEach((f, i) => {
            const osc = ctx.createOscillator();
            osc.type = i === 0 ? 'sawtooth' : 'sine'; // Sawtooth for grit, sine for body
            // Detune slightly for chorus effect
            osc.frequency.setValueAtTime(f + (Math.random() * 2 - 1), t);
            
            const oscGain = ctx.createGain();
            oscGain.gain.value = 0.03; // Very quiet

            osc.connect(oscGain);
            oscGain.connect(mainGain);
            osc.start();
            oscs.push(osc);
        });

        // LFO for "Breathing" / "Throbbing" effect (The Geothermal Vents)
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 150;
        
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.05; // 20 seconds cycle
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 100; // Sweep filter by 100Hz
        
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        // Re-route main gain through filter
        mainGain.disconnect();
        mainGain.connect(filter);
        filter.connect(ctx.destination);
        
        lfo.start();

        // Volume Envelope (Fade in)
        mainGain.gain.setValueAtTime(0, t);
        mainGain.gain.linearRampToValueAtTime(0.5, t + 5); 

        SoundManager.oscillators = oscs;
        SoundManager.lfo = lfo;
        SoundManager.gainNode = mainGain;
    },

    stopAmbience: () => {
        if (SoundManager.oscillators.length > 0 && SoundManager.gainNode && SoundManager.ctx) {
            const t = SoundManager.ctx.currentTime;
            SoundManager.gainNode.gain.exponentialRampToValueAtTime(0.001, t + 2);
            
            SoundManager.oscillators.forEach(osc => osc.stop(t + 2));
            if (SoundManager.lfo) SoundManager.lfo.stop(t + 2);
            
            SoundManager.oscillators = [];
            SoundManager.lfo = null;
            SoundManager.gainNode = null;
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
                gain.gain.setValueAtTime(0.05, t); // Quieter click
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
                // Synthesized paper noise - unchanged but effective
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
