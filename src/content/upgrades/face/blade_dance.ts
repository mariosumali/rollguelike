import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { epic: prices.standardEpic };

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
    effect: { effects: [{ verb: 'orbit', count: 3, radius: 36, rpm: 185, damageMul: 0.72, duration: 3.0, pierce: 1 }, { verb: 'pulse', radius: 24, damageMul: 0.22, knockback: 10 }], damageMul: 1.0, timing: tempo.standard },
    basePrice,
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
    effect: { effects: [{ verb: 'orbit', count: 5, radius: 42, rpm: 220, damageMul: 0.88, duration: 3.8, pierce: 2 }, { verb: 'pulse', radius: 34, damageMul: 0.34, knockback: 18 }], damageMul: 1.06, timing: tempo.deliberate },
    basePrice,
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
    effect: { effects: [{ verb: 'orbit', count: 7, radius: 50, rpm: 255, damageMul: 1.02, duration: 5.0, pierce: 3 }, { verb: 'pulse', radius: 48, damageMul: 0.52, knockback: 28 }, { verb: 'shield', stacks: 1 }], damageMul: 1.14, timing: tempo.heavy, note: 'Whirling Guard' },
    basePrice,
  }
];

export default upgrades;
