import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'transmute',
  name: 'Transmute',
  kind: 'supplement',
  rarity: 'rare',
  description: "Alchemist only. Two same-element rolls within 2s spawn gold; evolution also heals.",
  tags: ['supplement', 'alchemist', 'gold', 'economy'],
  characterExclusive: 'alchemist',
  animation: {
    cast: 'transmute_glow',
    hit: 'coin_sparkle',
    evolution: 'midas_glow',
  },
  evolution: {
    name: "Philosopher's Spark",
    flavor: 'Also heals on trigger and doubles gold on fire reactions.',
    extraEffects: [{ verb: 'heal', amount: 4 }],
  },
  tiers: [
    { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 2, chance: 1.0 }], damageMul: 1.0, params: { requireMatch: 2, windowSec: 2 } },
    { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 3, chance: 1.0 }], damageMul: 1.0, params: { requireMatch: 2, windowSec: 2 } },
    { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 4, chance: 1.0 }], damageMul: 1.0, params: { requireMatch: 2, windowSec: 2.5 } },
    { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 5, chance: 1.0 }], damageMul: 1.0, params: { requireMatch: 2, windowSec: 2.5 } },
    { effects: [{ verb: 'spawnPickup', kind: 'gold', amount: 6, chance: 1.0 }, { verb: 'heal', amount: 4 }], damageMul: 1.0, params: { requireMatch: 2, windowSec: 3 }, note: "Philosopher's Spark" },
  ],
};

export default upgrade;
