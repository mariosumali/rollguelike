import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "fire_bolt",
    name: "Fire Bolt",
    description: "Flaming shots erupt into visible pillars at higher tiers.",
    chainId: "fire_bolt",
    rank: 1,
    upgradesTo: "fire_bolt_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'fire', 'elemental'],
    animation: {
    cast: 'fire_cast',
    projectile: 'fire_proj',
    hit: 'fire_burst',
    evolution: 'phoenix_split',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, element: 'fire' }, { verb: 'modifyProjectile', burnDps: 3, burnDur: 2 }], damageMul: 1.0 },
  },
  {
    id: "fire_bolt_ii",
    name: "Flare Bolt",
    description: "Flaming shots erupt into visible pillars at higher tiers. Refined into Flare Bolt.",
    chainId: "fire_bolt",
    rank: 2,
    upgradesFrom: "fire_bolt",
    upgradesTo: "fire_bolt_iii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'fire', 'elemental'],
    animation: {
    cast: 'fire_cast',
    projectile: 'fire_proj',
    hit: 'fire_burst',
    evolution: 'phoenix_split',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, element: 'fire', spread: Math.PI / 10 }, { verb: 'flamePillar', count: 1, radius: 18, damageMul: 0.65, duration: 0.8, burnDps: 4, burnDur: 2.5 }], damageMul: 1.1 },
  },
  {
    id: "fire_bolt_iii",
    name: "Phoenix Bolt",
    description: "Calls a row of flame pillars and fans phoenix sparks.",
    chainId: "fire_bolt",
    rank: 3,
    upgradesFrom: "fire_bolt_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'fire', 'elemental'],
    animation: {
    cast: 'fire_cast',
    projectile: 'fire_proj',
    hit: 'fire_burst',
    evolution: 'phoenix_split',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, element: 'fire', spread: Math.PI / 8 }, { verb: 'flamePillar', count: 3, radius: 22, damageMul: 0.8, duration: 1.1, delay: 0.16, burnDps: 6, burnDur: 4 }, { verb: 'fireProjectile', count: 3, element: 'fire', spread: Math.PI / 4, damageMul: 0.65 }], damageMul: 1.2, note: 'Phoenix' },
  }
];

export default upgrades;
