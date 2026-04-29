import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { rare: prices.standardRare };

const upgrades: FaceUpgrade[] = [
  {
    id: "aqua_bolt",
    name: "Aqua Bolt",
    description: "Bounces between enemies, heals on hit.",
    chainId: "aqua_bolt",
    rank: 1,
    upgradesTo: "aqua_bolt_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'water', 'elemental'],
    animation: {
    cast: 'aqua_cast',
    projectile: 'aqua_proj',
    hit: 'splash_ring',
    evolution: 'tide_pool',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, speed: 0.95, bounce: 1 }], damageMul: 0.95, timing: tempo.standard },
    basePrice,
  },
  {
    id: "aqua_bolt_ii",
    name: "Tidal Bolt",
    description: "Bounces between enemies, heals on hit. Refined into Tidal Bolt.",
    chainId: "aqua_bolt",
    rank: 2,
    upgradesFrom: "aqua_bolt",
    upgradesTo: "aqua_bolt_iii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'water', 'elemental'],
    animation: {
    cast: 'aqua_cast',
    projectile: 'aqua_proj',
    hit: 'splash_ring',
    evolution: 'tide_pool',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, speed: 0.95, bounce: 2, spread: Math.PI / 14 }, { verb: 'modifyProjectile', lifesteal: 0.05 }], damageMul: 1.0, timing: tempo.deliberate },
    basePrice,
  },
  {
    id: "aqua_bolt_iii",
    name: "Tide Caller",
    description: "Each bounce leaves a heal pickup.",
    chainId: "aqua_bolt",
    rank: 3,
    upgradesFrom: "aqua_bolt_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'water', 'elemental'],
    animation: {
    cast: 'aqua_cast',
    projectile: 'aqua_proj',
    hit: 'splash_ring',
    evolution: 'tide_pool',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, speed: 1.0, bounce: 4, spread: Math.PI / 12 }, { verb: 'modifyProjectile', lifesteal: 0.12 }, { verb: 'spawnPickup', kind: 'heal', amount: 1, chance: 0.5 }, { verb: 'spawnPickup', kind: 'heal', amount: 1, chance: 1 }], damageMul: 1.12, timing: tempo.heavy, note: 'Tide Caller' },
    basePrice,
  }
];

export default upgrades;
