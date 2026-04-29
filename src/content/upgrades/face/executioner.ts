import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "executioner",
    name: "Executioner",
    description: "Bonus damage to wounded foes. At max tier, finishes them outright.",
    chainId: "executioner",
    rank: 1,
    upgradesTo: "executioner_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'execute'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'blood_mist',
    evolution: 'cruise_mark',
  },
    effect: { effects: [{ verb: 'modifyProjectile', damageMul: 1.08 }], damageMul: 1.0, params: { executeBelow: 0.25, executeMul: 1.1 } },
  },
  {
    id: "executioner_ii",
    name: "Marked Executioner",
    description: "Bonus damage to wounded foes. At max tier, finishes them outright. Refined into Marked Executioner.",
    chainId: "executioner",
    rank: 2,
    upgradesFrom: "executioner",
    upgradesTo: "executioner_iii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'execute'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'blood_mist',
    evolution: 'cruise_mark',
  },
    effect: { effects: [{ verb: 'modifyProjectile', damageMul: 1.22 }], damageMul: 1.0, params: { executeBelow: 0.25, executeMul: 1.28 } },
  },
  {
    id: "executioner_iii",
    name: "Reaper's Mark",
    description: "Instantly kills enemies below 15% HP.",
    chainId: "executioner",
    rank: 3,
    upgradesFrom: "executioner_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'execute'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'blood_mist',
    evolution: 'cruise_mark',
  },
    effect: { effects: [{ verb: 'modifyProjectile', damageMul: 1.45 }], damageMul: 1.0, params: { executeBelow: 0.1, instaKillBelow: 0.1 }, note: "Reaper's Mark" },
  }
];

export default upgrades;
