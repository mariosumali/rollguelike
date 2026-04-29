import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'ember',
  name: 'Ember',
  kind: 'supplement',
  rarity: 'rare',
  description: 'Applies a burn DoT on hit.',
  tags: ['supplement', 'burn', 'fire', 'elemental'],
  animation: {
    cast: 'fire_cast',
    hit: 'fire_burst',
    evolution: 'wildfire_spread',
  },
  evolution: {
    name: 'Wildfire',
    flavor: 'On kill, burn spreads to nearest enemy.',
  },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', burnDps: 4, burnDur: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', burnDps: 7, burnDur: 3 }, { verb: 'flamePillar', count: 1, radius: 18, damageMul: 0.45, duration: 0.8 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', burnDps: 10, burnDur: 4 }, { verb: 'flamePillar', count: 2, radius: 22, damageMul: 0.55, duration: 1, delay: 0.16 }], damageMul: 1.0, note: 'Wildfire' },
  ],
};

export default upgrade;
