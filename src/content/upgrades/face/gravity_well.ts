import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { epic: prices.controlEpic };

const upgrades: FaceUpgrade[] = [
  {
    id: "gravity_well",
    name: "Gravity Well",
    description: "A compact void pull that groups enemies for follow-up attacks.",
    chainId: "gravity_well",
    rank: 1,
    upgradesTo: "gravity_well_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['aoe', 'pull', 'void', 'arcane'],
    animation: { cast: 'void_cast', projectile: 'void_orb', hit: 'void_collapse', evolution: 'event_horizon' },
    icon: ['..............','....H.....H...','......H.......','...H.....H....','.....HHH......','....HHIHH.....','.....HHH......','...H.....H....','......H.......','....H.....H...','..............','..............','..............','..............'],
    effect: { effects: [{ verb: 'pull', radius: 54, strength: 0.46, dps: 3.5, duration: 1.25 }], damageMul: 1.0, timing: tempo.deliberate },
    basePrice,
  },
  {
    id: "gravity_well_ii",
    name: "Singularity Well",
    description: "A compact void pull that groups enemies for follow-up attacks. Refined into Singularity Well.",
    chainId: "gravity_well",
    rank: 2,
    upgradesFrom: "gravity_well",
    upgradesTo: "gravity_well_iii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['aoe', 'pull', 'void', 'arcane'],
    animation: { cast: 'void_cast', projectile: 'void_orb', hit: 'void_collapse', evolution: 'event_horizon' },
    icon: ['..............','....H.....H...','......H.......','...H.....H....','.....HHH......','....HHIHH.....','.....HHH......','...H.....H....','......H.......','....H.....H...','..............','..............','..............','..............'],
    effect: { effects: [{ verb: 'pull', radius: 74, strength: 0.65, dps: 5.5, duration: 1.7 }, { verb: 'groundZone', radius: 46, dps: 5, duration: 1.6, element: 'arcane', slow: 0.25 }], damageMul: 1.0, timing: tempo.heavy },
    basePrice,
  },
  {
    id: "gravity_well_iii",
    name: "Singularity Seed",
    description: "The well marks enemies trapped inside.",
    chainId: "gravity_well",
    rank: 3,
    upgradesFrom: "gravity_well_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['aoe', 'pull', 'void', 'arcane'],
    animation: { cast: 'void_cast', projectile: 'void_orb', hit: 'void_collapse', evolution: 'event_horizon' },
    icon: ['..............','....H.....H...','......H.......','...H.....H....','.....HHH......','....HHIHH.....','.....HHH......','...H.....H....','......H.......','....H.....H...','..............','..............','..............','..............'],
    effect: { effects: [{ verb: 'pull', radius: 96, strength: 0.85, dps: 8, duration: 2.25 }, { verb: 'groundZone', radius: 62, dps: 7, duration: 2.25, element: 'arcane', slow: 0.4 }, { verb: 'statusAura', status: 'mark', radius: 102, power: 1.6, duration: 3 }], damageMul: 1.0, timing: tempo.artillery, note: 'Singularity Seed' },
    basePrice,
  }
];

export default upgrades;
