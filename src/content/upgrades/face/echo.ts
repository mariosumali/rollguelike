import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'echo',
  name: 'Echo',
  kind: 'supplement',
  rarity: 'epic',
  description: 'Chance to resolve this slot twice.',
  tags: ['supplement', 'echo'],
  animation: {
    cast: 'echo_shimmer',
    hit: 'std_burst',
    evolution: 'triplet_flash',
  },
  evolution: {
    name: 'Triplet',
    flavor: 'Always resolves 3x, but slot is locked out next roll.',
  },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.0 }], damageMul: 1.0, params: { doubleChance: 0.15 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.0 }], damageMul: 1.0, params: { doubleChance: 0.22 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.0 }], damageMul: 1.0, params: { doubleChance: 0.3 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.0 }], damageMul: 1.0, params: { doubleChance: 0.4 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.0 }], damageMul: 1.0, params: { tripleAlways: 1, lockoutNext: 1 }, note: 'Triplet' },
  ],
};

export default upgrade;
