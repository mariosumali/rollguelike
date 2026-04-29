import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "quantity",
    name: "Quantity",
    description: "Bonus projectiles from face value. The old default, now an opt-in.",
    chainId: "quantity",
    rank: 1,
    upgradesTo: "quantity_ii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'multishot'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'std_burst',
    evolution: 'volley_burst',
  },
    effect: { effects: [{ verb: 'modifyProjectile', extra: 1 }], damageMul: 1.0, params: { minValue: 3 } },
  },
  {
    id: "quantity_ii",
    name: "Wide Volley",
    description: "Bonus projectiles from face value. The old default, now an opt-in. Refined into Wide Volley.",
    chainId: "quantity",
    rank: 2,
    upgradesFrom: "quantity",
    upgradesTo: "quantity_iii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'multishot'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'std_burst',
    evolution: 'volley_burst',
  },
    effect: { effects: [{ verb: 'modifyProjectile', extra: 2 }], damageMul: 1.0, params: { valueMul: 0.75 } },
  },
  {
    id: "quantity_iii",
    name: "Abundance",
    description: "+10% crit per bonus projectile.",
    chainId: "quantity",
    rank: 3,
    upgradesFrom: "quantity_ii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'multishot'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'std_burst',
    evolution: 'volley_burst',
  },
    effect: { effects: [{ verb: 'modifyProjectile', extra: 4, crit: 0.1 }, { verb: 'modifyProjectile', crit: 0.1 }], damageMul: 1.0, params: { valueMul: 1.25 }, note: 'Abundance' },
  }
];

export default upgrades;
