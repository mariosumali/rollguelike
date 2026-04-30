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
    effect: { effects: [{ verb: 'modifyProjectile', aoeOnHit: 36 }, { verb: 'fireProjectile', count: 1, speed: 0.68, lifeMul: 1.45, homing: true, size: 1.18, damageMul: 2.25 }], damageMul: 1.1, timing: tempo.heavy },
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
    effect: { effects: [{ verb: 'modifyProjectile', aoeOnHit: 54 }, { verb: 'fireProjectile', count: 2, speed: 0.72, lifeMul: 1.5, homing: true, size: 1.3, damageMul: 1.8 }], damageMul: 1.22, timing: tempo.artillery },
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
    effect: { effects: [{ verb: 'modifyProjectile', aoeOnHit: 76 }, { verb: 'fireProjectile', count: 3, speed: 0.78, lifeMul: 1.65, homing: true, size: 1.45, damageMul: 1.55 }, { verb: 'applyStatus', status: 'mark', power: 1.8, duration: 3.5 }], damageMul: 1.42, timing: tempo.legendary, note: 'Cruise' },
    basePrice,
  }
];

export default upgrades;
