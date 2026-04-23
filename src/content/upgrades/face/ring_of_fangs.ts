import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'ring_of_fangs',
  name: 'Ring of Fangs',
  kind: 'replacer',
  rarity: 'epic',
  description: 'Summons orbiting bone fangs that tear anything they touch.',
  tags: ['orbit', 'persistent', 'bone'],
  animation: {
    cast: 'orbit_cast',
    projectile: 'fang_orbit',
    hit: 'fang_bite',
    evolution: 'eternal_circle',
  },
  evolution: {
    name: 'Eternal Circle',
    flavor: 'The ring persists until wave end.',
    extraEffects: [{ verb: 'orbit', count: 6, radius: 36, rpm: 180, damageMul: 1.2, duration: 99, pierce: 2 }],
  },
  tiers: [
    { effects: [{ verb: 'orbit', count: 3, radius: 28, rpm: 120, damageMul: 0.8, duration: 3, pierce: 1 }], damageMul: 1.0 },
    { effects: [{ verb: 'orbit', count: 3, radius: 30, rpm: 140, damageMul: 0.9, duration: 3.5, pierce: 1 }], damageMul: 1.05 },
    { effects: [{ verb: 'orbit', count: 4, radius: 32, rpm: 150, damageMul: 1.0, duration: 4, pierce: 1 }], damageMul: 1.1 },
    { effects: [{ verb: 'orbit', count: 5, radius: 34, rpm: 160, damageMul: 1.1, duration: 4.5, pierce: 2 }], damageMul: 1.15 },
    { effects: [{ verb: 'orbit', count: 6, radius: 36, rpm: 180, damageMul: 1.25, duration: 5, pierce: 2 }], damageMul: 1.2, note: 'Eternal Circle' },
  ],
};

export default upgrade;
