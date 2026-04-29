import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { legendary: prices.controlLegendary };

const upgrades: FaceUpgrade[] = [
  {
    id: "tempest_strike",
    name: "Tempest Strike",
    description: "Staggered thunder columns that also chill their targets.",
    chainId: "tempest_strike",
    rank: 1,
    upgradesTo: "tempest_strike_ii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['lightning', 'ice', 'column', 'aoe'],
    animation: {
    cast: 'thunder_cast',
    hit: 'thunder_column',
    evolution: 'tempest_spiral',
  },
    effect: { effects: [{ verb: 'column', count: 1, delay: 0.2, damageMul: 2.6 }, { verb: 'applyStatus', status: 'slow', power: 0.4, duration: 1.5 }], damageMul: 1.0, timing: tempo.artillery },
    basePrice,
  },
  {
    id: "tempest_strike_ii",
    name: "Storm Strike",
    description: "Staggered thunder columns that also chill their targets. Refined into Storm Strike.",
    chainId: "tempest_strike",
    rank: 2,
    upgradesFrom: "tempest_strike",
    upgradesTo: "tempest_strike_iii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['lightning', 'ice', 'column', 'aoe'],
    animation: {
    cast: 'thunder_cast',
    hit: 'thunder_column',
    evolution: 'tempest_spiral',
  },
    effect: { effects: [{ verb: 'column', count: 2, delay: 0.22, damageMul: 3.2, stunDur: 0.2 }, { verb: 'frostBurst', radius: 38, damageMul: 0.28, freezeDur: 0.45, slow: 0.55 }], damageMul: 1.0, timing: tempo.legendary },
    basePrice,
  },
  {
    id: "tempest_strike_iii",
    name: "Tempest Spiral",
    description: "Columns chain outward in a spiral.",
    chainId: "tempest_strike",
    rank: 3,
    upgradesFrom: "tempest_strike_ii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['lightning', 'ice', 'column', 'aoe'],
    animation: {
    cast: 'thunder_cast',
    hit: 'thunder_column',
    evolution: 'tempest_spiral',
  },
    effect: { effects: [{ verb: 'column', count: 4, delay: 0.24, damageMul: 4.1, stunDur: 0.35, chainToExtra: 2 }, { verb: 'frostBurst', radius: 58, damageMul: 0.45, freezeDur: 0.8, slow: 0.7 }, { verb: 'column', count: 2, delay: 0.28, damageMul: 3.6, chainToExtra: 3 }], damageMul: 1.0, timing: tempo.legendary, note: 'Tempest Spiral' },
    basePrice,
  }
];

export default upgrades;
