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
    effect: { effects: [{ verb: 'fireProjectile', count: 1, speed: 1.9, lifeMul: 1.15, size: 1.35, damageMul: 2.6 }], damageMul: 1.0, timing: tempo.heavy },
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
    effect: { effects: [{ verb: 'fireProjectile', count: 1, pierce: 2, speed: 2.0, lifeMul: 1.2, size: 1.55, damageMul: 3.35 }, { verb: 'pulse', radius: 26, damageMul: 0.25, knockback: 16 }], damageMul: 1.0, timing: tempo.artillery },
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
    effect: { effects: [{ verb: 'fireProjectile', count: 1, pierce: 99, speed: 2.1, lifeMul: 1.25, size: 1.85, damageMul: 4.4, element: 'fire' }, { verb: 'pulse', radius: 54, damageMul: 0.55, element: 'fire', knockback: 35 }, { verb: 'flamePillar', count: 1, radius: 28, damageMul: 0.7, duration: 1.1, burnDps: 7, burnDur: 3 }, { verb: 'applyStatus', status: 'burn', power: 3, duration: 3 }], damageMul: 1.0, timing: tempo.legendary, note: 'Meteor' },
    basePrice,
  }
];

export default upgrades;
