import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "frost_lance",
    name: "Frost Lance",
    description: "Frost shots visibly slow, shell, and eventually lock clusters.",
    chainId: "frost_lance",
    rank: 1,
    upgradesTo: "frost_lance_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'ice', 'elemental'],
    animation: {
    cast: 'frost_cast',
    projectile: 'frost_proj',
    hit: 'frost_shatter',
    evolution: 'zero_freeze',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, element: 'ice', pierce: 1 }, { verb: 'applyStatus', status: 'slow', power: 0.35, duration: 1.4 }], damageMul: 1.0 },
  },
  {
    id: "frost_lance_ii",
    name: "Ice Spear",
    description: "Frost shots visibly slow, shell, and eventually lock clusters. Refined into Ice Spear.",
    chainId: "frost_lance",
    rank: 2,
    upgradesFrom: "frost_lance",
    upgradesTo: "frost_lance_iii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'ice', 'elemental'],
    animation: {
    cast: 'frost_cast',
    projectile: 'frost_proj',
    hit: 'frost_shatter',
    evolution: 'zero_freeze',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, element: 'ice', pierce: 1, spread: Math.PI / 16 }, { verb: 'applyStatus', status: 'slow', power: 0.5, duration: 2.4 }, { verb: 'frostBurst', radius: 38, damageMul: 0.45, freezeDur: 0.55, slow: 0.55 }], damageMul: 1.1 },
  },
  {
    id: "frost_lance_iii",
    name: "Absolute Zero",
    description: "A glacier burst shells the front line in ice.",
    chainId: "frost_lance",
    rank: 3,
    upgradesFrom: "frost_lance_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'ice', 'elemental'],
    animation: {
    cast: 'frost_cast',
    projectile: 'frost_proj',
    hit: 'frost_shatter',
    evolution: 'zero_freeze',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, element: 'ice', pierce: 2, spread: Math.PI / 12 }, { verb: 'frostBurst', radius: 62, damageMul: 0.75, freezeDur: 1.2, slow: 0.7 }, { verb: 'frostBurst', radius: 70, damageMul: 0.85, freezeDur: 1.4, slow: 0.65 }], damageMul: 1.2, note: 'Absolute Zero' },
  }
];

export default upgrades;
