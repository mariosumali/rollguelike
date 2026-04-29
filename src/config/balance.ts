import type { CasinoChestTier, CasinoGameId, CasinoLuckGrade, Rarity } from '../types';

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
    // Hybrid curve keeps early pressure climbing while preventing late-wave HP walls.
    hpScale: (wave: number) => Math.min(Math.pow(1.065, wave - 1), 1 + (wave - 1) * 0.16),
    earlyHpMul: (wave: number) => (wave <= 5 ? 0.2 + (wave - 1) * 0.16 : 1),
    speedScale: (wave: number) => Math.min(1 + (wave - 1) * 0.018, 1.65),
    bossHpMul: (wave: number) => 2.8 + wave * 0.11,
    eliteHpMul: 1.45,
    eliteSpeedMul: 1.12,
    eliteBaseChance: (wave: number) => Math.min(0.18, Math.max(0, (wave - 4) * 0.012)),
    baseSpawnInterval: (wave: number) => Math.max(0.4, 1.3 - wave * 0.035),
    countPerWave: (wave: number, isBoss: boolean) => {
      if (isBoss) return 1 + Math.floor(wave / 10);
      if (wave <= 10) return 4 + Math.floor(wave * 1.0);
      return 14 + Math.floor((wave - 10) * 1.1);
    },
  },

  combat: {
    baseFaceDamage: [0, 5, 8, 12, 17, 23, 31],
    projectileSpeed: 260,
    projectileLife: 2.4,
    shotSequenceDelay: 0.05,
    pulseRadius: 75,
    pulseDamage: (val: number) => 5 * val,
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
    globalDamageMul: 0.85,
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

  relic: {
    forgeOfferChance: (wave: number) => Math.min(0.24, Math.max(0, (wave - 5) * 0.018)),
    bossRewardWeightMul: 0.65,
    basePrices: {
      common: 140,
      rare: 240,
      epic: 420,
      legendary: 760,
    } as Record<Rarity, number>,
    rarityMinWave: {
      common: 1,
      rare: 6,
      epic: 12,
      legendary: 20,
    } as Record<Rarity, number>,
  },

  bauble: {
    rewardWeightMul: 1.8,
    bossRewardWeightMul: 0.9,
    relicNormalRewardWeightMul: 0.18,
    forgeOfferChance: (wave: number) => Math.min(0.38, Math.max(0, (wave - 2) * 0.04)),
    basePrices: {
      common: 35,
      rare: 65,
      epic: 115,
      legendary: 0,
    } as Record<Rarity, number>,
    rarityMinWave: {
      common: 1,
      rare: 4,
      epic: 10,
      legendary: 99,
    } as Record<Rarity, number>,
  },

  casino: {
    offeredGames: ['slots', 'roulette', 'blackjack', 'coinFlip'] as CasinoGameId[],
    chestTierOrder: ['rusty', 'copper', 'bronze', 'iron', 'silver', 'gold', 'diamond', 'jackpot'] as CasinoChestTier[],
    luckGradeOrder: ['COLD', 'WARM', 'HOT', 'LUCKY', 'JACKPOT'] as CasinoLuckGrade[],
    convertGoldByRarity: {
      common: 12,
      rare: 28,
      epic: 60,
      legendary: 140,
    } as Record<Rarity, number>,
    goldByTier: {
      rusty: [8, 16],
      copper: [11, 21],
      bronze: [14, 26],
      iron: [19, 34],
      silver: [24, 42],
      gold: [44, 76],
      diamond: [66, 118],
      jackpot: [90, 160],
    } as Record<CasinoChestTier, readonly [number, number]>,
    healByTier: {
      rusty: [4, 8],
      copper: [5, 10],
      bronze: [7, 13],
      iron: [9, 17],
      silver: [12, 22],
      gold: [20, 36],
      diamond: [28, 48],
      jackpot: [36, 64],
    } as Record<CasinoChestTier, readonly [number, number]>,
    baseChestWeightsByLuck: {
      COLD: { rusty: 5200, copper: 2700, bronze: 1550, iron: 380, silver: 130, gold: 35, diamond: 4, jackpot: 1 },
      WARM: { rusty: 3300, copper: 2700, bronze: 2150, iron: 950, silver: 600, gold: 240, diamond: 50, jackpot: 10 },
      HOT: { rusty: 1700, copper: 2100, bronze: 2250, iron: 1650, silver: 1200, gold: 760, diamond: 260, jackpot: 80 },
      LUCKY: { rusty: 700, copper: 1300, bronze: 1800, iron: 2100, silver: 2100, gold: 1250, diamond: 550, jackpot: 200 },
      JACKPOT: { rusty: 250, copper: 650, bronze: 1150, iron: 1750, silver: 2100, gold: 1900, diamond: 1350, jackpot: 850 },
    } as Record<CasinoLuckGrade, Record<CasinoChestTier, number>>,
    categoryWeightsByTier: {
      rusty: { gold: 6500, heal: 1700, face: 1700, bauble: 92, relic: 6, forgeDiscount: 2 },
      copper: { gold: 5700, heal: 1600, face: 2000, bauble: 575, relic: 80, forgeDiscount: 10 },
      bronze: { gold: 5000, heal: 1500, face: 2300, bauble: 1000, relic: 175, forgeDiscount: 25 },
      iron: { gold: 4200, heal: 1250, face: 2500, bauble: 1550, relic: 340, forgeDiscount: 60 },
      silver: { gold: 3500, heal: 1050, face: 2700, bauble: 2100, relic: 550, forgeDiscount: 100 },
      gold: { gold: 2300, heal: 750, face: 2900, bauble: 2800, relic: 1050, forgeDiscount: 200 },
      diamond: { gold: 1900, heal: 580, face: 2850, bauble: 2950, relic: 1450, forgeDiscount: 270 },
      jackpot: { gold: 1600, heal: 450, face: 2800, bauble: 3000, relic: 1850, forgeDiscount: 300 },
    } as Record<CasinoChestTier, Record<'gold' | 'heal' | 'face' | 'bauble' | 'relic' | 'forgeDiscount', number>>,
    rarityWeightsByTier: {
      rusty: { common: 8800, rare: 1120, epic: 75, legendary: 5 },
      copper: { common: 7900, rare: 1800, epic: 280, legendary: 20 },
      bronze: { common: 6900, rare: 2500, epic: 560, legendary: 40 },
      iron: { common: 5800, rare: 3050, epic: 1050, legendary: 100 },
      silver: { common: 4700, rare: 3600, epic: 1500, legendary: 200 },
      gold: { common: 2600, rare: 3600, epic: 3000, legendary: 800 },
      diamond: { common: 1900, rare: 3200, epic: 3400, legendary: 1500 },
      jackpot: { common: 1400, rare: 2800, epic: 3800, legendary: 2000 },
    } as Record<CasinoChestTier, Record<Rarity, number>>,
    forgeDiscountByTier: {
      rusty: 0.05,
      copper: 0.06,
      bronze: 0.08,
      iron: 0.1,
      silver: 0.12,
      gold: 0.18,
      diamond: 0.22,
      jackpot: 0.25,
    } as Record<CasinoChestTier, number>,
  },

  faceUpgrade: {
    tierScaling: {
      scalePerTier: 0.2,
      particlesPerTier: 0.25,
      brightnessPerTier: 0.1,
    },
    weaponTempo: {
      quick: { castDelay: 0.02, recovery: 0, shotInterval: 0.035 },
      standard: { castDelay: 0.04, recovery: 0.08, shotInterval: 0.05 },
      deliberate: { castDelay: 0.08, recovery: 0.18, shotInterval: 0.065 },
      heavy: { castDelay: 0.16, recovery: 0.42, shotInterval: 0.08 },
      artillery: { castDelay: 0.22, recovery: 0.62, shotInterval: 0.1 },
      legendary: { castDelay: 0.28, recovery: 0.82, shotInterval: 0.11 },
    },
    weaponPrices: {
      cheapCommon: [10, 34, 82],
      standardCommon: [12, 38, 90],
      premiumCommon: [15, 46, 110],
      standardRare: [24, 72, 175],
      premiumRare: [30, 88, 210],
      standardEpic: [48, 150, 360],
      premiumEpic: [60, 180, 430],
      controlEpic: [66, 200, 480],
      standardLegendary: [95, 310, 740],
      premiumLegendary: [118, 360, 850],
      controlLegendary: [125, 390, 900],
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
