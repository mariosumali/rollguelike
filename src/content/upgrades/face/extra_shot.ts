import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'extra_shot',
  name: 'Extra Shot',
  kind: 'supplement',
  rarity: 'common',
  description: 'Adds extra projectiles to whatever this slot fires.',
  tags: ['supplement', 'multishot'],
  animation: {
    cast: 'muzzle_flash',
    hit: 'std_burst',
    evolution: 'salvo_home',
  },
  evolution: {
    name: 'Salvo',
    flavor: 'Extras gently home.',
    extraEffects: [{ verb: 'modifyProjectile', extra: 0, homing: true }],
  },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', extra: 1 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', extra: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', extra: 3 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', extra: 4 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', extra: 5, homing: true }], damageMul: 1.0, note: 'Salvo' },
  ],
};

export default upgrade;
