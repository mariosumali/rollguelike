import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "ember",
    name: "Ember",
    description: "Applies a burn DoT on hit.",
    chainId: "ember",
    rank: 1,
    upgradesTo: "ember_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'burn', 'fire', 'elemental'],
    animation: {
    cast: 'fire_cast',
    hit: 'fire_burst',
    evolution: 'wildfire_spread',
  },
    effect: { effects: [{ verb: 'modifyProjectile', burnDps: 4, burnDur: 2 }], damageMul: 1.0 },
  },
  {
    id: "ember_ii",
    name: "Kindled Ember",
    description: "Applies a burn DoT on hit. Refined into Kindled Ember.",
    chainId: "ember",
    rank: 2,
    upgradesFrom: "ember",
    upgradesTo: "ember_iii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'burn', 'fire', 'elemental'],
    animation: {
    cast: 'fire_cast',
    hit: 'fire_burst',
    evolution: 'wildfire_spread',
  },
    effect: { effects: [{ verb: 'modifyProjectile', burnDps: 7, burnDur: 3 }, { verb: 'flamePillar', count: 1, radius: 18, damageMul: 0.45, duration: 0.8 }], damageMul: 1.0 },
  },
  {
    id: "ember_iii",
    name: "Wildfire",
    description: "On kill, burn spreads to nearest enemy.",
    chainId: "ember",
    rank: 3,
    upgradesFrom: "ember_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'burn', 'fire', 'elemental'],
    animation: {
    cast: 'fire_cast',
    hit: 'fire_burst',
    evolution: 'wildfire_spread',
  },
    effect: { effects: [{ verb: 'modifyProjectile', burnDps: 10, burnDur: 4 }, { verb: 'flamePillar', count: 2, radius: 22, damageMul: 0.55, duration: 1, delay: 0.16 }], damageMul: 1.0, note: 'Wildfire' },
  }
];

export default upgrades;
