import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'frost_lance',
  name: 'Frost Lance',
  kind: 'replacer',
  rarity: 'rare',
  description: 'Frost shots visibly slow, shell, and eventually lock clusters.',
  tags: ['projectile', 'ice', 'elemental'],
  animation: {
    cast: 'frost_cast',
    projectile: 'frost_proj',
    hit: 'frost_shatter',
    evolution: 'zero_freeze',
  },
  evolution: {
    name: 'Absolute Zero',
    flavor: 'A glacier burst shells the front line in ice.',
    extraEffects: [{ verb: 'frostBurst', radius: 70, damageMul: 0.85, freezeDur: 1.4, slow: 0.65 }],
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, element: 'ice', pierce: 1 }, { verb: 'applyStatus', status: 'slow', power: 0.35, duration: 1.4 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 2, element: 'ice', pierce: 1, spread: Math.PI / 16 }, { verb: 'applyStatus', status: 'slow', power: 0.5, duration: 2.4 }, { verb: 'frostBurst', radius: 38, damageMul: 0.45, freezeDur: 0.55, slow: 0.55 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 2, element: 'ice', pierce: 2, spread: Math.PI / 12 }, { verb: 'frostBurst', radius: 62, damageMul: 0.75, freezeDur: 1.2, slow: 0.7 }], damageMul: 1.2, note: 'Absolute Zero' },
  ],
};

export default upgrade;
