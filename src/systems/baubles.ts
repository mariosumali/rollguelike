import { getUpgrade } from '../content/upgrades/registry';
import type { BaubleEffect, RunState } from '../types';

export const BAUBLE_STAT_KEYS = [
  'allDamageMul',
  'damageToFrozenMul',
  'damageToSlowedMul',
  'damageToPoisonedMul',
  'damageToBurningMul',
  'damageToEliteBossMul',
  'lowFaceDamageMul',
  'highFaceDamageMul',
  'lowHpDamageMul',
  'fireDamageMul',
  'lightningDamageMul',
  'arcaneDamageMul',
  'poisonApplicationDpsMul',
  'poisonDurationMul',
  'poisonTickDamageMul',
  'burnTickDamageMul',
  'freezeDurationMul',
  'stunDurationMul',
  'chainDamageMul',
  'chainRangeMul',
  'projectileDamageMul',
  'projectileSpeedMul',
  'projectileRadiusMul',
  'projectileLifetimeMul',
  'projectileCritChance',
  'frozenCritChance',
  'fireProjectileCritChance',
  'pulseDamageMul',
  'beamDamageMul',
  'orbitDamageMul',
  'strikeDamageMul',
  'healingReceivedMul',
  'waveStartShield',
  'goldGainMul',
  'cooldownReductionMul',
] as const satisfies readonly (keyof BaubleEffect)[];

export type BaubleStatKey = (typeof BAUBLE_STAT_KEYS)[number];
export type BaubleStats = Record<BaubleStatKey, number>;

export function emptyBaubleStats(): BaubleStats {
  return Object.fromEntries(BAUBLE_STAT_KEYS.map((key) => [key, 0])) as BaubleStats;
}

export function collectBaubleStats(run: RunState | null | undefined): BaubleStats {
  const stats = emptyBaubleStats();
  if (!run) return stats;

  for (const applied of run.upgrades) {
    const upgrade = getUpgrade(applied.id);
    if (upgrade?.category !== 'bauble' || !upgrade.bauble) continue;
    const stacks = Math.max(0, applied.stacks);
    if (stacks <= 0) continue;
    for (const key of BAUBLE_STAT_KEYS) {
      stats[key] += (upgrade.bauble[key] ?? 0) * stacks;
    }
  }

  return stats;
}

export function baubleMul(value: number): number {
  return 1 + Math.max(0, value);
}
