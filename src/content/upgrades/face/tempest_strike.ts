import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'tempest_strike',
  name: 'Tempest Strike',
  kind: 'replacer',
  rarity: 'legendary',
  description: 'Staggered thunder columns that also chill their targets.',
  tags: ['lightning', 'ice', 'column', 'aoe'],
  animation: {
    cast: 'thunder_cast',
    hit: 'thunder_column',
    evolution: 'tempest_spiral',
  },
  evolution: {
    name: 'Tempest Spiral',
    flavor: 'Columns chain outward in a spiral.',
    extraEffects: [{ verb: 'column', count: 2, delay: 0.25, damageMul: 5.0, chainToExtra: 3 }],
  },
  tiers: [
    { effects: [{ verb: 'column', count: 1, delay: 0.18, damageMul: 3.0 }, { verb: 'applyStatus', status: 'slow', power: 0.4, duration: 1.5 }], damageMul: 1.0 },
    { effects: [{ verb: 'column', count: 2, delay: 0.2, damageMul: 4.0, stunDur: 0.2 }, { verb: 'frostBurst', radius: 38, damageMul: 0.35, freezeDur: 0.45, slow: 0.55 }], damageMul: 1.0 },
    { effects: [{ verb: 'column', count: 4, delay: 0.22, damageMul: 5.5, stunDur: 0.4, chainToExtra: 2 }, { verb: 'frostBurst', radius: 58, damageMul: 0.55, freezeDur: 0.9, slow: 0.7 }], damageMul: 1.0, note: 'Tempest Spiral' },
  ],
};

export default upgrade;
