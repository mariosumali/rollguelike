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
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.15 }], damageMul: 1.0, params: { executeBelow: 0.3, executeMul: 1.15 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.25 }], damageMul: 1.0, params: { executeBelow: 0.3, executeMul: 1.25 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.4 }], damageMul: 1.0, params: { executeBelow: 0.3, executeMul: 1.4 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.6 }], damageMul: 1.0, params: { executeBelow: 0.3, executeMul: 1.6 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.8 }], damageMul: 1.0, params: { executeBelow: 0.15, instaKillBelow: 0.15 }, note: "Reaper's Mark" },
  ],
};

export default upgrade;
