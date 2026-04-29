import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'overwatch',
  name: 'Overwatch',
  kind: 'supplement',
  rarity: 'rare',
  description: "Knight only. On a roll of 6, the next two rolls fire at max volley.",
  tags: ['supplement', 'soldier', 'multishot'],
  characterExclusive: 'soldier',
  animation: {
    cast: 'muzzle_flash',
    hit: 'std_burst',
    evolution: 'volley_burst',
  },
  evolution: {
    name: 'Full Overwatch',
    flavor: 'Extends the locked-on window and carries over into pulses.',
  },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', extra: 1 }], damageMul: 1.0, params: { onSix: 1, lockRolls: 2 } },
    { effects: [{ verb: 'modifyProjectile', extra: 2 }], damageMul: 1.0, params: { onSix: 1, lockRolls: 3 } },
    { effects: [{ verb: 'modifyProjectile', extra: 4 }], damageMul: 1.0, params: { onSix: 1, lockRolls: 4 }, note: 'Full Overwatch' },
  ],
};

export default upgrade;
