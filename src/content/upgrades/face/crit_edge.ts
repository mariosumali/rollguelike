import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'crit_edge',
  name: 'Crit Edge',
  kind: 'supplement',
  rarity: 'common',
  description: 'Sharpens this slot for a chance to land devastating hits.',
  tags: ['supplement', 'crit'],
  animation: {
    cast: 'muzzle_flash',
    hit: 'pierce_spark',
    evolution: 'pierce_spark',
  },
  evolution: {
    name: 'Deadly Edge',
    flavor: 'Crits ignore armor entirely.',
    extraEffects: [{ verb: 'modifyProjectile', crit: 0.15, damageMul: 1.1 }],
  },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', crit: 0.05 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', crit: 0.1 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', crit: 0.15 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', crit: 0.22 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', crit: 0.3, damageMul: 1.1 }], damageMul: 1.0, note: 'Deadly Edge' },
  ],
};

export default upgrade;
