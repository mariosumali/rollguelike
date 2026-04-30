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
    effect: { effects: [{ verb: 'orbit', count: 3, radius: 34, rpm: 135, damageMul: 0.82, duration: 3.6, pierce: 1 }, { verb: 'pulse', radius: 26, damageMul: 0.28, knockback: 12 }], damageMul: 1.0, timing: tempo.deliberate },
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
    effect: { effects: [{ verb: 'orbit', count: 5, radius: 40, rpm: 165, damageMul: 0.98, duration: 4.8, pierce: 2 }, { verb: 'pulse', radius: 38, damageMul: 0.42, knockback: 20 }], damageMul: 1.08, timing: tempo.heavy },
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
    effect: { effects: [{ verb: 'orbit', count: 7, radius: 48, rpm: 195, damageMul: 1.16, duration: 7.2, pierce: 3 }, { verb: 'pulse', radius: 56, damageMul: 0.62, knockback: 30 }], damageMul: 1.18, timing: tempo.artillery, note: 'Eternal Circle' },
    basePrice,
  }
];

export default upgrades;
