import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { epic: prices.premiumEpic };

const upgrades: FaceUpgrade[] = [
  {
    id: "ring_of_fangs",
    name: "Ring of Fangs",
    description: "Summons orbiting bone fangs that tear anything they touch.",
    chainId: "ring_of_fangs",
    rank: 1,
    upgradesTo: "ring_of_fangs_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['orbit', 'persistent', 'bone'],
    animation: {
    cast: 'orbit_cast',
    projectile: 'fang_orbit',
    hit: 'fang_bite',
    evolution: 'eternal_circle',
  },
    effect: { effects: [{ verb: 'orbit', count: 3, radius: 28, rpm: 115, damageMul: 0.65, duration: 3.2, pierce: 1 }], damageMul: 1.0, timing: tempo.deliberate },
    basePrice,
  },
  {
    id: "ring_of_fangs_ii",
    name: "Fang Spiral",
    description: "Summons orbiting bone fangs that tear anything they touch. Refined into Fang Circle.",
    chainId: "ring_of_fangs",
    rank: 2,
    upgradesFrom: "ring_of_fangs",
    upgradesTo: "ring_of_fangs_iii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['orbit', 'persistent', 'bone'],
    animation: {
    cast: 'orbit_cast',
    projectile: 'fang_orbit',
    hit: 'fang_bite',
    evolution: 'eternal_circle',
  },
    effect: { effects: [{ verb: 'orbit', count: 4, radius: 32, rpm: 145, damageMul: 0.8, duration: 4.2, pierce: 1 }], damageMul: 1.05, timing: tempo.heavy },
    basePrice,
  },
  {
    id: "ring_of_fangs_iii",
    name: "Eternal Circle",
    description: "The ring lingers noticeably longer before fading.",
    chainId: "ring_of_fangs",
    rank: 3,
    upgradesFrom: "ring_of_fangs_ii",
    kind: 'replacer',
    rarity: 'epic',
    tags: ['orbit', 'persistent', 'bone'],
    animation: {
    cast: 'orbit_cast',
    projectile: 'fang_orbit',
    hit: 'fang_bite',
    evolution: 'eternal_circle',
  },
    effect: { effects: [{ verb: 'orbit', count: 6, radius: 38, rpm: 170, damageMul: 0.95, duration: 6.5, pierce: 2 }], damageMul: 1.12, timing: tempo.artillery, note: 'Eternal Circle' },
    basePrice,
  }
];

export default upgrades;
