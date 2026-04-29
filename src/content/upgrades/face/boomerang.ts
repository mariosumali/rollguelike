import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'boomerang',
  name: 'Boomerang',
  kind: 'replacer',
  rarity: 'rare',
  description: 'Projectile that arcs out and returns, hitting on both legs.',
  tags: ['projectile', 'return', 'multihit'],
  animation: {
    cast: 'whirl_cast',
    projectile: 'boomer_proj',
    hit: 'whirl_hit',
    evolution: 'phantom_loop',
  },
  evolution: {
    name: 'Phantom Loop',
    flavor: 'Returns twice, leaving an echo loop.',
    extraEffects: [{ verb: 'fireProjectile', count: 1, bounce: 3, pierce: 2 }],
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, bounce: 1, pierce: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 2, bounce: 1, pierce: 3, spread: Math.PI / 8 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 3, bounce: 2, pierce: 4, spread: Math.PI / 6 }], damageMul: 1.25, note: 'Phantom Loop' },
  ],
};

export default upgrade;
