import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'template_upgrade',
  name: 'Template Upgrade',
  kind: 'replacer',
  rarity: 'common',
  description: 'Copy this file, rename the filename and id, and fill in five tier rows.',
  tags: [],
  animation: {
    cast: 'muzzle_flash',
    projectile: 'std_proj',
    hit: 'std_burst',
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 1 }], damageMul: 1.05 },
    { effects: [{ verb: 'fireProjectile', count: 2 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 2 }], damageMul: 1.15 },
    { effects: [{ verb: 'fireProjectile', count: 3 }], damageMul: 1.25 },
  ],
};

export default upgrade;
