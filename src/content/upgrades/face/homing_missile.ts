import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "homing_missile",
    name: "Homing Missile",
    description: "Tracks nearest foe, explodes on impact.",
    chainId: "homing_missile",
    rank: 1,
    upgradesTo: "homing_missile_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['projectile', 'homing', 'aoe'],
    animation: {
    cast: 'launch_cast',
    projectile: 'missile_trail',
    hit: 'explosion_small',
    evolution: 'cruise_mark',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, homing: true }], damageMul: 1.2 },
  },
  {
    id: "homing_missile_ii",
    name: "Seeker Missile",
    description: "Tracks nearest foe, explodes on impact. Refined into Seeker Missile.",
    chainId: "homing_missile",
    rank: 2,
    upgradesFrom: "homing_missile",
    upgradesTo: "homing_missile_iii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['projectile', 'homing', 'aoe'],
    animation: {
    cast: 'launch_cast',
    projectile: 'missile_trail',
    hit: 'explosion_small',
    evolution: 'cruise_mark',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, homing: true }, { verb: 'modifyProjectile', aoeOnHit: 24 }], damageMul: 1.3 },
  },
  {
    id: "homing_missile_iii",
    name: "Cruise Missile",
    description: "Marks foes for +50% damage.",
    chainId: "homing_missile",
    rank: 3,
    upgradesFrom: "homing_missile_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['projectile', 'homing', 'aoe'],
    animation: {
    cast: 'launch_cast',
    projectile: 'missile_trail',
    hit: 'explosion_small',
    evolution: 'cruise_mark',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 3, homing: true }, { verb: 'modifyProjectile', aoeOnHit: 40 }, { verb: 'applyStatus', status: 'mark', power: 1.5, duration: 3 }, { verb: 'applyStatus', status: 'mark', power: 1.5, duration: 3 }], damageMul: 1.5, note: 'Cruise' },
  }
];

export default upgrades;
