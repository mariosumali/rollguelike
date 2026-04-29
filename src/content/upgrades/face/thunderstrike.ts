import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "thunderstrike",
    name: "Thunderstrike",
    description: "Columns of lightning on chosen foes.",
    chainId: "thunderstrike",
    rank: 1,
    upgradesTo: "thunderstrike_ii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['lightning', 'column', 'aoe'],
    animation: {
    cast: 'thunder_cast',
    hit: 'thunder_column',
    evolution: 'zeus_double',
  },
    effect: { effects: [{ verb: 'column', count: 1, delay: 0.15, damageMul: 2.5 }], damageMul: 1.0 },
  },
  {
    id: "thunderstrike_ii",
    name: "Zeus Spark",
    description: "Columns of lightning on chosen foes. Refined into Zeus Spark.",
    chainId: "thunderstrike",
    rank: 2,
    upgradesFrom: "thunderstrike",
    upgradesTo: "thunderstrike_iii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['lightning', 'column', 'aoe'],
    animation: {
    cast: 'thunder_cast',
    hit: 'thunder_column',
    evolution: 'zeus_double',
  },
    effect: { effects: [{ verb: 'column', count: 2, delay: 0.18, damageMul: 4.0, stunDur: 0.4 }], damageMul: 1.0 },
  },
  {
    id: "thunderstrike_iii",
    name: "Zeus's Wrath",
    description: "Triggers twice.",
    chainId: "thunderstrike",
    rank: 3,
    upgradesFrom: "thunderstrike_ii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['lightning', 'column', 'aoe'],
    animation: {
    cast: 'thunder_cast',
    hit: 'thunder_column',
    evolution: 'zeus_double',
  },
    effect: { effects: [{ verb: 'column', count: 3, delay: 0.2, damageMul: 6.5, stunDur: 0.5, chainToExtra: 4 }, { verb: 'column', count: 3, delay: 0.2, damageMul: 6.5 }], damageMul: 1.0, note: "Zeus's Wrath" },
  }
];

export default upgrades;
