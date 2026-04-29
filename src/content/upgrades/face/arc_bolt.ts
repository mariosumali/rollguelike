import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { rare: prices.standardRare };

const upgrades: FaceUpgrade[] = [
  {
    id: "arc_bolt",
    name: "Arc Bolt",
    description: "Lightning visibly jumps between foes.",
    chainId: "arc_bolt",
    rank: 1,
    upgradesTo: "arc_bolt_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'lightning', 'elemental'],
    animation: {
    cast: 'spark_cast',
    projectile: 'arc_proj',
    hit: 'arc_chain',
    evolution: 'storm_chain',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, speed: 1.25, element: 'lightning' }, { verb: 'chain', maxChains: 2, decay: 0.5 }], damageMul: 0.95, timing: tempo.standard },
    basePrice,
  },
  {
    id: "arc_bolt_ii",
    name: "Forked Bolt",
    description: "Lightning visibly jumps between foes. Refined into Forked Bolt.",
    chainId: "arc_bolt",
    rank: 2,
    upgradesFrom: "arc_bolt",
    upgradesTo: "arc_bolt_iii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'lightning', 'elemental'],
    animation: {
    cast: 'spark_cast',
    projectile: 'arc_proj',
    hit: 'arc_chain',
    evolution: 'storm_chain',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, speed: 1.3, element: 'lightning' }, { verb: 'chainLightning', jumps: 3, damageMul: 0.5, radius: 95, stunDur: 0.18 }], damageMul: 1.0, timing: tempo.deliberate },
    basePrice,
  },
  {
    id: "arc_bolt_iii",
    name: "Storm Call",
    description: "The die itself lashes out with a storm web.",
    chainId: "arc_bolt",
    rank: 3,
    upgradesFrom: "arc_bolt_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'lightning', 'elemental'],
    animation: {
    cast: 'spark_cast',
    projectile: 'arc_proj',
    hit: 'arc_chain',
    evolution: 'storm_chain',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, speed: 1.3, element: 'lightning', spread: Math.PI / 14 }, { verb: 'chainLightning', jumps: 5, damageMul: 0.58, radius: 115, stunDur: 0.3, fromDie: true }], damageMul: 1.12, timing: tempo.heavy, note: 'Storm Call' },
    basePrice,
  }
];

export default upgrades;
