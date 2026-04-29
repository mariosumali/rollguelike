import type { FaceUpgrade } from '../types';

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
    effect: { effects: [{ verb: 'pull', radius: 48, strength: 0.4, dps: 2, duration: 1.1 }], damageMul: 1.0 },
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
    effect: { effects: [{ verb: 'pull', radius: 66, strength: 0.55, dps: 4, duration: 1.5 }, { verb: 'groundZone', radius: 38, dps: 3, duration: 1.4, element: 'arcane', slow: 0.2 }], damageMul: 1.0 },
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
    effect: { effects: [{ verb: 'pull', radius: 86, strength: 0.75, dps: 6, duration: 2.0 }, { verb: 'groundZone', radius: 52, dps: 5, duration: 2.0, element: 'arcane', slow: 0.35 }, { verb: 'statusAura', status: 'mark', radius: 90, power: 1.2, duration: 2.5 }, { verb: 'statusAura', status: 'mark', radius: 90, power: 1.4, duration: 2.5 }], damageMul: 1.0, note: 'Singularity Seed' },
  }
];

export default upgrades;
