import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { legendary: prices.controlLegendary };

const upgrades: FaceUpgrade[] = [
  {
    id: "black_hole",
    name: "Black Hole",
    description: "Pulls foes into a visible void well and marks survivors.",
    chainId: "black_hole",
    rank: 1,
    upgradesTo: "black_hole_ii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['aoe', 'pull', 'void'],
    animation: {
    cast: 'void_cast',
    projectile: 'void_orb',
    hit: 'void_collapse',
    evolution: 'event_horizon',
  },
    effect: { effects: [{ verb: 'pull', radius: 70, strength: 0.45, dps: 4.5, duration: 1.4 }], damageMul: 1.0, timing: tempo.heavy },
    basePrice,
  },
  {
    id: "black_hole_ii",
    name: "Gravity Rift",
    description: "Pulls foes into a visible void well and marks survivors. Refined into Gravity Rift.",
    chainId: "black_hole",
    rank: 2,
    upgradesFrom: "black_hole",
    upgradesTo: "black_hole_iii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['aoe', 'pull', 'void'],
    animation: {
    cast: 'void_cast',
    projectile: 'void_orb',
    hit: 'void_collapse',
    evolution: 'event_horizon',
  },
    effect: { effects: [{ verb: 'pull', radius: 104, strength: 0.72, dps: 7, duration: 2.0 }, { verb: 'groundZone', radius: 64, dps: 6, duration: 2.0, element: 'arcane', slow: 0.35 }], damageMul: 1.0, timing: tempo.artillery },
    basePrice,
  },
  {
    id: "black_hole_iii",
    name: "Event Horizon",
    description: "The well becomes an event horizon that brands everything inside.",
    chainId: "black_hole",
    rank: 3,
    upgradesFrom: "black_hole_ii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['aoe', 'pull', 'void'],
    animation: {
    cast: 'void_cast',
    projectile: 'void_orb',
    hit: 'void_collapse',
    evolution: 'event_horizon',
  },
    effect: { effects: [{ verb: 'pull', radius: 136, strength: 1.0, dps: 11, duration: 2.8, destroyProjectiles: true }, { verb: 'groundZone', radius: 90, dps: 9, duration: 2.8, element: 'arcane', slow: 0.5 }, { verb: 'statusAura', status: 'mark', radius: 136, power: 2.75, duration: 3.5 }], damageMul: 1.0, timing: tempo.legendary, note: 'Event Horizon' },
    basePrice,
  }
];

export default upgrades;
