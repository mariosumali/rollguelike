import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'shrapnel',
  name: 'Shrapnel',
  kind: 'supplement',
  rarity: 'common',
  description: 'Chance on hit to burst shrapnel outward.',
  tags: ['supplement', 'aoe'],
  animation: {
    cast: 'muzzle_flash',
    hit: 'shrapnel_burst',
    evolution: 'frag_always',
  },
  evolution: {
    name: 'Fragmentation',
    flavor: 'Always triggers.',
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 2, spread: 60, damageMul: 0.4 }], damageMul: 1.0, params: { chance: 0.2 } },
    { effects: [{ verb: 'fireProjectile', count: 3, spread: 80, damageMul: 0.5 }], damageMul: 1.0, params: { chance: 0.4 } },
    { effects: [{ verb: 'fireProjectile', count: 4, spread: 120, damageMul: 0.6 }], damageMul: 1.0, params: { chance: 1.0 }, note: 'Fragmentation' },
  ],
};

export default upgrade;
