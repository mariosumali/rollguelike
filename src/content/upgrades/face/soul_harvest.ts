import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'soul_harvest',
  name: 'Soul Harvest',
  kind: 'supplement',
  rarity: 'rare',
  description: "Necromancer only. Every 5 souls consumed spawns a hungry wraith.",
  tags: ['supplement', 'necromancer', 'summon'],
  characterExclusive: 'necromancer',
  animation: {
    cast: 'wraith_bloom',
    projectile: 'minion_trail',
    hit: 'wraith_strike',
    evolution: 'wraith_strike',
  },
  evolution: {
    name: 'Harvester',
    flavor: 'Every 3 souls instead, and wraiths pierce.',
  },
  tiers: [
    { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 1, hp: 4, duration: 2.5, damagePerHit: 4, trigger: 'onResolve' }], damageMul: 1.0, params: { soulsPerTrigger: 6 } },
    { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 1, hp: 5, duration: 3, damagePerHit: 5, trigger: 'onResolve' }], damageMul: 1.0, params: { soulsPerTrigger: 6 } },
    { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 1, hp: 6, duration: 3.5, damagePerHit: 6, trigger: 'onResolve' }], damageMul: 1.0, params: { soulsPerTrigger: 5 } },
    { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 2, hp: 7, duration: 4, damagePerHit: 7, trigger: 'onResolve' }], damageMul: 1.0, params: { soulsPerTrigger: 5 } },
    { effects: [{ verb: 'summonMinion', kind: 'wraith', count: 2, hp: 8, duration: 4.5, damagePerHit: 8, trigger: 'onResolve' }], damageMul: 1.0, params: { soulsPerTrigger: 4 }, note: 'Harvester' },
  ],
};

export default upgrade;
