import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'tesla_orb',
  name: 'Tesla Orb',
  kind: 'replacer',
  rarity: 'epic',
  description: 'A crackling orb fires and lashes nearby enemies with arcs.',
  tags: ['projectile', 'lightning', 'elemental', 'chain'],
  animation: { cast: 'spark_cast', projectile: 'arc_proj', hit: 'arc_chain', evolution: 'storm_chain' },
  evolution: { name: 'Tesla Storm', flavor: 'The orb opens with a web of lightning.', extraEffects: [{ verb: 'chainLightning', jumps: 4, damageMul: 0.7, radius: 115, stunDur: 0.3, fromDie: true }] },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, element: 'lightning', size: 1.25 }, { verb: 'chain', maxChains: 2, decay: 0.5 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 1, element: 'lightning', size: 1.4 }, { verb: 'chainLightning', jumps: 3, damageMul: 0.5, radius: 95, stunDur: 0.2 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 2, element: 'lightning', size: 1.45, spread: Math.PI / 12 }, { verb: 'chainLightning', jumps: 5, damageMul: 0.65, radius: 120, stunDur: 0.3 }], damageMul: 1.2, note: 'Tesla Storm' },
  ],
  icon: ['..............','......y.......','....yyyyy.....','...y.e.e.y....','..yy..y..yy...','...y.e.e.y....','....yyyyy.....','......y.......','....y.y.y.....','...y..y..y....','......y.......','..............','..............','..............'],
};

export default upgrade;
