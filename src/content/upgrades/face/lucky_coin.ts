import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'lucky_coin',
  name: 'Lucky Coin',
  kind: 'supplement',
  rarity: 'common',
  description: 'Kills from this slot occasionally shower coins.',
  tags: ['supplement', 'gold', 'economy'],
  animation: {
    cast: 'muzzle_flash',
    hit: 'coin_sparkle',
    evolution: 'midas_shower',
  },
  evolution: {
    name: 'Midas Shower',
    flavor: 'Every kill drops at least one coin; jackpots fountain.',
    extraEffects: [{ verb: 'spawnPickup', kind: 'gold', amount: 1, chance: 1.0 }],
  },
  tiers: [
    { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 1, chance: 0.08 }], damageMul: 1.0 },
    { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 1, chance: 0.15 }], damageMul: 1.0 },
    { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 2, chance: 0.22 }], damageMul: 1.0 },
    { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 2, chance: 0.32 }], damageMul: 1.0 },
    { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 3, chance: 0.45 }, { verb: 'spawnPickup', kind: 'gold', amount: 1, chance: 1.0 }], damageMul: 1.0, note: 'Midas Shower' },
  ],
};

export default upgrade;
