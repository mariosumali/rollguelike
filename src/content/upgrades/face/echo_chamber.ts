import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "echo_chamber",
    name: "Echo Chamber",
    description: "Repeats the slot as extra weaker echoes.",
    chainId: "echo_chamber",
    rank: 1,
    upgradesTo: "echo_chamber_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'echo', 'multishot'],
    animation: { cast: 'echo_shimmer', projectile: 'std_proj', hit: 'std_burst', evolution: 'triplet_flash' },
    icon: ['..............','....IIIIII....','...I......I...','..I..IIII..I..','..I.I....I.I..','..I.I....I.I..','..I..IIII..I..','...I......I...','....IIIIII....','......I.......','......I.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'modifyProjectile', extra: 1, damageMul: 0.72 }], damageMul: 1.0, params: { echoChance: 0.35 } },
  },
  {
    id: "echo_chamber_ii",
    name: "Resonance Chamber",
    description: "Repeats the slot as extra weaker echoes. Refined into Resonance Chamber.",
    chainId: "echo_chamber",
    rank: 2,
    upgradesFrom: "echo_chamber",
    upgradesTo: "echo_chamber_iii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'echo', 'multishot'],
    animation: { cast: 'echo_shimmer', projectile: 'std_proj', hit: 'std_burst', evolution: 'triplet_flash' },
    icon: ['..............','....IIIIII....','...I......I...','..I..IIII..I..','..I.I....I.I..','..I.I....I.I..','..I..IIII..I..','...I......I...','....IIIIII....','......I.......','......I.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'modifyProjectile', extra: 1, damageMul: 0.85 }, { verb: 'pulse', radius: 22, damageMul: 0.18, element: 'arcane' }], damageMul: 1.0, params: { echoChance: 0.7 } },
  },
  {
    id: "echo_chamber_iii",
    name: "Resonance",
    description: "The echo becomes a visible second pulse.",
    chainId: "echo_chamber",
    rank: 3,
    upgradesFrom: "echo_chamber_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'echo', 'multishot'],
    animation: { cast: 'echo_shimmer', projectile: 'std_proj', hit: 'std_burst', evolution: 'triplet_flash' },
    icon: ['..............','....IIIIII....','...I......I...','..I..IIII..I..','..I.I....I.I..','..I.I....I.I..','..I..IIII..I..','...I......I...','....IIIIII....','......I.......','......I.......','..............','..............','..............'],
    effect: { effects: [{ verb: 'modifyProjectile', extra: 2, damageMul: 0.78 }, { verb: 'pulse', radius: 30, damageMul: 0.22, element: 'arcane', repeat: 2, delay: 0.1 }, { verb: 'pulse', radius: 34, damageMul: 0.3, element: 'arcane', repeat: 2, delay: 0.12 }], damageMul: 1.0, note: 'Resonance' },
  }
];

export default upgrades;
