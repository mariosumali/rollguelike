import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'ricochet',
  name: 'Ricochet',
  kind: 'supplement',
  rarity: 'rare',
  description: 'Bounces chain-spark between enemies on each rebound.',
  tags: ['supplement', 'bounce', 'chain', 'lightning'],
  animation: {
    cast: 'spark_cast',
    hit: 'arc_chain',
    evolution: 'storm_chain',
  },
  evolution: {
    name: 'Storm Chain',
    flavor: 'Each bounce arcs lightning to a second enemy.',
    extraEffects: [{ verb: 'chain', maxChains: 3, decay: 0.25 }],
  },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', bounce: 1 }, { verb: 'chain', maxChains: 1, decay: 0.5 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', bounce: 2 }, { verb: 'chain', maxChains: 2, decay: 0.4 }], damageMul: 1.0 },
    { effects: [{ verb: 'modifyProjectile', bounce: 4 }, { verb: 'chain', maxChains: 3, decay: 0.3 }], damageMul: 1.0, note: 'Storm Chain' },
  ],
};

export default upgrade;
