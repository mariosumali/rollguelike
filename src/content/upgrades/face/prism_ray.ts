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
    effect: { effects: [{ verb: 'beam', width: 5, dps: 13, duration: 3, pierce: 4, element: 'arcane' }], damageMul: 1.05, timing: tempo.heavy },
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
    effect: { effects: [{ verb: 'beam', width: 7, dps: 19, duration: 3, pierce: 7, element: 'arcane' }], damageMul: 1.12, timing: tempo.artillery },
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
    effect: { effects: [{ verb: 'beam', width: 10, dps: 26, duration: 3, pierce: 10, element: 'arcane' }, { verb: 'beam', width: 12, dps: 22, duration: 3, pierce: 12, element: 'arcane' }], damageMul: 1.25, timing: tempo.legendary, note: 'Rainbow Lance' },
    basePrice,
  }
];

export default upgrades;
