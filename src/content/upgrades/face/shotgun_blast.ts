import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { common: prices.cheapCommon };

const upgrades: FaceUpgrade[] = [
  {
    id: "shotgun_blast",
    name: "Shotgun Blast",
    description: "Tight cone of short-lived pellets. Devastating up close.",
    chainId: "shotgun_blast",
    rank: 1,
    upgradesTo: "shotgun_blast_ii",
    kind: 'replacer',
    rarity: 'common',
    tags: ['projectile', 'cone', 'shortRange'],
    animation: {
    cast: 'muzzle_flash',
    projectile: 'buck_proj',
    hit: 'buck_spread',
    evolution: 'slug_punch',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 5, speed: 0.95, lifeMul: 0.58, spread: Math.PI / 4.6, damageMul: 0.78 }], damageMul: 1.0, timing: tempo.quick },
    basePrice,
  },
  {
    id: "shotgun_blast_ii",
    name: "Slug Scatter",
    description: "Tight cone of short-lived pellets. Devastating up close. Refined into Slug Scatter.",
    chainId: "shotgun_blast",
    rank: 2,
    upgradesFrom: "shotgun_blast",
    upgradesTo: "shotgun_blast_iii",
    kind: 'replacer',
    rarity: 'common',
    tags: ['projectile', 'cone', 'shortRange'],
    animation: {
    cast: 'muzzle_flash',
    projectile: 'buck_proj',
    hit: 'buck_spread',
    evolution: 'slug_punch',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 7, speed: 1.0, lifeMul: 0.66, spread: Math.PI / 3.8, damageMul: 0.7 }], damageMul: 1.05, timing: tempo.standard },
    basePrice,
  },
  {
    id: "shotgun_blast_iii",
    name: "Slug",
    description: "Pellets merge into one armor-piercing slug.",
    chainId: "shotgun_blast",
    rank: 3,
    upgradesFrom: "shotgun_blast_ii",
    kind: 'replacer',
    rarity: 'common',
    tags: ['projectile', 'cone', 'shortRange'],
    animation: {
    cast: 'muzzle_flash',
    projectile: 'buck_proj',
    hit: 'buck_spread',
    evolution: 'slug_punch',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 9, speed: 1.05, lifeMul: 0.74, spread: Math.PI / 3, damageMul: 0.6 }, { verb: 'fireProjectile', count: 1, pierce: 4, speed: 1.45, size: 1.7, damageMul: 1.9 }], damageMul: 1.12, timing: tempo.deliberate, note: 'Slug' },
    basePrice,
  }
];

export default upgrades;
