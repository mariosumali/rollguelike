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
    effect: { effects: [{ verb: 'fireProjectile', count: 1, speed: 0.95, element: 'lightning', size: 1.45 }, { verb: 'chain', maxChains: 4, decay: 0.5 }, { verb: 'chainLightning', jumps: 3, damageMul: 0.7, radius: 100, stunDur: 0.18 }], damageMul: 1.22, timing: tempo.heavy },
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
    effect: { effects: [{ verb: 'fireProjectile', count: 2, speed: 0.98, element: 'lightning', size: 1.65, spread: Math.PI / 16 }, { verb: 'chainLightning', jumps: 5, damageMul: 0.75, radius: 120, stunDur: 0.3 }], damageMul: 1.28, timing: tempo.artillery },
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
    effect: { effects: [{ verb: 'fireProjectile', count: 3, speed: 1.02, element: 'lightning', size: 1.75, spread: Math.PI / 10 }, { verb: 'chainLightning', jumps: 7, damageMul: 0.82, radius: 140, stunDur: 0.4 }, { verb: 'chainLightning', jumps: 5, damageMul: 0.72, radius: 130, stunDur: 0.35, fromDie: true }], damageMul: 1.35, timing: tempo.legendary, note: 'Tesla Storm' },
    basePrice,
  }
];

export default upgrades;
