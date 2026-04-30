import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { epic: prices.premiumEpic };

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
    effect: { effects: [{ verb: 'modifyProjectile', aoeOnHit: 28 }, { verb: 'fireProjectile', count: 1, pierce: 1, speed: 2.0, lifeMul: 1.2, size: 1.45, damageMul: 2.95 }], damageMul: 1.0, timing: tempo.heavy },
    basePrice,
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
    effect: { effects: [{ verb: 'modifyProjectile', aoeOnHit: 42 }, { verb: 'fireProjectile', count: 1, pierce: 3, speed: 2.1, lifeMul: 1.28, size: 1.7, damageMul: 3.8 }, { verb: 'pulse', radius: 38, damageMul: 0.45, knockback: 24 }], damageMul: 1.04, timing: tempo.artillery },
    basePrice,
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
    effect: { effects: [{ verb: 'modifyProjectile', aoeOnHit: 58 }, { verb: 'fireProjectile', count: 1, pierce: 99, speed: 2.2, lifeMul: 1.35, size: 2.05, damageMul: 5.0, element: 'fire' }, { verb: 'pulse', radius: 72, damageMul: 0.85, element: 'fire', knockback: 45 }, { verb: 'flamePillar', count: 1, radius: 38, damageMul: 0.9, duration: 1.3, burnDps: 9, burnDur: 4 }, { verb: 'applyStatus', status: 'burn', power: 5, duration: 4 }], damageMul: 1.08, timing: tempo.legendary, note: 'Meteor' },
    basePrice,
  }
];

export default upgrades;
