import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "starfall",
    name: "Starfall",
    description: "Calls delayed arcane star strikes from above.",
    chainId: "starfall",
    rank: 1,
    upgradesTo: "starfall_ii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['arcane', 'column', 'aoe'],
    animation: { cast: 'void_cast', hit: 'rail_streak', evolution: 'supernova_ring' },
    icon: ['......e.......','.....eHe......','....eHHHe.....','......H.......','..e...H...e...','...HHHHHHH....','..e...H...e...','......H.......','....eHHHe.....','.....eHe......','......e.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'column', count: 2, delay: 0.22, damageMul: 2.6, stunDur: 0.1 }], damageMul: 1.0 },
  },
  {
    id: "starfall_ii",
    name: "Falling Star",
    description: "Calls delayed arcane star strikes from above. Refined into Falling Star.",
    chainId: "starfall",
    rank: 2,
    upgradesFrom: "starfall",
    upgradesTo: "starfall_iii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['arcane', 'column', 'aoe'],
    animation: { cast: 'void_cast', hit: 'rail_streak', evolution: 'supernova_ring' },
    icon: ['......e.......','.....eHe......','....eHHHe.....','......H.......','..e...H...e...','...HHHHHHH....','..e...H...e...','......H.......','....eHHHe.....','.....eHe......','......e.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'column', count: 3, delay: 0.2, damageMul: 3.5, stunDur: 0.18, chainToExtra: 1 }], damageMul: 1.05 },
  },
  {
    id: "starfall_iii",
    name: "Constellation Break",
    description: "A final nova follows the falling stars.",
    chainId: "starfall",
    rank: 3,
    upgradesFrom: "starfall_ii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['arcane', 'column', 'aoe'],
    animation: { cast: 'void_cast', hit: 'rail_streak', evolution: 'supernova_ring' },
    icon: ['......e.......','.....eHe......','....eHHHe.....','......H.......','..e...H...e...','...HHHHHHH....','..e...H...e...','......H.......','....eHHHe.....','.....eHe......','......e.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'column', count: 5, delay: 0.18, damageMul: 4.5, stunDur: 0.25, chainToExtra: 2 }, { verb: 'pulse', radius: 64, damageMul: 0.65, element: 'arcane', knockback: 20 }, { verb: 'pulse', radius: 72, damageMul: 0.8, element: 'arcane', knockback: 24 }], damageMul: 1.1, note: 'Constellation Break' },
  }
];

export default upgrades;
