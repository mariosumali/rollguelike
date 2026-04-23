let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicGain: GainNode | null = null;

export interface SfxParams {
  wave?: 'sine' | 'square' | 'triangle' | 'sawtooth' | 'noise';
  freq?: number;
  freqEnd?: number;
  duration?: number;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  volume?: number;
  lowpass?: number;
  resonance?: number;
  detune?: number;
  vibrato?: number;
  distortion?: number;
}

export function initAudio(): void {
  if (audioCtx) return;
  const Ctor = (window.AudioContext ?? (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  if (!Ctor) return;
  audioCtx = new Ctor();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.6;
  masterGain.connect(audioCtx.destination);
  sfxGain = audioCtx.createGain();
  sfxGain.gain.value = 0.7;
  sfxGain.connect(masterGain);
  musicGain = audioCtx.createGain();
  musicGain.gain.value = 0.3;
  musicGain.connect(masterGain);
}

export function getAudioContext(): AudioContext | null {
  return audioCtx;
}

export function getSfxGain(): GainNode | null {
  return sfxGain;
}

export function getMusicGain(): GainNode | null {
  return musicGain;
}

export function setMasterVolume(v: number): void {
  if (masterGain) masterGain.gain.value = clamp01(v) * 0.6;
}

export function setSfxVolume(v: number): void {
  if (sfxGain) sfxGain.gain.value = clamp01(v) * 0.7;
}

export function setMusicVolume(v: number): void {
  if (musicGain) musicGain.gain.value = clamp01(v) * 0.3;
}

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

export function playTone(params: SfxParams): void {
  if (!audioCtx || !sfxGain) return;
  const {
    wave = 'square',
    freq = 440,
    freqEnd,
    duration = 0.15,
    attack = 0.005,
    decay = 0.05,
    release = 0.05,
    sustain = 0.6,
    volume = 0.3,
    lowpass,
    resonance,
    vibrato,
  } = params;
  const now = audioCtx.currentTime;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + attack);
  gain.gain.linearRampToValueAtTime(volume * sustain, now + attack + decay);
  gain.gain.linearRampToValueAtTime(0, now + duration + release);
  let source: AudioNode;
  if (wave === 'noise') {
    const buf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * (duration + release)), audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buf;
    noise.start(now);
    source = noise;
  } else {
    const osc = audioCtx.createOscillator();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), now + duration);
    if (vibrato) {
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.value = 8;
      lfoGain.gain.value = vibrato;
      lfo.connect(lfoGain).connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + duration + release);
    }
    osc.start(now);
    osc.stop(now + duration + release);
    source = osc;
  }
  let node: AudioNode = source;
  if (lowpass) {
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    if (resonance) filter.Q.value = resonance;
    node.connect(filter);
    node = filter;
  }
  node.connect(gain);
  gain.connect(sfxGain);
}

export function playNoiseBurst(duration: number, lowpass: number, volume: number): void {
  playTone({ wave: 'noise', duration, lowpass, volume, attack: 0.001, decay: 0.01, sustain: 0.2, release: 0.1 });
}

export function playChord(freqs: number[], params: SfxParams): void {
  for (const f of freqs) playTone({ ...params, freq: f });
}
