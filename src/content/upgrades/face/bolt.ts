import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { common: prices.premiumCommon };

const upgrades: FaceUpgrade[] = [
  {
    id: "bolt",
    name: "Bolt",
    description: "Piercing line. Fewer shots, deeper cuts.",
    chainId: "bolt",
    rank: 1,
    upgradesTo: "bolt_ii",
    kind: 'replacer',
    rarity: 'common',
    tags: ['projectile', 'pierce'],
    animation: {
    cast: 'muzzle_flash',
    projectile: 'bolt_proj',
    hit: 'pierce_spark',
    evolution: 'rail_streak',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, pierce: 1, speed: 1.35, size: 0.9 }], damageMul: 1.25, timing: tempo.deliberate },
    basePrice,
  },
  {
    id: "bolt_ii",
    name: "Piercing Bolt",
    description: "Piercing line. Fewer shots, deeper cuts. Refined into Piercing Bolt.",
    chainId: "bolt",
    rank: 2,
    upgradesFrom: "bolt",
    upgradesTo: "bolt_iii",
    kind: 'replacer',
    rarity: 'common',
    tags: ['projectile', 'pierce'],
    animation: {
    cast: 'muzzle_flash',
    projectile: 'bolt_proj',
    hit: 'pierce_spark',
    evolution: 'rail_streak',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, pierce: 3, speed: 1.45, size: 0.95 }], damageMul: 1.75, timing: tempo.deliberate },
    basePrice,
  },
  {
    id: "bolt_iii",
    name: "Rail",
    description: "Through everything.",
    chainId: "bolt",
    rank: 3,
    upgradesFrom: "bolt_ii",
    kind: 'replacer',
    rarity: 'common',
    tags: ['projectile', 'pierce'],
    animation: {
    cast: 'muzzle_flash',
    projectile: 'bolt_proj',
    hit: 'pierce_spark',
    evolution: 'rail_streak',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, pierce: 99, speed: 1.6, size: 1.05, damageMul: 1.25 }, { verb: 'modifyProjectile', pierce: 99 }], damageMul: 1.9, timing: tempo.heavy, note: 'Rail' },
    basePrice,
  }
];

export default upgrades;
