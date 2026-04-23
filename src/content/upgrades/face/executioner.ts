import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'executioner',
  name: 'Executioner',
  kind: 'supplement',
  rarity: 'rare',
  description: 'Bonus damage to wounded foes. At max tier, finishes them outright.',
  tags: ['supplement', 'execute'],
  animation: {
    cast: 'muzzle_flash',
    hit: 'blood_mist',
    evolution: 'cruise_mark',
  },
  evolution: {
    name: "Reaper's Mark",
    flavor: 'Instantly kills enemies below 15% HP.',
  },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.08 }], damageMul: 1.0, params: { executeBelow: 0.25, executeMul: 1.1 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.14 }], damageMul: 1.0, params: { executeBelow: 0.25, executeMul: 1.18 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.22 }], damageMul: 1.0, params: { executeBelow: 0.25, executeMul: 1.28 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.32 }], damageMul: 1.0, params: { executeBelow: 0.25, executeMul: 1.4 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.45 }], damageMul: 1.0, params: { executeBelow: 0.1, instaKillBelow: 0.1 }, note: "Reaper's Mark" },
  ],
};

export default upgrade;
