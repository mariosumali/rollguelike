import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'lance',
  name: 'Lance',
  kind: 'replacer',
  rarity: 'epic',
  description: 'Single-target hammer. One big hit.',
  tags: ['projectile', 'heavy', 'pierce'],
  animation: {
    cast: 'heavy_windup',
    projectile: 'lance_trail',
    hit: 'impact_smash',
    evolution: 'meteor_crash',
  },
  evolution: {
    name: 'Meteor',
    flavor: 'Impact AoE with burn trail.',
    extraEffects: [
      { verb: 'pulse', radius: 60, element: 'fire' },
      { verb: 'applyStatus', status: 'burn', power: 3, duration: 3 },
    ],
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, size: 2 }], damageMul: 3.0 },
    { effects: [{ verb: 'fireProjectile', count: 1, pierce: 1, size: 2 }], damageMul: 4.0 },
    { effects: [{ verb: 'fireProjectile', count: 1, pierce: 2, size: 2.2 }], damageMul: 5.5 },
    { effects: [{ verb: 'fireProjectile', count: 1, pierce: 3, size: 2.4 }], damageMul: 7.0 },
    { effects: [{ verb: 'fireProjectile', count: 1, pierce: 99, size: 2.6 }, { verb: 'pulse', radius: 60, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 3, duration: 3 }], damageMul: 9.0, note: 'Meteor' },
  ],
};

export default upgrade;
