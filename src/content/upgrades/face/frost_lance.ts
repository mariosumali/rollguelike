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
    effect: { effects: [{ verb: 'fireProjectile', count: 1, speed: 1.25, element: 'ice', pierce: 1 }, { verb: 'applyStatus', status: 'slow', power: 0.35, duration: 1.4 }], damageMul: 0.95, timing: tempo.deliberate },
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
    effect: { effects: [{ verb: 'fireProjectile', count: 2, speed: 1.25, element: 'ice', pierce: 1, spread: Math.PI / 16 }, { verb: 'applyStatus', status: 'slow', power: 0.5, duration: 2.4 }, { verb: 'frostBurst', radius: 36, damageMul: 0.38, freezeDur: 0.55, slow: 0.55 }], damageMul: 1.0, timing: tempo.heavy },
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
    effect: { effects: [{ verb: 'fireProjectile', count: 2, speed: 1.35, element: 'ice', pierce: 2, spread: Math.PI / 12 }, { verb: 'frostBurst', radius: 58, damageMul: 0.6, freezeDur: 1.1, slow: 0.7 }, { verb: 'frostBurst', radius: 66, damageMul: 0.65, freezeDur: 1.25, slow: 0.65 }], damageMul: 1.08, timing: tempo.artillery, note: 'Absolute Zero' },
    basePrice,
  }
];

export default upgrades;
