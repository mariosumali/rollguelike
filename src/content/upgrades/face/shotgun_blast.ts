import type { FaceUpgrade } from '../types';

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
    effect: { effects: [{ verb: 'fireProjectile', count: 3, spread: Math.PI / 6, damageMul: 0.9 }], damageMul: 1.0 },
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
    effect: { effects: [{ verb: 'fireProjectile', count: 5, spread: Math.PI / 5, damageMul: 0.85 }], damageMul: 1.05 },
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
    effect: { effects: [{ verb: 'fireProjectile', count: 8, spread: Math.PI / 4, damageMul: 0.8 }, { verb: 'fireProjectile', count: 1, pierce: 3, size: 1.6, damageMul: 1.6 }], damageMul: 1.15, note: 'Slug' },
  }
];

export default upgrades;
