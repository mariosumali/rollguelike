import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { epic: prices.premiumEpic };

const upgrades: FaceUpgrade[] = [
  {
    id: "tesla_orb",
    name: "Tesla Orb",
    description: "A crackling orb fires and lashes nearby enemies with arcs.",
    chainId: "tesla_orb",
    rank: 1,
    upgradesTo: "tesla_orb_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['projectile', 'lightning', 'elemental', 'chain'],
    animation: { cast: 'spark_cast', projectile: 'arc_proj', hit: 'arc_chain', evolution: 'storm_chain' },
    icon: ['..............','......y.......','....yyyyy.....','...y.e.e.y....','..yy..y..yy...','...y.e.e.y....','....yyyyy.....','......y.......','....y.y.y.....','...y..y..y....','......y.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'fireProjectile', count: 1, speed: 0.9, element: 'lightning', size: 1.35 }, { verb: 'chain', maxChains: 2, decay: 0.5 }], damageMul: 1.1, timing: tempo.heavy },
    basePrice,
  },
  {
    id: "tesla_orb_ii",
    name: "Storm Orb",
    description: "A crackling orb fires and lashes nearby enemies with arcs. Refined into Storm Orb.",
    chainId: "tesla_orb",
    rank: 2,
    upgradesFrom: "tesla_orb",
    upgradesTo: "tesla_orb_iii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['projectile', 'lightning', 'elemental', 'chain'],
    animation: { cast: 'spark_cast', projectile: 'arc_proj', hit: 'arc_chain', evolution: 'storm_chain' },
    icon: ['..............','......y.......','....yyyyy.....','...y.e.e.y....','..yy..y..yy...','...y.e.e.y....','....yyyyy.....','......y.......','....y.y.y.....','...y..y..y....','......y.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'fireProjectile', count: 1, speed: 0.9, element: 'lightning', size: 1.55 }, { verb: 'chainLightning', jumps: 4, damageMul: 0.48, radius: 105, stunDur: 0.25 }], damageMul: 1.15, timing: tempo.artillery },
    basePrice,
  },
  {
    id: "tesla_orb_iii",
    name: "Tesla Storm",
    description: "The orb opens with a web of lightning.",
    chainId: "tesla_orb",
    rank: 3,
    upgradesFrom: "tesla_orb_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['projectile', 'lightning', 'elemental', 'chain'],
    animation: { cast: 'spark_cast', projectile: 'arc_proj', hit: 'arc_chain', evolution: 'storm_chain' },
    icon: ['..............','......y.......','....yyyyy.....','...y.e.e.y....','..yy..y..yy...','...y.e.e.y....','....yyyyy.....','......y.......','....y.y.y.....','...y..y..y....','......y.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'fireProjectile', count: 2, speed: 0.95, element: 'lightning', size: 1.55, spread: Math.PI / 12 }, { verb: 'chainLightning', jumps: 6, damageMul: 0.55, radius: 125, stunDur: 0.35 }, { verb: 'chainLightning', jumps: 4, damageMul: 0.58, radius: 115, stunDur: 0.3, fromDie: true }], damageMul: 1.18, timing: tempo.legendary, note: 'Tesla Storm' },
    basePrice,
  }
];

export default upgrades;
