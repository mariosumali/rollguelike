import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "lucky_coin",
    name: "Lucky Coin",
    description: "Kills from this slot occasionally shower coins.",
    chainId: "lucky_coin",
    rank: 1,
    upgradesTo: "lucky_coin_ii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'gold', 'economy'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'coin_sparkle',
    evolution: 'midas_shower',
  },
    effect: { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 1, chance: 0.08 }], damageMul: 1.0 },
  },
  {
    id: "lucky_coin_ii",
    name: "Gilded Coin",
    description: "Kills from this slot occasionally shower coins. Refined into Gilded Coin.",
    chainId: "lucky_coin",
    rank: 2,
    upgradesFrom: "lucky_coin",
    upgradesTo: "lucky_coin_iii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'gold', 'economy'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'coin_sparkle',
    evolution: 'midas_shower',
  },
    effect: { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 2, chance: 0.22 }], damageMul: 1.0 },
  },
  {
    id: "lucky_coin_iii",
    name: "Midas Shower",
    description: "Every kill drops at least one coin; jackpots fountain.",
    chainId: "lucky_coin",
    rank: 3,
    upgradesFrom: "lucky_coin_ii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'gold', 'economy'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'coin_sparkle',
    evolution: 'midas_shower',
  },
    effect: { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 3, chance: 0.45 }, { verb: 'spawnPickup', kind: 'gold', amount: 1, chance: 1.0 }, { verb: 'spawnPickup', kind: 'gold', amount: 1, chance: 1.0 }], damageMul: 1.0, note: 'Midas Shower' },
  }
];

export default upgrades;
