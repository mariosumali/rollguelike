import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'black_hole',
  name: 'Black Hole',
  kind: 'replacer',
  rarity: 'legendary',
  description: 'Pulls foes in. Tick damage within radius.',
  tags: ['aoe', 'pull', 'void'],
  animation: {
    cast: 'void_cast',
    projectile: 'void_orb',
    hit: 'void_collapse',
    evolution: 'event_horizon',
  },
  evolution: {
    name: 'Event Horizon',
    flavor: 'Destroys enemy projectiles.',
    extraEffects: [{ verb: 'pull', radius: 120, strength: 1, dps: 0, duration: 0, destroyProjectiles: true }],
  },
  tiers: [
    { effects: [{ verb: 'pull', radius: 60, strength: 0.3, dps: 2, duration: 1 }], damageMul: 1.0 },
    { effects: [{ verb: 'pull', radius: 75, strength: 0.35, dps: 3, duration: 1.2 }], damageMul: 1.0 },
    { effects: [{ verb: 'pull', radius: 90, strength: 0.5, dps: 4, duration: 1.5 }], damageMul: 1.0 },
    { effects: [{ verb: 'pull', radius: 105, strength: 0.7, dps: 5, duration: 2 }], damageMul: 1.0 },
    { effects: [{ verb: 'pull', radius: 120, strength: 0.9, dps: 7, duration: 2.5, destroyProjectiles: true }], damageMul: 1.0, note: 'Event Horizon' },
  ],
};

export default upgrade;
