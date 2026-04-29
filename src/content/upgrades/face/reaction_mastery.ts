import type { FaceUpgrade } from '../types';

const upgrades: FaceUpgrade[] = [
  {
    id: "reaction_mastery",
    name: "Reaction Mastery",
    description: "Alchemist only. Elemental reactions erupt 50% wider and briefly stun.",
    chainId: "reaction_mastery",
    rank: 1,
    upgradesTo: "reaction_mastery_ii",
    kind: 'supplement',
    rarity: 'legendary',
    tags: ['supplement', 'alchemist', 'reaction', 'aoe'],
    characterExclusive: 'alchemist',
    animation: {
    cast: 'transmute_glow',
    hit: 'nova_bloom',
    evolution: 'nova_bloom',
  },
    effect: { effects: [{ verb: 'applyStatus', status: 'stun', power: 1, duration: 0.3 }], damageMul: 1.0, params: { reactionRadiusMul: 1.25 } },
  },
  {
    id: "reaction_mastery_ii",
    name: "Catalyst Mastery",
    description: "Alchemist only. Elemental reactions erupt 50% wider and briefly stun. Refined into Catalyst Mastery.",
    chainId: "reaction_mastery",
    rank: 2,
    upgradesFrom: "reaction_mastery",
    upgradesTo: "reaction_mastery_iii",
    kind: 'supplement',
    rarity: 'legendary',
    tags: ['supplement', 'alchemist', 'reaction', 'aoe'],
    characterExclusive: 'alchemist',
    animation: {
    cast: 'transmute_glow',
    hit: 'nova_bloom',
    evolution: 'nova_bloom',
  },
    effect: { effects: [{ verb: 'applyStatus', status: 'stun', power: 1, duration: 0.4 }], damageMul: 1.0, params: { reactionRadiusMul: 1.4 } },
  },
  {
    id: "reaction_mastery_iii",
    name: "Quintessence",
    description: "Reactions chain: a second reaction fires from the first target.",
    chainId: "reaction_mastery",
    rank: 3,
    upgradesFrom: "reaction_mastery_ii",
    kind: 'supplement',
    rarity: 'legendary',
    tags: ['supplement', 'alchemist', 'reaction', 'aoe'],
    characterExclusive: 'alchemist',
    animation: {
    cast: 'transmute_glow',
    hit: 'nova_bloom',
    evolution: 'nova_bloom',
  },
    effect: { effects: [{ verb: 'applyStatus', status: 'stun', power: 2, duration: 0.5 }, { verb: 'pulse', radius: 28, damageMul: 0.5 }, { verb: 'pulse', radius: 32, damageMul: 0.6 }], damageMul: 1.0, params: { reactionRadiusMul: 1.5 }, note: 'Quintessence' },
  }
];

export default upgrades;
