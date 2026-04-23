import { getAudioContext, getMusicGain } from './synth';
import { BGM_SETS } from './bgmPatterns';
import type { BgmLayerPattern, BgmPatternKey } from './bgmPatterns';

let running = false;
let rafId: number | null = null;
let intensity: 'normal' | 'boss' = 'normal';
let nextStepTime = 0;
let stepIndex = 0;
let activeTrack: BgmPatternKey | null = null;

const LOOKAHEAD_S = 0.2;

function m2h(m: number): number {
  if (m <= 0) return 0;
  return 440 * Math.pow(2, (m - 69) / 12);
}

function currentPattern(): BgmLayerPattern {
  const id: BgmPatternKey = activeTrack ?? 'overworld';
  const set = BGM_SETS[id] ?? BGM_SETS.overworld;
  return intensity === 'boss' ? set.boss : set.normal;
}

/** Switches track without gapping the loop. Accepts any key in `BGM_SETS` (incl. 'menu'). */
export function setBgmTrack(t: BgmPatternKey): void {
  if (t === activeTrack) return;
  activeTrack = t;
  const ctx = getAudioContext();
  nextStepTime = ctx ? ctx.currentTime + 0.05 : 0;
  stepIndex = 0;
}

export function startBgm(): void {
  if (running) return;
  running = true;
  stepIndex = 0;
  nextStepTime = 0;
  const tick = () => {
    if (!running) return;
    schedule();
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

export function stopBgm(): void {
  running = false;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  nextStepTime = 0;
  stepIndex = 0;
}

export function setBgmIntensity(i: 'normal' | 'boss'): void {
  intensity = i;
}

function stepSeconds(p: BgmLayerPattern): number {
  return (60 / p.bpm / 2) * p.stepMul;
}

function schedule(): void {
  const ctx = getAudioContext();
  if (!ctx || !getMusicGain()) return;
  const p = currentPattern();
  const stepLen = stepSeconds(p);
  const now = ctx.currentTime;
  if (nextStepTime < now - 0.28) {
    nextStepTime = now + 0.02;
  }
  if (nextStepTime === 0) {
    nextStepTime = now + 0.06;
  }
  const patternLen = p.bass.length || 16;
  let safety = 0;
  while (nextStepTime < now + LOOKAHEAD_S && safety++ < 14) {
    const i = stepIndex % patternLen;
    playStep(p, i, nextStepTime, stepLen);
    nextStepTime += stepLen;
    stepIndex++;
  }
}

function playStep(
  p: BgmLayerPattern,
  i: number,
  when: number,
  stepLen: number,
): void {
  const isBoss = intensity === 'boss';

  const b = p.bass[i] ?? 0;
  if (b > 0) {
    playTriangleBass(m2h(b), stepLen, isBoss ? 0.2 : 0.19, when);
  }

  const s = p.strings[i] ?? 0;
  if (s > 0) {
    playStringPad(m2h(s), Math.min(stepLen * 1.85, 0.42), when, isBoss ? 0.05 : 0.045);
  }

  const br = p.brass[i] ?? 0;
  if (br > 0) {
    playBrassStab(m2h(br), when, isBoss ? 0.09 : 0.075, isBoss);
  }

  const a = p.arp[i] ?? 0;
  if (a > 0) {
    playHarpPluck(m2h(a), when, isBoss ? 0.055 : 0.05);
  }

  const l = p.lead[i] ?? 0;
  if (l > 0) {
    playChiptuneLead(m2h(l), stepLen * 0.92, isBoss ? 0.1 : 0.095, when, 7200, 'square');
  }

  const c = p.counter[i] ?? 0;
  if (c > 0) {
    playWindCounter(m2h(c), stepLen * 0.88, isBoss ? 0.05 : 0.048, when);
  }

  if (p.kick[i]) playDrum('kick', when, isBoss ? 0.3 : 0.26);
  if (p.snare[i]) playDrum('snare', when, isBoss ? 0.2 : 0.16);
  if (p.hihat[i]) playDrum('hihat', when, 0.065);
}

function playTriangleBass(
  freq: number,
  duration: number,
  vol: number,
  when: number,
): void {
  const ctx = getAudioContext();
  const out = getMusicGain();
  if (!ctx || !out) return;
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, when);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.008);
  g.gain.setValueAtTime(vol * 0.9, when + duration * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0008, when + duration);
  osc.connect(g).connect(out);
  osc.start(when);
  osc.stop(when + duration + 0.02);
}

/** Layered saws + lowpass — string-pad wash. */
function playStringPad(
  freq: number,
  duration: number,
  when: number,
  vol: number,
): void {
  const ctx = getAudioContext();
  const out = getMusicGain();
  if (!ctx || !out) return;
  const master = ctx.createGain();
  master.gain.value = 1;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(680, when);
  f.frequency.exponentialRampToValueAtTime(1000, when + 0.1);
  f.Q.value = 0.45;
  f.connect(master);
  master.connect(out);
  const det = [0.9965, 1, 1.0035];
  for (const mul of det) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * mul, when);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol * 0.33, when + 0.045);
    g.gain.setValueAtTime(vol * 0.28, when + duration * 0.55);
    g.gain.exponentialRampToValueAtTime(0.0004, when + duration);
    osc.connect(g);
    g.connect(f);
    osc.start(when);
    osc.stop(when + duration + 0.04);
  }
}

function playBrassStab(
  freq: number,
  when: number,
  vol: number,
  isBoss: boolean,
): void {
  const ctx = getAudioContext();
  const out = getMusicGain();
  if (!ctx || !out) return;
  const d = isBoss ? 0.1 : 0.11;
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, when);
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(900, when);
  f.frequency.exponentialRampToValueAtTime(isBoss ? 1500 : 1200, when + d * 0.6);
  f.Q.value = 1.1;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0004, when + d);
  osc.connect(f).connect(g).connect(out);
  osc.start(when);
  osc.stop(when + d + 0.02);
  const inst = ctx.createOscillator();
  inst.type = 'sine';
  inst.frequency.setValueAtTime(freq * 0.5, when);
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0, when);
  g2.gain.linearRampToValueAtTime(vol * 0.22, when + 0.015);
  g2.gain.exponentialRampToValueAtTime(0.0003, when + d);
  inst.connect(g2).connect(out);
  inst.start(when);
  inst.stop(when + d);
}

function playHarpPluck(freq: number, when: number, vol: number): void {
  const ctx = getAudioContext();
  const out = getMusicGain();
  if (!ctx || !out) return;
  const d = 0.11;
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, when);
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 6000;
  f.Q.value = 0.2;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0003, when + d);
  osc.connect(f).connect(g).connect(out);
  osc.start(when);
  osc.stop(when + d);
}

function playChiptuneLead(
  freq: number,
  duration: number,
  vol: number,
  when: number,
  filterHz: number,
  wave: OscillatorType,
): void {
  const ctx = getAudioContext();
  const out = getMusicGain();
  if (!ctx || !out) return;
  const makeOsc = (mul: number) => {
    const osc = ctx.createOscillator();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq * mul, when);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = filterHz;
    f.Q.value = 0.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol * 0.5, when + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0004, when + duration);
    osc.connect(f).connect(g);
    g.connect(out);
    osc.start(when);
    osc.stop(when + duration + 0.02);
  };
  makeOsc(0.9982);
  makeOsc(1.0018);
}

function playWindCounter(
  freq: number,
  duration: number,
  vol: number,
  when: number,
): void {
  const ctx = getAudioContext();
  const out = getMusicGain();
  if (!ctx || !out) return;
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, when);
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 2200;
  f.Q.value = 0.6;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.028);
  g.gain.exponentialRampToValueAtTime(0.00035, when + duration);
  osc.connect(f).connect(g).connect(out);
  osc.start(when);
  osc.stop(when + duration + 0.02);
}

function playDrum(
  kind: 'kick' | 'snare' | 'hihat',
  when: number,
  peak: number,
): void {
  const ctx = getAudioContext();
  const gainNode = getMusicGain();
  if (!ctx || !gainNode) return;
  if (kind === 'kick') {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, when);
    osc.frequency.exponentialRampToValueAtTime(32, when + 0.11);
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, when);
    g.gain.exponentialRampToValueAtTime(0.0008, when + 0.14);
    osc.connect(g).connect(gainNode);
    osc.start(when);
    osc.stop(when + 0.16);
  } else if (kind === 'snare') {
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.09), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * (1 - j / d.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 2200;
    f.Q.value = 0.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, when);
    g.gain.exponentialRampToValueAtTime(0.0006, when + 0.09);
    const tone = ctx.createOscillator();
    tone.type = 'triangle';
    tone.frequency.value = 180;
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(peak * 0.3, when);
    tg.gain.exponentialRampToValueAtTime(0.0006, when + 0.06);
    tone.connect(tg).connect(gainNode);
    tone.start(when);
    tone.stop(when + 0.07);
    src.connect(f).connect(g).connect(gainNode);
    src.start(when);
  } else {
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.04), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * 0.85;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 6000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, when);
    g.gain.exponentialRampToValueAtTime(0.0005, when + 0.035);
    src.connect(f).connect(g).connect(gainNode);
    src.start(when);
  }
}
