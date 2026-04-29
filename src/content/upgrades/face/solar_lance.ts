import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { legendary: prices.premiumLegendary };

const upgrades: FaceUpgrade[] = [
  {
    id: "solar_lance",
    name: "Solar Lance",
    description: "Charges, then fires a wide solar beam that also ignites.",
    chainId: "solar_lance",
    rank: 1,
    upgradesTo: "solar_lance_ii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['beam', 'fire', 'elemental', 'dot'],
    animation: {
    cast: 'sun_charge',
    hit: 'solar_scorch',
    evolution: 'corona_flare',
  },
    effect: { effects: [{ verb: 'beam', width: 5, dps: 14, duration: 0.46, pierce: 5, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 2, duration: 3 }], damageMul: 1.0, timing: tempo.artillery },
    basePrice,
  },
  {
    id: "solar_lance_ii",
    name: "Corona Lance",
    description: "Charges, then fires a wide solar beam that also ignites. Refined into Corona Lance.",
    chainId: "solar_lance",
    rank: 2,
    upgradesFrom: "solar_lance",
    upgradesTo: "solar_lance_iii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['beam', 'fire', 'elemental', 'dot'],
    animation: {
    cast: 'sun_charge',
    hit: 'solar_scorch',
    evolution: 'corona_flare',
  },
    effect: { effects: [{ verb: 'beam', width: 7, dps: 19, duration: 0.58, pierce: 7, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 4, duration: 3.5 }], damageMul: 1.05, timing: tempo.legendary },
    basePrice,
  },
  {
    id: "solar_lance_iii",
    name: "Corona Flare",
    description: "Beam detonates at its terminus for a second ignition.",
    chainId: "solar_lance",
    rank: 3,
    upgradesFrom: "solar_lance_ii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['beam', 'fire', 'elemental', 'dot'],
    animation: {
    cast: 'sun_charge',
    hit: 'solar_scorch',
    evolution: 'corona_flare',
  },
    effect: { effects: [{ verb: 'beam', width: 10, dps: 28, duration: 0.8, pierce: 10, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 7, duration: 5 }, { verb: 'pulse', radius: 40, damageMul: 0.95, element: 'fire' }], damageMul: 1.18, timing: tempo.legendary, note: 'Corona Flare' },
    basePrice,
  }
];

export default upgrades;
