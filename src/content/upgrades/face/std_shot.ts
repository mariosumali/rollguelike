import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { common: prices.standardCommon };

const upgrades: FaceUpgrade[] = [
  {
    id: "std_shot",
    name: "Standard Shot",
    description: "Reliable projectile volley. Counts scale with tier.",
    chainId: "std_shot",
    rank: 1,
    upgradesTo: "std_shot_ii",
    kind: 'replacer',
    rarity: 'common',
    tags: ['projectile'],
    animation: {
    cast: 'muzzle_flash',
    projectile: 'std_proj',
    hit: 'std_burst',
    evolution: 'volley_burst',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, speed: 1.05 }], damageMul: 0.95, timing: tempo.quick },
    basePrice,
  },
  {
    id: "std_shot_ii",
    name: "Twin Shot",
    description: "Reliable projectile volley. Counts scale with tier. Refined into Scatter Shot.",
    chainId: "std_shot",
    rank: 2,
    upgradesFrom: "std_shot",
    upgradesTo: "std_shot_iii",
    kind: 'replacer',
    rarity: 'common',
    tags: ['projectile'],
    animation: {
    cast: 'muzzle_flash',
    projectile: 'std_proj',
    hit: 'std_burst',
    evolution: 'volley_burst',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 4, speed: 1.05, spread: Math.PI / 12 }], damageMul: 1.0, timing: tempo.quick },
    basePrice,
  },
  {
    id: "std_shot_iii",
    name: "Volley",
    description: "Fan of six.",
    chainId: "std_shot",
    rank: 3,
    upgradesFrom: "std_shot_ii",
    kind: 'replacer',
    rarity: 'common',
    tags: ['projectile'],
    animation: {
    cast: 'muzzle_flash',
    projectile: 'std_proj',
    hit: 'std_burst',
    evolution: 'volley_burst',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 6, speed: 1.05, spread: Math.PI / 2 }], damageMul: 1.08, timing: tempo.standard, note: 'Volley' },
    basePrice,
  }
];

export default upgrades;
