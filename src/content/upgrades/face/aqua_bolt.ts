import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'aqua_bolt',
  name: 'Aqua Bolt',
  kind: 'replacer',
  rarity: 'rare',
  description: 'Bounces between enemies, heals on hit.',
  tags: ['projectile', 'water', 'elemental'],
  animation: {
    cast: 'aqua_cast',
    projectile: 'aqua_proj',
    hit: 'splash_ring',
    evolution: 'tide_pool',
  },
  evolution: {
    name: 'Tide Caller',
    flavor: 'Each bounce leaves a heal pickup.',
    extraEffects: [{ verb: 'spawnPickup', kind: 'heal', amount: 1, chance: 1 }],
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, bounce: 1 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 1, bounce: 2 }], damageMul: 1.05 },
    { effects: [{ verb: 'fireProjectile', count: 2, bounce: 2 }, { verb: 'modifyProjectile', lifesteal: 0.05 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 2, bounce: 3 }, { verb: 'modifyProjectile', lifesteal: 0.1 }], damageMul: 1.15 },
    { effects: [{ verb: 'fireProjectile', count: 2, bounce: 5 }, { verb: 'modifyProjectile', lifesteal: 0.15 }, { verb: 'spawnPickup', kind: 'heal', amount: 1, chance: 0.5 }], damageMul: 1.25, note: 'Tide Caller' },
  ],
};

export default upgrade;
