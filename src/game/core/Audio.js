class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.4;
        this.masterGain.connect(this.ctx.destination);

        // Create Noise Buffer (2 seconds of white noise)
        const bufferSize = this.ctx.sampleRate * 2;
        this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        this.lastPlayed = {};
        this.isMuted = true; // Start Muted
        this.masterGain.gain.value = 0;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
        } else {
            this.resume();
            this.masterGain.gain.setTargetAtTime(0.4, this.ctx.currentTime, 0.1);
        }
        return this.isMuted;
    }

    resume() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }

    play(type, pan = 0) {
        this.resume();
        const now = this.ctx.currentTime;

        // Throttling
        const last = this.lastPlayed[type] || 0;
        if (type === 'shoot' && now - last < 0.08) return;
        if (type === 'flame' && now - last < 0.1) return;
        if (type === 'collect' && now - last < 0.05) return;

        this.lastPlayed[type] = now;

        const panner = this.ctx.createStereoPanner();
        panner.pan.value = Math.max(-1, Math.min(1, pan));
        panner.connect(this.masterGain);

        switch (type) {
            case 'shoot': // Standard Gunner
                this.playTone(now, 'square', 150, 60, 0.08, 0.1, panner);
                this.playNoise(now, 0.05, 1200, 'lowpass', 0.15, 0.01, panner);
                break;
            case 'sniper':
                this.playTone(now, 'triangle', 120, 30, 0.3, 0.3, panner);
                this.playNoise(now, 0.25, 600, 'lowpass', 0.4, 0.01, panner);
                break;
            case 'flame':
                // Overlap noises for continuous feel if called rapidly
                this.playNoise(now, 0.15, 800, 'lowpass', 0.1, 0.05, panner);
                break;
            case 'tesla': // Zap
                this.playTone(now, 'sawtooth', 800, 200, 0.15, 0.15, panner);
                this.playTone(now, 'square', 400, 100, 0.15, 0.05, panner); // Sub-osc
                break;
            case 'mortar':
                this.playTone(now, 'sine', 100, 20, 0.4, 0.4, panner); // Thump
                this.playNoise(now, 0.3, 300, 'lowpass', 0.3, 0.01, panner); // Whoosh
                break;
            case 'railgun':
                this.playTone(now, 'sawtooth', 2000, 50, 0.5, 0.2, panner); // Zap down
                this.playNoise(now, 0.3, 2000, 'bandpass', 0.4, 0.01, panner); // Crack
                break;
            case 'cryo':
                this.playTone(now, 'sine', 1200, 1500, 0.2, 0.1, panner); // High ping
                break;
            case 'acid':
                this.playNoise(now, 0.2, 1500, 'bandpass', 0.15, 0.05, panner); // Hiss
                break;
            case 'gravity':
                this.playTone(now, 'sine', 50, 150, 0.4, 0.3, panner); // Reverse sweep
                break;
            case 'thumper':
                this.playTone(now, 'square', 50, 10, 0.3, 0.5, panner); // Low heavy
                break;
            case 'explode':
                this.playNoise(now, 0.5, 150, 'lowpass', 0.6, 0.01, panner); // Boom
                break;
            case 'build':
                this.playTone(now, 'sine', 400, 800, 0.15, 0.2, panner);
                break;
            case 'collect':
                this.playTone(now, 'triangle', 1200, 1800, 0.08, 0.1, panner);
                break;
            case 'levelup':
                this.playTone(now, 'square', 440, 440, 0.1, 0.2, panner);
                this.playTone(now + 0.1, 'square', 554, 554, 0.1, 0.2, panner);
                this.playTone(now + 0.2, 'square', 659, 659, 0.4, 0.2, panner);
                break;
            case 'spawn':
                this.playTone(now, 'sawtooth', 150, 50, 0.6, 0.3, panner);
                break;
            default:
                // Fallback
                this.playTone(now, 'sine', 440, 220, 0.1, 0.1, panner);
                break;
        }
    }

    playTone(time, type, startFreq, endFreq, duration, vol, dest) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), time + duration);

        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(time);
        osc.stop(time + duration);
    }

    playNoise(time, duration, filterFreq, filterType, vol, attack = 0.01, dest) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        // Randomize start position for variety
        src.loopStart = Math.random() * (this.noiseBuffer.duration - duration);
        src.loopEnd = src.loopStart + duration;
        src.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.setValueAtTime(filterFreq, time);
        if (filterType === 'bandpass') filter.Q.value = 1;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(vol, time + attack);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        src.start(time);
        src.stop(time + duration);
    }

    startMusic() {
        if (this.musicStarted) return;
        this.musicStarted = true;
        this.resume();
        this.sequencer = new MusicSequencer(this.ctx, this.masterGain);
        this.sequencer.start();
    }
}

class MusicSequencer {
    constructor(ctx, dest) {
        this.ctx = ctx;
        this.dest = dest;
        this.isPlaying = false;
        this.tempo = 110;
        this.nextNoteTime = 0;
        this.step = 0;

        // E Phrygian Scale
        this.scale = [82.41, 87.31, 98.00, 110.00, 123.47, 130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63, 293.66, 329.63];

        // Delay Effect
        this.delayNode = this.ctx.createDelay();
        this.delayNode.delayTime.value = 60 / this.tempo * 0.75; // Dotted 8th note delay
        this.delayFeedback = this.ctx.createGain();
        this.delayFeedback.gain.value = 0.4;
        this.delayFilter = this.ctx.createBiquadFilter();
        this.delayFilter.type = 'lowpass';
        this.delayFilter.frequency.value = 1000;

        this.delayNode.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delayFilter);
        this.delayFilter.connect(this.delayNode);
        this.delayNode.connect(this.dest);

        // Patterns
        this.bassPattern = [0, null, 0, null, 3, null, 0, null, 0, null, 0, null, 1, null, 4, null];
        this.kickPattern = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0];
        this.melodyPattern = [null, 7, null, 8, null, 7, null, 9, null, 7, null, 6, null, 7, null, 10];
        this.padChord = [0, 4, 7]; // E minor triad
    }

    start() {
        this.isPlaying = true;
        this.nextNoteTime = this.ctx.currentTime;
        this.scheduler();
    }

    scheduler() {
        if (!this.isPlaying) return;
        const secondsPerBeat = 60.0 / this.tempo;
        const secondsPerStep = secondsPerBeat / 4;

        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            this.playStep(this.nextNoteTime);
            this.nextNoteTime += secondsPerStep;
            this.step = (this.step + 1) % 16;
        }
        setTimeout(() => this.scheduler(), 25);
    }

    playStep(time) {
        // Kick
        if (this.kickPattern[this.step]) this.playKick(time);

        // Bass
        const bassNote = this.bassPattern[this.step];
        if (bassNote !== null) this.playSynth(time, this.scale[bassNote], 'sawtooth', 0.2, 0.2, 150, false);

        // Melody (with Delay)
        const melodyNote = this.melodyPattern[this.step];
        if (melodyNote !== null) {
            let note = melodyNote;
            if (Math.random() < 0.3) note += (Math.random() > 0.5 ? 1 : -1);
            this.playSynth(time, this.scale[note], 'triangle', 0.1, 0.1, 1200, true);
        }

        // Hi-hat
        if (this.step % 2 === 1) this.playNoise(time, 0.03);

        // Pad (every 16 steps)
        if (this.step === 0) {
            this.padChord.forEach((n, i) => {
                this.playPad(time, this.scale[n + 7], 0.05, 4); // Octave up
            });
        }
    }

    playKick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
        osc.connect(gain);
        gain.connect(this.dest);
        osc.start(time);
        osc.stop(time + 0.5);
    }

    playSynth(time, freq, type, vol, duration, filterFreq, useDelay) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterFreq, time);
        filter.frequency.exponentialRampToValueAtTime(filterFreq * 0.5, time + duration);

        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.dest);

        if (useDelay) gain.connect(this.delayNode);

        osc.start(time);
        osc.stop(time + duration);
    }

    playPad(time, freq, vol, duration) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(vol, time + 1);
        gain.gain.linearRampToValueAtTime(0, time + duration);
        osc.connect(gain);
        gain.connect(this.dest);
        osc.start(time);
        osc.stop(time + duration);
    }

    playNoise(time, duration) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 6000;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.dest);
        src.start(time);
    }
}

export const audioManager = new AudioManager();
