import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'all_in',
  name: 'All In',
  kind: 'supplement',
  rarity: 'epic',
  description: "Gambler only. Rolling 1 or 6 while at 5 Gambit stacks resolves the slot twice.",
  tags: ['supplement', 'gambler', 'combo'],
  characterExclusive: 'gambler',
  animation: {
    cast: 'fortune_swirl',
    hit: 'jackpot_crack',
    evolution: 'jackpot_crack',
  },
  evolution: {
    name: 'Jackpot',
    flavor: 'Triples out on double sixes.',
  },
  tiers: [
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.0 }], damageMul: 1.0, params: { requireGambit: 5, onExtreme: 1, reResolve: 1 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.1 }], damageMul: 1.0, params: { requireGambit: 4, onExtreme: 1, reResolve: 1 } },
    { effects: [{ verb: 'modifyProjectile', damageMul: 1.25 }], damageMul: 1.0, params: { requireGambit: 3, onExtreme: 1, reResolve: 2 }, note: 'Jackpot' },
  ],
};

export default upgrade;
