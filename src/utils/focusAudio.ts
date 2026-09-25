// Web Audio API ambient sound synthesizer for deep study concentration
// Generates peaceful background noise and binaural study tones without external audio files.

class FocusAudioEngine {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private toneNode: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private currentMode: 'rain' | 'alpha' | 'hum' = 'rain';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public start(mode: 'rain' | 'alpha' | 'hum' = 'rain', volume = 0.3) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.currentMode = mode;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (mode === 'alpha') {
      // 432Hz calming alpha carrier tone with gentle LFO
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(216, this.ctx.currentTime); // Calming harmonic

      // Sub-harmonic for alpha beat sensation
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(226, this.ctx.currentTime); // 10Hz alpha difference

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

      osc.connect(this.gainNode);
      osc2.connect(subGain);
      subGain.connect(this.gainNode);

      osc.start();
      osc2.start();
      this.toneNode = osc;
      this.isPlaying = true;
    } else if (mode === 'hum') {
      // Deep study hum - resonant low frequency
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(this.gainNode);

      osc.start();
      this.toneNode = osc;
      this.isPlaying = true;
    } else {
      // Library Rain / Brown Noise generator for masking room noise
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise filter (integrator)
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // boost gain
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Warm low-pass filter for cozy library atmosphere
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.gainNode);
      noise.start();

      this.noiseNode = noise;
      this.isPlaying = true;
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch (e) {
        // ignore
      }
      this.noiseNode = null;
    }
    if (this.toneNode) {
      try {
        this.toneNode.stop();
        this.toneNode.disconnect();
      } catch (e) {
        // ignore
      }
      this.toneNode = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    this.isPlaying = false;
  }

  public playTimerCompletionChime() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.3); // A5

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public getCurrentMode() {
    return this.currentMode;
  }
}

export const focusAudio = new FocusAudioEngine();
