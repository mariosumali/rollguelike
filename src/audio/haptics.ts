let enabled = true;

export function setHapticsEnabled(on: boolean): void {
  enabled = on;
}

export type HapticPattern = number | readonly number[];

export function haptic(pattern: HapticPattern): void {
  if (!enabled) return;
  try {
    const n = (navigator as Navigator & { vibrate?: (p: number | number[]) => boolean });
    const p = typeof pattern === 'number' ? pattern : Array.from(pattern);
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
