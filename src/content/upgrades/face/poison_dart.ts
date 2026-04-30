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
    effect: { effects: [{ verb: 'fireProjectile', count: 1, speed: 1.25, element: 'poison' }, { verb: 'applyStatus', status: 'poison', power: 4.5, duration: 3.5 }, { verb: 'groundZone', radius: 22, dps: 3.5, duration: 0.9, element: 'poison', slow: 0.1 }], damageMul: 1.0, timing: tempo.quick },
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
    effect: { effects: [{ verb: 'fireProjectile', count: 2, speed: 1.25, element: 'poison', spread: Math.PI / 12 }, { verb: 'applyStatus', status: 'poison', power: 7.5, duration: 4.5 }, { verb: 'groundZone', radius: 34, dps: 6.5, duration: 1.5, element: 'poison', slow: 0.18 }], damageMul: 1.04, timing: tempo.standard },
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
    effect: { effects: [{ verb: 'fireProjectile', count: 3, speed: 1.2, element: 'poison', spread: Math.PI / 8 }, { verb: 'applyStatus', status: 'poison', power: 12, duration: 5.5 }, { verb: 'groundZone', radius: 54, dps: 10.5, duration: 2.2, element: 'poison', slow: 0.28 }], damageMul: 1.12, timing: tempo.deliberate, note: 'Plague Carrier' },
    basePrice,
  }
];

export default upgrades;
