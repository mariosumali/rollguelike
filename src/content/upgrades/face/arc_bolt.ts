import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'arc_bolt',
  name: 'Arc Bolt',
  kind: 'replacer',
  rarity: 'rare',
  description: 'Lightning that jumps between foes.',
  tags: ['projectile', 'lightning', 'elemental'],
  animation: {
    cast: 'spark_cast',
    projectile: 'arc_proj',
    hit: 'arc_chain',
    evolution: 'storm_chain',
  },
  evolution: {
    name: 'Storm Call',
    flavor: 'Chained hits stun.',
    extraEffects: [{ verb: 'applyStatus', status: 'stun', power: 1, duration: 0.3 }],
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, element: 'lightning' }, { verb: 'chain', maxChains: 2, decay: 0.5 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 1, element: 'lightning' }, { verb: 'chain', maxChains: 3, decay: 0.45 }], damageMul: 1.05 },
    { effects: [{ verb: 'fireProjectile', count: 1, element: 'lightning' }, { verb: 'chain', maxChains: 4, decay: 0.4 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 2, element: 'lightning' }, { verb: 'chain', maxChains: 4, decay: 0.35 }], damageMul: 1.2 },
    { effects: [{ verb: 'fireProjectile', count: 2, element: 'lightning' }, { verb: 'chain', maxChains: 6, decay: 0.2 }, { verb: 'applyStatus', status: 'stun', power: 1, duration: 0.3 }], damageMul: 1.3, note: 'Storm Call' },
  ],
};

export default upgrade;
