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
    { effects: [{ verb: 'statusAura', status: 'slow', radius: 34, power: 0.3, duration: 1.2 }], damageMul: 1.0 },
    { effects: [{ verb: 'statusAura', status: 'slow', radius: 46, power: 0.45, duration: 1.8 }], damageMul: 1.0 },
    { effects: [{ verb: 'statusAura', status: 'slow', radius: 58, power: 0.6, duration: 2.4 }, { verb: 'frostBurst', radius: 40, damageMul: 0.25, freezeDur: 0.45, slow: 0.6 }], damageMul: 1.0, note: 'Cryo Tip' },
  ],
};

export default upgrade;
