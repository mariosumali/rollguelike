import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'bone_legion',
  name: 'Bone Legion',
  kind: 'replacer',
  rarity: 'legendary',
  description: 'Summons a short-lived squad of bone minions that chase enemies.',
  tags: ['summon', 'minion', 'arcane'],
  animation: {
    cast: 'necro_rise',
    projectile: 'bone_path',
    hit: 'bone_crack',
    evolution: 'lich_march',
  },
  evolution: {
    name: "Lich's March",
    flavor: 'Minions live longer and stagger their victims.',
    extraEffects: [{ verb: 'applyStatus', status: 'stun', power: 1, duration: 0.4 }],
  },
  tiers: [
    { effects: [{ verb: 'summonMinion', kind: 'bone', count: 2, hp: 6, duration: 5, damagePerHit: 4 }], damageMul: 1.0 },
    { effects: [{ verb: 'summonMinion', kind: 'bone', count: 2, hp: 8, duration: 5.5, damagePerHit: 5 }], damageMul: 1.05 },
    { effects: [{ verb: 'summonMinion', kind: 'bone', count: 3, hp: 10, duration: 6, damagePerHit: 6 }], damageMul: 1.1 },
    { effects: [{ verb: 'summonMinion', kind: 'bone', count: 3, hp: 12, duration: 6.5, damagePerHit: 7 }], damageMul: 1.15 },
    { effects: [{ verb: 'summonMinion', kind: 'bone', count: 4, hp: 14, duration: 7, damagePerHit: 9 }], damageMul: 1.25, note: "Lich's March" },
  ],
};

export default upgrade;
