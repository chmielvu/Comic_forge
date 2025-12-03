
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const SoundManager = {
    ctx: null as AudioContext | null,
    muted: false,

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
        if (!mute && SoundManager.ctx?.state === 'suspended') {
            SoundManager.ctx.resume();
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
                // Synthesized paper noise (White noise buffer)
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
                // Classic 8-bit slide
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(600, t);
                osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.3);
                osc.start(t);
                osc.stop(t + 0.3);
                break;

            case 'success':
                // Ascending Arpeggio
                osc.type = 'square';
                gain.gain.value = 0.05;
                
                [440, 554, 659, 880].forEach((freq, i) => {
                    const oscN = ctx.createOscillator();
                    const gainN = ctx.createGain();
                    oscN.type = 'square';
                    oscN.frequency.value = freq;
                    oscN.connect(gainN);
                    gainN.connect(ctx.destination);
                    
                    const start = t + (i * 0.08);
                    gainN.gain.setValueAtTime(0.05, start);
                    gainN.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
                    oscN.start(start);
                    oscN.stop(start + 0.2);
                });
                break;
        }
    }
};
