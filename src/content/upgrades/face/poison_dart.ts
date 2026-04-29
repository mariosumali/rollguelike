import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { common: prices.standardCommon };

const upgrades: FaceUpgrade[] = [
  {
    id: "poison_dart",
    name: "Poison Dart",
    description: "Toxin darts leave visible poison clouds and plague zones.",
    chainId: "poison_dart",
    rank: 1,
    upgradesTo: "poison_dart_ii",
    kind: 'replacer',
    rarity: 'common',
    tags: ['projectile', 'poison', 'elemental', 'dot'],
    animation: {
    cast: 'toxin_cast',
    projectile: 'toxin_proj',
    hit: 'toxin_drip',
    evolution: 'plague_cloud',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 1, speed: 1.25, element: 'poison' }, { verb: 'applyStatus', status: 'poison', power: 2, duration: 3 }], damageMul: 0.9, timing: tempo.quick },
    basePrice,
  },
  {
    id: "poison_dart_ii",
    name: "Venom Dart",
    description: "Toxin darts leave visible poison clouds and plague zones. Refined into Venom Dart.",
    chainId: "poison_dart",
    rank: 2,
    upgradesFrom: "poison_dart",
    upgradesTo: "poison_dart_iii",
    kind: 'replacer',
    rarity: 'common',
    tags: ['projectile', 'poison', 'elemental', 'dot'],
    animation: {
    cast: 'toxin_cast',
    projectile: 'toxin_proj',
    hit: 'toxin_drip',
    evolution: 'plague_cloud',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 2, speed: 1.25, element: 'poison', spread: Math.PI / 12 }, { verb: 'applyStatus', status: 'poison', power: 4, duration: 4 }, { verb: 'groundZone', radius: 28, dps: 3, duration: 1.2, element: 'poison', slow: 0.15 }], damageMul: 0.98, timing: tempo.standard },
    basePrice,
  },
  {
    id: "poison_dart_iii",
    name: "Plague Carrier",
    description: "A venom cloud blooms under the enemy pack.",
    chainId: "poison_dart",
    rank: 3,
    upgradesFrom: "poison_dart_ii",
    kind: 'replacer',
    rarity: 'common',
    tags: ['projectile', 'poison', 'elemental', 'dot'],
    animation: {
    cast: 'toxin_cast',
    projectile: 'toxin_proj',
    hit: 'toxin_drip',
    evolution: 'plague_cloud',
  },
    effect: { effects: [{ verb: 'fireProjectile', count: 3, speed: 1.2, element: 'poison', spread: Math.PI / 8 }, { verb: 'applyStatus', status: 'poison', power: 7, duration: 5 }, { verb: 'groundZone', radius: 46, dps: 6, duration: 2.0, element: 'poison', slow: 0.25 }], damageMul: 1.06, timing: tempo.deliberate, note: 'Plague Carrier' },
    basePrice,
  }
];

export default upgrades;
