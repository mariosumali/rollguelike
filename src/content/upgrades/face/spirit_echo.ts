import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "spirit_echo",
    name: "Spirit Echo",
    description: "On a kill from this slot, releases a ghost that explodes on first contact.",
    chainId: "spirit_echo",
    rank: 1,
    upgradesTo: "spirit_echo_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'summon', 'onKill'],
    animation: {
    cast: 'wraith_bloom',
    projectile: 'minion_trail',
    hit: 'wraith_strike',
    evolution: 'echo_shimmer',
  },
    effect: { effects: [{ verb: 'summonMinion', kind: 'spirit', count: 1, hp: 1, duration: 2, damagePerHit: 3, trigger: 'onKill' }], damageMul: 1.0, params: { chance: 0.25 } },
  },
  {
    id: "spirit_echo_ii",
    name: "Twin Spirit",
    description: "On a kill from this slot, releases a ghost that explodes on first contact. Refined into Twin Spirit.",
    chainId: "spirit_echo",
    rank: 2,
    upgradesFrom: "spirit_echo",
    upgradesTo: "spirit_echo_iii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'summon', 'onKill'],
    animation: {
    cast: 'wraith_bloom',
    projectile: 'minion_trail',
    hit: 'wraith_strike',
    evolution: 'echo_shimmer',
  },
    effect: { effects: [{ verb: 'summonMinion', kind: 'spirit', count: 1, hp: 1, duration: 3, damagePerHit: 5, trigger: 'onKill' }], damageMul: 1.0, params: { chance: 0.55 } },
  },
  {
    id: "spirit_echo_iii",
    name: "Twin Echo",
    description: "Releases two ghosts that seek separate targets.",
    chainId: "spirit_echo",
    rank: 3,
    upgradesFrom: "spirit_echo_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'summon', 'onKill'],
    animation: {
    cast: 'wraith_bloom',
    projectile: 'minion_trail',
    hit: 'wraith_strike',
    evolution: 'echo_shimmer',
  },
    effect: { effects: [{ verb: 'summonMinion', kind: 'spirit', count: 2, hp: 1, duration: 4, damagePerHit: 9, trigger: 'onKill' }], damageMul: 1.0, params: { chance: 0.85 }, note: 'Twin Echo' },
  }
];

export default upgrades;
