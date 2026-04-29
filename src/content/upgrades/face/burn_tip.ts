import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "burn_tip",
    name: "Burn Tip",
    description: "Coats this slot with ember to ignite on impact.",
    chainId: "burn_tip",
    rank: 1,
    upgradesTo: "burn_tip_ii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'burn', 'fire', 'elemental'],
    animation: {
    cast: 'fire_cast',
    hit: 'fire_burst',
    evolution: 'wildfire_spread',
  },
    effect: { effects: [{ verb: 'modifyProjectile', burnDps: 3, burnDur: 2 }], damageMul: 1.0 },
  },
  {
    id: "burn_tip_ii",
    name: "Searing Tip",
    description: "Coats this slot with ember to ignite on impact. Refined into Searing Tip.",
    chainId: "burn_tip",
    rank: 2,
    upgradesFrom: "burn_tip",
    upgradesTo: "burn_tip_iii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'burn', 'fire', 'elemental'],
    animation: {
    cast: 'fire_cast',
    hit: 'fire_burst',
    evolution: 'wildfire_spread',
  },
    effect: { effects: [{ verb: 'modifyProjectile', burnDps: 5, burnDur: 3 }, { verb: 'flamePillar', count: 1, radius: 14, damageMul: 0.3, duration: 0.6 }], damageMul: 1.0 },
  },
  {
    id: "burn_tip_iii",
    name: "Inferno Tip",
    description: "Burns spread to the next target on kill.",
    chainId: "burn_tip",
    rank: 3,
    upgradesFrom: "burn_tip_ii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'burn', 'fire', 'elemental'],
    animation: {
    cast: 'fire_cast',
    hit: 'fire_burst',
    evolution: 'wildfire_spread',
  },
    effect: { effects: [{ verb: 'modifyProjectile', burnDps: 8, burnDur: 4 }, { verb: 'flamePillar', count: 2, radius: 18, damageMul: 0.4, duration: 0.8, delay: 0.14 }], damageMul: 1.0, note: 'Inferno Tip' },
  }
];

export default upgrades;
