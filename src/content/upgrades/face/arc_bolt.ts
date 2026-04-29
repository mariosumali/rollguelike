import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'arc_bolt',
  name: 'Arc Bolt',
  kind: 'replacer',
  rarity: 'rare',
  description: 'Lightning visibly jumps between foes.',
  tags: ['projectile', 'lightning', 'elemental'],
  animation: {
    cast: 'spark_cast',
    projectile: 'arc_proj',
    hit: 'arc_chain',
    evolution: 'storm_chain',
  },
  evolution: {
    name: 'Storm Call',
    flavor: 'The die itself lashes out with a storm web.',
    extraEffects: [{ verb: 'chainLightning', jumps: 5, damageMul: 0.75, radius: 120, stunDur: 0.35, fromDie: true }],
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, element: 'lightning' }, { verb: 'chain', maxChains: 2, decay: 0.5 }], damageMul: 1.0 },
    { effects: [{ verb: 'fireProjectile', count: 1, element: 'lightning' }, { verb: 'chainLightning', jumps: 3, damageMul: 0.55, radius: 95, stunDur: 0.2 }], damageMul: 1.1 },
    { effects: [{ verb: 'fireProjectile', count: 2, element: 'lightning', spread: Math.PI / 14 }, { verb: 'chainLightning', jumps: 5, damageMul: 0.7, radius: 120, stunDur: 0.35, fromDie: true }], damageMul: 1.25, note: 'Storm Call' },
  ],
};

export default upgrade;
