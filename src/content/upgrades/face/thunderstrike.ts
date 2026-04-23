import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'thunderstrike',
  name: 'Thunderstrike',
  kind: 'replacer',
  rarity: 'legendary',
  description: 'Columns of lightning on chosen foes.',
  tags: ['lightning', 'column', 'aoe'],
  animation: {
    cast: 'thunder_cast',
    hit: 'thunder_column',
    evolution: 'zeus_double',
  },
  evolution: {
    name: "Zeus's Wrath",
    flavor: 'Triggers twice.',
    extraEffects: [{ verb: 'column', count: 3, delay: 0.2, damageMul: 6.5 }],
  },
  tiers: [
    { effects: [{ verb: 'column', count: 1, delay: 0.15, damageMul: 2.5 }], damageMul: 1.0 },
    { effects: [{ verb: 'column', count: 1, delay: 0.15, damageMul: 3.5, stunDur: 0.3 }], damageMul: 1.0 },
    { effects: [{ verb: 'column', count: 2, delay: 0.18, damageMul: 4.0, stunDur: 0.4 }], damageMul: 1.0 },
    { effects: [{ verb: 'column', count: 2, delay: 0.2, damageMul: 5.0, stunDur: 0.4, chainToExtra: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'column', count: 3, delay: 0.2, damageMul: 6.5, stunDur: 0.5, chainToExtra: 4 }], damageMul: 1.0, note: "Zeus's Wrath" },
  ],
};

export default upgrade;
