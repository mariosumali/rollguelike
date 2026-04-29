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
    effect: { effects: [{ verb: 'fireProjectile', count: 4, speed: 0.9, lifeMul: 0.45, spread: Math.PI / 5, damageMul: 0.68 }], damageMul: 0.95, timing: tempo.quick },
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
    effect: { effects: [{ verb: 'fireProjectile', count: 6, speed: 0.95, lifeMul: 0.5, spread: Math.PI / 4, damageMul: 0.62 }], damageMul: 1.0, timing: tempo.standard },
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
    effect: { effects: [{ verb: 'fireProjectile', count: 8, speed: 1.0, lifeMul: 0.55, spread: Math.PI / 3, damageMul: 0.52 }, { verb: 'fireProjectile', count: 1, pierce: 3, speed: 1.35, size: 1.5, damageMul: 1.45 }], damageMul: 1.05, timing: tempo.deliberate, note: 'Slug' },
    basePrice,
  }
];

export default upgrades;
