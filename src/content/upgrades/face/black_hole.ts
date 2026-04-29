import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'black_hole',
  name: 'Black Hole',
  kind: 'replacer',
  rarity: 'legendary',
  description: 'Pulls foes into a visible void well and marks survivors.',
  tags: ['aoe', 'pull', 'void'],
  animation: {
    cast: 'void_cast',
    projectile: 'void_orb',
    hit: 'void_collapse',
    evolution: 'event_horizon',
  },
  evolution: {
    name: 'Event Horizon',
    flavor: 'The well becomes an event horizon that brands everything inside.',
    extraEffects: [{ verb: 'statusAura', status: 'mark', radius: 120, power: 2.5, duration: 3 }],
  },
  tiers: [
    { effects: [{ verb: 'pull', radius: 60, strength: 0.3, dps: 2, duration: 1 }], damageMul: 1.0 },
    { effects: [{ verb: 'pull', radius: 90, strength: 0.55, dps: 4, duration: 1.5 }, { verb: 'groundZone', radius: 54, dps: 3, duration: 1.5, element: 'arcane', slow: 0.3 }], damageMul: 1.0 },
    { effects: [{ verb: 'pull', radius: 120, strength: 0.9, dps: 7, duration: 2.5, destroyProjectiles: true }, { verb: 'groundZone', radius: 76, dps: 6, duration: 2.5, element: 'arcane', slow: 0.45 }, { verb: 'statusAura', status: 'mark', radius: 120, power: 2, duration: 3 }], damageMul: 1.0, note: 'Event Horizon' },
  ],
};

export default upgrade;
