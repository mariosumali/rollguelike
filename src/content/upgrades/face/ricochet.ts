import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "ricochet",
    name: "Ricochet",
    description: "Bounces chain-spark between enemies on each rebound.",
    chainId: "ricochet",
    rank: 1,
    upgradesTo: "ricochet_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'bounce', 'chain', 'lightning'],
    animation: {
    cast: 'spark_cast',
    hit: 'arc_chain',
    evolution: 'storm_chain',
  },
    effect: { effects: [{ verb: 'modifyProjectile', bounce: 1 }, { verb: 'chain', maxChains: 1, decay: 0.5 }], damageMul: 1.0 },
  },
  {
    id: "ricochet_ii",
    name: "Bank Shot",
    description: "Bounces chain-spark between enemies on each rebound. Refined into Bank Shot.",
    chainId: "ricochet",
    rank: 2,
    upgradesFrom: "ricochet",
    upgradesTo: "ricochet_iii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'bounce', 'chain', 'lightning'],
    animation: {
    cast: 'spark_cast',
    hit: 'arc_chain',
    evolution: 'storm_chain',
  },
    effect: { effects: [{ verb: 'modifyProjectile', bounce: 2 }, { verb: 'chain', maxChains: 2, decay: 0.4 }], damageMul: 1.0 },
  },
  {
    id: "ricochet_iii",
    name: "Storm Chain",
    description: "Each bounce arcs lightning to a second enemy.",
    chainId: "ricochet",
    rank: 3,
    upgradesFrom: "ricochet_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'bounce', 'chain', 'lightning'],
    animation: {
    cast: 'spark_cast',
    hit: 'arc_chain',
    evolution: 'storm_chain',
  },
    effect: { effects: [{ verb: 'modifyProjectile', bounce: 4 }, { verb: 'chain', maxChains: 3, decay: 0.3 }, { verb: 'chain', maxChains: 3, decay: 0.25 }], damageMul: 1.0, note: 'Storm Chain' },
  }
];

export default upgrades;
