import type { FaceUpgrade } from '../types';

const upgrade: FaceUpgrade = {
  id: 'reaction_mastery',
  name: 'Reaction Mastery',
  kind: 'supplement',
  rarity: 'legendary',
  description: "Alchemist only. Elemental reactions erupt 50% wider and briefly stun.",
  tags: ['supplement', 'alchemist', 'reaction', 'aoe'],
  characterExclusive: 'alchemist',
  animation: {
    cast: 'transmute_glow',
    hit: 'nova_bloom',
    evolution: 'nova_bloom',
  },
  evolution: {
    name: 'Quintessence',
    flavor: 'Reactions chain: a second reaction fires from the first target.',
    extraEffects: [{ verb: 'pulse', radius: 32, damageMul: 0.6 }],
  },
  tiers: [
    { effects: [{ verb: 'applyStatus', status: 'stun', power: 1, duration: 0.3 }], damageMul: 1.0, params: { reactionRadiusMul: 1.25 } },
    { effects: [{ verb: 'applyStatus', status: 'stun', power: 1, duration: 0.35 }], damageMul: 1.0, params: { reactionRadiusMul: 1.35 } },
    { effects: [{ verb: 'applyStatus', status: 'stun', power: 1, duration: 0.4 }], damageMul: 1.0, params: { reactionRadiusMul: 1.4 } },
    { effects: [{ verb: 'applyStatus', status: 'stun', power: 2, duration: 0.45 }], damageMul: 1.0, params: { reactionRadiusMul: 1.5 } },
    { effects: [{ verb: 'applyStatus', status: 'stun', power: 2, duration: 0.5 }, { verb: 'pulse', radius: 28, damageMul: 0.5 }], damageMul: 1.0, params: { reactionRadiusMul: 1.5 }, note: 'Quintessence' },
  ],
};

export default upgrade;
