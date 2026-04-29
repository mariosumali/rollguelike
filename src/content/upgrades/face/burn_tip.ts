import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'burn_tip',
  name: 'Burn Tip',
  kind: 'supplement',
  rarity: 'common',
  description: 'Coats this slot with ember to ignite on impact.',
  tags: ['supplement', 'burn', 'fire', 'elemental'],
  animation: {
    cast: 'fire_cast',
    hit: 'fire_burst',
    evolution: 'wildfire_spread',
  },
  evolution: {
    name: 'Inferno Tip',
    flavor: 'Burns spread to the next target on kill.',
  },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', burnDps: 3, burnDur: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', burnDps: 5, burnDur: 3 }, { verb: 'flamePillar', count: 1, radius: 14, damageMul: 0.3, duration: 0.6 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', burnDps: 8, burnDur: 4 }, { verb: 'flamePillar', count: 2, radius: 18, damageMul: 0.4, duration: 0.8, delay: 0.14 }], damageMul: 1.0, note: 'Inferno Tip' },
  ],
};

export default upgrade;
