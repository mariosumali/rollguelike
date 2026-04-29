import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { rare: prices.standardRare };

const upgrades: FaceUpgrade[] = [
  {
    id: "boomerang",
    name: "Boomerang",
    description: "Projectile that arcs out and returns, hitting on both legs.",
    chainId: "boomerang",
    rank: 1,
    upgradesTo: "boomerang_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'return', 'multihit'],
    animation: {
    cast: 'whirl_cast',
    projectile: 'boomer_proj',
    hit: 'whirl_hit',
    evolution: 'phantom_loop',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, speed: 0.75, lifeMul: 1.4, bounce: 1, pierce: 2 }], damageMul: 1.05, timing: tempo.deliberate },
    basePrice,
  },
  {
    id: "boomerang_ii",
    name: "Returning Blade",
    description: "Projectile that arcs out and returns, hitting on both legs. Refined into Returning Blade.",
    chainId: "boomerang",
    rank: 2,
    upgradesFrom: "boomerang",
    upgradesTo: "boomerang_iii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'return', 'multihit'],
    animation: {
    cast: 'whirl_cast',
    projectile: 'boomer_proj',
    hit: 'whirl_hit',
    evolution: 'phantom_loop',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, speed: 0.78, lifeMul: 1.45, bounce: 1, pierce: 3, spread: Math.PI / 8 }], damageMul: 1.08, timing: tempo.heavy },
    basePrice,
  },
  {
    id: "boomerang_iii",
    name: "Phantom Loop",
    description: "Returns twice, leaving an echo loop.",
    chainId: "boomerang",
    rank: 3,
    upgradesFrom: "boomerang_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'return', 'multihit'],
    animation: {
    cast: 'whirl_cast',
    projectile: 'boomer_proj',
    hit: 'whirl_hit',
    evolution: 'phantom_loop',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 3, speed: 0.82, lifeMul: 1.55, bounce: 2, pierce: 4, spread: Math.PI / 6 }, { verb: 'fireProjectile', count: 1, speed: 0.78, lifeMul: 1.6, bounce: 3, pierce: 2 }], damageMul: 1.14, timing: tempo.artillery, note: 'Phantom Loop' },
    basePrice,
  }
];

export default upgrades;
