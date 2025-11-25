import { Howl } from 'howler';

class AudioManager {
    constructor() {
        this.sounds = {
            shoot: new Howl({ src: ['/sounds/shoot.mp3'], volume: 0.3 }), // Placeholder paths
            zap: new Howl({ src: ['/sounds/zap.mp3'], volume: 0.3 }),
            mortar: new Howl({ src: ['/sounds/mortar.mp3'], volume: 0.4 }),
            explode: new Howl({ src: ['/sounds/explode.mp3'], volume: 0.4 }),
            build: new Howl({ src: ['/sounds/build.mp3'], volume: 0.5 }),
            collect: new Howl({ src: ['/sounds/collect.mp3'], volume: 0.4 }),
            levelup: new Howl({ src: ['/sounds/levelup.mp3'], volume: 0.5 }),
        };

        // Synthesize sounds if files don't exist (Fallback for now since we don't have assets)
        // In a real scenario, we'd use actual files. For this refactor, we might need to keep the WebAudio synth
        // or just use placeholders. 
        // actually, the user asked for "best tools", so Howler is correct, but we don't have mp3s.
        // I will implement a hybrid: Use Howler for structure, but maybe we need a synth fallback?
        // OR, I can just stick to the original WebAudio implementation wrapped in a class for now
        // to ensure it works without external assets.
        // Let's stick to the original WebAudio synth for now to guarantee it works, 
        // but structure it so it CAN be replaced by Howler easily.

        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    play(type) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        if (type === 'shoot') {
            osc.type = 'square'; osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
            gain.gain.setValueAtTime(0.03, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'zap') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(800, now); osc.frequency.linearRampToValueAtTime(200, now + 0.15);
            gain.gain.setValueAtTime(0.05, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
            osc.start(now); osc.stop(now + 0.15);
        } else if (type === 'mortar') {
            osc.type = 'square'; osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(20, now + 0.3);
            gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
        } else if (type === 'explode') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
            gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
        } else if (type === 'build') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'collect') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(600, now); osc.frequency.linearRampToValueAtTime(900, now + 0.05);
            gain.gain.setValueAtTime(0.03, now); gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'levelup') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(400, now);
            osc.frequency.linearRampToValueAtTime(800, now + 0.2);
            osc.frequency.linearRampToValueAtTime(1200, now + 0.4);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.5);
            osc.start(now); osc.stop(now + 0.5);
        }
    }
}

export const audioManager = new AudioManager();
