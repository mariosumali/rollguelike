import type { FaceUpgrade } from '../types';

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
    effect: { effects: [{ verb: 'beam', width: 5, dps: 14, duration: 0.5, pierce: 5, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 2, duration: 3 }], damageMul: 1.0 },
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
    effect: { effects: [{ verb: 'beam', width: 7, dps: 18, duration: 0.6, pierce: 7, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 4, duration: 3.5 }], damageMul: 1.1 },
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
    effect: { effects: [{ verb: 'beam', width: 10, dps: 28, duration: 0.85, pierce: 10, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 7, duration: 5 }, { verb: 'pulse', radius: 42, damageMul: 1.2, element: 'fire' }], damageMul: 1.25, note: 'Corona Flare' },
  }
];

export default upgrades;
