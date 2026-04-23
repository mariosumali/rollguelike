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
    { effects: [{ verb: 'applyStatus', status: 'burn', power: 1, duration: 1 }], damageMul: 1.0 },
    { effects: [{ verb: 'applyStatus', status: 'burn', power: 2, duration: 1.5 }], damageMul: 1.0 },
    { effects: [{ verb: 'applyStatus', status: 'burn', power: 3, duration: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'applyStatus', status: 'burn', power: 4, duration: 2.5 }], damageMul: 1.0 },
    { effects: [{ verb: 'applyStatus', status: 'burn', power: 6, duration: 3 }], damageMul: 1.0, note: 'Wildfire' },
  ],
};

export default upgrade;
