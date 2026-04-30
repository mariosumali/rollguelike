import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "volatile_mixture",
    name: "Volatile Mixture",
    description: "Alchemist only. Adds reaction clouds and unstable elemental splashes.",
    chainId: "volatile_mixture",
    rank: 1,
    upgradesTo: "volatile_mixture_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'alchemist', 'elemental', 'aoe', 'fire', 'poison'],
    characterExclusive: 'alchemist',
    animation: { cast: 'transmute_glow', projectile: 'toxin_proj', hit: 'explosion_small', evolution: 'nova_bloom' },
    icon: ['..............','......66......','.....6dd6.....','....6dzzd6....','...6dzuuzd6...','..6dzuuuzd6...','..6dzzzzd6...','...6dddd6....','....6666.....','.....uu......','....u..u.....','..............','..............','..............'],
    effect: { effects: [{ verb: 'modifyProjectile', aoeOnHit: 18, burnDps: 3, burnDur: 2 }, { verb: 'groundZone', radius: 26, dps: 4, duration: 0.9, element: 'poison', slow: 0.1 }], damageMul: 1.0 },
  },
  {
    id: "volatile_mixture_ii",
    name: "Chain Reaction",
    description: "Alchemist only. Adds reaction clouds and unstable elemental splashes. Refined into Chain Reaction.",
    chainId: "volatile_mixture",
    rank: 2,
    upgradesFrom: "volatile_mixture",
    upgradesTo: "volatile_mixture_iii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'alchemist', 'elemental', 'aoe', 'fire', 'poison'],
    characterExclusive: 'alchemist',
    animation: { cast: 'transmute_glow', projectile: 'toxin_proj', hit: 'explosion_small', evolution: 'nova_bloom' },
    icon: ['..............','......66......','.....6dd6.....','....6dzzd6....','...6dzuuzd6...','..6dzuuuzd6...','..6dzzzzd6...','...6dddd6....','....6666.....','.....uu......','....u..u.....','..............','..............','..............'],
    effect: { effects: [{ verb: 'modifyProjectile', aoeOnHit: 24, burnDps: 5, burnDur: 3 }, { verb: 'groundZone', radius: 34, dps: 7, duration: 1.2, element: 'poison', slow: 0.18 }, { verb: 'flamePillar', count: 1, radius: 16, damageMul: 0.35, duration: 0.55 }], damageMul: 1.0 },
  },
  {
    id: "volatile_mixture_iii",
    name: "Chain Reaction",
    description: "Fire and poison bloom together around the target.",
    chainId: "volatile_mixture",
    rank: 3,
    upgradesFrom: "volatile_mixture_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'alchemist', 'elemental', 'aoe', 'fire', 'poison'],
    characterExclusive: 'alchemist',
    animation: { cast: 'transmute_glow', projectile: 'toxin_proj', hit: 'explosion_small', evolution: 'nova_bloom' },
    icon: ['..............','......66......','.....6dd6.....','....6dzzd6....','...6dzuuzd6...','..6dzuuuzd6...','..6dzzzzd6...','...6dddd6....','....6666.....','.....uu......','....u..u.....','..............','..............','..............'],
    effect: { effects: [{ verb: 'modifyProjectile', aoeOnHit: 32, burnDps: 8, burnDur: 4 }, { verb: 'groundZone', radius: 42, dps: 10, duration: 1.6, element: 'poison', slow: 0.25 }, { verb: 'flamePillar', count: 2, radius: 20, damageMul: 0.45, duration: 0.8, delay: 0.12, burnDps: 5, burnDur: 3 }, { verb: 'flamePillar', count: 1, radius: 20, damageMul: 0.45, duration: 0.8, burnDps: 5, burnDur: 3 }], damageMul: 1.0, note: 'Chain Reaction' },
  }
];

export default upgrades;
