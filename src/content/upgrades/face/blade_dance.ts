import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "blade_dance",
    name: "Blade Dance",
    description: "Summons spinning blades around the die for close-range control.",
    chainId: "blade_dance",
    rank: 1,
    upgradesTo: "blade_dance_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['orbit', 'persistent', 'physical'],
    animation: { cast: 'orbit_cast', projectile: 'fang_orbit', hit: 'fang_bite', evolution: 'eternal_circle' },
    icon: ['..............','...e......e...','.....e..e.....','......ee......','..e..eeee..e..','......ee......','.....e..e.....','...e......e...','......e.......','.....e.e......','..............','..............','..............','..............'],
    effect: { effects: [{ verb: 'orbit', count: 3, radius: 30, rpm: 140, damageMul: 0.75, duration: 3.2, pierce: 1 }], damageMul: 1.0 },
  },
  {
    id: "blade_dance_ii",
    name: "Whirling Blades",
    description: "Summons spinning blades around the die for close-range control. Refined into Whirling Blades.",
    chainId: "blade_dance",
    rank: 2,
    upgradesFrom: "blade_dance",
    upgradesTo: "blade_dance_iii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['orbit', 'persistent', 'physical'],
    animation: { cast: 'orbit_cast', projectile: 'fang_orbit', hit: 'fang_bite', evolution: 'eternal_circle' },
    icon: ['..............','...e......e...','.....e..e.....','......ee......','..e..eeee..e..','......ee......','.....e..e.....','...e......e...','......e.......','.....e.e......','..............','..............','..............','..............'],
    effect: { effects: [{ verb: 'orbit', count: 4, radius: 35, rpm: 165, damageMul: 0.9, duration: 4.0, pierce: 1 }], damageMul: 1.05 },
  },
  {
    id: "blade_dance_iii",
    name: "Whirling Guard",
    description: "Blades linger longer and bite harder.",
    chainId: "blade_dance",
    rank: 3,
    upgradesFrom: "blade_dance_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['orbit', 'persistent', 'physical'],
    animation: { cast: 'orbit_cast', projectile: 'fang_orbit', hit: 'fang_bite', evolution: 'eternal_circle' },
    icon: ['..............','...e......e...','.....e..e.....','......ee......','..e..eeee..e..','......ee......','.....e..e.....','...e......e...','......e.......','.....e.e......','..............','..............','..............','..............'],
    effect: { effects: [{ verb: 'orbit', count: 6, radius: 40, rpm: 190, damageMul: 1.05, duration: 5.0, pierce: 2 }, { verb: 'shield', stacks: 1 }, { verb: 'shield', stacks: 1 }], damageMul: 1.1, note: 'Whirling Guard' },
  }
];

export default upgrades;
