import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "bolt",
    name: "Bolt",
    description: "Piercing line. Fewer shots, deeper cuts.",
    chainId: "bolt",
    rank: 1,
    upgradesTo: "bolt_ii",
    kind: 'replacer',
    rarity: 'common',
    tags: ['projectile', 'pierce'],
    animation: {
    cast: 'muzzle_flash',
    projectile: 'bolt_proj',
    hit: 'pierce_spark',
    evolution: 'rail_streak',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, pierce: 1 }], damageMul: 1.1 },
  },
  {
    id: "bolt_ii",
    name: "Piercing Bolt",
    description: "Piercing line. Fewer shots, deeper cuts. Refined into Piercing Bolt.",
    chainId: "bolt",
    rank: 2,
    upgradesFrom: "bolt",
    upgradesTo: "bolt_iii",
    kind: 'replacer',
    rarity: 'common',
    tags: ['projectile', 'pierce'],
    animation: {
    cast: 'muzzle_flash',
    projectile: 'bolt_proj',
    hit: 'pierce_spark',
    evolution: 'rail_streak',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, pierce: 2 }], damageMul: 1.2 },
  },
  {
    id: "bolt_iii",
    name: "Rail",
    description: "Through everything.",
    chainId: "bolt",
    rank: 3,
    upgradesFrom: "bolt_ii",
    kind: 'replacer',
    rarity: 'common',
    tags: ['projectile', 'pierce'],
    animation: {
    cast: 'muzzle_flash',
    projectile: 'bolt_proj',
    hit: 'pierce_spark',
    evolution: 'rail_streak',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 3, pierce: 99 }, { verb: 'modifyProjectile', pierce: 99 }], damageMul: 1.4, note: 'Rail' },
  }
];

export default upgrades;
