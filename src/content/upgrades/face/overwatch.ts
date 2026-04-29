import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "overwatch",
    name: "Overwatch",
    description: "Knight only. On a roll of 6, the next two rolls fire at max volley.",
    chainId: "overwatch",
    rank: 1,
    upgradesTo: "overwatch_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'soldier', 'multishot'],
    characterExclusive: 'soldier',
    animation: {
    cast: 'muzzle_flash',
    hit: 'std_burst',
    evolution: 'volley_burst',
  },
    effect: { effects: [{ verb: 'modifyProjectile', extra: 1 }], damageMul: 1.0, params: { onSix: 1, lockRolls: 2 } },
  },
  {
    id: "overwatch_ii",
    name: "Watchful Volley",
    description: "Knight only. On a roll of 6, the next two rolls fire at max volley. Refined into Watchful Volley.",
    chainId: "overwatch",
    rank: 2,
    upgradesFrom: "overwatch",
    upgradesTo: "overwatch_iii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'soldier', 'multishot'],
    characterExclusive: 'soldier',
    animation: {
    cast: 'muzzle_flash',
    hit: 'std_burst',
    evolution: 'volley_burst',
  },
    effect: { effects: [{ verb: 'modifyProjectile', extra: 2 }], damageMul: 1.0, params: { onSix: 1, lockRolls: 3 } },
  },
  {
    id: "overwatch_iii",
    name: "Full Overwatch",
    description: "Extends the locked-on window and carries over into pulses.",
    chainId: "overwatch",
    rank: 3,
    upgradesFrom: "overwatch_ii",
    kind: 'supplement',
    rarity: 'rare',
    tags: ['supplement', 'soldier', 'multishot'],
    characterExclusive: 'soldier',
    animation: {
    cast: 'muzzle_flash',
    hit: 'std_burst',
    evolution: 'volley_burst',
  },
    effect: { effects: [{ verb: 'modifyProjectile', extra: 4 }], damageMul: 1.0, params: { onSix: 1, lockRolls: 4 }, note: 'Full Overwatch' },
  }
];

export default upgrades;
