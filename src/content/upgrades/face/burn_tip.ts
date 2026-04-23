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
    { effects: [{ verb: 'applyStatus', status: 'burn', power: 1, duration: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'applyStatus', status: 'burn', power: 2, duration: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'applyStatus', status: 'burn', power: 2, duration: 3 }], damageMul: 1.0 },
    { effects: [{ verb: 'applyStatus', status: 'burn', power: 3, duration: 3 }], damageMul: 1.0 },
    { effects: [{ verb: 'applyStatus', status: 'burn', power: 4, duration: 4 }], damageMul: 1.0, note: 'Inferno Tip' },
  ],
};

export default upgrade;
