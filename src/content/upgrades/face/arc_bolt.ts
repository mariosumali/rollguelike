import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "arc_bolt",
    name: "Arc Bolt",
    description: "Lightning visibly jumps between foes.",
    chainId: "arc_bolt",
    rank: 1,
    upgradesTo: "arc_bolt_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'lightning', 'elemental'],
    animation: {
    cast: 'spark_cast',
    projectile: 'arc_proj',
    hit: 'arc_chain',
    evolution: 'storm_chain',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, element: 'lightning' }, { verb: 'chain', maxChains: 2, decay: 0.5 }], damageMul: 1.0 },
  },
  {
    id: "arc_bolt_ii",
    name: "Forked Bolt",
    description: "Lightning visibly jumps between foes. Refined into Forked Bolt.",
    chainId: "arc_bolt",
    rank: 2,
    upgradesFrom: "arc_bolt",
    upgradesTo: "arc_bolt_iii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'lightning', 'elemental'],
    animation: {
    cast: 'spark_cast',
    projectile: 'arc_proj',
    hit: 'arc_chain',
    evolution: 'storm_chain',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, element: 'lightning' }, { verb: 'chainLightning', jumps: 3, damageMul: 0.55, radius: 95, stunDur: 0.2 }], damageMul: 1.1 },
  },
  {
    id: "arc_bolt_iii",
    name: "Storm Call",
    description: "The die itself lashes out with a storm web.",
    chainId: "arc_bolt",
    rank: 3,
    upgradesFrom: "arc_bolt_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'lightning', 'elemental'],
    animation: {
    cast: 'spark_cast',
    projectile: 'arc_proj',
    hit: 'arc_chain',
    evolution: 'storm_chain',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, element: 'lightning', spread: Math.PI / 14 }, { verb: 'chainLightning', jumps: 5, damageMul: 0.7, radius: 120, stunDur: 0.35, fromDie: true }, { verb: 'chainLightning', jumps: 5, damageMul: 0.75, radius: 120, stunDur: 0.35, fromDie: true }], damageMul: 1.25, note: 'Storm Call' },
  }
];

export default upgrades;
