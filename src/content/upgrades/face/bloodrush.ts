import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "bloodrush",
    name: "Bloodrush",
    description: "Berserker only. At 5+ rage, kills grant a 3s window where slot resolves re-trigger.",
    chainId: "bloodrush",
    rank: 1,
    upgradesTo: "bloodrush_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'berserker', 'rage', 'onKill'],
    characterExclusive: 'berserker',
    animation: {
    cast: 'blood_mist',
    hit: 'rage_flame',
    evolution: 'rage_flame_max',
  },
    effect: { effects: [{ verb: 'modifyProjectile', damageMul: 1.1 }], damageMul: 1.0, params: { requireRage: 5, windowSec: 3, onKillReResolve: 1 } },
  },
  {
    id: "bloodrush_ii",
    name: "Frenzy Rush",
    description: "Berserker only. At 5+ rage, kills grant a 3s window where slot resolves re-trigger. Refined into Frenzy Rush.",
    chainId: "bloodrush",
    rank: 2,
    upgradesFrom: "bloodrush",
    upgradesTo: "bloodrush_iii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'berserker', 'rage', 'onKill'],
    characterExclusive: 'berserker',
    animation: {
    cast: 'blood_mist',
    hit: 'rage_flame',
    evolution: 'rage_flame_max',
  },
    effect: { effects: [{ verb: 'modifyProjectile', damageMul: 1.2 }], damageMul: 1.0, params: { requireRage: 4, windowSec: 3.5, onKillReResolve: 1 } },
  },
  {
    id: "bloodrush_iii",
    name: "Rampage",
    description: "Window extends and ignores any remaining cooldown.",
    chainId: "bloodrush",
    rank: 3,
    upgradesFrom: "bloodrush_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'berserker', 'rage', 'onKill'],
    characterExclusive: 'berserker',
    animation: {
    cast: 'blood_mist',
    hit: 'rage_flame',
    evolution: 'rage_flame_max',
  },
    effect: { effects: [{ verb: 'modifyProjectile', damageMul: 1.4 }, { verb: 'pulse', radius: 24, damageMul: 0.5 }], damageMul: 1.0, params: { requireRage: 3, windowSec: 5, onKillReResolve: 2 }, note: 'Rampage' },
  }
];

export default upgrades;
