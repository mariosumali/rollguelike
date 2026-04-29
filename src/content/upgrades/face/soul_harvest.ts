import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "soul_harvest",
    name: "Soul Harvest",
    description: "Necromancer only. Every 5 souls consumed spawns a hungry wraith.",
    chainId: "soul_harvest",
    rank: 1,
    upgradesTo: "soul_harvest_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'necromancer', 'summon'],
    characterExclusive: 'necromancer',
    animation: {
    cast: 'wraith_bloom',
    projectile: 'minion_trail',
    hit: 'wraith_strike',
    evolution: 'wraith_strike',
  },
    effect: { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 1, hp: 4, duration: 2.5, damagePerHit: 4, trigger: 'onResolve' }], damageMul: 1.0, params: { soulsPerTrigger: 6 } },
  },
  {
    id: "soul_harvest_ii",
    name: "Wraith Harvest",
    description: "Necromancer only. Every 5 souls consumed spawns a hungry wraith. Refined into Wraith Harvest.",
    chainId: "soul_harvest",
    rank: 2,
    upgradesFrom: "soul_harvest",
    upgradesTo: "soul_harvest_iii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'necromancer', 'summon'],
    characterExclusive: 'necromancer',
    animation: {
    cast: 'wraith_bloom',
    projectile: 'minion_trail',
    hit: 'wraith_strike',
    evolution: 'wraith_strike',
  },
    effect: { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 1, hp: 6, duration: 3.5, damagePerHit: 6, trigger: 'onResolve' }], damageMul: 1.0, params: { soulsPerTrigger: 5 } },
  },
  {
    id: "soul_harvest_iii",
    name: "Harvester",
    description: "Every 3 souls instead, and wraiths pierce.",
    chainId: "soul_harvest",
    rank: 3,
    upgradesFrom: "soul_harvest_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'necromancer', 'summon'],
    characterExclusive: 'necromancer',
    animation: {
    cast: 'wraith_bloom',
    projectile: 'minion_trail',
    hit: 'wraith_strike',
    evolution: 'wraith_strike',
  },
    effect: { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 2, hp: 8, duration: 4.5, damagePerHit: 8, trigger: 'onResolve' }], damageMul: 1.0, params: { soulsPerTrigger: 4 }, note: 'Harvester' },
  }
];

export default upgrades;
