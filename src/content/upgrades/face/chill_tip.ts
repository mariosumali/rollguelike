import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "chill_tip",
    name: "Chill Tip",
    description: "Frost-rimed tip applies a slow on contact.",
    chainId: "chill_tip",
    rank: 1,
    upgradesTo: "chill_tip_ii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'slow', 'ice', 'elemental'],
    animation: {
    cast: 'frost_cast',
    hit: 'frost_shatter',
    evolution: 'zero_freeze',
  },
    effect: { effects: [{ verb: 'statusAura', status: 'slow', radius: 34, power: 0.3, duration: 1.2 }], damageMul: 1.0 },
  },
  {
    id: "chill_tip_ii",
    name: "Frostbite Tip",
    description: "Frost-rimed tip applies a slow on contact. Refined into Frostbite Tip.",
    chainId: "chill_tip",
    rank: 2,
    upgradesFrom: "chill_tip",
    upgradesTo: "chill_tip_iii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'slow', 'ice', 'elemental'],
    animation: {
    cast: 'frost_cast',
    hit: 'frost_shatter',
    evolution: 'zero_freeze',
  },
    effect: { effects: [{ verb: 'statusAura', status: 'slow', radius: 46, power: 0.45, duration: 1.8 }], damageMul: 1.0 },
  },
  {
    id: "chill_tip_iii",
    name: "Cryo Tip",
    description: "Long enough slow triggers a brief freeze.",
    chainId: "chill_tip",
    rank: 3,
    upgradesFrom: "chill_tip_ii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'slow', 'ice', 'elemental'],
    animation: {
    cast: 'frost_cast',
    hit: 'frost_shatter',
    evolution: 'zero_freeze',
  },
    effect: { effects: [{ verb: 'statusAura', status: 'slow', radius: 58, power: 0.6, duration: 2.4 }, { verb: 'frostBurst', radius: 40, damageMul: 0.25, freezeDur: 0.45, slow: 0.6 }, { verb: 'applyStatus', status: 'freeze', power: 1, duration: 0.4, chance: 0.25 }], damageMul: 1.0, note: 'Cryo Tip' },
  }
];

export default upgrades;
