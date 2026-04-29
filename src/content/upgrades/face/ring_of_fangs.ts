import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "ring_of_fangs",
    name: "Ring of Fangs",
    description: "Summons orbiting bone fangs that tear anything they touch.",
    chainId: "ring_of_fangs",
    rank: 1,
    upgradesTo: "ring_of_fangs_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['orbit', 'persistent', 'bone'],
    animation: {
    cast: 'orbit_cast',
    projectile: 'fang_orbit',
    hit: 'fang_bite',
    evolution: 'eternal_circle',
  },
    effect: { effects: [{ verb: 'orbit', count: 3, radius: 28, rpm: 120, damageMul: 0.8, duration: 3, pierce: 1 }], damageMul: 1.0 },
  },
  {
    id: "ring_of_fangs_ii",
    name: "Fang Spiral",
    description: "Summons orbiting bone fangs that tear anything they touch. Refined into Fang Circle.",
    chainId: "ring_of_fangs",
    rank: 2,
    upgradesFrom: "ring_of_fangs",
    upgradesTo: "ring_of_fangs_iii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['orbit', 'persistent', 'bone'],
    animation: {
    cast: 'orbit_cast',
    projectile: 'fang_orbit',
    hit: 'fang_bite',
    evolution: 'eternal_circle',
  },
    effect: { effects: [{ verb: 'orbit', count: 4, radius: 32, rpm: 150, damageMul: 1.0, duration: 4, pierce: 1 }], damageMul: 1.1 },
  },
  {
    id: "ring_of_fangs_iii",
    name: "Eternal Circle",
    description: "The ring lingers noticeably longer before fading.",
    chainId: "ring_of_fangs",
    rank: 3,
    upgradesFrom: "ring_of_fangs_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['orbit', 'persistent', 'bone'],
    animation: {
    cast: 'orbit_cast',
    projectile: 'fang_orbit',
    hit: 'fang_bite',
    evolution: 'eternal_circle',
  },
    effect: { effects: [{ verb: 'orbit', count: 6, radius: 36, rpm: 180, damageMul: 1.25, duration: 5, pierce: 2 }, { verb: 'orbit', count: 6, radius: 36, rpm: 180, damageMul: 1.2, duration: 8, pierce: 2 }], damageMul: 1.2, note: 'Eternal Circle' },
  }
];

export default upgrades;
