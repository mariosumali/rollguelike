import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'bolt',
  name: 'Bolt',
  kind: 'replacer',
  rarity: 'common',
  description: 'Piercing line. Fewer shots, deeper cuts.',
  tags: ['projectile', 'pierce'],
  animation: {
    cast: 'muzzle_flash',
    projectile: 'bolt_proj',
    hit: 'pierce_spark',
    evolution: 'rail_streak',
  },
  evolution: {
    name: 'Rail',
    flavor: 'Through everything.',
    extraEffects: [{ verb: 'modifyProjectile', pierce: 99 }],
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, pierce: 1 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 2, pierce: 2 }], damageMul: 1.2 },
    { effects: [{ verb: 'fireProjectile', count: 3, pierce: 99 }], damageMul: 1.4, note: 'Rail' },
  ],
};

export default upgrade;
