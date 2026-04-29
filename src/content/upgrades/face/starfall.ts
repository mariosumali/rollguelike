import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { legendary: prices.standardLegendary };

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
    effect: { effects: [{ verb: 'column', count: 2, delay: 0.24, damageMul: 2.35, stunDur: 0.1 }], damageMul: 1.0, timing: tempo.artillery },
    basePrice,
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
    effect: { effects: [{ verb: 'column', count: 3, delay: 0.22, damageMul: 3.0, stunDur: 0.18, chainToExtra: 1 }], damageMul: 1.0, timing: tempo.legendary },
    basePrice,
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
    effect: { effects: [{ verb: 'column', count: 5, delay: 0.2, damageMul: 3.8, stunDur: 0.25, chainToExtra: 2 }, { verb: 'pulse', radius: 68, damageMul: 0.65, element: 'arcane', knockback: 22 }], damageMul: 1.05, timing: tempo.legendary, note: 'Constellation Break' },
    basePrice,
  }
];

export default upgrades;
