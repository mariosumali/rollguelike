import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "gold_bite",
    name: "Gold Bite",
    description: "Kills from this slot drop bonus gold.",
    chainId: "gold_bite",
    rank: 1,
    upgradesTo: "gold_bite_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'gold', 'economy'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'coin_sparkle',
    evolution: 'midas_glow',
  },
    effect: { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 1, chance: 0.1 }], damageMul: 1.0 },
  },
  {
    id: "gold_bite_ii",
    name: "Midas Bite",
    description: "Kills from this slot drop bonus gold. Refined into Midas Bite.",
    chainId: "gold_bite",
    rank: 2,
    upgradesFrom: "gold_bite",
    upgradesTo: "gold_bite_iii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'gold', 'economy'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'coin_sparkle',
    evolution: 'midas_glow',
  },
    effect: { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 2, chance: 0.3 }], damageMul: 1.0 },
  },
  {
    id: "gold_bite_iii",
    name: "Midas Touch",
    description: "Guaranteed +1g on any kill from this slot.",
    chainId: "gold_bite",
    rank: 3,
    upgradesFrom: "gold_bite_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'gold', 'economy'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'coin_sparkle',
    evolution: 'midas_glow',
  },
    effect: { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 3, chance: 0.55 }, { verb: 'spawnPickup', kind: 'gold', amount: 1, chance: 1.0 }], damageMul: 1.0, note: 'Midas Touch' },
  }
];

export default upgrades;
