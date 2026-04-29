import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'dragon_fang',
  name: 'Dragon Fang',
  kind: 'supplement',
  rarity: 'legendary',
  description: 'Adds a giant piercing fang projectile to this slot.',
  tags: ['supplement', 'giga', 'fire'],
  animation: {
    cast: 'dragon_roar',
    projectile: 'fang_proj',
    hit: 'fang_impact',
    evolution: 'wyrm_trail',
  },
  evolution: {
    name: 'Wyrm',
    flavor: 'Giants leave a lingering fire trail.',
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, pierce: 99, size: 2.0, damageMul: 3.0 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 1, pierce: 99, size: 2.3, damageMul: 5.0 }, { verb: 'applyStatus', status: 'burn', power: 3, duration: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 2, pierce: 99, size: 2.6, damageMul: 7.0 }, { verb: 'applyStatus', status: 'burn', power: 5, duration: 3 }], damageMul: 1.0, note: 'Wyrm' },
  ],
};

export default upgrade;
