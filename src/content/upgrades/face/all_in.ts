import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "all_in",
    name: "All In",
    description: "Gambler only. Rolling 1 or 6 while at 5 Gambit stacks resolves the slot twice.",
    chainId: "all_in",
    rank: 1,
    upgradesTo: "all_in_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'gambler', 'combo'],
    characterExclusive: 'gambler',
    animation: {
    cast: 'fortune_swirl',
    hit: 'jackpot_crack',
    evolution: 'jackpot_crack',
  },
    effect: { effects: [{ verb: 'modifyProjectile', damageMul: 1.0 }], damageMul: 1.0, params: { requireGambit: 5, onExtreme: 1, reResolve: 1 } },
  },
  {
    id: "all_in_ii",
    name: "Double Down",
    description: "Gambler only. Rolling 1 or 6 while at 5 Gambit stacks resolves the slot twice. Refined into Double Down.",
    chainId: "all_in",
    rank: 2,
    upgradesFrom: "all_in",
    upgradesTo: "all_in_iii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'gambler', 'combo'],
    characterExclusive: 'gambler',
    animation: {
    cast: 'fortune_swirl',
    hit: 'jackpot_crack',
    evolution: 'jackpot_crack',
  },
    effect: { effects: [{ verb: 'modifyProjectile', damageMul: 1.1 }], damageMul: 1.0, params: { requireGambit: 4, onExtreme: 1, reResolve: 1 } },
  },
  {
    id: "all_in_iii",
    name: "Jackpot",
    description: "Triples out on double sixes.",
    chainId: "all_in",
    rank: 3,
    upgradesFrom: "all_in_ii",
    kind: 'supplement',
    rarity: 'epic',
    tags: ['supplement', 'gambler', 'combo'],
    characterExclusive: 'gambler',
    animation: {
    cast: 'fortune_swirl',
    hit: 'jackpot_crack',
    evolution: 'jackpot_crack',
  },
    effect: { effects: [{ verb: 'modifyProjectile', damageMul: 1.25 }], damageMul: 1.0, params: { requireGambit: 3, onExtreme: 1, reResolve: 2 }, note: 'Jackpot' },
  }
];

export default upgrades;
