import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'template_upgrade',
  name: 'Template Upgrade',
  kind: 'replacer',
  rarity: 'common',
  description: 'Copy this file, rename the filename and id, and fill in one concrete effect row.',
  chainId: 'template_upgrade',
  rank: 1,
  // For chained upgrades, set `upgradesFrom` to the previous concrete id and
  // `upgradesTo` to the next concrete id.
  tags: [],
  animation: {
    cast: 'muzzle_flash',
    projectile: 'std_proj',
    hit: 'std_burst',
  },
  effect: { effects: [{ verb: 'fireProjectile', count: 1 }], damageMul: 1.0 },
};

export default upgrade;
