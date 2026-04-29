import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "extra_shot",
    name: "Extra Shot",
    description: "Adds extra projectiles to whatever this slot fires.",
    chainId: "extra_shot",
    rank: 1,
    upgradesTo: "extra_shot_ii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'multishot'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'std_burst',
    evolution: 'salvo_home',
  },
    effect: { effects: [{ verb: 'modifyProjectile', extra: 1 }], damageMul: 1.0 },
  },
  {
    id: "extra_shot_ii",
    name: "Salvo Shot",
    description: "Adds extra projectiles to whatever this slot fires. Refined into Salvo Shot.",
    chainId: "extra_shot",
    rank: 2,
    upgradesFrom: "extra_shot",
    upgradesTo: "extra_shot_iii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'multishot'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'std_burst',
    evolution: 'salvo_home',
  },
    effect: { effects: [{ verb: 'modifyProjectile', extra: 3 }], damageMul: 1.0 },
  },
  {
    id: "extra_shot_iii",
    name: "Salvo",
    description: "Extras gently home.",
    chainId: "extra_shot",
    rank: 3,
    upgradesFrom: "extra_shot_ii",
    kind: 'supplement',
    rarity: 'common',
    tags: ['supplement', 'multishot'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'std_burst',
    evolution: 'salvo_home',
  },
    effect: { effects: [{ verb: 'modifyProjectile', extra: 5, homing: true }, { verb: 'modifyProjectile', extra: 0, homing: true }], damageMul: 1.0, note: 'Salvo' },
  }
];

export default upgrades;
