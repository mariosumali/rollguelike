import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { epic: prices.premiumEpic };

const upgrades: FaceUpgrade[] = [
  {
    id: "rage_cyclone",
    name: "Rage Cyclone",
    description: "Berserker only. Spins a brutal orbit that ends in a rage pulse.",
    chainId: "rage_cyclone",
    rank: 1,
    upgradesTo: "rage_cyclone_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['berserker', 'rage', 'orbit', 'pulse'],
    characterExclusive: 'berserker',
    animation: { cast: 'rage_flame', projectile: 'fang_orbit', hit: 'impact_smash', evolution: 'rage_flame_max' },
    icon: ['..............','...h......h...','.....h..h.....','..h...hh...h..','...hhhhhhhh...','..h...hh...h..','.....h..h.....','...h......h...','......h.......','.....h.h......','..............','..............','..............','..............'],
    effect: { effects: [{ verb: 'orbit', count: 3, radius: 32, rpm: 180, damageMul: 0.65, duration: 2.8, pierce: 1 }, { verb: 'pulse', radius: 26, damageMul: 0.25, knockback: 18 }], damageMul: 1.0, timing: tempo.standard },
    basePrice,
  },
  {
    id: "rage_cyclone_ii",
    name: "Frenzy Cyclone",
    description: "Berserker only. Spins a brutal orbit that ends in a rage pulse. Refined into Frenzy Cyclone.",
    chainId: "rage_cyclone",
    rank: 2,
    upgradesFrom: "rage_cyclone",
    upgradesTo: "rage_cyclone_iii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['berserker', 'rage', 'orbit', 'pulse'],
    characterExclusive: 'berserker',
    animation: { cast: 'rage_flame', projectile: 'fang_orbit', hit: 'impact_smash', evolution: 'rage_flame_max' },
    icon: ['..............','...h......h...','.....h..h.....','..h...hh...h..','...hhhhhhhh...','..h...hh...h..','.....h..h.....','...h......h...','......h.......','.....h.h......','..............','..............','..............','..............'],
    effect: { effects: [{ verb: 'orbit', count: 4, radius: 38, rpm: 220, damageMul: 0.78, duration: 3.5, pierce: 2 }, { verb: 'pulse', radius: 38, damageMul: 0.42, knockback: 28 }], damageMul: 1.05, timing: tempo.deliberate },
    basePrice,
  },
  {
    id: "rage_cyclone_iii",
    name: "Red Tempest",
    description: "The cyclone detonates with a larger shove.",
    chainId: "rage_cyclone",
    rank: 3,
    upgradesFrom: "rage_cyclone_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['berserker', 'rage', 'orbit', 'pulse'],
    characterExclusive: 'berserker',
    animation: { cast: 'rage_flame', projectile: 'fang_orbit', hit: 'impact_smash', evolution: 'rage_flame_max' },
    icon: ['..............','...h......h...','.....h..h.....','..h...hh...h..','...hhhhhhhh...','..h...hh...h..','.....h..h.....','...h......h...','......h.......','.....h.h......','..............','..............','..............','..............'],
    effect: { effects: [{ verb: 'orbit', count: 6, radius: 44, rpm: 260, damageMul: 0.92, duration: 4.4, pierce: 2 }, { verb: 'pulse', radius: 54, damageMul: 0.68, element: 'fire', knockback: 42 }], damageMul: 1.1, timing: tempo.heavy, note: 'Red Tempest' },
    basePrice,
  }
];

export default upgrades;
