import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'lance',
  name: 'Lance',
  kind: 'replacer',
  rarity: 'epic',
  description: 'Single huge shot that becomes a lane-clearing meteor.',
  tags: ['projectile', 'heavy', 'pierce'],
  animation: {
    cast: 'heavy_windup',
    projectile: 'lance_trail',
    hit: 'impact_smash',
    evolution: 'meteor_crash',
  },
  evolution: {
    name: 'Meteor',
    flavor: 'Impact AoE with a flame pillar at the crash site.',
    extraEffects: [
      { verb: 'pulse', radius: 60, element: 'fire' },
      { verb: 'applyStatus', status: 'burn', power: 3, duration: 3 },
    ],
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, size: 2 }], damageMul: 3.0 },
    { effects: [{ verb: 'fireProjectile', count: 1, pierce: 3, size: 2.35 }, { verb: 'pulse', radius: 30, damageMul: 0.3, knockback: 16 }], damageMul: 5.25 },
    { effects: [{ verb: 'fireProjectile', count: 1, pierce: 99, size: 2.8, element: 'fire' }, { verb: 'pulse', radius: 60, damageMul: 0.8, element: 'fire', knockback: 35 }, { verb: 'flamePillar', count: 1, radius: 30, damageMul: 0.9, duration: 1.1, burnDps: 8, burnDur: 3 }], damageMul: 7.5, note: 'Meteor' },
  ],
};

export default upgrade;
