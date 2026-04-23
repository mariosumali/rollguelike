import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'volatile_core',
  name: 'Volatile Core',
  kind: 'supplement',
  rarity: 'epic',
  description: 'Chance for kills from this slot to trigger a small explosion.',
  tags: ['supplement', 'aoe', 'onKill'],
  animation: {
    cast: 'muzzle_flash',
    hit: 'explosion_small',
    evolution: 'meteor_crash',
  },
  evolution: {
    name: 'Chain Reactor',
    flavor: 'Explosions always trigger and can chain off each other.',
    extraEffects: [{ verb: 'pulse', radius: 36, damageMul: 1.1 }],
  },
  tiers: [
    { effects: [{ verb: 'pulse', radius: 24, damageMul: 0.5 }], damageMul: 1.0, params: { chance: 0.2 } },
    { effects: [{ verb: 'pulse', radius: 26, damageMul: 0.6 }], damageMul: 1.0, params: { chance: 0.3 } },
    { effects: [{ verb: 'pulse', radius: 28, damageMul: 0.7 }], damageMul: 1.0, params: { chance: 0.4 } },
    { effects: [{ verb: 'pulse', radius: 30, damageMul: 0.8 }], damageMul: 1.0, params: { chance: 0.5 } },
    { effects: [{ verb: 'pulse', radius: 34, damageMul: 1.0 }], damageMul: 1.0, params: { chance: 1.0 }, note: 'Chain Reactor' },
  ],
};

export default upgrade;
