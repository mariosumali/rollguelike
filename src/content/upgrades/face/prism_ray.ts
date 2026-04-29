import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { epic: prices.standardEpic };

const upgrades: FaceUpgrade[] = [
  {
    id: "prism_ray",
    name: "Prism Ray",
    description: "Continuous refracted beam that ticks damage through pierced foes.",
    chainId: "prism_ray",
    rank: 1,
    upgradesTo: "prism_ray_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['beam', 'pierce', 'arcane'],
    animation: {
    cast: 'prism_cast',
    hit: 'prism_hit',
    evolution: 'rainbow_lance',
  },
    effect: { effects: [{ verb: 'beam', width: 3, dps: 9, duration: 0.38, pierce: 3, element: 'arcane' }], damageMul: 1.0, timing: tempo.heavy },
    basePrice,
  },
  {
    id: "prism_ray_ii",
    name: "Split Prism",
    description: "Continuous refracted beam that ticks damage through pierced foes. Refined into Split Prism.",
    chainId: "prism_ray",
    rank: 2,
    upgradesFrom: "prism_ray",
    upgradesTo: "prism_ray_iii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['beam', 'pierce', 'arcane'],
    animation: {
    cast: 'prism_cast',
    hit: 'prism_hit',
    evolution: 'rainbow_lance',
  },
    effect: { effects: [{ verb: 'beam', width: 5, dps: 13, duration: 0.5, pierce: 5, element: 'arcane' }], damageMul: 1.05, timing: tempo.artillery },
    basePrice,
  },
  {
    id: "prism_ray_iii",
    name: "Rainbow Lance",
    description: "Beam widens and splits across the spectrum.",
    chainId: "prism_ray",
    rank: 3,
    upgradesFrom: "prism_ray_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['beam', 'pierce', 'arcane'],
    animation: {
    cast: 'prism_cast',
    hit: 'prism_hit',
    evolution: 'rainbow_lance',
  },
    effect: { effects: [{ verb: 'beam', width: 7, dps: 18, duration: 0.7, pierce: 8, element: 'arcane' }, { verb: 'beam', width: 8, dps: 16, duration: 0.55, pierce: 10, element: 'arcane' }], damageMul: 1.15, timing: tempo.legendary, note: 'Rainbow Lance' },
    basePrice,
  }
];

export default upgrades;
