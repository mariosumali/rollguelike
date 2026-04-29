import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "volatile_core",
    name: "Volatile Core",
    description: "Chance for kills from this slot to trigger a small explosion.",
    chainId: "volatile_core",
    rank: 1,
    upgradesTo: "volatile_core_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'aoe', 'onKill'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'explosion_small',
    evolution: 'meteor_crash',
  },
    effect: { effects: [{ verb: 'pulse', radius: 24, damageMul: 0.5 }], damageMul: 1.0, params: { chance: 0.2 } },
  },
  {
    id: "volatile_core_ii",
    name: "Unstable Core",
    description: "Chance for kills from this slot to trigger a small explosion. Refined into Unstable Core.",
    chainId: "volatile_core",
    rank: 2,
    upgradesFrom: "volatile_core",
    upgradesTo: "volatile_core_iii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'aoe', 'onKill'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'explosion_small',
    evolution: 'meteor_crash',
  },
    effect: { effects: [{ verb: 'pulse', radius: 28, damageMul: 0.7 }], damageMul: 1.0, params: { chance: 0.4 } },
  },
  {
    id: "volatile_core_iii",
    name: "Chain Reactor",
    description: "Explosions always trigger and can chain off each other.",
    chainId: "volatile_core",
    rank: 3,
    upgradesFrom: "volatile_core_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'aoe', 'onKill'],
    animation: {
    cast: 'muzzle_flash',
    hit: 'explosion_small',
    evolution: 'meteor_crash',
  },
    effect: { effects: [{ verb: 'pulse', radius: 34, damageMul: 1.0 }, { verb: 'pulse', radius: 36, damageMul: 1.1 }], damageMul: 1.0, params: { chance: 1.0 }, note: 'Chain Reactor' },
  }
];

export default upgrades;
