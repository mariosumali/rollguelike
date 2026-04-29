import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'spirit_echo',
  name: 'Spirit Echo',
  kind: 'supplement',
  rarity: 'epic',
  description: 'On a kill from this slot, releases a ghost that explodes on first contact.',
  tags: ['supplement', 'summon', 'onKill'],
  animation: {
    cast: 'wraith_bloom',
    projectile: 'minion_trail',
    hit: 'wraith_strike',
    evolution: 'echo_shimmer',
  },
  evolution: {
    name: 'Twin Echo',
    flavor: 'Releases two ghosts that seek separate targets.',
  },
  tiers: [
    { effects: [{ verb: 'summonMinion', kind: 'spirit', count: 1, hp: 1, duration: 2, damagePerHit: 3, trigger: 'onKill' }], damageMul: 1.0, params: { chance: 0.25 } },
    { effects: [{ verb: 'summonMinion', kind: 'spirit', count: 1, hp: 1, duration: 3, damagePerHit: 5, trigger: 'onKill' }], damageMul: 1.0, params: { chance: 0.55 } },
    { effects: [{ verb: 'summonMinion', kind: 'spirit', count: 2, hp: 1, duration: 4, damagePerHit: 9, trigger: 'onKill' }], damageMul: 1.0, params: { chance: 0.85 }, note: 'Twin Echo' },
  ],
};

export default upgrade;
