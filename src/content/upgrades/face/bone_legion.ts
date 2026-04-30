import type { FaceUpgrade } from '../types';
import { BALANCE } from '../../../config/balance';

const { weaponTempo: tempo, weaponPrices: prices } = BALANCE.faceUpgrade;
const basePrice = { legendary: prices.standardLegendary };

const upgrades: FaceUpgrade[] = [
  {
    id: "bone_legion",
    name: "Bone Legion",
    description: "Summons a short-lived squad of bone minions that chase enemies.",
    chainId: "bone_legion",
    rank: 1,
    upgradesTo: "bone_legion_ii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['summon', 'minion', 'arcane'],
    animation: {
    cast: 'necro_rise',
    projectile: 'bone_path',
    hit: 'bone_crack',
    evolution: 'lich_march',
  },
    effect: { effects: [{ verb: 'summonMinion', kind: 'bone', count: 3, hp: 8, duration: 4.4, damagePerHit: 6 }], damageMul: 1.0, timing: tempo.deliberate },
    basePrice,
  },
  {
    id: "bone_legion_ii",
    name: "Bone Phalanx",
    description: "Summons a short-lived squad of bone minions that chase enemies. Refined into Bone Phalanx.",
    chainId: "bone_legion",
    rank: 2,
    upgradesFrom: "bone_legion",
    upgradesTo: "bone_legion_iii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['summon', 'minion', 'arcane'],
    animation: {
    cast: 'necro_rise',
    projectile: 'bone_path',
    hit: 'bone_crack',
    evolution: 'lich_march',
  },
    effect: { effects: [{ verb: 'summonMinion', kind: 'bone', count: 4, hp: 12, duration: 5.4, damagePerHit: 9 }], damageMul: 1.06, timing: tempo.heavy },
    basePrice,
  },
  {
    id: "bone_legion_iii",
    name: "Lich's March",
    description: "Minions live longer and stagger their victims.",
    chainId: "bone_legion",
    rank: 3,
    upgradesFrom: "bone_legion_ii",
    kind: 'replacer',
    rarity: 'legendary',
    tags: ['summon', 'minion', 'arcane'],
    animation: {
    cast: 'necro_rise',
    projectile: 'bone_path',
    hit: 'bone_crack',
    evolution: 'lich_march',
  },
    effect: { effects: [{ verb: 'summonMinion', kind: 'bone', count: 6, hp: 16, duration: 6.8, damagePerHit: 13 }, { verb: 'applyStatus', status: 'stun', power: 1, duration: 0.5 }], damageMul: 1.15, timing: tempo.artillery, note: "Lich's March" },
    basePrice,
  }
];

export default upgrades;
