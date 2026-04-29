import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "lance",
    name: "Lance",
    description: "Single huge shot that becomes a lane-clearing meteor.",
    chainId: "lance",
    rank: 1,
    upgradesTo: "lance_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['projectile', 'heavy', 'pierce'],
    animation: {
    cast: 'heavy_windup',
    projectile: 'lance_trail',
    hit: 'impact_smash',
    evolution: 'meteor_crash',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, size: 2 }], damageMul: 3.0 },
  },
  {
    id: "lance_ii",
    name: "Comet Lance",
    description: "Single huge shot that becomes a lane-clearing meteor. Refined into Comet Lance.",
    chainId: "lance",
    rank: 2,
    upgradesFrom: "lance",
    upgradesTo: "lance_iii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['projectile', 'heavy', 'pierce'],
    animation: {
    cast: 'heavy_windup',
    projectile: 'lance_trail',
    hit: 'impact_smash',
    evolution: 'meteor_crash',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, pierce: 3, size: 2.35 }, { verb: 'pulse', radius: 30, damageMul: 0.3, knockback: 16 }], damageMul: 5.25 },
  },
  {
    id: "lance_iii",
    name: "Meteor",
    description: "Impact AoE with a flame pillar at the crash site.",
    chainId: "lance",
    rank: 3,
    upgradesFrom: "lance_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['projectile', 'heavy', 'pierce'],
    animation: {
    cast: 'heavy_windup',
    projectile: 'lance_trail',
    hit: 'impact_smash',
    evolution: 'meteor_crash',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, pierce: 99, size: 2.8, element: 'fire' }, { verb: 'pulse', radius: 60, damageMul: 0.8, element: 'fire', knockback: 35 }, { verb: 'flamePillar', count: 1, radius: 30, damageMul: 0.9, duration: 1.1, burnDps: 8, burnDur: 3 }, { verb: 'pulse', radius: 60, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 3, duration: 3 }], damageMul: 7.5, note: 'Meteor' },
  }
];

export default upgrades;
