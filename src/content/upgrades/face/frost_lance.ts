import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'frost_lance',
  name: 'Frost Lance',
  kind: 'replacer',
  rarity: 'rare',
  description: 'Slows targets, and eventually locks them.',
  tags: ['projectile', 'ice', 'elemental'],
  animation: {
    cast: 'frost_cast',
    projectile: 'frost_proj',
    hit: 'frost_shatter',
    evolution: 'zero_freeze',
  },
  evolution: {
    name: 'Absolute Zero',
    flavor: 'Crits guarantee freeze.',
    extraEffects: [{ verb: 'applyStatus', status: 'freeze', power: 1, duration: 1.2, chance: 1 }],
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, element: 'ice' }, { verb: 'applyStatus', status: 'slow', power: 0.25, duration: 1 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 1, element: 'ice' }, { verb: 'applyStatus', status: 'slow', power: 0.35, duration: 1.5 }, { verb: 'applyStatus', status: 'freeze', power: 1, duration: 0.6, chance: 0.05 }], damageMul: 1.05 },
    { effects: [{ verb: 'fireProjectile', count: 2, element: 'ice' }, { verb: 'applyStatus', status: 'slow', power: 0.4, duration: 2 }, { verb: 'applyStatus', status: 'freeze', power: 1, duration: 0.8, chance: 0.1 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 2, element: 'ice' }, { verb: 'applyStatus', status: 'slow', power: 0.5, duration: 2.5 }, { verb: 'applyStatus', status: 'freeze', power: 1, duration: 1, chance: 0.15 }], damageMul: 1.15 },
    { effects: [{ verb: 'fireProjectile', count: 2, element: 'ice' }, { verb: 'applyStatus', status: 'slow', power: 0.6, duration: 3 }, { verb: 'applyStatus', status: 'freeze', power: 1, duration: 1.2, chance: 0.25 }], damageMul: 1.25, note: 'Absolute Zero' },
  ],
};

export default upgrade;
