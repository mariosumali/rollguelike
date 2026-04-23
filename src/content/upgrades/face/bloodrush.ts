import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'bloodrush',
  name: 'Bloodrush',
  kind: 'supplement',
  rarity: 'epic',
  description: "Berserker only. At 5+ rage, kills grant a 3s window where slot resolves re-trigger.",
  tags: ['supplement', 'berserker', 'rage', 'onKill'],
  characterExclusive: 'berserker',
  animation: {
    cast: 'blood_mist',
    hit: 'rage_flame',
    evolution: 'rage_flame_max',
  },
  evolution: {
    name: 'Rampage',
    flavor: 'Window extends and ignores any remaining cooldown.',
  },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.1 }], damageMul: 1.0, params: { requireRage: 5, windowSec: 3, onKillReResolve: 1 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.15 }], damageMul: 1.0, params: { requireRage: 5, windowSec: 3, onKillReResolve: 1 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.2 }], damageMul: 1.0, params: { requireRage: 4, windowSec: 3.5, onKillReResolve: 1 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.3 }], damageMul: 1.0, params: { requireRage: 4, windowSec: 4, onKillReResolve: 1 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.4 }, { verb: 'pulse', radius: 24, damageMul: 0.5 }], damageMul: 1.0, params: { requireRage: 3, windowSec: 5, onKillReResolve: 2 }, note: 'Rampage' },
  ],
};

export default upgrade;
