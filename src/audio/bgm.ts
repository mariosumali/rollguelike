import { getAudioContext, getMusicGain } from './synth';

let running = false;
let intervalId: number | null = null;
let intensity: 'normal' | 'boss' = 'normal';

const NORMAL_BASS = [55, 55, 65, 55, 49, 49, 55, 65];
const NORMAL_LEAD = [220, 262, 330, 262, 196, 220, 262, 330];
const BOSS_BASS = [49, 55, 49, 41, 55, 65, 55, 49];
const BOSS_LEAD = [165, 196, 220, 247, 196, 220, 165, 147];

const NOTE_LEN = 0.22;

let stepIdx = 0;

export function startBgm(): void {
  if (running) return;
  running = true;
  stepIdx = 0;
  tick();
  intervalId = window.setInterval(tick, NOTE_LEN * 1000);
}

export function stopBgm(): void {
  running = false;
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function setBgmIntensity(i: 'normal' | 'boss'): void {
  intensity = i;
}

function tick(): void {
  const ctx = getAudioContext();
  const gain = getMusicGain();
  if (!ctx || !gain) return;
  const bass = (intensity === 'boss' ? BOSS_BASS : NORMAL_BASS)[stepIdx % 8]!;
  const lead = (intensity === 'boss' ? BOSS_LEAD : NORMAL_LEAD)[stepIdx % 8]!;
  const now = ctx.currentTime;
  playNote(bass, 'triangle', NOTE_LEN * 0.9, 0.18, now);
  playNote(lead, 'square', NOTE_LEN * 0.5, 0.09, now + NOTE_LEN * 0.05);
  if (stepIdx % 2 === 0) playDrum('kick', now);
  else playDrum('snare', now + NOTE_LEN * 0.5);
  stepIdx++;
}

function playNote(freq: number, wave: OscillatorType, duration: number, vol: number, when: number): void {
  const ctx = getAudioContext();
  const gainNode = getMusicGain();
  if (!ctx || !gainNode) return;
  const osc = ctx.createOscillator();
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, when);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.01);
  g.gain.linearRampToValueAtTime(0, when + duration);
  osc.connect(g).connect(gainNode);
  osc.start(when);
  osc.stop(when + duration + 0.02);
}

function playDrum(kind: 'kick' | 'snare', when: number): void {
  const ctx = getAudioContext();
  const gainNode = getMusicGain();
  if (!ctx || !gainNode) return;
  if (kind === 'kick') {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, when);
    osc.frequency.exponentialRampToValueAtTime(40, when + 0.1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.1);
    osc.connect(g).connect(gainNode);
    osc.start(when);
    osc.stop(when + 0.12);
  } else {
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.08), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 1500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.12, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.08);
    src.connect(f).connect(g).connect(gainNode);
    src.start(when);
  }
}
