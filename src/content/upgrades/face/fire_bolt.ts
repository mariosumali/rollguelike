import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'fire_bolt',
  name: 'Fire Bolt',
  kind: 'replacer',
  rarity: 'rare',
  description: 'Ignites targets. Burn stacks with tier.',
  tags: ['projectile', 'fire', 'elemental'],
  animation: {
    cast: 'fire_cast',
    projectile: 'fire_proj',
    hit: 'fire_burst',
    evolution: 'phoenix_split',
  },
  evolution: {
    name: 'Phoenix Bolt',
    flavor: 'Splits on hit.',
    extraEffects: [{ verb: 'fireProjectile', count: 3, spread: Math.PI / 4 }],
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 1, duration: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 2, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 2, duration: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 2, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 2, duration: 3 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 3, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 3, duration: 3 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 3, element: 'fire' }, { verb: 'applyStatus', status: 'burn', power: 4, duration: 4 }, { verb: 'pulse', radius: 24, element: 'fire' }], damageMul: 1.2, note: 'Phoenix' },
  ],
};

export default upgrade;
