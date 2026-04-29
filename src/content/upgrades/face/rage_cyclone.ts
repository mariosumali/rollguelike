import type { FaceUpgrade } from '../types';

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
    effect: { effects: [{ verb: 'orbit', count: 3, radius: 32, rpm: 160, damageMul: 0.8, duration: 3.0, pierce: 1 }, { verb: 'pulse', radius: 26, damageMul: 0.3, knockback: 18 }], damageMul: 1.0 },
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
    effect: { effects: [{ verb: 'orbit', count: 4, radius: 38, rpm: 190, damageMul: 1.0, duration: 3.8, pierce: 2 }, { verb: 'pulse', radius: 38, damageMul: 0.5, knockback: 28 }], damageMul: 1.05 },
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
    effect: { effects: [{ verb: 'orbit', count: 6, radius: 44, rpm: 230, damageMul: 1.15, duration: 4.8, pierce: 2 }, { verb: 'pulse', radius: 52, damageMul: 0.75, element: 'fire', knockback: 40 }, { verb: 'pulse', radius: 56, damageMul: 0.8, element: 'fire', knockback: 44 }], damageMul: 1.1, note: 'Red Tempest' },
  }
];

export default upgrades;
