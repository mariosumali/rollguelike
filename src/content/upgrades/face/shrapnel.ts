import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "shrapnel",
    name: "Shrapnel",
    description: "Chance on hit to burst shrapnel outward.",
    chainId: "shrapnel",
    rank: 1,
    upgradesTo: "shrapnel_ii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'aoe'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'shrapnel_burst',
    evolution: 'frag_always',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, spread: 60, damageMul: 0.4 }], damageMul: 1.0, params: { chance: 0.2 } },
  },
  {
    id: "shrapnel_ii",
    name: "Fragment Shell",
    description: "Chance on hit to burst shrapnel outward. Refined into Fragment Shell.",
    chainId: "shrapnel",
    rank: 2,
    upgradesFrom: "shrapnel",
    upgradesTo: "shrapnel_iii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'aoe'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'shrapnel_burst',
    evolution: 'frag_always',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 3, spread: 80, damageMul: 0.5 }], damageMul: 1.0, params: { chance: 0.4 } },
  },
  {
    id: "shrapnel_iii",
    name: "Fragmentation",
    description: "Always triggers.",
    chainId: "shrapnel",
    rank: 3,
    upgradesFrom: "shrapnel_ii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'aoe'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'shrapnel_burst',
    evolution: 'frag_always',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 4, spread: 120, damageMul: 0.6 }], damageMul: 1.0, params: { chance: 1.0 }, note: 'Fragmentation' },
  }
];

export default upgrades;
