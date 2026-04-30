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
    effect: { effects: [{ verb: 'beam', width: 7, dps: 20, duration: 0.55, pierce: 7, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 4, duration: 3.5 }], damageMul: 1.05, timing: tempo.artillery },
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
    effect: { effects: [{ verb: 'beam', width: 10, dps: 29, duration: 0.72, pierce: 10, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 6, duration: 4.25 }], damageMul: 1.14, timing: tempo.legendary },
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
    effect: { effects: [{ verb: 'beam', width: 14, dps: 42, duration: 0.95, pierce: 14, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 9, duration: 5.5 }, { verb: 'pulse', radius: 60, damageMul: 1.25, element: 'fire', knockback: 24 }], damageMul: 1.28, timing: tempo.legendary, note: 'Corona Flare' },
    basePrice,
  }
];

export default upgrades;
