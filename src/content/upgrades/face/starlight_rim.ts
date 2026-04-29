import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "starlight_rim",
    name: "Starlight Rim",
    description: "Projectiles gently home, and on expiry leave a one-shot orbit fang.",
    chainId: "starlight_rim",
    rank: 1,
    upgradesTo: "starlight_rim_ii",
    kind: 'supplement',
    rarity: 'legendary',
    tags: ['supplement', 'homing', 'orbit', 'arcane'],
    animation: {
    cast: 'orbit_cast',
    hit: 'pierce_spark',
    evolution: 'eternal_circle',
  },
    effect: { effects: [{ verb: 'modifyProjectile', homing: true }, { verb: 'orbit', count: 1, radius: 18, rpm: 160, damageMul: 0.4, duration: 0.6 }], damageMul: 1.0 },
  },
  {
    id: "starlight_rim_ii",
    name: "Star Halo",
    description: "Projectiles gently home, and on expiry leave a one-shot orbit fang. Refined into Star Halo.",
    chainId: "starlight_rim",
    rank: 2,
    upgradesFrom: "starlight_rim",
    upgradesTo: "starlight_rim_iii",
    kind: 'supplement',
    rarity: 'legendary',
    tags: ['supplement', 'homing', 'orbit', 'arcane'],
    animation: {
    cast: 'orbit_cast',
    hit: 'pierce_spark',
    evolution: 'eternal_circle',
  },
    effect: { effects: [{ verb: 'modifyProjectile', homing: true }, { verb: 'orbit', count: 1, radius: 22, rpm: 180, damageMul: 0.6, duration: 1.0 }], damageMul: 1.0 },
  },
  {
    id: "starlight_rim_iii",
    name: "Constellation",
    description: "Remnant fangs link into a dim ring.",
    chainId: "starlight_rim",
    rank: 3,
    upgradesFrom: "starlight_rim_ii",
    kind: 'supplement',
    rarity: 'legendary',
    tags: ['supplement', 'homing', 'orbit', 'arcane'],
    animation: {
    cast: 'orbit_cast',
    hit: 'pierce_spark',
    evolution: 'eternal_circle',
  },
    effect: { effects: [{ verb: 'modifyProjectile', homing: true }, { verb: 'orbit', count: 2, radius: 26, rpm: 200, damageMul: 0.9, duration: 1.5 }, { verb: 'orbit', count: 2, radius: 30, rpm: 140, damageMul: 0.6, duration: 1.5 }], damageMul: 1.0, note: 'Constellation' },
  }
];

export default upgrades;
