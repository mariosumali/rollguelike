import type { FaceUpgrade } from '../types';

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
    effect: { effects: [{ verb: 'summonMinion', kind: 'bone', count: 2, hp: 6, duration: 4, damagePerHit: 3 }], damageMul: 1.0 },
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
    effect: { effects: [{ verb: 'summonMinion', kind: 'bone', count: 3, hp: 10, duration: 5, damagePerHit: 5 }], damageMul: 1.05 },
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
    effect: { effects: [{ verb: 'summonMinion', kind: 'bone', count: 4, hp: 14, duration: 6, damagePerHit: 7 }, { verb: 'applyStatus', status: 'stun', power: 1, duration: 0.4 }], damageMul: 1.15, note: "Lich's March" },
  }
];

export default upgrades;
