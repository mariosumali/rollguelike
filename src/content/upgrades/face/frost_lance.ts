import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { rare: prices.premiumRare };

const upgrades: FaceUpgrade[] = [
  {
    id: "frost_lance",
    name: "Frost Lance",
    description: "Frost shots visibly slow, shell, and eventually lock clusters.",
    chainId: "frost_lance",
    rank: 1,
    upgradesTo: "frost_lance_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'ice', 'elemental'],
    animation: {
    cast: 'frost_cast',
    projectile: 'frost_proj',
    hit: 'frost_shatter',
    evolution: 'zero_freeze',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, speed: 1.3, element: 'ice', pierce: 2 }, { verb: 'applyStatus', status: 'slow', power: 0.45, duration: 1.8 }, { verb: 'frostBurst', radius: 28, damageMul: 0.28, freezeDur: 0.35, slow: 0.45 }], damageMul: 1.05, timing: tempo.deliberate },
    basePrice,
  },
  {
    id: "frost_lance_ii",
    name: "Ice Spear",
    description: "Frost shots visibly slow, shell, and eventually lock clusters. Refined into Ice Spear.",
    chainId: "frost_lance",
    rank: 2,
    upgradesFrom: "frost_lance",
    upgradesTo: "frost_lance_iii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'ice', 'elemental'],
    animation: {
    cast: 'frost_cast',
    projectile: 'frost_proj',
    hit: 'frost_shatter',
    evolution: 'zero_freeze',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, speed: 1.3, element: 'ice', pierce: 2, spread: Math.PI / 16 }, { verb: 'applyStatus', status: 'slow', power: 0.58, duration: 2.8 }, { verb: 'frostBurst', radius: 44, damageMul: 0.5, freezeDur: 0.7, slow: 0.62 }], damageMul: 1.08, timing: tempo.heavy },
    basePrice,
  },
  {
    id: "frost_lance_iii",
    name: "Absolute Zero",
    description: "A glacier burst shells the front line in ice.",
    chainId: "frost_lance",
    rank: 3,
    upgradesFrom: "frost_lance_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'ice', 'elemental'],
    animation: {
    cast: 'frost_cast',
    projectile: 'frost_proj',
    hit: 'frost_shatter',
    evolution: 'zero_freeze',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 3, speed: 1.4, element: 'ice', pierce: 3, spread: Math.PI / 10 }, { verb: 'frostBurst', radius: 68, damageMul: 0.78, freezeDur: 1.25, slow: 0.72 }, { verb: 'frostBurst', radius: 76, damageMul: 0.82, freezeDur: 1.35, slow: 0.68 }], damageMul: 1.18, timing: tempo.artillery, note: 'Absolute Zero' },
    basePrice,
  }
];

export default upgrades;
