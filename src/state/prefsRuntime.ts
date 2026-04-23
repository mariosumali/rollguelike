/**
 * Hot-path mirrors of user preferences so engine code (running every frame)
 * can read them without touching the zustand store. Values are updated by
 * the settings subscriber in `src/main.tsx` whenever the store changes.
 */

import type { EnemyHpBarMode, ParticleDensity } from './store';

let screenFlashes = true;
let damageNumbers = true;
let enemyHpBars: EnemyHpBarMode = 'damaged';
let particleMultiplier = 1;
let reduceMotion = false;
let autoRoll = false;

export function setScreenFlashesEnabled(v: boolean): void {
  screenFlashes = v;
}
export function getScreenFlashesEnabled(): boolean {
  return screenFlashes;
}

export function setDamageNumbersEnabled(v: boolean): void {
  damageNumbers = v;
}
export function getDamageNumbersEnabled(): boolean {
  return damageNumbers;
}

export function setEnemyHpBarMode(m: EnemyHpBarMode): void {
  enemyHpBars = m;
}
export function getEnemyHpBarMode(): EnemyHpBarMode {
  return enemyHpBars;
}

export function setParticleDensity(d: ParticleDensity): void {
  particleMultiplier = d === 'low' ? 0.4 : d === 'high' ? 1.6 : 1;
}
export function getParticleMultiplier(): number {
  return particleMultiplier;
}

export function setReduceMotionEnabled(v: boolean): void {
  reduceMotion = v;
}
export function getReduceMotionEnabled(): boolean {
  return reduceMotion;
}

export function setAutoRollEnabled(v: boolean): void {
  autoRoll = v;
}
export function getAutoRollEnabled(): boolean {
  return autoRoll;
}

