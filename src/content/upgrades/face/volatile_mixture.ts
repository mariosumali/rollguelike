import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'volatile_mixture',
  name: 'Volatile Mixture',
  kind: 'supplement',
  rarity: 'epic',
  description: 'Alchemist only. Adds reaction clouds and unstable elemental splashes.',
  tags: ['supplement', 'alchemist', 'elemental', 'aoe', 'fire', 'poison'],
  characterExclusive: 'alchemist',
  animation: { cast: 'transmute_glow', projectile: 'toxin_proj', hit: 'explosion_small', evolution: 'nova_bloom' },
  evolution: { name: 'Chain Reaction', flavor: 'Fire and poison bloom together around the target.', extraEffects: [{ verb: 'flamePillar', count: 1, radius: 20, damageMul: 0.45, duration: 0.8, burnDps: 5, burnDur: 3 }] },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', aoeOnHit: 18, burnDps: 3, burnDur: 2 }, { verb: 'groundZone', radius: 26, dps: 3, duration: 0.9, element: 'poison', slow: 0.1 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', aoeOnHit: 24, burnDps: 5, burnDur: 3 }, { verb: 'groundZone', radius: 34, dps: 5, duration: 1.2, element: 'poison', slow: 0.18 }, { verb: 'flamePillar', count: 1, radius: 16, damageMul: 0.35, duration: 0.55 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', aoeOnHit: 32, burnDps: 8, burnDur: 4 }, { verb: 'groundZone', radius: 42, dps: 7, duration: 1.6, element: 'poison', slow: 0.25 }, { verb: 'flamePillar', count: 2, radius: 20, damageMul: 0.45, duration: 0.8, delay: 0.12, burnDps: 5, burnDur: 3 }], damageMul: 1.0, note: 'Chain Reaction' },
  ],
  icon: ['..............','......66......','.....6dd6.....','....6dzzd6....','...6dzuuzd6...','..6dzuuuzd6...','..6dzzzzd6...','...6dddd6....','....6666.....','.....uu......','....u..u.....','..............','..............','..............'],
};

export default upgrade;
