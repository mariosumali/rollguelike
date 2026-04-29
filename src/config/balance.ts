import type { Rarity } from '../types';

export const BALANCE = {
  player: {
    startingHp: 100,
    iframeDuration: 0.6,
  },

  die: {
    baseRollDuration: 0.9,
    rollDurationMin: 0.525,
    postRollCooldown: 0.25,
  },

  enemy: {
    hpScale: (wave: number) => Math.pow(1.105, wave - 1),
    speedScale: (wave: number) => Math.min(1 + (wave - 1) * 0.018, 1.65),
    bossHpMul: (wave: number) => 3.1 + wave * 0.18,
    eliteHpMul: 1.65,
    eliteSpeedMul: 1.12,
    eliteBaseChance: (wave: number) => Math.min(0.18, Math.max(0, (wave - 4) * 0.012)),
    baseSpawnInterval: (wave: number) => Math.max(0.4, 1.3 - wave * 0.035),
    countPerWave: (wave: number, isBoss: boolean) => {
      if (isBoss) return 1 + Math.floor(wave / 10);
      return 5 + Math.floor(wave * 1.4);
    },
  },

  combat: {
    baseFaceDamage: [0, 4, 7, 11, 15, 20, 27],
    projectileSpeed: 260,
    projectileLife: 2.4,
    shotSequenceDelay: 0.05,
    pulseRadius: 52,
    pulseDamage: (val: number) => 4 * val,
    shieldAmount: (val: number) => 1 + Math.floor(val / 2),
    shieldMax: 10,
    healAmount: (val: number) => 3 + val,
    lightningChainDamageMul: 0.3,
    lightningStunT: 0.2,
    /**
     * Global multiplier applied to every hit the player (or their summons,
     * orbits, beams, pulses, pull zones, landmarks, etc.) deal to enemies.
     * Does NOT affect damage the player TAKES. Lower = harder game.
     */
    globalDamageMul: 0.5,
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
    // Challenge thresholds to unlock each character. Tuned to demand sustained
    // play — see src/content/characters/index.ts for how each is applied.
    // Clockmaker is intentionally left off here — its unlock is hard-gated
    // (always false) until a future mechanic ("Go back in time") is added.
    gamblerUnlockGoldSpent: 500,
    alchemistUnlockWave: 40,
    necromancerUnlockKills: 2000,
    berserkerUnlockRunKills: 500,
  },

  gold: {
    perKill: (wave: number) => (wave >= 10 ? 3 : wave >= 5 ? 2 : 1),
    eliteKill: (wave: number) => 5 + Math.floor(wave / 2),
    bossKill: (wave: number) => 25 + wave * 2,
    waveClearBonus: (wave: number) => 5 + wave * 2,
    skipHeal: (face: number) => face * 0.5,
  },

  shop: {
    cardsPerOffer: 4,
    rerollCost: (wave: number) => 10 + wave * 3,
    skipHealCost: (wave: number) => 10 + wave * 3,
    removeDefaultCost: (wave: number) => 25 + wave * 5,
    slotExpandCost: (wave: number) => 50 + wave * 8,
    slotCapBase: 2,
    slotCapMax: 4,
    ownedT1T2WeightMul: 1.4,
    ownedT3T4WeightMul: 0.2,
    ownedMaxWeightMul: 0.2,
    maxTierDuplicateRefund: 8,
    // Forge unlocks higher-rarity upgrades as the run progresses. Offers of a
    // given rarity are hard-gated until the listed wave; below that wave they
    // cannot appear in the forge at all.
    rarityMinWave: {
      common: 1,
      rare: 4,
      epic: 10,
      legendary: 20,
    } as Record<Rarity, number>,
    // Even after a rarity unlocks, its selection weight ramps up with the wave
    // so early forges lean hard on commons and only gradually broaden out.
    rarityWeight: (rarity: Rarity, wave: number): number => {
      switch (rarity) {
        case 'common':
          return Math.max(1.2 - wave * 0.01, 0.4);
        case 'rare':
          return Math.min(0.45 + Math.max(0, wave - 3) * 0.04, 1.15);
        case 'epic':
          return Math.min(0.12 + Math.max(0, wave - 9) * 0.035, 0.9);
        case 'legendary':
          return Math.min(0.03 + Math.max(0, wave - 19) * 0.022, 0.55);
      }
    },
    postBossDiscount: 0.2,
  },

  faceUpgrade: {
    tierScaling: {
      scalePerTier: 0.2,
      particlesPerTier: 0.25,
      brightnessPerTier: 0.1,
    },
    basePrices: {
      common: [12, 38, 90],
      rare: [24, 72, 175],
      epic: [48, 150, 360],
      legendary: [95, 310, 740],
    } as Record<Rarity, number[]>,
  },

  gambler: {
    gambitMaxStacks: 5,
    gambitBonusPerStack: 0.15,
    gambitExtremes: [1, 6] as number[],
  },

  necromancer: {
    // Hard cap on banked souls. Prevents hoarding an ever-larger reservoir
    // that permanently amplifies bone-shard damage and fuels back-to-back
    // SOUL_DRAIN pulses. Still generous enough for two big face-6 drains.
    soulsMax: 12,
  },

  berserker: {
    // Rage already had an inline cap; codified here so damage scaling from
    // rage-gated upgrades can't be pushed beyond the intended ceiling.
    rageMax: 10,
  },

  slot: {
    slotsPerCharacter: 6,
    replacerPerSlot: 1,
    supplementsDefault: 2,
    supplementsMax: 4,
  },

  waveCadence: {
    forgeShopEvery: 2,
    bossEvery: 5,
  },
} as const;
