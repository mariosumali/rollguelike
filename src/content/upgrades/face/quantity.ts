import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'quantity',
  name: 'Quantity',
  kind: 'supplement',
  rarity: 'common',
  description: 'Bonus projectiles from face value. The old default, now an opt-in.',
  tags: ['supplement', 'multishot'],
  animation: {
    cast: 'muzzle_flash',
    hit: 'std_burst',
    evolution: 'volley_burst',
  },
  evolution: {
    name: 'Abundance',
    flavor: '+10% crit per bonus projectile.',
    extraEffects: [{ verb: 'modifyProjectile', crit: 0.1 }],
  },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', extra: 1 }], damageMul: 1.0, params: { minValue: 3 } },
    { effects: [{ verb: 'modifyProjectile', extra: 2 }], damageMul: 1.0, params: { valueMul: 0.75 } },
    { effects: [{ verb: 'modifyProjectile', extra: 4, crit: 0.1 }], damageMul: 1.0, params: { valueMul: 1.25 }, note: 'Abundance' },
  ],
};

export default upgrade;
