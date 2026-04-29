import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "piercing_core",
    name: "Piercing Core",
    description: "Adds pierce to all projectiles from this slot.",
    chainId: "piercing_core",
    rank: 1,
    upgradesTo: "piercing_core_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'pierce'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'pierce_spark',
    evolution: 'harpoon_pull',
  },
    effect: { effects: [{ verb: 'modifyProjectile', pierce: 1 }], damageMul: 1.0 },
  },
  {
    id: "piercing_core_ii",
    name: "Harpoon Core",
    description: "Adds pierce to all projectiles from this slot. Refined into Harpoon Core.",
    chainId: "piercing_core",
    rank: 2,
    upgradesFrom: "piercing_core",
    upgradesTo: "piercing_core_iii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'pierce'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'pierce_spark',
    evolution: 'harpoon_pull',
  },
    effect: { effects: [{ verb: 'modifyProjectile', pierce: 2 }], damageMul: 1.0 },
  },
  {
    id: "piercing_core_iii",
    name: "Harpoon",
    description: "Past pierce cap, pulls pierced foes toward you.",
    chainId: "piercing_core",
    rank: 3,
    upgradesFrom: "piercing_core_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'pierce'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'pierce_spark',
    evolution: 'harpoon_pull',
  },
    effect: { effects: [{ verb: 'modifyProjectile', pierce: 3 }], damageMul: 1.0, note: 'Harpoon', params: { pullAfterCap: 1 } },
  }
];

export default upgrades;
