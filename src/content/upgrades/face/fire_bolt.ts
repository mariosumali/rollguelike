import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { rare: prices.standardRare };

const upgrades: FaceUpgrade[] = [
  {
    id: "fire_bolt",
    name: "Fire Bolt",
    description: "Flaming shots erupt into visible pillars at higher tiers.",
    chainId: "fire_bolt",
    rank: 1,
    upgradesTo: "fire_bolt_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'fire', 'elemental'],
    animation: {
    cast: 'fire_cast',
    projectile: 'fire_proj',
    hit: 'fire_burst',
    evolution: 'phoenix_split',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, speed: 1.15, element: 'fire' }, { verb: 'modifyProjectile', burnDps: 4, burnDur: 2.5 }, { verb: 'flamePillar', count: 1, radius: 14, damageMul: 0.35, duration: 0.55, burnDps: 3, burnDur: 2 }], damageMul: 1.05, timing: tempo.standard },
    basePrice,
  },
  {
    id: "fire_bolt_ii",
    name: "Flare Bolt",
    description: "Flaming shots erupt into visible pillars at higher tiers. Refined into Flare Bolt.",
    chainId: "fire_bolt",
    rank: 2,
    upgradesFrom: "fire_bolt",
    upgradesTo: "fire_bolt_iii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'fire', 'elemental'],
    animation: {
    cast: 'fire_cast',
    projectile: 'fire_proj',
    hit: 'fire_burst',
    evolution: 'phoenix_split',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, speed: 1.15, element: 'fire', spread: Math.PI / 10 }, { verb: 'flamePillar', count: 2, radius: 20, damageMul: 0.65, duration: 0.9, delay: 0.14, burnDps: 5, burnDur: 3 }], damageMul: 1.12, timing: tempo.deliberate },
    basePrice,
  },
  {
    id: "fire_bolt_iii",
    name: "Phoenix Bolt",
    description: "Calls a row of flame pillars and fans phoenix sparks.",
    chainId: "fire_bolt",
    rank: 3,
    upgradesFrom: "fire_bolt_ii",
    kind: 'replacer',
    rarity: 'rare',
    tags: ['projectile', 'fire', 'elemental'],
    animation: {
    cast: 'fire_cast',
    projectile: 'fire_proj',
    hit: 'fire_burst',
    evolution: 'phoenix_split',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, speed: 1.2, element: 'fire', spread: Math.PI / 8 }, { verb: 'flamePillar', count: 4, radius: 24, damageMul: 0.8, duration: 1.2, delay: 0.14, burnDps: 7, burnDur: 4 }, { verb: 'fireProjectile', count: 3, speed: 1.1, element: 'fire', spread: Math.PI / 4, damageMul: 0.65 }], damageMul: 1.2, timing: tempo.heavy, note: 'Phoenix' },
    basePrice,
  }
];

export default upgrades;
