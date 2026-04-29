import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'homing_missile',
  name: 'Homing Missile',
  kind: 'replacer',
  rarity: 'epic',
  description: 'Tracks nearest foe, explodes on impact.',
  tags: ['projectile', 'homing', 'aoe'],
  animation: {
    cast: 'launch_cast',
    projectile: 'missile_trail',
    hit: 'explosion_small',
    evolution: 'cruise_mark',
  },
  evolution: {
    name: 'Cruise Missile',
    flavor: 'Marks foes for +50% damage.',
    extraEffects: [{ verb: 'applyStatus', status: 'mark', power: 1.5, duration: 3 }],
  },
  tiers: [
    { effects: [{ verb: 'fireProjectile', count: 1, homing: true }], damageMul: 1.2 },
    { effects: [{ verb: 'fireProjectile', count: 2, homing: true }, { verb: 'modifyProjectile', aoeOnHit: 24 }], damageMul: 1.3 },
    { effects: [{ verb: 'fireProjectile', count: 3, homing: true }, { verb: 'modifyProjectile', aoeOnHit: 40 }, { verb: 'applyStatus', status: 'mark', power: 1.5, duration: 3 }], damageMul: 1.5, note: 'Cruise' },
  ],
};

export default upgrade;
