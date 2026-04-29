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
    effect: { effects: [{ verb: 'orbit', count: 3, radius: 30, rpm: 160, damageMul: 0.58, duration: 2.6, pierce: 1 }], damageMul: 1.0, timing: tempo.standard },
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
    effect: { effects: [{ verb: 'orbit', count: 4, radius: 35, rpm: 190, damageMul: 0.7, duration: 3.3, pierce: 1 }], damageMul: 1.02, timing: tempo.deliberate },
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
    effect: { effects: [{ verb: 'orbit', count: 6, radius: 40, rpm: 220, damageMul: 0.82, duration: 4.2, pierce: 2 }, { verb: 'shield', stacks: 1 }], damageMul: 1.08, timing: tempo.heavy, note: 'Whirling Guard' },
    basePrice,
  }
];

export default upgrades;
