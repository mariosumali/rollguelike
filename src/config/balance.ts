import type { Rarity } from '../types';

export const BALANCE = {
  player: {
    startingHp: 100,
    iframeDuration: 0.6,
  },

  die: {
    baseRollDuration: 1.5,
    rollDurationMin: 0.6,
    postRollCooldown: 0.4,
  },

  enemy: {
    hpScale: (wave: number) => Math.pow(1.14, wave - 1),
    speedScale: (wave: number) => Math.min(1 + (wave - 1) * 0.02, 1.75),
    baseSpawnInterval: (wave: number) => Math.max(0.4, 1.3 - wave * 0.035),
    countPerWave: (wave: number, isBoss: boolean) => {
      if (isBoss) return 1 + Math.floor(wave / 10);
      return 5 + Math.floor(wave * 1.4);
    },
  },

  combat: {
    baseFaceDamage: [0, 6, 11, 16, 23, 31, 42],
    streakMulPerStack: 0.12,
    streakMulMax: 4.0,
    projectileSpeed: 260,
    projectileLife: 2.4,
    shotSequenceDelay: 0.05,
    pulseRadius: 52,
    pulseDamage: (val: number) => 6 * val,
    shieldAmount: (val: number) => 1 + Math.floor(val / 2),
    shieldMax: 10,
    healAmount: (val: number) => 4 + val * 2,
    lightningChainDamageMul: 0.3,
    lightningStunT: 0.2,
    streakTierThresholds: [3, 5, 8, 12, 20],
  },

  scoring: {
    perKill: (wave: number) => 10 + Math.floor(wave * 1.5),
    waveClearBonus: (wave: number) => 50 + wave * 10,
    bossClearBonus: (wave: number) => 250 + wave * 25,
  },

  upgrade: {
    picksPerWave: 1,
    picksOnBoss: 2,
    offersPerSelect: 3,
    rarityWeights: (wave: number): Record<Rarity, number> => {
      const w = wave;
      return {
        common: Math.max(55 - w * 1.3, 8),
        rare: 28 + Math.min(w * 0.5, 20),
        epic: 12 + Math.min(w * 0.9, 35),
        legendary: 2 + Math.min(w * 0.7, 40),
      };
    },
  },

  waves: {
    bossEvery: 5,
    upgradeEvery: 1,
  },

  meta: {
    clockmakerUnlockRuns: 3,
  },
} as const;
