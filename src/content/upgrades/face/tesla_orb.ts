import type { FaceUpgrade } from '../types';

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
    effect: { effects: [{ verb: 'fireProjectile', count: 1, element: 'lightning', size: 1.25 }, { verb: 'chain', maxChains: 2, decay: 0.5 }], damageMul: 1.0 },
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
    effect: { effects: [{ verb: 'fireProjectile', count: 1, element: 'lightning', size: 1.4 }, { verb: 'chainLightning', jumps: 3, damageMul: 0.5, radius: 95, stunDur: 0.2 }], damageMul: 1.1 },
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
    effect: { effects: [{ verb: 'fireProjectile', count: 2, element: 'lightning', size: 1.45, spread: Math.PI / 12 }, { verb: 'chainLightning', jumps: 5, damageMul: 0.65, radius: 120, stunDur: 0.3 }, { verb: 'chainLightning', jumps: 4, damageMul: 0.7, radius: 115, stunDur: 0.3, fromDie: true }], damageMul: 1.2, note: 'Tesla Storm' },
  }
];

export default upgrades;
