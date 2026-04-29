import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'loaded_jackpot',
  name: 'Loaded Jackpot',
  kind: 'supplement',
  rarity: 'legendary',
  description: 'Gambler only. Loads the slot with high-variance crit bursts.',
  tags: ['supplement', 'gambler', 'crit', 'burst'],
  characterExclusive: 'gambler',
  animation: { cast: 'fortune_swirl', projectile: 'std_proj', hit: 'jackpot_crack', evolution: 'midas_shower' },
  evolution: { name: 'House Edge', flavor: 'The jackpot always throws an extra coin.', extraEffects: [{ verb: 'spawnPickup', kind: 'gold', amount: 3, chance: 0.35 }] },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', crit: 0.25, damageMul: 1.05 }, { verb: 'spawnPickup', kind: 'gold', amount: 1, chance: 0.25 }], damageMul: 1.0, params: { gambitBonusCrit: 0.05 } },
    { effects: [{ verb: 'modifyProjectile', crit: 0.4, extra: 1, damageMul: 0.95 }, { verb: 'spawnPickup', kind: 'gold', amount: 2, chance: 0.35 }], damageMul: 1.0, params: { gambitBonusCrit: 0.08 } },
    { effects: [{ verb: 'modifyProjectile', crit: 0.6, extra: 2, damageMul: 0.85 }, { verb: 'spawnPickup', kind: 'gold', amount: 4, chance: 0.5 }, { verb: 'pulse', radius: 32, damageMul: 0.35, element: 'arcane' }], damageMul: 1.0, note: 'House Edge' },
  ],
  icon: ['..............','.....xxxx.....','...xxxyyxxx...','..xx111111xx..','..xy199991yx..','..xy199991yx..','..xx111111xx..','...xxxyyxxx...','.....xxxx.....','......y.......','.....y.y......','..............','..............','..............'],
};

export default upgrade;
