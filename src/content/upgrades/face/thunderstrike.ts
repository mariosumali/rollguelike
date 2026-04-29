import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { legendary: prices.premiumLegendary };

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
    effect: { effects: [{ verb: 'column', count: 1, delay: 0.18, damageMul: 2.35 }], damageMul: 1.0, timing: tempo.artillery },
    basePrice,
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
    effect: { effects: [{ verb: 'column', count: 2, delay: 0.2, damageMul: 3.3, stunDur: 0.35 }], damageMul: 1.0, timing: tempo.legendary },
    basePrice,
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
    effect: { effects: [{ verb: 'column', count: 4, delay: 0.22, damageMul: 4.4, stunDur: 0.45, chainToExtra: 4 }], damageMul: 1.0, timing: tempo.legendary, note: "Zeus's Wrath" },
    basePrice,
  }
];

export default upgrades;
