import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "dragon_fang",
    name: "Dragon Fang",
    description: "Adds a giant piercing fang projectile to this slot.",
    chainId: "dragon_fang",
    rank: 1,
    upgradesTo: "dragon_fang_ii",
    kind: 'supplement',
    rarity: 'legendary',
    tags: ['supplement', 'giga', 'fire'],
    animation: {
    cast: 'dragon_roar',
    projectile: 'fang_proj',
    hit: 'fang_impact',
    evolution: 'wyrm_trail',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, pierce: 99, size: 2.0, damageMul: 3.0 }], damageMul: 1.0 },
  },
  {
    id: "dragon_fang_ii",
    name: "Wyrm Fang",
    description: "Adds a giant piercing fang projectile to this slot. Refined into Wyrm Fang.",
    chainId: "dragon_fang",
    rank: 2,
    upgradesFrom: "dragon_fang",
    upgradesTo: "dragon_fang_iii",
    kind: 'supplement',
    rarity: 'legendary',
    tags: ['supplement', 'giga', 'fire'],
    animation: {
    cast: 'dragon_roar',
    projectile: 'fang_proj',
    hit: 'fang_impact',
    evolution: 'wyrm_trail',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, pierce: 99, size: 2.3, damageMul: 5.0 }, { verb: 'applyStatus', status: 'burn', power: 3, duration: 2 }], damageMul: 1.0 },
  },
  {
    id: "dragon_fang_iii",
    name: "Wyrm",
    description: "Giants leave a lingering fire trail.",
    chainId: "dragon_fang",
    rank: 3,
    upgradesFrom: "dragon_fang_ii",
    kind: 'supplement',
    rarity: 'legendary',
    tags: ['supplement', 'giga', 'fire'],
    animation: {
    cast: 'dragon_roar',
    projectile: 'fang_proj',
    hit: 'fang_impact',
    evolution: 'wyrm_trail',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, pierce: 99, size: 2.6, damageMul: 7.0 }, { verb: 'applyStatus', status: 'burn', power: 5, duration: 3 }], damageMul: 1.0, note: 'Wyrm' },
  }
];

export default upgrades;
