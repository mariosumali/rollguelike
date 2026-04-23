let enabled = true;
let strengthMul = 1;

export function setHapticsEnabled(on: boolean): void {
  enabled = on;
}

export function setHapticStrengthMultiplier(m: number): void {
  strengthMul = Math.max(0, m);
}

export type HapticPattern = number | readonly number[];

export function haptic(pattern: HapticPattern): void {
  if (!enabled || strengthMul <= 0) return;
  try {
    const n = (navigator as Navigator & { vibrate?: (p: number | number[]) => boolean });
    const scale = (v: number) => Math.max(1, Math.round(v * strengthMul));
    const p = typeof pattern === 'number' ? scale(pattern) : Array.from(pattern).map(scale);
    n.vibrate?.(p);
  } catch {}
}

export const HAPTIC = {
  tap: 8,
  land: 14,
  damage: [20, 20, 30],
  shield: 12,
  reaction: [18, 10, 18],
  bossKill: [40, 30, 60, 30, 90],
  gameOver: [120, 60, 120],
  upgrade: 18,
} as const;
