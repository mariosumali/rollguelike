import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "aqua_bolt",
    name: "Aqua Bolt",
    description: "Bounces between enemies, heals on hit.",
    chainId: "aqua_bolt",
    rank: 1,
    upgradesTo: "aqua_bolt_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'water', 'elemental'],
    animation: {
    cast: 'aqua_cast',
    projectile: 'aqua_proj',
    hit: 'splash_ring',
    evolution: 'tide_pool',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, bounce: 1 }], damageMul: 1.0 },
  },
  {
    id: "aqua_bolt_ii",
    name: "Tidal Bolt",
    description: "Bounces between enemies, heals on hit. Refined into Tidal Bolt.",
    chainId: "aqua_bolt",
    rank: 2,
    upgradesFrom: "aqua_bolt",
    upgradesTo: "aqua_bolt_iii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'water', 'elemental'],
    animation: {
    cast: 'aqua_cast',
    projectile: 'aqua_proj',
    hit: 'splash_ring',
    evolution: 'tide_pool',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, bounce: 2 }, { verb: 'modifyProjectile', lifesteal: 0.05 }], damageMul: 1.1 },
  },
  {
    id: "aqua_bolt_iii",
    name: "Tide Caller",
    description: "Each bounce leaves a heal pickup.",
    chainId: "aqua_bolt",
    rank: 3,
    upgradesFrom: "aqua_bolt_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'water', 'elemental'],
    animation: {
    cast: 'aqua_cast',
    projectile: 'aqua_proj',
    hit: 'splash_ring',
    evolution: 'tide_pool',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, bounce: 5 }, { verb: 'modifyProjectile', lifesteal: 0.15 }, { verb: 'spawnPickup', kind: 'heal', amount: 1, chance: 0.5 }, { verb: 'spawnPickup', kind: 'heal', amount: 1, chance: 1 }], damageMul: 1.25, note: 'Tide Caller' },
  }
];

export default upgrades;
