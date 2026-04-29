import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "echo",
    name: "Echo",
    description: "Chance to resolve this slot twice.",
    chainId: "echo",
    rank: 1,
    upgradesTo: "echo_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'echo'],
    animation: {
    cast: 'echo_shimmer',
    hit: 'std_burst',
    evolution: 'triplet_flash',
  },
    effect: { effects: [{ verb: 'modifyProjectile', damageMul: 1.0 }], damageMul: 1.0, params: { doubleChance: 0.15 } },
  },
  {
    id: "echo_ii",
    name: "Double Echo",
    description: "Chance to resolve this slot twice. Refined into Double Echo.",
    chainId: "echo",
    rank: 2,
    upgradesFrom: "echo",
    upgradesTo: "echo_iii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'echo'],
    animation: {
    cast: 'echo_shimmer',
    hit: 'std_burst',
    evolution: 'triplet_flash',
  },
    effect: { effects: [{ verb: 'modifyProjectile', damageMul: 1.0 }], damageMul: 1.0, params: { doubleChance: 0.3 } },
  },
  {
    id: "echo_iii",
    name: "Triplet",
    description: "Always resolves 3x, but slot is locked out next roll.",
    chainId: "echo",
    rank: 3,
    upgradesFrom: "echo_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'echo'],
    animation: {
    cast: 'echo_shimmer',
    hit: 'std_burst',
    evolution: 'triplet_flash',
  },
    effect: { effects: [{ verb: 'modifyProjectile', damageMul: 1.0 }], damageMul: 1.0, params: { tripleAlways: 1, lockoutNext: 1 }, note: 'Triplet' },
  }
];

export default upgrades;
