import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'chill_tip',
  name: 'Chill Tip',
  kind: 'supplement',
  rarity: 'common',
  description: 'Frost-rimed tip applies a slow on contact.',
  tags: ['supplement', 'slow', 'ice', 'elemental'],
  animation: {
    cast: 'frost_cast',
    hit: 'frost_shatter',
    evolution: 'zero_freeze',
  },
  evolution: {
    name: 'Cryo Tip',
    flavor: 'Long enough slow triggers a brief freeze.',
    extraEffects: [{ verb: 'applyStatus', status: 'freeze', power: 1, duration: 0.4, chance: 0.25 }],
  },
  tiers: [
    { effects: [{ verb: 'applyStatus', status: 'slow', power: 2, duration: 1 }], damageMul: 1.0 },
    { effects: [{ verb: 'applyStatus', status: 'slow', power: 2, duration: 1.5 }], damageMul: 1.0 },
    { effects: [{ verb: 'applyStatus', status: 'slow', power: 3, duration: 1.5 }], damageMul: 1.0 },
    { effects: [{ verb: 'applyStatus', status: 'slow', power: 3, duration: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'applyStatus', status: 'slow', power: 4, duration: 2.5 }], damageMul: 1.0, note: 'Cryo Tip' },
  ],
};

export default upgrade;
