import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "transmute",
    name: "Transmute",
    description: "Alchemist only. Two same-element rolls within 2s spawn gold; evolution also heals.",
    chainId: "transmute",
    rank: 1,
    upgradesTo: "transmute_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'alchemist', 'gold', 'economy'],
    characterExclusive: 'alchemist',
    animation: {
    cast: 'transmute_glow',
    hit: 'coin_sparkle',
    evolution: 'midas_glow',
  },
    effect: { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 2, chance: 1.0 }], damageMul: 1.0, params: { requireMatch: 2, windowSec: 2 } },
  },
  {
    id: "transmute_ii",
    name: "Golden Transmute",
    description: "Alchemist only. Two same-element rolls within 2s spawn gold; evolution also heals. Refined into Golden Transmute.",
    chainId: "transmute",
    rank: 2,
    upgradesFrom: "transmute",
    upgradesTo: "transmute_iii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'alchemist', 'gold', 'economy'],
    characterExclusive: 'alchemist',
    animation: {
    cast: 'transmute_glow',
    hit: 'coin_sparkle',
    evolution: 'midas_glow',
  },
    effect: { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 4, chance: 1.0 }], damageMul: 1.0, params: { requireMatch: 2, windowSec: 2.5 } },
  },
  {
    id: "transmute_iii",
    name: "Philosopher's Spark",
    description: "Also heals on trigger and doubles gold on fire reactions.",
    chainId: "transmute",
    rank: 3,
    upgradesFrom: "transmute_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'alchemist', 'gold', 'economy'],
    characterExclusive: 'alchemist',
    animation: {
    cast: 'transmute_glow',
    hit: 'coin_sparkle',
    evolution: 'midas_glow',
  },
    effect: { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 6, chance: 1.0 }, { verb: 'heal', amount: 4 }, { verb: 'heal', amount: 4 }], damageMul: 1.0, params: { requireMatch: 2, windowSec: 3 }, note: "Philosopher's Spark" },
  }
];

export default upgrades;
