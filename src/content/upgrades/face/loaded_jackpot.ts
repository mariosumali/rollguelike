import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "loaded_jackpot",
    name: "Loaded Jackpot",
    description: "Gambler only. Loads the slot with high-variance crit bursts.",
    chainId: "loaded_jackpot",
    rank: 1,
    upgradesTo: "loaded_jackpot_ii",
    kind: 'supplement',
    rarity: 'legendary',
    tags: ['supplement', 'gambler', 'crit', 'burst'],
    characterExclusive: 'gambler',
    animation: { cast: 'fortune_swirl', projectile: 'std_proj', hit: 'jackpot_crack', evolution: 'midas_shower' },
    icon: ['..............','.....xxxx.....','...xxxyyxxx...','..xx111111xx..','..xy199991yx..','..xy199991yx..','..xx111111xx..','...xxxyyxxx...','.....xxxx.....','......y.......','.....y.y......','..............','..............','..............'],
    effect: { effects: [{ verb: 'modifyProjectile', crit: 0.25, damageMul: 1.05 }, { verb: 'spawnPickup', kind: 'gold', amount: 1, chance: 0.25 }], damageMul: 1.0, params: { gambitBonusCrit: 0.05 } },
  },
  {
    id: "loaded_jackpot_ii",
    name: "Loaded Payout",
    description: "Gambler only. Loads the slot with high-variance crit bursts. Refined into Loaded Payout.",
    chainId: "loaded_jackpot",
    rank: 2,
    upgradesFrom: "loaded_jackpot",
    upgradesTo: "loaded_jackpot_iii",
    kind: 'supplement',
    rarity: 'legendary',
    tags: ['supplement', 'gambler', 'crit', 'burst'],
    characterExclusive: 'gambler',
    animation: { cast: 'fortune_swirl', projectile: 'std_proj', hit: 'jackpot_crack', evolution: 'midas_shower' },
    icon: ['..............','.....xxxx.....','...xxxyyxxx...','..xx111111xx..','..xy199991yx..','..xy199991yx..','..xx111111xx..','...xxxyyxxx...','.....xxxx.....','......y.......','.....y.y......','..............','..............','..............'],
    effect: { effects: [{ verb: 'modifyProjectile', crit: 0.4, extra: 1, damageMul: 0.95 }, { verb: 'spawnPickup', kind: 'gold', amount: 2, chance: 0.35 }], damageMul: 1.0, params: { gambitBonusCrit: 0.08 } },
  },
  {
    id: "loaded_jackpot_iii",
    name: "House Edge",
    description: "The jackpot always throws an extra coin.",
    chainId: "loaded_jackpot",
    rank: 3,
    upgradesFrom: "loaded_jackpot_ii",
    kind: 'supplement',
    rarity: 'legendary',
    tags: ['supplement', 'gambler', 'crit', 'burst'],
    characterExclusive: 'gambler',
    animation: { cast: 'fortune_swirl', projectile: 'std_proj', hit: 'jackpot_crack', evolution: 'midas_shower' },
    icon: ['..............','.....xxxx.....','...xxxyyxxx...','..xx111111xx..','..xy199991yx..','..xy199991yx..','..xx111111xx..','...xxxyyxxx...','.....xxxx.....','......y.......','.....y.y......','..............','..............','..............'],
    effect: { effects: [{ verb: 'modifyProjectile', crit: 0.6, extra: 2, damageMul: 0.85 }, { verb: 'spawnPickup', kind: 'gold', amount: 4, chance: 0.5 }, { verb: 'pulse', radius: 32, damageMul: 0.35, element: 'arcane' }, { verb: 'spawnPickup', kind: 'gold', amount: 3, chance: 0.35 }], damageMul: 1.0, note: 'House Edge' },
  }
];

export default upgrades;
