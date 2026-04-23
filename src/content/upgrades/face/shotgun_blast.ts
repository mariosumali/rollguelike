import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'shotgun_blast',
  name: 'Shotgun Blast',
  kind: 'replacer',
  rarity: 'common',
  description: 'Tight cone of short-lived pellets. Devastating up close.',
  tags: ['projectile', 'cone', 'shortRange'],
  animation: {
    cast: 'muzzle_flash',
    projectile: 'buck_proj',
    hit: 'buck_spread',
    evolution: 'slug_punch',
  },
  evolution: {
    name: 'Slug',
    flavor: 'Pellets merge into one armor-piercing slug.',
    extraEffects: [{ verb: 'fireProjectile', count: 1, pierce: 3, size: 1.6, damageMul: 1.6 }],
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 3, spread: Math.PI / 6, damageMul: 0.9 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 4, spread: Math.PI / 6, damageMul: 0.9 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 5, spread: Math.PI / 5, damageMul: 0.85 }], damageMul: 1.05 },
    { effects: [{ verb: 'fireProjectile', count: 6, spread: Math.PI / 5, damageMul: 0.85 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 8, spread: Math.PI / 4, damageMul: 0.8 }], damageMul: 1.15, note: 'Slug' },
  ],
};

export default upgrade;
