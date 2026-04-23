import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'std_shot',
  name: 'Standard Shot',
  kind: 'replacer',
  rarity: 'common',
  description: 'Reliable projectile volley. Counts scale with tier.',
  tags: ['projectile'],
  animation: {
    cast: 'muzzle_flash',
    projectile: 'std_proj',
    hit: 'std_burst',
    evolution: 'volley_burst',
  },
  evolution: {
    name: 'Volley',
    flavor: 'Fan of six.',
    extraEffects: [{ verb: 'fireProjectile', count: 0, spread: Math.PI / 2 }],
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 3 }], damageMul: 1.05 },
    { effects: [{ verb: 'fireProjectile', count: 4 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 5 }], damageMul: 1.15 },
    { effects: [{ verb: 'fireProjectile', count: 6, spread: Math.PI / 2 }], damageMul: 1.25, note: 'Volley' },
  ],
};

export default upgrade;
