import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { epic: prices.premiumEpic };

const upgrades: FaceUpgrade[] = [
  {
    id: "homing_missile",
    name: "Homing Missile",
    description: "Tracks nearest foe, explodes on impact.",
    chainId: "homing_missile",
    rank: 1,
    upgradesTo: "homing_missile_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['projectile', 'homing', 'aoe'],
    animation: {
    cast: 'launch_cast',
    projectile: 'missile_trail',
    hit: 'explosion_small',
    evolution: 'cruise_mark',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, speed: 0.7, lifeMul: 1.35, homing: true, damageMul: 1.35 }], damageMul: 1.0, timing: tempo.heavy },
    basePrice,
  },
  {
    id: "homing_missile_ii",
    name: "Seeker Missile",
    description: "Tracks nearest foe, explodes on impact. Refined into Seeker Missile.",
    chainId: "homing_missile",
    rank: 2,
    upgradesFrom: "homing_missile",
    upgradesTo: "homing_missile_iii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['projectile', 'homing', 'aoe'],
    animation: {
    cast: 'launch_cast',
    projectile: 'missile_trail',
    hit: 'explosion_small',
    evolution: 'cruise_mark',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, speed: 0.75, lifeMul: 1.35, homing: true, damageMul: 1.05 }, { verb: 'modifyProjectile', aoeOnHit: 24 }], damageMul: 1.12, timing: tempo.artillery },
    basePrice,
  },
  {
    id: "homing_missile_iii",
    name: "Cruise Missile",
    description: "Marks foes for +50% damage.",
    chainId: "homing_missile",
    rank: 3,
    upgradesFrom: "homing_missile_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['projectile', 'homing', 'aoe'],
    animation: {
    cast: 'launch_cast',
    projectile: 'missile_trail',
    hit: 'explosion_small',
    evolution: 'cruise_mark',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 3, speed: 0.8, lifeMul: 1.45, homing: true, damageMul: 0.95 }, { verb: 'modifyProjectile', aoeOnHit: 38 }, { verb: 'applyStatus', status: 'mark', power: 1.5, duration: 3 }], damageMul: 1.25, timing: tempo.legendary, note: 'Cruise' },
    basePrice,
  }
];

export default upgrades;
